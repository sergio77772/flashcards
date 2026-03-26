import React, { useEffect } from "react";

export default function DebugLogsScreen({ debugLogs, fetchLogs, setScreen, styles }) {
  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <div style={{ ...styles.screen, background: "#080810", color: "#fff", display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "52px 20px 20px", display: "flex", alignItems: "center", gap: 12, borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        <button style={styles.backBtnLight} onClick={() => setScreen("home")}>‹</button>
        <div style={styles.headerTitleLight}>Logs de Depuración 🛠️</div>
        <button 
          style={{ background: "#A29BFE", color: "#fff", border: "none", padding: "6px 12px", borderRadius: 12, fontSize: 11, fontWeight: 700 }}
          onClick={fetchLogs}
        >
          Refrescar
        </button>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: 20 }}>
        {debugLogs.length === 0 ? (
          <div style={{ textAlign: "center", color: "#666", marginTop: 40 }}>No hay logs disponibles.</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {debugLogs.map((log) => (
              <div 
                key={log.id} 
                style={{ 
                  background: "rgba(255,255,255,0.03)", 
                  padding: 16, 
                  borderRadius: 16, 
                  border: "1px solid rgba(255,255,255,0.05)",
                  fontSize: 12
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ fontWeight: 800, color: log.type.includes("ERROR") ? "#FF6B6B" : "#4ECDC4" }}>
                    {log.type}
                  </span>
                  <span style={{ color: "#555", fontSize: 10 }}>
                    {log.timestamp?.toDate ? log.timestamp.toDate().toLocaleTimeString() : "Cargando..."}
                  </span>
                </div>
                
                <div style={{ color: "#aaa", marginBottom: 8, fontFamily: "monospace", fontSize: 11, wordBreak: "break-all" }}>
                  {JSON.stringify(log.details, null, 2)}
                </div>

                <div style={{ color: "#555", fontSize: 9 }}>
                  <b>Device:</b> {log.userAgent}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
