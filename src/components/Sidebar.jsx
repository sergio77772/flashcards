import React from "react";
import { useNavigate } from "react-router-dom";
import { STUDY_TIPS } from "../constants";

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

export default function Sidebar({ isOpen, onClose, logout, userData, styles, startTour }) {
  const navigate = useNavigate();
  if (!isOpen) return null;
  return (
    <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.7)", zIndex: 10000, backdropFilter: "blur(8px)" }} onClick={onClose}>
      <div style={{ width: 290, height: "100%", background: "#0f0f1a", borderRight: "1px solid rgba(255,255,255,0.07)", padding: "60px 24px 40px", display: "flex", flexDirection: "column", gap: 8, position: "relative", animation: "slideIn 0.28s cubic-bezier(.2,.8,.3,1) forwards" }}
        onClick={e => e.stopPropagation()}>
        <button style={{ position: "absolute", top: 18, right: 18, border: "none", background: "rgba(255,255,255,0.06)", width: 34, height: 34, borderRadius: 10, fontSize: 18, color: "#9090c0", cursor: "pointer" }} onClick={onClose}>×</button>

        {/* User */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24, padding: "16px", background: "rgba(255,255,255,0.04)", borderRadius: 16, border: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ width: 44, height: 44, borderRadius: 14, background: "linear-gradient(135deg, #7c6fff, #4ecdc4)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 18, color: "#fff" }}>
            {userData?.name ? userData.name[0] : "U"}
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#f0f0ff" }}>{userData?.name || "Usuario"}</div>
            <div style={{ fontSize: 12, color: "#5a5a7a", marginTop: 2 }}>{userData?.role || "Estudiante"}</div>
          </div>
        </div>

        <nav style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {[
            { icon: "🏠", label: "Inicio", path: "/" },
            { icon: "💡", label: "Consejos de Estudio", path: "/tips" },
            { icon: "👨‍🏫", label: "Tutor IA", path: "/tutor" },
            { icon: "🏆", label: "Mis Logros", path: "/achievements" },
            { icon: "📂", label: "Mis Materias", path: "/" },
            ...(userData?.role === "admin" ? [{ icon: "🛠", label: "Panel Admin", path: "/admin" }] : []),
          ].map((item) => (
            <button key={item.label} style={{ display: "flex", alignItems: "center", gap: 14, border: "none", background: "transparent", width: "100%", padding: "13px 14px", cursor: "pointer", fontSize: 15, fontWeight: 600, color: "#8080b0", borderRadius: 14, textAlign: "left", fontFamily: "'Plus Jakarta Sans', sans-serif", transition: "background .2s, color .2s" }}
              onMouseEnter={e => { e.target.style.background = "rgba(255,255,255,0.05)"; e.target.style.color = "#f0f0ff"; }}
              onMouseLeave={e => { e.target.style.background = "transparent"; e.target.style.color = "#8080b0"; }}
              onClick={() => { navigate(item.path); onClose(); }}>
              <span style={{ fontSize: 20, width: 26, textAlign: "center" }}>{item.icon}</span>
              {item.label}
            </button>
          ))}
          <button style={{ display: "flex", alignItems: "center", gap: 14, border: "none", background: "transparent", width: "100%", padding: "13px 14px", cursor: "pointer", fontSize: 15, fontWeight: 600, color: "#8080b0", borderRadius: 14, textAlign: "left", fontFamily: "'Plus Jakarta Sans', sans-serif", transition: "background .2s, color .2s" }}
            onMouseEnter={e => { e.target.style.background = "rgba(255,255,255,0.05)"; e.target.style.color = "#f0f0ff"; }}
            onMouseLeave={e => { e.target.style.background = "transparent"; e.target.style.color = "#8080b0"; }}
            onClick={startTour}>
            <span style={{ fontSize: 20, width: 26, textAlign: "center" }}>✨</span>
            Ver Tutorial
          </button>
        </nav>

        <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: 8 }}>
          {userData?.role === "admin" && (
            <button style={{ display: "flex", alignItems: "center", gap: 14, border: "none", background: "rgba(255,255,255,0.03)", width: "100%", padding: "13px 14px", cursor: "pointer", fontSize: 13, fontWeight: 600, color: "#8080b0", borderRadius: 14, textAlign: "left", fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              onClick={() => { navigate("/debug-logs"); onClose(); }}>
              <span style={{ fontSize: 18 }}>🛠️</span> Debug Logs
            </button>
          )}
          <button style={{ display: "flex", alignItems: "center", gap: 14, border: "1px solid rgba(255,107,107,0.2)", background: "rgba(255,107,107,0.05)", width: "100%", padding: "13px 14px", cursor: "pointer", fontSize: 13, fontWeight: 700, color: "#ff6b6b", borderRadius: 14, textAlign: "left", fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            onClick={logout}>
            <span style={{ fontSize: 18 }}>🚪</span> Cerrar Sesión
          </button>
        </div>
      </div>
      <style>{`@keyframes slideIn { from { transform: translateX(-100%); opacity:0; } to { transform: translateX(0); opacity:1; } }`}</style>
    </div>
  );
}

export function TipsScreen({ styles, aiTips, loading, generateTips, askCustomTip }) {
  const navigate = useNavigate();
  const [difficulty, setDifficulty] = React.useState("");
  const [customTip, setCustomTip] = React.useState(null);
  const [customLoading, setCustomLoading] = React.useState(false);

  React.useEffect(() => { if (aiTips.length === 0) generateTips(); }, []);

  const handleCustomSubmit = async () => {
    if (!difficulty.trim() || customLoading) return;
    setCustomLoading(true);
    const res = await askCustomTip(difficulty);
    setCustomTip(res);
    setCustomLoading(false);
  };

  return (
    <div style={{ ...styles.screen, background: "#0d0d18" }}>
      <div style={{ padding: "52px 20px 20px", display: "flex", alignItems: "center", gap: 12, borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        <button style={styles.backBtnLight} onClick={() => navigate(-1)}>‹</button>
        <div style={styles.headerTitleLight}>Consejos de Estudio 🧠</div>
      </div>
      <div style={{ padding: "16px 18px 100px", display: "flex", flexDirection: "column", gap: 14, overflowY: "auto" }}>
        
        {/* NO PUEDO ESTUDIAR SECTION */}
        <div style={{ background: "rgba(255,107,107,0.05)", border: "1px solid rgba(255,107,107,0.15)", borderRadius: 20, padding: 20 }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: "#ff6b6b", marginBottom: 8, display: "flex", alignItems: "center", gap: 8 }}>
            <span>🆘</span> ¿No podés estudiar?
          </div>
          <div style={{ fontSize: 13, color: "#d0d0f0", marginBottom: 12 }}>Contame qué te lo impide y la IA te dará un consejo práctico e inmediato.</div>
          
          <div style={{ display: "flex", gap: 8 }}>
            <input 
              style={{ flex: 1, padding: "12px 16px", borderRadius: 14, border: "1px solid rgba(255,107,107,0.2)", background: "rgba(255,255,255,0.03)", color: "#fff", outline: "none", fontSize: 14, fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              placeholder="Ej: Me distraigo con el celular..."
              value={difficulty}
              onChange={e => setDifficulty(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleCustomSubmit()}
            />
            <button className="btn-bounce" style={{ background: "linear-gradient(135deg, #ff6b6b, #e05555)", color: "#fff", border: "none", borderRadius: 14, padding: "0 18px", fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 12px rgba(255,107,107,0.3)" }}
              onClick={handleCustomSubmit} disabled={customLoading}>
              {customLoading ? "..." : "Ayuda"}
            </button>
          </div>

          {customTip && (
            <div style={{ marginTop: 16, padding: 16, background: "rgba(255,255,255,0.05)", borderRadius: 14, borderLeft: "3px solid #ff6b6b", animation: "slideIn 0.3s ease-out" }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: "#ff6b6b", letterSpacing: 1, marginBottom: 8 }}>CONSEJO PERSONALIZADO</div>
              <div style={{ fontSize: 14, color: "#f0f0ff", lineHeight: 1.6 }}>{formatAiMsg(customTip)}</div>
            </div>
          )}
        </div>

        <button className="btn-bounce" style={{ ...styles.primaryBtn, background: loading ? "rgba(255,255,255,0.06)" : "linear-gradient(135deg, #7c6fff, #5a4fd4)", boxShadow: loading ? "none" : "0 8px 24px rgba(124,111,255,0.3)", fontSize: 14 }}
          onClick={generateTips} disabled={loading}>
          {loading ? "🔄 Generando..." : "✨ Nuevos consejos con IA"}
        </button>
        {loading && aiTips.length === 0 ? (
          <div style={styles.emptyState}>
            <div className="loader-card" />
            <div style={{ color: "#5a5a7a", fontWeight: 600 }}>Consultando IA...</div>
          </div>
        ) : (
          (aiTips.length > 0 ? aiTips : STUDY_TIPS).map((tip, i) => (
            <div key={i} className="list-item" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", padding: "22px", borderRadius: 20 }}>
              <div style={{ fontSize: 17, fontWeight: 800, marginBottom: 10, color: "#f0f0ff" }}>{tip.title}</div>
              <div style={{ fontSize: 14, color: "#6060a0", lineHeight: 1.7 }}>{tip.msg}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export function TutorScreen({ styles, chatHistory, loading, askTutor }) {
  const navigate = useNavigate();
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
    reader.onload = (ev) => setImg({ data: ev.target.result.split(",")[1], mimeType: file.type });
    reader.readAsDataURL(file);
  };

  return (
    <div style={{ ...styles.screen, background: "#0d0d18" }}>
      <div style={{ padding: "52px 20px 20px", display: "flex", alignItems: "center", gap: 12, borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        <button style={styles.backBtnLight} onClick={() => navigate(-1)}>‹</button>
        <div style={styles.headerTitleLight}>Tutor IA ✨</div>
      </div>

      <div ref={scrollRef} style={{ flex: 1, padding: "16px 18px", overflowY: "auto", display: "flex", flexDirection: "column", gap: 14 }}>
        {chatHistory.length === 0 && (
          <div style={{ textAlign: "center", padding: "60px 24px" }}>
            <div style={{ fontSize: 52, marginBottom: 14 }}>👨‍🏫</div>
            <div style={{ fontSize: 17, fontWeight: 800, color: "#f0f0ff", marginBottom: 8 }}>Tu Tutor Personal</div>
            <div style={{ fontSize: 14, color: "#5a5a7a", lineHeight: 1.6 }}>Enviame un texto o foto con tu duda y te lo explico al detalle.</div>
          </div>
        )}
        {chatHistory.map((m, i) => (
          <div key={i} style={{ alignSelf: m.role === "user" ? "flex-end" : "flex-start", maxWidth: "86%", background: m.role === "user" ? "linear-gradient(135deg, #7c6fff, #5a4fd4)" : "rgba(255,255,255,0.05)", border: m.role === "user" ? "none" : "1px solid rgba(255,255,255,0.08)", color: m.role === "user" ? "#fff" : "#d0d0f0", padding: "12px 16px", borderRadius: m.role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px", fontSize: 14, lineHeight: 1.7, boxShadow: m.role === "user" ? "0 4px 16px rgba(124,111,255,0.3)" : "none" }}>
            {m.img && <img src={`data:${m.img.mimeType};base64,${m.img.data}`} style={{ width: "100%", borderRadius: 10, marginBottom: 10 }} alt="query" />}
            {m.role === "ai" ? formatAiMsg(m.text) : m.text}
          </div>
        ))}
        {loading && (
          <div style={{ alignSelf: "flex-start", padding: "12px 16px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "18px 18px 18px 4px", fontSize: 14, color: "#7070a0" }}>
            <span className="loading-dots">Pensando</span>
          </div>
        )}
      </div>

      <div style={{ padding: "12px 16px 32px", background: "#0f0f1a", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        {img && (
          <div style={{ position: "relative", display: "inline-block", marginBottom: 10 }}>
            <img src={`data:${img.mimeType};base64,${img.data}`} style={{ height: 56, borderRadius: 10, border: "1px solid rgba(255,255,255,0.1)" }} alt="preview" />
            <button style={{ position: "absolute", top: -8, right: -8, background: "#ff6b6b", color: "#fff", border: "none", borderRadius: "50%", width: 20, height: 20, fontSize: 12, cursor: "pointer" }} onClick={() => setImg(null)}>×</button>
          </div>
        )}
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <input type="file" id="tutor-img" style={{ display: "none" }} accept="image/*" onChange={onImgUpload} />
          <label htmlFor="tutor-img" style={{ fontSize: 22, cursor: "pointer", opacity: 0.7 }}>📸</label>
          <input style={{ flex: 1, padding: "12px 18px", borderRadius: 16, border: "1.5px solid rgba(255,255,255,0.08)", fontSize: 14, background: "rgba(255,255,255,0.05)", color: "#f0f0ff", outline: "none", fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            placeholder="Escribe tu duda..." value={q}
            onChange={e => setQ(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSend()} />
          <button style={{ padding: "12px 16px", borderRadius: 14, background: "linear-gradient(135deg, #7c6fff, #5a4fd4)", color: "#fff", border: "none", fontSize: 18, cursor: "pointer", boxShadow: "0 4px 16px rgba(124,111,255,0.4)" }}
            onClick={handleSend} disabled={loading}>›</button>
        </div>
      </div>
    </div>
  );
}
