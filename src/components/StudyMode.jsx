import React from "react";

export default function StudyMode({
  isStudyFinished, activeCardIdx, studyQueue, flipped, setFlipped,
  rateCard, speakText, setScreen, color, styles,
}) {
  return (
    <div style={{ ...styles.screen, background: "#08080f", justifyContent: "space-between" }}>
      {/* Top bar */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "52px 24px 12px" }}>
        <button style={styles.studyBackBtn} onClick={() => { setScreen("bolilla"); window.speechSynthesis?.cancel(); }}>✕</button>
        <div style={{ fontSize: 14, color: "#7070a0", fontWeight: 700, letterSpacing: 1 }}>
          {!isStudyFinished ? `${activeCardIdx + 1} / ${studyQueue.length}` : "Resultado"}
        </div>
        {!isStudyFinished && (
          <button style={{ ...styles.studyBackBtn, fontSize: 20 }}
            onClick={(e) => { e.stopPropagation(); speakText(flipped ? studyQueue[activeCardIdx].back : studyQueue[activeCardIdx].front); }}>
            🔊
          </button>
        )}
      </div>

      {!isStudyFinished ? (
        <>
          {/* Progress bar */}
          <div style={{ padding: "0 24px 8px" }}>
            <div style={{ height: 4, background: "rgba(255,255,255,0.06)", borderRadius: 2, overflow: "hidden" }}>
              <div style={{ background: `linear-gradient(90deg, ${color.bg}, #7c6fff)`, height: "100%", width: `${((activeCardIdx + 1) / studyQueue.length) * 100}%`, transition: "width 0.4s", borderRadius: 2 }} />
            </div>
          </div>

          <div style={{ textAlign: "center", fontSize: 13, color: flipped ? color.bg : "#4a4a6a", fontWeight: 600, letterSpacing: 0.5 }}>
            {flipped ? "Calificá tu recuerdo" : "Tocá la tarjeta para ver la respuesta"}
          </div>

          {/* Card */}
          <div className="card-flip" style={{ flex: 1, padding: "16px 28px", display: "flex", alignItems: "center", justifyContent: "center" }}
            onClick={() => !flipped && setFlipped(true)}>
            <div style={{ width: "100%", height: "400px", position: "relative" }}>
              <div className={`card-inner${flipped ? " flipped" : ""}`} style={{ width: "100%", height: "100%" }}>
                {/* Front */}
                <div className="card-face" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", backdropFilter: "blur(20px)", borderRadius: 28, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", boxShadow: "0 20px 60px rgba(0,0,0,0.5)" }}>
                  <div style={{ fontSize: 13, color: "#4a4a6a", fontWeight: 700, letterSpacing: 1, marginBottom: 20 }}>PREGUNTA</div>
                  <div style={{ fontSize: 22, fontWeight: 800, textAlign: "center", color: "#e8e8ff", lineHeight: 1.5, width: "100%" }}>
                    {studyQueue[activeCardIdx].front}
                  </div>
                  <div style={{ marginTop: 32, fontSize: 13, color: "#3a3a5a", fontWeight: 600 }}>Tocá para ver →</div>
                </div>

                {/* Back */}
                <div className="card-face card-back-face" style={{ background: `linear-gradient(145deg, ${color.bg}22, ${color.bg}11)`, border: `1px solid ${color.bg}44`, backdropFilter: "blur(20px)", borderRadius: 28, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", boxShadow: `0 20px 60px ${color.bg}22` }}>
                  <div style={{ fontSize: 13, color: color.bg, fontWeight: 700, letterSpacing: 1, marginBottom: 20, opacity: 0.8 }}>RESPUESTA</div>
                  <div style={{ fontSize: 20, fontWeight: 700, textAlign: "center", color: "#f0f0ff", lineHeight: 1.6, width: "100%" }}>
                    {studyQueue[activeCardIdx].back}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div style={{ padding: "12px 24px 44px" }}>
            {!flipped ? (
              <button className="btn-bounce" style={{ width: "100%", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "#d0d0f0", borderRadius: 20, padding: "20px", fontWeight: 700, fontSize: 17, cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                onClick={() => setFlipped(true)}>
                👁 Ver respuesta
              </button>
            ) : (
              <div style={{ display: "flex", gap: 10 }}>
                {[
                  { label: "❌ No lo sabía", bg: "rgba(255,107,107,0.15)", border: "rgba(255,107,107,0.3)", color: "#ff6b6b", rate: 0 },
                  { label: "😐 Dudé", bg: "rgba(240,165,0,0.15)", border: "rgba(240,165,0,0.3)", color: "#f0a500", rate: 1 },
                  { label: "✅ Fácil", bg: "rgba(78,205,196,0.15)", border: "rgba(78,205,196,0.3)", color: "#4ecdc4", rate: 2 },
                ].map((btn) => (
                  <button key={btn.rate} className="btn-bounce"
                    style={{ flex: 1, background: btn.bg, border: `1px solid ${btn.border}`, color: btn.color, borderRadius: 16, padding: "14px 6px", fontWeight: 700, fontSize: 12, cursor: "pointer", fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                    onClick={() => rateCard(btn.rate)}>
                    {btn.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </>
      ) : (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 32 }}>
          <div style={{ fontSize: 72, marginBottom: 20 }}>🚀</div>
          <h1 style={{ color: "#f0f0ff", fontSize: 26, fontWeight: 800, marginBottom: 10, textAlign: "center", letterSpacing: "-0.5px" }}>¡Sesión Finalizada!</h1>
          <p style={{ color: "#5a5a7a", fontSize: 15, marginBottom: 40, textAlign: "center", lineHeight: 1.6 }}>
            Revisaste todas las tarjetas pendientes. Volvé más tarde para el siguiente repaso.
          </p>
          <button className="btn-bounce" style={{ ...styles.primaryBtn, background: `linear-gradient(135deg, ${color.bg}, ${color.bg}aa)`, boxShadow: `0 8px 24px ${color.bg}44` }}
            onClick={() => setScreen("bolilla")}>
            Volver a la bolilla
          </button>
        </div>
      )}
    </div>
  );
}
