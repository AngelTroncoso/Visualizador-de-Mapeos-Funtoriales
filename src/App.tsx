import React, { useEffect, useState } from "react";
import { doc, getDocFromServer } from "firebase/firestore";
import { db } from "./services/firebase";
import { useFirestoreSync } from "./hooks/useFirestoreSync";
import GraphView from "./components/GraphView";
import OnboardingTutorial from "./components/OnboardingTutorial";
import WelcomeLanding from "./components/WelcomeLanding";
import {
  Activity,
  Layers,
  Wifi,
  WifiOff,
  RefreshCw,
  HelpCircle,
  Database,
  Sparkles,
  Check,
  AlertTriangle,
  BookOpen
} from "lucide-react";

export default function App() {
  const { 
    categories, 
    functors, 
    events, 
    loading, 
    error, 
    authUser, 
    isAuthenticated, 
    isAnonymous,
    isLocalSandbox,
    loginWithGoogle,
    logout
  } = useFirestoreSync();

  const [connectionState, setConnectionState] = useState<"verifying" | "connected" | "offline">("verifying");
  const [showWelcome, setShowWelcome] = useState(() => !localStorage.getItem("categorybridge_welcome_completed"));
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Auto-trigger technical onboarding tutorial on first visit after welcome
  useEffect(() => {
    const completed = localStorage.getItem("categorybridge_onboarding_completed");
    if (!completed && !showWelcome) {
      setShowOnboarding(true);
    }
  }, [showWelcome]);

  const handleCloseOnboarding = () => {
    localStorage.setItem("categorybridge_onboarding_completed", "true");
    setShowOnboarding(false);
  };

  const handleStartGuest = () => {
    localStorage.setItem("categorybridge_welcome_completed", "true");
    setShowWelcome(false);
  };

  const handleLoginGoogle = async () => {
    await loginWithGoogle();
    localStorage.setItem("categorybridge_welcome_completed", "true");
    setShowWelcome(false);
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
          setConnectionState("connected");
        }
      }
    }
    testConnection();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans" id="app-root-container">
      {/* MINI LANDING / ONBOARDING SCREEN */}
      <WelcomeLanding 
        isOpen={showWelcome} 
        onStartGuest={handleStartGuest} 
        onLoginGoogle={handleLoginGoogle} 
      />

      {/* TECHNICAL TUTORIAL OVERLAY */}
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

          {/* STATUS & AUTH INFO */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setShowOnboarding(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-100 transition shadow-sm cursor-pointer"
              id="help-tutorial-trigger"
            >
              <HelpCircle className="h-3.5 w-3.5 text-indigo-500" />
              Tutorial / Ayuda
            </button>

            {/* Google Logged In Profile */}
            {isAuthenticated && authUser && (
              <div className="flex items-center gap-2" id="google-profile-badge">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-100 shadow-sm">
                  {authUser.photoURL ? (
                    <img src={authUser.photoURL} alt="Foto" className="h-4 w-4 rounded-full" referrerPolicy="no-referrer" />
                  ) : (
                    <Check className="h-3.5 w-3.5 text-emerald-600" />
                  )}
                  <span className="max-w-[100px] truncate">{authUser.displayName || authUser.email}</span>
                </span>
                <button
                  onClick={logout}
                  className="cursor-pointer text-[10px] font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-2.5 py-1.5 rounded-xl border border-transparent hover:border-rose-100 transition shadow-sm"
                >
                  Salir
                </button>
              </div>
            )}

            {/* Guest notice tag */}
            {isAnonymous && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-100 shadow-sm" id="auth-warning-badge">
                <AlertTriangle className="h-3 w-3 text-amber-600 animate-pulse" />
                Modo Invitado
              </span>
            )}

            {isLocalSandbox && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200 shadow-sm animate-pulse" id="auth-sandbox-badge">
                Sandbox Local
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
                Sincronizado
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-100">
                <WifiOff className="h-3 w-3 text-rose-500" />
                Desconectado
              </span>
            )}
          </div>
        </div>
      </header>

      {/* MAIN CONTENT SPACE */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8">
        
        {/* Guest Warning Banner */}
        {isAnonymous && (
          <div className="bg-amber-500/10 border border-amber-500/30 text-amber-200 rounded-3xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg shadow-amber-500/5 animate-in fade-in duration-300" id="guest-notice-banner">
            <div className="flex gap-3">
              <div className="p-2 bg-amber-500/20 rounded-xl text-amber-400 h-fit flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 animate-pulse" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wide">Sesión de Invitado Activa</h4>
                <p className="text-xs text-slate-300 mt-1 font-medium">
                  Estás en modo invitado: tus datos se guardan solo en este dispositivo. Inicia sesión con Google para sincronizar y acceder desde cualquier lugar.
                </p>
              </div>
            </div>
            <button
              onClick={loginWithGoogle}
              className="cursor-pointer px-4.5 py-2 text-xs font-bold text-slate-900 bg-amber-400 hover:bg-amber-300 rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 self-start sm:self-center shrink-0"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Iniciar con Google
            </button>
          </div>
        )}

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
