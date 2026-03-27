import React from "react";
import { useNavigate } from "react-router-dom";

export default function AIGenerator({
  aiApiKey,
  setAiApiKey,
  aiInputText,
  setAiInputText,
  aiImage,
  setAiImage,
  handleImageUpload,
  aiLoading,
  aiSuggestions,
  setAiSuggestions,
  handlePdfUpload,
  generateWithAI,
  toggleSelectSuggestion,
  updateSuggestion,
  removeSuggestion,
  addManualSuggestion,
  saveAiFlashcards,
  styles,
  aiBatchProgress,
}) {
  const [showApiKey, setShowApiKey] = React.useState(!aiApiKey);
  const navigate = useNavigate();

  return (
    <div style={{ ...styles.screen, background: "#0d0d18" }}>
      {aiLoading && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(8,8,16,0.85)", backdropFilter: "blur(12px)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16 }}>
          <div className="loader-card" />
          <div style={{ fontSize: 15, fontWeight: 700, color: "#9090c0" }}>
            {aiBatchProgress 
              ? `Generando parte ${aiBatchProgress.current} de ${aiBatchProgress.total}...` 
              : "Generando flashcards"}
            <span className="loading-dots" />
          </div>
        </div>
      )}
      <div style={{ padding: "52px 20px 20px", display: "flex", alignItems: "center", gap: 12, borderBottom: "1px solid rgba(255,255,255,0.05)", marginBottom: 4 }}>
        <button style={styles.backBtnLight} onClick={() => navigate(-1)}>‹</button>
        <div style={styles.headerTitleLight}>Generar con IA ✨</div>
        <div style={{ width: 36 }} />
      </div>
      <div style={styles.formWrap}>
        <div 
          style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, cursor: "pointer", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.07)", padding: "10px 16px", borderRadius: 12 }}
          onClick={() => setShowApiKey(!showApiKey)}
        >
          <span style={{ fontSize: 13, fontWeight: 700, color: "#8080b0" }}>⚙️ {showApiKey ? "Ocultar" : "Configurar"} API Key</span>
          <span style={{ fontSize: 10, color: "#5a5a7a" }}>{showApiKey ? "▴" : "▾"}</span>
        </div>

        {showApiKey && (
          <div style={{ marginBottom: 20, animation: "fadeIn 0.3s ease" }}>
            <label style={styles.label}>Configura tu API Key (Gemini)</label>
            <input
              type="password"
              style={styles.input}
              placeholder="Pega tu API Key de Google acá..."
              value={aiApiKey}
              onChange={(e) => setAiApiKey(e.target.value)}
            />
            <div style={{ fontSize: 10, color: "#888", marginTop: 4 }}>
              Consíguela gratis en makersuite.google.com
            </div>
          </div>
        )}

        <label style={styles.label}>1. Sube un PDF, foto o pega tu texto</label>
        <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
          <div style={{ flex: 1 }}>
            <input
              type="file"
              accept=".pdf"
              id="pdf-upload"
              style={{ display: "none" }}
              onChange={handlePdfUpload}
            />
            <label
              htmlFor="pdf-upload"
              style={{
                display: "block",
                background: "rgba(255,255,255,0.05)",
                border: "2px dashed rgba(255,255,255,0.1)",
                padding: "16px 12px",
                borderRadius: 16,
                textAlign: "center",
                cursor: "pointer",
                color: "#9090c0",
                fontSize: 13,
              }}
            >
              {aiLoading ? "⏳ ..." : "📂 PDF"}
            </label>
          </div>
          <div style={{ flex: 1 }}>
            <input
              type="file"
              accept="image/*"
              id="img-upload"
              style={{ display: "none" }}
              onChange={handleImageUpload}
            />
            <label
              htmlFor="img-upload"
              style={{
                display: "block",
                background: aiImage ? "rgba(78,205,196,0.1)" : "rgba(255,255,255,0.05)",
                border: aiImage ? "2px solid #4ECDC4" : "2px dashed rgba(255,255,255,0.1)",
                padding: "16px 12px",
                borderRadius: 16,
                textAlign: "center",
                cursor: "pointer",
                color: aiImage ? "#4ECDC4" : "#9090c0",
                fontSize: 13,
                fontWeight: aiImage ? 700 : 400,
              }}
            >
              {aiImage ? "✅ Foto" : "📸 Foto"}
            </label>
          </div>
        </div>

        {aiImage && (
          <div style={{ position: "relative", marginBottom: 16 }}>
            <img
              src={`data:${aiImage.mimeType};base64,${aiImage.data}`}
              style={{ width: "100%", borderRadius: 16, maxHeight: 150, objectFit: "cover" }}
              alt="Preview"
            />
            <button
              style={{ position: "absolute", top: 8, right: 8, background: "#FF7675", color: "#fff", border: "none", borderRadius: "50%", width: 24, height: 24, cursor: "pointer" }}
              onClick={() => setAiImage(null)}
            >
              ×
            </button>
          </div>
        )}

        <textarea
          style={{ ...styles.textarea, height: 180, background: "rgba(255,255,255,0.03)", color: "#fff", border: "1px solid rgba(255,255,255,0.08)" }}
          placeholder="O pega aquí tus apuntes directamente..."
          value={aiInputText}
          onChange={(e) => setAiInputText(e.target.value)}
        />

        <button
          className="btn-bounce"
          style={{
            ...styles.primaryBtn,
            background: (aiInputText.trim() || aiImage) && aiApiKey ? "#7c6fff" : "rgba(255,255,255,0.05)",
            color: (aiInputText.trim() || aiImage) && aiApiKey ? "#fff" : "#4a4a6a",
            marginTop: 20,
          }}
          onClick={generateWithAI}
          disabled={aiLoading || (!aiInputText.trim() && !aiImage) || !aiApiKey}
        >
          {aiLoading ? "Generando..." : "🚀 Generar Flashcards"}
        </button>

        {aiSuggestions.length > 0 && (
          <div style={{ marginTop: 32 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 16,
              }}
            >
              <h3 style={{ fontSize: 16, fontWeight: 800, color: "#f0f0ff" }}>
                Previsualización ({aiSuggestions.filter((s) => s.selected).length})
              </h3>
              <button
                className="btn-bounce"
                style={{
                  background: "rgba(124,111,255,0.2)",
                  color: "#b0a8ff",
                  border: "1px solid rgba(124,111,255,0.3)",
                  padding: "6px 12px",
                  borderRadius: 12,
                  fontSize: 11,
                  fontWeight: 700,
                }}
                onClick={addManualSuggestion}
              >
                + Añadir Manual
              </button>
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 12,
                marginBottom: 30,
              }}
            >
              {aiSuggestions.map((s, i) => (
                <div
                  key={s.id}
                  style={{
                    background: s.selected ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.02)",
                    padding: 16,
                    borderRadius: 16,
                    border: s.selected ? "1px solid #7c6fff" : "1px solid rgba(255,255,255,0.05)",
                    opacity: s.selected ? 1 : 0.6,
                    transition: "all 0.2s",
                  }}
                >
                  <div style={{ display: "flex", gap: 12 }}>
                    <input
                      type="checkbox"
                      checked={s.selected}
                      style={{ width: 18, height: 18, accentColor: "#7c6fff" }}
                      onChange={() => toggleSelectSuggestion(s.id)}
                    />
                    <div style={{ flex: 1 }}>
                      <textarea
                        style={{
                          width: "100%",
                          background: "transparent",
                          border: "none",
                          color: "#f0f0ff",
                          fontWeight: 800,
                          fontSize: 14,
                          resize: "none",
                          overflow: "hidden",
                          fontFamily: "inherit"
                        }}
                        value={s.front}
                        onChange={(e) =>
                          updateSuggestion(s.id, "front", e.target.value)
                        }
                      />
                      <textarea
                        style={{
                          width: "100%",
                          background: "transparent",
                          border: "none",
                          color: "rgba(255,255,255,0.5)",
                          fontSize: 13,
                          marginTop: 4,
                          resize: "none",
                          overflow: "hidden",
                          fontFamily: "inherit"
                        }}
                        value={s.back}
                        onChange={(e) =>
                          updateSuggestion(s.id, "back", e.target.value)
                        }
                      />
                    </div>
                    <button
                      style={{
                        background: "transparent",
                        border: "none",
                        color: "#FF7675",
                        fontSize: 16,
                        cursor: "pointer"
                      }}
                      onClick={() => removeSuggestion(s.id)}
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: 12 }}>
              <button
                className="btn-bounce"
                style={{ ...styles.primaryBtn, background: "linear-gradient(135deg, #00B894, #00d2ad)", flex: 2 }}
                onClick={saveAiFlashcards}
                disabled={aiLoading}
              >
                {aiLoading ? "💾 Guardando..." : `💾 Guardar ${aiSuggestions.filter((s) => s.selected).length}`}
              </button>
              <button
                className="btn-bounce"
                style={{ ...styles.primaryBtn, background: "rgba(255,255,255,0.05)", color: "#8080b0", flex: 1 }}
                onClick={() => setAiSuggestions([])}
              >
                Limpiar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
