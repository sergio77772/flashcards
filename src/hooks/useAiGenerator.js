import { useState } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import * as pdfjsLib from "pdfjs-dist";
import pdfWorker from "pdfjs-dist/build/pdf.worker.mjs?url";
import { generateId } from "../constants";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

export function useAiGenerator(showToast) {
  const [aiApiKey, setAiApiKey] = useState(
    import.meta.env.VITE_GEMINI_API_KEY || "",
  );
  const [aiInputText, setAiInputText] = useState("");
  const [aiImage, setAiImage] = useState(null); // { data: string, mimeType: string }
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState([]);

  const handlePdfUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAiLoading(true);
    try {
      const reader = new FileReader();
      reader.onerror = () => {
        showToast("Error al leer el archivo", "error");
        setAiLoading(false);
      };
      reader.onload = async (ev) => {
        try {
          const typedarray = new Uint8Array(ev.target.result);
          const pdf = await pdfjsLib.getDocument(typedarray).promise;
          let fullText = "";
          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const t = await page.getTextContent();
            fullText += t.items.map((it) => it.str).join(" ");
          }
          setAiInputText(fullText);
          showToast("PDF procesado con éxito");
        } catch (err) {
          showToast("Error al procesar PDF", "error");
        } finally {
          setAiLoading(false);
        }
      };
      reader.readAsArrayBuffer(file);
    } catch (err) {
      showToast("Error al iniciar lectura", "error");
      setAiLoading(false);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const base64 = ev.target.result.split(',')[1];
      setAiImage({ data: base64, mimeType: file.type });
      showToast("Imagen cargada");
    };
    reader.readAsDataURL(file);
  };

  const generateWithAI = async () => {
    if (!aiApiKey) return showToast("Falta API Key", "error");
    setAiLoading(true);
    try {
      const genAI = new GoogleGenerativeAI(aiApiKey);
      const model = genAI.getGenerativeModel(
        { model: "gemini-2.0-flash" },
        { apiVersion: "v1" },
      );
      
      const prompt = `Analiza la siguiente información (texto y/o imagen) y genera todas las flashcards que sean necesarias para cubrir los puntos clave (pregunta y respuesta corta). 
        Usa formato JSON puro: [ { "id": "id_unico", "front": "...", "back": "..." } ]
        Información textual: ${aiInputText}`;

      const contents = [{ role: "user", parts: [{ text: prompt }] }];
      if (aiImage) {
        contents[0].parts.push({ inlineData: aiImage });
      }

      const res = await model.generateContent({ contents });
      const text = res.response.text();
      const cleanJson = text.substring(text.indexOf("["), text.lastIndexOf("]") + 1);
      const parsed = JSON.parse(cleanJson).map((s) => ({ ...s, id: generateId(), selected: true }));
      setAiSuggestions(parsed);
      showToast("Flashcards sugeridas correctamente");
    } catch (e) {
      showToast("Error generación IA", "error");
    }
    setAiLoading(false);
  };

  const toggleSelectSuggestion = (id) => {
    setAiSuggestions((prev) => prev.map((s) => (s.id === id ? { ...s, selected: !s.selected } : s)));
  };

  const updateSuggestion = (id, field, val) => {
    setAiSuggestions((prev) => prev.map((s) => (s.id === id ? { ...s, [field]: val } : s)));
  };

  const removeSuggestion = (id) => {
    setAiSuggestions((prev) => prev.filter((s) => s.id !== id));
  };

  const addManualSuggestion = () => {
    setAiSuggestions([
      ...aiSuggestions,
      { id: generateId(), front: "Nueva pregunta...", back: "Nueva respuesta...", selected: true },
    ]);
  };

  return {
    aiApiKey, setAiApiKey,
    aiInputText, setAiInputText,
    aiImage, setAiImage,
    aiLoading, setAiLoading,
    aiSuggestions, setAiSuggestions,
    handlePdfUpload,
    handleImageUpload,
    generateWithAI,
    toggleSelectSuggestion,
    updateSuggestion,
    removeSuggestion,
    addManualSuggestion,
  };
}
