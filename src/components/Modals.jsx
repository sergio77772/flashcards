import React from "react";

export function TourModal({ tourSteps, tourIdx, setTourIdx, setIsTourOpen, styles }) {
  return (
    <div style={styles.modalOverlay} onClick={() => setIsTourOpen(false)}>
      <div style={{ ...styles.modal, background: "#fff", color: "#111" }} onClick={e => e.stopPropagation()}>
        <div style={{ ...styles.modalTitle, color: "#111" }}>{tourSteps[tourIdx].title}</div>
        <div style={{ ...styles.modalSub, color: "#666", marginTop: 12, fontSize: 16, lineHeight: 1.5 }}>
          {tourSteps[tourIdx].msg}
        </div>
        <div style={{ display: "flex", gap: 12, marginTop: 32 }}>
          <button style={{ ...styles.modalBtn, background: "#f0f0f0", color: "#666" }} onClick={() => setIsTourOpen(false)}>Cerrar</button>
          <button style={{ ...styles.modalBtn, background: "#111", color: "#fff" }} onClick={() => {
            if (tourIdx + 1 < tourSteps.length) setTourIdx(i => i + 1);
            else setIsTourOpen(false);
          }}>
            {tourIdx + 1 < tourSteps.length ? "Siguiente ›" : "¡Entendido!"}
          </button>
        </div>
      </div>
    </div>
  );
}

export function DeleteModal({ confirm, onCancel, onDelete, styles }) {
  return (
    <div style={styles.modalOverlay} onClick={onCancel}>
      <div style={styles.modal} onClick={e => e.stopPropagation()}>
        <div style={styles.modalTitle}>¿Eliminar?</div>
        <div style={styles.modalSub}>Esta acción no se puede deshacer.</div>
        <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
          <button style={{ ...styles.modalBtn, background: "#222" }} onClick={onCancel}>Cancelar</button>
          <button style={{ ...styles.modalBtn, background: "#FF6B6B" }} onClick={onDelete}>Eliminar</button>
        </div>
      </div>
    </div>
  );
}
