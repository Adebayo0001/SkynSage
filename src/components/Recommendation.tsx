import { motion, AnimatePresence } from "motion/react";
import React, { useState, useEffect } from "react";
import { Check, MessageCircle, ShieldCheck, Droplets, Sun, X, Loader2, LogIn } from "lucide-react";
import { db, auth } from "../firebase";
import { doc, setDoc, serverTimestamp, getDocFromServer } from "firebase/firestore";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";

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

interface RecommendationProps {
  answers: Record<string, string>;
  onReset: () => void;
}

export default function Recommendation({ answers, onReset }: RecommendationProps) {
  const [isDeploying, setIsDeploying] = useState(false);
  const [isDeployed, setIsDeployed] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [formData, setFormData] = useState({ name: "", whatsapp: "" });
  const [user, setUser] = useState(auth.currentUser);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((u) => {
      setUser(u);
      if (u && u.displayName && !formData.name) {
        setFormData(prev => ({ ...prev, name: u.displayName || "" }));
      }
    });
    return () => unsubscribe();
  }, [formData.name]);

  // Logic to determine Kit Name and details
  const getKitDetails = () => {
    const skinType = answers.skinType; // A: Oily, B: Dry, C: Fine
    const goal = answers.goal; // A: Breakouts, B: Texture, C: Fatigue

    if (skinType === "A" || goal === "A") {
      return {
        name: "THE HEAT-SHIELD KIT",
        description: "Engineered for maximum sebum control and sweat-resistance under the Lagos sun.",
        why: "Because you're always on the move, this setup clears the dust and keeps you matte so you don't look stressed.",
        price: "₦45,000",
        image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=1000&auto=format&fit=crop"
      };
    } else if (skinType === "B" || goal === "B") {
      return {
        name: "THE HYDRA-CORE SYSTEM",
        description: "A high-density moisture infusion designed to repair the skin barrier and eliminate texture friction.",
        why: "Lagos heat can be wicked. This setup locks in moisture without the weight, smoothing out texture for a polished finish.",
        price: "₦48,500",
        image: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?q=80&w=1000&auto=format&fit=crop"
      };
    } else {
      return {
        name: "THE NIGHT-RECOVERY SYSTEM",
        description: "A revitalizing formula built to erase the signs of a 24-hour lifestyle and reset the skin.",
        why: "Lagos never stops, but your skin needs a reset. This setup targets fatigue markers to ensure you wake up looking fully recovered.",
        price: "₦42,000",
        image: "https://images.unsplash.com/photo-1612817288484-6f916006741a?q=80&w=1000&auto=format&fit=crop"
      };
    }
  };

  const kit = getKitDetails();

  const handleDeploy = () => {
    setIsDeploying(true);
    setTimeout(() => {
      setIsDeploying(false);
      setShowModal(true);
    }, 800);
  };

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const currentUser = auth.currentUser;
    if (currentUser) {
      const path = `profiles/${currentUser.uid}`;
      try {
        const kit = getKitDetails();
        await setDoc(doc(db, "profiles", currentUser.uid), {
          uid: currentUser.uid,
          ...answers,
          assignedKit: kit.name,
          name: formData.name,
          whatsapp: formData.whatsapp,
          status: "deployed",
          timestamp: serverTimestamp()
        }, { merge: true });
        
        setIsSuccess(true);
        setIsDeployed(true);
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, path);
      }
    }
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-brand-bg text-brand-text p-6 md:p-12 lg:p-24">
      <div className="max-w-[1440px] mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <span className="text-brand-muted font-display text-sm md:text-base tracking-[0.4em] uppercase mb-4 block">
            HERE IS YOUR GEAR.
          </span>
          <h1 className="text-5xl md:text-7xl lg:text-8xl leading-none max-w-4xl">
            {kit.name}
          </h1>
        </motion.div>

        <div className="flex flex-col lg:flex-row gap-12 lg:gap-24 items-start">
          {/* Left: Image */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="w-full lg:w-1/2 relative group"
          >
            <div className="absolute -inset-1 bg-brand-accent/20 blur-2xl group-hover:bg-brand-accent/30 transition-all duration-500" />
            <div className="relative border-2 border-brand-accent overflow-hidden aspect-[4/5]">
              <img 
                src={kit.image} 
                alt={kit.name}
                className="w-full h-full object-cover grayscale contrast-125 hover:scale-105 transition-transform duration-700"
                referrerPolicy="no-referrer"
              />
            </div>
          </motion.div>

          {/* Right: Details */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="w-full lg:w-1/2 flex flex-col justify-center"
          >
            <div className="space-y-12">
              <div>
                <h3 className="text-xs font-bold tracking-[0.3em] text-brand-accent uppercase mb-6">System Components</h3>
                <ul className="space-y-6">
                  {[
                    { icon: ShieldCheck, label: "Activated Cleanser", desc: "Removes urban pollutants & excess sebum." },
                    { icon: Droplets, label: "Core Moisturizer", desc: "Weightless hydration with barrier repair." },
                    { icon: Sun, label: "SPF 50 Shield", desc: "Broad-spectrum protection, zero white cast." }
                  ].map((item, i) => (
                    <li key={i} className="flex gap-4 items-start">
                      <item.icon className="w-6 h-6 text-brand-accent shrink-0 mt-1" />
                      <div>
                        <div className="font-display text-lg uppercase leading-none mb-1">{item.label}</div>
                        <div className="text-brand-muted text-sm">{item.desc}</div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-8 border-2 border-brand-border bg-brand-border/20">
                <h3 className="text-xs font-bold tracking-[0.3em] text-brand-accent uppercase mb-4">WHY THIS WORKS:</h3>
                <p className="text-brand-text text-lg leading-relaxed italic">
                  "{kit.why}"
                </p>
              </div>

              <div className="flex items-baseline gap-4">
                <span className="text-brand-muted text-xs font-bold tracking-widest uppercase">Investment:</span>
                <span className="text-4xl md:text-5xl font-display">{kit.price}</span>
              </div>

              <div className="space-y-4">
                <button 
                  onClick={handleDeploy}
                  disabled={isDeploying || isDeployed}
                  className={`
                    relative w-full py-6 font-display text-2xl uppercase tracking-tighter overflow-hidden transition-all
                    ${isDeployed 
                      ? "bg-white text-brand-bg" 
                      : "bg-brand-accent text-brand-bg hover:brightness-110 active:scale-[0.98]"}
                  `}
                >
                  <span className="relative z-10 flex items-center justify-center gap-3">
                    {isDeploying ? "DEPLOYING..." : isDeployed ? "GEAR DEPLOYED" : "DEPLOY TO BASKET"}
                    {isDeployed && <Check className="w-8 h-8" />}
                  </span>
                  
                  {/* Loading Bar Overlay */}
                  {isDeploying && (
                    <motion.div 
                      initial={{ x: "-100%" }}
                      animate={{ x: "0%" }}
                      transition={{ duration: 0.8, ease: "easeInOut" }}
                      className="absolute inset-0 bg-white/20"
                    />
                  )}
                </button>

                <div className="flex flex-col items-center gap-4">
                  <a 
                    href="https://wa.me/2340000000000" 
                    target="_blank" 
                    rel="noreferrer"
                    className="flex items-center gap-2 text-brand-muted hover:text-brand-accent transition-colors text-xs font-bold tracking-widest uppercase"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Questions? Chat with a Skin Strategist
                  </a>
                  
                  <button 
                    onClick={onReset}
                    className="text-[10px] text-brand-border hover:text-brand-muted transition-colors uppercase tracking-[0.2em]"
                  >
                    [ RE-CALIBRATE SYSTEM ]
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Technical Background Decoration */}
      <div className="fixed bottom-12 right-12 font-mono text-[10px] text-brand-border/30 vertical-rl rotate-180 tracking-[0.5em] pointer-events-none uppercase">
        LM_UNIT_ASSIGNED // {kit.name.replace(/ /g, "_")} // SECURE_CHECKOUT
      </div>

      {/* Contact Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isSubmitting && setShowModal(false)}
              className="absolute inset-0 bg-brand-bg/90 backdrop-blur-xl"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-brand-bg border-2 border-brand-border p-8 md:p-12 shadow-[0_0_50px_rgba(0,0,0,0.5)]"
            >
              {!isSuccess ? (
                <>
                  <button 
                    onClick={() => setShowModal(false)}
                    className="absolute top-6 right-6 text-brand-muted hover:text-brand-text transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                  
                  <h2 className="text-3xl md:text-4xl mb-4 leading-none">WHERE SHOULD WE SHIP YOUR GEAR?</h2>
                  <p className="text-brand-muted mb-8 text-sm uppercase tracking-widest">Enter your details for deployment.</p>
                  
                  {!user ? (
                    <div className="py-8 text-center border border-brand-border bg-brand-border/10 mb-6">
                      <p className="text-brand-muted text-xs font-bold tracking-widest uppercase mb-6">Authentication Required</p>
                      <button 
                        onClick={handleGoogleLogin}
                        className="bg-white text-brand-bg px-8 py-4 font-display text-sm uppercase tracking-widest hover:bg-brand-accent transition-colors flex items-center gap-3 mx-auto"
                      >
                        <LogIn className="w-5 h-5" />
                        Sign in with Google
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div>
                        <label className="block text-[10px] font-bold tracking-[0.2em] text-brand-muted uppercase mb-2">Full Name</label>
                        <input 
                          required
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full bg-brand-border/30 border border-brand-border p-4 text-brand-text focus:border-brand-accent outline-none transition-colors"
                          placeholder="CHIDI OKORO"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold tracking-[0.2em] text-brand-muted uppercase mb-2">WhatsApp Number</label>
                        <input 
                          required
                          type="tel"
                          value={formData.whatsapp}
                          onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                          className="w-full bg-brand-border/30 border border-brand-border p-4 text-brand-text focus:border-brand-accent outline-none transition-colors"
                          placeholder="+234..."
                        />
                      </div>
                      
                      <button 
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-brand-accent text-brand-bg py-4 font-display text-xl uppercase tracking-tight hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-3"
                      >
                        {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin" /> : "CONFIRM DEPLOYMENT"}
                      </button>
                    </form>
                  )}
                </>
              ) : (
                <div className="text-center py-8">
                  <div className="w-20 h-20 bg-brand-accent rounded-full flex items-center justify-center mx-auto mb-8 shadow-[0_0_30px_rgba(204,255,0,0.4)]">
                    <Check className="w-10 h-10 text-brand-bg" />
                  </div>
                  <h2 className="text-4xl mb-6">ORDER ASSIGNED.</h2>
                  <p className="text-brand-muted leading-relaxed mb-12">
                    A strategist will contact you via WhatsApp to finalize delivery. Your gear is being prepped for the Lagos heat.
                  </p>
                  <button 
                    onClick={() => setShowModal(false)}
                    className="border-2 border-brand-border px-8 py-4 font-display text-sm uppercase tracking-widest hover:border-brand-accent transition-colors"
                  >
                    Close Terminal
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
