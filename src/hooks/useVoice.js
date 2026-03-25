import { useState, useEffect } from "react";

export function useVoice(studyQueue, screen, setScreen) {
  const [activeCardIdx, setActiveCardIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [isStudyFinished, setIsStudyFinished] = useState(false);
  const [audioIdx, setAudioIdx] = useState(0);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [audioStep, setAudioStep] = useState("front");
  const [isStudyStarted, setIsStudyStarted] = useState(false);

  useEffect(() => {
    let t;
    if (audioPlaying && screen === "audioRepaso") {
      const current = studyQueue[audioIdx];
      if (!current) {
        setAudioPlaying(false);
        return;
      }
      if (audioStep === "front") {
        speakText(current.front);
        t = setTimeout(() => setAudioStep("wait"), 3500);
      } else if (audioStep === "wait") {
        t = setTimeout(() => setAudioStep("back"), 1500);
      } else if (audioStep === "back") {
        speakText(current.back);
        t = setTimeout(() => {
          if (audioIdx + 1 < studyQueue.length) {
            setAudioIdx(audioIdx + 1);
            setAudioStep("front");
          } else {
            setAudioPlaying(false);
            setAudioIdx(0);
            setAudioStep("front");
            alert("Repaso de audio finalizado");
          }
        }, 4500);
      }
    }
    return () => {
      clearTimeout(t);
      if (screen !== "audioRepaso") {
        setAudioPlaying(false);
      }
    };
  }, [audioPlaying, audioIdx, audioStep, screen, studyQueue]);

  const speakText = (text) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "es-ES";
    utterance.rate = 0.95;
    window.speechSynthesis.speak(utterance);
  };

  const startStudy = (queue) => {
    if (queue.length === 0) return;
    setActiveCardIdx(0);
    setFlipped(false);
    setIsStudyFinished(false);
    setScreen("study");
  };

  const startAudioRepaso = (queue) => {
    if (queue.length === 0) {
      alert("No hay tarjetas para repasar con audio.");
      return;
    }
    setAudioIdx(0);
    setAudioStep("front");
    setAudioPlaying(true);
    setScreen("audioRepaso");
  };

  const toggleAudio = () => {
    if (audioPlaying) window.speechSynthesis.cancel();
    setAudioPlaying(!audioPlaying);
  };

  return {
    activeCardIdx,
    setActiveCardIdx,
    flipped,
    setFlipped,
    isStudyFinished,
    setIsStudyFinished,
    audioIdx,
    setAudioIdx,
    audioPlaying,
    setAudioPlaying,
    audioStep,
    setAudioStep,
    speakText,
    startStudy,
    startAudioRepaso,
    toggleAudio,
  };
}
