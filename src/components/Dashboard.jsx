import React from "react";

export default function Dashboard({ materias, userData, styles }) {
  const allCards = materias.flatMap((m) => m.bolillas || []).flatMap((b) => b.cards || []);
  const totalCards = allCards.length;
  const mastered = allCards.filter((c) => (c.interval || 0) >= 15).length;

  const upcoming = Array(7).fill(0);
  allCards.forEach((c) => {
    const diff = Math.floor((c.nextReview - Date.now()) / (1000 * 60 * 60 * 24));
    if (diff >= 0 && diff < 7) upcoming[diff]++;
  });
  const maxUpcoming = Math.max(...upcoming, 5);

  const nextExam = materias.filter((m) => m.examDate).sort((a, b) => new Date(a.examDate) - new Date(b.examDate))[0];
  let studyTip = "Repasar 15 min al día mantiene tu racha viva.";
  if (nextExam) {
    const daysLeft = Math.ceil((new Date(nextExam.examDate) - Date.now()) / (1000 * 60 * 60 * 24));
    const leftToMaster = totalCards - mastered;
    if (daysLeft > 0 && leftToMaster > 0) {
      studyTip = `Domina ${Math.ceil(leftToMaster / daysLeft)} tarjetas diarias para tu examen en ${daysLeft} días.`;
    }
  }

  const progressPct = totalCards > 0 ? Math.round((mastered / totalCards) * 100) : 0;

  return (
    <div style={styles.dashboardCard}>
      {/* Top stats */}
      <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
        {[
          { val: `${userData?.streak || 0}`, icon: "🔥", label: "Racha" },
          { val: mastered, icon: "✅", label: "Dominadas" },
          { val: totalCards, icon: "📚", label: "Total" },
        ].map((s, i) => (
          <div key={i} style={{ flex: 1, background: "rgba(255,255,255,0.04)", borderRadius: 16, padding: "14px 10px", border: "1px solid rgba(255,255,255,0.06)", display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
            <div style={{ fontSize: 11, color: "#5a5a7a", fontWeight: 700, letterSpacing: 1 }}>{s.icon}</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: "#f0f0ff", lineHeight: 1 }}>{s.val}</div>
            <div style={{ fontSize: 10, color: "#4a4a6a", fontWeight: 600, letterSpacing: 0.5 }}>{s.label.toUpperCase()}</div>
          </div>
        ))}
      </div>

      {/* Progress */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, alignItems: "center" }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: "#5a5a7a", letterSpacing: 1 }}>DOMINIO GENERAL</span>
          <span style={{ fontSize: 13, fontWeight: 800, color: "#7c6fff" }}>{progressPct}%</span>
        </div>
        <div style={{ height: 8, background: "rgba(255,255,255,0.06)", borderRadius: 4, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${progressPct}%`, background: "linear-gradient(90deg, #7c6fff, #4ecdc4)", borderRadius: 4, transition: "width 0.8s cubic-bezier(.2,.8,.3,1)" }} />
        </div>
      </div>

      {/* Chart */}
      <div style={{ marginBottom: 8 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: "#5a5a7a", letterSpacing: 1, marginBottom: 12 }}>PRÓXIMOS REPASOS</div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 80 }}>
          {upcoming.map((count, i) => {
            const h = maxUpcoming > 0 ? (count / maxUpcoming) * 100 : 0;
            return (
              <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6, height: "100%" }}>
                <div style={{ flex: 1, display: "flex", alignItems: "flex-end", width: "100%", position: "relative" }}>
                  {count > 0 && (
                    <div style={{ position: "absolute", top: -18, left: 0, right: 0, textAlign: "center", fontSize: 10, fontWeight: 800, color: i === 0 ? "#7c6fff" : "#5a5a7a" }}>{count}</div>
                  )}
                  <div style={{
                    width: "100%", height: `${Math.max(h, 8)}%`,
                    background: i === 0 ? "linear-gradient(180deg, #7c6fff, #5a4fd4)" : "rgba(255,255,255,0.07)",
                    borderRadius: "6px 6px 4px 4px",
                    boxShadow: i === 0 ? "0 4px 14px rgba(124,111,255,0.4)" : "none",
                    transition: "height 0.6s",
                  }} />
                </div>
                <div style={{ fontSize: 9, fontWeight: 700, color: i === 0 ? "#7c6fff" : "#3a3a5a" }}>
                  {["HOY", "MAÑ", "L", "M", "J", "V", "S"][i]}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tip */}
      <div style={{ marginTop: 16, background: "rgba(124,111,255,0.08)", border: "1px solid rgba(124,111,255,0.2)", padding: "14px 16px", borderRadius: 14, display: "flex", gap: 10, alignItems: "flex-start" }}>
        <span style={{ fontSize: 16 }}>🎯</span>
        <div style={{ fontSize: 13, fontWeight: 600, color: "#c0b8ff", lineHeight: 1.5 }}>{studyTip}</div>
      </div>
    </div>
  );
}
