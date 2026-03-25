import { useState, useEffect } from "react";

export function useQuiz(setScreen) {
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [quizIdx, setQuizIdx] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isExam, setIsExam] = useState(false);
  const [examTimer, setExamTimer] = useState(0);

  useEffect(() => {
    let interval;
    if (isExam && !quizFinished && setScreen === "quiz") {
      interval = setInterval(() => setExamTimer((t) => t + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isExam, quizFinished, setScreen]);

  const startQuiz = (type, materias, activeMateriaId, activeBolillaId) => {
    let allC = [];
    if (type === "materia") {
      const m = materias.find((m) => m.id === activeMateriaId);
      allC = (m.bolillas || []).flatMap((b) => b.cards || []);
    } else if (type === "bolilla") {
      const m = materias.find((m) => m.id === activeMateriaId);
      const b = (m.bolillas || []).find((b) => b.id === activeBolillaId);
      allC = b.cards || [];
    } else {
      allC = materias.flatMap((m) => (m.bolillas || []).flatMap((b) => b.cards || []));
    }

    if (allC.length < 4) {
      alert("Necesitas al menos 4 tarjetas para generar un test.");
      return;
    }

    const shuffled = [...allC].sort(() => 0.5 - Math.random()).slice(0, 10);
    const questions = shuffled.map((c) => {
      const otherBacks = allC.filter((o) => o.id !== c.id).map((o) => o.back);
      const options = [c.back, ...otherBacks.sort(() => 0.5 - Math.random()).slice(0, 3)].sort(() => 0.5 - Math.random());
      return { question: c.front, options, correctAnswer: c.back };
    });

    setQuizQuestions(questions);
    setQuizIdx(0);
    setQuizScore(0);
    setQuizFinished(false);
    setSelectedAnswer(null);
    setExamTimer(0);
    setScreen("quiz");
  };

  const startExam = (type, materias, activeMateriaId, activeBolillaId) => {
    setIsExam(true);
    startQuiz(type, materias, activeMateriaId, activeBolillaId);
  };

  const handleQuizAnswer = (ans) => {
    if (selectedAnswer !== null && !isExam) return;
    setSelectedAnswer(ans);
    if (ans === quizQuestions[quizIdx].correctAnswer) setQuizScore((s) => s + 1);

    if (isExam) {
      setTimeout(() => {
        if (quizIdx + 1 < quizQuestions.length) {
          setQuizIdx(quizIdx + 1);
          setSelectedAnswer(null);
        } else {
          setQuizFinished(true);
        }
      }, 500);
    } else {
      setTimeout(() => {
        if (quizIdx + 1 < quizQuestions.length) {
          setQuizIdx(quizIdx + 1);
          setSelectedAnswer(null);
        } else {
          setQuizFinished(true);
        }
      }, 2000);
    }
  };

  return {
    quizQuestions,
    quizIdx,
    quizScore,
    quizFinished,
    selectedAnswer,
    isExam,
    examTimer,
    startQuiz,
    startExam,
    handleQuizAnswer,
    setIsExam,
    setSelectedAnswer,
  };
}
