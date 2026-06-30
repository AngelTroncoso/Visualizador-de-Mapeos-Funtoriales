<p align="center">
  <img src="https://ai.google.dev/static/site-assets/images/share.png" alt="CategoryBridge Graph Banner" width="100%">
</p>

# 🌉 CategoryBridge Graph

### Visualizador y Resolutor Agéntico de Mapeos Funtoriales en Tiempo Real

[![Firebase](https://img.shields.io/badge/Firestore-Realtime-FFCA28?logo=firebase&logoColor=white)](https://firebase.google.com/)
[![React](https://img.shields.io/badge/React-TypeScript-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-Build-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind](https://img.shields.io/badge/Tailwind-CSS-38B2AC?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Gemini](https://img.shields.io/badge/Gemini-genai_SDK-8E75B2?logo=googlegemini&logoColor=white)](https://ai.google.dev/)
[![License](https://img.shields.io/badge/license-MIT-green)](#-licencia)

[Ver en AI Studio](https://ai.studio/apps/fa376aff-a76d-4e9f-ba49-238fa000c738) · [Reportar un problema](#) · [Solicitar una funcionalidad](#)

---

## 📖 ¿Qué es CategoryBridge Graph?

Cuando una empresa conecta su CRM, su sistema de facturación y su plataforma de analítica, los datos casi nunca encajan a la primera: un campo que en un sistema es `Decimal` puede llegar a otro como `String`, o una moneda en `CLP` puede colisionar con un sistema que espera `USD`. Resolver esto a mano, sistema por sistema, es lento y propenso a errores.

**CategoryBridge Graph** aplica la **Teoría de Categorías** —un marco formal de las matemáticas— para modelar este problema de forma rigurosa y visual, y lo lleva un paso más allá: un **pipeline de agentes autónomos** detecta, razona y resuelve los conflictos de tipado por sí mismo, en lugar de limitarse a mostrarlos.

| Concepto matemático     | En la app               | En tu negocio                                   |
| ------------------------ | ------------------------ | ------------------------------------------------- |
| **Categoría**            | Nodo en el lienzo         | Un sistema de datos (CRM, ERP, BI, Facturación)   |
| **Funtor**               | Arista dirigida            | Una integración o mapeo entre dos sistemas        |
| **Composición**          | Ruta transitoria detectada | Una cadena de integración A → B → C inferida sola |
| **Conflicto de tipado**  | Arista roja                | Una incompatibilidad de esquema sin resolver      |
| **Coerción**             | Fórmula en el Inspector    | La regla que traduce un tipo a otro               |

El resultado: un mapa vivo de tu arquitectura de datos, sincronizado en tiempo real, donde un equipo de agentes vigila los conflictos antes de que lleguen a producción — y propone cómo resolverlos.

---

## 🤖 Arquitectura de Agentes — Pipeline Sakana Fugu

A diferencia de un asistente de IA que responde a un prompt puntual, CategoryBridge Graph orquesta un **bucle agéntico real**: percibe el grafo, razona sobre sus composiciones, sintetiza una solución formal y la actúa sobre la base de datos, sin intervención manual en cada paso.

### Roles especializados

| Agente | Función | Detalle |
| ------ | ------- | ------- |
| 🔍 **Scanner Agent** | Percepción | Optimizado para velocidad y análisis de firmas estructurales. Compara objetos y detecta tipos incompatibles o discrepancias monetarias en cada arista del grafo. |
| 🧠 **Reasoner Agent** | Razonamiento | Con un nivel de temperatura y razonamiento lógico superior, evalúa diagramas conmutativos homólogos e invariantes del sistema para validar si una composición es matemáticamente coherente. |
| ✍️ **Synthesizer Agent** | Síntesis | Escribe las expresiones estrictas de resolución formal, por ejemplo: `coerce(monto_base) :: Decimal -> to_usd(Transaccion.moneda) -> round(4)`. |
| ⚙️ **Actuator Agent** | Acción | Se encarga del despliegue y la consistencia transaccional, inyectando las ecuaciones y actualizando los estados directamente en la base de datos distribuida. |

Cada rol se ejecuta como una etapa independiente del pipeline, con sus propios logs visibles en tiempo real en la **Consola de Agentes Autónomos**, para que el usuario pueda auditar exactamente qué decidió cada agente y por qué.

### Estrategias de bucle intercambiables

El ciclo de razonamiento del pipeline no es fijo: puede operar bajo distintas estrategias según el objetivo del usuario.

- **Self-Healing (Autocorrección)** — detecta fallas en las composiciones y genera parches funcionales de forma proactiva.
- **Rigor Proof (Verificación)** — comprueba de forma rigurosa la conmutatividad matemática de los diagramas de integración antes de aceptarlos.
- **Predecir Links (Recomendación)** — evalúa la proximidad semántica entre esquemas para sugerir, de forma proactiva, nuevas conexiones de negocio aún no trazadas.

---

## ✨ Características principales

- 🟢 **Canvas interactivo (SVG Graph Editor)** — interfaz intuitiva para arrastrar, crear categorías, declarar objetos internos y trazar enlaces funtoriales dinámicamente.
- 🧩 **Análisis de composición en tiempo real** — algoritmo DFS integrado que descubre rutas compuestas transitivas (A → B → C), traza la conmutatividad y valida la compatibilidad de extremo a extremo automáticamente cada vez que se crea o edita un funtor.
- 🖥️ **Consola de Agentes Autónomos** — panel estilo terminal con visualización en vivo de los logs asíncronos emitidos por cada rol del pipeline Sakana Fugu.
- 🔁 **Estrategias de bucle intercambiables** — Self-Healing, Rigor Proof y Predecir Links, descritas arriba.
- 📤 **Exportación de mapeos** — descarga de los diagramas validados en formato JSON, listo para consumo directo en APIs productivas o middleware corporativo (dbt, Airflow, Apache Camel).
- 📡 **Persistencia híbrida** — sincronización en tiempo real basada en Firebase Firestore para eventos globales, combinada con transiciones locales reactivas (modo invitado sin necesidad de registro).
- 🔐 **Multi-tenant** — cada usuario tiene su propio espacio aislado en Firestore.

---

## 🕐 ¿Cuándo, dónde y cómo usarlo?

**¿Cuándo?** Cuando necesitas mapear cómo se conectan tus sistemas de datos —antes de integrarlos— y anticipar incompatibilidades de esquema o tipo, dejando que un equipo de agentes lo vigile por ti.

**¿Dónde?** Directo en tu navegador, sin instalar nada. Tus datos viven en tu cuenta (o en modo invitado, en tu propio dispositivo).

**¿Cómo?**

1. **Crea** tus categorías (sistemas de datos).
2. **Conecta** con funtores en "Modo Conectar".
3. **Deja que el pipeline de agentes** detecte composiciones, razone sobre conflictos y proponga (o aplique) la coerción formal.

---

## 🚀 Empezar

### Requisitos previos

- [Node.js](https://nodejs.org/) 18 o superior
- Una clave de API de Gemini ([obtener aquí](https://aistudio.google.com/app/apikey))
- (Opcional) Un proyecto de [Firebase](https://console.firebase.google.com/) en el plan gratuito **Spark**, con **Firestore** y **Authentication** (Google + Anónimo) habilitados

### Instalación

```bash
# 1. Clona el repositorio
git clone <url-del-repositorio>
cd categorybridge-graph

# 2. Instala las dependencias
npm install

# 3. Configura tus variables de entorno
cp .env.local.example .env.local
```

Edita `.env.local` y agrega tu clave:

```
GEMINI_API_KEY=tu_clave_de_gemini_aqui
```

### Ejecutar en local

```bash
npm run dev
```

La app quedará disponible en `http://localhost:5173` (o el puerto que indique Vite en consola).

### Compilar para producción

```bash
npm run build
npm run preview
```

---

## 🗂️ Estructura del proyecto

```
categorybridge-graph/
├── server/                          # Proxy seguro Express (TypeScript/Node.js)
│   └── ...                          # Aísla la clave de Gemini y orquesta el pipeline
├── src/
│   ├── agent/
│   │   ├── scanner.ts               # Scanner Agent — percepción de firmas estructurales
│   │   ├── reasoner.ts              # Reasoner Agent — validación de diagramas conmutativos
│   │   ├── synthesizer.ts           # Synthesizer Agent — expresiones formales de coerción
│   │   ├── actuator.ts              # Actuator Agent — escritura transaccional en Firestore
│   │   └── loopStrategies.ts        # Self-Healing / Rigor Proof / Predecir Links
│   ├── components/
│   │   ├── GraphView.tsx            # Lienzo SVG interactivo
│   │   ├── AgentConsole.tsx         # Consola en vivo del pipeline de agentes
│   │   └── OnboardingTutorial.tsx   # Tutorial guiado de 4 pasos
│   ├── hooks/
│   │   └── useFirestoreSync.ts      # Sincronización en tiempo real
│   ├── services/
│   │   ├── firebase.ts              # Inicialización de Firebase
│   │   └── firestoreData.ts         # Operaciones CRUD sobre Firestore
│   ├── utils/
│   │   └── compositionAnalyzer.ts   # Algoritmo DFS de composición transitiva
│   ├── types.ts                     # Tipos de Categorías, Funtores y Agentes
│   └── App.tsx
├── firestore.rules                  # Reglas de seguridad multi-tenant
├── security_spec.md                 # Especificación de seguridad
├── index.html
├── vite.config.ts
├── tailwind.config.js
└── package.json
```

---

## 🛠️ Stack técnico

| Capa | Tecnología |
| ---- | ---------- |
| Frontend | React (v18) + TypeScript + Vite |
| Estilos | Tailwind CSS + Framer Motion (micro-interacciones) |
| Backend / API | Express Server (TypeScript/Node.js) como proxy seguro de claves y orquestador del pipeline de agentes |
| IA generativa | Google Gemini API vía SDK oficial `@google/genai` |
| Base de datos | Firebase Firestore (tiempo real, multi-tenant) |
| Autenticación | Firebase Auth (Google + Anónimo) |
| Iconografía | Lucide Icons |

---

## 🗺️ Hoja de ruta

- [x] Lienzo interactivo con arrastre y reconexión
- [x] Sincronización en tiempo real con Firestore
- [x] Inspector categórico y simulador de eventos
- [x] Aislamiento de datos multi-tenant (gratuito)
- [x] Composition Analyzer Engine (detección de rutas transitivas vía DFS)
- [x] Pipeline de agentes autónomos (Scanner → Reasoner → Synthesizer → Actuator)
- [x] Estrategias de bucle intercambiables (Self-Healing, Rigor Proof, Predecir Links)
- [x] Exportación de mapeos a JSON
- [ ] Auto-layout de nodos (algoritmo de fuerza dirigida)
- [ ] Pan & Zoom para grafos de gran escala
- [ ] Conectores nativos hacia dbt / Airflow / Apache Camel

---

## 🤝 Contribuir

Las contribuciones son bienvenidas. Si quieres proponer una mejora:

1. Haz un fork del proyecto
2. Crea una rama (`git checkout -b feature/nueva-funcionalidad`)
3. Confirma tus cambios (`git commit -m 'Agrega nueva funcionalidad'`)
4. Sube la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

---

## 📄 Licencia

Este proyecto se distribuye bajo la licencia MIT. Consulta el archivo `LICENSE` para más detalles.

---

**CategoryBridge Graph** — Modelado Funtorial de Sistemas de Datos, resuelto por agentes.

[Documentación](#) · [Firestore Realtime Sync v1.0](#) · [Pipeline Sakana Fugu](#)
