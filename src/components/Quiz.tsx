import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Loader2 } from "lucide-react";
import { db, auth } from "../firebase";
import { doc, setDoc, serverTimestamp, getDocFromServer } from "firebase/firestore";

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

interface QuizProps {
  onComplete: (answers: Record<string, string>, kitName: string) => void;
  onClose: () => void;
}

const STEPS = [
  {
    id: "hook",
    type: "splash",
    headline: "SORT YOUR FACE.",
    subtext: "30 seconds to fix your routine. No long talk.",
    button: "START ASSESSMENT"
  },
  {
    id: "skinType",
    question: "HOW IS THE FACE LOOKING BY 2PM?",
    options: [
      { id: "A", label: "Shining too much." },
      { id: "B", label: "Dry and tight." },
      { id: "C", label: "It’s just there." }
    ]
  },
  {
    id: "environment",
    question: "WHERE DO YOU SPEND MOST OF YOUR DAY?",
    options: [
      { id: "A", label: "Inside AC throughout." },
      { id: "B", label: "Always on the road." },
      { id: "C", label: "Under the sun." }
    ]
  },
  {
    id: "goal",
    question: "WHAT IS THE MISSION?",
    options: [
      { id: "A", label: "Too many breakouts." },
      { id: "B", label: "Face looks tired/dull." },
      { id: "C", label: "Dark spots/Sunburn." }
    ]
  },
  {
    id: "processing",
    type: "processing"
  }
];

export default function Quiz({ onComplete, onClose }: QuizProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const currentStep = STEPS[currentStepIndex];
  const progress = ((currentStepIndex) / (STEPS.length - 1)) * 100;

  const getKitName = (ans: Record<string, string>) => {
    const skinType = ans.skinType;
    const goal = ans.goal;
    if (skinType === "A" || goal === "A") return "THE HEAT-SHIELD KIT";
    if (skinType === "B" || goal === "B") return "THE HYDRA-CORE SYSTEM";
    return "THE NIGHT-RECOVERY SYSTEM";
  };

  const handleSelect = (optionId: string) => {
    setSelectedOption(optionId);
    
    // Tactile snap feedback
    setTimeout(() => {
      const nextAnswers = { ...answers, [currentStep.id]: optionId };
      setAnswers(nextAnswers);
      setSelectedOption(null);
      setCurrentStepIndex(prev => prev + 1);
    }, 300);
  };

  useEffect(() => {
    if (currentStep.type === "processing") {
      const saveAndComplete = async () => {
        const kitName = getKitName(answers);
        const user = auth.currentUser;
        
        // Only save if user is already authenticated (e.g. returning user)
        if (user) {
          const path = `profiles/${user.uid}`;
          try {
            await setDoc(doc(db, "profiles", user.uid), {
              uid: user.uid,
              ...answers,
              assignedKit: kitName,
              status: "quiz_complete",
              timestamp: serverTimestamp()
            });
          } catch (error) {
            handleFirestoreError(error, OperationType.WRITE, path);
          }
        }
        
        onComplete(answers, kitName);
      };

      const timer = setTimeout(saveAndComplete, 2500);
      return () => clearTimeout(timer);
    }
  }, [currentStepIndex, answers, onComplete]);

  return (
    <div className="fixed inset-0 z-[100] bg-brand-bg flex flex-col">
      {/* Progress Bar */}
      {currentStep.type !== "splash" && currentStep.type !== "processing" && (
        <div className="absolute top-0 left-0 w-full h-1 bg-brand-border">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            className="h-full bg-brand-accent shadow-[0_0_10px_#CCFF00]"
          />
        </div>
      )}

      {/* Close Button */}
      <button 
        onClick={onClose}
        className="absolute top-8 right-8 text-brand-muted hover:text-brand-text transition-colors font-bold text-xs tracking-widest uppercase z-10"
      >
        [ EXIT ]
      </button>

      <div className="flex-1 flex items-center justify-center p-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStepIndex}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="w-full max-w-4xl"
          >
            {currentStep.type === "splash" ? (
              <div className="text-center">
                <h1 className="text-[2.75rem] sm:text-5xl md:text-8xl mb-6 leading-none">{currentStep.headline}</h1>
                <p className="text-brand-muted text-lg md:text-xl mb-12">{currentStep.subtext}</p>
                <button 
                  onClick={() => setCurrentStepIndex(1)}
                  className="bg-brand-accent text-brand-bg px-12 py-6 font-display text-lg md:text-xl uppercase tracking-tight hover:brightness-110 transition-all active:scale-95"
                >
                  {currentStep.button}
                </button>
              </div>
            ) : currentStep.type === "processing" ? (
              <div className="text-center">
                <div className="relative w-32 h-32 mx-auto mb-12">
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 border-2 border-dashed border-brand-accent rounded-full"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Loader2 className="w-12 h-12 text-brand-accent animate-pulse" />
                  </div>
                </div>
                <motion.div
                  animate={{ opacity: [1, 0.5, 1] }}
                  transition={{ duration: 0.5, repeat: Infinity }}
                  className="font-mono text-brand-accent tracking-[0.3em] text-sm uppercase"
                >
                  ENGINEERING YOUR SETUP...
                </motion.div>
                <div className="mt-4 font-mono text-brand-muted text-[0.625rem] uppercase tracking-widest">
                  ALMOST DONE...
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <h2 className="text-[2rem] sm:text-3xl md:text-6xl text-center mb-10 md:mb-16 max-w-3xl leading-tight">
                  {currentStep.question}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 w-full">
                  {currentStep.options?.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => handleSelect(option.id)}
                      className={`
                        relative group p-8 border-2 text-left transition-all duration-150
                        ${selectedOption === option.id 
                          ? "border-brand-accent bg-brand-accent text-brand-bg shadow-[0_0_20px_rgba(204,255,0,0.3)]" 
                          : "border-brand-border hover:border-brand-accent/50 text-brand-text"}
                      `}
                    >
                      <div className={`
                        text-xs font-bold tracking-widest uppercase mb-4
                        ${selectedOption === option.id ? "text-brand-bg/60" : "text-brand-muted"}
                      `}>
                        Option {option.id}
                      </div>
                      <div className="text-xl md:text-2xl font-display uppercase leading-tight">
                        {option.label}
                      </div>
                      
                      {/* Corner Accents */}
                      <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-current opacity-20" />
                      <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-current opacity-20" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Technical Footer Decoration */}
      <div className="p-8 flex justify-between items-end pointer-events-none">
        <div className="font-mono text-[0.625rem] text-brand-border uppercase tracking-[0.2em]">
          LM_CORE_V2.0 // CALIBRATION_MODE
        </div>
        <div className="font-mono text-[0.625rem] text-brand-border uppercase tracking-[0.2em]">
          {new Date().toISOString()}
        </div>
      </div>
    </div>
  );
}
