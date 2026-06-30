import {
  collection,
  doc,
  setDoc,
  getDocs,
  deleteDoc,
  writeBatch,
  Timestamp
} from "firebase/firestore";
import { db, auth } from "./firebase";
import { Category, Functor, GraphEvent } from "../types";

// Local Storage Keys
const LOCAL_CATS_KEY = "categorybridge_local_categories";
const LOCAL_FUNCS_KEY = "categorybridge_local_functors";
const LOCAL_EVENTS_KEY = "categorybridge_local_events";

// Default Initial Seed Data for fallback
export const defaultCategories: Category[] = [
  {
    id: "crm",
    name: "CRM - Clientes & Ventas",
    description: "Sistema de gestión de relaciones con clientes, prospección de leads y embudo de ventas.",
    objects: ["Lead", "Oportunidad", "Contacto", "Cuenta"]
  },
  {
    id: "facturacion",
    name: "ERP & Facturación",
    description: "Sistema transaccional de emisión de facturas, cuentas por cobrar, y cobros automatizados.",
    objects: ["Factura", "Transaccion", "Cobro", "ClienteContable"]
  },
  {
    id: "analytics",
    name: "Business Intelligence & Analytics",
    description: "Plataforma de métricas agregadas, dashboards analíticos e informes gerenciales.",
    objects: ["MetricaVenta", "RetencionUsuario", "GraficoRentabilidad", "HechoVenta"]
  }
];

export const defaultFunctors: Functor[] = [
  {
    id: "crm_to_facturacion",
    source_id: "crm",
    target_id: "facturacion",
    name: "F_CRM_to_Facturación",
    status: "VALID",
    mapping_rules: [
      "Oportunidad.monto -> Factura.monto_base",
      "Contacto.email -> Factura.email_destinatario",
      "Cuenta.id -> ClienteContable.id_cuenta"
    ],
    reconciliation_expression: "coerce(monto) :: Decimal -> round(2)"
  },
  {
    id: "facturacion_to_analytics",
    source_id: "facturacion",
    target_id: "analytics",
    name: "G_Facturación_to_Analytics",
    status: "CONFLICT",
    mapping_rules: [
      "Factura.monto_base -> MetricaVenta.monto_usd",
      "Transaccion.moneda -> MetricaVenta.moneda_normalizada",
      "Transaccion.id -> HechoVenta.id_origen"
    ],
    reconciliation_expression: ""
  },
  {
    id: "crm_to_analytics",
    source_id: "crm",
    target_id: "analytics",
    name: "H_CRM_to_Analytics",
    status: "UNVALIDATED",
    mapping_rules: [
      "Lead.creado_at -> RetencionUsuario.fecha_registro",
      "Oportunidad.etapa -> MetricaVenta.embudo_estado"
    ],
    reconciliation_expression: ""
  }
];

export const defaultEvents: GraphEvent[] = [
  {
    id: "default_event_1",
    functor_id: "facturacion_to_analytics",
    event_type: "CONFLICT_DETECTED",
    timestamp: { seconds: Math.floor(Date.now() / 1000), nanoseconds: 0 } as any,
    details: {
      message: "Incongruencia de tipos de cambio detectada en Transaccion.moneda al mapear a MetricaVenta.monto_usd.",
      target_object_id: "MetricaVenta"
    }
  }
];

// Helper functions for Local Storage
export function getLocalCategories(): Category[] {
  const data = localStorage.getItem(LOCAL_CATS_KEY);
  if (!data) {
    localStorage.setItem(LOCAL_CATS_KEY, JSON.stringify(defaultCategories));
    return defaultCategories;
  }
  try {
    return JSON.parse(data);
  } catch (e) {
    return defaultCategories;
  }
}

export function saveLocalCategories(cats: Category[]) {
  localStorage.setItem(LOCAL_CATS_KEY, JSON.stringify(cats));
  window.dispatchEvent(new Event("categorybridge_local_update"));
}

export function getLocalFunctors(): Functor[] {
  const data = localStorage.getItem(LOCAL_FUNCS_KEY);
  if (!data) {
    localStorage.setItem(LOCAL_FUNCS_KEY, JSON.stringify(defaultFunctors));
    return defaultFunctors;
  }
  try {
    return JSON.parse(data);
  } catch (e) {
    return defaultFunctors;
  }
}

export function saveLocalFunctors(funcs: Functor[]) {
  localStorage.setItem(LOCAL_FUNCS_KEY, JSON.stringify(funcs));
  window.dispatchEvent(new Event("categorybridge_local_update"));
}

export function getLocalEvents(): GraphEvent[] {
  const data = localStorage.getItem(LOCAL_EVENTS_KEY);
  if (!data) {
    localStorage.setItem(LOCAL_EVENTS_KEY, JSON.stringify(defaultEvents));
    return defaultEvents;
  }
  try {
    return JSON.parse(data);
  } catch (e) {
    return defaultEvents;
  }
}

export function saveLocalEvents(events: GraphEvent[]) {
  localStorage.setItem(LOCAL_EVENTS_KEY, JSON.stringify(events));
  window.dispatchEvent(new Event("categorybridge_local_update"));
}

// Seed default data into Firestore for current user & LocalStorage
export async function seedDefaultData() {
  // Always update Local Storage first
  saveLocalCategories(defaultCategories);
  saveLocalFunctors(defaultFunctors);
  saveLocalEvents(defaultEvents);

  const userId = auth.currentUser?.uid;
  if (userId) {
    const batch = writeBatch(db);

    for (const cat of defaultCategories) {
      const ref = doc(db, "users", userId, "categories", cat.id);
      batch.set(ref, cat);
    }

    for (const func of defaultFunctors) {
      const ref = doc(db, "users", userId, "functors", func.id);
      batch.set(ref, func);
    }

    const eventId = "default_event_1";
    const ref = doc(db, "users", userId, "graph_events", eventId);
    batch.set(ref, {
      ...defaultEvents[0],
      timestamp: Timestamp.now()
    });

    try {
      await batch.commit();
      console.log("Firestore seeding completed successfully for user:", userId);
    } catch (error) {
      console.warn("Firestore seeding failed, using local fallback:", error);
    }
  } else {
    console.warn("Seeded locally. Firestore not connected.");
  }
}

// Clear all collections for current user to start fresh
export async function clearAllCollections() {
  // Clear Local Storage
  saveLocalCategories([]);
  saveLocalFunctors([]);
  saveLocalEvents([]);

  const userId = auth.currentUser?.uid;
  if (userId) {
    try {
      const categoriesSnap = await getDocs(collection(db, "users", userId, "categories"));
      const functorsSnap = await getDocs(collection(db, "users", userId, "functors"));
      const eventsSnap = await getDocs(collection(db, "users", userId, "graph_events"));

      const batch = writeBatch(db);
      categoriesSnap.forEach((doc) => batch.delete(doc.ref));
      functorsSnap.forEach((doc) => batch.delete(doc.ref));
      eventsSnap.forEach((doc) => batch.delete(doc.ref));

      await batch.commit();
      console.log("Firestore user data cleared successfully.");
    } catch (error) {
      console.warn("Firestore user data clear failed:", error);
    }
  }
}

// Create Category
export async function createCategory(cat: Category) {
  // 1. Save locally
  const list = getLocalCategories();
  if (!list.some(c => c.id === cat.id)) {
    list.push(cat);
  } else {
    const idx = list.findIndex(c => c.id === cat.id);
    list[idx] = cat;
  }
  saveLocalCategories(list);

  // 2. Try Firestore
  const userId = auth.currentUser?.uid;
  if (userId) {
    try {
      await setDoc(doc(db, "users", userId, "categories", cat.id), cat);
    } catch (error) {
      console.warn("Firestore setDoc categories failed, saved locally:", error);
    }
  }
}

// Delete Category
export async function deleteCategory(id: string) {
  // 1. Delete locally
  const list = getLocalCategories().filter(c => c.id !== id);
  saveLocalCategories(list);

  // Also remove associated functors locally
  const funcs = getLocalFunctors().filter(f => f.source_id !== id && f.target_id !== id);
  saveLocalFunctors(funcs);

  // 2. Try Firestore
  const userId = auth.currentUser?.uid;
  if (userId) {
    try {
      await deleteDoc(doc(db, "users", userId, "categories", id));
      // Delete associated functors in firestore as well
      for (const f of funcs) {
        await deleteDoc(doc(db, "users", userId, "functors", f.id));
      }
    } catch (error) {
      console.warn("Firestore deleteDoc categories failed, deleted locally:", error);
    }
  }
}

// Create Functor
export async function createFunctor(func: Functor) {
  // 1. Save locally
  const list = getLocalFunctors();
  if (!list.some(f => f.id === func.id)) {
    list.push(func);
  } else {
    const idx = list.findIndex(f => f.id === func.id);
    list[idx] = func;
  }
  saveLocalFunctors(list);

  // 2. Try Firestore
  const userId = auth.currentUser?.uid;
  if (userId) {
    try {
      await setDoc(doc(db, "users", userId, "functors", func.id), func);
    } catch (error) {
      console.warn("Firestore setDoc functors failed, saved locally:", error);
    }
  }
}

// Delete Functor
export async function deleteFunctor(id: string) {
  // 1. Delete locally
  const list = getLocalFunctors().filter(f => f.id !== id);
  saveLocalFunctors(list);

  // 2. Try Firestore
  const userId = auth.currentUser?.uid;
  if (userId) {
    try {
      await deleteDoc(doc(db, "users", userId, "functors", id));
    } catch (error) {
      console.warn("Firestore deleteDoc functors failed, deleted locally:", error);
    }
  }
}

// Update Functor Status & Expression
export async function updateFunctorStatus(id: string, status: "VALID" | "CONFLICT" | "UNVALIDATED", reconciliation_expression: string) {
  // 1. Update locally
  const list = getLocalFunctors();
  const idx = list.findIndex(f => f.id === id);
  if (idx !== -1) {
    list[idx].status = status;
    list[idx].reconciliation_expression = reconciliation_expression;
    saveLocalFunctors(list);
  }

  // 2. Try Firestore
  const userId = auth.currentUser?.uid;
  if (userId) {
    try {
      const updated: Functor = {
        id,
        source_id: list[idx]?.source_id || "",
        target_id: list[idx]?.target_id || "",
        name: list[idx]?.name || "",
        status,
        mapping_rules: list[idx]?.mapping_rules || [],
        reconciliation_expression
      };
      await setDoc(doc(db, "users", userId, "functors", id), updated);
    } catch (error) {
      console.warn("Firestore updateFunctorStatus failed, saved locally:", error);
    }
  }
}

// Emit a live GraphEvent & update target functor state synchronously
export async function emitGraphEvent(event: Omit<GraphEvent, "timestamp">) {
  // 1. Save event locally
  const localEvents = getLocalEvents();
  const eventId = `event_${Date.now()}`;
  const newEvent: GraphEvent = {
    ...event,
    id: eventId,
    timestamp: { seconds: Math.floor(Date.now() / 1000), nanoseconds: 0 } as any
  };
  localEvents.unshift(newEvent);
  if (localEvents.length > 30) {
    localEvents.pop();
  }
  saveLocalEvents(localEvents);

  // Synchronously update local functor state first
  let newStatus: "VALID" | "CONFLICT" | "UNVALIDATED" = "UNVALIDATED";
  let recExpr = "";
  if (event.event_type === "CONFLICT_RESOLVED") {
    newStatus = "VALID";
    recExpr = event.details.reconciliation_expression || "coerce(monto) :: USD -> normalize(moneda)";
  } else if (event.event_type === "CONFLICT_DETECTED") {
    newStatus = "CONFLICT";
  } else if (event.event_type === "VALIDATION_RUNNING") {
    newStatus = "UNVALIDATED";
  }

  const funcs = getLocalFunctors();
  const fIdx = funcs.findIndex(f => f.id === event.functor_id);
  if (fIdx !== -1) {
    funcs[fIdx].status = newStatus;
    funcs[fIdx].reconciliation_expression = recExpr;
    saveLocalFunctors(funcs);
  }

  // 2. Try Firestore
  const userId = auth.currentUser?.uid;
  if (userId) {
    try {
      const timestamp = Timestamp.now();
      const fullEvent = {
        ...event,
        timestamp
      };
      await setDoc(doc(db, "users", userId, "graph_events", eventId), fullEvent);
      await updateFunctorStatus(event.functor_id, newStatus, recExpr);
    } catch (error) {
      console.warn("Firestore emitGraphEvent failed, saved locally:", error);
    }
  }
}
