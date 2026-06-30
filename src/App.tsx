import React, { useEffect, useState } from "react";
import { doc, getDocFromServer } from "firebase/firestore";
import { db } from "./services/firebase";
import { useFirestoreSync } from "./hooks/useFirestoreSync";
import GraphView from "./components/GraphView";
import OnboardingTutorial from "./components/OnboardingTutorial";
import { seedDefaultData } from "./services/firestoreData";
import {
  Activity,
  Layers,
  Wifi,
  WifiOff,
  RefreshCw,
  Share2,
  FileText,
  BookOpen,
  Info,
  HelpCircle,
  Database,
  Sparkles,
  Check,
  AlertTriangle
} from "lucide-react";

export default function App() {
  const { categories, functors, events, loading, error, authUser, isAuthenticated, isLocalSandbox } = useFirestoreSync();
  const [connectionState, setConnectionState] = useState<"verifying" | "connected" | "offline">("verifying");
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isSeedingFromError, setIsSeedingFromError] = useState(false);

  // Auto-trigger onboarding tutorial on first visit
  useEffect(() => {
    const completed = localStorage.getItem("categorybridge_onboarding_completed");
    if (!completed) {
      setShowOnboarding(true);
    }
  }, []);

  const handleCloseOnboarding = () => {
    localStorage.setItem("categorybridge_onboarding_completed", "true");
    setShowOnboarding(false);
  };

  // Mandatory Initial Connection Test as per firebase-integration guidelines
  useEffect(() => {
    async function testConnection() {
      try {
        await getDocFromServer(doc(db, "test", "connection"));
        setConnectionState("connected");
      } catch (error: any) {
        console.warn("Connection test completed/handled:", error.message);
        if (error.message && error.message.includes("the client is offline")) {
          setConnectionState("offline");
        } else {
          // If the document doesn't exist but we successfully reached the server, we are connected!
          setConnectionState("connected");
        }
      }
    }
    testConnection();
  }, []);

  const handleSeedFromError = async () => {
    setIsSeedingFromError(true);
    try {
      await seedDefaultData();
      window.location.reload();
    } catch (e) {
      console.error("Error seeding from error page:", e);
      alert("No se pudo sembrar el demo de datos automáticamente. Comprueba que las reglas de seguridad de Firestore permitan escrituras públicas.");
    } finally {
      setIsSeedingFromError(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans" id="app-root-container">
      {/* ONBOARDING TUTORIAL OVERLAY */}
      <OnboardingTutorial isOpen={showOnboarding} onClose={handleCloseOnboarding} />

      {/* GLOBAL HEADER */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-sm" id="global-navigation-bar">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-xl text-white shadow-md flex items-center justify-center">
              <Layers className="h-5 w-5 animate-pulse" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-slate-800 tracking-tight flex items-center gap-1.5 uppercase">
                CategoryBridge Graph
              </h1>
              <p className="text-[10px] text-slate-400 font-mono tracking-wider">
                Visualizador de Mapeos Funtoriales
              </p>
            </div>
          </div>

          {/* FIRESTORE CONNECTION STATUS & HELP BUTTON */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setShowOnboarding(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-100 transition shadow-sm"
              id="help-tutorial-trigger"
            >
              <HelpCircle className="h-3.5 w-3.5 text-indigo-500" />
              Tutorial / Ayuda
            </button>

            {isAuthenticated && authUser && !isLocalSandbox && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200 shadow-sm animate-pulse" id="auth-success-badge">
                <Check className="h-3 w-3 text-emerald-600" />
                Firestore Autorizado
              </span>
            )}

            {isLocalSandbox && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200 shadow-sm" id="auth-warning-badge">
                <AlertTriangle className="h-3 w-3 text-amber-600 animate-pulse" />
                Sandbox Local Activo
              </span>
            )}

            {connectionState === "verifying" ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-100">
                <RefreshCw className="h-3 w-3 animate-spin text-amber-500" />
                Verificando...
              </span>
            ) : connectionState === "connected" ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
                <Wifi className="h-3 w-3 text-emerald-500" />
                Sincronización Activa
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-100">
                <WifiOff className="h-3 w-3 text-rose-500" />
                Modo Desconectado
              </span>
            )}
          </div>
        </div>
      </header>

      {/* MAIN CONTENT SPACE */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8">
        {/* APP EXPLANATORY BANNER */}
        <div className="bg-gradient-to-r from-indigo-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden" id="introductory-banner">
          {/* Subtle background abstract shapes */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full filter blur-3xl translate-x-10 -translate-y-10"></div>
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-500/10 rounded-full filter blur-3xl -translate-x-10 translate-y-10"></div>

          <div className="relative z-10 max-w-3xl">
            <span className="text-[10px] font-bold tracking-widest text-indigo-300 uppercase bg-indigo-500/20 px-3 py-1 rounded-full">
              TEORÍA DE CATEGORÍAS & SISTEMAS DE DATOS
            </span>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white mt-3">
              Mapeos Funtoriales Homólogos en Tiempo Real
            </h2>
            <p className="text-sm text-slate-300 mt-2 leading-relaxed">
              CategoryBridge modela bases de datos o sistemas de información independientes como 
              <strong> Categorías matemáticas</strong>. Las transferencias, transformaciones e integraciones de datos entre sistemas se definen rigurosamente como 
              <strong> Funtores</strong>. Cuando hay diferencias de esquema o discrepancias de tipos de cambio se dispara un conflicto, el cual puede ser corregido inyectando fórmulas formales de reconciliación.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 border-t border-indigo-500/20 pt-6 text-xs text-slate-300">
              <div className="flex gap-2.5">
                <Database className="h-5 w-5 text-indigo-400 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-white">1. Categorías (Nodos)</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">Sistemas de información estables (ej: CRM, Facturación, Analytics) con esquemas internos.</p>
                </div>
              </div>
              <div className="flex gap-2.5">
                <Layers className="h-5 w-5 text-indigo-400 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-white">2. Funtores (Aristas)</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">Mapeos formales de esquemas. Conectan flujos de datos isomorfos o parametrizados.</p>
                </div>
              </div>
              <div className="flex gap-2.5">
                <Activity className="h-5 w-5 text-indigo-400 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-white">3. Sincronización Realtime</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">Los eventos emitidos actualizan los estados de los funtores y la UI de manera reactiva vía Firestore.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* LOADING & ERROR BOUNDARIES */}
        {loading ? (
          <div className="flex-1 min-h-[400px] flex flex-col items-center justify-center bg-white border border-slate-200 rounded-3xl shadow-sm p-12 text-center" id="global-loading-screen">
            <RefreshCw className="h-10 w-10 text-indigo-600 animate-spin mb-4" />
            <h3 className="text-sm font-semibold text-slate-700">Sincronizando estado con Firestore...</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-xs">Estableciendo conexiones de bases de datos reactivas en tiempo real...</p>
          </div>
        ) : (
          /* MAIN GRAPH WORKSPACE COMPONENT */
          <GraphView
            categories={categories}
            functors={functors}
            events={events}
            error={error}
            isLocalSandbox={isLocalSandbox}
          />
        )}
      </main>

      {/* FOOTER */}
      <footer className="bg-slate-900 border-t border-slate-800 py-8 text-white mt-12 text-xs" id="global-footer">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-400">
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-indigo-400" />
            <span>CategoryBridge Graph — Modelado Funtorial de Sistemas de Datos</span>
          </div>
          <div className="flex gap-4">
            <span className="hover:text-white transition cursor-default flex items-center gap-1">
              <BookOpen className="h-3.5 w-3.5" />
              Documentación Categórica
            </span>
            <span>|</span>
            <span className="text-slate-500">Firestore Realtime Sync v1.0</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
