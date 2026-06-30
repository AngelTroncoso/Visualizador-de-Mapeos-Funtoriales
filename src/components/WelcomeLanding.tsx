import React from "react";
import { 
  Layers, 
  Database, 
  ArrowRight, 
  Sparkles, 
  Clock, 
  ShieldCheck, 
  Globe, 
  ArrowUpRight 
} from "lucide-react";

interface WelcomeLandingProps {
  isOpen: boolean;
  onStartGuest: () => void;
  onLoginGoogle: () => void;
}

export default function WelcomeLanding({ isOpen, onStartGuest, onLoginGoogle }: WelcomeLandingProps) {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-slate-950 text-white z-50 flex flex-col justify-between overflow-y-auto font-sans" 
      id="welcome-landing-screen"
    >
      {/* Decorative ambient background glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full filter blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full filter blur-3xl pointer-events-none"></div>

      {/* Top bar */}
      <header className="max-w-7xl w-full mx-auto px-6 h-20 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 p-2.5 rounded-xl text-white shadow-lg flex items-center justify-center">
            <Layers className="h-6 w-6 animate-pulse" />
          </div>
          <div>
            <h1 className="text-base font-extrabold tracking-tight uppercase">
              CategoryBridge
            </h1>
            <p className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">
              Graph Engine
            </p>
          </div>
        </div>

        <button 
          onClick={onLoginGoogle}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/15 border border-white/10 hover:border-white/20 transition cursor-pointer"
        >
          Iniciar sesión con Google
        </button>
      </header>

      {/* Hero Section */}
      <main className="max-w-5xl w-full mx-auto px-6 py-12 flex-1 flex flex-col justify-center relative z-10 gap-12">
        <div className="text-center max-w-3xl mx-auto flex flex-col gap-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-widest text-indigo-400 bg-indigo-950/80 border border-indigo-800/60 self-center">
            <Sparkles className="h-3.5 w-3.5" />
            Fase 1: Seguridad & Multi-Tenancy Activa
          </span>
          <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-white via-indigo-200 to-amber-200 bg-clip-text text-transparent">
            La forma matemáticamente rigurosa de conectar tus datos
          </h2>
          <p className="text-sm sm:text-base text-slate-400 mt-2 leading-relaxed">
            CategoryBridge traduce la Teoría de Categorías en un lienzo visual interactivo. 
            Mapea flujos de información complejos, define isomorfismos y detecta conflictos estructurales en tiempo real.
          </p>
        </div>

        {/* Value Proposition: CUÁNDO y DÓNDE */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <div className="bg-slate-900/60 border border-white/5 p-6 rounded-2xl flex gap-4">
            <div className="p-3 bg-indigo-600/10 rounded-xl text-indigo-400 h-fit">
              <Clock className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-200">¿CUÁNDO usarlo?</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Cuando necesites mapear cómo se conectan tus sistemas de datos (CRM, facturación, analytics) y detectar incompatibilidades antes de integrarlos.
              </p>
            </div>
          </div>

          <div className="bg-slate-900/60 border border-white/5 p-6 rounded-2xl flex gap-4">
            <div className="p-3 bg-amber-500/10 rounded-xl text-amber-400 h-fit">
              <Globe className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-200">¿DÓNDE usarlo?</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Funciona directo en tu navegador, sin instalar nada. Tus datos viven en tu cuenta de Google, accesibles desde cualquier dispositivo.
              </p>
            </div>
          </div>
        </div>

        {/* 3 Steps: CÓMO usarlo */}
        <div className="max-w-4xl mx-auto w-full flex flex-col gap-6">
          <div className="text-center">
            <h3 className="text-xs font-bold uppercase tracking-widest text-indigo-400">¿CÓMO funciona?</h3>
            <p className="text-sm font-semibold text-slate-300 mt-1">Lleva tus integraciones a producción en 3 pasos clave</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-900/40 border border-white/5 p-5 rounded-2xl text-center flex flex-col items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold font-mono">
                1
              </div>
              <h4 className="font-bold text-xs text-slate-200">Crear Categorías</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Crea sistemas o bases de datos como nodos en el lienzo con sus esquemas internos correspondientes.
              </p>
            </div>

            <div className="bg-slate-900/40 border border-white/5 p-5 rounded-2xl text-center flex flex-col items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 font-bold font-mono">
                2
              </div>
              <h4 className="font-bold text-xs text-slate-200">Conectar con Funtores</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Traza mapeos y flechas de relaciones entre sistemas para definir flujos de transformación isomorfos.
              </p>
            </div>

            <div className="bg-slate-900/40 border border-white/5 p-5 rounded-2xl text-center flex flex-col items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold font-mono">
                3
              </div>
              <h4 className="font-bold text-xs text-slate-200">Resolver Conflictos</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Detecta discrepancias de monedas o tipos de datos e inyecta fórmulas formales de reconciliación en vivo.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-4">
          <button
            onClick={onStartGuest}
            className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-sm font-bold rounded-2xl shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/30 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
          >
            Probar ahora (Modo Invitado)
            <ArrowRight className="h-4 w-4" />
          </button>

          <button
            onClick={onLoginGoogle}
            className="w-full sm:w-auto px-8 py-4 bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold rounded-2xl border border-white/10 hover:border-white/20 transition-all duration-200 flex items-center justify-center gap-2.5 cursor-pointer"
          >
            <span>Iniciar con Google</span>
            <span className="text-indigo-400 font-semibold text-xs bg-indigo-950/50 px-2 py-0.5 rounded-md">Recomendado</span>
          </button>
        </div>
      </main>

      {/* Footer info */}
      <footer className="max-w-7xl w-full mx-auto px-6 h-16 flex items-center justify-between text-slate-500 text-[11px] border-t border-white/5 relative z-10">
        <span className="flex items-center gap-1.5">
          <ShieldCheck className="h-4 w-4 text-emerald-500" />
          Spark Plan Compatible (100% Gratuito)
        </span>
        <span>CategoryBridge Graph Engine &copy; 2026</span>
      </footer>
    </div>
  );
}
