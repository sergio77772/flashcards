import React from "react";

export function TourModal({ tourSteps, tourIdx, setTourIdx, setIsTourOpen, styles }) {
  return (
    <div style={styles.modalOverlay} onClick={() => setIsTourOpen(false)}>
      <div style={styles.modal} onClick={e => e.stopPropagation()}>
        <div style={{ fontSize: 32, marginBottom: 16 }}>{tourSteps[tourIdx].icon || "💡"}</div>
        <div style={styles.modalTitle}>{tourSteps[tourIdx].title}</div>
        <div style={{ ...styles.modalSub, fontSize: 15, lineHeight: 1.6, marginTop: 12 }}>
          {tourSteps[tourIdx].msg}
        </div>
        <div style={{ display: "flex", gap: 12, marginTop: 28 }}>
          <button style={{ ...styles.modalBtn, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }} onClick={() => setIsTourOpen(false)}>Cerrar</button>
          <button style={{ ...styles.modalBtn, background: "linear-gradient(135deg, #7c6fff, #5a4fd4)" }} onClick={() => {
            if (tourIdx + 1 < tourSteps.length) setTourIdx(i => i + 1);
            else setIsTourOpen(false);
          }}>
            {tourIdx + 1 < tourSteps.length ? "Siguiente ›" : "¡Entendido!"}
          </button>
        </div>
        <div style={{ display: "flex", justifyContent: "center", gap: 6, marginTop: 20 }}>
          {tourSteps.map((_, i) => (
            <div key={i} style={{ width: i === tourIdx ? 20 : 6, height: 6, borderRadius: 3, background: i === tourIdx ? "#7c6fff" : "rgba(255,255,255,0.15)", transition: "width .3s, background .3s" }} />
          ))}
        </div>
      </div>
    </div>
  );
}

export function DeleteModal({ confirm, onCancel, onDelete, styles }) {
  return (
    <div style={styles.modalOverlay} onClick={onCancel}>
      <div style={styles.modal} onClick={e => e.stopPropagation()}>
        <div style={{ fontSize: 36, marginBottom: 12 }}>🗑️</div>
        <div style={styles.modalTitle}>¿Eliminar?</div>
        <div style={styles.modalSub}>Esta acción no se puede deshacer.</div>
        <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
          <button style={{ ...styles.modalBtn, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }} onClick={onCancel}>Cancelar</button>
          <button style={{ ...styles.modalBtn, background: "linear-gradient(135deg, #ff6b6b, #e05555)" }} onClick={onDelete}>Eliminar</button>
        </div>
      </div>
    </div>
  );
}
