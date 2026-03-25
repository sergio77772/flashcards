import React from "react";

export default function Dashboard({ materias, userData, styles }) {
  const allCards = materias
    .flatMap((m) => m.bolillas || [])
    .flatMap((b) => b.cards || []);
  const totalCards = allCards.length;
  const mastered = allCards.filter((c) => (c.interval || 0) >= 15).length;

  // Calcular próximos repasos
  const upcoming = Array(7).fill(0);
  allCards.forEach((c) => {
    const diff = Math.floor(
      (c.nextReview - Date.now()) / (1000 * 60 * 60 * 24),
    );
    if (diff >= 0 && diff < 7) upcoming[diff]++;
  });
  const maxUpcoming = Math.max(...upcoming, 5);

  // Recomendación
  const nextExam = materias
    .filter((m) => m.examDate)
    .sort((a, b) => new Date(a.examDate) - new Date(b.examDate))[0];
  let studyTip = "💡 Tip: Repasar 15 min al día mantiene tu racha viva.";
  if (nextExam) {
    const daysLeft = Math.ceil(
      (new Date(nextExam.examDate) - Date.now()) / (1000 * 60 * 60 * 24),
    );
    const leftToMaster = totalCards - mastered;
    if (daysLeft > 0 && leftToMaster > 0) {
      studyTip = `🎯 Meta: Domina ${Math.ceil(leftToMaster / daysLeft)} tarjetas diarias para tu examen en ${daysLeft} días.`;
    }
  }

  return (
    <div style={styles.dashboardCard}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 24,
        }}
      >
        <div style={styles.dashboardStat}>
          <div style={{ fontSize: 24, fontWeight: 800 }}>
            {userData?.streak || 0}🔥
          </div>
          <div style={{ fontSize: 10, color: "#888", fontWeight: 700 }}>
            RACHA
          </div>
        </div>
        <div style={styles.dashboardStat}>
          <div style={{ fontSize: 24, fontWeight: 800 }}>{mastered}✅</div>
          <div style={{ fontSize: 10, color: "#888", fontWeight: 700 }}>
            DOMINADAS
          </div>
        </div>
        <div style={styles.dashboardStat}>
          <div style={{ fontSize: 24, fontWeight: 800 }}>{totalCards}📚</div>
          <div style={{ fontSize: 10, color: "#888", fontWeight: 700 }}>
            TOTAL
          </div>
        </div>
      </div>

      <div
        style={{
          marginBottom: 12,
          fontSize: 11,
          fontWeight: 800,
          color: "#333",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span>PROGRESO DE APRENDIZAJE ✨</span>
        <span style={{ color: "#A29BFE" }}>
          {Math.round((mastered / totalCards || 0) * 100)}%
        </span>
      </div>

      <div
        style={{
          position: "relative",
          height: 160,
          background: "rgba(162, 155, 254, 0.05)",
          borderRadius: 20,
          padding: 20,
          overflow: "hidden",
        }}
      >
        <svg
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            width: "100%",
            height: "100%",
            opacity: 0.3,
          }}
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          <path
            d="M0,80 C20,70 40,90 60,60 C80,30 100,50 100,20 L100,100 L0,100 Z"
            fill="url(#grad)"
          />
          <defs>
            <linearGradient id="grad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#A29BFE" />
              <stop offset="100%" stopColor="transparent" />
            </linearGradient>
          </defs>
        </svg>

        <div
          style={{
            position: "relative",
            height: "100%",
            display: "flex",
            alignItems: "flex-end",
            gap: 10,
          }}
        >
          {upcoming.map((count, i) => {
            const h = (count / maxUpcoming) * 100;
            return (
              <div
                key={i}
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <div
                  style={{
                    width: "100%",
                    height: `${h}%`,
                    background: i === 0 ? "#A29BFE" : "#fff",
                    borderRadius: 6,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                    position: "relative",
                  }}
                >
                  {count > 0 && (
                    <div
                      style={{
                        position: "absolute",
                        top: -20,
                        left: 0,
                        right: 0,
                        textAlign: "center",
                        fontSize: 10,
                        fontWeight: 800,
                        color: "#111",
                      }}
                    >
                      {count}
                    </div>
                  )}
                </div>
                <div
                  style={{
                    fontSize: 9,
                    fontWeight: 800,
                    color: i === 0 ? "#A29BFE" : "#888",
                  }}
                >
                  {["HOY", "MAÑ", "MAR", "MIE", "JUE", "VIE", "SAB"][i]}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div
        style={{
          marginTop: 24,
          background: "#111",
          padding: 16,
          borderRadius: 16,
          borderLeft: "4px solid #A29BFE",
        }}
      >
        <div
          style={{
            fontSize: 13,
            fontWeight: 700,
            color: "#fff",
            lineHeight: 1.4,
          }}
        >
          {studyTip}
        </div>
      </div>
    </div>
  );
}
