import React from "react";

export default function LoginScreen({ loginGoogle, styles }) {
  return (
    <div
      style={{
        ...styles.root,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Sora', sans-serif;}
        .btn-google { display: flex; align-items: center; justify-content: center; gap: 12px; background: #fff; color: #111; padding: 16px 24px; border-radius: 16px; font-weight: 700; font-size: 16px; cursor: pointer; border: none; width: 100%; transition: transform 0.2s; box-shadow: 0 4px 14px rgba(0,0,0,0.1); }
        .btn-google:active { transform: scale(0.95); }
      `}</style>
      <div style={{ fontSize: 64, marginBottom: 16 }}>⚡</div>
      <h1
        style={{ color: "#fff", fontSize: 28, fontWeight: 800, marginBottom: 8 }}
      >
        Mis Bolillas
      </h1>
      <p
        style={{
          color: "#aaa",
          fontSize: 14,
          textAlign: "center",
          marginBottom: 40,
        }}
      >
        Inicia sesión para guardar tu conocimiento en la nube.
      </p>
      <button className="btn-google" onClick={loginGoogle}>
        <svg width="24" height="24" viewBox="0 0 48 48">
          <path
            fill="#EA4335"
            d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.7 17.74 9.5 24 9.5z"
          />
          <path
            fill="#4285F4"
            d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
          />
          <path
            fill="#FBBC05"
            d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
          />
          <path
            fill="#34A853"
            d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
          />
        </svg>
        Ingresar con Google
      </button>
    </div>
  );
}
