import React, { useState, useEffect, useRef } from "react";
import {
  Database,
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Play,
  Trash2,
  Plus,
  X,
  Zap,
  Activity,
  Code,
  Layers,
  Sparkles,
  RefreshCw,
  Info,
  Download,
  Compass
} from "lucide-react";
import { Category, Functor, GraphEvent } from "../types";
import { analyzeComposition, CompositePath } from "../utils/compositionAnalyzer";
import {
  seedDefaultData,
  clearAllCollections,
  createCategory,
  deleteCategory,
  createFunctor,
  deleteFunctor,
  emitGraphEvent
} from "../services/firestoreData";

interface GraphViewProps {
  categories: Category[];
  functors: Functor[];
  events: GraphEvent[];
  error: string | null;
  isLocalSandbox?: boolean;
}

interface Position {
  x: number;
  y: number;
}

export default function GraphView({ categories, functors, events, error, isLocalSandbox = true }: GraphViewProps) {
  // Drag and drop node coordinates
  const [positions, setPositions] = useState<Record<string, Position>>({});
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const dragOffset = useRef<Position>({ x: 0, y: 0 });
  const containerRef = useRef<SVGSVGElement | null>(null);

  // Inspector and selection state
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [selectedFunctorId, setSelectedFunctorId] = useState<string | null>(null);

  // Composition Analyzer State (Fase 2)
  const [selectedPathId, setSelectedPathId] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(true);

  // Create Category Form State
  const [showAddCat, setShowAddCat] = useState(false);
  const [newCatId, setNewCatId] = useState("");
  const [newCatName, setNewCatName] = useState("");
  const [newCatDesc, setNewCatDesc] = useState("");
  const [newCatObjects, setNewCatObjects] = useState("");

  // Create Functor Form State
  const [showAddFunc, setShowAddFunc] = useState(false);
  const [newFuncId, setNewFuncId] = useState("");
  const [newFuncName, setNewFuncName] = useState("");
  const [newFuncSource, setNewFuncSource] = useState("");
  const [newFuncTarget, setNewFuncTarget] = useState("");
  const [newFuncRules, setNewFuncRules] = useState("");

  // Interactive Connect Mode States
  const [isConnectMode, setIsConnectMode] = useState(false);
  const [connectSourceId, setConnectSourceId] = useState<string | null>(null);

  // Resolution Form State
  const [reconciliationExpr, setReconciliationExpr] = useState("");
  const [isSeeding, setIsSeeding] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  // Set default positions for base categories when they load
  useEffect(() => {
    const initialPositions: Record<string, Position> = {
      crm: { x: 180, y: 150 },
      facturacion: { x: 580, y: 150 },
      analytics: { x: 380, y: 410 }
    };

    const updated = { ...initialPositions };
    categories.forEach((cat) => {
      if (!updated[cat.id]) {
        // Place new categories dynamically in a spiral or random spacing
        const count = Object.keys(updated).length;
        updated[cat.id] = {
          x: 150 + (count % 3) * 260,
          y: 200 + Math.floor(count / 3) * 180
        };
      }
    });
    setPositions(updated);
  }, [categories]);

  // Handle Seeding
  const handleSeed = async () => {
    setIsSeeding(true);
    try {
      await seedDefaultData();
    } catch (e) {
      console.error(e);
    } finally {
      setIsSeeding(false);
    }
  };

  // Handle Clear
  const handleClear = async () => {
    setIsClearing(true);
    try {
      await clearAllCollections();
      setSelectedCategoryId(null);
      setSelectedFunctorId(null);
    } catch (e) {
      console.error(e);
    } finally {
      setIsClearing(false);
    }
  };

  // Export JSON (Fase 2)
  const handleExportJSON = (paths: CompositePath[]) => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(paths, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "categorybridge_integration_paths.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Mouse Drag Handlers
  const handleNodeMouseDown = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    setDraggingNodeId(id);
    const pos = positions[id] || { x: 0, y: 0 };
    dragOffset.current = {
      x: e.clientX - pos.x,
      y: e.clientY - pos.y
    };
  };

  const handleContainerMouseMove = (e: React.MouseEvent) => {
    if (!draggingNodeId) return;
    const newX = Math.max(50, Math.min(850, e.clientX - dragOffset.current.x));
    const newY = Math.max(50, Math.min(550, e.clientY - dragOffset.current.y));

    setPositions((prev) => ({
      ...prev,
      [draggingNodeId]: { x: newX, y: newY }
    }));
  };

  const handleContainerMouseUp = () => {
    setDraggingNodeId(null);
  };

  // Create Category Submit
  const handleCreateCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatId || !newCatName) return;

    const formattedId = newCatId.trim().toLowerCase().replace(/[^a-z0-9_\-]/g, "");
    const objectsArray = newCatObjects
      .split(",")
      .map((o) => o.trim())
      .filter((o) => o.length > 0);

    const category: Category = {
      id: formattedId,
      name: newCatName.trim(),
      description: newCatDesc.trim(),
      objects: objectsArray
    };

    await createCategory(category);
    setShowAddCat(false);
    setNewCatId("");
    setNewCatName("");
    setNewCatDesc("");
    setNewCatObjects("");
  };

  // Create Functor Submit
  const handleCreateFunctorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFuncId || !newFuncSource || !newFuncTarget || !newFuncName) return;

    const formattedId = newFuncId.trim().toLowerCase().replace(/[^a-z0-9_\-]/g, "");
    const rulesArray = newFuncRules
      .split(",")
      .map((r) => r.trim())
      .filter((r) => r.length > 0);

    const functor: Functor = {
      id: formattedId,
      source_id: newFuncSource,
      target_id: newFuncTarget,
      name: newFuncName.trim(),
      status: "UNVALIDATED",
      mapping_rules: rulesArray,
      reconciliation_expression: ""
    };

    await createFunctor(functor);
    setShowAddFunc(false);
    setNewFuncId("");
    setNewFuncName("");
    setNewFuncSource("");
    setNewFuncTarget("");
    setNewFuncRules("");
  };

  // Delete Category handler
  const handleDeleteCategory = async (id: string) => {
    if (confirm(`¿Estás seguro de que deseas eliminar la categoría "${id}"? Se romperán los funtores asociados.`)) {
      await deleteCategory(id);
      if (selectedCategoryId === id) setSelectedCategoryId(null);
    }
  };

  // Delete Functor handler
  const handleDeleteFunctor = async (id: string) => {
    if (confirm(`¿Estás seguro de que deseas eliminar el funtor "${id}"?`)) {
      await deleteFunctor(id);
      if (selectedFunctorId === id) setSelectedFunctorId(null);
    }
  };

  // Real-time simulations
  const handleTriggerConflict = async (funcId: string) => {
    await emitGraphEvent({
      functor_id: funcId,
      event_type: "CONFLICT_DETECTED",
      details: {
        message: "Conflicto de tipado y escala detectado automáticamente en la tubería del Functor.",
        target_object_id: "ObjetoDestino"
      }
    });
  };

  const handleResolveConflictSubmit = async (e: React.FormEvent, funcId: string) => {
    e.preventDefault();
    if (!reconciliationExpr) return;

    await emitGraphEvent({
      functor_id: funcId,
      event_type: "CONFLICT_RESOLVED",
      details: {
        reconciliation_expression: reconciliationExpr,
        message: "Mapeo formal corregido e inyectado con expresión de coerción de datos categóricos.",
        target_object_id: "ReconciliacionFuntorial"
      }
    });
    setReconciliationExpr("");
  };

  const handleRunValidation = async (funcId: string) => {
    await emitGraphEvent({
      functor_id: funcId,
      event_type: "VALIDATION_RUNNING",
      details: {
        message: "Ejecutando verificadores de tipos estáticos y pre-condiciones funtoriales sobre el grafo..."
      }
    });
  };

  // Helpers to draw arrows and dots
  const getFunctorMetrics = (func: Functor) => {
    const source = positions[func.source_id];
    const target = positions[func.target_id];

    if (!source || !target) return null;

    const dx = target.x - source.x;
    const dy = target.y - source.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist === 0) return null;

    const ux = dx / dist;
    const uy = dy / dist;

    // Shift arrow starting and ending point to align perfectly outside the cards
    // Node cards are 210x84, so offsets of ~115px keep arrows elegant
    const offsetStart = 110;
    const offsetEnd = 115;

    const startX = source.x + ux * offsetStart;
    const startY = source.y + uy * offsetStart;
    const endX = target.x - ux * offsetEnd;
    const endY = target.y - uy * offsetEnd;

    // Control point for a slight bezier curve to support dual-direction arrows
    const cx = (startX + endX) / 2 - uy * 20;
    const cy = (startY + endY) / 2 + ux * 20;

    return { startX, startY, endX, endY, cx, cy, ux, uy, dist };
  };

  const selectedCategory = categories.find((c) => c.id === selectedCategoryId);
  const selectedFunctor = functors.find((f) => f.id === selectedFunctorId);

  // Real-time Composition Analysis (Fase 2)
  const compositePaths = analyzeComposition(categories, functors);
  const activePath = selectedPathId ? compositePaths.find((p) => p.id === selectedPathId) : null;
  const isHighlighted = (funcId: string) => {
    return activePath ? activePath.functors.includes(funcId) : false;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="graph-view-workspace">
      {/* LEFT COLUMN: SVG Graph Canvas (7/12 cols) */}
      <div className="lg:col-span-8 bg-slate-50 border border-slate-200 rounded-2xl shadow-sm p-4 flex flex-col min-h-[580px] relative">
        {/* Header Bar inside Canvas */}
        <div className="flex flex-wrap items-center justify-between border-b border-slate-200 pb-3 mb-4 gap-2">
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-indigo-600"></span>
            </span>
            <h3 className="text-sm font-semibold text-slate-800 tracking-tight flex items-center gap-1.5">
              <Activity className="h-4 w-4 text-indigo-500" />
              Lienzo Funtorial Interactivo (Categorías)
            </h3>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleSeed}
              disabled={isSeeding}
              className="px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 rounded-lg shadow-sm transition flex items-center gap-1"
            >
              <Sparkles className="h-3 w-3" />
              {isSeeding ? "Sembrando..." : "Sembrar Demo"}
            </button>
            <button
              onClick={handleClear}
              disabled={isClearing}
              className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-sm transition flex items-center gap-1"
            >
              <Trash2 className="h-3 w-3 text-rose-500" />
              {isClearing ? "Vaciando..." : "Limpiar Todo"}
            </button>
          </div>
        </div>

        {/* Instructions */}
        <div className="text-xs text-slate-500 mb-2 flex items-center gap-1">
          <Info className="h-3.5 w-3.5 text-indigo-500 flex-shrink-0" />
          <span>Arrastra los sistemas (nodos) para reacomodar el grafo. Haz click sobre ellos o sobre los funtores para inspeccionarlos.</span>
        </div>

        {isLocalSandbox && (
          <div className="mb-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl px-4 py-3 text-xs flex items-start gap-2.5 shadow-sm" id="local-sandbox-banner">
            <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0 animate-pulse" />
            <div className="flex-1">
              <span className="font-semibold">Modo Sandbox Local Activo:</span> El servicio Firestore no se pudo conectar debido a credenciales inválidas o falta de conexión. Hemos habilitado el <span className="font-semibold">Modo Local Sandbox de Alta Fidelidad</span>. Todos tus cambios se guardarán automáticamente en tu navegador y podrás simular, conectar categorías y disparar conflictos funtoriales normalmente.
            </div>
          </div>
        )}

        {categories.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-12 border-2 border-dashed border-indigo-200 rounded-2xl bg-white shadow-inner my-auto min-h-[360px]">
            <Database className="h-14 w-14 text-indigo-500 mb-4 animate-bounce" />
            <h4 className="text-base font-bold text-slate-800 uppercase tracking-wider">El grafo categórico está vacío</h4>
            <p className="text-xs text-slate-500 max-w-md mt-2 leading-relaxed">
              No se han encontrado colecciones de sistemas de datos en tu base de datos de Firestore. 
              Siembra las categorías interconectadas por defecto para inicializar el lienzo y las simulaciones funtoriales.
            </p>
            <button
              onClick={handleSeed}
              disabled={isSeeding}
              className="mt-6 px-5 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 rounded-xl shadow-md hover:shadow-lg transition flex items-center gap-2"
              id="empty-state-seed-button"
            >
              <Sparkles className="h-4 w-4" />
              {isSeeding ? "Sembrando..." : "Sembrar Base de Datos Demo"}
            </button>
          </div>
        ) : (
          <div className="flex-1 relative border border-slate-200 rounded-xl overflow-hidden bg-white flex flex-col">
            {/* FLOATING COMPOSITION ANALYZER BADGES (Fase 2) */}
            <div className="absolute top-4 right-4 z-10 flex flex-col gap-1.5 pointer-events-none sm:pointer-events-auto">
              <div className="bg-slate-900/95 backdrop-blur border border-slate-800 text-white rounded-xl px-3 py-1.5 shadow-lg flex items-center gap-2 text-[11px]">
                <Compass className="h-3.5 w-3.5 text-amber-400 animate-spin shrink-0" style={{ animationDuration: "6s" }} />
                <span className="font-semibold tracking-tight">
                  {compositePaths.length === 1 
                    ? "1 ruta compuesta detectada" 
                    : `${compositePaths.length} rutas compuestas detectadas`}
                </span>
              </div>
              
              {compositePaths.some(p => p.status === "CONFLICT") && (
                <div className="bg-rose-600/95 backdrop-blur border border-rose-500 text-white rounded-xl px-3 py-1.5 shadow-lg shadow-rose-600/10 flex items-center gap-2 text-[11px] animate-pulse">
                  <AlertTriangle className="h-3.5 w-3.5 text-white shrink-0 animate-bounce" />
                  <span className="font-bold tracking-tight">
                    {compositePaths.filter(p => p.status === "CONFLICT").length === 1
                      ? "1 conflicto transitivo activo"
                      : `${compositePaths.filter(p => p.status === "CONFLICT").length} conflictos transitivos`}
                  </span>
                </div>
              )}
            </div>

            {/* Modo Conectar - Helper Banner */}
            {isConnectMode && (
              <div className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-xs flex justify-between items-center m-3 animate-pulse shadow-md z-10">
                <div className="flex items-center gap-2 font-medium">
                  <Zap className="h-4 w-4 animate-bounce text-yellow-300" />
                  <span>
                    {!connectSourceId
                      ? "MODO CONECTAR: Haz click en la categoría de ORIGEN (nodo inicial)"
                      : `ORIGEN SELECCIONADO: "${categories.find((c) => c.id === connectSourceId)?.name || connectSourceId}". Ahora haz click en la categoría de DESTINO.`}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsConnectMode(false);
                    setConnectSourceId(null);
                  }}
                  className="bg-indigo-700 hover:bg-indigo-800 px-2.5 py-1 rounded text-[10px] font-bold uppercase transition"
                >
                  Cancelar
                </button>
              </div>
            )}

            <svg
              ref={containerRef}
              className={`w-full h-[480px] select-none ${isConnectMode ? "cursor-crosshair" : "cursor-default"}`}
              onMouseMove={handleContainerMouseMove}
              onMouseUp={handleContainerMouseUp}
              onMouseLeave={handleContainerMouseUp}
            >
              {/* Arrow definitions */}
              <defs>
                <marker
                  id="arrow-highlight"
                  viewBox="0 0 10 10"
                  refX="6"
                  refY="5"
                  markerWidth="8"
                  markerHeight="8"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 1 L 10 5 L 0 9 z" fill="#F59E0B" />
                </marker>
                <marker
                  id="arrow-valid"
                  viewBox="0 0 10 10"
                  refX="6"
                  refY="5"
                  markerWidth="7"
                  markerHeight="7"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 1 L 10 5 L 0 9 z" fill="#10B981" />
                </marker>
                <marker
                  id="arrow-conflict"
                  viewBox="0 0 10 10"
                  refX="6"
                  refY="5"
                  markerWidth="7"
                  markerHeight="7"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 1 L 10 5 L 0 9 z" fill="#EF4444" />
                </marker>
                <marker
                  id="arrow-unvalidated"
                  viewBox="0 0 10 10"
                  refX="6"
                  refY="5"
                  markerWidth="7"
                  markerHeight="7"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 1 L 10 5 L 0 9 z" fill="#F59E0B" />
                </marker>
              </defs>

              {/* DRAW EDGES (FUNCTORS) */}
              {functors.map((func) => {
                const metrics = getFunctorMetrics(func);
                if (!metrics) return null;

                const { startX, startY, endX, endY, cx, cy } = metrics;
                const isSelected = selectedFunctorId === func.id;

                let strokeColor = "#CBD5E1"; // fallback
                let markerId = "arrow-unvalidated";
                let strokeDash = "0";

                if (func.status === "VALID") {
                  strokeColor = "#10B981";
                  markerId = "arrow-valid";
                } else if (func.status === "CONFLICT") {
                  strokeColor = "#EF4444";
                  markerId = "arrow-conflict";
                } else {
                  strokeColor = "#F59E0B";
                  markerId = "arrow-unvalidated";
                  strokeDash = "5, 5"; // Dashed for pending validation
                }

                // Bezier curve path
                const pathData = `M ${startX},${startY} Q ${cx},${cy} ${endX},${endY}`;

                return (
                  <g key={func.id} className="group cursor-pointer">
                    {/* Hover hotspot (wider stroke for easy clicking) */}
                    <path
                      d={pathData}
                      fill="none"
                      stroke="transparent"
                      strokeWidth="16"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedFunctorId(func.id);
                        setSelectedCategoryId(null);
                      }}
                    />

                    {/* Main connecting line */}
                    <path
                      id={`line_${func.id}`}
                      d={pathData}
                      fill="none"
                      stroke={strokeColor}
                      strokeWidth={isSelected ? 4 : 2}
                      strokeDasharray={strokeDash}
                      markerEnd={`url(#${markerId})`}
                      className="transition-all duration-200 group-hover:stroke-indigo-400"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedFunctorId(func.id);
                        setSelectedCategoryId(null);
                      }}
                    />

                    {/* Gold composite path highlight overlay (Fase 2) */}
                    {isHighlighted(func.id) && (
                      <>
                        <path
                          d={pathData}
                          fill="none"
                          stroke="#F59E0B"
                          strokeWidth={5}
                          strokeDasharray="6, 4"
                          markerEnd="url(#arrow-highlight)"
                          className="transition-all duration-200 opacity-90"
                        />
                        {/* Animated gold traveler particle */}
                        <circle r="5" fill="#D97706" className="shadow-lg animate-pulse">
                          <animateMotion dur="2.5s" repeatCount="indefinite" path={pathData} />
                        </circle>
                      </>
                    )}

                    {/* Animated glowing flow particles if status is VALID */}
                    {func.status === "VALID" && (
                      <circle r="4" fill="#34D399" className="shadow-sm">
                        <animateMotion dur="4s" repeatCount="indefinite" path={pathData} />
                      </circle>
                    )}

                    {/* Warning halo indicator if status is CONFLICT */}
                    {func.status === "CONFLICT" && (
                      <g transform={`translate(${cx}, ${cy})`}>
                        <circle r="12" fill="#FEE2E2" className="animate-ping opacity-75" />
                        <circle r="8" fill="#EF4444" />
                        <text y="3" textAnchor="middle" fill="white" className="text-[9px] font-bold">!</text>
                      </g>
                    )}

                    {/* Overlay Tag / Label */}
                    <g transform={`translate(${cx}, ${cy - 12})`}>
                      <rect
                        x="-60"
                        y="-10"
                        width="120"
                        height="20"
                        rx="4"
                        fill="white"
                        stroke={isSelected ? strokeColor : "#E2E8F0"}
                        strokeWidth={isSelected ? 2 : 1}
                        className="filter drop-shadow-sm"
                      />
                      <text
                        textAnchor="middle"
                        y="3"
                        className="text-[9px] font-semibold text-slate-600 tracking-wider"
                      >
                        {func.name}
                      </text>
                    </g>
                  </g>
                );
              })}

              {/* DRAW NODES (CATEGORIES) */}
              {categories.map((cat) => {
                const pos = positions[cat.id] || { x: 0, y: 0 };
                const isSelected = selectedCategoryId === cat.id;
                const isConnectSource = connectSourceId === cat.id;

                return (
                  <g
                    key={cat.id}
                    transform={`translate(${pos.x}, ${pos.y})`}
                    className="group"
                    onMouseDown={(e) => handleNodeMouseDown(cat.id, e)}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (isConnectMode) {
                        if (!connectSourceId) {
                          setConnectSourceId(cat.id);
                        } else {
                          if (connectSourceId === cat.id) {
                            setConnectSourceId(null);
                            return;
                          }
                          // Target selected: setup new functor fields
                          setNewFuncSource(connectSourceId);
                          setNewFuncTarget(cat.id);
                          setNewFuncId(`${connectSourceId}_to_${cat.id}`);
                          setNewFuncName(`F_${connectSourceId.toUpperCase()}_to_${cat.id.toUpperCase()}`);
                          setNewFuncRules(`${connectSourceId}.id -> ${cat.id}.id_origen`);
                          
                          // Open creation form and reset connect mode
                          setShowAddFunc(true);
                          setShowAddCat(false);
                          setIsConnectMode(false);
                          setConnectSourceId(null);
                        }
                      } else {
                        setSelectedCategoryId(cat.id);
                        setSelectedFunctorId(null);
                      }
                    }}
                  >
                    {/* Glowing outer shadow ring on hover or select or connect origin */}
                    <rect
                      x="-105"
                      y="-42"
                      width="210"
                      height="84"
                      rx="12"
                      fill="none"
                      stroke={isConnectSource ? "#F59E0B" : isSelected ? "#6366F1" : "#818CF8"}
                      strokeWidth={isConnectSource || isSelected ? 3 : 1}
                      strokeOpacity={isConnectSource || isSelected ? 1 : 0}
                      strokeDasharray={isConnectSource ? "4, 4" : "0"}
                      className="transition-opacity duration-200 group-hover:stroke-opacity-50"
                    />

                    {/* Actual Node Body Card */}
                    <rect
                      x="-100"
                      y="-38"
                      width="200"
                      height="76"
                      rx="10"
                      fill={isConnectSource ? "#FFFBEB" : "white"}
                      stroke={isConnectSource ? "#F59E0B" : isSelected ? "#4F46E5" : "#E2E8F0"}
                      strokeWidth={isConnectSource || isSelected ? 2.5 : 1}
                      className="filter drop-shadow-sm cursor-grab active:cursor-grabbing transition-colors duration-150 group-hover:bg-slate-50"
                    />

                    {/* Category Icon Badge */}
                    <g transform="translate(-80, -10)">
                      <circle r="14" fill="#EEF2F6" />
                      <foreignObject x="-7" y="-7" width="14" height="14">
                        <Database className="h-3.5 w-3.5 text-indigo-600" />
                      </foreignObject>
                    </g>

                    {/* Connection Helper Badge */}
                    {isConnectSource && (
                      <text
                        x="-55"
                        y="-21"
                        className="text-[8px] font-extrabold text-amber-600 tracking-wider font-mono animate-pulse"
                      >
                        [ ORIGEN SELECCIONADO ]
                      </text>
                    )}

                    {/* Category Title & details */}
                    <text
                      x="-55"
                      y={isConnectSource ? -6 : -10}
                      className="text-xs font-semibold text-slate-800 pointer-events-none tracking-tight font-sans"
                    >
                      {cat.name.length > 20 ? cat.name.slice(0, 18) + "..." : cat.name}
                    </text>

                    <text
                      x="-55"
                      y="10"
                      className="text-[10px] text-slate-400 pointer-events-none font-mono"
                    >
                      {cat.objects.length} schemas / objetos
                    </text>

                    {/* Status badges indicator inside the card */}
                    <circle cx="85" cy="-24" r="5" fill="#E2E8F0" />
                    <circle cx="85" cy="-24" r="3" fill="#10B981" />
                  </g>
                );
              })}
            </svg>
          </div>
        )}

        {/* Bottom Actions Row: Add elements to graph */}
        <div className="mt-4 flex flex-wrap gap-2 justify-start border-t border-slate-100 pt-4">
          <button
            onClick={() => {
              setShowAddCat(!showAddCat);
              setShowAddFunc(false);
              setIsConnectMode(false);
              setConnectSourceId(null);
            }}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg shadow-sm transition flex items-center gap-1.5 border ${
              showAddCat
                ? "bg-indigo-50 border-indigo-300 text-indigo-700"
                : "bg-white hover:bg-slate-50 border-slate-200 text-slate-700"
            }`}
          >
            <Plus className="h-3.5 w-3.5 text-indigo-500" />
            Nueva Categoría (Sistema)
          </button>

          <button
            onClick={() => {
              setShowAddFunc(!showAddFunc);
              setShowAddCat(false);
              setIsConnectMode(false);
              setConnectSourceId(null);
            }}
            disabled={categories.length < 2}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg shadow-sm transition flex items-center gap-1.5 border ${
              showAddFunc
                ? "bg-indigo-50 border-indigo-300 text-indigo-700"
                : "bg-white hover:bg-slate-50 border-slate-200 text-slate-700"
            } disabled:opacity-50`}
          >
            <Layers className="h-3.5 w-3.5 text-indigo-500" />
            Crear Functor (Puente)
          </button>

          <button
            onClick={() => {
              setIsConnectMode(!isConnectMode);
              setConnectSourceId(null);
              setShowAddCat(false);
              setShowAddFunc(false);
            }}
            disabled={categories.length < 2}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg shadow-sm transition flex items-center gap-1.5 border ${
              isConnectMode
                ? "bg-amber-100 border-amber-300 text-amber-800 animate-pulse"
                : "bg-white hover:bg-slate-50 border-slate-200 text-slate-700 disabled:opacity-50"
            }`}
          >
            <Zap className={`h-3.5 w-3.5 ${isConnectMode ? "text-amber-600" : "text-amber-500"}`} />
            {isConnectMode ? "Modo Conectar Activo" : "Modo Conectar (Dibujar Arista)"}
          </button>
        </div>

        {/* Dynamic creation forms overlay/drawers */}
        {showAddCat && (
          <form
            onSubmit={handleCreateCategorySubmit}
            className="absolute bottom-16 left-4 right-4 bg-white border border-slate-200 rounded-xl p-4 shadow-xl z-10 animate-in fade-in slide-in-from-bottom-2 duration-150"
          >
            <div className="flex justify-between items-center mb-3">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                <Database className="h-3.5 w-3.5 text-indigo-500" />
                Registrar Nueva Categoría (Sistema)
              </h4>
              <button type="button" onClick={() => setShowAddCat(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-1">ID Único (ej: crm, billing)</label>
                <input
                  type="text"
                  required
                  placeholder="erp_central"
                  value={newCatId}
                  onChange={(e) => setNewCatId(e.target.value)}
                  className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-1">Nombre Humanizado</label>
                <input
                  type="text"
                  required
                  placeholder="ERP Centralizado"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-1">Descripción Funcional</label>
                <input
                  type="text"
                  placeholder="Administra la cadena de suministro y registros de inventario..."
                  value={newCatDesc}
                  onChange={(e) => setNewCatDesc(e.target.value)}
                  className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-1">Esquemas / Objetos Internos (Separados por coma)</label>
                <input
                  type="text"
                  placeholder="Articulo, Stock, PedidoProveedor"
                  value={newCatObjects}
                  onChange={(e) => setNewCatObjects(e.target.value)}
                  className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAddCat(false)}
                className="px-2.5 py-1.5 text-xs font-semibold text-slate-500 hover:text-slate-700"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow"
              >
                Guardar Categoría
              </button>
            </div>
          </form>
        )}

        {showAddFunc && (
          <form
            onSubmit={handleCreateFunctorSubmit}
            className="absolute bottom-16 left-4 right-4 bg-white border border-slate-200 rounded-xl p-4 shadow-xl z-10 animate-in fade-in slide-in-from-bottom-2 duration-150"
          >
            <div className="flex justify-between items-center mb-3">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                <Layers className="h-3.5 w-3.5 text-indigo-500" />
                Registrar Nuevo Functor de Mapeo (Puente)
              </h4>
              <button type="button" onClick={() => setShowAddFunc(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-1">ID del Functor (ej: erp_to_analytics)</label>
                <input
                  type="text"
                  required
                  placeholder="erp_to_analytics"
                  value={newFuncId}
                  onChange={(e) => setNewFuncId(e.target.value)}
                  className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-1">Nombre Matemático / Técnico</label>
                <input
                  type="text"
                  required
                  placeholder="G_ERP_to_Analytics"
                  value={newFuncName}
                  onChange={(e) => setNewFuncName(e.target.value)}
                  className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-1">Categoría Origen (Sistema)</label>
                <select
                  required
                  value={newFuncSource}
                  onChange={(e) => setNewFuncSource(e.target.value)}
                  className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="">Selecciona origen...</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.id})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-1">Categoría Destino (Sistema)</label>
                <select
                  required
                  value={newFuncTarget}
                  onChange={(e) => setNewFuncTarget(e.target.value)}
                  className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="">Selecciona destino...</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.id})
                    </option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-1">Fórmulas / Reglas de Mapeo (Separadas por comas)</label>
                <input
                  type="text"
                  placeholder="Stock.cantidad -> MetricaVenta.inventario_disponible, Articulo.precio -> MetricaVenta.precio_venta"
                  value={newFuncRules}
                  onChange={(e) => setNewFuncRules(e.target.value)}
                  className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAddFunc(false)}
                className="px-2.5 py-1.5 text-xs font-semibold text-slate-500 hover:text-slate-700"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow"
              >
                Crear Puente Functorial
              </button>
            </div>
          </form>
        )}
      </div>

      {/* RIGHT COLUMN: Inspector Categórico & SIMULATOR (4/12 cols) */}
      <div className="lg:col-span-4 flex flex-col gap-6" id="inspector-and-simulator">
        
        {/* RUTAS DE INTEGRACIÓN PANEL (Fase 2 - Gancho Comercial) */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 flex flex-col" id="routes-integration-panel">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Compass className="h-4 w-4 text-amber-500 animate-spin" style={{ animationDuration: "12s" }} />
              Rutas de Integración
            </h3>
            <span className="text-[10px] bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full uppercase font-bold border border-amber-200/50">
              Composición de Flujo
            </span>
          </div>

          {/* Demo Narrative Tooltip Banner */}
          {showExplanation && (
            <div className="bg-indigo-50/80 border border-indigo-100 rounded-xl p-3.5 mb-4 relative overflow-hidden animate-in fade-in duration-200">
              <button 
                type="button" 
                onClick={() => setShowExplanation(false)} 
                className="absolute top-2.5 right-2.5 text-indigo-400 hover:text-indigo-600 transition cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
              </button>
              <div className="flex gap-2">
                <Sparkles className="h-4 w-4 text-indigo-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-indigo-950 uppercase tracking-wide">Detección Automática Activa</h4>
                  <p className="text-[11px] text-indigo-800 mt-1 leading-relaxed font-medium font-sans">
                    Tus datos viajan automáticamente desde CRM hasta tu panel de BI sin que tengas que mapearlo manualmente — el sistema lo detectó solo.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Paths List */}
          {compositePaths.length === 0 ? (
            <div className="text-center py-6 bg-slate-50 border border-slate-100 rounded-xl">
              <Info className="h-8 w-8 text-slate-300 mx-auto mb-1.5" />
              <p className="text-[11px] text-slate-500 max-w-[200px] mx-auto leading-relaxed">Crea múltiples funtores consecutivos para habilitar el análisis de composición transitiva (ej: A → B y B → C).</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
              {compositePaths.map((path) => {
                const isActive = selectedPathId === path.id;
                let statusBadge = "";
                let statusText = "";
                let itemBg = "bg-slate-50 border-slate-150 hover:bg-slate-100/60";
                
                if (isActive) {
                  itemBg = "bg-amber-50/50 border-amber-300 hover:bg-amber-50/70 ring-1 ring-amber-300/30";
                }

                if (path.status === "VALID") {
                  statusBadge = "bg-emerald-50 text-emerald-700 border-emerald-200";
                  statusText = "✅ Compatible";
                } else if (path.status === "CONFLICT") {
                  statusBadge = "bg-rose-50 text-rose-700 border-rose-200 animate-pulse";
                  statusText = "⚠️ Conflicto";
                } else {
                  statusBadge = "bg-amber-50 text-amber-700 border-amber-200";
                  statusText = "⌛ Sin Validar";
                }

                // Format node trace: CRM → ERP → Analytics
                const nodesTrace = path.nodes
                  .map((nId) => categories.find((c) => c.id === nId)?.name || nId)
                  .join(" → ");

                return (
                  <button
                    key={path.id}
                    onClick={() => setSelectedPathId(isActive ? null : path.id)}
                    className={`w-full text-left p-3 rounded-xl border text-xs transition-all duration-150 flex flex-col gap-2 cursor-pointer ${itemBg}`}
                  >
                    <div className="flex items-start justify-between gap-2 w-full">
                      <span className="font-bold text-slate-800 tracking-tight leading-snug">
                        {nodesTrace}
                      </span>
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md uppercase shrink-0 border ${statusBadge}`}>
                        {statusText}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-500 italic leading-normal">
                      {path.details}
                    </p>

                    {/* Show type flows detailed trace if active */}
                    {isActive && path.typeFlows.length > 0 && (
                      <div className="mt-1 border-t border-slate-200/60 pt-2 space-y-1.5 w-full">
                        <span className="text-[9px] font-bold uppercase text-amber-800 tracking-wider">
                          Análisis de Tipos en Tránsito:
                        </span>
                        {path.typeFlows.map((flow, index) => (
                          <div key={index} className="bg-white/80 p-2 border border-slate-200 rounded-lg text-[10px] font-mono flex flex-col gap-1">
                            <span className="text-slate-700 break-all leading-normal">{flow.chain}</span>
                            <span className={`font-semibold ${flow.status === "VALID" ? "text-emerald-600" : "text-rose-600 animate-pulse"}`}>
                              {flow.message}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* Export Button */}
          {compositePaths.length > 0 && (
            <button
              onClick={() => handleExportJSON(compositePaths)}
              className="mt-4 w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
            >
              <Download className="h-3.5 w-3.5 text-amber-400" />
              Exportar mapeo (JSON)
            </button>
          )}
        </div>

        {/* INSPECTOR PANEL */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-3 mb-4 flex items-center gap-1.5">
            <Layers className="h-4 w-4 text-indigo-500" />
            Inspector Categórico
          </h3>

          {!selectedCategory && !selectedFunctor ? (
            <div className="text-center py-10 text-slate-400">
              <HelpCircle className="h-10 w-10 mx-auto text-slate-300 mb-2" />
              <p className="text-xs font-medium">Ningún elemento seleccionado</p>
              <p className="text-[11px] text-slate-400 mt-1">Haz click sobre un sistema de datos o sobre las flechas de funtores para inspeccionar la estructura de mapeo.</p>
            </div>
          ) : selectedCategory ? (
            /* CATEGORY DETAILED VIEW */
            <div className="animate-in fade-in duration-150">
              <div className="flex justify-between items-start mb-2">
                <span className="text-[9px] font-bold bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Sistema / Categoría
                </span>
                <button
                  onClick={() => handleDeleteCategory(selectedCategory.id)}
                  className="text-slate-400 hover:text-rose-500 p-1 rounded-md transition"
                  title="Eliminar Categoría"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <h4 className="text-base font-bold text-slate-800 tracking-tight flex items-center gap-1.5">
                <Database className="h-5 w-5 text-indigo-500" />
                {selectedCategory.name}
              </h4>
              <p className="text-[11px] text-slate-400 font-mono mt-0.5">ID: {selectedCategory.id}</p>

              <p className="text-xs text-slate-600 mt-3 bg-slate-50 p-2.5 rounded-lg border border-slate-100 italic leading-relaxed">
                "{selectedCategory.description || 'Sin descripción provista.'}"
              </p>

              {/* Objects inside Category */}
              <div className="mt-5">
                <h5 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Objetos / Esquemas Coexistentes (Dominios)
                </h5>
                {selectedCategory.objects.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No hay esquemas definidos en esta categoría.</p>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {selectedCategory.objects.map((obj, i) => (
                      <span
                        key={i}
                        className="text-[11px] font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 px-2.5 py-1 rounded-md tracking-tight transition"
                      >
                        {obj}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* FUNCTOR DETAILED VIEW */
            <div className="animate-in fade-in duration-150">
              <div className="flex justify-between items-start mb-2">
                <span className="text-[9px] font-bold bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Mapeo / Functor Homólogo
                </span>
                <button
                  onClick={() => handleDeleteFunctor(selectedFunctor!.id)}
                  className="text-slate-400 hover:text-rose-500 p-1 rounded-md transition"
                  title="Eliminar Functor"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <h4 className="text-base font-bold text-slate-800 tracking-tight flex items-center gap-1">
                <Layers className="h-5 w-5 text-indigo-500" />
                {selectedFunctor!.name}
              </h4>
              <p className="text-[11px] text-slate-400 font-mono mt-0.5">ID: {selectedFunctor!.id}</p>

              {/* Direction Indicator */}
              <div className="mt-4 flex items-center justify-between bg-indigo-50/50 p-2.5 rounded-lg border border-indigo-100 text-xs font-medium text-slate-700">
                <div className="flex flex-col">
                  <span className="text-[9px] text-indigo-500 uppercase font-bold">Origen</span>
                  <span className="font-semibold text-indigo-950">{selectedFunctor!.source_id}</span>
                </div>
                <ArrowRight className="h-4 w-4 text-indigo-400 animate-pulse" />
                <div className="flex flex-col text-right">
                  <span className="text-[9px] text-indigo-500 uppercase font-bold">Destino</span>
                  <span className="font-semibold text-indigo-950">{selectedFunctor!.target_id}</span>
                </div>
              </div>

              {/* Status Section */}
              <div className="mt-5 border-t border-slate-100 pt-4">
                <h5 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Estado Funtorial
                </h5>
                <div className="flex items-center gap-2">
                  {selectedFunctor!.status === "VALID" ? (
                    <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      VALIDADO (Sincronizado)
                    </span>
                  ) : selectedFunctor!.status === "CONFLICT" ? (
                    <span className="flex items-center gap-1 text-xs font-bold text-rose-600 bg-rose-50 border border-rose-200 px-3 py-1 rounded-full">
                      <AlertTriangle className="h-4 w-4 text-rose-500 animate-bounce" />
                      CON CONFLICTO
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full">
                      <HelpCircle className="h-4 w-4 text-amber-500" />
                      PENDIENTE VALIDAR
                    </span>
                  )}
                </div>
              </div>

              {/* Mapping Rules */}
              <div className="mt-5">
                <h5 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Ecuaciones / Reglas Homólogas
                </h5>
                {selectedFunctor!.mapping_rules.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No hay ecuaciones de mapeo registradas.</p>
                ) : (
                  <div className="space-y-1.5">
                    {selectedFunctor!.mapping_rules.map((rule, i) => (
                      <div
                        key={i}
                        className="text-xs font-mono bg-slate-50 p-2 border border-slate-100 rounded-md text-slate-700 flex items-center gap-2"
                      >
                        <Code className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
                        <span>{rule}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Reconciliation expression */}
              <div className="mt-5 border-t border-slate-100 pt-4">
                <h5 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Fórmula / Bloque de Coerción
                </h5>
                {selectedFunctor!.reconciliation_expression ? (
                  <div className="bg-slate-900 text-emerald-400 font-mono text-xs p-3 rounded-lg shadow-inner border border-slate-800 overflow-x-auto">
                    <code>{selectedFunctor!.reconciliation_expression}</code>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    No se requiere expresión de coerción de datos. El mapeo es isomórfico directo.
                  </p>
                )}
              </div>

              {/* SIMULATOR CONTROLS ON SELECT */}
              <div className="mt-6 border-t border-slate-100 pt-5">
                <h5 className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider mb-3 flex items-center gap-1">
                  <Zap className="h-3.5 w-3.5 text-indigo-500" />
                  Simulaciones de Grafo en Tiempo Real
                </h5>

                <div className="space-y-2">
                  <button
                    onClick={() => handleRunValidation(selectedFunctor!.id)}
                    className="w-full text-left px-3 py-2 text-xs font-medium text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 rounded-lg transition flex items-center justify-between"
                  >
                    <span>Ejecutar Verificación Estática</span>
                    <Play className="h-3.5 w-3.5 text-amber-500" />
                  </button>

                  {selectedFunctor!.status !== "CONFLICT" && (
                    <button
                      onClick={() => handleTriggerConflict(selectedFunctor!.id)}
                      className="w-full text-left px-3 py-2 text-xs font-medium text-rose-700 hover:text-rose-900 bg-rose-50 hover:bg-rose-100 rounded-lg transition flex items-center justify-between"
                    >
                      <span>Simular Incongruencia (Conflicto)</span>
                      <AlertTriangle className="h-3.5 w-3.5 text-rose-500" />
                    </button>
                  )}

                  {selectedFunctor!.status === "CONFLICT" && (
                    <div className="mt-3 bg-indigo-50/50 p-3.5 rounded-xl border border-indigo-100">
                      <h6 className="text-[10px] font-bold text-indigo-900 uppercase tracking-tight mb-2">
                        Inyectar Resolución de Conflicto
                      </h6>
                      <form onSubmit={(e) => handleResolveConflictSubmit(e, selectedFunctor!.id)}>
                        <input
                          type="text"
                          required
                          placeholder="coerce(monto) :: USD -> normalize(moneda)"
                          value={reconciliationExpr}
                          onChange={(e) => setReconciliationExpr(e.target.value)}
                          className="w-full text-xs px-2.5 py-2 border border-slate-200 bg-white rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 mb-2 font-mono"
                        />
                        <button
                          type="submit"
                          className="w-full py-1.5 text-xs text-center font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition shadow-sm"
                        >
                          Aplicar Mapeo Funtorial
                        </button>
                      </form>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* RECENT EVENTS STREAM (REAL-TIME LOGS) */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 flex-1 min-h-[220px] flex flex-col">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-3 mb-4 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Activity className="h-4 w-4 text-emerald-500" />
              Stream de Eventos (Firestore)
            </span>
            <span className="text-[9px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full uppercase">
              En Vivo
            </span>
          </h3>

          {events.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
              <RefreshCw className="h-7 w-7 text-slate-300 animate-spin mb-2" />
              <p className="text-xs text-slate-400 italic">No hay logs en Firestore todavía. Modifica el grafo para ver logs fluir en tiempo real.</p>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto space-y-3 max-h-[280px] pr-1 scrollbar-thin">
              {events.map((ev, i) => {
                let badgeColor = "bg-slate-100 text-slate-600";
                let titleStr = "EVENTO DE GRAFO";

                if (ev.event_type === "CONFLICT_RESOLVED") {
                  badgeColor = "bg-emerald-50 text-emerald-700 border border-emerald-100";
                  titleStr = "CONFLICT_RESOLVED";
                } else if (ev.event_type === "CONFLICT_DETECTED") {
                  badgeColor = "bg-rose-50 text-rose-700 border border-rose-100";
                  titleStr = "CONFLICT_DETECTED";
                } else if (ev.event_type === "VALIDATION_RUNNING") {
                  badgeColor = "bg-amber-50 text-amber-700 border border-amber-100";
                  titleStr = "VALIDATION_RUNNING";
                } else if (ev.event_type === "MAPPING_UPDATED") {
                  badgeColor = "bg-indigo-50 text-indigo-700 border border-indigo-100";
                  titleStr = "MAPPING_UPDATED";
                }

                const evTime = ev.timestamp?.toDate ? ev.timestamp.toDate() : new Date(ev.timestamp);

                return (
                  <div
                    key={ev.id || i}
                    className="p-3 border border-slate-100 rounded-xl bg-slate-50/70 hover:bg-slate-50 transition duration-100 text-xs flex flex-col gap-1.5 relative overflow-hidden"
                  >
                    <div className="flex justify-between items-center gap-1 flex-wrap">
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider font-mono ${badgeColor}`}>
                        {titleStr}
                      </span>
                      <span className="text-[9px] text-slate-400 font-mono">
                        {evTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                      </span>
                    </div>

                    <div className="text-slate-600 font-sans leading-tight">
                      {ev.details.message || `Actualización en functor ${ev.functor_id}`}
                    </div>

                    {ev.details.reconciliation_expression && (
                      <div className="bg-slate-900 text-emerald-400 p-1.5 rounded font-mono text-[10px] mt-1 border border-slate-800 break-all overflow-x-auto">
                        {ev.details.reconciliation_expression}
                      </div>
                    )}

                    <div className="text-[9px] font-semibold text-slate-400 tracking-wider flex items-center justify-between mt-1">
                      <span>FUNCTOR: {ev.functor_id}</span>
                      {ev.details.target_object_id && (
                        <span className="uppercase text-slate-500">OBJ: {ev.details.target_object_id}</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
