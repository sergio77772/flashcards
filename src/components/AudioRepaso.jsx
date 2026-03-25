import React from "react";

export default function AudioRepaso({
  studyQueue,
  audioIdx,
  audioPlaying,
  audioStep,
  setAudioIdx,
  setAudioStep,
  toggleAudio,
  setScreen,
  styles,
}) {
  return (
    <div
      style={{
        ...styles.screen,
        background: "#111",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 52,
          left: 24,
          right: 24,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <button
          style={styles.studyBackBtn}
          onClick={() => {
            window.speechSynthesis.cancel();
            setScreen("home");
          }}
        >
          ‹
        </button>
        <div style={{ color: "#fff", fontWeight: 700 }}>MODO AUDIO</div>
        <div style={{ width: 24 }} />
      </div>

      <div
        style={{ fontSize: 80, marginBottom: 40, opacity: 0.1, color: "#fff" }}
      >
        {audioIdx + 1}/{studyQueue.length}
      </div>

      <div
        style={{
          textAlign: "center",
          padding: "0 40px",
          minHeight: 180,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            fontSize: 18,
            color: "rgba(255,255,255,0.5)",
            marginBottom: 12,
          }}
        >
          {audioStep === "front"
            ? "PREGUNTA:"
            : audioStep === "back"
              ? "RESPUESTA:"
              : "PIENSA..."}
        </div>
        <div
          style={{
            fontSize: 28,
            fontWeight: 800,
            color: audioStep === "back" ? "#4ECDC4" : "#fff",
            lineHeight: 1.3,
          }}
        >
          {audioStep === "back"
            ? studyQueue[audioIdx]?.back
            : studyQueue[audioIdx]?.front}
        </div>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 32,
          marginTop: 60,
        }}
      >
        <button
          style={{
            background: "transparent",
            border: "none",
            color: "#fff",
            fontSize: 32,
            cursor: "pointer",
          }}
          onClick={() => {
            setAudioIdx((prev) => Math.max(0, prev - 1));
            setAudioStep("front");
          }}
        >
          ⏮
        </button>
        <button
          style={{
            width: 100,
            height: 100,
            borderRadius: 50,
            background: "rgba(255,255,255,0.04)",
            border: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 32,
            cursor: "pointer",
          }}
          onClick={toggleAudio}
        >
          {audioPlaying ? "⏸" : "▶️"}
        </button>
        <button
          style={{
            background: "transparent",
            border: "none",
            color: "#fff",
            fontSize: 32,
            cursor: "pointer",
          }}
          onClick={() => {
            setAudioIdx((prev) => (prev + 1) % studyQueue.length);
            setAudioStep("front");
          }}
        >
          ⏭
        </button>
      </div>

      <div style={{ marginTop: 40, width: "100%", padding: 24 }}>
        <div
          style={{
            height: 4,
            background: "rgba(255,255,255,0.1)",
            borderRadius: 2,
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${((audioIdx + 1) / studyQueue.length) * 100}%`,
              background: "rgba(255,255,255,0.04)",
              borderRadius: 2,
              transition: "width 0.3s",
            }}
          />
        </div>
      </div>
    </div>
  );
}
