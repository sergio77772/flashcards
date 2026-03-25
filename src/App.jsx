import React, { useState } from "react";
import { COLORS, TOUR_STEPS, formatTime } from "./constants";
import { styles } from "./styles";

// Hooks
import { useFlashcards } from "./hooks/useFlashcards";
import { useQuiz } from "./hooks/useQuiz";
import { useAiGenerator } from "./hooks/useAiGenerator";
import { useVoice } from "./hooks/useVoice";

// Components
import LoginScreen from "./components/LoginScreen";
import MateriasScreen from "./components/MateriasScreen";
import AdminScreen from "./components/AdminScreen";
import MateriaDetailScreen from "./components/MateriaDetailScreen";
import BolillaDetailScreen from "./components/BolillaDetailScreen";
import QuizMode from "./components/QuizMode";
import AIGenerator from "./components/AIGenerator";
import StudyMode from "./components/StudyMode";
import AudioRepaso from "./components/AudioRepaso";
import { TourModal, DeleteModal } from "./components/Modals";
import { AddMateriaForm, AddBolillaForm, CardForm } from "./components/Forms";

export default function App() {
  const [screen, setScreen] = useState("home");
  const [activeMateriaId, setActiveMateriaId] = useState(null);
  const [activeBolillaId, setActiveBolillaId] = useState(null);
  const [newName, setNewName] = useState("");
  const [newColorIdx, setNewColorIdx] = useState(0);
  const [cardFront, setCardFront] = useState("");
  const [cardBack, setCardBack] = useState("");
  const [editingCardId, setEditingCardId] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [isTourOpen, setIsTourOpen] = useState(false);
  const [tourIdx, setTourIdx] = useState(0);

  const flashcards = useFlashcards();
  const {
    user, userData, materias, loading, authLoading, allUsers, toast,
    loginGoogle, logout, addMateria, deleteMateria, addBolilla, deleteBolilla,
    addCard, addCards, saveEditCard, deleteCard, rateCard, setMateriaDeadline,
    updateStudyStats, openAdmin, changeUserRole, setToast, showToast
  } = flashcards;

  const {
    quizQuestions, quizIdx, quizScore, quizFinished, selectedAnswer, isExam, examTimer,
    startQuiz, startExam, handleQuizAnswer, setIsExam, setSelectedAnswer
  } = useQuiz(screen === "quiz" ? "quiz" : null);

  const {
    aiApiKey, setAiApiKey, aiInputText, setAiInputText, aiLoading, setAiLoading, aiSuggestions, setAiSuggestions,
    handlePdfUpload, generateWithAI, toggleSelectSuggestion, updateSuggestion, removeSuggestion,
    addManualSuggestion,
  } = useAiGenerator(showToast);

  const activeMateria = materias.find((m) => m.id === activeMateriaId);
  const activeBolilla = activeMateria?.bolillas?.find((b) => b.id === activeBolillaId);
  const color = COLORS[activeMateria?.colorIdx] || COLORS[0];
  const studyQueue = activeBolilla?.cards || [];

  const {
    activeCardIdx, setActiveCardIdx, flipped, setFlipped, isStudyFinished, setIsStudyFinished,
    audioIdx, setAudioIdx, audioPlaying, audioStep, setAudioStep,
    speakText, startStudy, startAudioRepaso, toggleAudio
  } = useVoice(studyQueue, screen);

  const handleDelete = () => {
    if (deleteConfirm.type === "materia") deleteMateria(deleteConfirm.id);
    else if (deleteConfirm.type === "bolilla") deleteBolilla(activeMateriaId, deleteConfirm.id);
    else deleteCard(activeMateriaId, activeBolillaId, deleteConfirm.id);
    setDeleteConfirm(null);
  };

  if (authLoading) return <div style={{ ...styles.root, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>Cargando sesión...</div>;
  if (!user) return <LoginScreen loginGoogle={loginGoogle} styles={styles} />;

  return (
    <div style={styles.root}>
      {isTourOpen && <TourModal tourSteps={TOUR_STEPS} tourIdx={tourIdx} setTourIdx={setTourIdx} setIsTourOpen={setIsTourOpen} styles={styles} />}
      {toast && <div className="toast-in" style={{ ...styles.toast, background: toast.type === "error" ? "#FF6B6B" : "#4ECDC4" }}>{toast.msg}</div>}
      {deleteConfirm && <DeleteModal confirm={deleteConfirm} onCancel={() => setDeleteConfirm(null)} onDelete={handleDelete} styles={styles} />}

      {screen === "home" && (
        <MateriasScreen
          userData={userData} loading={loading} materias={materias} styles={styles}
          setScreen={setScreen} setTourIdx={setTourIdx} setIsTourOpen={setIsTourOpen}
          openAdmin={() => { openAdmin(); setScreen("admin"); }} logout={logout}
          setNewName={setNewName} setActiveMateriaId={setActiveMateriaId}
        />
      )}

      {screen === "admin" && (
        <AdminScreen
          allUsers={allUsers} setScreen={setScreen} changeUserRole={changeUserRole}
          user={user} styles={styles}
        />
      )}

      {screen === "materia" && activeMateria && (
        <MateriaDetailScreen
          activeMateria={activeMateria} activeMateriaId={activeMateriaId} color={color}
          setScreen={setScreen} setDeleteConfirm={setDeleteConfirm} styles={styles}
          setMateriaDeadline={(d) => setMateriaDeadline(activeMateriaId, d)}
          setNewName={setNewName} startAudioRepaso={() => startAudioRepaso(studyQueue)}
          setIsExam={setIsExam} startQuiz={() => startQuiz("materia", materias, activeMateriaId)}
          startExam={() => startExam("materia", materias, activeMateriaId)}
          setActiveBolillaId={setActiveBolillaId}
        />
      )}

      {screen === "bolilla" && activeBolilla && (
        <BolillaDetailScreen
          activeBolilla={activeBolilla} activeBolillaId={activeBolillaId} color={color}
          setScreen={setScreen} setDeleteConfirm={setDeleteConfirm} styles={styles}
          setIsExam={setIsExam} startQuiz={() => startQuiz("bolilla", materias, activeMateriaId, activeBolillaId)}
          startExam={() => startExam("bolilla", materias, activeMateriaId, activeBolillaId)}
          startStudy={() => startStudy(studyQueue)} setAiSuggestions={setAiSuggestions}
          setCardFront={setCardFront} setCardBack={setCardBack} setEditingCardId={setEditingCardId}
        />
      )}

      {screen === "addMateria" && (
        <AddMateriaForm
          newName={newName} setNewName={setNewName} newColorIdx={newColorIdx} setNewColorIdx={setNewColorIdx}
          onSubmit={() => { addMateria(newName, newColorIdx); setScreen("home"); }}
          onCancel={() => setScreen("home")} styles={styles}
        />
      )}

      {screen === "addBolilla" && (
        <AddBolillaForm
          newName={newName} setNewName={setNewName} color={color} styles={styles}
          onSubmit={() => { addBolilla(activeMateriaId, newName); setScreen("materia"); }}
          onCancel={() => setScreen("materia")}
        />
      )}

      {(screen === "addCard" || screen === "editCard") && (
        <CardForm
          isEdit={screen === "editCard"} front={cardFront} setFront={setCardFront}
          back={cardBack} setBack={setCardBack} color={color} styles={styles}
          onCancel={() => setScreen("bolilla")}
          onSubmit={() => {
            if (screen === "addCard") addCard(activeMateriaId, activeBolillaId, cardFront, cardBack);
            else saveEditCard(activeMateriaId, activeBolillaId, editingCardId, cardFront, cardBack);
            setScreen("bolilla");
          }}
        />
      )}

      {screen === "quiz" && (
        <QuizMode
          screen={screen} isExam={isExam} quizFinished={quizFinished} quizIdx={quizIdx}
          quizQuestions={quizQuestions} examTimer={examTimer} selectedAnswer={selectedAnswer}
          quizScore={quizScore} handleQuizAnswer={handleQuizAnswer} styles={styles}
          startExam={() => startExam("bolilla", materias, activeMateriaId, activeBolillaId)}
          startQuiz={() => startQuiz("bolilla", materias, activeMateriaId, activeBolillaId)}
          setScreen={setScreen} setIsExam={setIsExam} setSelectedAnswer={setSelectedAnswer}
          formatTime={formatTime}
        />
      )}

      {screen === "aiGenerator" && (
        <AIGenerator
          aiApiKey={aiApiKey} setAiApiKey={setAiApiKey} aiInputText={aiInputText} setAiInputText={setAiInputText}
          aiLoading={aiLoading} aiSuggestions={aiSuggestions} setAiSuggestions={setAiSuggestions}
          handlePdfUpload={handlePdfUpload} generateWithAI={generateWithAI} styles={styles}
          toggleSelectSuggestion={toggleSelectSuggestion} updateSuggestion={updateSuggestion}
          removeSuggestion={removeSuggestion} addManualSuggestion={addManualSuggestion}
          saveAiFlashcards={async () => {
            const selected = aiSuggestions.filter(s => s.selected);
            setAiLoading(true);
            try {
              await addCards(activeMateriaId, activeBolillaId, selected);
              setAiSuggestions([]); setScreen("bolilla");
            } finally {
              setAiLoading(false);
            }
          }}
          setScreen={setScreen}
        />
      )}

      {screen === "study" && (
        <StudyMode
          isStudyFinished={isStudyFinished} activeCardIdx={activeCardIdx} studyQueue={studyQueue}
          flipped={flipped} setFlipped={setFlipped} styles={styles}
          rateCard={(q) => {
            rateCard(activeMateriaId, activeBolillaId, studyQueue[activeCardIdx].id, q, updateStudyStats);
            if (activeCardIdx + 1 < studyQueue.length) { setActiveCardIdx(activeCardIdx + 1); setFlipped(false); }
            else setIsStudyFinished(true);
          }}
          speakText={speakText} setScreen={setScreen} color={color}
        />
      )}

      {screen === "audioRepaso" && (
        <AudioRepaso
          studyQueue={studyQueue} audioIdx={audioIdx} audioPlaying={audioPlaying} audioStep={audioStep}
          setAudioIdx={setAudioIdx} setAudioStep={setAudioStep} toggleAudio={toggleAudio}
          setScreen={setScreen} styles={styles}
        />
      )}
    </div>
  );
}
