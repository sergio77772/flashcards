export const COLORS = [
  { bg: "#FF6B6B", light: "#FFE0E0", name: "Rojo" },
  { bg: "#4ECDC4", light: "#E0F7F6", name: "Verde Agua" },
  { bg: "#45B7D1", light: "#E0F4FA", name: "Celeste" },
  { bg: "#96CEB4", light: "#E8F5EE", name: "Verde" },
  { bg: "#FFEAA7", light: "#FFFBE6", name: "Amarillo" },
  { bg: "#DDA0DD", light: "#F8E8F8", name: "Violeta" },
  { bg: "#F0A500", light: "#FFF3CC", name: "Naranja" },
  { bg: "#74B9FF", light: "#E6F3FF", name: "Azul" },
];

export const generateId = () => Math.random().toString(36).slice(2, 9);

export const formatTime = (sec) => {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s < 10 ? "0" : ""}${s}`;
};

export const TOUR_STEPS = [
  {
    title: "🎯 Tu Objetivo",
    msg: "Esta app usa Repetición Espaciada para que no olvides lo que estudias.",
  },
  {
    title: "📚 Materias y Bolillas",
    msg: "Organiza tu programa en Materias. Cada materia tiene Bolillas (temas).",
  },
  {
    title: "✨ Generación con IA",
    msg: "Sube un PDF o pega texto para crear flashcards automáticamente en segundos.",
  },
  {
    title: "🧠 Modos de Estudio",
    msg: "Usa el modo 'Estudiar' para memorizar, o 'Test' y 'Examen' para autoevaluarte.",
  },
  {
    title: "🎧 Audio-Repaso",
    msg: "¿Vas en el bus? Usa el audio-repaso manos libres para escuchar tus tarjetas.",
  },
  {
    title: "📅 Gráfico de Previsión",
    msg: "Mira cuántas tarjetas deberás repasar en los próximos días y alcanza tus metas.",
  },
];
