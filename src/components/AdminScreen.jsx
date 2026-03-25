import React from "react";

export default function AdminScreen({
  allUsers,
  setScreen,
  changeUserRole,
  user,
  setUserData,
  styles,
}) {
  return (
    <div style={styles.screen}>
      <div style={{ ...styles.materiaHeader, background: "#111" }}>
        <button style={styles.backBtnLight} onClick={() => setScreen("home")}>
          ‹
        </button>
        <div style={styles.headerTitleLight}>Panel de Administración</div>
        <div style={{ width: 36 }} />
      </div>
      <div style={{ padding: "24px 20px" }}>
        <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>
          Gestión de Usuarios
        </div>
        {allUsers.length === 0 ? (
          <div style={{ textAlign: "center", color: "#888" }}>
            Cargando usuarios...
          </div>
        ) : (
          allUsers.map((u) => (
            <div
              key={u.uid}
              style={{
                background: "rgba(255,255,255,0.04)",
                padding: 16,
                borderRadius: 16,
                marginBottom: 12,
                border: "1px solid #ebebeb",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <div style={{ fontWeight: 700, fontSize: 14, color: "#111" }}>
                  {u.name}
                </div>
                <div style={{ fontSize: 12, color: "#888" }}>{u.email}</div>
              </div>
              <select
                style={{
                  padding: "8px 12px",
                  borderRadius: 8,
                  background: u.role === "admin" ? "#E6F3FF" : "#f0f0f0",
                  color: u.role === "admin" ? "#0066cc" : "#111",
                  border: "none",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
                value={u.role || "user"}
                onChange={(e) => changeUserRole(u.uid, e.target.value)}
              >
                <option value="user">Usuario</option>
                <option value="admin">Administrador</option>
              </select>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
