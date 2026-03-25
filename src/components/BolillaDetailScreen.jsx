import React from "react";

export default function BolillaDetailScreen({
  activeBolilla, activeBolillaId, setScreen, setDeleteConfirm, setIsExam,
  startQuiz, startExam, startStudy, setAiSuggestions, setCardFront, setCardBack, setEditingCardId,
  color, styles,
}) {
  const cards = activeBolilla.cards || [];

  return (
    <div style={{ ...styles.screen, background: "#0d0d18" }}>
      {/* Header */}
      <div style={{ padding: "52px 20px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        <button style={styles.backBtnLight} onClick={() => setScreen("materia")}>‹</button>
        <div style={styles.headerTitleLight}>{activeBolilla.name}</div>
        <button style={styles.deleteBtnHeader} onClick={() => setDeleteConfirm({ type: "bolilla", id: activeBolillaId })}>🗑</button>
      </div>

      {/* Stats + actions */}
      <div style={{ padding: "16px 20px 12px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
        <div>
          <div style={{ fontSize: 28, fontWeight: 800, color: color.bg, lineHeight: 1 }}>{cards.length}</div>
          <div style={{ fontSize: 11, color: "#5a5a7a", marginTop: 2, fontWeight: 600, letterSpacing: 0.5 }}>TARJETAS</div>
        </div>
        {cards.length > 0 && (
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn-bounce" style={{ ...styles.studyBtn, background: "rgba(78,205,196,0.15)", color: "#4ecdc4", border: "1px solid rgba(78,205,196,0.25)" }}
              onClick={() => { setIsExam(false); startQuiz("bolilla"); }}>
              🧠 Test
            </button>
            <button className="btn-bounce" style={{ ...styles.studyBtn, background: "rgba(255,255,255,0.06)", color: "#e0e0ff", border: "1px solid rgba(255,255,255,0.1)" }}
              onClick={() => startExam("bolilla")}>
              📝 Exam
            </button>
            <button className="btn-bounce" style={{ ...styles.studyBtn, background: `${color.bg}22`, color: color.bg, border: `1px solid ${color.bg}44` }}
              onClick={startStudy}>
              ▶ Estudiar
            </button>
          </div>
        )}
      </div>

      {/* AI button */}
      <div style={{ padding: "12px 20px 4px" }}>
        <button className="btn-bounce" style={{ ...styles.primaryBtn, background: "linear-gradient(135deg, #7c6fff22, #4ecdc422)", color: "#b0a8ff", border: "1px solid rgba(124,111,255,0.3)" }}
          onClick={() => { setAiSuggestions([]); setScreen("aiGenerator"); }}>
          ✨ Generar con IA
        </button>
      </div>

      {/* Card list */}
      <div style={styles.list}>
        {cards.length === 0 ? (
          <div style={styles.emptyState}>
            <div style={{ fontSize: 48, marginBottom: 8 }}>🃏</div>
            <div style={styles.emptyTitle}>Sin flashcards</div>
            <div style={styles.emptySub}>Tocá el botón + para crear tu primera tarjeta</div>
          </div>
        ) : (
          cards.map((card) => (
            <div key={card.id} className="list-item" style={styles.cardItemBody}>
              <div style={{ flex: 1 }} onClick={() => { setEditingCardId(card.id); setCardFront(card.front); setCardBack(card.back); setScreen("editCard"); }}>
                <div style={styles.cardFrontText}>❓ {card.front}</div>
                <div style={styles.cardBackText}>💡 {card.back}</div>
              </div>
              <button style={styles.deleteCardBtn} onClick={() => setDeleteConfirm({ type: "card", id: card.id })}>×</button>
            </div>
          ))
        )}
      </div>

      <button className="btn-bounce" style={{ ...styles.fab, background: `linear-gradient(135deg, ${color.bg}, ${color.bg}cc)`, boxShadow: `0 8px 24px ${color.bg}55` }}
        onClick={() => { setCardFront(""); setCardBack(""); setScreen("addCard"); }}>
        +
      </button>
    </div>
  );
}
