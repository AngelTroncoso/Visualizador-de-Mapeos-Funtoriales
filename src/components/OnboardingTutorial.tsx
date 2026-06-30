import React, { useState } from "react";
import {
  Layers,
  Database,
  ArrowRight,
  Sparkles,
  AlertTriangle,
  X,
  Check,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

interface OnboardingTutorialProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function OnboardingTutorial({ isOpen, onClose }: OnboardingTutorialProps) {
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen) return null;

  const steps = [
    {
      title: "🌉 Bienvenidos a CategoryBridge Graph",
      subtitle: "Modelando integraciones de datos con matemáticas avanzadas",
      description:
        "CategoryBridge traduce los conceptos complejos de la Teoría de Categorías en herramientas visuales cotidianas. En lugar de flujos de integración tradicionales, representamos tus bases de datos y transformaciones como un Grafo Funtorial en tiempo real.",
      icon: <Layers className="h-10 w-10 text-indigo-500 animate-pulse" />,
      highlight: "Ideal para coordinar CRM, Facturación y BI Analytics sin perder rigurosidad de tipos."
    },
    {
      title: "📦 ¿Qué es una Categoría?",
      subtitle: "Los Nodos estables en el lienzo",
      description:
        "Una Categoría representa un sistema de información o base de datos estable (por ejemplo, tu CRM o tu ERP). Cada una contiene un conjunto de esquemas u 'Objetos de datos' (como Leads, Facturas o Métricas). En el lienzo, son los rectángulos blancos que puedes arrastrar libremente.",
      icon: <Database className="h-10 w-10 text-emerald-500" />,
      highlight: "Tip: Haz click sobre cualquier nodo para inspeccionar sus esquemas internos en el panel derecho."
    },
    {
      title: "🗺️ ¿Qué es un Functor?",
      subtitle: "Las Aristas de mapeo y traducción",
      description:
        "Un Functor (arista) describe cómo fluyen y se traducen los datos entre categorías preservando su estructura. Mapea objetos de origen a destino mediante reglas estrictas. Las flechas representan estos funtores y cambian de color según su estado de salud.",
      icon: <ArrowRight className="h-10 w-10 text-amber-500" />,
      highlight: "Colores: Verde es validado, Ámbar es sin verificar y Rojo indica conflicto de esquemas."
    },
    {
      title: "⚡ Crear, Conectar y Resolver Conflictos",
      subtitle: "Interacción activa y reparación en vivo",
      description:
        "Puedes agregar categorías manualmente o pulsar 'Modo Conectar' para trazar un functor haciendo click en un nodo origen y luego en uno destino. Si surge un conflicto por diferencias de moneda o tipos, inyecta una 'Expresión de Coerción' desde el inspector para repararlo en vivo en Firestore.",
      icon: <Sparkles className="h-10 w-10 text-indigo-600 animate-bounce" />,
      highlight: "Prueba: Selecciona el functor con conflicto (flecha roja) y simula inyectar un convertidor de USD."
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200" id="onboarding-overlay">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-100 flex flex-col relative animate-in zoom-in-95 duration-200">
        
        {/* Progress Bar */}
        <div className="w-full bg-slate-100 h-1.5 flex">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`h-full transition-all duration-300 ${
                i <= currentStep ? "bg-indigo-600 flex-1" : "w-0 bg-transparent"
              }`}
            />
          ))}
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-50 transition"
          aria-label="Cerrar tutorial"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Content Box */}
        <div className="p-8 sm:p-10 flex-1 flex flex-col items-center text-center">
          {/* Animated Icon Circle */}
          <div className="h-20 w-20 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-6 shadow-sm">
            {steps[currentStep].icon}
          </div>

          <span className="text-[10px] font-bold tracking-widest text-indigo-500 uppercase">
            Paso {currentStep + 1} de {steps.length}
          </span>
          
          <h2 className="text-xl font-bold text-slate-800 mt-2 tracking-tight">
            {steps[currentStep].title}
          </h2>
          
          <p className="text-xs text-indigo-600 font-semibold mt-1">
            {steps[currentStep].subtitle}
          </p>

          <p className="text-xs text-slate-500 mt-4 leading-relaxed max-w-sm">
            {steps[currentStep].description}
          </p>

          {/* Highlight / Tip Callout */}
          <div className="mt-6 bg-slate-50 border border-slate-100 rounded-2xl p-4 text-left w-full">
            <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider block mb-1">
              Consejo Clave:
            </span>
            <p className="text-xs text-slate-600 leading-normal">
              {steps[currentStep].highlight}
            </p>
          </div>
        </div>

        {/* Footer controls */}
        <div className="bg-slate-50 px-8 py-5 border-t border-slate-100 flex items-center justify-between">
          <button
            onClick={handlePrev}
            disabled={currentStep === 0}
            className={`text-xs font-semibold text-slate-500 hover:text-slate-700 flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition ${
              currentStep === 0 ? "opacity-30 pointer-events-none" : ""
            }`}
          >
            <ChevronLeft className="h-4 w-4" />
            Anterior
          </button>

          {/* Step indicators dots */}
          <div className="flex gap-1.5">
            {steps.map((_, i) => (
              <div
                key={i}
                onClick={() => setCurrentStep(i)}
                className={`h-2 w-2 rounded-full cursor-pointer transition-all ${
                  i === currentStep ? "bg-indigo-600 w-4" : "bg-slate-300"
                }`}
              />
            ))}
          </div>

          <button
            onClick={handleNext}
            className="text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-xl shadow-md transition flex items-center gap-1"
          >
            {currentStep === steps.length - 1 ? (
              <>
                Entendido
                <Check className="h-4 w-4" />
              </>
            ) : (
              <>
                Siguiente
                <ChevronRight className="h-4 w-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
