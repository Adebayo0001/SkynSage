import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { auth } from "./firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, getDocFromServer } from "firebase/firestore";
import { db } from "./firebase";
import Quiz from "./components/Quiz";
import Recommendation from "./components/Recommendation";
import FounderPortal from "./components/FounderPortal";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.4, ease: "easeOut" }
};

export default function App() {
  const [view, setView] = useState<'home' | 'quiz' | 'results' | 'admin'>('home');
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({});
  const [user, setUser] = useState<User | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);

  useEffect(() => {
    // Test Firestore connection
    async function testConnection() {
      try {
        await getDocFromServer(doc(db, 'test', 'connection'));
      } catch (error) {
        if(error instanceof Error && error.message.includes('the client is offline')) {
          console.error("Please check your Firebase configuration. ");
        }
      }
    }
    testConnection();

    // Simple routing logic
    if (window.location.pathname === '/founder-portal') {
      setView('admin');
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setIsAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  const handleQuizComplete = (answers: Record<string, string>, kitName: string) => {
    setQuizAnswers(answers);
    setView('results');
  };

  if (!isAuthReady) {
    return (
      <div className="min-h-screen bg-brand-bg flex items-center justify-center">
        <div className="font-mono text-brand-accent animate-pulse uppercase tracking-[0.3em]">
          Initializing_System...
        </div>
      </div>
    );
  }

  if (view === 'admin') {
    return <FounderPortal />;
  }

  if (view === 'quiz') {
    return <Quiz onComplete={handleQuizComplete} onClose={() => setView('home')} />;
  }

  if (view === 'results') {
    return <Recommendation answers={quizAnswers} onReset={() => setView('quiz')} />;
  }

  return (
    <div className="min-h-screen bg-brand-bg text-brand-text selection:bg-brand-accent selection:text-brand-bg">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 w-full z-50 border-b border-brand-border bg-brand-bg/80 backdrop-blur-md">
        <div className="max-w-[1440px] mx-auto px-6 md:px-12 h-20 flex items-center justify-between">
          <div className="font-display text-xl tracking-tighter uppercase">
            Lagos Midnight
          </div>
          <div className="flex items-center gap-8 text-xs font-bold tracking-widest uppercase">
            <button onClick={() => setView('quiz')} className="hover:text-brand-accent transition-colors">The Quiz</button>
            <a href="#" className="hover:text-brand-accent transition-colors">Login</a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-20 min-h-[90vh] relative flex flex-col md:flex-row border-b border-brand-border overflow-hidden">
        <div className="w-full md:w-[70%] p-6 md:p-12 lg:p-24 flex flex-col justify-center z-10 relative">
          <motion.h1 
            {...fadeInUp}
            className="text-[60px] md:text-[130px] leading-[0.8] mb-8 font-display uppercase tracking-tighter"
          >
            SKINCARE<br />IS<br />PERFORMANCE<br />GEAR.
          </motion.h1>
          <motion.p 
            {...fadeInUp}
            transition={{ ...fadeInUp.transition, delay: 0.1 }}
            className="text-brand-muted text-lg md:text-xl max-w-md mb-12 font-medium"
          >
            Built for the Lagos heat. Engineered for your ambition.
          </motion.p>
          <motion.div
            {...fadeInUp}
            transition={{ ...fadeInUp.transition, delay: 0.2 }}
          >
            <button 
              onClick={() => setView('quiz')}
              className="bg-brand-accent text-brand-bg px-8 py-4 font-display text-lg uppercase tracking-tight hover:brightness-110 transition-all active:scale-95 flex items-center gap-3 group"
            >
              GET YOUR GEAR
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>
        </div>
        <div className="w-full md:w-[50%] h-[50vh] md:h-auto md:absolute md:right-0 md:top-20 md:bottom-0 bg-[#0F0F0F] overflow-hidden">
          <img 
            src="https://images.unsplash.com/photo-1556228578-0d85b1a4d571?q=80&w=1000&auto=format&fit=crop" 
            alt="Product shot"
            className="w-full h-full object-cover grayscale contrast-125 opacity-80"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-brand-bg via-transparent to-transparent md:bg-gradient-to-r" />
        </div>
      </section>

      {/* The Philosophy */}
      <section className="py-32 md:py-[120px] px-6 border-b border-brand-border">
        <div className="max-w-[700px] mx-auto text-center md:text-left">
          <motion.div {...fadeInUp}>
            <span className="text-brand-accent text-xs font-bold tracking-[0.3em] uppercase mb-4 block">Philosophy</span>
            <h2 className="text-4xl md:text-6xl mb-8">Zero Friction.</h2>
            <p className="text-brand-muted text-xl md:text-2xl leading-relaxed">
              Most men quit skincare because it's confusing. We simplified it into a 30-second assessment and a one-tap restock. No fluff, just results.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Section 3: THE DEEP PURGE (THE WASH) */}
      <section className="min-h-[90vh] flex flex-col md:flex-row bg-[#0D0D0D] border-b border-brand-border">
        <div className="w-full md:w-1/2 border-b md:border-b-0 md:border-r border-brand-border overflow-hidden relative">
          <motion.img 
            initial={{ scale: 1.1, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 0.8 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            src="https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=1000&auto=format&fit=crop" 
            alt="Man using The Deep Purge cleanser"
            className="w-full h-full object-cover grayscale contrast-125"
            referrerPolicy="no-referrer"
          />
          {/* Subtle Electric Volt lighting effect overlay */}
          <div className="absolute inset-0 bg-brand-accent/5 pointer-events-none" />
        </div>
        <div className="w-full md:w-1/2 p-8 md:p-24 flex flex-col justify-center">
          <motion.div {...fadeInUp}>
            <h2 className="text-5xl md:text-[72px] leading-[0.9] mb-8 font-display uppercase">START SHARP.</h2>
            <div className="space-y-6 mb-12">
              <p className="text-brand-accent text-xs font-bold tracking-[0.3em] uppercase">STEP 01 PURGE</p>
              <p className="text-brand-muted text-xl md:text-2xl max-w-md leading-relaxed uppercase">
                WASH AWAY THE CITY GRIME. CLEANSE, REFRESH, AND RESET YOUR SKIN.
              </p>
            </div>
            <button 
              onClick={() => setView('quiz')}
              className="text-[#888888] text-xs font-bold tracking-[0.3em] uppercase hover:text-brand-accent transition-colors flex items-center gap-2 group"
            >
              GET YOUR GEAR
              <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>
        </div>
      </section>

      {/* Section 4: THE HYDRA-SHIELD (THE OFFICE) */}
      <section className="min-h-[90vh] flex flex-col md:flex-row bg-brand-bg border-b border-brand-border">
        <div className="w-full md:w-1/2 p-8 md:p-24 flex flex-col justify-center order-2 md:order-1">
          <motion.div {...fadeInUp}>
            <h2 className="text-5xl md:text-[72px] leading-[0.9] mb-8 font-display uppercase">GET READY TO DOMINATE.</h2>
            <div className="space-y-6 mb-12">
              <p className="text-brand-accent text-xs font-bold tracking-[0.3em] uppercase">STEP 02 SHIELD</p>
              <p className="text-brand-muted text-xl md:text-2xl max-w-md leading-relaxed uppercase">
                LOCK IN MOISTURE. PROTECT YOUR FACE FROM THE DAILY HUSTLE.
              </p>
            </div>
            <button 
              onClick={() => setView('quiz')}
              className="text-[#888888] text-xs font-bold tracking-[0.3em] uppercase hover:text-brand-accent transition-colors flex items-center gap-2 group"
            >
              GET YOUR GEAR
              <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>
        </div>
        <div className="w-full md:w-1/2 border-b md:border-b-0 md:border-l border-brand-border overflow-hidden order-1 md:order-2">
          <motion.img 
            initial={{ scale: 1.1, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 0.8 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            src="https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=1000&auto=format&fit=crop" 
            alt="Man using The Hydra-Shield moisturizer"
            className="w-full h-full object-cover grayscale contrast-125"
            referrerPolicy="no-referrer"
          />
        </div>
      </section>

      {/* Product Preview */}
      <section className="flex flex-col md:flex-row border-b border-brand-border">
        <div className="w-full md:w-[40%] aspect-square md:aspect-auto border-b md:border-b-0 md:border-r border-brand-border overflow-hidden">
          <motion.img 
            initial={{ scale: 1.1, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 0.7 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            src="https://images.unsplash.com/photo-1611080626919-7cf5a9caab53?q=80&w=1000&auto=format&fit=crop" 
            alt="Black skincare bottle"
            className="w-full h-full object-cover grayscale contrast-150"
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="w-full md:w-[60%] p-8 md:p-24 flex flex-col justify-center">
          <motion.div {...fadeInUp}>
            <h2 className="text-4xl md:text-7xl mb-8">The Foundation Kit.</h2>
            <p className="text-brand-muted text-xl md:text-2xl mb-12 max-w-xl">
              Cleanser. Moisturizer. SPF 50. The only three tools you need to dominate the day.
            </p>
            <div className="flex flex-wrap gap-4">
              {['CLEANSE', 'HYDRATE', 'PROTECT'].map((tool) => (
                <div key={tool} className="border border-brand-border px-4 py-2 text-[10px] font-bold tracking-widest text-brand-muted">
                  {tool}
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Trust Moment */}
      <section className="py-48 md:py-[240px] px-6 bg-brand-accent text-brand-bg overflow-hidden relative">
        <div className="max-w-[1200px] mx-auto relative z-10">
          <motion.blockquote 
            initial={{ x: -100, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="text-4xl md:text-8xl font-display uppercase leading-[0.85] tracking-tighter"
          >
            "Lagos doesn't sleep. Your skin shouldn't look like it."
          </motion.blockquote>
          <motion.div 
            {...fadeInUp}
            className="mt-12 flex items-center gap-4"
          >
            <div className="h-[2px] w-12 bg-brand-bg" />
            <cite className="font-display text-xl uppercase not-italic">Founder</cite>
          </motion.div>
        </div>
        {/* Decorative background text */}
        <div className="absolute top-1/2 left-0 -translate-y-1/2 text-[20vw] font-display uppercase opacity-5 whitespace-nowrap pointer-events-none select-none">
          PERFORMANCE GEAR PERFORMANCE GEAR
        </div>
      </section>

      {/* Section 4: The Ingredients (The "Specs") */}
      <section className="min-h-[90vh] flex flex-col md:flex-row border-b border-brand-border">
        <div className="w-full md:w-1/2 border-b md:border-b-0 md:border-r border-brand-border overflow-hidden">
          <motion.img 
            initial={{ scale: 1.2, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 0.8 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            src="https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=1000&auto=format&fit=crop" 
            alt="Industrial texture"
            className="w-full h-full object-cover grayscale contrast-150"
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="w-full md:w-1/2 p-8 md:p-24 flex flex-col justify-center bg-brand-bg">
          <motion.div {...fadeInUp}>
            <h2 className="text-5xl md:text-8xl leading-[0.9] mb-16">ENGINEERED<br />FOR THE HEAT.</h2>
            <div className="space-y-12 mb-16">
              {[
                { title: "CARBON", desc: "Pulls the Lagos dust out of your pores." },
                { title: "MATTE-LOCK", desc: "Kills the midday shine instantly." },
                { title: "SPF 50+", desc: "Invisible shield against the 4pm sun." }
              ].map((item) => (
                <div key={item.title}>
                  <h3 className="text-brand-accent text-xl font-display mb-2">{item.title}</h3>
                  <p className="text-brand-muted text-lg max-w-sm">{item.desc}</p>
                </div>
              ))}
            </div>
            <button 
              onClick={() => setView('quiz')}
              className="text-[#888888] text-xs font-bold tracking-[0.3em] uppercase hover:text-brand-accent transition-colors flex items-center gap-2 group"
            >
              GET THE GEAR
              <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>
        </div>
      </section>

      {/* Section 5: The "Lagos Proof" Statement */}
      <section className="min-h-[90vh] bg-[#0D0D0D] flex items-center justify-center px-6 overflow-hidden relative">
        <motion.div 
          initial={{ y: 100, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-[1200px] text-center"
        >
          <h2 className="text-5xl md:text-[100px] leading-[0.9] tracking-tighter">
            TESTED ON THE<br />THIRD MAINLAND.<br />REFINED IN LEKKI.<br />BUILT FOR THE HUSTLE.
          </h2>
        </motion.div>
        {/* Subtle parallax background element */}
        <motion.div 
          animate={{ 
            y: [0, -20, 0],
          }}
          transition={{ 
            duration: 10, 
            repeat: Infinity, 
            ease: "linear" 
          }}
          className="absolute inset-0 pointer-events-none opacity-[0.03] font-display text-[30vw] flex items-center justify-center whitespace-nowrap"
        >
          LAGOS PROOF
        </motion.div>
      </section>

      {/* Section 6: The Routine (The 1-2-3) */}
      <section className="min-h-[90vh] p-8 md:p-24 bg-brand-bg border-b border-brand-border">
        <motion.div {...fadeInUp} className="mb-24">
          <h2 className="text-5xl md:text-[64px] leading-[0.9]">THREE STEPS.<br />ZERO STRESS.</h2>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-24">
          {[
            { num: "01", title: "PURGE", desc: "Wash away the city grime." },
            { num: "02", title: "SHIELD", desc: "Lock in the moisture." },
            { num: "03", title: "BLOCK", desc: "Stop the sun from aging you." }
          ].map((item, i) => (
            <motion.div 
              key={item.num}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.2, duration: 0.6 }}
            >
              <div className="text-brand-accent text-7xl md:text-9xl font-display leading-none mb-8">{item.num}</div>
              <h3 className="text-2xl font-display mb-4">{item.title}</h3>
              <p className="text-brand-muted text-lg leading-relaxed max-w-xs mb-8">{item.desc}</p>
              <button 
                onClick={() => setView('quiz')}
                className="text-[#888888] text-xs font-bold tracking-[0.3em] uppercase hover:text-brand-accent transition-colors flex items-center gap-2 group"
              >
                GET THE GEAR
                <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </button>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 px-6 md:px-12 border-t border-brand-border">
        <div className="max-w-[1440px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-24">
            <div className="md:col-span-2">
              <div className="font-display text-3xl mb-6">LAGOS MIDNIGHT</div>
              <p className="text-brand-muted max-w-xs">High-performance skincare for the modern man.</p>
            </div>
            <div>
              <h4 className="text-xs font-bold tracking-widest mb-6 text-brand-muted">GEAR</h4>
              <ul className="space-y-4 text-sm font-medium">
                <li><a href="#" className="hover:text-brand-accent transition-colors">Foundation Kit</a></li>
                <li><a href="#" className="hover:text-brand-accent transition-colors">The Quiz</a></li>
                <li><a href="#" className="hover:text-brand-accent transition-colors">Restock</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-bold tracking-widest mb-6 text-brand-muted">SOCIAL</h4>
              <ul className="space-y-4 text-sm font-medium">
                <li><a href="#" className="hover:text-brand-accent transition-colors">Instagram</a></li>
                <li><a href="#" className="hover:text-brand-accent transition-colors">Twitter</a></li>
              </ul>
            </div>
          </div>
          <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-brand-border gap-4">
            <div className="text-[10px] font-bold tracking-widest text-brand-muted uppercase">
              © 2026 LAGOS MIDNIGHT. ALL RIGHTS RESERVED.
            </div>
            <div className="text-[10px] font-bold tracking-widest text-brand-accent uppercase">
              Designed in Lagos
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
