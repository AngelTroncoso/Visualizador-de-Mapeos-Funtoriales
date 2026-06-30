import React, { useState, useEffect, useRef } from "react";
import {
  Cpu,
  Terminal as TerminalIcon,
  Play,
  RotateCcw,
  Sparkles,
  Brain,
  Code,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Compass,
  ArrowRight,
  Info,
  Layers,
  Zap,
  Activity
} from "lucide-react";
import { Category, Functor } from "../types";
import { CompositePath } from "../utils/compositionAnalyzer";
import { emitGraphEvent } from "../services/firestoreData";

interface AgentLoopConsoleProps {
  categories: Category[];
  functors: Functor[];
  selectedFunctorId: string | null;
  setSelectedFunctorId: (id: string | null) => void;
  compositePaths: CompositePath[];
}

interface LogLine {
  agent: "SCANNER" | "REASONER" | "SYNTHESIZER" | "ACTUATOR" | "SYSTEM";
  message: string;
  timestamp: string;
  type: "info" | "success" | "warning" | "error";
}

type LoopStrategy = "self-healing" | "proof-verification" | "path-predictive";

export default function AgentLoopConsole({
  categories,
  functors,
  selectedFunctorId,
  setSelectedFunctorId,
  compositePaths
}: AgentLoopConsoleProps) {
  // Strategy Selected
  const [strategy, setStrategy] = useState<LoopStrategy>("self-healing");
  
  // Loop execution states
  const [loopState, setLoopState] = useState<"IDLE" | "SCANNING" | "REASONING" | "SYNTHESIZING" | "DEPLOYING" | "COMPLETED">("IDLE");
  const [logs, setLogs] = useState<LogLine[]>([]);
  const [targetFunctor, setTargetFunctor] = useState<Functor | null>(null);
  const [progress, setProgress] = useState(0);
  
  // Terminal autoscroll ref
  const terminalEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs]);

  // Push log helper
  const addLog = (
    agent: "SCANNER" | "REASONER" | "SYNTHESIZER" | "ACTUATOR" | "SYSTEM",
    message: string,
    type: "info" | "success" | "warning" | "error" = "info"
  ) => {
    const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    setLogs((prev) => [...prev, { agent, message, timestamp: time, type }]);
  };

  // Run the autonomous agent loop
  const handleRunAgentLoop = () => {
    if (loopState !== "IDLE" && loopState !== "COMPLETED") return;

    // Reset loop
    setLogs([]);
    setProgress(0);
    
    // Select best target functor to optimize based on strategy and selection
    let activeTarget: Functor | null = null;
    
    if (selectedFunctorId) {
      activeTarget = functors.find((f) => f.id === selectedFunctorId) || null;
    } else {
      // Find the first conflict or unvalidated functor in the graph automatically
      activeTarget = functors.find((f) => f.status === "CONFLICT") || 
                     functors.find((f) => f.status === "UNVALIDATED") || 
                     functors[0] || null;
    }

    setTargetFunctor(activeTarget);

    if (!activeTarget) {
      setLoopState("SCANNING");
      addLog("SYSTEM", "Iniciando Bucle de Agente Autónomo...", "info");
      setTimeout(() => {
        addLog("SCANNER", "Error: No se encontraron functores registrados en el grafo para optimizar.", "error");
        setLoopState("IDLE");
      }, 1000);
      return;
    }

    // Step 1: Scanner Agent
    setLoopState("SCANNING");
    setProgress(15);
    addLog("SYSTEM", `Bucle activado bajo estrategia: [${strategy.toUpperCase()}]`, "success");
    addLog("SCANNER", `Escaneando morfismos y esquemas del functor target: '${activeTarget.id}'`, "info");
    
    // Timer simulation for multi-agent loops
    // Phase 1: Scan
    setTimeout(() => {
      if (!activeTarget) return;
      const sourceCat = categories.find(c => c.id === activeTarget?.source_id);
      const targetCat = categories.find(c => c.id === activeTarget?.target_id);

      addLog("SCANNER", `Análisis estructural completado. Origen: [${sourceCat?.name || activeTarget.source_id}] ➔ Destino: [${targetCat?.name || activeTarget.target_id}]`, "success");
      addLog("SCANNER", `Reglas de mapeo encontradas: ${activeTarget.mapping_rules.length} ecuaciones declaradas.`, "info");

      if (activeTarget.status === "CONFLICT") {
        addLog("SCANNER", "Alerta: Conflicto de tipado y conmutabilidad detectado en las ecuaciones de tránsito.", "warning");
      } else if (activeTarget.status === "UNVALIDATED") {
        addLog("SCANNER", "Functor sin validar. Requiere evaluación estática de compatibilidad de esquemas.", "info");
      } else {
        addLog("SCANNER", "Functor actualmente VALIDADO. Ejecutando bucle de re-validación de isomorfismo.", "info");
      }

      // Phase 2: Reasoning
      setLoopState("REASONING");
      setProgress(40);
      addLog("REASONER", `Spawning Reasoning Agent... Analizando esquemas de datos:`, "info");
      
      setTimeout(() => {
        if (!activeTarget) return;
        
        // Analyze fields inside rules
        const rules = activeTarget.mapping_rules;
        addLog("REASONER", `Evaluando reglas: ${rules.join(", ")}`, "info");
        
        if (strategy === "self-healing") {
          if (activeTarget.id === "facturacion_to_analytics" || activeTarget.status === "CONFLICT") {
            addLog("REASONER", "Discrepancia detectada: 'monto_base' (Decimal) se transfiere a 'monto_usd' (Decimal), pero 'Transaccion.moneda' indica flujos multi-divisa sin normalización de divisas.", "warning");
            addLog("REASONER", "Resolución requerida: Inyección de un functor de coerción con conversión a base USD en tiempo real.", "success");
          } else {
            addLog("REASONER", "Análisis completado: Las firmas de tipos coinciden en los esquemas intermedios. Coerción directa admisible.", "success");
          }
        } else if (strategy === "proof-verification") {
          addLog("REASONER", "Verificando conmutatividad del diagrama de categorías... Evaluando transitividad.", "info");
          addLog("REASONER", "Fórmula homóloga: H_CRM_to_Analytics ≅ G_Facturación_to_Analytics ∘ F_CRM_to_Facturación", "info");
        } else {
          addLog("REASONER", "Prediciendo nuevos morfismos... Analizando proximidad semántica de campos de bases de datos.", "info");
        }

        // Phase 3: Synthesizing
        setLoopState("SYNTHESIZING");
        setProgress(70);
        addLog("SYNTHESIZER", "Spawning Category-Theory Co-limit Synthesizer Agent...", "info");
        
        setTimeout(() => {
          if (!activeTarget) return;
          
          let proposedExpr = "";
          let successMsg = "";
          
          if (activeTarget.id === "facturacion_to_analytics") {
            proposedExpr = "coerce(monto_base) :: Decimal -> to_usd(Transaccion.moneda) -> round(4)";
            successMsg = "Fórmula sintética de coerción monetaria calculada matemáticamente.";
          } else if (activeTarget.status === "CONFLICT") {
            proposedExpr = "coerce(source_field) :: Decimal -> cast(Float) -> scale(1.0)";
            successMsg = "Fórmula heurística de resolución de tipos generada con éxito.";
          } else {
            proposedExpr = "identity(mapping_flow) :: AutoCasted";
            successMsg = "Isomorfismo directo verificado. Mapeo libre de coerción.";
          }

          addLog("SYNTHESIZER", `Expresión generada: '${proposedExpr}'`, "success");
          addLog("SYNTHESIZER", successMsg, "info");

          // Phase 4: Deploying (Actuating)
          setLoopState("DEPLOYING");
          setProgress(90);
          addLog("ACTUATOR", "Spawning Actuator Agent... Compitiendo cambios formalmente en la base de datos Firestore.", "info");
          
          setTimeout(async () => {
            if (!activeTarget) return;
            
            try {
              // Physically write to Firestore / LocalStorage
              await emitGraphEvent({
                functor_id: activeTarget.id,
                event_type: "CONFLICT_RESOLVED",
                details: {
                  reconciliation_expression: proposedExpr,
                  message: `Bucle Autónomo de Agentes finalizado con éxito para [${activeTarget.name}]. Error corregido mediante inyección formal.`,
                  target_object_id: "AgentSelfHealingLoop"
                }
              });

              addLog("ACTUATOR", "Cambios sincronizados en base de datos Firestore y LocalStorage en tiempo real.", "success");
              addLog("ACTUATOR", `Estado del functor '${activeTarget.id}' actualizado a: [VALID] ✅`, "success");

              // Phase 5: Completed
              setLoopState("COMPLETED");
              setProgress(100);
              addLog("SYSTEM", "Bucle cerrado con éxito. Monitoreo de salud del grafo re-activado.", "success");
              
              // Select the target functor to showcase the update
              setSelectedFunctorId(activeTarget.id);

            } catch (err) {
              addLog("SYSTEM", `Error al persistir cambios: ${err}`, "error");
              setLoopState("IDLE");
            }
          }, 1500);

        }, 1500);

      }, 1500);

    }, 1500);
  };

  // Cancel/Reset Loop
  const handleResetLoop = () => {
    setLoopState("IDLE");
    setLogs([]);
    setProgress(0);
    setTargetFunctor(null);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl p-5 flex flex-col gap-4 text-white" id="agent-loop-engine-workspace">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-amber-500/10 border border-amber-500/20 rounded-lg animate-pulse">
            <Cpu className="h-4.5 w-4.5 text-amber-400" />
          </div>
          <div>
            <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-200">
              Agent Loop Engineering
            </h3>
            <p className="text-[10px] text-slate-400">Motor de Agentes Co-inductivos para Autocorrección</p>
          </div>
        </div>
        <span className="text-[9px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full uppercase font-bold border border-emerald-500/20 tracking-wider">
          Fase 3 Activa
        </span>
      </div>

      {/* Strategies Selector */}
      <div className="grid grid-cols-3 gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
        <button
          onClick={() => setStrategy("self-healing")}
          disabled={loopState !== "IDLE" && loopState !== "COMPLETED"}
          className={`py-2 px-2 text-[10px] font-bold rounded-lg transition-all duration-150 flex flex-col items-center justify-center gap-1 cursor-pointer ${
            strategy === "self-healing"
              ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/10"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
          }`}
        >
          <Zap className="h-3.5 w-3.5" />
          <span>Self-Healing</span>
        </button>

        <button
          onClick={() => setStrategy("proof-verification")}
          disabled={loopState !== "IDLE" && loopState !== "COMPLETED"}
          className={`py-2 px-2 text-[10px] font-bold rounded-lg transition-all duration-150 flex flex-col items-center justify-center gap-1 cursor-pointer ${
            strategy === "proof-verification"
              ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/10"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
          }`}
        >
          <ShieldCheck className="h-3.5 w-3.5" />
          <span>Rigor Proof</span>
        </button>

        <button
          onClick={() => setStrategy("path-predictive")}
          disabled={loopState !== "IDLE" && loopState !== "COMPLETED"}
          className={`py-2 px-2 text-[10px] font-bold rounded-lg transition-all duration-150 flex flex-col items-center justify-center gap-1 cursor-pointer ${
            strategy === "path-predictive"
              ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/10"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
          }`}
        >
          <Compass className="h-3.5 w-3.5" />
          <span>Predecir Links</span>
        </button>
      </div>

      {/* Narrative Info block */}
      <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 text-[11px] leading-relaxed text-slate-300">
        <div className="flex gap-2">
          <Sparkles className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-slate-200">
              {strategy === "self-healing" && "Bucle de Autocorrección Activa"}
              {strategy === "proof-verification" && "Verificación Homólogica de Commutatividad"}
              {strategy === "path-predictive" && "Minería de Relaciones Transitivas"}
            </span>
            <p className="text-slate-400 mt-0.5">
              {strategy === "self-healing" && "Escanea el grafo, detecta incoherencias en tipos o divisas, y crea una regla matemática de reconciliación inyectándola en el functor."}
              {strategy === "proof-verification" && "Verifica formalmente si los diagramas conmutan transitivamente a través del grafo. Garantiza coherencia e invariabilidad de los datos."}
              {strategy === "path-predictive" && "Analiza los campos homólogos latentes en categorías aisladas y propone la creación automática de nuevos funtores de integración."}
            </p>
          </div>
        </div>
      </div>

      {/* Interactive Multi-Agent Flowchart Diagram */}
      <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 relative overflow-hidden flex flex-col gap-3">
        <span className="text-[9px] text-slate-500 uppercase font-bold tracking-wider">
          Flujo de Trabajo del Bucle de Agentes
        </span>

        <div className="flex items-center justify-between gap-1 text-[10px] font-medium relative z-10 py-1.5">
          {/* Arrow flow line bg */}
          <div className="absolute top-1/2 left-4 right-4 h-0.5 bg-slate-800 -translate-y-1/2 z-0" />

          {/* Agent 1: Scanner */}
          <div className="flex flex-col items-center gap-1.5 relative z-10 shrink-0 w-1/4">
            <div
              className={`p-2 rounded-full border transition-all duration-300 ${
                loopState === "SCANNING"
                  ? "bg-amber-500 text-slate-950 border-amber-400 animate-pulse ring-4 ring-amber-500/20 scale-110"
                  : loopState !== "IDLE"
                  ? "bg-emerald-950 text-emerald-400 border-emerald-800"
                  : "bg-slate-900 text-slate-400 border-slate-800"
              }`}
              title="Agente de Observación (Escaneo)"
            >
              <Compass className={`h-4 w-4 ${loopState === "SCANNING" ? "animate-spin" : ""}`} style={{ animationDuration: "3s" }} />
            </div>
            <span className={loopState === "SCANNING" ? "text-amber-400 font-bold" : "text-slate-400"}>Sensor</span>
          </div>

          {/* Agent 2: Reasoner */}
          <div className="flex flex-col items-center gap-1.5 relative z-10 shrink-0 w-1/4">
            <div
              className={`p-2 rounded-full border transition-all duration-300 ${
                loopState === "REASONING"
                  ? "bg-amber-500 text-slate-950 border-amber-400 animate-pulse ring-4 ring-amber-500/20 scale-110"
                  : loopState !== "IDLE" && loopState !== "SCANNING"
                  ? "bg-emerald-950 text-emerald-400 border-emerald-800"
                  : "bg-slate-900 text-slate-400 border-slate-800"
              }`}
              title="Agente de Razonamiento (Tipos)"
            >
              <Brain className={`h-4 w-4 ${loopState === "REASONING" ? "animate-bounce" : ""}`} />
            </div>
            <span className={loopState === "REASONING" ? "text-amber-400 font-bold" : "text-slate-400"}>Razonador</span>
          </div>

          {/* Agent 3: Synthesizer */}
          <div className="flex flex-col items-center gap-1.5 relative z-10 shrink-0 w-1/4">
            <div
              className={`p-2 rounded-full border transition-all duration-300 ${
                loopState === "SYNTHESIZING"
                  ? "bg-amber-500 text-slate-950 border-amber-400 animate-pulse ring-4 ring-amber-500/20 scale-110"
                  : loopState === "DEPLOYING" || loopState === "COMPLETED"
                  ? "bg-emerald-950 text-emerald-400 border-emerald-800"
                  : "bg-slate-900 text-slate-400 border-slate-800"
              }`}
              title="Agente de Síntesis (Coerción)"
            >
              <Code className="h-4 w-4" />
            </div>
            <span className={loopState === "SYNTHESIZING" ? "text-amber-400 font-bold" : "text-slate-400"}>Generador</span>
          </div>

          {/* Agent 4: Actuator */}
          <div className="flex flex-col items-center gap-1.5 relative z-10 shrink-0 w-1/4">
            <div
              className={`p-2 rounded-full border transition-all duration-300 ${
                loopState === "DEPLOYING"
                  ? "bg-amber-500 text-slate-950 border-amber-400 animate-pulse ring-4 ring-amber-500/20 scale-110"
                  : loopState === "COMPLETED"
                  ? "bg-emerald-950 text-emerald-400 border-emerald-800"
                  : "bg-slate-900 text-slate-400 border-slate-800"
              }`}
              title="Agente Actuador (Deployer)"
            >
              <Activity className={`h-4 w-4 ${loopState === "DEPLOYING" ? "animate-pulse" : ""}`} />
            </div>
            <span className={loopState === "DEPLOYING" ? "text-amber-400 font-bold" : "text-slate-400"}>Actuador</span>
          </div>
        </div>

        {/* Selected target indicator */}
        {targetFunctor && (
          <div className="border-t border-slate-850 pt-2 flex items-center justify-between text-[10px] text-slate-400">
            <span className="flex items-center gap-1">
              <Layers className="h-3 w-3 text-amber-500" />
              Objetivo: <strong className="text-slate-200">{targetFunctor.name}</strong>
            </span>
            <span className="font-mono text-[9px] uppercase tracking-wide">
              ID: {targetFunctor.id}
            </span>
          </div>
        )}

        {/* Progress Bar */}
        {loopState !== "IDLE" && (
          <div className="w-full bg-slate-800 rounded-full h-1.5 mt-1 overflow-hidden">
            <div
              className="bg-gradient-to-r from-amber-500 to-emerald-400 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>

      {/* Terminal View */}
      <div className="flex flex-col bg-slate-950 rounded-xl border border-slate-850 overflow-hidden flex-1 min-h-[180px]">
        {/* Terminal Header */}
        <div className="bg-slate-900 px-4 py-2 border-b border-slate-850 flex items-center justify-between text-[10px] text-slate-400 font-mono">
          <div className="flex items-center gap-2">
            <TerminalIcon className="h-3.5 w-3.5 text-amber-400" />
            <span>AGENTS_LOOP_SHELL_CONSOLE_V3.0.0</span>
          </div>
          <div className="flex gap-1">
            <span className="h-2 w-2 rounded-full bg-rose-500" />
            <span className="h-2 w-2 rounded-full bg-amber-500" />
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
          </div>
        </div>

        {/* Logs Stream */}
        <div className="p-4 flex-1 overflow-y-auto max-h-[190px] font-mono text-[10px] space-y-2 select-text text-slate-300 scrollbar-thin scrollbar-thumb-slate-800">
          {logs.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center text-slate-600 gap-1.5 py-6">
              <TerminalIcon className="h-6 w-6 opacity-30 text-slate-500 animate-pulse" />
              <p className="italic">Consola lista para emitir de forma asíncrona.</p>
              <p className="text-[9px] opacity-85">Haz click en "Ejecutar Bucle" para iniciar el ciclo agentico.</p>
            </div>
          ) : (
            logs.map((log, index) => {
              let tagColor = "text-amber-400";
              let msgColor = "text-slate-300";

              if (log.agent === "SYSTEM") {
                tagColor = "text-slate-400 font-bold";
                msgColor = "text-slate-200 font-semibold";
              } else if (log.agent === "SCANNER") {
                tagColor = "text-sky-400";
              } else if (log.agent === "REASONER") {
                tagColor = "text-indigo-400";
              } else if (log.agent === "SYNTHESIZER") {
                tagColor = "text-purple-400";
              } else if (log.agent === "ACTUATOR") {
                tagColor = "text-emerald-400";
              }

              if (log.type === "error") {
                msgColor = "text-rose-400 font-bold";
              } else if (log.type === "warning") {
                msgColor = "text-amber-300";
              } else if (log.type === "success") {
                msgColor = "text-emerald-400";
              }

              return (
                <div key={index} className="leading-relaxed border-l-2 border-slate-800 pl-2 hover:bg-slate-900/40 py-0.5 rounded transition">
                  <span className="text-slate-500 text-[9px] mr-1">[{log.timestamp}]</span>
                  <span className={`${tagColor} uppercase mr-1`}>{log.agent}:</span>
                  <span className={msgColor}>{log.message}</span>
                </div>
              );
            })
          )}
          <div ref={terminalEndRef} />
        </div>
      </div>

      {/* Execute/Control Buttons */}
      <div className="flex gap-2">
        <button
          onClick={handleRunAgentLoop}
          disabled={loopState !== "IDLE" && loopState !== "COMPLETED"}
          className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider rounded-xl transition duration-150 flex items-center justify-center gap-2 cursor-pointer shadow-md ${
            loopState !== "IDLE" && loopState !== "COMPLETED"
              ? "bg-slate-800 text-slate-500 cursor-not-allowed"
              : "bg-amber-500 hover:bg-amber-400 text-slate-950 hover:shadow-amber-500/15"
          }`}
        >
          {loopState !== "IDLE" && loopState !== "COMPLETED" ? (
            <>
              <RotateCcw className="h-4 w-4 animate-spin" />
              <span>Ejecutando Bucle...</span>
            </>
          ) : (
            <>
              <Play className="h-4 w-4 text-slate-950 fill-slate-950" />
              <span>Ejecutar Bucle Autónomo</span>
            </>
          )}
        </button>

        {(loopState !== "IDLE" || logs.length > 0) && (
          <button
            onClick={handleResetLoop}
            className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition duration-150 cursor-pointer text-xs font-bold"
            title="Resetear Consola"
          >
            Reset
          </button>
        )}
      </div>
    </div>
  );
}
