<div align="center">

<img width="1200" height="475" alt="CategoryBridge Graph Banner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />

# 🌉 CategoryBridge Graph

### Visualizador de Mapeos Funtoriales en Tiempo Real

**Modela tus sistemas de datos como Categorías matemáticas, conecta sus integraciones como Funtores, y detecta conflictos de tipado antes de que rompan tu pipeline.**

[![Firebase](https://img.shields.io/badge/Firestore-Realtime-FFCA28?logo=firebase&logoColor=white)](https://firebase.google.com/)
[![React](https://img.shields.io/badge/React-TypeScript-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-Build-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind](https://img.shields.io/badge/Tailwind-CSS-38B2AC?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/license-MIT-green)](#-licencia)

[Ver en AI Studio](https://ai.studio/apps/fa376aff-a76d-4e9f-ba49-238fa000c738) · [Reportar un problema](#) · [Solicitar una funcionalidad](#)

</div>

---

## 📖 ¿Qué es CategoryBridge Graph?

Cuando una empresa conecta su CRM, su sistema de facturación y su plataforma de analítica, los datos casi nunca encajan a la primera: un campo que en un sistema es `Decimal` puede llegar a otro como `String`, o una moneda en `CLP` puede colisionar con un sistema que espera `USD`. Resolver esto a mano, sistema por sistema, es lento y propenso a errores.

**CategoryBridge Graph** aplica la **Teoría de Categorías** —un marco formal de las matemáticas— para modelar este problema de forma rigurosa y visual:

| Concepto matemático | En la app | En tu negocio |
|---|---|---|
| **Categoría** | Nodo en el lienzo | Un sistema de datos (CRM, ERP, BI, Facturación) |
| **Funtor** | Arista dirigida | Una integración o mapeo entre dos sistemas |
| **Conflicto de tipado** | Arista roja | Una incompatibilidad de esquema sin resolver |
| **Coerción** | Fórmula en el Inspector | La regla que traduce un tipo a otro |

El resultado: un mapa vivo de tu arquitectura de datos, sincronizado en tiempo real, donde los conflictos se ven antes de llegar a producción.

---

## ✨ Funcionalidades

- 🟢 **Lienzo interactivo en tiempo real** — arrastra, conecta y reorganiza categorías y funtores sobre un grafo SVG sincronizado vía Firestore.
- 🚦 **Estados visuales claros** — verde (sincronizado), rojo (conflicto), ámbar (pendiente de validación).
- 🔍 **Inspector categórico** — haz clic en cualquier nodo o arista para ver su esquema, sus reglas de coerción y su historial.
- ⚡ **Modo Conectar** — crea funtores haciendo clic en un nodo origen y otro destino, sin escribir código.
- 🧩 **Composition Analyzer** *(Fase 2)* — detecta automáticamente rutas de integración transitivas (A → B → C) y valida si la cadena completa es compatible.
- 🔐 **Multi-tenant y gratuito** — cada usuario tiene su propio espacio aislado en Firestore, con modo invitado sin necesidad de registro.
- 📡 **Sincronización en vivo** — los cambios de cualquier colaborador se reflejan al instante en todas las pantallas conectadas.

---

## 🕐 ¿Cuándo, dónde y cómo usarlo?

**¿Cuándo?** Cuando necesitas mapear cómo se conectan tus sistemas de datos —antes de integrarlos— y anticipar incompatibilidades de esquema o tipo.

**¿Dónde?** Directo en tu navegador, sin instalar nada. Tus datos viven en tu cuenta (o en modo invitado, en tu propio dispositivo).

**¿Cómo?**
1. **Crea** tus categorías (sistemas de datos).
2. **Conecta** con funtores en "Modo Conectar".
3. **Resuelve** los conflictos escribiendo una regla de coerción en el Inspector.

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

```env
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
├── src/
│   ├── components/
│   │   ├── GraphView.tsx          # Lienzo SVG interactivo
│   │   └── OnboardingTutorial.tsx # Tutorial guiado de 4 pasos
│   ├── hooks/
│   │   └── useFirestoreSync.ts    # Sincronización en tiempo real
│   ├── services/
│   │   ├── firebase.ts            # Inicialización de Firebase
│   │   └── firestoreData.ts       # Operaciones CRUD sobre Firestore
│   ├── types.ts                   # Tipos de Categorías y Funtores
│   └── App.tsx
├── firestore.rules                # Reglas de seguridad multi-tenant
├── security_spec.md               # Especificación de seguridad
├── index.html
├── vite.config.ts
├── tailwind.config.js
└── package.json
```

---

## 🛠️ Stack técnico

| Capa | Tecnología |
|---|---|
| Frontend | React + TypeScript + Vite |
| Estilos | Tailwind CSS |
| Base de datos | Firebase Firestore (tiempo real) |
| Autenticación | Firebase Auth (Google + Anónimo) |
| IA generativa | Google Gemini API |

---

## 🗺️ Hoja de ruta

- [x] Lienzo interactivo con arrastre y reconexión
- [x] Sincronización en tiempo real con Firestore
- [x] Inspector categórico y simulador de eventos
- [x] Aislamiento de datos multi-tenant (gratuito)
- [ ] Composition Analyzer Engine (detección de rutas transitivas)
- [ ] Auto-layout de nodos (algoritmo de fuerza dirigida)
- [ ] Pan & Zoom para grafos de gran escala
- [ ] Exportación de mapeos a JSON (compatible con dbt / Airflow / Apache Camel)

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

<div align="center">

**CategoryBridge Graph** — Modelado Funtorial de Sistemas de Datos

[Documentación](#) · [Firestore Realtime Sync v1.0](#)

</div>
