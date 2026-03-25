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
    if (screen !== "audioRepaso") {
      setAudioPlaying(false);
      window.speechSynthesis.cancel();
    }
  }, [screen]);

  useEffect(() => {
    if (audioPlaying && screen === "audioRepaso") {
      const current = studyQueue[audioIdx];
      if (!current) {
        setAudioPlaying(false);
        return;
      }

      if (audioStep === "front") {
        speakText(current.front, () => {
          setTimeout(() => setAudioStep("wait"), 500);
        });
      } else if (audioStep === "wait") {
        const t = setTimeout(() => setAudioStep("back"), 2000);
        return () => clearTimeout(t);
      } else if (audioStep === "back") {
        speakText(current.back, () => {
          setTimeout(() => {
            if (audioIdx + 1 < studyQueue.length) {
              setAudioIdx(audioIdx + 1);
              setAudioStep("front");
            } else {
              setAudioPlaying(false);
              setAudioIdx(0);
              setAudioStep("front");
            }
          }, 1000);
        });
      }
    }
  }, [audioPlaying, audioIdx, audioStep, screen, studyQueue]);

  const speakText = (text, onEnd) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "es-ES";
    utterance.rate = 1.0;
    if (onEnd) utterance.onend = onEnd;
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
