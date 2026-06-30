import { Category, Functor } from "../types";

export interface ParsedRule {
  sourceObj: string;
  sourceField: string;
  targetObj: string;
  targetField: string;
  raw: string;
}

export interface TypeFlow {
  chain: string; // e.g. "Oportunidad.monto (Decimal) -> Factura.monto_base (Decimal) -> MetricaVenta.monto_usd (Decimal)"
  status: "VALID" | "CONFLICT";
  message: string;
}

export interface CompositePath {
  id: string;
  nodes: string[]; // e.g. ["crm", "facturacion", "analytics"]
  functors: string[]; // e.g. ["crm_to_facturacion", "facturacion_to_analytics"]
  status: "VALID" | "CONFLICT" | "UNVALIDATED";
  details: string;
  isomorphic: boolean;
  steps: {
    sourceId: string;
    targetId: string;
    functorId: string;
    status: "VALID" | "CONFLICT" | "UNVALIDATED";
  }[];
  typeFlows: TypeFlow[];
}

export function inferType(fieldName: string): "Decimal" | "String" | "ID" | "DateTime" | "Unknown" {
  const name = fieldName.toLowerCase();
  if (
    name.includes("monto") ||
    name.includes("usd") ||
    name.includes("precio") ||
    name.includes("cantidad") ||
    name.includes("stock") ||
    name.includes("inventario") ||
    name.includes("base") ||
    name.includes("total")
  ) {
    return "Decimal";
  }
  if (
    name.includes("email") ||
    name.includes("moneda") ||
    name.includes("etapa") ||
    name.includes("estado") ||
    name.includes("contacto") ||
    name.includes("nombre") ||
    name.includes("descripcion")
  ) {
    return "String";
  }
  if (name.includes("id") || name.includes("cuenta") || name.includes("origen")) {
    return "ID";
  }
  if (
    name.includes("creado") ||
    name.includes("fecha") ||
    name.includes("timestamp") ||
    name.includes("registro") ||
    name.includes("actualizado")
  ) {
    return "DateTime";
  }
  return "Unknown";
}

export function parseRule(ruleStr: string): ParsedRule | null {
  const parts = ruleStr.split("->").map((p) => p.trim());
  if (parts.length !== 2) return null;
  const sourceParts = parts[0].split(".");
  const targetParts = parts[1].split(".");
  if (sourceParts.length !== 2 || targetParts.length !== 2) return null;
  return {
    sourceObj: sourceParts[0],
    sourceField: sourceParts[1],
    targetObj: targetParts[0],
    targetField: targetParts[1],
    raw: ruleStr
  };
}

/**
 * Finds all simple paths of length >= 2 in the directed graph of categories.
 */
export function analyzeComposition(categories: Category[], functors: Functor[]): CompositePath[] {
  const categoryIds = categories.map((c) => c.id);
  const adj: Record<string, { targetId: string; functor: Functor }[]> = {};

  // Initialize adjacency list
  for (const catId of categoryIds) {
    adj[catId] = [];
  }

  // Populate adjacency list
  for (const func of functors) {
    if (adj[func.source_id]) {
      adj[func.source_id].push({
        targetId: func.target_id,
        functor: func
      });
    }
  }

  const results: CompositePath[] = [];

  // DFS helper to find paths of length >= 2
  function dfs(
    currentNode: string,
    visited: Set<string>,
    currentPathNodes: string[],
    currentPathFunctors: Functor[]
  ) {
    visited.add(currentNode);
    currentPathNodes.push(currentNode);

    // If path length is >= 2 edges (which means >= 3 nodes), we found a compound path
    if (currentPathNodes.length >= 3) {
      const pathNodeIds = [...currentPathNodes];
      const pathFuncs = [...currentPathFunctors];
      results.push(buildCompositePath(pathNodeIds, pathFuncs, categories));
    }

    const neighbors = adj[currentNode] || [];
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor.targetId)) {
        currentPathFunctors.push(neighbor.functor);
        dfs(neighbor.targetId, visited, currentPathNodes, currentPathFunctors);
        currentPathFunctors.pop();
      }
    }

    currentPathNodes.pop();
    visited.delete(currentNode);
  }

  // Start DFS from each node to get all possible paths
  for (const catId of categoryIds) {
    const visited = new Set<string>();
    dfs(catId, visited, [], []);
  }

  return results;
}

/**
 * Builds and analyzes a composite path
 */
function buildCompositePath(
  nodes: string[],
  functors: Functor[],
  categories: Category[]
): CompositePath {
  const pathId = nodes.join("_to_");
  
  // Basic steps
  const steps = functors.map((f) => ({
    sourceId: f.source_id,
    targetId: f.target_id,
    functorId: f.id,
    status: f.status
  }));

  // Analyze flows and type compatibility
  const typeFlows: TypeFlow[] = [];
  let pathStatus: "VALID" | "CONFLICT" | "UNVALIDATED" = "VALID";
  let conflictReason = "";

  // If any functor in the path has CONFLICT, the path is CONFLICT
  // If no functor has CONFLICT but at least one is UNVALIDATED, the path is UNVALIDATED
  const hasConflictFunctor = functors.some((f) => f.status === "CONFLICT");
  const hasUnvalidatedFunctor = functors.some((f) => f.status === "UNVALIDATED");

  if (hasConflictFunctor) {
    pathStatus = "CONFLICT";
    conflictReason = "Uno o más puentes en la ruta de integración tienen conflictos activos.";
  } else if (hasUnvalidatedFunctor) {
    pathStatus = "UNVALIDATED";
    conflictReason = "La ruta contiene puentes sin validar. Pendiente de verificación estática.";
  }

  // Parse rules of all functors in the path to trace field flows
  const parsedFunctorsRules = functors.map((f) => {
    return f.mapping_rules
      .map((r) => parseRule(r))
      .filter((r): r is ParsedRule => r !== null);
  });

  // Trace transitive flows:
  // For each functor link i (0 to functors.length - 2)
  // Let's see if we can trace a field mapping from functor i to functor i+1
  for (let i = 0; i < functors.length - 1; i++) {
    const f1Rules = parsedFunctorsRules[i];
    const f2Rules = parsedFunctorsRules[i + 1];

    for (const r1 of f1Rules) {
      for (const r2 of f2Rules) {
        // A link is matched if the target field/object of r1 is the source field/object of r2
        // Or if they reference the same object and field in the intermediate category
        const isMatch =
          r1.targetObj === r2.sourceObj && r1.targetField === r2.sourceField;

        if (isMatch) {
          const type1 = inferType(r1.sourceField);
          const type2 = inferType(r1.targetField);
          const type3 = inferType(r2.targetField);

          const isTypeMatch = type1 === type3 || (type1 === "ID" && type3 === "String") || (type1 === "String" && type3 === "ID");
          const status = isTypeMatch ? "VALID" : "CONFLICT";
          
          let message = "";
          if (isTypeMatch) {
            message = `Mapeo compatible: ${type1} fluye correctamente a través del sistema intermedio.`;
          } else {
            message = `Conflicto de tipo: se esperaba tipo ${type1} de origen, pero el destino espera tipo ${type3}.`;
            pathStatus = "CONFLICT";
            conflictReason = `Conflicto de tipado en el paso intermedio: se requiere ${type3} en destino final pero se recibe ${type1}.`;
          }

          // Build a human-friendly chain representation
          const chain = `${r1.sourceObj}.${r1.sourceField} (${type1}) -> ${r1.targetObj}.${r1.targetField} (${type2}) -> ${r2.targetObj}.${r2.targetField} (${type3})`;

          typeFlows.push({
            chain,
            status,
            message
          });
        }
      }
    }
  }

  // Determine isomorphic properties
  const isomorphic = typeFlows.length > 0 && typeFlows.every((tf) => tf.status === "VALID");

  // Format detailed description
  let details = "";
  if (pathStatus === "VALID") {
    details = `Ruta 100% compatible. Flujo automático descubierto entre ${categories.find(c => c.id === nodes[0])?.name || nodes[0]} y ${categories.find(c => c.id === nodes[nodes.length - 1])?.name || nodes[nodes.length - 1]}.`;
  } else if (pathStatus === "CONFLICT") {
    details = conflictReason || `Incompatibilidad detectada en la cadena de composición.`;
  } else {
    details = `Ruta inactiva. Requiere validar el functor de acoplamiento.`;
  }

  return {
    id: pathId,
    nodes,
    functors: functors.map((f) => f.id),
    status: pathStatus,
    details,
    isomorphic,
    steps,
    typeFlows
  };
}
