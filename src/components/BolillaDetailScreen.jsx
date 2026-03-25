import React from "react";

export default function BolillaDetailScreen({
  activeBolilla,
  activeBolillaId,
  setScreen,
  setDeleteConfirm,
  setIsExam,
  startQuiz,
  startExam,
  startStudy,
  setAiSuggestions,
  setCardFront,
  setCardBack,
  setEditingCardId,
  color,
  styles,
}) {
  return (
    <div style={styles.screen}>
      <div style={{ ...styles.materiaHeader, background: "#111" }}>
        <button style={styles.backBtnLight} onClick={() => setScreen("materia")}>
          ‹
        </button>
        <div style={styles.headerTitleLight}>{activeBolilla.name}</div>
        <button
          style={styles.deleteBtnHeader}
          onClick={() =>
            setDeleteConfirm({ type: "bolilla", id: activeBolillaId })
          }
        >
          🗑
        </button>
      </div>

      <div
        style={{
          padding: "16px 20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div style={{ fontWeight: 700, fontSize: 18, color: "#333" }}>
          {(activeBolilla.cards || []).length} tarjetas
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {(activeBolilla.cards || []).length > 0 && (
            <button
              className="btn-bounce"
              style={{ ...styles.studyBtn, background: "#4ECDC4", color: "#111", fontSize: 13 }}
              onClick={() => {
                setIsExam(false);
                startQuiz("bolilla");
              }}
            >
              🧠 Test
            </button>
          )}
          {(activeBolilla.cards || []).length > 0 && (
            <button
              className="btn-bounce"
              style={{ ...styles.studyBtn, background: "#111", color: "#fff", fontSize: 13 }}
              onClick={() => startExam("bolilla")}
            >
              📝 Exam
            </button>
          )}
          {(activeBolilla.cards || []).length > 0 && (
            <button
              className="btn-bounce"
              style={{ ...styles.studyBtn, background: "#fff", color: "#111", fontSize: 13 }}
              onClick={startStudy}
            >
              ▶ Estudiar
            </button>
          )}
        </div>
      </div>
      <div style={{ padding: "0 20px 16px" }}>
        <button
          className="btn-bounce"
          style={{ ...styles.primaryBtn, background: "#A29BFE", color: "#fff" }}
          onClick={() => {
            setAiSuggestions([]);
            setScreen("aiGenerator");
          }}
        >
          ✨ Generar con IA (texto)
        </button>
      </div>

      <div style={styles.list}>
        {!activeBolilla.cards || activeBolilla.cards.length === 0 ? (
          <div style={styles.emptyState}>
            <div style={{ fontSize: 48 }}>🃏</div>
            <div style={styles.emptyTitle}>Sin flashcards</div>
            <div style={styles.emptySub}>
              Crea tus primeras tarjetas para estudiar esta bolilla.
            </div>
          </div>
        ) : (
          activeBolilla.cards.map((card, idx) => (
            <div key={card.id} className="list-item" style={styles.cardItemBody}>
              <div
                style={{ flex: 1 }}
                onClick={() => {
                  setEditingCardId(card.id);
                  setCardFront(card.front);
                  setCardBack(card.back);
                  setScreen("editCard");
                }}
              >
                <div style={styles.cardFrontText}>❓ {card.front}</div>
                <div style={styles.cardBackText}>💡 {card.back}</div>
              </div>
              <button
                style={styles.deleteCardBtn}
                onClick={() => setDeleteConfirm({ type: "card", id: card.id })}
              >
                ×
              </button>
            </div>
          ))
        )}
      </div>
      <button
        className="btn-bounce"
        style={{ ...styles.fab, background: color.bg }}
        onClick={() => {
          setCardFront("");
          setCardBack("");
          setScreen("addCard");
        }}
      >
        +
      </button>
    </div>
  );
}
