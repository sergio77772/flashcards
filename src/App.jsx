import { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";

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
  const [bolillas, setBolillas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [screen, setScreen] = useState("home"); // home | bolilla | study | addBolilla | addCard | editCard
  const [activeBolillaId, setActiveBolillaId] = useState(null);
  const [activeCardIdx, setActiveCardIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [newBolillaName, setNewBolillaName] = useState("");
  const [newBolillaColor, setNewBolillaColor] = useState(0);
  const [cardFront, setCardFront] = useState("");
  const [cardBack, setCardBack] = useState("");
  const [editingCardId, setEditingCardId] = useState(null);
  const [toast, setToast] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null); // { type: 'bolilla'|'card', id }

  useEffect(() => {
    fetchBolillas();
  }, []);

  const fetchBolillas = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('bolillas')
      .select('*, flashcards(*)');

    if (!error && data) {
      const formatted = data.map(b => ({
        id: b.id,
        name: b.name,
        colorIdx: b.color_idx,
        cards: b.flashcards || []
      }));
      setBolillas(formatted);
    }
    setLoading(false);
  };

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2000);
  };

  const activeBolilla = bolillas.find(b => b.id === activeBolillaId);

  const addBolilla = async () => {
    if (!newBolillaName.trim()) return;
    const newBolilla = { 
      id: generateId(), 
      name: newBolillaName.trim(), 
      color_idx: newBolillaColor 
    };

    // Actualización optimista local
    const nbLocal = { ...newBolilla, colorIdx: newBolilla.color_idx, cards: [] };
    setBolillas(prev => [...prev, nbLocal]);
    setNewBolillaName("");
    setNewBolillaColor(0);
    setScreen("home");
    showToast("¡Bolilla creada!");

    // Guardar en Supabase
    await supabase.from('bolillas').insert([newBolilla]);
  };

  const deleteBolilla = async (id) => {
    // Delete local
    setBolillas(prev => prev.filter(b => b.id !== id));
    setDeleteConfirm(null);
    setScreen("home");
    showToast("Bolilla eliminada", "error");

    // Delete in Supabase
    await supabase.from('bolillas').delete().eq('id', id);
  };

  const addCard = async () => {
    if (!cardFront.trim() || !cardBack.trim()) return;
    const newCard = {
      id: generateId(),
      bolilla_id: activeBolillaId,
      front: cardFront.trim(),
      back: cardBack.trim()
    };

    setBolillas(prev => prev.map(b =>
      b.id === activeBolillaId
        ? { ...b, cards: [...b.cards, newCard] }
        : b
    ));
    setCardFront(""); setCardBack("");
    setScreen("bolilla");
    showToast("Flashcard agregada!");

    await supabase.from('flashcards').insert([newCard]);
  };

  const saveEditCard = async () => {
    if (!cardFront.trim() || !cardBack.trim()) return;
    
    setBolillas(prev => prev.map(b =>
      b.id === activeBolillaId
        ? { ...b, cards: b.cards.map(c => c.id === editingCardId ? { ...c, front: cardFront.trim(), back: cardBack.trim() } : c) }
        : b
    ));
    setScreen("bolilla");
    showToast("Flashcard actualizada!");

    await supabase.from('flashcards').update({ front: cardFront.trim(), back: cardBack.trim() }).eq('id', editingCardId);
    
    setCardFront(""); setCardBack(""); setEditingCardId(null);
  };

  const deleteCard = async (cardId) => {
    setBolillas(prev => prev.map(b =>
      b.id === activeBolillaId
        ? { ...b, cards: b.cards.filter(c => c.id !== cardId) }
        : b
    ));
    setDeleteConfirm(null);
    showToast("Flashcard eliminada", "error");

    await supabase.from('flashcards').delete().eq('id', cardId);
  };

  const startStudy = () => {
    setActiveCardIdx(0);
    setFlipped(false);
    setScreen("study");
  };

  const nextCard = () => {
    setFlipped(false);
    setTimeout(() => setActiveCardIdx(i => (i + 1) % activeBolilla.cards.length), 150);
  };

  const prevCard = () => {
    setFlipped(false);
    setTimeout(() => setActiveCardIdx(i => (i - 1 + activeBolilla.cards.length) % activeBolilla.cards.length), 150);
  };

  const color = activeBolilla ? COLORS[activeBolilla.colorIdx] : COLORS[0];

  return (
    <div style={styles.root}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; -webkit-tap-highlight-color: transparent; }
        body { background: #0f0f0f; }
        .card-flip { perspective: 900px; }
        .card-inner { transition: transform 0.5s cubic-bezier(.4,2,.3,1); transform-style: preserve-3d; position: relative; }
        .card-inner.flipped { transform: rotateY(180deg); }
        .card-face { backface-visibility: hidden; -webkit-backface-visibility: hidden; position: absolute; top:0; left:0; width:100%; height:100%; display:flex; align-items:center; justify-content:center; border-radius: 20px; padding: 28px; }
        .card-back-face { transform: rotateY(180deg); }
        .btn-bounce:active { transform: scale(0.93); }
        input, textarea { outline: none; font-family: 'DM Sans', sans-serif; }
        ::-webkit-scrollbar { display: none; }
        .bolilla-item:active { transform: scale(0.97); }
        .card-item:active { opacity: 0.8; }
        .toast-in { animation: toastIn .3s cubic-bezier(.4,2,.3,1) forwards; }
        @keyframes toastIn { from { opacity:0; transform: translateX(-50%) translateY(20px);} to {opacity:1; transform:translateX(-50%) translateY(0);} }
        .shake:active { animation: shake .3s; }
        @keyframes shake { 0%,100%{transform:translateX(0)} 25%{transform:translateX(-4px)} 75%{transform:translateX(4px)} }
      `}</style>

      {/* TOAST */}
      {toast && (
        <div className="toast-in" style={{ ...styles.toast, background: toast.type === "error" ? "#FF6B6B" : "#4ECDC4" }}>
          {toast.msg}
        </div>
      )}

      {/* DELETE CONFIRM MODAL */}
      {deleteConfirm && (
        <div style={styles.modalOverlay} onClick={() => setDeleteConfirm(null)}>
          <div style={styles.modal} onClick={e => e.stopPropagation()}>
            <div style={styles.modalTitle}>¿Eliminar?</div>
            <div style={styles.modalSub}>Esta acción no se puede deshacer.</div>
            <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
              <button style={{ ...styles.modalBtn, background: "#222" }} onClick={() => setDeleteConfirm(null)}>Cancelar</button>
              <button style={{ ...styles.modalBtn, background: "#FF6B6B" }}
                onClick={() => deleteConfirm.type === "bolilla" ? deleteBolilla(deleteConfirm.id) : deleteCard(deleteConfirm.id)}>
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HOME */}
      {screen === "home" && (
        <div style={styles.screen}>
          <div style={styles.header}>
            <div>
              <div style={styles.headerTitle}>Mis Bolillas ⚡</div>
              <div style={styles.headerSub}>
                {loading ? "Sincronizando..." : `${bolillas.length} ${bolillas.length === 1 ? "tema" : "temas"}`}
              </div>
            </div>
            <button className="btn-bounce" style={styles.addBtn} onClick={() => setScreen("addBolilla")}>+</button>
          </div>

          {loading ? (
             <div style={styles.emptyState}>
              <div style={styles.emptySub}>Cargando datos desde Supabase...</div>
             </div>
          ) : bolillas.length === 0 ? (
            <div style={styles.emptyState}>
              <div style={{ fontSize: 46 }}>🫧</div>
              <div style={styles.emptyTitle}>Sin bolillas todavía</div>
              <div style={styles.emptySub}>Tocá el + para crear tu primer tema</div>
            </div>
          ) : (
            <div style={styles.list}>
              {bolillas.map((b) => {
                const c = COLORS[b.colorIdx] || COLORS[0];
                return (
                  <div key={b.id} className="bolilla-item" style={{ ...styles.bolillaCard, background: c.light, borderLeft: `5px solid ${c.bg}` }}
                    onClick={() => { setActiveBolillaId(b.id); setScreen("bolilla"); }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                      <div style={{ ...styles.dot, background: c.bg }} />
                      <div>
                        <div style={styles.bolillaName}>{b.name}</div>
                        <div style={styles.bolillaSub}>{b.cards?.length || 0} {(b.cards?.length || 0) === 1 ? "flashcard" : "flashcards"}</div>
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

      {/* ADD BOLILLA */}
      {screen === "addBolilla" && (
        <div style={styles.screen}>
          <div style={styles.topBar}>
            <button style={styles.backBtn} onClick={() => { setScreen("home"); setNewBolillaName(""); }}>‹ Volver</button>
            <div style={styles.topTitle}>Nueva Bolilla</div>
          </div>
          <div style={styles.formWrap}>
            <label style={styles.label}>Nombre del tema</label>
            <input style={styles.input} placeholder="Ej: Química, Historia..." value={newBolillaName}
              onChange={e => setNewBolillaName(e.target.value)}
              onKeyDown={e => e.key === "Enter" && addBolilla()} autoFocus />

            <label style={styles.label}>Color</label>
            <div style={styles.colorGrid}>
              {COLORS.map((c, i) => (
                <button key={i} className="btn-bounce" style={{ ...styles.colorDot, background: c.bg, border: newBolillaColor === i ? "3px solid #fff" : "3px solid transparent", boxShadow: newBolillaColor === i ? `0 0 0 3px ${c.bg}` : "none" }}
                  onClick={() => setNewBolillaColor(i)} />
              ))}
            </div>

            {newBolillaName.trim() && (
              <div style={{ ...styles.preview, background: COLORS[newBolillaColor].light, borderLeft: `5px solid ${COLORS[newBolillaColor].bg}` }}>
                <div style={{ ...styles.dot, background: COLORS[newBolillaColor].bg }} />
                <span style={styles.bolillaName}>{newBolillaName}</span>
              </div>
            )}

            <button className="btn-bounce" style={{ ...styles.primaryBtn, background: newBolillaName.trim() ? COLORS[newBolillaColor].bg : "#333", marginTop: 24 }}
              onClick={addBolilla} disabled={!newBolillaName.trim()}>
              Crear Bolilla
            </button>
          </div>
        </div>
      )}

      {/* BOLILLA DETAIL */}
      {screen === "bolilla" && activeBolilla && (
        <div style={styles.screen}>
          <div style={{ ...styles.bolillaHeader, background: color.bg }}>
            <button style={styles.backBtnLight} onClick={() => setScreen("home")}>‹</button>
            <div style={styles.bolillaHeaderTitle}>{activeBolilla.name}</div>
            <button style={styles.deleteBtnHeader} onClick={() => setDeleteConfirm({ type: "bolilla", id: activeBolillaId })}>🗑</button>
          </div>

          <div style={{ ...styles.statsBar, background: color.light }}>
            <div style={styles.stat}><span style={{ ...styles.statNum, color: color.bg }}>{activeBolilla.cards?.length || 0}</span><span style={styles.statLabel}>flashcards</span></div>
            {(activeBolilla.cards?.length || 0) > 0 && (
              <button className="btn-bounce" style={{ ...styles.studyBtn, background: color.bg }} onClick={startStudy}>
                ▶ Estudiar
              </button>
            )}
          </div>

          <div style={styles.list}>
            {!activeBolilla.cards || activeBolilla.cards.length === 0 ? (
              <div style={styles.emptyState}>
                <div style={{ fontSize: 48 }}>🃏</div>
                <div style={styles.emptyTitle}>Sin flashcards</div>
                <div style={styles.emptySub}>Agregá tu primera tarjeta abajo</div>
              </div>
            ) : (
              activeBolilla.cards.map((card, idx) => (
                <div key={card.id} className="card-item" style={styles.cardItem}>
                  <div style={{ flex: 1 }} onClick={() => { setEditingCardId(card.id); setCardFront(card.front); setCardBack(card.back); setScreen("editCard"); }}>
                    <div style={styles.cardFrontText}>❓ {card.front}</div>
                    <div style={styles.cardBackText}>💡 {card.back}</div>
                  </div>
                  <button style={styles.deleteCardBtn} onClick={() => setDeleteConfirm({ type: "card", id: card.id })}>×</button>
                </div>
              ))
            )}
          </div>

          <button className="btn-bounce" style={{ ...styles.fab, background: color.bg }}
            onClick={() => { setCardFront(""); setCardBack(""); setScreen("addCard"); }}>+</button>
        </div>
      )}

      {/* ADD / EDIT CARD */}
      {(screen === "addCard" || screen === "editCard") && activeBolilla && (
        <div style={styles.screen}>
          <div style={{ ...styles.topBar, background: color.bg + "22" }}>
            <button style={styles.backBtn} onClick={() => { setScreen("bolilla"); setCardFront(""); setCardBack(""); setEditingCardId(null); }}>
              ‹ Volver
            </button>
            <div style={styles.topTitle}>{screen === "addCard" ? "Nueva Flashcard" : "Editar Flashcard"}</div>
          </div>
          <div style={styles.formWrap}>
            <label style={styles.label}>Frente (pregunta)</label>
            <textarea style={{ ...styles.textarea, borderColor: color.bg }} placeholder="¿Cuál es tu pregunta?" value={cardFront}
              onChange={e => setCardFront(e.target.value)} rows={3} autoFocus />

            <label style={{ ...styles.label, marginTop: 20 }}>Dorso (respuesta)</label>
            <textarea style={{ ...styles.textarea, borderColor: color.bg }} placeholder="Escribe la respuesta..." value={cardBack}
              onChange={e => setCardBack(e.target.value)} rows={4} />

            {cardFront && cardBack && (
              <div style={styles.previewCard}>
                <div style={{ ...styles.previewFace, background: color.bg, color: "#fff" }}>
                  <span style={{ fontSize: 11, opacity: 0.7, display: "block", marginBottom: 6 }}>FRENTE</span>
                  {cardFront}
                </div>
                <div style={{ ...styles.previewFace, background: color.light, color: "#222" }}>
                  <span style={{ fontSize: 11, opacity: 0.6, display: "block", marginBottom: 6 }}>DORSO</span>
                  {cardBack}
                </div>
              </div>
            )}

            <button className="btn-bounce" style={{ ...styles.primaryBtn, background: cardFront.trim() && cardBack.trim() ? color.bg : "#333", marginTop: 24 }}
              onClick={screen === "addCard" ? addCard : saveEditCard}
              disabled={!cardFront.trim() || !cardBack.trim()}>
              {screen === "addCard" ? "Agregar Flashcard" : "Guardar Cambios"}
            </button>
          </div>
        </div>
      )}

      {/* STUDY MODE */}
      {screen === "study" && activeBolilla && activeBolilla.cards.length > 0 && (
        <div style={{ ...styles.screen, background: color.bg, justifyContent: "space-between" }}>
          <div style={styles.studyTopBar}>
            <button style={styles.studyBackBtn} onClick={() => setScreen("bolilla")}>✕</button>
            <div style={styles.studyProgress}>{activeCardIdx + 1} / {activeBolilla.cards.length}</div>
            <div style={{ width: 36 }} />
          </div>

          <div style={styles.progressBarWrap}>
            <div style={{ ...styles.progressBar, width: `${((activeCardIdx + 1) / activeBolilla.cards.length) * 100}%`, background: "rgba(255,255,255,0.5)" }} />
          </div>

          <div style={styles.studyHint}>{flipped ? "✓ Respuesta" : "Tocá para ver la respuesta"}</div>

          <div className="card-flip" style={styles.studyCardWrap} onClick={() => setFlipped(f => !f)}>
            <div style={{ width: "100%", height: 280, position: "relative" }}>
              <div className={`card-inner${flipped ? " flipped" : ""}`} style={{ width: "100%", height: "100%" }}>
                <div className="card-face" style={{ background: "rgba(255,255,255,0.95)" }}>
                  <div style={styles.studyCardText}>{activeBolilla.cards[activeCardIdx].front}</div>
                </div>
                <div className="card-face card-back-face" style={{ background: "rgba(255,255,255,0.15)", backdropFilter: "blur(10px)" }}>
                  <div style={{ ...styles.studyCardText, color: "#fff" }}>{activeBolilla.cards[activeCardIdx].back}</div>
                </div>
              </div>
            </div>
          </div>

          <div style={styles.studyControls}>
            <button className="btn-bounce" style={styles.navBtn} onClick={prevCard}>‹ Ant</button>
            <button className="btn-bounce" style={{ ...styles.flipBtn, borderColor: "rgba(255,255,255,0.5)" }} onClick={() => setFlipped(f => !f)}>
              {flipped ? "🔄 Volver" : "👁 Ver"}
            </button>
            <button className="btn-bounce" style={styles.navBtn} onClick={nextCard}>Sig ›</button>
          </div>

          <div style={{ height: 24 }} />
        </div>
      )}
    </div>
  );
}

const styles = {
  root: { fontFamily: "'Sora', sans-serif", maxWidth: 430, margin: "0 auto", minHeight: "100dvh", background: "#0f0f0f", color: "#111", position: "relative", overflow: "hidden" },
  screen: { display: "flex", flexDirection: "column", minHeight: "100dvh", background: "#f7f7f5" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "52px 24px 20px" },
  headerTitle: { fontSize: 28, fontWeight: 800, color: "#111", letterSpacing: "-0.5px" },
  headerSub: { fontSize: 13, color: "#888", marginTop: 2 },
  addBtn: { width: 46, height: 46, borderRadius: 15, background: "#111", color: "#fff", border: "none", fontSize: 26, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", lineHeight: 1, fontFamily: "'Sora', sans-serif", fontWeight: 300 },
  list: { display: "flex", flexDirection: "column", gap: 12, padding: "8px 20px 120px", overflowY: "auto" },
  bolillaCard: { display: "flex", alignItems: "center", justifyContent: "space-between", borderRadius: 16, padding: "16px 16px", cursor: "pointer", transition: "transform .15s", userSelect: "none" },
  dot: { width: 38, height: 38, borderRadius: 12, flexShrink: 0 },
  bolillaName: { fontSize: 16, fontWeight: 700, color: "#111" },
  bolillaSub: { fontSize: 12, color: "#666", marginTop: 2 },
  arrow: { fontSize: 22, color: "#bbb", fontWeight: 300 },
  emptyState: { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10, padding: 40 },
  emptyTitle: { fontSize: 18, fontWeight: 700, color: "#333" },
  emptySub: { fontSize: 13, color: "#999", textAlign: "center" },
  topBar: { display: "flex", alignItems: "center", padding: "52px 20px 16px", gap: 12 },
  backBtn: { background: "none", border: "none", fontSize: 17, color: "#555", cursor: "pointer", fontFamily: "'Sora', sans-serif", fontWeight: 600, padding: "6px 0" },
  topTitle: { fontSize: 18, fontWeight: 700, color: "#111" },
  formWrap: { display: "flex", flexDirection: "column", padding: "8px 24px 40px", gap: 8 },
  label: { fontSize: 12, fontWeight: 600, color: "#888", letterSpacing: 1, textTransform: "uppercase" },
  input: { borderRadius: 14, border: "2px solid #e0e0e0", padding: "14px 16px", fontSize: 16, color: "#111", background: "#fff", width: "100%", transition: "border .2s" },
  textarea: { borderRadius: 14, border: "2px solid #e0e0e0", padding: "14px 16px", fontSize: 15, color: "#111", background: "#fff", width: "100%", resize: "none", lineHeight: 1.5, transition: "border .2s" },
  colorGrid: { display: "flex", gap: 10, flexWrap: "wrap", marginTop: 4 },
  colorDot: { width: 38, height: 38, borderRadius: 12, cursor: "pointer", transition: "transform .2s, box-shadow .2s", border: "none" },
  preview: { display: "flex", alignItems: "center", gap: 12, borderRadius: 14, padding: "14px 16px", marginTop: 8 },
  primaryBtn: { borderRadius: 16, border: "none", padding: "16px 24px", fontSize: 16, fontWeight: 700, color: "#fff", cursor: "pointer", fontFamily: "'Sora', sans-serif", width: "100%", letterSpacing: "-0.3px", transition: "transform .15s, opacity .2s" },
  bolillaHeader: { display: "flex", alignItems: "center", padding: "52px 20px 20px", justifyContent: "space-between" },
  backBtnLight: { background: "rgba(0,0,0,0.15)", border: "none", borderRadius: 10, width: 36, height: 36, fontSize: 20, color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Sora', sans-serif" },
  bolillaHeaderTitle: { fontSize: 20, fontWeight: 800, color: "#fff", flex: 1, textAlign: "center" },
  deleteBtnHeader: { background: "rgba(0,0,0,0.15)", border: "none", borderRadius: 10, width: 36, height: 36, fontSize: 16, cursor: "pointer" },
  statsBar: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 24px" },
  stat: { display: "flex", flexDirection: "column" },
  statNum: { fontSize: 28, fontWeight: 800, lineHeight: 1 },
  statLabel: { fontSize: 12, color: "#888" },
  studyBtn: { borderRadius: 12, border: "none", padding: "12px 20px", fontSize: 14, fontWeight: 700, color: "#fff", cursor: "pointer", fontFamily: "'Sora', sans-serif" },
  cardItem: { display: "flex", alignItems: "center", background: "#fff", borderRadius: 16, padding: "16px", gap: 12, boxShadow: "0 1px 6px rgba(0,0,0,0.06)", cursor: "pointer" },
  cardFrontText: { fontSize: 14, fontWeight: 600, color: "#222", marginBottom: 6, fontFamily: "'DM Sans', sans-serif" },
  cardBackText: { fontSize: 13, color: "#666", fontFamily: "'DM Sans', sans-serif" },
  deleteCardBtn: { background: "#FFE5E5", border: "none", borderRadius: 10, width: 30, height: 30, fontSize: 18, color: "#FF6B6B", cursor: "pointer", flexShrink: 0 },
  fab: { position: "fixed", bottom: 32, right: 24, width: 60, height: 60, borderRadius: 20, border: "none", fontSize: 30, color: "#fff", cursor: "pointer", boxShadow: "0 8px 24px rgba(0,0,0,0.25)", display: "flex", alignItems: "center", justifyContent: "center", lineHeight: 1, fontFamily: "'Sora', sans-serif", fontWeight: 300 },
  previewCard: { display: "flex", gap: 10, marginTop: 16 },
  previewFace: { flex: 1, borderRadius: 14, padding: "14px", fontSize: 13, fontWeight: 600, minHeight: 70, fontFamily: "'DM Sans', sans-serif" },
  toast: { position: "fixed", bottom: 100, left: "50%", transform: "translateX(-50%)", padding: "12px 24px", borderRadius: 14, color: "#fff", fontSize: 14, fontWeight: 700, zIndex: 999, whiteSpace: "nowrap", boxShadow: "0 4px 20px rgba(0,0,0,0.3)" },
  modalOverlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 998, display: "flex", alignItems: "flex-end", padding: 20 },
  modal: { background: "#1a1a1a", borderRadius: 24, padding: "32px 24px", width: "100%", maxWidth: 390, margin: "0 auto" },
  modalTitle: { fontSize: 20, fontWeight: 800, color: "#fff" },
  modalSub: { fontSize: 14, color: "#888", marginTop: 8 },
  modalBtn: { flex: 1, borderRadius: 14, border: "none", padding: "14px", fontSize: 15, fontWeight: 700, color: "#fff", cursor: "pointer", fontFamily: "'Sora', sans-serif" },
  studyTopBar: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "52px 24px 8px" },
  studyBackBtn: { background: "rgba(0,0,0,0.2)", border: "none", borderRadius: 12, width: 36, height: 36, fontSize: 18, color: "#fff", cursor: "pointer" },
  studyProgress: { fontSize: 15, fontWeight: 700, color: "#fff" },
  progressBarWrap: { height: 4, background: "rgba(255,255,255,0.2)", margin: "0 24px 16px", borderRadius: 2, overflow: "hidden" },
  progressBar: { height: "100%", borderRadius: 2, transition: "width .3s" },
  studyHint: { textAlign: "center", fontSize: 13, color: "rgba(255,255,255,0.7)", padding: "0 24px" },
  studyCardWrap: { padding: "0 24px" },
  studyCardText: { fontSize: 18, fontWeight: 700, textAlign: "center", lineHeight: 1.5, color: "#222" },
  studyControls: { display: "flex", gap: 12, padding: "0 24px", alignItems: "center" },
  navBtn: { flex: 1, background: "rgba(0,0,0,0.2)", border: "none", borderRadius: 14, padding: "14px", fontSize: 15, fontWeight: 700, color: "#fff", cursor: "pointer", fontFamily: "'Sora', sans-serif" },
  flipBtn: { flex: 1, background: "transparent", border: "2px solid rgba(255,255,255,0.3)", borderRadius: 14, padding: "14px", fontSize: 15, fontWeight: 700, color: "#fff", cursor: "pointer", fontFamily: "'Sora', sans-serif" },
};
