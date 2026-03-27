import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { COLORS } from "../constants";

export default function BolillaDetail({
  materias, setScreen, setDeleteConfirm, setIsExam,
  startQuiz, startExam, startStudy, setAiSuggestions, setCardFront, setCardBack, setEditingCardId,
  enhanceFlashcard,
  styles,
}) {
  const { materiaId, bolillaId } = useParams();
  const navigate = useNavigate();
  const [enrichment, setEnrichment] = React.useState(null);
  const [enrichLoading, setEnrichLoading] = React.useState(null); // id del card cargando
  
  const activeMateria = materias.find(m => m.id === materiaId);
  const activeBolilla = activeMateria?.bolillas?.find(b => b.id === bolillaId);
  const color = COLORS[activeMateria?.colorIdx] || COLORS[0];

  const handleEnrich = async (card) => {
    setEnrichLoading(card.id);
    const data = await enhanceFlashcard(card.front, card.back);
    if (data) setEnrichment(data);
    setEnrichLoading(null);
  };

  if (!activeBolilla) {
    return <div style={{ color: "#fff", padding: 20 }}>Bolilla no encontrada</div>;
  }

  const cards = activeBolilla.cards || [];

  return (
    <div style={{ ...styles.screen, background: "#0d0d18" }}>
      {/* Enrichment Modal */}
      {enrichment && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.85)", zIndex: 20000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20, backdropFilter: "blur(12px)" }} onClick={() => setEnrichment(null)}>
          <div 
            style={{ 
              background: "#16162a", borderRadius: 32, padding: "32px 24px 24px", maxWidth: 500, width: "100%", 
              maxHeight: "85vh", display: "flex", flexDirection: "column",
              border: "1px solid rgba(124,111,255,0.4)", boxShadow: "0 25px 70px rgba(0,0,0,0.6)",
              animation: "modalFadeUp 0.3s ease-out" 
            }} 
            onClick={e => e.stopPropagation()}
          >
            <div style={{ fontSize: 22, fontWeight: 900, color: "#fff", marginBottom: 20, display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 24 }}>✨</span> Mejora con IA
            </div>
            
            <div style={{ flex: 1, overflowY: "auto", paddingRight: 10, marginBottom: 20 }}>
              <div style={{ marginBottom: 24 }}>
                <div style={{ fontSize: 10, fontWeight: 800, color: "#7c6fff", letterSpacing: 1.5, marginBottom: 10 }}>EXPLICACIÓN</div>
                <div style={{ fontSize: 13, color: "#e0e0f5", lineHeight: 1.7 }}>{enrichment.explanation}</div>
              </div>

              <div style={{ marginBottom: 24 }}>
                <div style={{ fontSize: 10, fontWeight: 800, color: "#4ecdc4", letterSpacing: 1.5, marginBottom: 10 }}>EJEMPLO PRÁCTICO</div>
                <div style={{ fontSize: 13, color: "#e0e0f5", lineHeight: 1.7 }}>{enrichment.example}</div>
              </div>

              <div style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 10, fontWeight: 800, color: "#ff6b6b", letterSpacing: 1.5, marginBottom: 10 }}>MNEMOTECNIA</div>
                <div style={{ fontSize: 13, color: "#f0f0ff", lineHeight: 1.7, fontStyle: "italic", background: "rgba(255,107,107,0.05)", padding: 12, borderRadius: 12, border: "1px solid rgba(255,107,107,0.1)" }}>{enrichment.mnemonic}</div>
              </div>
            </div>

            <button 
              style={{ 
                ...styles.primaryBtn, width: "100%", height: 50, borderRadius: 16, fontSize: 14, fontWeight: 800,
                background: "linear-gradient(90deg, #7c6fff, #5a4fd4)", border: "none", color: "#fff",
                boxShadow: "0 8px 20px rgba(124,111,255,0.3)"
              }} 
              onClick={() => setEnrichment(null)}
            >
              Entendido
            </button>
          </div>
        </div>
      )}
      {/* Header */}
      <div style={{ padding: "52px 20px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        <button style={styles.backBtnLight} onClick={() => navigate(`/materia/${materiaId}`)}>‹</button>
        <div style={styles.headerTitleLight}>{activeBolilla.name}</div>
        <button style={styles.deleteBtnHeader} onClick={() => setDeleteConfirm({ type: "bolilla", id: bolillaId })}>🗑</button>
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
              onClick={() => { setIsExam(false); startQuiz("bolilla", materias, materiaId, bolillaId); navigate("/quiz"); }}>
              🧠 Test
            </button>
            <button className="btn-bounce" style={{ ...styles.studyBtn, background: "rgba(255,255,255,0.06)", color: "#e0e0ff", border: "1px solid rgba(255,255,255,0.1)" }}
              onClick={() => { startExam("bolilla", materias, materiaId, bolillaId); navigate("/quiz"); }}>
              📝 Exam
            </button>
            <button className="btn-bounce" style={{ ...styles.studyBtn, background: `${color.bg}22`, color: color.bg, border: `1px solid ${color.bg}44` }}
              onClick={() => { startStudy(cards); navigate(`/materia/${materiaId}/study/${bolillaId}`); }}>
              ▶ Estudiar
            </button>
          </div>
        )}
      </div>

      {/* AI button */}
      <div style={{ padding: "12px 20px 4px" }}>
        <button className="btn-bounce" style={{ ...styles.primaryBtn, background: "linear-gradient(135deg, #7c6fff22, #4ecdc422)", color: "#b0a8ff", border: "1px solid rgba(124,111,255,0.3)" }}
          onClick={() => { setAiSuggestions([]); navigate("/ai-generator"); }}>
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
              <div style={{ flex: 1 }} onClick={() => { setEditingCardId(card.id); setCardFront(card.front); setCardBack(card.back); navigate("/edit-card"); }}>
                <div style={styles.cardFrontText}>❓ {card.front}</div>
                <div style={styles.cardBackText}>💡 {card.back}</div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button 
                  style={{ border: "none", background: "rgba(124,111,255,0.1)", color: "#7c6fff", borderRadius: 10, width: 34, height: 34, cursor: "pointer", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center" }}
                  onClick={(e) => { e.stopPropagation(); handleEnrich(card); }}
                  disabled={enrichLoading === card.id}
                >
                  {enrichLoading === card.id ? "⏳" : "🪄"}
                </button>
                <button style={styles.deleteCardBtn} onClick={() => setDeleteConfirm({ type: "card", id: card.id })}>×</button>
              </div>
            </div>
          ))
        )}
      </div>

      <button className="btn-bounce" style={{ ...styles.fab, background: `linear-gradient(135deg, ${color.bg}, ${color.bg}cc)`, boxShadow: `0 8px 24px ${color.bg}55` }}
        onClick={() => { setCardFront(""); setCardBack(""); navigate("/add-card"); }}>
        +
      </button>
    </div>
  );
}
