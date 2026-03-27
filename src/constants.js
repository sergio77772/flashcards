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
    title: "🚀 ¡Bienvenido a tu Academia IA!",
    msg: "Esta no es una app de flashcards común. Es un ecosistema completo diseñado para que memorices 10 veces más rápido usando ciencia del aprendizaje.",
  },
  {
    title: "✨ Generación Masiva con IA",
    msg: "Subí tus apuntes en PDF o fotos de tus libros. Nuestra IA analiza todo y genera cientos de tarjetas por lotes automáticamente. ¡Ahorrá horas de copiado!",
  },
  {
    title: "📂 Organización por Bolillas",
    msg: "Estructurá tu materia en bolillas o temas. Cada bolilla tiene su propia barra de progreso y dominio, permitiéndote identificar qué temas necesitan más refuerzo.",
  },
  {
    title: "🪄 Mejora Mágica Individual",
    msg: "¿Un concepto es difícil? Tocá la varita mágica (🪄) en cualquier tarjeta para obtener una explicación profunda, ejemplos reales y reglas mnemotécnicas personalizadas.",
  },
  {
    title: "🏆 Gamificación y Niveles",
    msg: "Cada tarjeta que estudias te da XP. Subí de nivel, mantené tu racha de días y desbloqueá logros exclusivos. ¡Convertí el estudio en un juego!",
  },
  {
    title: "👨‍🏫 Tu Tutor Personal 24/7",
    msg: "¿No entendés algo? Hablá con el Tutor IA. Podés enviarle capturas de pantalla o texto, y te explicará cualquier tema como si fuera un profesor particular.",
  },
  {
    title: "🎧 Audio-Repaso Manos Libres",
    msg: "Ideal para el gimnasio o el viaje. Escuchá tus tarjetas, pensá la respuesta y la app te dirá el dorso automáticamente. ¡Estudiá sin mirar la pantalla!",
  },
  {
    title: "🧠 Repetición Espaciada (SRS)",
    msg: "Nuestro algoritmo calcula exactamente cuándo debés repasar cada tarjeta. Una tarjeta se considera 'Dominada' tras varios aciertos. ¡Confiá en el proceso!",
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
