import React, { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate, useMatch } from "react-router-dom";
import { COLORS, TOUR_STEPS, formatTime } from "./constants";
import { styles } from "./styles";

// Hooks
import { useFlashcards } from "./hooks/useFlashcards";
import { useQuiz } from "./hooks/useQuiz";
import { useAiGenerator } from "./hooks/useAiGenerator";
import { useVoice } from "./hooks/useVoice";

// Components (still used in routes or as shared UI)
import LoginScreen from "./components/LoginScreen";
import AdminScreen from "./components/AdminScreen";
import AudioRepaso from "./components/AudioRepaso";
import { TourModal, DeleteModal } from "./components/Modals";
import { AddMateriaForm, AddBolillaForm, CardForm } from "./components/Forms";
import Sidebar, { TipsScreen, TutorScreen } from "./components/Sidebar";
import DebugLogsScreen from "./components/DebugLogsScreen";

// Pages
import Home from "./pages/Home";
import MateriaDetail from "./pages/MateriaDetail";
import BolillaDetail from "./pages/BolillaDetail";
import Study from "./pages/Study";
import AIGeneratorPage from "./pages/AIGenerator";
import Quiz from "./pages/Quiz";
import CardFormPage from "./pages/CardFormPage";
import AddBolillaPage from "./pages/AddBolillaPage";
import AddMateriaPage from "./pages/AddMateriaPage";
import Achievements from "./pages/Achievements";
import ConversationMode from "./pages/ConversationMode";
import BattleMode from "./pages/BattleMode";

export default function App() {
  const [screen, setScreen] = useState("home");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
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

  const matchM = useMatch("/materia/:id/*");
  const matchB = useMatch("/materia/:materiaId/bolilla/:bolillaId/*");
  const matchS = useMatch("/materia/:materiaId/study/:bolillaId?/*");
  const mId = matchB?.params.materiaId || matchS?.params.materiaId || matchM?.params.id;
  const bId = matchB?.params.bolillaId || matchS?.params.bolillaId;

  React.useEffect(() => {
    if (mId && mId !== activeMateriaId) setActiveMateriaId(mId);
    if (bId && bId !== activeBolillaId) setActiveBolillaId(bId);
  }, [mId, bId]);

  const flashcards = useFlashcards();
  const {
    user, userData, materias, loading, authLoading, allUsers, toast,
    loginGoogle, logout, addMateria, deleteMateria, addBolilla, deleteBolilla,
    addCard, addCards, saveEditCard, deleteCard, rateCard, setMateriaDeadline,
    updateStudyStats, openAdmin, changeUserRole, setToast, showToast, debugLogs, fetchDebugLogs, trackActivity, addXp
  } = flashcards;

  const {
    quizQuestions, quizIdx, quizScore, quizFinished, selectedAnswer, isExam, examTimer,
    startQuiz, startExam, handleQuizAnswer, setIsExam, setSelectedAnswer
  } = useQuiz(setScreen);

  const {
    aiApiKey, setAiApiKey, aiInputText, setAiInputText, aiImage, setAiImage, aiLoading, setAiLoading, aiSuggestions, setAiSuggestions,
    aiTips, aiTipsLoading, chatHistory, chatLoading, handlePdfUpload, handleImageUpload, generateWithAI, generateStudyTips, askCustomTip, generateBolillaSummary, generateBossBattle,
    askAiTutor, enhanceFlashcard, startConversation, answerConversation, convHistory, setConvHistory, convLoading,
    toggleSelectSuggestion, updateSuggestion, removeSuggestion, addManualSuggestion, aiBatchProgress,
  } = useAiGenerator(showToast);

  const [studyMode, setStudyMode] = useState("normal"); // normal, random, smart

  const activeMateria = materias.find((m) => m.id === activeMateriaId);
  const activeBolilla = activeMateria?.bolillas?.find((b) => b.id === activeBolillaId);
  const color = COLORS[activeMateria?.colorIdx] || COLORS[0];

  const rawQueue = React.useMemo(() => {
    return (screen === "bolilla" || screen === "study" || screen === "quiz") 
      ? (activeBolilla?.cards || [])
      : (activeMateria?.bolillas?.flatMap(b => b.cards || []) || []);
  }, [screen, activeBolilla, activeMateria]);

  const activeQueue = React.useMemo(() => {
    let q = [...rawQueue];
    if (studyMode === "random") {
      return q.sort(() => Math.random() - 0.5);
    }
    if (studyMode === "smart") {
      return q.sort((a, b) => {
        if ((a.interval || 0) !== (b.interval || 0)) return (a.interval || 0) - (b.interval || 0);
        return (a.nextReview || 0) - (b.nextReview || 0);
      });
    }
    return q;
  }, [rawQueue, studyMode]);

  const {
    activeCardIdx, setActiveCardIdx, flipped, setFlipped, isStudyFinished, setIsStudyFinished,
    audioIdx, setAudioIdx, audioPlaying, audioStep, setAudioStep,
    speakText, startStudy, startAudioRepaso, toggleAudio
  } = useVoice(activeQueue, screen, setScreen);

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
      <Sidebar 
        isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} 
        setScreen={setScreen} logout={logout} userData={userData} styles={styles} 
        startTour={() => { setIsTourOpen(true); setTourIdx(0); setIsMenuOpen(false); }}
      />
      {isTourOpen && <TourModal tourSteps={TOUR_STEPS} tourIdx={tourIdx} setTourIdx={setTourIdx} setIsTourOpen={setIsTourOpen} styles={styles} />}
      {toast && <div className="toast-in" style={{ ...styles.toast, background: toast.type === "error" ? "#FF6B6B" : "#4ECDC4" }}>{toast.msg}</div>}
      {deleteConfirm && <DeleteModal confirm={deleteConfirm} onCancel={() => setDeleteConfirm(null)} onDelete={handleDelete} styles={styles} />}

      <Routes>
        <Route path="/" element={
          <Home
            userData={userData} loading={loading} materias={materias} styles={styles}
            setScreen={setScreen} setTourIdx={setTourIdx} setIsTourOpen={setIsTourOpen}
            openAdmin={openAdmin} logout={logout}
            setNewName={setNewName} setActiveMateriaId={setActiveMateriaId}
            setIsMenuOpen={setIsMenuOpen}
          />
        } />

        <Route path="/materia/:id" element={
          <MateriaDetail
            materias={materias} setScreen={setScreen} setDeleteConfirm={setDeleteConfirm} styles={styles}
            setMateriaDeadline={setMateriaDeadline}
            setNewName={setNewName} startAudioRepaso={startAudioRepaso}
            setIsExam={setIsExam} startQuiz={startQuiz}
            startExam={startExam}
            setActiveBolillaId={setActiveBolillaId}
          />
        } />

        <Route path="/materia/:materiaId/bolilla/:bolillaId" element={
          <BolillaDetail
            materias={materias} setScreen={setScreen} setDeleteConfirm={setDeleteConfirm} styles={styles}
            setIsExam={setIsExam} startQuiz={startQuiz}
            startExam={startExam} startStudy={startStudy} setAiSuggestions={setAiSuggestions}
            setCardFront={setCardFront} setCardBack={setCardBack} setEditingCardId={setEditingCardId}
            enhanceFlashcard={enhanceFlashcard} generateBolillaSummary={generateBolillaSummary}
            studyMode={studyMode} setStudyMode={setStudyMode}
          />
        } />

        <Route path="/materia/:materiaId/bolilla/:bolillaId/conversation" element={
          <ConversationMode
            materias={materias} styles={styles}
            convHistory={convHistory} setConvHistory={setConvHistory}
            convLoading={convLoading} startConversation={startConversation}
            answerConversation={(q, card, nextCard) => {
              trackActivity("conversation_mode_answer", q);
              answerConversation(q, card, nextCard);
            }}
            userData={userData}
          />
        } />

        <Route path="/materia/:materiaId/study/:bolillaId?" element={
          <Study
            isStudyFinished={isStudyFinished} activeCardIdx={activeCardIdx} studyQueue={activeQueue}
            flipped={flipped} setFlipped={setFlipped} styles={styles}
            rateCard={(q) => {
              // Usamos mId y bId extraídos directamente de la URL para mayor confiabilidad
              rateCard(mId, bId, activeQueue[activeCardIdx]?.id, q, updateStudyStats);
              if (activeCardIdx + 1 < activeQueue.length) { setActiveCardIdx(activeCardIdx + 1); setFlipped(false); }
              else setIsStudyFinished(true);
            }}
            speakText={speakText} color={color}
          />
        } />

        <Route path="/quiz" element={
          <Quiz
            isExam={isExam} quizFinished={quizFinished} quizIdx={quizIdx}
            quizQuestions={quizQuestions} examTimer={examTimer} selectedAnswer={selectedAnswer}
            quizScore={quizScore} handleQuizAnswer={handleQuizAnswer} styles={styles}
            startExam={startExam} startQuiz={startQuiz}
            setIsExam={setIsExam} setSelectedAnswer={setSelectedAnswer}
            formatTime={formatTime}
          />
        } />

        <Route path="/ai-generator" element={
          <AIGeneratorPage
            aiApiKey={aiApiKey} setAiApiKey={setAiApiKey} aiInputText={aiInputText} setAiInputText={setAiInputText}
            aiImage={aiImage} setAiImage={setAiImage} handleImageUpload={handleImageUpload}
            aiLoading={aiLoading} aiSuggestions={aiSuggestions} setAiSuggestions={setAiSuggestions}
            handlePdfUpload={handlePdfUpload} 
            generateWithAI={() => {
              trackActivity("generate_flashcards_ai", aiInputText ? aiInputText.substring(0, 200) + (aiInputText.length > 200 ? "..." : "") : "Media upload");
              generateWithAI();
            }} 
            styles={styles}
            toggleSelectSuggestion={toggleSelectSuggestion} updateSuggestion={updateSuggestion}
            removeSuggestion={removeSuggestion} addManualSuggestion={addManualSuggestion}
            aiBatchProgress={aiBatchProgress}
            saveAiFlashcards={async () => {
              const selected = aiSuggestions.filter(s => s.selected);
              setAiLoading(true);
              try {
                await addCards(activeMateriaId, activeBolillaId, selected);
                setAiSuggestions([]);
              } finally {
                setAiLoading(false);
              }
            }}
          />
        } />

        <Route path="/admin" element={
          <AdminScreen
            allUsers={allUsers} setScreen={() => {}} changeUserRole={changeUserRole}
            user={user} userData={userData} styles={styles} openAdmin={openAdmin}
          />
        } />

        <Route path="/debug-logs" element={
          <DebugLogsScreen
            styles={styles} setScreen={() => {}} 
            debugLogs={debugLogs} fetchLogs={fetchDebugLogs} 
          />
        } />

        <Route path="/tips" element={
          <TipsScreen 
            styles={styles} setScreen={() => {}} 
            aiTips={aiTips} loading={aiTipsLoading} generateTips={generateStudyTips} 
            askCustomTip={async (q) => {
              trackActivity("ask_custom_tip", q);
              return await askCustomTip(q);
            }}
          />
        } />

        <Route path="/tutor" element={
          <TutorScreen 
            styles={styles} setScreen={() => {}} 
            chatHistory={chatHistory} loading={chatLoading} 
            askTutor={(q, img) => {
              trackActivity("ask_tutor", q);
              askAiTutor(q, img);
            }} 
          />
        } />

        <Route path="/battle" element={
          <BattleMode 
            materias={materias} generateBossBattle={generateBossBattle} 
            styles={styles} trackActivity={trackActivity} addXp={addXp} 
          />
        } />

        <Route path="/achievements" element={
          <Achievements 
            styles={styles} userData={userData} 
          />
        } />

        <Route path="/audio-repaso" element={
          <AudioRepaso
            studyQueue={activeQueue} audioIdx={audioIdx} audioPlaying={audioPlaying} audioStep={audioStep}
            setAudioIdx={setAudioIdx} setAudioStep={setAudioStep} toggleAudio={toggleAudio}
            setScreen={() => {}} styles={styles}
          />
        } />

        <Route path="/add-materia" element={
          <AddMateriaPage
            newName={newName} setNewName={setNewName}
            newColorIdx={newColorIdx} setNewColorIdx={setNewColorIdx}
            styles={styles} addMateria={addMateria}
          />
        } />

        <Route path="/add-bolilla/:materiaId" element={
          <AddBolillaPage
            newName={newName} setNewName={setNewName}
            color={color} styles={styles} addBolilla={addBolilla}
          />
        } />

        <Route path="/add-card" element={
          <CardFormPage
            isEdit={false} front={cardFront} setFront={setCardFront}
            back={cardBack} setBack={setCardBack} color={color} styles={styles}
            onSave={() => addCard(activeMateriaId, activeBolillaId, cardFront, cardBack)}
          />
        } />

        <Route path="/edit-card" element={
          <CardFormPage
            isEdit={true} front={cardFront} setFront={setCardFront}
            back={cardBack} setBack={setCardBack} color={color} styles={styles}
            onSave={() => saveEditCard(activeMateriaId, activeBolillaId, editingCardId, cardFront, cardBack)}
          />
        } />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>

      <style>{`
        .btn-bounce { transition: transform 0.12s; cursor: pointer; }
        .btn-bounce:active { transform: scale(0.95); }
        .list-item { transition: transform .15s, opacity .15s; cursor: pointer; }
        .list-item:active { transform: scale(0.98); opacity: 0.8; }

        @keyframes toastIn { from { opacity:0; transform: translateX(-50%) translateY(14px); } to { opacity:1; transform: translateX(-50%) translateY(0); } }
        .toast-in { animation: toastIn .3s cubic-bezier(.2,.8,.3,1) both; }

        @keyframes rotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .loader-card { width: 40px; height: 40px; border: 3px solid rgba(255,255,255,0.08); border-top: 3px solid #7c6fff; border-radius: 50%; animation: rotate 0.9s linear infinite; margin-bottom: 16px; }
        .loading-dots::after { content: "."; animation: dots 1.5s steps(3,end) infinite; }
        @keyframes dots { 0%,20%{content:'.'} 40%{content:'..'} 60%,100%{content:'...'} }

        .card-flip { perspective: 1000px; width: 100%; display: flex; justify-content: center; }
        .card-inner { position: relative; width: 100%; height: 100%; transition: transform 0.55s cubic-bezier(.4,2,.3,1); transform-style: preserve-3d; }
        .card-inner.flipped { transform: rotateY(180deg); }
        .card-face { position: absolute; top:0; left:0; width:100%; height:100%; backface-visibility: hidden; -webkit-backface-visibility: hidden; display:flex; align-items:center; justify-content:center; }
        .card-back-face { transform: rotateY(180deg); }
      `}</style>
    </div>
  );
}
