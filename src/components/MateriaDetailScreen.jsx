import React from "react";
import { COLORS } from "../constants";

export default function MateriaDetailScreen({
  activeMateria,
  activeMateriaId,
  color,
  setScreen,
  setDeleteConfirm,
  setMateriaDeadline,
  setNewName,
  startAudioRepaso,
  setIsExam,
  startQuiz,
  startExam,
  setActiveBolillaId,
  styles,
}) {
  return (
    <div style={styles.screen}>
      <div
        style={{
          ...styles.materiaHeader,
          background: color.bg,
          paddingBottom: 24,
          flexDirection: "column",
          gap: 16,
        }}
      >
        <div
          style={{
            display: "flex",
            width: "100%",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <button style={styles.backBtnLight} onClick={() => setScreen("home")}>
            ‹
          </button>
          <div
            style={{
              fontSize: 24,
              fontWeight: 800,
              color: "#fff",
              flex: 1,
              textAlign: "center",
            }}
          >
            {activeMateria.name}
          </div>
          <button
            style={styles.deleteBtnHeader}
            onClick={() =>
              setDeleteConfirm({ type: "materia", id: activeMateriaId })
            }
          >
            🗑
          </button>
        </div>

        <div
          style={{
            background: "rgba(255,255,255,0.15)",
            width: "100%",
            padding: 16,
            borderRadius: 24,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                color: "rgba(255,255,255,0.6)",
              }}
            >
              BOLILLAS TOTALES
            </span>
            <span style={{ fontSize: 18, fontWeight: 800, color: "#fff" }}>
              {(activeMateria.bolillas || []).length} topics
            </span>
          </div>
          <div
            style={{
              textAlign: "right",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                color: "rgba(255,255,255,0.6)",
              }}
            >
              OBJETIVO EXAMEN 📅
            </span>
            <input
              type="date"
              value={activeMateria.examDate || ""}
              style={{
                background: "transparent",
                border: "none",
                fontSize: 14,
                fontWeight: 800,
                color: "#fff",
                textAlign: "right",
                padding: 0,
              }}
              onChange={(e) => setMateriaDeadline(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div
        style={{ padding: "16px 20px", display: "flex", gap: 8, flexWrap: "wrap" }}
      >
        <button
          className="btn-bounce"
          style={{
            ...styles.primaryBtn,
            flex: "1 0 auto",
            padding: "14px 10px",
            background: color.bg,
          }}
          onClick={() => {
            setNewName("");
            setScreen("addBolilla");
          }}
        >
          + Bolilla
        </button>
        <button
          className="btn-bounce"
          style={{
            ...styles.primaryBtn,
            flex: "1 0 auto",
            gap: 6,
            padding: "14px 10px",
            background: "#f0f0f0",
            color: "#111",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          onClick={() => startAudioRepaso("materia")}
        >
          🎧 Audio
        </button>
        <button
          className="btn-bounce"
          style={{
            ...styles.primaryBtn,
            flex: "1 0 auto",
            gap: 6,
            padding: "14px 10px",
            background: "#4ECDC4",
            color: "#111",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          onClick={() => {
            setIsExam(false);
            startQuiz("materia");
          }}
        >
          🧠 Test
        </button>
        <button
          className="btn-bounce"
          style={{
            ...styles.primaryBtn,
            flex: "1 0 auto",
            gap: 6,
            padding: "14px 10px",
            background: "#111",
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          onClick={() => startExam("materia")}
        >
          📝 Exam
        </button>
      </div>

      <div style={styles.list}>
        {!activeMateria.bolillas || activeMateria.bolillas.length === 0 ? (
          <div style={styles.emptyState}>
            <div style={{ fontSize: 48 }}>📖</div>
            <div style={styles.emptyTitle}>Sin bolillas</div>
            <div style={styles.emptySub}>
              Agrega la primera bolilla de estudio del programa.
            </div>
          </div>
        ) : (
          activeMateria.bolillas.map((b) => {
            const masteredCount = (b.cards || []).filter(
              (card) => (card.interval || 0) >= 15,
            ).length;
            const totalCardsCount = (b.cards || []).length;
            const progressPct =
              totalCardsCount > 0
                ? Math.round((masteredCount / totalCardsCount) * 100)
                : 0;

            return (
              <div
                key={b.id}
                className="list-item"
                style={{
                  ...styles.bolillaCardBase,
                  flexDirection: "column",
                  alignItems: "flex-start",
                  gap: 12,
                  padding: "16px 20px",
                }}
                onClick={() => {
                  setActiveBolillaId(b.id);
                  setScreen("bolilla");
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    width: "100%",
                    alignItems: "center",
                  }}
                >
                  <div style={styles.itemName}>{b.name}</div>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <span style={styles.pill}>{totalCardsCount} cards</span>
                    <div style={styles.arrow}>›</div>
                  </div>
                </div>

                {/* Mini Progress Bar */}
                <div style={{ width: "100%" }}>
                  <div
                    style={{
                      height: 4,
                      background: "rgba(0,0,0,0.05)",
                      borderRadius: 2,
                      width: "100%",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        width: `${progressPct}%`,
                        background: COLORS[activeMateria.colorIdx].bg,
                        borderRadius: 2,
                        transition: "width 0.5s",
                      }}
                    />
                  </div>
                  <div
                    style={{
                      fontSize: 9,
                      color: "#888",
                      marginTop: 4,
                      fontWeight: 600,
                    }}
                  >
                    {progressPct}% COMPLETADO
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
