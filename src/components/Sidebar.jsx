import React from "react";
import { STUDY_TIPS } from "../constants";

// Helper to format basic markdown from AI
const formatAiMsg = (txt) => {
  if (!txt) return "";
  const parts = txt.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    return part.split("\n").map((line, j) => (
      <React.Fragment key={`${i}-${j}`}>
        {line}
        {j < part.split("\n").length - 1 && <br />}
      </React.Fragment>
    ));
  });
};

export default function Sidebar({ isOpen, onClose, setScreen, logout, userData, styles }) {
  if (!isOpen) return null;

  return (
    <div 
      style={{
        position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
        background: "rgba(0,0,0,0.6)", zIndex: 10000,
        backdropFilter: "blur(4px)"
      }}
      onClick={onClose}
    >
      <div 
        style={{
          width: 300, height: "100%", background: "#fff",
          padding: "60px 24px", display: "flex", flexDirection: "column",
          gap: 32, position: "relative",
          animation: "slideIn 0.3s ease-out forwards"
        }}
        onClick={e => e.stopPropagation()}
      >
        <button 
          style={{ position: "absolute", top: 20, right: 20, border: "none", background: "none", fontSize: 24, cursor: "pointer" }}
          onClick={onClose}
        >
          ×
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: "50%", background: "#111", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800 }}>
             {userData?.name ? userData.name[0] : "U"}
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>{userData?.name || "Usuario"}</div>
            <div style={{ fontSize: 12, color: "#888" }}>{userData?.role || "Estudiante"}</div>
          </div>
        </div>

        <nav style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <SidebarLink icon="🏠" label="Inicio" onClick={() => { setScreen("home"); onClose(); }} />
          <SidebarLink icon="💡" label="Consejos de Estudio" onClick={() => { setScreen("tips"); onClose(); }} />
          <SidebarLink icon="👨‍🏫" label="Tutor IA" onClick={() => { setScreen("tutor"); onClose(); }} />
          {userData?.role === "admin" && (
            <SidebarLink icon="🛠" label="Panel Admin" onClick={() => { setScreen("admin"); onClose(); }} />
          )}
          <SidebarLink icon="📂" label="Mis Materias" onClick={() => { setScreen("home"); onClose(); }} />
        </nav>

        <div style={{ marginTop: "auto" }}>
          <button 
            style={{ width: "100%", padding: "14px", borderRadius: 12, border: "1px solid #eee", background: "#f9f9f9", color: "#FF7675", fontWeight: 700, cursor: "pointer" }}
            onClick={logout}
          >
            Log Out
          </button>
        </div>
      </div>
      <style>{`
        @keyframes slideIn { from { transform: translateX(-100%); } to { transform: translateX(0); } }
      `}</style>
    </div>
  );
}

function SidebarLink({ icon, label, onClick }) {
  return (
    <button 
      style={{ display: "flex", alignItems: "center", gap: 14, border: "none", background: "none", width: "100%", padding: "10px 0", cursor: "pointer", fontSize: 16, fontWeight: 600, color: "#444" }}
      onClick={onClick}
    >
      <span style={{ fontSize: 20 }}>{icon}</span>
      {label}
    </button>
  );
}

export function TipsScreen({ styles, setScreen, aiTips, loading, generateTips }) {
  React.useEffect(() => {
    if (aiTips.length === 0) generateTips();
  }, []);

  return (
    <div style={{ ...styles.screen, background: "#f9f9f9" }}>
      <div style={{ ...styles.materiaHeader, background: "#111", borderRadius: "0 0 32px 32px", marginBottom: 20 }}>
        <button style={styles.backBtnLight} onClick={() => setScreen("home")}>‹</button>
        <div style={styles.headerTitleLight}>Consejos de Inteligencia 🧠</div>
        <div style={{ width: 36 }} />
      </div>
      
      <div style={{ padding: "0 20px 40px", display: "flex", flexDirection: "column", gap: 20 }}>
        <button 
          className="btn-bounce"
          style={{ ...styles.primaryBtn, background: loading ? "#ddd" : "linear-gradient(135deg, #A29BFE, #6C5CE7)", fontSize: 13, padding: "16px", boxShadow: "0 10px 20px rgba(162,155,254,0.3)" }}
          onClick={generateTips}
          disabled={loading}
        >
          {loading ? "🔄 Generando sabiduría..." : "✨ Generar nuevos consejos"}
        </button>

        {loading && aiTips.length === 0 ? (
          <div style={{ ...styles.emptyState, marginTop: 40 }}>
            <div className="loader-card"></div>
            <p style={{ color: "#666", fontWeight: 700 }}>Consultando a la IA...</p>
          </div>
        ) : (
          (aiTips.length > 0 ? aiTips : STUDY_TIPS).map((tip, i) => (
            <div 
              key={i} 
              className="list-item" 
              style={{ 
                background: "#fff", padding: 24, borderRadius: 24, border: "1px solid #ebebeb", 
                boxShadow: "0 8px 30px rgba(0,0,0,0.04)", transition: "all 0.3s" 
              }}
            >
              <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 10, color: "#111", display: "flex", alignItems: "center", gap: 8 }}>
                {tip.title}
              </div>
              <div style={{ fontSize: 14, color: "#555", lineHeight: 1.6 }}>{tip.msg}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export function TutorScreen({ styles, setScreen, chatHistory, loading, askTutor }) {
  const [q, setQ] = React.useState("");
  const [img, setImg] = React.useState(null);
  const scrollRef = React.useRef();

  React.useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [chatHistory]);

  const handleSend = () => {
    if (!q.trim() && !img) return;
    askTutor(q, img);
    setQ(""); setImg(null);
  };

  const onImgUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const base64 = ev.target.result.split(',')[1];
      setImg({ data: base64, mimeType: file.type });
    };
    reader.readAsDataURL(file);
  };

  return (
    <div style={{ ...styles.screen, background: "#f0f2f5" }}>
      <div style={{ ...styles.materiaHeader, background: "#111", borderRadius: "0 0 32px 32px" }}>
        <button style={styles.backBtnLight} onClick={() => setScreen("home")}>‹</button>
        <div style={styles.headerTitleLight}>Tutor Personal ✨</div>
        <div style={{ width: 36 }} />
      </div>

      <div 
        ref={scrollRef}
        style={{ flex: 1, padding: "20px 20px", overflowY: "auto", display: "flex", flexDirection: "column", gap: 16 }}
      >
        {chatHistory.length === 0 && (
          <div style={{ textAlign: "center", color: "#888", marginTop: 40, padding: 40 }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>👨‍🏫</div>
            <div style={{ fontWeight: 800, color: "#111" }}>¡Hola! Soy tu tutor IA.</div>
            <div style={{ fontSize: 13 }}>Envíame un texto o una foto de lo que no entiendas y te lo explico.</div>
          </div>
        )}
        {chatHistory.map((m, i) => (
          <div 
            key={i} 
            style={{ 
              alignSelf: m.role === "user" ? "flex-end" : "flex-start",
              maxWidth: "85%",
              background: m.role === "user" ? "#A29BFE" : "#fff",
              color: m.role === "user" ? "#fff" : "#111",
              padding: "12px 16px",
              borderRadius: m.role === "user" ? "20px 20px 4px 20px" : "20px 20px 20px 4px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
              fontSize: 14,
              lineHeight: 1.6
            }}
          >
            {m.img && (
              <img 
                src={`data:${m.img.mimeType};base64,${m.img.data}`} 
                style={{ width: "100%", borderRadius: 12, marginBottom: 8 }} 
                alt="user query"
              />
            )}
            {m.role === "ai" ? formatAiMsg(m.text) : m.text}
          </div>
        ))}
        {loading && (
          <div style={{ alignSelf: "flex-start", padding: 12, background: "#eee", borderRadius: 12 }}>
            <span className="loading-dots">Escribiendo</span>
          </div>
        )}
      </div>

      <div style={{ padding: 16, background: "#fff", borderTop: "1px solid #eee" }}>
        {img && (
          <div style={{ position: "relative", display: "inline-block", marginBottom: 12 }}>
            <img src={`data:${img.mimeType};base64,${img.data}`} style={{ height: 60, borderRadius: 8 }} alt="preview" />
            <button 
              style={{ position: "absolute", top: -8, right: -8, background: "#FF7675", color: "#fff", border: "none", borderRadius: "50%", width: 20, height: 20, fontSize: 12 }}
              onClick={() => setImg(null)}
            >×</button>
          </div>
        )}
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <input type="file" id="tutor-img" style={{ display: "none" }} accept="image/*" onChange={onImgUpload} />
          <label htmlFor="tutor-img" style={{ fontSize: 24, cursor: "pointer" }}>📸</label>
          <input 
            style={{ flex: 1, padding: "12px 16px", borderRadius: 20, border: "1px solid #eee", fontSize: 14, outline: "none" }}
            placeholder="Escribe tu duda..."
            value={q}
            onChange={e => setQ(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSend()}
          />
          <button 
            style={{ padding: "10px 16px", borderRadius: "50%", background: "#111", color: "#fff", border: "none", fontSize: 18 }}
            onClick={handleSend}
            disabled={loading}
          >›</button>
        </div>
      </div>
    </div>
  );
}
