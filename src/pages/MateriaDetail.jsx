import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { COLORS } from "../constants";

export default function MateriaDetail({
  materias, setScreen, setDeleteConfirm,
  setMateriaDeadline, setNewName, startAudioRepaso, setIsExam, startQuiz, startExam,
  setActiveBolillaId, styles,
}) {
  const { id } = useParams();
  const navigate = useNavigate();
  const activeMateria = materias.find(m => m.id === id);

  if (!activeMateria) {
    return <div style={{ color: "#fff", padding: 20 }}>Materia no encontrada</div>;
  }

  const bolillas = activeMateria.bolillas || [];
  const allCards = bolillas.flatMap(b => b.cards || []);
  const mastered = allCards.filter(c => (c.interval || 0) >= 6).length;
  const progressPct = allCards.length > 0 ? Math.round((mastered / allCards.length) * 100) : 0;
  const color = COLORS[activeMateria.colorIdx] || COLORS[0];

  return (
    <div style={{ ...styles.screen, background: "#0d0d18" }}>
      {/* Header */}
      <div style={{ padding: "52px 20px 24px", background: `linear-gradient(160deg, ${color.bg}33, ${color.bg}11)`, borderBottom: `1px solid ${color.bg}22` }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <button style={styles.backBtnLight} onClick={() => navigate("/")}>‹</button>
          <div style={{ fontSize: 20, fontWeight: 800, color: "#f0f0ff", letterSpacing: "-0.5px" }}>{activeMateria.name}</div>
          <button style={styles.deleteBtnHeader} onClick={() => setDeleteConfirm({ type: "materia", id: id })}>🗑</button>
        </div>

        {/* Stats strip */}
        <div style={{ display: "flex", gap: 10 }}>
          {[
            { label: "Bolillas", val: bolillas.length },
            { label: "Tarjetas", val: allCards.length },
            { label: "Dominio", val: `${progressPct}%` },
          ].map((s, i) => (
            <div key={i} style={{ flex: 1, background: "rgba(0,0,0,0.3)", backdropFilter: "blur(10px)", borderRadius: 14, padding: "12px 10px", textAlign: "center", border: `1px solid ${color.bg}22` }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: color.bg }}>{s.val}</div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", fontWeight: 700, letterSpacing: 0.5, marginTop: 2 }}>{s.label.toUpperCase()}</div>
            </div>
          ))}
        </div>

        {/* Exam date */}
        <div style={{ marginTop: 14, display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", background: "rgba(255,255,255,0.04)", borderRadius: 12, border: "1px solid rgba(255,255,255,0.06)" }}>
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", fontWeight: 800, letterSpacing: 1 }}>FECHA DE EXAMEN:</span>
          <input 
            type="date" 
            value={activeMateria.examDate || ""} 
            onChange={(e) => setMateriaDeadline(id, e.target.value)}
            style={{ 
              background: "transparent", 
              border: "none", 
              fontSize: 14, 
              fontWeight: 700, 
              color: "#fff", 
              outline: "none", 
              flex: 1,
              colorScheme: "dark",
              fontFamily: "inherit"
            }} 
          />
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: 8, padding: "16px 18px 8px", flexWrap: "wrap" }}>
        <button className="btn-bounce" style={{ ...styles.primaryBtn, flex: "1 0 auto", padding: "13px 10px", background: `linear-gradient(135deg, ${color.bg}, ${color.bg}aa)`, boxShadow: `0 6px 20px ${color.bg}44`, fontSize: 14 }}
          onClick={() => { setNewName(""); navigate(`/add-bolilla/${id}`); }}>
          + Bolilla
        </button>
        <button className="btn-bounce" style={{ ...styles.primaryBtn, flex: "1 0 auto", padding: "13px 10px", background: "rgba(255,255,255,0.06)", color: "#c0c0e0", border: "1px solid rgba(255,255,255,0.08)", fontSize: 14 }}
          onClick={() => { startAudioRepaso("materia"); navigate("/audio-repaso"); }}>
          🎧 Audio
        </button>
        <button className="btn-bounce" style={{ ...styles.primaryBtn, flex: "1 0 auto", padding: "13px 10px", background: "rgba(78,205,196,0.15)", color: "#4ecdc4", border: "1px solid rgba(78,205,196,0.25)", fontSize: 14 }}
          onClick={() => { setIsExam(false); startQuiz("materia", materias, id); navigate("/quiz"); }}>
          🧠 Test
        </button>
        <button className="btn-bounce" style={{ ...styles.primaryBtn, flex: "1 0 auto", padding: "13px 10px", background: "rgba(255,255,255,0.06)", color: "#c0c0e0", border: "1px solid rgba(255,255,255,0.08)", fontSize: 14 }}
          onClick={() => { startExam("materia", materias, id); navigate("/quiz"); }}>
          📝 Exam
        </button>
      </div>

      {/* Bolillas list */}
      <div style={styles.list}>
        {bolillas.length === 0 ? (
          <div style={styles.emptyState}>
            <div style={{ fontSize: 48, marginBottom: 8 }}>📖</div>
            <div style={styles.emptyTitle}>Sin bolillas</div>
            <div style={styles.emptySub}>Agregá la primera bolilla del programa</div>
          </div>
        ) : (
          bolillas.map((b) => {
            const total = (b.cards || []).length;
            const done = (b.cards || []).filter(c => (c.interval || 0) >= 6).length;
            const pct = total > 0 ? Math.round((done / total) * 100) : 0;

            return (
              <div key={b.id} className="list-item" style={{ ...styles.bolillaCardBase, flexDirection: "column", alignItems: "flex-start", gap: 12, padding: "18px" }}
                onClick={() => { setActiveBolillaId(b.id); navigate(`/materia/${id}/bolilla/${b.id}`); }}>
                <div style={{ display: "flex", justifyContent: "space-between", width: "100%", alignItems: "center" }}>
                  <div style={styles.itemName}>{b.name}</div>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <span style={{ ...styles.pill, background: `${color.bg}18`, color: color.bg }}>{total} cards</span>
                    <div style={styles.arrow}>›</div>
                  </div>
                </div>

                <div style={{ width: "100%" }}>
                  <div style={{ height: 4, background: "rgba(255,255,255,0.06)", borderRadius: 2, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${pct}%`, background: `linear-gradient(90deg, ${color.bg}, ${color.bg}99)`, borderRadius: 2, transition: "width 0.5s" }} />
                  </div>
                  <div style={{ fontSize: 10, color: "#4a4a6a", marginTop: 5, fontWeight: 700, letterSpacing: 0.5 }}>
                    {pct}% DOMINADO
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
