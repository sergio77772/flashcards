import React from "react";

export default function LoginScreen({ loginGoogle, styles }) {
  return (
    <div style={{ ...styles.root, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 32, position: "relative", overflow: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }

        .login-orb { position: absolute; border-radius: 50%; filter: blur(80px); pointer-events: none; }

        .btn-google {
          display: flex; align-items: center; justify-content: center; gap: 12px;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.12);
          color: #e8e8ff; padding: 17px 24px; border-radius: 18px;
          font-weight: 700; font-size: 15px; cursor: pointer; width: 100%;
          transition: all 0.2s; font-family: 'Plus Jakarta Sans', sans-serif;
          backdrop-filter: blur(10px);
        }
        .btn-google:active { transform: scale(0.97); background: rgba(255,255,255,0.1); }

        @keyframes floatUp { from { opacity:0; transform: translateY(24px); } to { opacity:1; transform: translateY(0); } }
        .fade-up { animation: floatUp 0.6s cubic-bezier(.2,.8,.3,1) both; }
        .fade-up-2 { animation: floatUp 0.6s 0.1s cubic-bezier(.2,.8,.3,1) both; }
        .fade-up-3 { animation: floatUp 0.6s 0.22s cubic-bezier(.2,.8,.3,1) both; }
        .fade-up-4 { animation: floatUp 0.6s 0.34s cubic-bezier(.2,.8,.3,1) both; }

        @keyframes pulse-ring { 0%,100% { transform: scale(1); opacity: 0.4; } 50% { transform: scale(1.08); opacity: 0.7; } }
        .icon-ring { animation: pulse-ring 3s ease-in-out infinite; }
      `}</style>

      {/* Background orbs */}
      <div className="login-orb" style={{ width: 300, height: 300, background: "rgba(124,111,255,0.15)", top: -60, right: -80 }} />
      <div className="login-orb" style={{ width: 200, height: 200, background: "rgba(78,205,196,0.1)", bottom: 80, left: -60 }} />

      {/* Icon */}
      <div className="fade-up" style={{ position: "relative", marginBottom: 32 }}>
        <div className="icon-ring" style={{ width: 96, height: 96, borderRadius: 28, background: "linear-gradient(135deg, #7c6fff, #4ecdc4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 44, boxShadow: "0 20px 60px rgba(124,111,255,0.35)" }}>
          ⚡
        </div>
      </div>

      <h1 className="fade-up-2" style={{ color: "#f0f0ff", fontSize: 32, fontWeight: 800, marginBottom: 10, letterSpacing: "-1px", fontFamily: "'Plus Jakarta Sans', sans-serif", textAlign: "center" }}>
        Mis Bolillas
      </h1>

      <p className="fade-up-3" style={{ color: "#5a5a7a", fontSize: 15, textAlign: "center", marginBottom: 48, lineHeight: 1.6, fontFamily: "'Plus Jakarta Sans', sans-serif", maxWidth: 260 }}>
        Tu espacio de estudio inteligente. Todo sincronizado en la nube.
      </p>

      <div className="fade-up-4" style={{ width: "100%" }}>
        <button className="btn-google" onClick={loginGoogle}>
          <svg width="22" height="22" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.7 17.74 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
          </svg>
          Ingresar con Google
        </button>
      </div>

      <p className="fade-up-4" style={{ color: "#3a3a5a", fontSize: 12, marginTop: 24, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        Tus datos están seguros y encriptados
      </p>
    </div>
  );
}
