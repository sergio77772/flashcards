import React from "react";

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
  setScreen,
  styles,
}) {
  return (
    <div style={styles.screen}>
      {aiLoading && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(247,247,245,0.85)",
            backdropFilter: "blur(4px)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div style={styles.emptyState}>
            <div className="loader-card"></div>
            <div style={{ ...styles.emptyTitle, fontSize: 16, color: "#111" }}>
              Sincronizando neuronas
              <span className="loading-dots"></span>
            </div>
          </div>
        </div>
      )}
      <div style={styles.materiaHeader}>
        <button
          style={styles.backBtnLight}
          onClick={() => setScreen("bolilla")}
        >
          ‹
        </button>
        <div style={styles.headerTitleLight}>Generador IA</div>
        <div style={{ width: 36 }} />
      </div>
      <div style={styles.formWrap}>
        <label style={styles.label}>1. Configura tu API Key (Gemini)</label>
        <input
          type="password"
          style={styles.input}
          placeholder="Pega tu API Key de Google acá..."
          value={aiApiKey}
          onChange={(e) => setAiApiKey(e.target.value)}
        />
        <div style={{ fontSize: 10, color: "#888", marginBottom: 16 }}>
          Consíguela gratis en makersuite.google.com
        </div>

        <label style={styles.label}>2. Sube un PDF, foto o pega tu texto</label>
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
                background: "#f0f0f0",
                border: "2px dashed #ccc",
                padding: "16px 12px",
                borderRadius: 16,
                textAlign: "center",
                cursor: "pointer",
                color: "#666",
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
                background: aiImage ? "#E0F7F6" : "#f0f0f0",
                border: aiImage ? "2px solid #4ECDC4" : "2px dashed #ccc",
                padding: "16px 12px",
                borderRadius: 16,
                textAlign: "center",
                cursor: "pointer",
                color: aiImage ? "#4ECDC4" : "#666",
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
          style={{ ...styles.textarea, height: 180 }}
          placeholder="O pega aquí tus apuntes directamente..."
          value={aiInputText}
          onChange={(e) => setAiInputText(e.target.value)}
        />

        <button
          className="btn-bounce"
          style={{
            ...styles.primaryBtn,
            background: (aiInputText.trim() || aiImage) && aiApiKey ? "#A29BFE" : "#333",
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
              <h3 style={{ fontSize: 16, fontWeight: 800 }}>
                Previsualización (
                {aiSuggestions.filter((s) => s.selected).length} seleccionadas)
              </h3>
              <button
                className="btn-bounce"
                style={{
                  background: "#A29BFE",
                  color: "#fff",
                  border: "none",
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
                    background: s.selected ? "#fff" : "rgba(255,255,255,0.05)",
                    padding: 16,
                    borderRadius: 16,
                    border: s.selected
                      ? "1px solid #A29BFE"
                      : "1px solid transparent",
                    opacity: s.selected ? 1 : 0.6,
                    transition: "all 0.2s",
                  }}
                >
                  <div style={{ display: "flex", gap: 12 }}>
                    <input
                      type="checkbox"
                      checked={s.selected}
                      style={{ width: 18, height: 18, accentColor: "#A29BFE" }}
                      onChange={() => toggleSelectSuggestion(s.id)}
                    />
                    <div style={{ flex: 1 }}>
                      <textarea
                        style={{
                          width: "100%",
                          background: "transparent",
                          border: "none",
                          color: s.selected ? "#111" : "#888",
                          fontWeight: 800,
                          fontSize: 14,
                          resize: "none",
                          overflow: "hidden",
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
                          color: s.selected ? "#666" : "#444",
                          fontSize: 13,
                          marginTop: 4,
                          resize: "none",
                          overflow: "hidden",
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
                style={{ ...styles.primaryBtn, background: "#00B894", flex: 2 }}
                onClick={saveAiFlashcards}
                disabled={aiLoading}
              >
                {aiLoading ? "💾 Guardando..." : `💾 Guardar ${aiSuggestions.filter((s) => s.selected).length} seleccionadas`}
              </button>
              <button
                className="btn-bounce"
                style={{ ...styles.primaryBtn, background: "#333", flex: 1 }}
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
