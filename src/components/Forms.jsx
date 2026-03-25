import React from "react";
import { COLORS } from "../constants";

export function AddMateriaForm({ newName, setNewName, newColorIdx, setNewColorIdx, onSubmit, onCancel, styles }) {
  return (
    <div style={{ ...styles.screen, background: "#0d0d18" }}>
      <div style={styles.topBar}>
        <button style={styles.backBtn} onClick={onCancel}>‹ Volver</button>
        <div style={styles.topTitle}>Nueva Materia</div>
      </div>
      <div style={styles.formWrap}>
        <label style={styles.label}>Nombre de la materia</label>
        <input style={styles.input} placeholder="Ej: Anatomía, Física..." value={newName}
          onChange={e => setNewName(e.target.value)} onKeyDown={e => e.key === "Enter" && onSubmit()} autoFocus />

        <label style={styles.label}>Color</label>
        <div style={styles.colorGrid}>
          {COLORS.map((c, i) => (
            <button key={i} className="btn-bounce"
              style={{ ...styles.colorDot, background: c.bg, border: newColorIdx === i ? "3px solid #fff" : "3px solid transparent", boxShadow: newColorIdx === i ? `0 0 0 3px ${c.bg}88, 0 6px 20px ${c.bg}55` : `0 4px 12px ${c.bg}33` }}
              onClick={() => setNewColorIdx(i)} />
          ))}
        </div>

        {newName.trim() && (
          <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: "16px", display: "flex", alignItems: "center", gap: 14, marginTop: 8 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: `linear-gradient(135deg, ${COLORS[newColorIdx].bg}, ${COLORS[newColorIdx].bg}cc)`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 4px 14px ${COLORS[newColorIdx].bg}44` }}>
              <span style={{ color: "#fff", fontSize: 17, fontWeight: 800 }}>{newName[0]?.toUpperCase()}</span>
            </div>
            <span style={{ fontSize: 16, fontWeight: 700, color: "#e8e8ff" }}>{newName}</span>
          </div>
        )}

        <button className="btn-bounce"
          style={{ ...styles.primaryBtn, background: newName.trim() ? `linear-gradient(135deg, ${COLORS[newColorIdx].bg}, ${COLORS[newColorIdx].bg}aa)` : "rgba(255,255,255,0.06)", boxShadow: newName.trim() ? `0 8px 24px ${COLORS[newColorIdx].bg}44` : "none", marginTop: 24 }}
          onClick={onSubmit} disabled={!newName.trim()}>
          Crear Materia
        </button>
      </div>
    </div>
  );
}

export function AddBolillaForm({ newName, setNewName, onSubmit, onCancel, color, styles }) {
  return (
    <div style={{ ...styles.screen, background: "#0d0d18" }}>
      <div style={styles.topBar}>
        <button style={styles.backBtn} onClick={onCancel}>‹ Volver</button>
        <div style={styles.topTitle}>Nueva Bolilla</div>
      </div>
      <div style={styles.formWrap}>
        <label style={styles.label}>Nombre del tema</label>
        <input style={{ ...styles.input, borderColor: newName.trim() ? color.bg + "66" : "rgba(255,255,255,0.08)" }}
          placeholder="Ej: Sistema Nervioso..." value={newName}
          onChange={e => setNewName(e.target.value)} onKeyDown={e => e.key === "Enter" && onSubmit()} autoFocus />
        <button className="btn-bounce"
          style={{ ...styles.primaryBtn, background: newName.trim() ? `linear-gradient(135deg, ${color.bg}, ${color.bg}aa)` : "rgba(255,255,255,0.06)", boxShadow: newName.trim() ? `0 8px 24px ${color.bg}44` : "none", marginTop: 24 }}
          onClick={onSubmit} disabled={!newName.trim()}>
          Crear Bolilla
        </button>
      </div>
    </div>
  );
}

export function CardForm({ isEdit, front, setFront, back, setBack, onSubmit, onCancel, color, styles }) {
  return (
    <div style={{ ...styles.screen, background: "#0d0d18" }}>
      <div style={{ ...styles.topBar }}>
        <button style={styles.backBtn} onClick={onCancel}>‹ Volver</button>
        <div style={styles.topTitle}>{isEdit ? "Editar Flashcard" : "Nueva Flashcard"}</div>
      </div>
      <div style={styles.formWrap}>
        <label style={styles.label}>Frente · Pregunta</label>
        <textarea style={{ ...styles.textarea, borderColor: front.trim() ? color.bg + "66" : "rgba(255,255,255,0.08)" }}
          placeholder="¿Cuál es la pregunta?" value={front} onChange={e => setFront(e.target.value)} rows={3} autoFocus />

        <label style={{ ...styles.label, marginTop: 16 }}>Dorso · Respuesta</label>
        <textarea style={{ ...styles.textarea, borderColor: back.trim() ? color.bg + "44" : "rgba(255,255,255,0.08)" }}
          placeholder="Escribe la respuesta completa..." value={back} onChange={e => setBack(e.target.value)} rows={5} />

        {/* Mini preview */}
        {front && back && (
          <div style={{ marginTop: 16, borderRadius: 16, overflow: "hidden", border: "1px solid rgba(255,255,255,0.06)" }}>
            <div style={{ background: `${color.bg}18`, padding: "12px 16px", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
              <div style={{ fontSize: 10, color: color.bg, fontWeight: 700, letterSpacing: 1, marginBottom: 6 }}>FRENTE</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#d0d0f0" }}>{front}</div>
            </div>
            <div style={{ background: "rgba(255,255,255,0.02)", padding: "12px 16px" }}>
              <div style={{ fontSize: 10, color: "#5a5a7a", fontWeight: 700, letterSpacing: 1, marginBottom: 6 }}>DORSO</div>
              <div style={{ fontSize: 13, color: "#7070a0", lineHeight: 1.5 }}>{back}</div>
            </div>
          </div>
        )}

        <button className="btn-bounce"
          style={{ ...styles.primaryBtn, background: front.trim() && back.trim() ? `linear-gradient(135deg, ${color.bg}, ${color.bg}aa)` : "rgba(255,255,255,0.06)", boxShadow: front.trim() && back.trim() ? `0 8px 24px ${color.bg}44` : "none", marginTop: 24 }}
          onClick={onSubmit} disabled={!front.trim() || !back.trim()}>
          {isEdit ? "Guardar Cambios" : "Crear Flashcard"}
        </button>
      </div>
    </div>
  );
}
