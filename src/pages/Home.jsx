import React from "react";
import { useNavigate } from "react-router-dom";
import Dashboard from "../components/Dashboard";
import { COLORS } from "../constants";

export default function Home({
  userData, loading, materias, setTourIdx, setIsTourOpen,
  openAdmin, logout, setNewName, setActiveMateriaId, setIsMenuOpen, styles,
}) {
  const navigate = useNavigate();

  return (
    <div style={{ ...styles.screen, background: "#0d0d18" }}>
      {/* Header */}
      <div style={{ ...styles.header, paddingBottom: 16 }}>
        <button
          className="btn-bounce"
          style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 18, color: "#9090c0" }}
          onClick={() => setIsMenuOpen(true)}
        >
          ☰
        </button>
        <div style={{ flex: 1, marginLeft: 12 }}>
          <div style={styles.headerTitle}>
            Hola, {userData?.name?.split(" ")[0] || "..."}
            <span style={{ fontSize: 20, marginLeft: 6 }}>🔥 {userData?.streak || 0}</span>
          </div>
          <div style={styles.headerSub}>
            {loading ? "Sincronizando..." : `${materias.length} ${materias.length === 1 ? "materia" : "materias"}`}
          </div>
        </div>
      </div>

      <Dashboard materias={materias} userData={userData} styles={styles} />

      <div style={{ padding: "0 18px 16px" }}>
        <button
          className="btn-bounce"
          style={{ ...styles.primaryBtn, background: "linear-gradient(135deg, #7c6fff, #5a4fd4)", boxShadow: "0 8px 24px rgba(124,111,255,0.3)" }}
          onClick={() => { setNewName(""); navigate("/add-materia"); }}
        >
          + Nueva Materia
        </button>
      </div>

      {loading ? (
        <div style={styles.emptyState}>
          <div style={{ fontSize: 13, color: "#5a5a7a", fontWeight: 600 }}>Cargando...</div>
        </div>
      ) : materias.length === 0 ? (
        <div style={styles.emptyState}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>📚</div>
          <div style={styles.emptyTitle}>Sin materias todavía</div>
          <div style={styles.emptySub}>Creá tu primera materia para empezar a estudiar</div>
        </div>
      ) : (
        <div style={styles.list}>
          {materias.map((m) => {
            const c = COLORS[m.colorIdx] || COLORS[0];
            const allC = (m.bolillas || []).flatMap((b) => b.cards || []);
            const masteredCount = allC.filter((card) => (card.interval || 0) >= 6).length;
            const progressPct = allC.length > 0 ? Math.round((masteredCount / allC.length) * 100) : 0;

            return (
              <div
                key={m.id}
                className="list-item"
                style={{ ...styles.materiaCard, flexDirection: "column", alignItems: "flex-start", gap: 14 }}
                onClick={() => { setActiveMateriaId(m.id); navigate(`/materia/${m.id}`); }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <div style={{ ...styles.dot, background: `linear-gradient(135deg, ${c.bg}, ${c.bg}cc)`, boxShadow: `0 4px 14px ${c.bg}44` }}>
                      <span style={{ color: "#fff", fontSize: 17, fontWeight: 800 }}>{m.name[0]?.toUpperCase()}</span>
                    </div>
                    <div>
                      <div style={styles.itemName}>{m.name}</div>
                      <div style={styles.itemSub}>{(m.bolillas || []).length} bolillas · {allC.length} tarjetas</div>
                    </div>
                  </div>
                  <div style={styles.arrow}>›</div>
                </div>

                {/* Progress */}
                <div style={{ width: "100%" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, fontWeight: 700, marginBottom: 6, letterSpacing: 0.8 }}>
                    <span style={{ color: "#4a4a6a" }}>DOMINIO</span>
                    <span style={{ color: c.bg }}>{progressPct}%</span>
                  </div>
                  <div style={{ height: 5, background: "rgba(255,255,255,0.06)", borderRadius: 3, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${progressPct}%`, background: `linear-gradient(90deg, ${c.bg}, ${c.bg}99)`, borderRadius: 3, transition: "width 0.5s" }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
