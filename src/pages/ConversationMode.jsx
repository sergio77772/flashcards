import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { COLORS } from "../constants";

export default function ConversationMode({
  materias, styles, convHistory, setConvHistory, convLoading, startConversation, answerConversation,
  userData
}) {
  const { materiaId, bolillaId } = useParams();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const scrollRef = useRef();
  const baseQueryRef = useRef("");

  const activeMateria = materias.find(m => m.id === materiaId);
  const activeBolilla = activeMateria?.bolillas?.find(b => b.id === bolillaId);
  const cards = activeBolilla?.cards || [];
  const color = COLORS[activeMateria?.colorIdx] || COLORS[0];

  useEffect(() => {
    if (cards.length > 0 && convHistory.length === 0) {
      startConversation(cards[0], userData?.name || "Alumno");
    }
  }, [cards, convHistory, userData]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [convHistory]);

  const handleSend = () => {
    if (!query.trim() || convLoading) return;
    const nextCard = cards[currentIdx + 1] || null;
    answerConversation(query, cards[currentIdx], nextCard);
    setQuery("");
    if (nextCard) setCurrentIdx(currentIdx + 1);
  };

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return alert("Tu navegador no soporta reconocimiento de voz. Usa Chrome para una mejor experiencia.");
    
    const recognition = new SpeechRecognition();
    recognition.lang = "es-ES";
    recognition.continuous = false;
    recognition.interimResults = true;

    baseQueryRef.current = query;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onresult = (event) => {
      let currentTrans = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        currentTrans += event.results[i][0].transcript;
      }
      
      const newText = baseQueryRef.current 
        ? baseQueryRef.current + " " + currentTrans
        : currentTrans;
        
      setQuery(newText);
    };

    recognition.onerror = (event) => {
      console.error("Speech Recognition Error", event.error);
      setIsListening(false);
    };

    recognition.start();
  };

  if (!activeBolilla) return <div style={{ color: "#fff", padding: 20 }}>No se encontró la bolilla</div>;

  return (
    <div style={{ ...styles.screen, background: "#0d0d18" }}>
      {/* Header */}
      <div style={{ padding: "52px 20px 20px", display: "flex", alignItems: "center", gap: 12, borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        <button style={styles.backBtnLight} onClick={() => { setConvHistory([]); navigate(-1); }}>‹</button>
        <div style={{ flex: 1 }}>
          <div style={{ ...styles.headerTitleLight, fontSize: 18 }}>Modo Conversación 🎙</div>
          <div style={{ fontSize: 11, color: "#5a5a7a", fontWeight: 600 }}>EXAMEN CON IA • {activeBolilla.name.toUpperCase()}</div>
        </div>
        <div style={{ background: "rgba(78,205,196,0.1)", color: "#4ecdc4", padding: "4px 10px", borderRadius: 8, fontSize: 11, fontWeight: 700 }}>
          {currentIdx + 1} / {cards.length}
        </div>
      </div>

      {/* Chat Area */}
      <div ref={scrollRef} style={{ flex: 1, padding: "20px", overflowY: "auto", display: "flex", flexDirection: "column", gap: 16 }}>
        {convHistory.map((m, i) => (
          <div key={i} style={{ 
            alignSelf: m.role === "ai" ? "flex-start" : "flex-end", 
            maxWidth: "85%", 
            background: m.role === "ai" ? "rgba(255,255,255,0.05)" : "linear-gradient(135deg, #7c6fff, #5a4fd4)",
            border: m.role === "ai" ? "1px solid rgba(124,111,255,0.15)" : "none",
            color: "#f0f0ff", 
            padding: "16px 20px", 
            borderRadius: m.role === "ai" ? "24px 24px 24px 6px" : "24px 24px 6px 24px", 
            fontSize: 14, 
            lineHeight: 1.7,
            boxShadow: m.role === "user" ? "0 10px 25px rgba(124,111,255,0.3)" : "none",
            animation: "fadeInUp 0.3s ease-out"
          }}>
            {m.role === "ai" && <div style={{ fontSize: 10, fontWeight: 800, color: "#7c6fff", marginBottom: 6, letterSpacing: 0.5 }}>PROFESOR IA</div>}
            {m.text}
          </div>
        ))}
        {convLoading && (
          <div style={{ alignSelf: "flex-start", padding: "14px 20px", background: "rgba(255,255,255,0.04)", borderRadius: "20px 20px 20px 4px", fontSize: 13, color: "#6a6a9a" }}>
            <span className="loading-dots">El profesor está pensando...</span>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div style={{ padding: "16px 20px 32px", background: "#0f0f1a", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <button 
            style={{ 
              width: 50, height: 50, borderRadius: 16, border: "none", 
              background: isListening ? "rgba(255,107,107,0.2)" : "rgba(124,111,255,0.1)", 
              color: isListening ? "#ff6b6b" : "#7c6fff", fontSize: 22, 
              cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
              animation: isListening ? "pulse 1.5s infinite" : "none"
            }}
            onClick={isListening ? null : startListening}
            title={isListening ? "Escuchando..." : "Hablar (Voice to Text)"}
          >
            {isListening ? "🔴" : "🎙"}
          </button>
          <input 
            style={{ 
              flex: 1, padding: "14px 20px", borderRadius: 18, border: "1.5px solid rgba(255,255,255,0.08)", 
              fontSize: 14, background: "rgba(255,255,255,0.05)", color: "#f0f0ff", outline: "none", 
              fontFamily: "'Plus Jakarta Sans', sans-serif" 
            }}
            placeholder="Escribe tu respuesta..." 
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSend()} 
          />
          <button 
            style={{ 
              width: 50, height: 50, borderRadius: 16, border: "none", 
              background: "linear-gradient(135deg, #7c6fff, #5a4fd4)", color: "#fff", 
              fontSize: 22, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 6px 15px rgba(124,111,255,0.3)"
            }}
            onClick={handleSend}
            disabled={convLoading || !query.trim()}
          >
            ›
          </button>
        </div>
      </div>
      <style>{`
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .loading-dots:after { content: '.'; animation: dots 1.5s steps(5, end) infinite; }
        @keyframes dots { 0%, 20% { content: ''; } 40% { content: '.'; } 60% { content: '..'; } 80%, 100% { content: '...'; } }
        @keyframes pulse { 0% { opacity: 1; transform: scale(1); } 50% { opacity: 0.6; transform: scale(1.1); } 100% { opacity: 1; transform: scale(1); } }
      `}</style>
    </div>
  );
}
