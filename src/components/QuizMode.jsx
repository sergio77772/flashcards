import React from "react";

export default function QuizMode({
  screen,
  isExam,
  quizFinished,
  quizIdx,
  quizQuestions,
  examTimer,
  selectedAnswer,
  quizScore,
  handleQuizAnswer,
  startExam,
  startQuiz,
  setScreen,
  setIsExam,
  setSelectedAnswer,
  formatTime,
  styles,
}) {
  return (
    <div style={{ ...styles.screen, background: "#0f0f0f", color: "#fff" }}>
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
            setScreen("home");
            setSelectedAnswer(null);
            setIsExam(false);
          }}
        >
          ✕
        </button>
        <div style={{ fontSize: 15, fontWeight: 700 }}>
          {!quizFinished
            ? isExam
              ? `Examen: ${quizIdx + 1}/${quizQuestions.length}`
              : `Test: ${quizIdx + 1}/${quizQuestions.length}`
            : "Resultados"}
        </div>
        {isExam && !quizFinished ? (
          <div
            style={{
              background: "rgba(255,255,255,0.1)",
              padding: "4px 10px",
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 700,
            }}
          >
            {formatTime(examTimer)}
          </div>
        ) : (
          <div style={{ width: 36 }} />
        )}
      </div>
      {!quizFinished ? (
        <div
          style={{
            padding: 24,
            flex: 1,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              height: 6,
              background: "#333",
              borderRadius: 3,
              marginBottom: 32,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                background: "#4ECDC4",
                width: `${(quizIdx / quizQuestions.length) * 100}%`,
                transition: "width 0.3s",
              }}
            />
          </div>
          <div
            style={{
              background: "#1a1a1a",
              padding: 24,
              borderRadius: 24,
              marginBottom: 24,
              flexShrink: 0,
            }}
          >
            <div
              style={{
                fontSize: 13,
                color: "#888",
                marginBottom: 12,
                fontWeight: 700,
                letterSpacing: 1,
              }}
            >
              ELIGE LA OPCIÓN CORRECTA
            </div>
            <h2 style={{ fontSize: 22, fontWeight: 700 }}>
              {quizQuestions[quizIdx].question}
            </h2>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 12,
              flex: 1,
            }}
          >
            {quizQuestions[quizIdx].options.map((opt, i) => {
              const isSelected = selectedAnswer === opt;
              const isCorrect = opt === quizQuestions[quizIdx].correctAnswer;
              let bg = "#1a1a1a",
                bd = "#333",
                col = "#fff";
              if (!isExam && selectedAnswer !== null) {
                if (isCorrect) {
                  bg = "#E0F7F6";
                  bd = "#4ECDC4";
                  col = "#111";
                } else if (isSelected) {
                  bg = "#FFE0E0";
                  bd = "#FF6B6B";
                  col = "#111";
                }
              } else if (isSelected) bd = "#fff";
              return (
                <button
                  key={i}
                  className="btn-bounce"
                  onClick={() => handleQuizAnswer(opt)}
                  style={{
                    background: bg,
                    border: `2px solid ${bd}`,
                    borderRadius: 20,
                    padding: "20px 24px",
                    color: col,
                    fontSize: 15,
                    fontWeight: 600,
                    textAlign: "left",
                    cursor:
                      selectedAnswer !== null && !isExam
                        ? "default"
                        : "pointer",
                  }}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        </div>
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
          <div style={{ fontSize: 72, marginBottom: 16 }}>
            {quizScore > quizQuestions.length / 2 ? "🏆" : "😅"}
          </div>
          <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 8 }}>
            {isExam ? "Examen Finalizado" : "Test Completado"}
          </h1>

          <div
            style={{
              background: "#1a1a1a",
              border: "1px solid #333",
              borderRadius: 24,
              padding: 24,
              width: "100%",
              marginBottom: 32,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 16,
              }}
            >
              <span style={{ color: "#888" }}>Puntaje:</span>
              <span style={{ fontWeight: 700, color: "#4ECDC4" }}>
                {Math.round((quizScore / quizQuestions.length) * 100)}% (
                {quizScore}/{quizQuestions.length})
              </span>
            </div>
            {isExam && (
              <>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 16,
                  }}
                >
                  <span style={{ color: "#888" }}>Tiempo total:</span>
                  <span style={{ fontWeight: 700 }}>
                    {formatTime(examTimer)}
                  </span>
                </div>
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <span style={{ color: "#888" }}>Tiempo promedio:</span>
                  <span style={{ fontWeight: 700 }}>
                    {Math.round(examTimer / quizQuestions.length)}s / preg
                  </span>
                </div>
              </>
            )}
          </div>

          <button
            className="btn-bounce"
            style={{
              ...styles.primaryBtn,
              background: "#4ECDC4",
              color: "#111",
            }}
            onClick={() => (isExam ? startExam() : startQuiz())}
          >
            Reiniciar
          </button>
          <button
            className="btn-bounce"
            style={{
              ...styles.primaryBtn,
              background: "transparent",
              color: "#fff",
              border: "2px solid #333",
              marginTop: 12,
            }}
            onClick={() => {
              setScreen("home");
              setIsExam(false);
            }}
          >
            Ir al inicio
          </button>
        </div>
      )}
    </div>
  );
}
