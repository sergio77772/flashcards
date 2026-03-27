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
    title: "🚀 ¡Bienvenido!",
    msg: "Tu plataforma de estudio definitiva con Repetición Espaciada para memorizar lo que importa.",
  },
  {
    title: "✨ Mega-Generador IA",
    msg: "Extrae flashcards de libros enteros (PDFs de 200+ pág) automáticamente. ¡La app procesa todo por lotes!",
  },
  {
    title: "👨‍🏫 Tutor Inteligente",
    msg: "¿Dudas? Chatea con tu Tutor IA. Podés mandarle texto o fotos de tus apuntes y te explica al detalle.",
  },
  {
    title: "🎧 Audio-Repaso 2.0",
    msg: "Escuchá tus tarjetas sin manos. La app avanza sola y te da tiempo para pensar antes de darte la respuesta.",
  },
  {
    title: "📈 Progreso Real",
    msg: "Mira tu racha de estudio y cuántas tarjetas has dominado. ¡Mantené tu cerebro en forma!",
  },
];
export const STUDY_TIPS = [
  {
    title: "🧠 Repetición Espaciada",
    msg: "Estudia en intervalos crecientes (1 día, 6 días, 15 días). Esto mueve la información de la memoria de corto plazo a la de largo plazo.",
  },
  {
    title: "✍️ Recuerdo Activo",
    msg: "No leas tus notas. Intenta responder la pregunta antes de ver el dorso. El esfuerzo mental de recordar es lo que fortalece la neurona.",
  },
  {
    title: "⚡ Sesiones Cortas",
    msg: "Es mejor estudiar 15 minutos todos los días que 4 horas una vez por semana. La constancia es el secreto del algoritmo.",
  },
  {
    title: "🖼️ Usa Imágenes",
    msg: "Nuestro cerebro procesa imágenes 60,000 veces más rápido que el texto. Sube fotos de tus esquemas para memorizar mejor.",
  },
  {
    title: "🍎 Descanso y Sueño",
    msg: "Tu cerebro consolida lo aprendido mientras duermes. Nunca sacrifiques horas de sueño por una noche de estudio intenso.",
  },
];
