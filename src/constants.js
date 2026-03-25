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
    title: "🚀 Bienvenido",
    msg: "Esta app utiliza Repetición Espaciada para garantizar que nunca olvides lo que estudias.",
  },
  {
    title: "✨ Generación IA Ilimitada",
    msg: "Extrae flashcards automáticamente desde cualquier PDF o texto sin límites. ¡Ahorra horas de trabajo!",
  },
  {
    title: "📚 Materias y Temas",
    msg: "Organiza tu programa en Materias. Cada una contiene Bolillas para agrupar tus conceptos clave.",
  },
  {
    title: "🧠 Domina el Contenido",
    msg: "Utiliza el modo 'Estudiar' para memorizar, o ponte a prueba con los modos 'Test' y 'Examen'.",
  },
  {
    title: "🎧 Repaso Manos Libres",
    msg: "¿En movimiento? Activa el Audio-Repaso para escuchar tus tarjetas mientras viajas o descansas.",
  },
  {
    title: "📅 Gráfico de Progreso",
    msg: "Visualiza tu carga de estudio semanal y mantén tu racha de aprendizaje viva cada día.",
  },
];
