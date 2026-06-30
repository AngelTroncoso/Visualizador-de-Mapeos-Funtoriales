import { useEffect, useState } from "react";
import { signInAnonymously } from "firebase/auth";
import { collection, onSnapshot, query, orderBy, limit } from "firebase/firestore";
import { db, auth, handleFirestoreError, OperationType } from "../services/firebase";
import { Category, Functor, GraphEvent } from "../types";
import {
  getLocalCategories,
  getLocalFunctors,
  getLocalEvents
} from "../services/firestoreData";

export function useFirestoreSync() {
  // Initialize with local values instantly so there's no infinite loader!
  const [categories, setCategories] = useState<Category[]>(() => getLocalCategories());
  const [functors, setFunctors] = useState<Functor[]>(() => getLocalFunctors());
  const [events, setEvents] = useState<GraphEvent[]>(() => getLocalEvents());
  const [loading, setLoading] = useState(false); // Default to false since we load local data instantly
  const [error, setError] = useState<string | null>(null);
  const [authUser, setAuthUser] = useState<any | null>(null);
  const [isLocalSandbox, setIsLocalSandbox] = useState(true);

  useEffect(() => {
    let unsubscribeCategories = () => {};
    let unsubscribeFunctors = () => {};
    let unsubscribeEvents = () => {};

    // 1. Setup local updates listener
    const handleLocalUpdate = () => {
      setCategories(getLocalCategories());
      setFunctors(getLocalFunctors());
      setEvents(getLocalEvents());
    };
    window.addEventListener("categorybridge_local_update", handleLocalUpdate);

    // Safeguard timer: if we can't establish live Firestore in 3 seconds, mark as sandbox
    const safeguardTimeout = setTimeout(() => {
      setIsLocalSandbox(true);
      setLoading(false);
    }, 3000);

    // 2. Try to connect to Firebase Live Sync
    signInAnonymously(auth)
      .then((userCredential) => {
        setAuthUser(userCredential.user);
        setIsLocalSandbox(false);
        console.log("Firebase Auth success. Connecting live Firestore listeners...");

        try {
          // Listen to Categories live
          const catQuery = collection(db, "categories");
          unsubscribeCategories = onSnapshot(
            catQuery,
            (snapshot) => {
              const list: Category[] = [];
              snapshot.forEach((doc) => {
                list.push(doc.data() as Category);
              });
              if (list.length > 0) {
                setCategories(list);
              }
              setLoading(false);
            },
            (err) => {
              console.warn("Live Categories listener failed (switching to local sandbox):", err);
              setIsLocalSandbox(true);
              setLoading(false);
            }
          );

          // Listen to Functors live
          const funcQuery = collection(db, "functors");
          unsubscribeFunctors = onSnapshot(
            funcQuery,
            (snapshot) => {
              const list: Functor[] = [];
              snapshot.forEach((doc) => {
                list.push(doc.data() as Functor);
              });
              if (list.length > 0) {
                setFunctors(list);
              }
              setLoading(false);
            },
            (err) => {
              console.warn("Live Functors listener failed:", err);
              setIsLocalSandbox(true);
              setLoading(false);
            }
          );

          // Listen to Events live
          const eventsQuery = query(collection(db, "graph_events"), orderBy("timestamp", "desc"), limit(30));
          unsubscribeEvents = onSnapshot(
            eventsQuery,
            (snapshot) => {
              const list: GraphEvent[] = [];
              snapshot.forEach((doc) => {
                list.push({ id: doc.id, ...doc.data() } as GraphEvent);
              });
              if (list.length > 0) {
                setEvents(list);
              }
              setLoading(false);
            },
            (err) => {
              console.warn("Live Events listener failed (missing index or permission):", err);
              // Do not crash, keep local events
            }
          );
        } catch (e: any) {
          console.warn("Error starting live Firestore listeners:", e);
          setIsLocalSandbox(true);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.warn("Firebase Anonymous Auth failed. App will run in fully featured Local Sandbox Mode:", err);
        setIsLocalSandbox(true);
        // Do not show a blocking screen, but keep the error logged as a warning
        setError(`Nota: El proyecto Firebase Auth / API Key no está activo (${err.message}). Se ha activado el Modo Sandbox Local de alta fidelidad.`);
        setLoading(false);
      });

    return () => {
      clearTimeout(safeguardTimeout);
      window.removeEventListener("categorybridge_local_update", handleLocalUpdate);
      unsubscribeCategories();
      unsubscribeFunctors();
      unsubscribeEvents();
    };
  }, []);

  return {
    categories,
    functors,
    events,
    loading,
    error,
    authUser,
    isAuthenticated: !!authUser && !isLocalSandbox,
    isLocalSandbox
  };
}
