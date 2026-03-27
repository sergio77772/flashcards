import React from "react";
import { useNavigate } from "react-router-dom";

export default function Quiz({
  isExam, quizFinished, quizIdx, quizQuestions, examTimer,
  selectedAnswer, quizScore, handleQuizAnswer, startExam, startQuiz,
  setIsExam, setSelectedAnswer, formatTime, styles,
}) {
  const navigate = useNavigate();
  const scorePct = quizQuestions.length > 0 ? Math.round((quizScore / quizQuestions.length) * 100) : 0;

  if (quizQuestions.length === 0) {
    return (
      <div style={{ ...styles.screen, background: "#08080f", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
        No hay preguntas disponibles.
        <button onClick={() => navigate("/")} style={{ ...styles.primaryBtn, marginTop: 20 }}>Volver</button>
      </div>
    );
  }

  return (
    <div style={{ ...styles.screen, background: "#08080f", color: "#f0f0ff" }}>
      {/* Top bar */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "52px 24px 12px" }}>
        <button style={styles.studyBackBtn} onClick={() => { navigate(-1); setSelectedAnswer(null); setIsExam(false); }}>✕</button>
        <div style={{ fontSize: 14, color: "#7070a0", fontWeight: 700, letterSpacing: 0.5 }}>
          {!quizFinished ? (isExam ? `EXAMEN` : `TEST`) + ` · ${quizIdx + 1}/${quizQuestions.length}` : "RESULTADO"}
        </div>
        {isExam && !quizFinished ? (
          <div style={{ background: "rgba(255,107,107,0.15)", border: "1px solid rgba(255,107,107,0.3)", padding: "5px 12px", borderRadius: 10, fontSize: 14, fontWeight: 800, color: "#ff6b6b" }}>
            {formatTime(examTimer)}
          </div>
        ) : <div style={{ width: 38 }} />}
      </div>

      {!quizFinished ? (
        <div style={{ padding: "8px 22px", flex: 1, display: "flex", flexDirection: "column" }}>
          {/* Progress */}
          <div style={{ height: 4, background: "rgba(255,255,255,0.06)", borderRadius: 2, marginBottom: 24, overflow: "hidden" }}>
            <div style={{ height: "100%", background: "linear-gradient(90deg, #7c6fff, #4ecdc4)", width: `${(quizIdx / quizQuestions.length) * 100}%`, transition: "width 0.4s", borderRadius: 2 }} />
          </div>

          {/* Question */}
          <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", padding: "22px", borderRadius: 22, marginBottom: 20, flexShrink: 0 }}>
            <div style={{ fontSize: 11, color: "#5a5a7a", marginBottom: 12, fontWeight: 700, letterSpacing: 1.5 }}>
              {isExam ? "📝 EXAMEN" : "🧠 TEST"} · ELEGÍ LA OPCIÓN CORRECTA
            </div>
            <div style={{ fontSize: 20, fontWeight: 800, lineHeight: 1.5, color: "#f0f0ff", letterSpacing: "-0.3px" }}>
              {quizQuestions[quizIdx]?.question}
            </div>
          </div>

          {/* Options */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10, flex: 1 }}>
            {quizQuestions[quizIdx]?.options.map((opt, i) => {
              const isSelected = selectedAnswer === opt;
              const isCorrect = opt === quizQuestions[quizIdx].correctAnswer;
              let bg = "rgba(255,255,255,0.04)";
              let border = "rgba(255,255,255,0.07)";
              let col = "#d0d0f0";

              if (!isExam && selectedAnswer !== null) {
                if (isCorrect) { bg = "rgba(78,205,196,0.15)"; border = "rgba(78,205,196,0.5)"; col = "#4ecdc4"; }
                else if (isSelected) { bg = "rgba(255,107,107,0.15)"; border = "rgba(255,107,107,0.5)"; col = "#ff6b6b"; }
              } else if (isSelected) {
                bg = "rgba(124,111,255,0.15)"; border = "rgba(124,111,255,0.5)"; col = "#b0a8ff";
              }

              return (
                <button key={i} className="btn-bounce" onClick={() => handleQuizAnswer(opt)}
                  style={{ background: bg, border: `1.5px solid ${border}`, borderRadius: 16, padding: "18px 20px", color: col, fontSize: 15, fontWeight: 600, textAlign: "left", cursor: selectedAnswer !== null && !isExam ? "default" : "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif", transition: "all .2s", lineHeight: 1.4 }}>
                  <span style={{ fontSize: 12, opacity: 0.5, marginRight: 10 }}>{["A", "B", "C", "D"][i]}</span>
                  {opt}
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "32px 24px" }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>{scorePct >= 70 ? "🏆" : scorePct >= 50 ? "😅" : "💪"}</div>
          <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 6, letterSpacing: "-0.5px" }}>
            {isExam ? "Examen Finalizado" : "Test Completado"}
          </h1>

          {/* Score display */}
          <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 24, padding: "24px 28px", width: "100%", marginBottom: 28, marginTop: 20 }}>
            <div style={{ textAlign: "center", marginBottom: 20 }}>
              <div style={{ fontSize: 56, fontWeight: 800, color: scorePct >= 70 ? "#4ecdc4" : scorePct >= 50 ? "#f0a500" : "#ff6b6b", letterSpacing: "-2px" }}>{scorePct}%</div>
              <div style={{ fontSize: 13, color: "#5a5a7a", fontWeight: 600 }}>{quizScore} de {quizQuestions.length} correctas</div>
            </div>
            {isExam && (
              <div style={{ display: "flex", gap: 12 }}>
                <div style={{ flex: 1, background: "rgba(255,255,255,0.04)", borderRadius: 12, padding: "12px", textAlign: "center" }}>
                  <div style={{ fontSize: 16, fontWeight: 800, color: "#f0f0ff" }}>{formatTime(examTimer)}</div>
                  <div style={{ fontSize: 10, color: "#5a5a7a", fontWeight: 700, marginTop: 2, letterSpacing: 0.5 }}>TIEMPO</div>
                </div>
                <div style={{ flex: 1, background: "rgba(255,255,255,0.04)", borderRadius: 12, padding: "12px", textAlign: "center" }}>
                  <div style={{ fontSize: 16, fontWeight: 800, color: "#f0f0ff" }}>{Math.round(examTimer / quizQuestions.length)}s</div>
                  <div style={{ fontSize: 10, color: "#5a5a7a", fontWeight: 700, marginTop: 2, letterSpacing: 0.5 }}>POR PREG.</div>
                </div>
              </div>
            )}
          </div>

          <button className="btn-bounce" style={{ ...styles.primaryBtn, background: "linear-gradient(135deg, #7c6fff, #5a4fd4)", boxShadow: "0 8px 24px rgba(124,111,255,0.3)", marginBottom: 12 }}
            onClick={() => (isExam ? startExam() : startQuiz())}>
            Reintentar
          </button>
          <button className="btn-bounce" style={{ ...styles.primaryBtn, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "#9090c0" }}
            onClick={() => { navigate("/"); setIsExam(false); }}>
            Ir al inicio
          </button>
        </div>
      )}
    </div>
  );
}
