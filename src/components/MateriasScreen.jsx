import React from "react";
import Dashboard from "./Dashboard";
import { COLORS } from "../constants";

export default function MateriasScreen({
  userData,
  loading,
  materias,
  setScreen,
  setTourIdx,
  setIsTourOpen,
  openAdmin,
  logout,
  setNewName,
  setActiveMateriaId,
  styles,
}) {
  return (
    <div style={styles.screen}>
      <div style={styles.header}>
        <div style={{ flex: 1 }}>
          <div style={styles.headerTitle}>
            Hola {userData?.name?.split(" ")[0] || "..."}{" "}
            <span style={{ fontSize: 20 }}>🔥 {userData?.streak || 0}</span>
          </div>
          <div style={styles.headerSub}>
            {loading ? "Sincronizando..." : `${materias.length} materias`}
          </div>
        </div>
        <button
          className="btn-bounce"
          style={{
            ...styles.studyBtn,
            background: "rgba(255,255,255,0.2)",
            border: "1px solid rgba(0,0,0,0.1)",
            color: "#333",
            marginRight: 8,
          }}
          onClick={() => {
            setTourIdx(0);
            setIsTourOpen(true);
          }}
        >
          💡 Tour
        </button>
        {userData?.role === "admin" && (
          <button
            className="btn-bounce"
            style={{
              ...styles.studyBtn,
              background: "#74B9FF",
              marginRight: 8,
              color: "#111",
            }}
            onClick={openAdmin}
          >
            🛠 Admin
          </button>
        )}
        <button
          className="btn-bounce"
          style={{ ...styles.studyBtn, background: "rgba(0,0,0,0.8)" }}
          onClick={logout}
        >
          Salir
        </button>
      </div>

      <Dashboard materias={materias} userData={userData} styles={styles} />

      <div style={{ padding: "0 24px", marginBottom: 16 }}>
        <button
          className="btn-bounce"
          style={{ ...styles.primaryBtn, background: "#111" }}
          onClick={() => {
            setNewName("");
            setScreen("addMateria");
          }}
        >
          + Crear Materia
        </button>
      </div>

      {loading ? (
        <div style={styles.emptyState}>
          <div className="loader-card"></div>
          <div style={{ ...styles.emptyTitle, fontSize: 15, color: "#555" }}>
            Sincronizando neuronas<span className="loading-dots"></span>
          </div>
        </div>
      ) : materias.length === 0 ? (
        <div style={styles.emptyState}>
          <div style={{ fontSize: 46 }}>📚</div>
          <div style={styles.emptyTitle}>Sin materias</div>
          <div style={styles.emptySub}>
            Crea una materia académica para agrupar tus temas.
          </div>
        </div>
      ) : (
        <div style={styles.list}>
          {materias.map((m) => {
            const c = COLORS[m.colorIdx] || COLORS[0];
            const allC = (m.bolillas || []).flatMap((b) => b.cards || []);
            const masteredCount = allC.filter(
              (card) => (card.interval || 0) >= 15,
            ).length;
            const progressPct =
              allC.length > 0
                ? Math.round((masteredCount / allC.length) * 100)
                : 0;

            return (
              <div
                key={m.id}
                className="list-item"
                style={{
                  ...styles.materiaCard,
                  background: c.light,
                  borderLeft: `6px solid ${c.bg}`,
                  flexDirection: "column",
                  alignItems: "flex-start",
                  gap: 12,
                }}
                onClick={() => {
                  setActiveMateriaId(m.id);
                  setScreen("materia");
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    width: "100%",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <div style={{ ...styles.dot, background: c.bg }}>
                      <span
                        style={{
                          color: "#fff",
                          fontSize: 18,
                          fontWeight: "bold",
                        }}
                      >
                        {m.name[0]?.toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <div style={styles.itemName}>{m.name}</div>
                      <div style={styles.itemSub}>
                        {(m.bolillas || []).length} bolillas • {allC.length}{" "}
                        tarjetas
                      </div>
                    </div>
                  </div>
                  <div style={styles.arrow}>›</div>
                </div>

                {/* Progress Bar */}
                <div style={{ width: "100%", marginTop: 4 }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: 10,
                      color: c.bg,
                      fontWeight: 700,
                      marginBottom: 4,
                    }}
                  >
                    <span>DOMINIO DEL TEMA</span>
                    <span>{progressPct}%</span>
                  </div>
                  <div
                    style={{
                      height: 6,
                      background: "rgba(0,0,0,0.05)",
                      borderRadius: 3,
                      width: "100%",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        width: `${progressPct}%`,
                        background: c.bg,
                        borderRadius: 3,
                        transition: "width 0.5s",
                      }}
                    />
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
