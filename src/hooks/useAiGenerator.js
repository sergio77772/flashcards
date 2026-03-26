import { useState } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import * as pdfjsLib from "pdfjs-dist";
import pdfWorker from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import { generateId } from "../constants";
import { db } from "../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

export function useAiGenerator(showToast) {
  const [aiApiKey, setAiApiKey] = useState(
    import.meta.env.VITE_GEMINI_API_KEY || "",
  );
  const [aiInputText, setAiInputText] = useState("");
  const [aiImage, setAiImage] = useState(null); // { data: string, mimeType: string }
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [aiTips, setAiTips] = useState([]);
  const [aiTipsLoading, setAiTipsLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [aiBatchProgress, setAiBatchProgress] = useState(null); // { current: number, total: number }

  const logEvent = async (type, details) => {
    try {
      await addDoc(collection(db, "debug_logs"), {
        type,
        details,
        userAgent: navigator.userAgent,
        timestamp: serverTimestamp(),
      });
    } catch (e) {
      console.error("No se pudo loguear en Firebase:", e);
    }
  };

  const handlePdfUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAiLoading(true);
    logEvent("PDF_START", { fileName: file.name, fileSize: file.size });

    try {
      const reader = new FileReader();
      reader.onerror = (err) => {
        logEvent("PDF_ERROR_READER", { error: err.toString() });
        showToast("Error al leer el archivo", "error");
        setAiLoading(false);
      };
      reader.onload = async (ev) => {
        try {
          const typedarray = new Uint8Array(ev.target.result);
          logEvent("PDF_LOADED_READER", { success: true });
          
          const loadingTask = pdfjsLib.getDocument(typedarray);
          const pdf = await loadingTask.promise;
          logEvent("PDF_PAGES_COUNT", { count: pdf.numPages });
          
          let fullText = "";
          for (let i = 1; i <= pdf.numPages; i++) {
            try {
              const page = await pdf.getPage(i);
              const t = await page.getTextContent();
              fullText += t.items.map((it) => it.str).join(" ");
              if (i % 5 === 0) logEvent("PDF_EXTRACT_PROGRESS", { page: i });
            } catch (pageErr) {
              logEvent("PDF_PAGE_ERROR", { page: i, error: pageErr.toString() });
            }
          }
          setAiInputText(fullText);
          showToast("PDF procesado con éxito");
          logEvent("PDF_SUCCESS", { textLength: fullText.length });
        } catch (err) {
          logEvent("PDF_ERROR_PROCESO", { error: err.toString(), stack: err.stack });
          showToast("Error al procesar PDF", "error");
        } finally {
          setAiLoading(false);
        }
      };
      reader.readAsArrayBuffer(file);
    } catch (err) {
      logEvent("PDF_ERROR_FATAL", { error: err.toString() });
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
    setAiSuggestions([]);
    
    try {
      const genAI = new GoogleGenerativeAI(aiApiKey);
      const model = genAI.getGenerativeModel(
        { model: "gemini-2.0-flash" },
        { apiVersion: "v1" },
      );

      // Si hay imagen, hacemos un solo pedido (prioridad a la imagen)
      if (aiImage) {
        const prompt = `Analiza la información de la imagen y el texto adjunto para generar todas las flashcards necesarias. 
          Usa formato JSON puro: [ { "front": "...", "back": "..." } ]
          Texto adjunto: ${aiInputText}`;
        const contents = [{ role: "user", parts: [{ text: prompt }, { inlineData: aiImage }] }];
        const res = await model.generateContent({ contents });
        const text = res.response.text();
        const cleanJson = text.substring(text.indexOf("["), text.lastIndexOf("]") + 1);
        const parsed = JSON.parse(cleanJson).map((s) => ({ ...s, id: generateId(), selected: true }));
        setAiSuggestions(parsed);
      } else {
        // Si es solo texto y es largo, dividimos por lotes
        const CHUNK_SIZE = 12000; // Aprox 4-5 páginas de texto denso
        const chunks = [];
        for (let i = 0; i < aiInputText.length; i += CHUNK_SIZE) {
          chunks.push(aiInputText.substring(i, i + CHUNK_SIZE));
        }

        const allSuggestions = [];
        setAiBatchProgress({ current: 1, total: chunks.length });

        for (let i = 0; i < chunks.length; i++) {
          setAiBatchProgress({ current: i + 1, total: chunks.length });
          const prompt = `Analiza este fragmento del material de estudio y genera flashcards precisas (pregunta y respuesta corta). 
            Parte ${i + 1} de ${chunks.length}.
            Usa formato JSON puro: [ { "front": "...", "back": "..." } ]
            Contenido: ${chunks[i]}`;

          try {
            const res = await model.generateContent(prompt);
            const text = res.response.text();
            const startIdx = text.indexOf("[");
            const endIdx = text.lastIndexOf("]") + 1;
            
            if (startIdx !== -1 && endIdx !== -1) {
              const cleanJson = text.substring(startIdx, endIdx);
              const parsed = JSON.parse(cleanJson).map((s) => ({ ...s, id: generateId(), selected: true }));
              allSuggestions.push(...parsed);
              // Actualizamos vista parcial
              setAiSuggestions([...allSuggestions]);
            }
          } catch (chunkErr) {
            console.error("Error en lote:", i, chunkErr);
          }
        }
        setAiBatchProgress(null);
      }
      showToast("Generación finalizada correctamente");
    } catch (e) {
      showToast("Error generación IA", "error");
      setAiBatchProgress(null);
    }
    setAiLoading(false);
  };

  const generateStudyTips = async () => {
    if (!aiApiKey) return;
    setAiTipsLoading(true);
    try {
      const genAI = new GoogleGenerativeAI(aiApiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
      const prompt = `Genera 5 consejos breves y potentes sobre técnicas de estudio efectivas (como repetición espaciada, active recall, técnica feynman, etc).
        Usa formato JSON: [ { "title": "...", "msg": "..." } ]`;
      const res = await model.generateContent(prompt);
      const text = res.response.text();
      const cleanJson = text.substring(text.indexOf("["), text.lastIndexOf("]") + 1);
      setAiTips(JSON.parse(cleanJson));
    } catch (e) {
      console.error(e);
    }
    setAiTipsLoading(false);
  };

  const askAiTutor = async (q, img = null) => {
    if (!aiApiKey || !q.trim()) return;
    setChatLoading(true);
    const userMsg = { role: "user", text: q, img };
    setChatHistory(prev => [...prev, userMsg]);
    
    try {
      const genAI = new GoogleGenerativeAI(aiApiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
      
      const contents = [{ role: "user", parts: [{ text: `Eres un tutor académico. Explica de forma clara y sencilla el siguiente tema o duda.
        Duda: ${q}` }] }];
      if (img) contents[0].parts.push({ inlineData: img });

      const res = await model.generateContent({ contents });
      const aiText = res.response.text();
      setChatHistory(prev => [...prev, { role: "ai", text: aiText }]);
    } catch (e) {
      setChatHistory(prev => [...prev, { role: "ai", text: "Hubo un error al procesar tu duda. Reintenta pronto." }]);
    }
    setChatLoading(false);
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
    aiTips, aiTipsLoading,
    chatHistory, setChatHistory, chatLoading,
    handlePdfUpload,
    handleImageUpload,
    generateWithAI,
    generateStudyTips,
    askAiTutor,
    toggleSelectSuggestion,
    updateSuggestion,
    removeSuggestion,
    addManualSuggestion,
    aiBatchProgress,
  };
}
