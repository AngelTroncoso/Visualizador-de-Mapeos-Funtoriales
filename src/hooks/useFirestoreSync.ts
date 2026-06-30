import { useEffect, useState } from "react";
import { 
  signInAnonymously, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut, 
  onAuthStateChanged,
  User 
} from "firebase/auth";
import { 
  collection, 
  onSnapshot, 
  query, 
  orderBy, 
  limit,
  getDocs,
  writeBatch,
  doc,
  Timestamp 
} from "firebase/firestore";
import { db, auth, handleFirestoreError, OperationType } from "../services/firebase";
import { Category, Functor, GraphEvent } from "../types";
import {
  getLocalCategories,
  getLocalFunctors,
  getLocalEvents,
  saveLocalCategories,
  saveLocalFunctors,
  saveLocalEvents
} from "../services/firestoreData";

export function useFirestoreSync() {
  const [categories, setCategories] = useState<Category[]>(() => getLocalCategories());
  const [functors, setFunctors] = useState<Functor[]>(() => getLocalFunctors());
  const [events, setEvents] = useState<GraphEvent[]>(() => getLocalEvents());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [isLocalSandbox, setIsLocalSandbox] = useState(false);

  // Sign in with Google
  const loginWithGoogle = async () => {
    setLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      setAuthUser(result.user);
      setError(null);
    } catch (err: any) {
      console.error("Google Auth failed:", err);
      setError(`Error al iniciar sesión con Google: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Sign out (falls back to anonymous/guest)
  const logout = async () => {
    setLoading(true);
    try {
      await signOut(auth);
      // signOut triggers onAuthStateChanged which will sign in anonymously
    } catch (err: any) {
      console.error("Signout failed:", err);
      setError(`Error al cerrar sesión: ${err.message}`);
      setLoading(false);
    }
  };

  // Force Anonymous sign in (Guest mode)
  const signInGuest = async () => {
    setLoading(true);
    try {
      const creds = await signInAnonymously(auth);
      setAuthUser(creds.user);
      setError(null);
    } catch (err: any) {
      console.warn("Guest login failed:", err);
      setIsLocalSandbox(true);
      setLoading(false);
    }
  };

  // Listen to Auth State
  useEffect(() => {
    let unsubscribeCategories = () => {};
    let unsubscribeFunctors = () => {};
    let unsubscribeEvents = () => {};

    // Local changes updates listener (for sandbox mode or instant UI refresh)
    const handleLocalUpdate = () => {
      setCategories(getLocalCategories());
      setFunctors(getLocalFunctors());
      setEvents(getLocalEvents());
    };
    window.addEventListener("categorybridge_local_update", handleLocalUpdate);

    // Safeguard timer: if auth takes too long, fall back to sandbox mode gracefully
    const safeguardTimeout = setTimeout(() => {
      setIsLocalSandbox(true);
      setLoading(false);
    }, 4500);

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      clearTimeout(safeguardTimeout);
      if (user) {
        setAuthUser(user);
        setIsLocalSandbox(false);
        console.log("User Authenticated. UID:", user.uid, "Anonymous:", user.isAnonymous);

        try {
          const userId = user.uid;

          // Multi-tenant migration: If user signs in with Google, and has local guest data,
          // copy current local items to Firestore if their Firestore path is empty!
          if (!user.isAnonymous) {
            try {
              const catSnap = await getDocs(collection(db, "users", userId, "categories"));
              if (catSnap.empty) {
                console.log("No data found in cloud. Syncing local Guest progress to Google account...");
                const batch = writeBatch(db);
                
                const localCats = getLocalCategories();
                for (const cat of localCats) {
                  batch.set(doc(db, "users", userId, "categories", cat.id), cat);
                }
                
                const localFuncs = getLocalFunctors();
                for (const func of localFuncs) {
                  batch.set(doc(db, "users", userId, "functors", func.id), func);
                }
                
                const localEvents = getLocalEvents();
                for (const ev of localEvents) {
                  const evId = ev.id || `event_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
                  batch.set(doc(db, "users", userId, "graph_events", evId), {
                    ...ev,
                    timestamp: Timestamp.now()
                  });
                }
                await batch.commit();
                console.log("Data migration to Google account cloud storage complete!");
              }
            } catch (migError) {
              console.warn("Could not auto-migrate local data to Cloud:", migError);
            }
          }

          // Unsubscribe from any previous listeners before attaching new ones
          unsubscribeCategories();
          unsubscribeFunctors();
          unsubscribeEvents();

          // 1. Listen to Categories
          const categoriesColRef = collection(db, "users", userId, "categories");
          unsubscribeCategories = onSnapshot(
            categoriesColRef,
            (snapshot) => {
              const list: Category[] = [];
              snapshot.forEach((doc) => {
                list.push(doc.data() as Category);
              });
              // Always persist in local storage as well for high fidelity offline mode
              if (list.length > 0) {
                setCategories(list);
                localStorage.setItem("categorybridge_local_categories", JSON.stringify(list));
              }
              setLoading(false);
            },
            (err) => {
              console.warn("Live Categories subcollection listener failed:", err);
              handleFirestoreError(err, OperationType.LIST, `users/${userId}/categories`);
              setIsLocalSandbox(true);
              setLoading(false);
            }
          );

          // 2. Listen to Functors
          const functorsColRef = collection(db, "users", userId, "functors");
          unsubscribeFunctors = onSnapshot(
            functorsColRef,
            (snapshot) => {
              const list: Functor[] = [];
              snapshot.forEach((doc) => {
                list.push(doc.data() as Functor);
              });
              if (list.length > 0) {
                setFunctors(list);
                localStorage.setItem("categorybridge_local_functors", JSON.stringify(list));
              }
              setLoading(false);
            },
            (err) => {
              console.warn("Live Functors subcollection listener failed:", err);
              handleFirestoreError(err, OperationType.LIST, `users/${userId}/functors`);
              setIsLocalSandbox(true);
              setLoading(false);
            }
          );

          // 3. Listen to Events
          const eventsColRef = collection(db, "users", userId, "graph_events");
          const eventsQuery = query(eventsColRef, orderBy("timestamp", "desc"), limit(30));
          unsubscribeEvents = onSnapshot(
            eventsQuery,
            (snapshot) => {
              const list: GraphEvent[] = [];
              snapshot.forEach((docSnap) => {
                list.push({ id: docSnap.id, ...docSnap.data() } as GraphEvent);
              });
              if (list.length > 0) {
                setEvents(list);
                localStorage.setItem("categorybridge_local_events", JSON.stringify(list));
              }
              setLoading(false);
            },
            (err) => {
              console.warn("Live Events subcollection listener failed:", err);
              // Fallback to local events silently, index may be building
            }
          );

        } catch (e: any) {
          console.warn("Error starting live user subcollection listeners:", e);
          setIsLocalSandbox(true);
          setLoading(false);
        }
      } else {
        // If not logged in at all, sign in anonymously by default (Guest Mode)
        console.log("No auth session found. Bootstrapping anonymous guest session...");
        signInAnonymously(auth)
          .then((creds) => {
            setAuthUser(creds.user);
            setIsLocalSandbox(false);
          })
          .catch((err) => {
            console.warn("Failed anonymous sign-in, falling back to pure Local Sandbox Mode:", err);
            setIsLocalSandbox(true);
            setLoading(false);
          });
      }
    });

    return () => {
      clearTimeout(safeguardTimeout);
      window.removeEventListener("categorybridge_local_update", handleLocalUpdate);
      unsubscribeAuth();
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
    isAuthenticated: !!authUser && !authUser.isAnonymous,
    isAnonymous: !!authUser && authUser.isAnonymous,
    isLocalSandbox,
    loginWithGoogle,
    logout,
    signInGuest
  };
}
