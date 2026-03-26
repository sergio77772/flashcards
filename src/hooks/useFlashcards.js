import { useState, useEffect } from "react";
import { auth, db } from "../firebase";
import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import {
  doc,
  setDoc,
  getDoc,
  onSnapshot,
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  deleteDoc,
  orderBy,
  limit,
} from "firebase/firestore";
import { generateId } from "../constants";

export function useFlashcards() {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [materias, setMaterias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(true);
  const [allUsers, setAllUsers] = useState([]);
  const [toast, setToast] = useState(null);
  const [debugLogs, setDebugLogs] = useState([]);

  // --- AUTH LOGIC ---
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, u => {
      setAuthLoading(true);
      setUser(u);
      if(!u) {
        setUserData(null);
        setMaterias([]);
      }
      setAuthLoading(false);
    });
    return unsub;
  }, []);

  // --- SYNC DATA ---
  useEffect(() => {
    if (!user) return;
    setLoading(true);

    // 1. Sync User Profile
    const unsubUser = onSnapshot(doc(db, "users", user.uid), async (snap) => {
      if (snap.exists()) {
        setUserData(snap.data());
      } else {
        const newData = {
          uid: user.uid,
          email: user.email,
          name: user.displayName,
          role: "user",
          streak: 0,
          lastStudy: null,
          mastered: 0,
        };
        await setDoc(doc(db, "users", user.uid), newData);
        setUserData(newData);
      }
    });

    // 2. Sync Materias Collection
    const q = query(
      collection(db, "materias"),
      where("userId", "==", user.uid),
    );
    const unsubMaterias = onSnapshot(q, (snap) => {
      setMaterias(snap.docs.map((d) => ({ ...d.data(), id: d.id })));
      setLoading(false);
    });

    return () => {
      unsubUser();
      unsubMaterias();
    };
  }, [user]);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const loginGoogle = () =>
    signInWithPopup(auth, new GoogleAuthProvider()).catch(() =>
      showToast("Error al iniciar sesión", "error"),
    );
  const logout = () => signOut(auth);

  const addMateria = async (newName, newColorIdx) => {
    if (!user) return;
    const mId = generateId();
    const mData = {
      name: newName,
      colorIdx: newColorIdx,
      bolillas: [],
      examDate: null,
      userId: user.uid,
    };
    try {
      await setDoc(doc(db, "materias", mId), mData);
      showToast("Materia creada");
    } catch (e) {
      showToast("Error al crear materia", "error");
    }
  };

  const deleteMateria = async (id) => {
    try {
      // Usar deleteDoc en lugar de setDoc con array filtrado
      const { deleteDoc } = await import("firebase/firestore");
      await deleteDoc(doc(db, "materias", id));
      showToast("Materia eliminada");
    } catch (e) {
      showToast("Error al eliminar", "error");
    }
  };

  const addBolilla = async (activeMateriaId, newName) => {
    const m = materias.find((m) => m.id === activeMateriaId);
    if (!m) return;
    const newBolilla = { id: generateId(), name: newName, cards: [] };
    try {
      await updateDoc(doc(db, "materias", activeMateriaId), {
        bolillas: [...(m.bolillas || []), newBolilla],
      });
      showToast("Bolilla agregada");
    } catch (e) {
      showToast("Error al agregar bolilla", "error");
    }
  };

  const deleteBolilla = async (activeMateriaId, id) => {
    const m = materias.find((m) => m.id === activeMateriaId);
    if (!m) return;
    try {
      await updateDoc(doc(db, "materias", activeMateriaId), {
        bolillas: (m.bolillas || []).filter((b) => b.id !== id),
      });
      showToast("Bolilla eliminada");
    } catch (e) {
      showToast("Error al eliminar bolilla", "error");
    }
  };

  const addCard = async (activeMateriaId, activeBolillaId, front, back) =>
    await addCards(activeMateriaId, activeBolillaId, [{ front, back }]);

  const addCards = async (activeMateriaId, activeBolillaId, newCardsList) => {
    const m = materias.find((m) => m.id === activeMateriaId);
    if (!m) return;
    const updatedBolillas = (m.bolillas || []).map((b) => {
      if (b.id === activeBolillaId) {
        const preparedCards = newCardsList.map(nc => ({
          id: generateId(),
          front: nc.front,
          back: nc.back,
          interval: 0,
          ease: 2.5,
          dueDate: Date.now(),
          nextReview: Date.now(),
        }));
        return {
          ...b,
          cards: [...(b.cards || []), ...preparedCards],
        };
      }
      return b;
    });
    try {
      await updateDoc(doc(db, "materias", activeMateriaId), {
        bolillas: updatedBolillas,
      });
      showToast(`${newCardsList.length} tarjetas agregadas`);
    } catch (e) {
      showToast("Error al agregar tarjetas", "error");
    }
  };

  const saveEditCard = async (
    activeMateriaId,
    activeBolillaId,
    editingCardId,
    front,
    back,
  ) => {
    const m = materias.find((m) => m.id === activeMateriaId);
    if (!m) return;
    const updatedBolillas = m.bolillas.map((b) => {
      if (b.id === activeBolillaId) {
        return {
          ...b,
          cards: b.cards.map((c) =>
            c.id === editingCardId ? { ...c, front, back } : c,
          ),
        };
      }
      return b;
    });
    try {
      await updateDoc(doc(db, "materias", activeMateriaId), {
        bolillas: updatedBolillas,
      });
      showToast("Tarjeta actualizada");
    } catch (e) {
      showToast("Error al guardar cambios", "error");
    }
  };

  const deleteCard = async (activeMateriaId, activeBolillaId, id) => {
    const m = materias.find((m) => m.id === activeMateriaId);
    if (!m) return;
    const updatedBolillas = m.bolillas.map((b) => {
      if (b.id === activeBolillaId) {
        return { ...b, cards: b.cards.filter((c) => c.id !== id) };
      }
      return b;
    });
    try {
      await updateDoc(doc(db, "materias", activeMateriaId), {
        bolillas: updatedBolillas,
      });
      showToast("Tarjeta eliminada");
    } catch (e) {
      showToast("Error al eliminar tarjeta", "error");
    }
  };

  const rateCard = async (
    activeMateriaId,
    activeBolillaId,
    cardId,
    quality,
    updateStudyStats,
  ) => {
    const m = materias.find((m) => m.id === activeMateriaId);
    if (!m) return;
    const updatedBolillas = m.bolillas.map((b) => {
      if (b.id === activeBolillaId) {
        return {
          ...b,
          cards: b.cards.map((c) => {
            if (c.id === cardId) {
              let { interval, ease } = c;
              if (quality >= 1) {
                if (interval === 0) interval = 1;
                else if (interval === 1) interval = 6;
                else interval = Math.round(interval * ease);
                ease = Math.max(
                  1.3,
                  ease + (0.1 - (3 - quality) * (0.08 + (3 - quality) * 0.02)),
                );
              } else {
                interval = 0;
                ease = Math.max(1.3, ease - 0.2);
              }
              const nextDate = Date.now() + interval * 86400000;
              return {
                ...c,
                interval,
                ease,
                dueDate: nextDate,
                nextReview: nextDate,
              };
            }
            return c;
          }),
        };
      }
      return b;
    });
    try {
      await updateDoc(doc(db, "materias", activeMateriaId), {
        bolillas: updatedBolillas,
      });
      updateStudyStats();
    } catch (e) {
      showToast("Error al calificar tarjeta", "error");
    }
  };

  const setMateriaDeadline = async (activeMateriaId, dateStr) => {
    try {
      await updateDoc(doc(db, "materias", activeMateriaId), {
        examDate: dateStr,
      });
    } catch (e) {
      showToast("Error al actualizar fecha", "error");
    }
  };

  const updateStudyStats = async () => {
    if (!user || !userData) return;
    const now = new Date();
    const todayStr = now.toDateString();
    let { streak, lastStudy } = userData;
    if (lastStudy !== todayStr) {
      if (
        lastStudy === new Date(now.setDate(now.getDate() - 1)).toDateString()
      ) {
        streak++;
      } else if (lastStudy !== todayStr) {
        streak = 1;
      }
      lastStudy = todayStr;
      const allC = materias.flatMap((m) => (m.bolillas || []).flatMap((b) => b.cards || []));
      const mastered = allC.filter((c) => (c.interval || 0) >= 15).length;
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, { lastStudy, streak, mastered });
      setUserData({ ...userData, lastStudy, streak, mastered });
    }
  };

  const openAdmin = async () => {
    const q = query(collection(db, "users"));
    const snap = await getDocs(q);
    setAllUsers(snap.docs.map((d) => d.data()));
  };

  const changeUserRole = async (uid, newRole) => {
    await updateDoc(doc(db, "users", uid), { role: newRole });
    setAllUsers(allUsers.map((u) => (u.uid === uid ? { ...u, role: newRole } : u)));
    showToast("Rol actualizado");
  };

  const fetchDebugLogs = async () => {
    const q = query(collection(db, "debug_logs"), orderBy("timestamp", "desc"), limit(50));
    const snap = await getDocs(q);
    setDebugLogs(snap.docs.map(d => ({ ...d.data(), id: d.id })));
  };

  return {
    user,
    userData,
    materias,
    loading,
    authLoading,
    allUsers,
    toast,
    setToast,
    showToast,
    loginGoogle,
    logout,
    addMateria,
    deleteMateria,
    addBolilla,
    deleteBolilla,
    addCard,
    addCards,
    saveEditCard,
    deleteCard,
    rateCard,
    setMateriaDeadline,
    updateStudyStats,
    openAdmin,
    changeUserRole,
    setUserData,
    debugLogs,
    fetchDebugLogs,
  };
}
