import React from "react";
import { COLORS } from "../constants";

export function AddMateriaForm({ newName, setNewName, newColorIdx, setNewColorIdx, onSubmit, onCancel, styles }) {
  return (
    <div style={styles.screen}>
      <div style={styles.topBar}>
        <button style={styles.backBtn} onClick={onCancel}>‹ Volver</button>
        <div style={styles.topTitle}>Nueva Materia</div>
      </div>
      <div style={styles.formWrap}>
        <label style={styles.label}>Nombre</label>
        <input style={styles.input} placeholder="Ej: Anatomía" value={newName} onChange={e => setNewName(e.target.value)} onKeyDown={e => e.key === "Enter" && onSubmit()} autoFocus />
        <label style={styles.label}>Color de la materia</label>
        <div style={styles.colorGrid}>
          {COLORS.map((c, i) => (
            <button key={i} className="btn-bounce" style={{ ...styles.colorDot, background: c.bg, border: newColorIdx === i ? "3px solid #fff" : "3px solid transparent", boxShadow: newColorIdx === i ? `0 0 0 3px ${c.bg}` : "none" }} onClick={() => setNewColorIdx(i)} />
          ))}
        </div>
        <button className="btn-bounce" style={{ ...styles.primaryBtn, background: newName.trim() ? COLORS[newColorIdx].bg : "#333", marginTop: 24 }} onClick={onSubmit} disabled={!newName.trim()}>Crear Materia</button>
      </div>
    </div>
  );
}

export function AddBolillaForm({ newName, setNewName, onSubmit, onCancel, color, styles }) {
  return (
    <div style={styles.screen}>
      <div style={styles.topBar}>
        <button style={styles.backBtn} onClick={onCancel}>‹ Volver</button>
        <div style={styles.topTitle}>Nueva Bolilla</div>
      </div>
      <div style={styles.formWrap}>
        <label style={styles.label}>Nombre</label>
        <input style={styles.input} placeholder="Ej: Sistema Digestivo" value={newName} onChange={e => setNewName(e.target.value)} onKeyDown={e => e.key === "Enter" && onSubmit()} autoFocus />
        <button className="btn-bounce" style={{ ...styles.primaryBtn, background: newName.trim() ? color.bg : "#333", marginTop: 24 }} onClick={onSubmit} disabled={!newName.trim()}>Crear Bolilla</button>
      </div>
    </div>
  );
}

export function CardForm({ isEdit, front, setFront, back, setBack, onSubmit, onCancel, color, styles }) {
  return (
    <div style={styles.screen}>
      <div style={{ ...styles.topBar, background: "#fff" }}>
        <button style={styles.backBtn} onClick={onCancel}>‹ Volver</button>
        <div style={styles.topTitle}>{isEdit ? "Editar Flashcard" : "Nueva Flashcard"}</div>
      </div>
      <div style={styles.formWrap}>
        <label style={styles.label}>Frente (pregunta)</label>
        <textarea style={styles.textarea} placeholder="¿Cuál es tu pregunta?" value={front} onChange={e => setFront(e.target.value)} rows={3} autoFocus />
        <label style={{ ...styles.label, marginTop: 20 }}>Dorso (respuesta)</label>
        <textarea style={styles.textarea} placeholder="Escribe la respuesta..." value={back} onChange={e => setBack(e.target.value)} rows={4} />
        <button className="btn-bounce" style={{ ...styles.primaryBtn, background: front.trim() && back.trim() ? color.bg : "#333", marginTop: 24 }} onClick={onSubmit} disabled={!front.trim() || !back.trim()}>
          {isEdit ? "Guardar Cambios" : "Crear Flashcard"}
        </button>
      </div>
    </div>
  );
}
