import React from "react";

export default function StudyMode({
  isStudyFinished,
  activeCardIdx,
  studyQueue,
  flipped,
  setFlipped,
  rateCard,
  speakText,
  setScreen,
  color,
  styles,
}) {
  return (
    <div
      style={{
        ...styles.screen,
        background: "#111",
        justifyContent: "space-between",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "52px 24px 8px",
        }}
      >
        <button
          style={styles.studyBackBtn}
          onClick={() => {
            setScreen("bolilla");
            window.speechSynthesis?.cancel();
          }}
        >
          ✕
        </button>
        <div style={{ fontSize: 15, color: "#fff", fontWeight: 700 }}>
          {!isStudyFinished
            ? `${activeCardIdx + 1} / ${studyQueue.length}`
            : "Progreso"}
        </div>
        {!isStudyFinished && (
          <button
            style={{ ...styles.studyBackBtn, fontSize: 22 }}
            onClick={(e) => {
              e.stopPropagation();
              speakText(
                flipped
                  ? studyQueue[activeCardIdx].back
                  : studyQueue[activeCardIdx].front,
              );
            }}
          >
            🔊
          </button>
        )}
      </div>

      {!isStudyFinished ? (
        <>
          <div style={{ padding: "0 24px" }}>
            <div
              style={{
                height: 4,
                background: "rgba(255,255,255,0.2)",
                borderRadius: 2,
              }}
            >
              <div
                style={{
                  background: "#fff",
                  height: "100%",
                  width: `${((activeCardIdx + 1) / studyQueue.length) * 100}%`,
                }}
              />
            </div>
          </div>
          <div
            style={{
              textAlign: "center",
              fontSize: 13,
              color: "rgba(255,255,255,0.6)",
              marginTop: 16,
            }}
          >
            {flipped ? "Califica tu recuerdo:" : "Tocá para ver la respuesta"}
          </div>

          <div
            className="card-flip"
            style={{
              flex: 1,
              padding: "20px 32px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            onClick={() => !flipped && setFlipped(true)}
          >
            <div
              style={{ width: "100%", height: "420px", position: "relative" }}
            >
              <div
                className={`card-inner${flipped ? " flipped" : ""}`}
                style={{ width: "100%", height: "100%" }}
              >
                {/* FRONT FACE */}
                <div
                  className="card-face"
                  style={{
                    background: "#fff",
                    color: "#111",
                    padding: 24,
                    borderRadius: 24,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    boxShadow: "0 10px 40px rgba(0,0,0,0.3)",
                    overflowY: "auto",
                  }}
                >
                  <div
                    style={{
                      fontSize: 24,
                      fontWeight: 800,
                      textAlign: "center",
                      width: "100%",
                      lineHeight: 1.4,
                    }}
                  >
                    {studyQueue[activeCardIdx].front}
                  </div>
                </div>

                {/* BACK FACE */}
                <div
                  className="card-face card-back-face"
                  style={{
                    background: color.bg,
                    color: "#fff",
                    padding: 24,
                    borderRadius: 24,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    boxShadow: "0 10px 40px rgba(0,0,0,0.4)",
                    overflowY: "auto",
                  }}
                >
                  <div
                    style={{
                      fontSize: 22,
                      fontWeight: 600,
                      textAlign: "center",
                      width: "100%",
                      lineHeight: 1.5,
                    }}
                  >
                    {studyQueue[activeCardIdx].back}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div style={{ padding: "24px 24px 40px" }}>
            {!flipped ? (
              <button
                className="btn-bounce"
                style={{
                  width: "100%",
                  background: "#fff",
                  color: "#111",
                  border: "none",
                  borderRadius: 20,
                  padding: "20px",
                  fontWeight: 800,
                  fontSize: 18,
                }}
                onClick={() => setFlipped(true)}
              >
                👁 VER RESPUESTA
              </button>
            ) : (
              <div style={{ display: "flex", gap: 12 }}>
                <button
                  className="btn-bounce"
                  style={{
                    flex: 1,
                    background: "#FF6B6B",
                    color: "#fff",
                    border: "none",
                    borderRadius: 16,
                    padding: "16px 8px",
                    fontWeight: 700,
                    fontSize: 13,
                  }}
                  onClick={() => rateCard(0)}
                >
                  ❌ No lo sabía
                </button>
                <button
                  className="btn-bounce"
                  style={{
                    flex: 1,
                    background: "#F0A500",
                    color: "#fff",
                    border: "none",
                    borderRadius: 16,
                    padding: "16px 8px",
                    fontWeight: 700,
                    fontSize: 13,
                  }}
                  onClick={() => rateCard(1)}
                >
                  😐 Dudé
                </button>
                <button
                  className="btn-bounce"
                  style={{
                    flex: 1,
                    background: "#4ECDC4",
                    color: "#fff",
                    border: "none",
                    borderRadius: 16,
                    padding: "16px 8px",
                    fontWeight: 700,
                    fontSize: 13,
                  }}
                  onClick={() => rateCard(2)}
                >
                  ✅ Fácil
                </button>
              </div>
            )}
          </div>
        </>
      ) : (
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
          }}
        >
          <div style={{ fontSize: 72, marginBottom: 16 }}>🚀</div>
          <h1
            style={{
              color: "#fff",
              fontSize: 28,
              fontWeight: 800,
              marginBottom: 8,
              textAlign: "center",
            }}
          >
            ¡Sesión Finalizada!
          </h1>
          <p
            style={{
              color: "#aaa",
              fontSize: 15,
              marginBottom: 32,
              textAlign: "center",
            }}
          >
            Has revisado todas las tarjetas pendientes. Vuelve más tarde para
            que el algoritmo te las asigne nuevamente.
          </p>
          <button
            className="btn-bounce"
            style={{ ...styles.primaryBtn, background: color.bg }}
            onClick={() => setScreen("bolilla")}
          >
            Volver a la bolilla
          </button>
        </div>
      )}
    </div>
  );
}
