import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

export default function BattleMode({ materias, generateBossBattle, styles, trackActivity, addXp }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [bossHp, setBossHp] = useState(100);
  const [userHp, setUserHp] = useState(3);
  const [timeLeft, setTimeLeft] = useState(15);
  const [battleState, setBattleState] = useState("setup"); // setup, active, won, lost
  const [options, setOptions] = useState([]);
  const [selectedOption, setSelectedOption] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [selectedMateriaId, setSelectedMateriaId] = useState("all");
  const [selectedBolillaId, setSelectedBolillaId] = useState("all");
  const timerRef = useRef(null);

  const startBattle = async () => {
    let targetMaterias = selectedMateriaId === "all" ? materias : materias.filter(m => m.id === selectedMateriaId);
    let allCards = [];
    
    targetMaterias.forEach(m => {
      const targetBolillas = selectedBolillaId === "all" ? (m.bolillas || []) : (m.bolillas || []).filter(b => b.id === selectedBolillaId);
      targetBolillas.forEach(b => {
        if (b.cards) allCards.push(...b.cards);
      });
    });

    if (allCards.length === 0) {
      alert("No hay suficientes tarjetas en esta selección para luchar.");
      return;
    }

    setLoading(true);
    setBossHp(100);
    setUserHp(3);
    setCurrentIdx(0);
    setFeedback(null);
    setSelectedOption(null);
    setBattleState("active");

    const sample = [...allCards].sort(() => 0.5 - Math.random()).slice(0, 20);
    const contentStr = sample.map(c => `P: ${c.front} | R: ${c.back}`).join("\n");
    
    trackActivity("start_boss_battle", `materia:${selectedMateriaId},bolilla:${selectedBolillaId}`);
    const generated = await generateBossBattle(contentStr);
    
    if (generated && generated.length > 0) {
      setQuestions(generated);
      shuffleOptions(generated[0]);
    } else {
      setBattleState("setup");
      alert("La IA falló al crear el Jefe, intenta de nuevo.");
    }
    setLoading(false);
  };

  const shuffleOptions = (qObj) => {
    if (!qObj) return;
    const correctVal = qObj.options[qObj.correctIndex];
    let shuffledArray = [...qObj.options].sort(() => 0.5 - Math.random());
    setOptions(shuffledArray);
    setSelectedOption(null);
    setFeedback(null);
    setTimeLeft(15);
    
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleTimeout = () => {
    clearInterval(timerRef.current);
    handleDamage("user", 1);
    setFeedback("¡Demasiado lento! El jefe te atacó.");
    setTimeout(nextTurn, 2000);
  };

  const handleAnswer = (option) => {
    if (selectedOption || battleState !== "active") return;
    clearInterval(timerRef.current);
    setSelectedOption(option);
    
    const currentQ = questions[currentIdx];
    const isCorrect = option === currentQ.options[currentQ.correctIndex];
    
    if (isCorrect) {
      const isFast = timeLeft > 7;
      setFeedback(isFast ? "¡GOLPE CRÍTICO!" : "¡Ataque exitoso!");
      handleDamage("boss", isFast ? 30 : 20);
    } else {
      setFeedback("¡Fallaste! El jefe te atacó.");
      handleDamage("user", 1);
    }
    
    setTimeout(nextTurn, 2000);
  };

  const handleDamage = (target, amount) => {
    if (target === "boss") {
      setBossHp(prev => Math.max(0, prev - amount));
    } else {
      setUserHp(prev => Math.max(0, prev - amount));
    }
  };

  const nextTurn = () => {
    // Check win/lose conditions
    setBossHp(currBoss => {
      setUserHp(currUser => {
        if (currBoss === 0) {
          setBattleState("won");
          addXp(150); // Big reward!
          trackActivity("win_boss_battle", "");
          return currUser;
        }
        if (currUser === 0) {
          setBattleState("lost");
          trackActivity("lose_boss_battle", "");
          return 0;
        }
        
        // Progress to next question or recycle
        const nextIdx = currentIdx + 1 < questions.length ? currentIdx + 1 : 0;
        setCurrentIdx(nextIdx);
        shuffleOptions(questions[nextIdx]);
        
        return currUser;
      });
      return currBoss;
    });
  };

  useEffect(() => {
    return () => clearInterval(timerRef.current);
  }, []);

  const currentQ = questions[currentIdx];

  return (
    <div style={{ ...styles.screen, background: "#080812", color: "#fff" }}>
      <div style={{ padding: "52px 20px 20px", display: "flex", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        <button style={styles.backBtnLight} onClick={() => { clearInterval(timerRef.current); navigate(-1); }}>‹</button>
        <div style={styles.headerTitleLight}>⚔️ Batalla vs IA</div>
      </div>

      <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: 20, flex: 1, overflowY: "auto" }}>
        
        {battleState === "setup" && (
          <div style={{ textAlign: "center", marginTop: 40, animation: "fadeIn 0.5s" }}>
            <div style={{ fontSize: 80, marginBottom: 20 }}>🧠⚡</div>
            <h2 style={{ fontSize: 24, fontWeight: 900, marginBottom: 10 }}>Reto contra la IA</h2>
            <p style={{ color: "#a0a0c0", marginBottom: 30, lineHeight: 1.6, padding: "0 20px" }}>
              La IA elegirá conceptos al azar de todas tus materias y actuará como un "Jefe Final". Tienes límite de tiempo. Cuanto más rápido y preciso respondas, más daño harás.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 30, padding: "0 20px" }}>
              <select 
                style={{ ...styles.inputField, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", cursor: "pointer", appearance: "none" }}
                value={selectedMateriaId}
                onChange={(e) => { setSelectedMateriaId(e.target.value); setSelectedBolillaId("all"); }}
              >
                <option value="all" style={{ color: "#000" }}>📚 Todas las Materias</option>
                {materias.map(m => <option key={m.id} value={m.id} style={{ color: "#000" }}>{m.name}</option>)}
              </select>

              {selectedMateriaId !== "all" && (
                <select 
                  style={{ ...styles.inputField, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", cursor: "pointer", appearance: "none" }}
                  value={selectedBolillaId}
                  onChange={(e) => setSelectedBolillaId(e.target.value)}
                >
                  <option value="all" style={{ color: "#000" }}>📑 Todas las Bolillas</option>
                  {(materias.find(m => m.id === selectedMateriaId)?.bolillas || []).map(b => (
                    <option key={b.id} value={b.id} style={{ color: "#000" }}>{b.name}</option>
                  ))}
                </select>
              )}
            </div>

            <button className="btn-bounce" 
              style={{ ...styles.primaryBtn, width: "100%", height: 60, fontSize: 18, background: "linear-gradient(135deg, #ff6b6b, #d93838)", boxShadow: "0 8px 30px rgba(255, 107, 107, 0.4)", border: "none" }}
              onClick={startBattle} disabled={loading}
            >
              {loading ? "Invocando al Jefe..." : "💥 Iniciar Batalla"}
            </button>
          </div>
        )}

        {battleState === "won" && (
          <div style={{ textAlign: "center", marginTop: 60, animation: "modalFadeUp 0.5s" }}>
            <div style={{ fontSize: 80, marginBottom: 20 }}>🏆</div>
            <h2 style={{ fontSize: 28, fontWeight: 900, color: "#4ecdc4", marginBottom: 10 }}>¡JEFE DERROTADO!</h2>
            <p style={{ color: "#e0e0f5", marginBottom: 30, fontSize: 16 }}>Demostraste un dominio absoluto de tus apuntes.</p>
            <div style={{ background: "rgba(78,205,196,0.1)", border: "1px solid rgba(78,205,196,0.3)", padding: 20, borderRadius: 20, display: "inline-block", color: "#4ecdc4", fontWeight: 800, fontSize: 20, marginBottom: 30 }}>
              +150 XP
            </div>
            <button className="btn-bounce" 
              style={{ ...styles.primaryBtn, width: "100%", background: "#2e2e48", color: "#fff", border: "none" }}
              onClick={() => setBattleState("setup")}
            >
              Reintentar Venganza
            </button>
          </div>
        )}

        {battleState === "lost" && (
          <div style={{ textAlign: "center", marginTop: 60, animation: "modalFadeUp 0.5s" }}>
            <div style={{ fontSize: 80, marginBottom: 20 }}>💀</div>
            <h2 style={{ fontSize: 28, fontWeight: 900, color: "#ff6b6b", marginBottom: 10 }}>¡CAÍSTE EN BATALLA!</h2>
            <p style={{ color: "#e0e0f5", marginBottom: 30, fontSize: 16 }}>El Jefe Múltiple Choice fue más rápido. ¡Debes entrenar más!</p>
            <button className="btn-bounce" 
              style={{ ...styles.primaryBtn, width: "100%", background: "linear-gradient(135deg, #ff6b6b, #d93838)", color: "#fff", border: "none" }}
              onClick={() => setBattleState("setup")}
            >
              Intentarlo de nuevo
            </button>
          </div>
        )}

        {battleState === "active" && currentQ && (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", height: "100%", animation: "fadeIn 0.3s" }}>
            
            {/* Health Bars */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, background: "rgba(255,255,255,0.03)", padding: 16, borderRadius: 24, border: "1px solid rgba(255,255,255,0.05)" }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: "#fff", marginBottom: 6 }}>👩‍🎓 TÚ</div>
                <div style={{ display: "flex", gap: 4 }}>
                  {[...Array(3)].map((_, i) => (
                    <span key={i} style={{ fontSize: 20, opacity: i < userHp ? 1 : 0.2, filter: i < userHp ? "none" : "grayscale(1)" }}>❤️</span>
                  ))}
                </div>
              </div>
              <div style={{ fontSize: 24, fontWeight: 900, color: "#7c6fff", opacity: 0.5 }}>VS</div>
              <div style={{ flex: 1, textAlign: "right" }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: "#ff6b6b", marginBottom: 6 }}>🦹 JEFE IA</div>
                <div style={{ height: 12, background: "rgba(255,107,107,0.2)", borderRadius: 6, overflow: "hidden", border: "1px solid rgba(255,107,107,0.3)" }}>
                  <div style={{ height: "100%", background: "#ff6b6b", width: `${bossHp}%`, transition: "width 0.3s ease-out" }} />
                </div>
              </div>
            </div>

            {/* AI Taunt & Timer */}
            <div style={{ textAlign: "center", marginBottom: 20 }}>
              <div style={{ fontSize: 13, fontStyle: "italic", color: "#b0a8ff", marginBottom: 16, background: "rgba(124,111,255,0.1)", padding: "10px 16px", borderRadius: 16, display: "inline-block" }}>
                "{currentQ.taunt}"
              </div>
              
              <div style={{ width: 80, height: 80, borderRadius: 40, border: `4px solid ${timeLeft < 5 ? "#ff6b6b" : "#4ecdc4"}`, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, fontWeight: 900, color: timeLeft < 5 ? "#ff6b6b" : "#fff", background: timeLeft < 5 ? "rgba(255,107,107,0.1)" : "transparent", transition: "all 0.3s" }}>
                {timeLeft}s
              </div>
            </div>

            {/* Question Card */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <div style={{ background: "rgba(255,255,255,0.05)", padding: 24, borderRadius: 24, fontSize: 18, fontWeight: 800, lineHeight: 1.5, textAlign: "center", marginBottom: 20, borderTop: "2px solid rgba(255,255,255,0.1)" }}>
                {currentQ.q}
              </div>

              {/* Feedback Overlay */}
              {feedback && (
                <div style={{ textAlign: "center", fontSize: 18, fontWeight: 900, color: selectedOption === currentQ.options[currentQ.correctIndex] ? "#4ecdc4" : "#ff6b6b", marginBottom: 20, animation: "bounce 0.3s" }}>
                  {feedback}
                </div>
              )}

              {/* Options */}
              <div style={{ display: "flex", flexDirection: "column", gap: 12, paddingBottom: 40 }}>
                {options.map((opt, i) => {
                  const isCorrectAnswer = opt === currentQ.options[currentQ.correctIndex];
                  let btnBg = "rgba(255,255,255,0.05)";
                  let btnBorder = "rgba(255,255,255,0.1)";
                  let btnColor = "#fff";
                  
                  if (selectedOption) {
                    if (isCorrectAnswer) {
                      btnBg = "rgba(78,205,196,0.15)";
                      btnBorder = "#4ecdc4";
                      btnColor = "#4ecdc4";
                    } else if (selectedOption === opt) {
                      btnBg = "rgba(255,107,107,0.15)";
                      btnBorder = "#ff6b6b";
                      btnColor = "#ff6b6b";
                    }
                  }

                  return (
                    <button 
                      key={i} 
                      className="btn-bounce"
                      disabled={!!selectedOption}
                      style={{ 
                        padding: 18, background: btnBg, border: `1px solid ${btnBorder}`, color: btnColor, 
                        borderRadius: 16, fontSize: 15, fontWeight: 700, textAlign: "left", transition: "all 0.2s" 
                      }}
                      onClick={() => handleAnswer(opt)}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>
            
          </div>
        )}
      </div>
    </div>
  );
}
