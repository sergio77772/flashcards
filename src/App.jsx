import { useState, useEffect } from "react";
import { auth, googleProvider, db } from "./firebase";
import { signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";
import { collection, query, where, getDocs, doc, setDoc, deleteDoc, getDoc, updateDoc } from "firebase/firestore";

const COLORS = [
  { bg: "#FF6B6B", light: "#FFE0E0", name: "Rojo" },
  { bg: "#4ECDC4", light: "#E0F7F6", name: "Verde Agua" },
  { bg: "#45B7D1", light: "#E0F4FA", name: "Celeste" },
  { bg: "#96CEB4", light: "#E8F5EE", name: "Verde" },
  { bg: "#FFEAA7", light: "#FFFBE6", name: "Amarillo" },
  { bg: "#DDA0DD", light: "#F8E8F8", name: "Violeta" },
  { bg: "#F0A500", light: "#FFF3CC", name: "Naranja" },
  { bg: "#74B9FF", light: "#E6F3FF", name: "Azul" },
];

const generateId = () => Math.random().toString(36).slice(2, 9);

export default function App() {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null); // Para guardar roles (ej: "admin", "user")
  const [authLoading, setAuthLoading] = useState(true);

  // Datos
  const [materias, setMaterias] = useState([]);
  const [allUsers, setAllUsers] = useState([]); // Array de usuarios para el admin panel
  const [loading, setLoading] = useState(false);
  
  // screens: home (materias) | materia (bolillas) | bolilla (cards) | study | addMateria | addBolilla | addCard | editCard | quiz | admin
  const [screen, setScreen] = useState("home"); 
  const [activeMateriaId, setActiveMateriaId] = useState(null);
  const [activeBolillaId, setActiveBolillaId] = useState(null);
  
  const [activeCardIdx, setActiveCardIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  
  const [newName, setNewName] = useState("");
  const [newColorIdx, setNewColorIdx] = useState(0);
  
  const [cardFront, setCardFront] = useState("");
  const [cardBack, setCardBack] = useState("");
  const [editingCardId, setEditingCardId] = useState(null);
  
  // SRS / Study Queue
  const [studyQueue, setStudyQueue] = useState([]);
  const [isStudyFinished, setIsStudyFinished] = useState(false);
  
  const [toast, setToast] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Quiz states
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [quizIdx, setQuizIdx] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);

  // Exam states
  const [examTimer, setExamTimer] = useState(0);
  const [examStartTime, setExamStartTime] = useState(null);
  const [examResults, setExamResults] = useState([]); // { correct: boolean, time: number }
  const [isExam, setIsExam] = useState(false); // Flag para diferenciar quiz de examen

  // Tour state
  const [tourIdx, setTourIdx] = useState(0);
  const [isTourOpen, setIsTourOpen] = useState(false);
  
  const tourSteps = [
    { title: "¡Bienvenido! 📚", msg: "Esta es tu base de conocimiento. Aquí puedes agrupar tus estudios por Materias." },
    { title: "Dashboard 📊", msg: "Aquí verás tus estadísticas: Racha 🔥, tarjetas Dominadas ✅ y tiempo total de estudio." },
    { title: "Estructura 📂", msg: "Materia > Bolilla > Flashcards. Esta jerarquía te ayuda a organizar programas complejos." },
    { title: "Modo Repaso (SRS) 🧠", msg: "Nuestro algoritmo de repetición espaciada te avisará qué tarjetas repasar hoy según tu memoria." },
    { title: "Modo Examen 📝", msg: "Mide tu velocidad y precisión con temporizador y sin ayudas. ¡Ideal para simular el parcial!" },
    { title: "Voz (TTS) 🔊", msg: "En el modo estudio, toca el icono del parlante para que la app te lea la pregunta o respuesta." }
  ];

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          // Guardar o leer usuario de Firestore para gestionar ROL (Admin/User)
          const userRef = doc(db, "users", currentUser.uid);
          const userSnap = await getDoc(userRef);
          if (!userSnap.exists()) {
            const newData = { 
              name: currentUser.displayName || "Usuario", 
              email: currentUser.email, 
              role: "user",
              streak: 0,
              lastStudyDate: null,
              totalStudyTime: 0
            };
            await setDoc(userRef, newData);
            setUserData(newData);
            console.log("Nuevo usuario creado en la colección 'users'", newData);
          } else {
            setUserData(userSnap.data());
          }
        } catch (error) {
          console.error("No se pudo iniciar la colección users (¿Quizás las Reglas de Firebase bloquean el acceso?):", error);
        }
        
        fetchData(currentUser.uid);
      } else {
        setMaterias([]);
        setUserData(null);
        setAuthLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    let interval;
    if (screen === "quiz" && isExam && !quizFinished) {
      interval = setInterval(() => {
        setExamTimer(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [screen, isExam, quizFinished]);

  const fetchData = async (uid) => {
    setLoading(true);
    setAuthLoading(false);
    try {
      const q = query(collection(db, "materias"), where("user_id", "==", uid));
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      
      const formatted = data.map(m => ({
        ...m,
        bolillas: (m.bolillas || []).map(b => ({
          ...b,
          cards: (b.cards || []).map(c => ({
            ...c,
            nextReview: c.nextReview || Date.now(),
            interval: c.interval || 0
          }))
        }))
      }));
      setMaterias(formatted);
    } catch (e) {
      console.error("Error fetching", e);
    }
    setLoading(false);
  };

  const loginGoogle = async () => {
    try { await signInWithPopup(auth, googleProvider); } catch (e) { showToast("Error al hacer login", "error"); }
  };
  const logout = async () => { await signOut(auth); };
  const showToast = (msg, type = "success") => { setToast({ msg, type }); setTimeout(() => setToast(null), 2000); };

  // --- ADMIN PANEL FLAGS ---
  const openAdmin = async () => {
    setScreen("admin");
    const snap = await getDocs(collection(db, "users"));
    setAllUsers(snap.docs.map(d => ({ uid: d.id, ...d.data() })));
  };

  const changeUserRole = async (uid, newRole) => {
    try {
      await updateDoc(doc(db, "users", uid), { role: newRole });
      setAllUsers(prev => prev.map(u => u.uid === uid ? { ...u, role: newRole } : u));
      if (user.uid === uid) setUserData(prev => ({ ...prev, role: newRole })); // Actualiza al admin actual
      showToast("Rol actualizado con éxito");
    } catch (e) {
      showToast("Error al actualizar rol", "error");
    }
  };

  // --- FIREBASE SYNC ---
  const syncMateria = async (updatedMateria) => {
    try { await setDoc(doc(db, "materias", updatedMateria.id), updatedMateria); } 
    catch (e) { console.error(e); showToast("Error subiendo datos", "error"); }
  };

  // --- MATERIAS ---
  const addMateria = () => {
    if (!newName.trim()) return;
    const newMateria = { id: generateId(), name: newName.trim(), colorIdx: newColorIdx, user_id: user.uid, bolillas: [] };
    setMaterias(prev => [...prev, newMateria]);
    setNewName(""); setNewColorIdx(0); setScreen("home");
    showToast("¡Materia creada!");
    syncMateria(newMateria);
  };

  const deleteMateria = async (id) => {
    setMaterias(prev => prev.filter(m => m.id !== id));
    setDeleteConfirm(null); setScreen("home");
    showToast("Materia eliminada", "error");
    await deleteDoc(doc(db, "materias", id));
  };

  // --- BOLILLAS ---
  const addBolilla = () => {
    if (!newName.trim()) return;
    const newBolilla = { id: generateId(), name: newName.trim(), cards: [] };
    const updatedMateria = { ...activeMateria, bolillas: [...(activeMateria.bolillas || []), newBolilla] };
    
    setMaterias(prev => prev.map(m => m.id === activeMateriaId ? updatedMateria : m));
    setNewName(""); setScreen("materia");
    showToast("¡Bolilla creada!");
    syncMateria(updatedMateria);
  };

  const deleteBolilla = (bolillaId) => {
    const updatedMateria = { ...activeMateria, bolillas: activeMateria.bolillas.filter(b => b.id !== bolillaId) };
    
    setMaterias(prev => prev.map(m => m.id === activeMateriaId ? updatedMateria : m));
    setDeleteConfirm(null);
    showToast("Bolilla eliminada", "error");
    syncMateria(updatedMateria);
  };

  // --- CARDS ---
  const addCard = () => {
    if (!cardFront.trim() || !cardBack.trim()) return;
    const newCard = { 
      id: generateId(), 
      front: cardFront.trim(), 
      back: cardBack.trim(),
      nextReview: Date.now(),
      interval: 0
    };
    const updatedMateria = {
      ...activeMateria, 
      bolillas: activeMateria.bolillas.map(b => b.id === activeBolillaId ? { ...b, cards: [...(b.cards || []), newCard] } : b)
    };

    setMaterias(prev => prev.map(m => m.id === activeMateriaId ? updatedMateria : m));
    setCardFront(""); setCardBack(""); setScreen("bolilla");
    showToast("Flashcard agregada!");
    syncMateria(updatedMateria);
  };

  const saveEditCard = () => {
    if (!cardFront.trim() || !cardBack.trim()) return;
    const updatedMateria = {
      ...activeMateria,
      bolillas: activeMateria.bolillas.map(b => b.id === activeBolillaId ? {
        ...b, cards: b.cards.map(c => c.id === editingCardId ? { ...c, front: cardFront.trim(), back: cardBack.trim() } : c)
      } : b)
    };

    setMaterias(prev => prev.map(m => m.id === activeMateriaId ? updatedMateria : m));
    setScreen("bolilla"); showToast("Flashcard actualizada!");
    syncMateria(updatedMateria);
    setCardFront(""); setCardBack(""); setEditingCardId(null);
  };

  const deleteCard = (cardId) => {
    const updatedMateria = {
      ...activeMateria,
      bolillas: activeMateria.bolillas.map(b => b.id === activeBolillaId ? { ...b, cards: b.cards.filter(c => c.id !== cardId) } : b)
    };

    setMaterias(prev => prev.map(m => m.id === activeMateriaId ? updatedMateria : m));
    setDeleteConfirm(null); showToast("Flashcard eliminada", "error");
    syncMateria(updatedMateria);
  };

  const updateStreakAndStats = async (secondsToAdd) => {
    if (!userData) return;
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const lastStr = userData.lastStudyDate;
    
    let newStreak = userData.streak || 0;
    if (!lastStr) {
      newStreak = 1;
    } else {
      const lastDate = new Date(lastStr);
      const diff = Math.floor((now - lastDate) / (1000 * 60 * 60 * 24));
      if (diff === 1) newStreak += 1; // Racha sigue
      else if (diff > 1) newStreak = 1; // Racha se rompió
    }

    const updated = {
      ...userData,
      streak: newStreak,
      lastStudyDate: todayStr,
      totalStudyTime: (userData.totalStudyTime || 0) + secondsToAdd
    };
    setUserData(updated);
    await updateDoc(doc(db, "users", user.uid), {
      streak: newStreak,
      lastStudyDate: todayStr,
      totalStudyTime: updated.totalStudyTime
    });
  };

  const setMateriaDeadline = async (date) => {
    const updatedMateria = { ...activeMateria, examDate: date };
    setMaterias(prev => prev.map(m => m.id === activeMateriaId ? updatedMateria : m));
    syncMateria(updatedMateria);
    showToast("Fecha de examen guardada");
  };

  // --- HELPERS ---
  const activeMateria = materias.find(m => m.id === activeMateriaId);
  const activeBolilla = activeMateria?.bolillas?.find(b => b.id === activeBolillaId);
  const color = activeMateria ? COLORS[activeMateria.colorIdx] || COLORS[0] : COLORS[0];
  const totalCards = materias.flatMap(m => m.bolillas || []).flatMap(b => b.cards || []).length;
  const masteredCardsCount = materias.flatMap(m => m.bolillas || []).flatMap(b => b.cards || []).filter(c => (c.interval||0) >= 15).length;

  const startStudy = () => {
    const now = Date.now();
    // Filtramos solo las que toca repasar (nextReview <= ahora)
    const dueCards = (activeBolilla.cards || []).filter(c => c.nextReview <= now);
    
    if (dueCards.length === 0) {
      showToast("¡Estás al día con esta bolilla!", "success");
      // Opcional: permitir estudiar todo igual
      setStudyQueue([...(activeBolilla.cards || [])]);
    } else {
      setStudyQueue([...dueCards].sort((a,b) => a.nextReview - b.nextReview));
    }
    
    setActiveCardIdx(0); 
    setFlipped(false); 
    setIsStudyFinished(false);
    setScreen("study");
  };

  const rateCard = (rating) => {
    const card = studyQueue[activeCardIdx];
    let newInterval = card.interval || 0;
    let nextReview = Date.now();

    if (rating === 0) { // No lo sabía
      newInterval = 0;
      nextReview = Date.now() + 10 * 1000; // 10 segundos para que reaparezca en la cola
    } else if (rating === 1) { // Dudé
      newInterval = 1; 
      nextReview = Date.now() + 24 * 60 * 60 * 1000; // 1 día
    } else if (rating === 2) { // Fácil
      newInterval = newInterval === 0 ? 1 : newInterval === 1 ? 4 : newInterval * 2;
      nextReview = Date.now() + newInterval * 24 * 60 * 60 * 1000;
    }

    const updatedCard = { ...card, interval: newInterval, nextReview };
    
    // Actualizar en base de datos
    const updatedMateria = {
      ...activeMateria,
      bolillas: activeMateria.bolillas.map(b => b.id === activeBolillaId ? {
        ...b, cards: b.cards.map(c => c.id === card.id ? updatedCard : c)
      } : b)
    };
    setMaterias(prev => prev.map(m => m.id === activeMateriaId ? updatedMateria : m));
    syncMateria(updatedMateria);

    // Lógica de navegación en la cola
    if (rating === 0) {
      // Si no lo sabía, la mandamos al final de la cola actual para que reaparezca
      const newQueue = [...studyQueue];
      newQueue.splice(activeCardIdx, 1);
      newQueue.push(updatedCard);
      setStudyQueue(newQueue);
      setFlipped(false);
      // No incrementamos idx porque el elemento actual fue removido/movido
    } else {
      if (activeCardIdx + 1 < studyQueue.length) {
        setFlipped(false);
        setTimeout(() => setActiveCardIdx(i => i + 1), 150);
      } else {
        finishStudySession();
      }
    }
  };

  const finishStudySession = () => {
    setIsStudyFinished(true);
    updateStreakAndStats(studyQueue.length * 10); // Estimado: 10s por tarjeta
  };

  // --- QUIZ ---
  const startQuiz = (scope = "materia") => {
    let targetCards = [];
    if (scope === "bolilla" && activeBolilla) {
      targetCards = activeBolilla.cards || [];
    } else if (scope === "materia" && activeMateria) {
      targetCards = (activeMateria.bolillas || []).flatMap(b => b.cards || []);
    } else { return; }

    if (targetCards.length < 4) { 
      showToast(`${scope === "materia" ? "Esta materia" : "Esta bolilla"} necesita al menos 4 flashcards para generar un examen.`, "error"); 
      return; 
    }

    const allCards = materias.flatMap(m => m.bolillas || []).flatMap(b => b.cards || []);
    
    const shuffled = [...targetCards].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 10);
    const qs = selected.map(fc => {
      const incorrectPool = allCards.filter(c => c.id !== fc.id);
      // Pescamos máximo 3 opciones incorrectas, pero si hay menos, no pasa nada (usamos .slice)
      const wrongAnswers = [...incorrectPool].sort(() => 0.5 - Math.random()).slice(0, 3).map(c => c.back);
      return { question: fc.front, correctAnswer: fc.back, options: [...new Set([...wrongAnswers, fc.back])].sort(() => 0.5 - Math.random()) };
    });
    setQuizQuestions(qs); setQuizIdx(0); setQuizScore(0); setQuizFinished(false); setSelectedAnswer(null); setScreen("quiz");
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };


  const handleQuizAnswer = (ans) => {
    if (selectedAnswer !== null) return;
    
    const isCorrect = ans === quizQuestions[quizIdx].correctAnswer;
    
    if (isExam) {
      // Modo Examen: Sin feedback inmediato, guardamos resultado y pasamos rápido
      setQuizScore(s => isCorrect ? s + 1 : s);
      if (quizIdx + 1 < quizQuestions.length) {
        setQuizIdx(i => i + 1);
      } else {
        setQuizFinished(true);
        updateStreakAndStats(isExam ? examTimer : quizQuestions.length * 5); // Guardar tiempo real si es examen
      }
    } else {
      // Modo Quiz normal: Feedback visual
      setSelectedAnswer(ans);
      if (isCorrect) setQuizScore(s => s + 1);
      setTimeout(() => {
        if (quizIdx + 1 < quizQuestions.length) { 
          setQuizIdx(i => i + 1); 
          setSelectedAnswer(null); 
        } else { 
          setQuizFinished(true); 
          updateStreakAndStats(quizQuestions.length * 10);
        }
      }, 1200);
    }
  };

  const startExam = (scope = "materia") => {
    setIsExam(true);
    setExamTimer(0);
    setExamStartTime(Date.now());
    startQuiz(scope);
  };

  // --- TEXT TO SPEECH (TTS) ---
  const speakText = (text) => {
    if (!window.speechSynthesis) {
      showToast("Tu navegador no soporta lectura por voz", "error");
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "es-ES"; // Español
    utterance.rate = 0.95; // Un poco más lento para que sea más claro
    window.speechSynthesis.speak(utterance);
  };

  if (authLoading) return <div style={{...styles.root, display:"flex", alignItems:"center", justifyContent:"center", color:"#fff"}}>Cargando sesión...</div>;
  if (!user) return (
    <div style={{ ...styles.root, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Sora', sans-serif;}
        .btn-google { display: flex; align-items: center; justify-content: center; gap: 12px; background: #fff; color: #111; padding: 16px 24px; border-radius: 16px; font-weight: 700; font-size: 16px; cursor: pointer; border: none; width: 100%; transition: transform 0.2s; box-shadow: 0 4px 14px rgba(0,0,0,0.1); }
        .btn-google:active { transform: scale(0.95); }
      `}</style>
      <div style={{ fontSize: 64, marginBottom: 16 }}>⚡</div>
      <h1 style={{ color: "#fff", fontSize: 28, fontWeight: 800, marginBottom: 8 }}>Mis Bolillas</h1>
      <p style={{ color: "#aaa", fontSize: 14, textAlign: "center", marginBottom: 40 }}>Inicia sesión para guardar tu conocimiento en la nube.</p>
      <button className="btn-google" onClick={loginGoogle}>
         <svg width="24" height="24" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.7 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>
         Ingresar con Google
      </button>
    </div>
  );

  return (
    <div style={styles.root}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; -webkit-tap-highlight-color: transparent; }
        body { background: #0f0f0f; } .card-flip { perspective: 900px; }
        .card-inner { transition: transform 0.5s cubic-bezier(.4,2,.3,1); transform-style: preserve-3d; position: relative; }
        .card-inner.flipped { transform: rotateY(180deg); }
        .card-face { backface-visibility: hidden; position: absolute; top:0; left:0; width:100%; height:100%; border-radius: 32px; padding: 24px; overflow-wrap: break-word; word-break: break-word; overflow-y: auto; scrollbar-width: none; }
        .card-face::-webkit-scrollbar { display: none; }
        .card-back-face { transform: rotateY(180deg); }
        .btn-bounce { transition: transform 0.2s, opacity 0.2s; }
        .btn-bounce:active { transform: scale(0.93); }
        input, textarea, select { outline: none; font-family: 'DM Sans', sans-serif; }
        ::-webkit-scrollbar { display: none; }
        .list-item:active { transform: scale(0.97); }
        .toast-in { animation: toastIn .3s cubic-bezier(.4,2,.3,1) forwards; }
        @keyframes toastIn { from { opacity:0; transform: translateX(-50%) translateY(20px);} to {opacity:1; transform:translateX(-50%) translateY(0);} }
        @keyframes flipInfinite { 0% { transform: perspective(400px) rotateY(0deg); background: #4ECDC4; } 50% { transform: perspective(400px) rotateY(180deg); background: #FF6B6B; } 100% { transform: perspective(400px) rotateY(360deg); background: #4ECDC4; } }
        .loader-card { width: 50px; height: 65px; border-radius: 10px; animation: flipInfinite 1.5s infinite ease-in-out; margin-bottom: 20px; box-shadow: 0 8px 20px rgba(0,0,0,0.15); }
        .loading-dots:after { content: '.'; animation: dots 1.5s steps(5, end) infinite; }
        @keyframes dots { 0%, 20% { content: '.'; } 40% { content: '..'; } 60% { content: '...'; } 80%, 100% { content: ''; } }
      `}</style>
      {/* TOUR MODAL */}
      {isTourOpen && (
        <div style={styles.modalOverlay} onClick={() => setIsTourOpen(false)}>
           <div style={{...styles.modal, background: "#fff", color: "#111"}} onClick={e => e.stopPropagation()}>
              <div style={{...styles.modalTitle, color: "#111"}}>{tourSteps[tourIdx].title}</div>
              <div style={{...styles.modalSub, color: "#666", marginTop: 12, fontSize: 16, lineHeight: 1.5}}>{tourSteps[tourIdx].msg}</div>
              <div style={{display: "flex", gap: 12, marginTop: 32}}>
                <button style={{...styles.modalBtn, background: "#f0f0f0", color: "#666"}} onClick={() => setIsTourOpen(false)}>Cerrar</button>
                <button style={{...styles.modalBtn, background: "#111", color: "#fff"}} onClick={() => {
                   if (tourIdx + 1 < tourSteps.length) setTourIdx(i => i + 1);
                   else setIsTourOpen(false);
                }}>
                   {tourIdx + 1 < tourSteps.length ? "Siguiente ›" : "¡Entendido!"}
                </button>
              </div>
           </div>
        </div>
      )}

      {toast && <div className="toast-in" style={{...styles.toast, background: toast.type==="error"?"#FF6B6B":"#4ECDC4"}}>{toast.msg}</div>}

      {deleteConfirm && (
        <div style={styles.modalOverlay} onClick={() => setDeleteConfirm(null)}>
          <div style={styles.modal} onClick={e => e.stopPropagation()}>
            <div style={styles.modalTitle}>¿Eliminar?</div>
            <div style={styles.modalSub}>Esta acción no se puede deshacer.</div>
            <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
              <button style={{ ...styles.modalBtn, background: "#222" }} onClick={() => setDeleteConfirm(null)}>Cancelar</button>
              <button style={{ ...styles.modalBtn, background: "#FF6B6B" }}
                onClick={() => {
                  if(deleteConfirm.type === "materia") deleteMateria(deleteConfirm.id);
                  else if(deleteConfirm.type === "bolilla") deleteBolilla(deleteConfirm.id);
                  else deleteCard(deleteConfirm.id);
                }}>Eliminar</button>
            </div>
          </div>
        </div>
      )}

      {/* HOME: LIST OF MATERIAS */}
      {screen === "home" && (
        <div style={styles.screen}>
          <div style={styles.header}>
            <div style={{ flex: 1 }}>
              <div style={styles.headerTitle}>Hola {userData?.name?.split(" ")[0] || "..."} <span style={{fontSize: 20}}>🔥 {userData?.streak || 0}</span></div>
              <div style={styles.headerSub}>{loading ? "Sincronizando..." : `${materias.length} materias`}</div>
            </div>
            <button className="btn-bounce" style={{...styles.studyBtn, background: "rgba(255,255,255,0.2)", border: "1px solid rgba(0,0,0,0.1)", color: "#333", marginRight: 8}} onClick={() => { setTourIdx(0); setIsTourOpen(true); }}>💡 Tour</button>
            {userData?.role === "admin" && (
               <button className="btn-bounce" style={{...styles.studyBtn, background: "#74B9FF", marginRight: 8, color: "#111"}} onClick={openAdmin}>🛠 Admin</button>
            )}
            <button className="btn-bounce" style={{...styles.studyBtn, background: "rgba(0,0,0,0.8)"}} onClick={logout}>Salir</button>
          </div>

          {/* QUICK STATS BAR */}
          <div style={{ display: "flex", gap: 12, padding: "0 24px", marginBottom: 20 }}>
            <div style={{...styles.bolillaCardBase, flex: 1, padding: 12, textAlign: "center", background: "#fff"}}>
               <div style={{fontSize: 20, fontWeight: 800}}>{masteredCardsCount}</div>
               <div style={{fontSize: 10, color: "#888", textTransform: "uppercase"}}>Dominadas</div>
            </div>
            <div style={{...styles.bolillaCardBase, flex: 1, padding: 12, textAlign: "center", background: "#fff"}}>
               <div style={{fontSize: 20, fontWeight: 800}}>{Math.round((userData?.totalStudyTime||0)/60)}</div>
               <div style={{fontSize: 10, color: "#888", textTransform: "uppercase"}}>Minutos</div>
            </div>
            <div style={{...styles.bolillaCardBase, flex: 1, padding: 12, textAlign: "center", background: "#fff"}}>
               <div style={{fontSize: 20, fontWeight: 800}}>{totalCards}</div>
               <div style={{fontSize: 10, color: "#888", textTransform: "uppercase"}}>Total Cards</div>
            </div>
          </div>
          
          <div style={{ padding: "0 24px", marginBottom: 16 }}>
             <button className="btn-bounce" style={{...styles.primaryBtn, background: "#111"}} onClick={() => {setNewName(""); setScreen("addMateria");}}>+ Crear Materia</button>
          </div>

          {loading ? (
             <div style={styles.emptyState}>
              <div className="loader-card"></div>
              <div style={{...styles.emptyTitle, fontSize: 15, color: "#555"}}>Sincronizando neuronas<span className="loading-dots"></span></div>
             </div>
          ) : materias.length === 0 ? (
            <div style={styles.emptyState}>
              <div style={{ fontSize: 46 }}>📚</div>
              <div style={styles.emptyTitle}>Sin materias</div>
              <div style={styles.emptySub}>Crea una materia académica para agrupar tus temas.</div>
            </div>
          ) : (
             <div style={styles.list}>
              {materias.map((m) => {
                const c = COLORS[m.colorIdx] || COLORS[0];
                return (
                  <div key={m.id} className="list-item" style={{ ...styles.materiaCard, background: c.light, borderLeft: `6px solid ${c.bg}` }}
                    onClick={() => { setActiveMateriaId(m.id); setScreen("materia"); }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                      <div style={{ ...styles.dot, background: c.bg }}><span style={{color:"#fff", fontSize: 18, fontWeight:"bold"}}>{m.name[0]?.toUpperCase()}</span></div>
                      <div>
                        <div style={styles.itemName}>{m.name}</div>
                        <div style={styles.itemSub}>{(m.bolillas||[]).length} bolillas</div>
                      </div>
                    </div>
                    <div style={styles.arrow}>›</div>
                  </div>
                );
              })}
             </div>
          )}
        </div>
      )}

      {/* ADMIN SCREEN */}
      {screen === "admin" && (
        <div style={styles.screen}>
          <div style={{ ...styles.materiaHeader, background: "#111" }}>
            <button style={styles.backBtnLight} onClick={() => setScreen("home")}>‹</button>
            <div style={styles.headerTitleLight}>Panel de Administración</div>
            <div style={{width: 36}} />
          </div>
          <div style={{ padding: "24px 20px" }}>
             <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Gestión de Usuarios</div>
             {allUsers.length === 0 ? <div style={{textAlign: "center", color: "#888"}}>Cargando usuarios...</div> : (
               allUsers.map(u => (
                 <div key={u.uid} style={{ background: "#fff", padding: 16, borderRadius: 16, marginBottom: 12, border: "1px solid #ebebeb", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                   <div>
                     <div style={{ fontWeight: 700, fontSize: 14, color: "#111" }}>{u.name}</div>
                     <div style={{ fontSize: 12, color: "#888" }}>{u.email}</div>
                   </div>
                   <select 
                     style={{ padding: "8px 12px", borderRadius: 8, background: u.role==="admin"?"#E6F3FF":"#f0f0f0", color: u.role==="admin"?"#0066cc":"#111", border: "none", fontWeight: 600, cursor: "pointer" }}
                     value={u.role || "user"} 
                     onChange={(e) => changeUserRole(u.uid, e.target.value)}
                   >
                     <option value="user">Usuario</option>
                     <option value="admin">Administrador</option>
                   </select>
                 </div>
               ))
             )}
          </div>
        </div>
      )}

      {/* MATERIA DETAIL: LIST OF BOLILLAS */}
      {screen === "materia" && activeMateria && (
        <div style={styles.screen}>
          <div style={{ ...styles.materiaHeader, background: color.bg }}>
            <button style={styles.backBtnLight} onClick={() => setScreen("home")}>‹</button>
            <div style={styles.headerTitleLight}>{activeMateria.name}</div>
            <button style={styles.deleteBtnHeader} onClick={() => setDeleteConfirm({ type: "materia", id: activeMateriaId })}>🗑</button>
          </div>
          
          <div style={{ ...styles.statsBar, background: color.light }}>
            <div style={styles.stat}><span style={{ ...styles.statNum, color: color.bg }}>{(activeMateria.bolillas||[]).length}</span><span style={styles.statLabel}>bolillas</span></div>
            <div style={{ textAlign: "right" }}>
               <div style={{ fontSize: 11, fontWeight: 700, color: color.bg }}>DÍA DE EXAMEN:</div>
               <input 
                 type="date" 
                 value={activeMateria.examDate || ""} 
                 style={{ background: "transparent", border: "none", fontSize: 13, fontWeight: 600, color: "#333", textAlign: "right" }}
                 onChange={(e) => setMateriaDeadline(e.target.value)}
               />
            </div>
          </div>

          <div style={{ padding: "16px 20px", display: "flex", gap: 12 }}>
            <button className="btn-bounce" style={{...styles.primaryBtn, flex: 2, padding: "14px 8px", background: color.bg}} onClick={() => {setNewName(""); setScreen("addBolilla");}}>+ Añadir Bolilla</button>
            <button className="btn-bounce" style={{...styles.primaryBtn, flex: 1, padding: "14px 8px", background: "#4ECDC4", color:"#111"}} onClick={() => { setIsExam(false); startQuiz("materia"); }}>🧠 Test</button>
            <button className="btn-bounce" style={{...styles.primaryBtn, flex: 1, padding: "14px 8px", background: "#111", color:"#fff"}} onClick={() => startExam("materia")}>📝 Exam</button>
          </div>

          <div style={styles.list}>
            {(!activeMateria.bolillas || activeMateria.bolillas.length === 0) ? (
              <div style={styles.emptyState}>
                <div style={{ fontSize: 48 }}>📖</div><div style={styles.emptyTitle}>Sin bolillas</div><div style={styles.emptySub}>Agrega la primera bolilla de estudio del programa.</div>
              </div>
            ) : (
              activeMateria.bolillas.map((b) => (
                <div key={b.id} className="list-item" style={styles.bolillaCardBase} onClick={() => { setActiveBolillaId(b.id); setScreen("bolilla"); }}>
                   <div style={styles.itemName}>{b.name}</div>
                   <div style={{display: "flex", gap: 8, alignItems:"center"}}>
                     <span style={styles.pill}>{(b.cards||[]).length} cards</span>
                     <div style={styles.arrow}>›</div>
                   </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* BOLILLA DETAIL: LIST OF CARDS */}
      {screen === "bolilla" && activeBolilla && (
        <div style={styles.screen}>
          <div style={{ ...styles.materiaHeader, background: "#111" }}>
             <button style={styles.backBtnLight} onClick={() => setScreen("materia")}>‹</button>
             <div style={styles.headerTitleLight}>{activeBolilla.name}</div>
             <button style={styles.deleteBtnHeader} onClick={() => setDeleteConfirm({ type: "bolilla", id: activeBolillaId })}>🗑</button>
          </div>

          <div style={{ padding: "16px 20px", display: "flex", justifyContent:"space-between", alignItems:"center"}}>
             <div style={{fontWeight: 700, fontSize: 18, color:"#333"}}>{(activeBolilla.cards||[]).length} tarjetas</div>
             <div style={{display: "flex", gap: 8}}>
               {(activeBolilla.cards||[]).length > 0 && 
                 <button className="btn-bounce" style={{...styles.studyBtn, background: "#4ECDC4", color: "#111", fontSize: 13}} onClick={() => { setIsExam(false); startQuiz("bolilla"); }}>🧠 Test</button>
               }
               {(activeBolilla.cards||[]).length > 0 && 
                 <button className="btn-bounce" style={{...styles.studyBtn, background: "#111", color: "#fff", fontSize: 13}} onClick={() => startExam("bolilla")}>📝 Exam</button>
               }
               {(activeBolilla.cards||[]).length > 0 && 
                 <button className="btn-bounce" style={{...styles.studyBtn, background: "#fff", color: "#111", fontSize: 13}} onClick={startStudy}>▶ Estudiar</button>
               }
             </div>
          </div>

          <div style={styles.list}>
            {(!activeBolilla.cards || activeBolilla.cards.length === 0) ? (
              <div style={styles.emptyState}>
                <div style={{ fontSize: 48 }}>🃏</div><div style={styles.emptyTitle}>Sin flashcards</div><div style={styles.emptySub}>Crea tus primeras tarjetas para estudiar esta bolilla.</div>
              </div>
            ) : (
              activeBolilla.cards.map((card, idx) => (
                <div key={card.id} className="list-item" style={styles.cardItemBody}>
                  <div style={{ flex: 1 }} onClick={() => { setEditingCardId(card.id); setCardFront(card.front); setCardBack(card.back); setScreen("editCard"); }}>
                    <div style={styles.cardFrontText}>❓ {card.front}</div><div style={styles.cardBackText}>💡 {card.back}</div>
                  </div>
                  <button style={styles.deleteCardBtn} onClick={() => setDeleteConfirm({ type: "card", id: card.id })}>×</button>
                </div>
              ))
            )}
          </div>
          <button className="btn-bounce" style={{ ...styles.fab, background: color.bg }} onClick={() => { setCardFront(""); setCardBack(""); setScreen("addCard"); }}>+</button>
        </div>
      )}

      {/* ADD FORMS (MATERIA / BOLILLA) */}
      {(screen === "addMateria" || screen === "addBolilla") && (
        <div style={styles.screen}>
          <div style={styles.topBar}>
            <button style={styles.backBtn} onClick={() => setScreen(screen==="addMateria" ? "home" : "materia")}>‹ Volver</button>
            <div style={styles.topTitle}>{screen === "addMateria" ? "Nueva Materia" : "Nueva Bolilla"}</div>
          </div>
          <div style={styles.formWrap}>
            <label style={styles.label}>Nombre</label>
            <input style={styles.input} placeholder={screen === "addMateria" ? "Ej: Anatomía" : "Ej: Sistema Digestivo"} value={newName}
              onChange={e => setNewName(e.target.value)} onKeyDown={e => e.key === "Enter" && (screen==="addMateria"?addMateria():addBolilla())} autoFocus />

            {screen === "addMateria" && (
              <>
                <label style={styles.label}>Color de la materia</label>
                <div style={styles.colorGrid}>
                  {COLORS.map((c, i) => (
                    <button key={i} className="btn-bounce" style={{ ...styles.colorDot, background: c.bg, border: newColorIdx === i ? "3px solid #fff" : "3px solid transparent", boxShadow: newColorIdx === i ? `0 0 0 3px ${c.bg}` : "none" }}
                      onClick={() => setNewColorIdx(i)} />
                  ))}
                </div>
              </>
            )}
            <button className="btn-bounce" style={{ ...styles.primaryBtn, background: newName.trim() ? (screen==="addMateria"?COLORS[newColorIdx].bg:color.bg) : "#333", marginTop: 24 }}
              onClick={screen==="addMateria"?addMateria:addBolilla} disabled={!newName.trim()}>
              {screen === "addMateria" ? "Crear Materia" : "Crear Bolilla"}
            </button>
          </div>
        </div>
      )}

      {/* ADD / EDIT CARD */}
      {(screen === "addCard" || screen === "editCard") && (
        <div style={styles.screen}>
          <div style={{ ...styles.topBar, background: "#fff" }}>
            <button style={styles.backBtn} onClick={() => { setScreen("bolilla"); setCardFront(""); setCardBack(""); setEditingCardId(null); }}>‹ Volver</button>
            <div style={styles.topTitle}>{screen === "addCard" ? "Nueva Flashcard" : "Editar Flashcard"}</div>
          </div>
          <div style={styles.formWrap}>
            <label style={styles.label}>Frente (pregunta)</label>
            <textarea style={styles.textarea} placeholder="¿Cuál es tu pregunta?" value={cardFront} onChange={e => setCardFront(e.target.value)} rows={3} autoFocus />
            <label style={{ ...styles.label, marginTop: 20 }}>Dorso (respuesta)</label>
            <textarea style={styles.textarea} placeholder="Escribe la respuesta..." value={cardBack} onChange={e => setCardBack(e.target.value)} rows={4} />
            <button className="btn-bounce" style={{ ...styles.primaryBtn, background: cardFront.trim() && cardBack.trim() ? color.bg : "#333", marginTop: 24 }}
              onClick={screen === "addCard" ? addCard : saveEditCard} disabled={!cardFront.trim() || !cardBack.trim()}>
              {screen === "addCard" ? "Crear Flashcard" : "Guardar Cambios"}
            </button>
          </div>
        </div>
      )}

      {/* QUIZ (MULTIPLE CHOICE) MODE */}
      {screen === "quiz" && (
        <div style={{ ...styles.screen, background: "#0f0f0f", color: "#fff" }}>
           <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "52px 24px 8px" }}>
             <button style={styles.studyBackBtn} onClick={() => { setScreen("home"); setSelectedAnswer(null); setIsExam(false); }}>✕</button>
             <div style={{fontSize: 15, fontWeight:700}}>{!quizFinished ? (isExam ? `Examen: ${quizIdx + 1}/${quizQuestions.length}` : `Test: ${quizIdx + 1}/${quizQuestions.length}`) : 'Resultados'}</div>
             {isExam && !quizFinished ? <div style={{background: "rgba(255,255,255,0.1)", padding: "4px 10px", borderRadius: 8, fontSize: 14, fontWeight: 700}}>{formatTime(examTimer)}</div> : <div style={{width: 36}}/>}
           </div>
           {!quizFinished ? (
             <div style={{ padding: 24, flex: 1, display: "flex", flexDirection: "column" }}>
               <div style={{ height: 6, background: "#333", borderRadius: 3, marginBottom: 32, overflow: "hidden" }}><div style={{ height: "100%", background: "#4ECDC4", width: `${(quizIdx / quizQuestions.length) * 100}%`, transition: 'width 0.3s' }} /></div>
               <div style={{ background: "#1a1a1a", padding: 24, borderRadius: 24, marginBottom: 24, flexShrink: 0 }}>
                 <div style={{ fontSize: 13, color: "#888", marginBottom: 12, fontWeight: 700, letterSpacing: 1 }}>ELIGE LA OPCIÓN CORRECTA</div>
                 <h2 style={{ fontSize: 22, fontWeight: 700 }}>{quizQuestions[quizIdx].question}</h2>
               </div>
               <div style={{ display: "flex", flexDirection: "column", gap: 12, flex: 1 }}>
                 {quizQuestions[quizIdx].options.map((opt, i) => {
                    const isSelected = selectedAnswer === opt;
                    const isCorrect = opt === quizQuestions[quizIdx].correctAnswer;
                    let bg = "#1a1a1a", bd = "#333", col = "#fff";
                    if (!isExam && selectedAnswer !== null) { if (isCorrect) { bg = "#E0F7F6"; bd = "#4ECDC4"; col = "#111"; } else if (isSelected) { bg = "#FFE0E0"; bd = "#FF6B6B"; col = "#111"; } } else if (isSelected) bd = "#fff";
                    return (
                      <button key={i} className="btn-bounce" onClick={() => handleQuizAnswer(opt)} style={{ background: bg, border: `2px solid ${bd}`, borderRadius: 20, padding: "20px 24px", color: col, fontSize: 15, fontWeight: 600, textAlign: "left", cursor: selectedAnswer !== null && !isExam ? "default" : "pointer" }}>{opt}</button>
                    )
                 })}
               </div>
             </div>
           ) : (
              <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24 }}>
                 <div style={{ fontSize: 72, marginBottom: 16 }}>{quizScore > quizQuestions.length / 2 ? '🏆' : '😅'}</div>
                 <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 8 }}>{isExam ? "Examen Finalizado" : "Test Completado"}</h1>
                 
                 <div style={{ background: "#1a1a1a", border: "1px solid #333", borderRadius: 24, padding: 24, width: "100%", marginBottom: 32 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
                       <span style={{ color: "#888" }}>Puntaje:</span>
                       <span style={{ fontWeight: 700, color: "#4ECDC4" }}>{Math.round((quizScore/quizQuestions.length)*100)}% ({quizScore}/{quizQuestions.length})</span>
                    </div>
                    {isExam && (
                      <>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
                           <span style={{ color: "#888" }}>Tiempo total:</span>
                           <span style={{ fontWeight: 700 }}>{formatTime(examTimer)}</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                           <span style={{ color: "#888" }}>Tiempo promedio:</span>
                           <span style={{ fontWeight: 700 }}>{Math.round(examTimer/quizQuestions.length)}s / preg</span>
                        </div>
                      </>
                    )}
                 </div>

                 <button className="btn-bounce" style={{...styles.primaryBtn, background: "#4ECDC4", color: "#111"}} onClick={() => isExam ? startExam() : startQuiz()}>Reiniciar</button>
                 <button className="btn-bounce" style={{...styles.primaryBtn, background: "transparent", color: "#fff", border: "2px solid #333", marginTop: 12}} onClick={() => { setScreen("home"); setIsExam(false); }}>Ir al inicio</button>
              </div>
            )}
        </div>
      )}

      {/* STUDY MODE (SRS) */}
      {screen === "study" && (
        <div style={{ ...styles.screen, background: "#111", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "52px 24px 8px" }}>
            <button style={styles.studyBackBtn} onClick={() => { setScreen("bolilla"); window.speechSynthesis?.cancel(); }}>✕</button>
            <div style={{fontSize:15, color:"#fff", fontWeight:700}}>{!isStudyFinished ? `${activeCardIdx + 1} / ${studyQueue.length}` : 'Progreso'}</div>
            {!isStudyFinished && (
              <button style={{ ...styles.studyBackBtn, fontSize: 22 }} onClick={(e) => { e.stopPropagation(); speakText(flipped ? studyQueue[activeCardIdx].back : studyQueue[activeCardIdx].front); }}>🔊</button>
            )}
          </div>

          {!isStudyFinished ? (
            <>
              <div style={{ padding: "0 24px" }}><div style={{ height: 4, background: "rgba(255,255,255,0.2)", borderRadius: 2 }}><div style={{ background: "#fff", height: "100%", width: `${((activeCardIdx + 1) / studyQueue.length) * 100}%` }} /></div></div>
              <div style={{ textAlign: "center", fontSize: 13, color: "rgba(255,255,255,0.6)", marginTop: 16 }}>{flipped ? "Califica tu recuerdo:" : "Tocá para ver la respuesta"}</div>
              
              <div className="card-flip" style={{ flex:1, padding: "20px 32px", display:"flex", alignItems:"center", justifyContent:"center" }} onClick={() => !flipped && setFlipped(true)}>
                <div style={{ width: "100%", height: "420px", position: "relative" }}>
                  <div className={`card-inner${flipped ? " flipped" : ""}`} style={{ width: "100%", height: "100%" }}>
                    
                    {/* FRONT FACE */}
                    <div className="card-face" style={{ 
                      background: "#fff", color:"#111", 
                      display: "flex", flexDirection: "column", 
                      justifyContent: "center", alignItems: "center", 
                      boxShadow: "0 10px 40px rgba(0,0,0,0.3)",
                      overflowY: "auto" 
                    }}>
                      <div style={{fontSize:24, fontWeight:800, textAlign:"center", padding:24, width:"100%", lineHeight: 1.4}}>{studyQueue[activeCardIdx].front}</div>
                    </div>
                    
                    {/* BACK FACE */}
                    <div className="card-face card-back-face" style={{ 
                      background: color.bg, color: "#fff", 
                      display: "flex", flexDirection: "column", 
                      justifyContent: "center", alignItems: "center", 
                      boxShadow: "0 10px 40px rgba(0,0,0,0.4)",
                      overflowY: "auto" 
                    }}>
                      <div style={{fontSize:22, fontWeight:600, textAlign:"center", padding:24, width:"100%", lineHeight: 1.5}}>{studyQueue[activeCardIdx].back}</div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div style={{ padding: "24px 24px 40px" }}>
                {!flipped ? (
                  <button className="btn-bounce" style={{width:"100%", background:"#fff", color:"#111", border:"none", borderRadius:20, padding:"20px", fontWeight:800, fontSize: 18}} onClick={() => setFlipped(true)}>👁 VER RESPUESTA</button>
                ) : (
                  <div style={{ display: "flex", gap: 12 }}>
                    <button className="btn-bounce" style={{flex:1, background:"#FF6B6B", color:"#fff", border:"none", borderRadius:16, padding:"16px 8px", fontWeight:700, fontSize:13}} onClick={() => rateCard(0)}>❌ No lo sabía</button>
                    <button className="btn-bounce" style={{flex:1, background:"#F0A500", color:"#fff", border:"none", borderRadius:16, padding:"16px 8px", fontWeight:700, fontSize:13}} onClick={() => rateCard(1)}>😐 Dudé</button>
                    <button className="btn-bounce" style={{flex:1, background:"#4ECDC4", color:"#fff", border:"none", borderRadius:16, padding:"16px 8px", fontWeight:700, fontSize:13}} onClick={() => rateCard(2)}>✅ Fácil</button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24 }}>
                <div style={{ fontSize: 72, marginBottom: 16 }}>🚀</div>
                <h1 style={{ color: "#fff", fontSize: 28, fontWeight: 800, marginBottom: 8, textAlign: "center" }}>¡Sesión Finalizada!</h1>
                <p style={{ color: "#aaa", fontSize: 15, marginBottom: 32, textAlign: "center" }}>Has revisado todas las tarjetas pendientes. Vuelve más tarde para que el algoritmo te las asigne nuevamente.</p>
                <button className="btn-bounce" style={{...styles.primaryBtn, background: color.bg}} onClick={() => setScreen("bolilla")}>Volver a la bolilla</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const styles = {
  root: { fontFamily: "'Sora', sans-serif", maxWidth: 430, margin: "0 auto", minHeight: "100dvh", background: "#0f0f0f", color: "#111", position: "relative", overflow: "hidden" },
  screen: { display: "flex", flexDirection: "column", minHeight: "100dvh", background: "#f7f7f5" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "52px 24px 20px" },
  headerTitle: { fontSize: 24, fontWeight: 800, color: "#111", letterSpacing: "-0.5px" },
  headerSub: { fontSize: 13, color: "#888", marginTop: 2 },
  list: { display: "flex", flexDirection: "column", gap: 12, padding: "8px 20px 120px", overflowY: "auto" },
  emptyState: { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10, padding: 40, textAlign: "center" },
  emptyTitle: { fontSize: 18, fontWeight: 700, color: "#333" },
  emptySub: { fontSize: 13, color: "#999" },
  topBar: { display: "flex", alignItems: "center", padding: "52px 20px 16px", gap: 12 },
  backBtn: { background: "none", border: "none", fontSize: 17, color: "#555", cursor: "pointer", fontWeight: 600, padding: "6px 0" },
  topTitle: { fontSize: 18, fontWeight: 700, color: "#111" },
  formWrap: { display: "flex", flexDirection: "column", padding: "8px 24px 40px", gap: 8 },
  label: { fontSize: 12, fontWeight: 600, color: "#888", letterSpacing: 1, textTransform: "uppercase" },
  input: { borderRadius: 14, border: "2px solid #e0e0e0", padding: "14px 16px", fontSize: 16, width: "100%" },
  textarea: { borderRadius: 14, border: "2px solid #e0e0e0", padding: "14px 16px", fontSize: 15, width: "100%", resize: "none" },
  colorGrid: { display: "flex", gap: 10, flexWrap: "wrap", marginTop: 4 },
  colorDot: { width: 38, height: 38, borderRadius: 12 },
  primaryBtn: { borderRadius: 16, border: "none", padding: "16px 24px", fontSize: 16, fontWeight: 700, color: "#fff", width: "100%" },
  materiaHeader: { display: "flex", alignItems: "center", padding: "52px 20px 20px", justifyContent: "space-between" },
  backBtnLight: { background: "rgba(255,255,255,0.2)", border: "none", borderRadius: 10, width: 36, height: 36, fontSize: 20, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center" },
  headerTitleLight: { fontSize: 20, fontWeight: 800, color: "#fff", flex: 1, textAlign: "center" },
  deleteBtnHeader: { background: "rgba(255,255,255,0.2)", color: "#fff", border: "none", borderRadius: 10, width: 36, height: 36, fontSize: 16 },
  statsBar: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 24px" },
  stat: { display: "flex", flexDirection: "column" }, statNum: { fontSize: 28, fontWeight: 800, lineHeight: 1 }, statLabel: { fontSize: 12, color: "#888" },
  materiaCard: { display: "flex", alignItems: "center", justifyContent: "space-between", borderRadius: 16, padding: "16px", cursor: "pointer" },
  bolillaCardBase: { display: "flex", alignItems: "center", justifyContent: "space-between", borderRadius: 16, background: "#fff", padding: "20px 16px", cursor: "pointer", border: "1px solid #ebebeb", boxShadow: "0 2px 8px rgba(0,0,0,0.03)" },
  dot: { width: 38, height: 38, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  itemName: { fontSize: 16, fontWeight: 700, color: "#111" }, itemSub: { fontSize: 12, color: "#666", marginTop: 2 },
  arrow: { fontSize: 22, color: "#bbb", fontWeight: 300 },
  pill: { background: "#f0f0f0", color:"#555", fontSize: 12, fontWeight: 600, padding: "4px 8px", borderRadius: 8 },
  studyBtn: { borderRadius: 12, border: "none", padding: "12px 16px", fontSize: 13, fontWeight: 700, color: "#fff" },
  cardItemBody: { display: "flex", alignItems: "center", background: "#fff", borderRadius: 16, padding: "16px", gap: 12, boxShadow: "0 1px 6px rgba(0,0,0,0.06)", overflow: "hidden" },
  cardFrontText: { fontSize: 14, fontWeight: 600, color: "#222", marginBottom: 6, wordBreak: "break-word" }, cardBackText: { fontSize: 13, color: "#666", wordBreak: "break-word" },
  deleteCardBtn: { background: "#FFE5E5", border: "none", borderRadius: 10, width: 30, height: 30, fontSize: 18, color: "#FF6B6B", cursor: "pointer" },
  fab: { position: "fixed", bottom: 32, right: 24, width: 60, height: 60, borderRadius: 20, border: "none", fontSize: 30, color: "#fff", cursor: "pointer", boxShadow: "0 8px 24px rgba(0,0,0,0.25)", display: "flex", alignItems: "center", justifyContent: "center" },
  toast: { position: "fixed", bottom: 100, left: "50%", transform: "translateX(-50%)", padding: "12px 24px", borderRadius: 14, color: "#fff", fontSize: 14, fontWeight: 700, zIndex: 999, whiteSpace: "nowrap", boxShadow: "0 4px 20px rgba(0,0,0,0.3)" },
  modalOverlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 998, display: "flex", alignItems: "flex-end", padding: 20 },
  modal: { background: "#1a1a1a", borderRadius: 24, padding: "32px 24px", width: "100%", maxWidth: 390, margin: "0 auto" },
  modalTitle: { fontSize: 20, fontWeight: 800, color: "#fff" }, modalSub: { fontSize: 14, color: "#888", marginTop: 8 },
  modalBtn: { flex: 1, borderRadius: 14, border: "none", padding: "14px", fontSize: 15, fontWeight: 700, color: "#fff" },
  studyBackBtn: { background: "rgba(255,255,255,0.2)", border: "none", borderRadius: 12, width: 36, height: 36, fontSize: 18, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center" },
};
