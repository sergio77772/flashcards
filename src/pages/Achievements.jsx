import React from "react";
import { useNavigate } from "react-router-dom";

const ACHIEVEMENTS_LIST = [
  { id: "beginner", title: "Principiante", desc: "Dominá tu primera tarjeta", icon: "🎓" },
  { id: "scholar", title: "Académico", desc: "Dominá 10 tarjetas", icon: "📜" },
  { id: "on_fire", title: "En Racha", desc: "Mantené una racha de 3 días", icon: "🔥" },
  { id: "master", title: "Maestro", desc: "Dominá 50 tarjetas", icon: "🧙‍♂️" },
  { id: "constant", title: "Constancia", desc: "Racha de 7 días", icon: "💎" },
  { id: "night_owl", title: "Búho Nocturno", desc: "Estudiá después de medianoche", icon: "🦉" },
];

export default function Achievements({ userData, styles }) {
  const navigate = useNavigate();
  const xp = userData?.xp || 0;
  const level = userData?.level || 1;
  const userAchievements = userData?.achievements || [];
  const nextLevelXP = 100;
  const currentXP = xp % 100;
  const progressPct = (currentXP / nextLevelXP) * 100;

  return (
    <div style={{ ...styles.screen, background: "#0d0d18" }}>
      {/* Header */}
      <div style={{ padding: "52px 20px 20px", display: "flex", alignItems: "center", gap: 12, borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        <button style={styles.backBtnLight} onClick={() => navigate(-1)}>‹</button>
        <div style={styles.headerTitleLight}>Mis Logros 🏆</div>
      </div>

      <div style={{ padding: "24px 20px", overflowY: "auto", flex: 1 }}>
        {/* Level Card */}
        <div style={{ background: "linear-gradient(135deg, #1a1a2e, #16213e)", borderRadius: 24, padding: "24px", border: "1px solid rgba(124,111,255,0.2)", marginBottom: 28, boxShadow: "0 10px 30px rgba(0,0,0,0.3)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 20 }}>
            <div style={{ width: 70, height: 70, borderRadius: 20, background: "linear-gradient(135deg, #7c6fff, #5a4fd4)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", boxShadow: "0 8px 20px rgba(124,111,255,0.4)" }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: "rgba(255,255,255,0.6)", marginBottom: -2 }}>LVL</div>
              <div style={{ fontSize: 28, fontWeight: 900, color: "#fff" }}>{level}</div>
            </div>
            <div>
              <div style={{ fontSize: 20, fontWeight: 800, color: "#f0f0ff", marginBottom: 4 }}>Nivel Habitual</div>
              <div style={{ fontSize: 14, color: "#8080b0", fontWeight: 600 }}>Total XP: <span style={{ color: "#7c6fff" }}>{xp}</span></div>
            </div>
          </div>
          
          <div style={{ marginBottom: 6, display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#5a5a7a" }}>PROGRESO DE NIVEL</div>
            <div style={{ fontSize: 12, fontWeight: 800, color: "#7c6fff" }}>{currentXP} / 100 XP</div>
          </div>
          <div style={{ height: 10, background: "rgba(255,255,255,0.05)", borderRadius: 5, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${progressPct}%`, background: "linear-gradient(90deg, #7c6fff, #4ecdc4)", borderRadius: 5, transition: "width 1s ease-out" }} />
          </div>
        </div>

        {/* Achievements Grid */}
        <div style={{ fontSize: 16, fontWeight: 800, color: "#f0f0ff", marginBottom: 20, letterSpacing: 0.5 }}>LOGROS DESBLOQUEADOS</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16, paddingBottom: 40 }}>
          {ACHIEVEMENTS_LIST.map((ach) => {
            const isUnlocked = userAchievements.includes(ach.id);
            return (
              <div key={ach.id} style={{ background: isUnlocked ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.01)", border: isUnlocked ? "1px solid rgba(124,111,255,0.2)" : "1px solid rgba(255,255,255,0.05)", padding: "20px 16px", borderRadius: 20, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", opacity: isUnlocked ? 1 : 0.4, transition: "all 0.3s" }}>
                <div style={{ fontSize: 32, marginBottom: 12, filter: isUnlocked ? "none" : "grayscale(1)" }}>{ach.icon}</div>
                <div style={{ fontSize: 14, fontWeight: 800, color: isUnlocked ? "#f0f0ff" : "#5a5a7a", marginBottom: 6 }}>{ach.title}</div>
                <div style={{ fontSize: 11, color: "#4a4a6a", fontWeight: 600, lineHeight: 1.4 }}>{ach.desc}</div>
                {isUnlocked && <div style={{ marginTop: 10, fontSize: 10, fontWeight: 800, color: "#4ecdc4", background: "rgba(78,205,196,0.1)", padding: "4px 8px", borderRadius: 6 }}>LOGRADO</div>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
