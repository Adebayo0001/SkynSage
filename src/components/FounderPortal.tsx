import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { db, auth } from "../firebase";
import { collection, query, orderBy, onSnapshot, doc, updateDoc, getDocFromServer } from "firebase/firestore";
import { MessageCircle, Loader2, ShieldCheck, ExternalLink, LogIn } from "lucide-react";
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

interface Profile {
  id: string;
  name?: string;
  whatsapp?: string;
  assignedKit: string;
  status: string;
  timestamp: any;
  skinType: string;
  environment: string;
  goal: string;
}

export default function FounderPortal() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(auth.currentUser);

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged((u) => {
      setUser(u);
    });
    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!user || user.email !== "ogunlekeoluwafunmi@gmail.com") {
      setLoading(false);
      return;
    }

    const q = query(collection(db, "profiles"), orderBy("timestamp", "desc"));
    const path = 'profiles';
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Profile[];
      setProfiles(data);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  const sanitizePhone = (phone: string) => {
    return phone.replace(/\D/g, "");
  };

  const openWhatsApp = (profile: Profile) => {
    const cleanPhone = sanitizePhone(profile.whatsapp || "");
    const message = `Hi ${profile.name || "there"}, this is your Skin Strategist from LAGOS MIDNIGHT. I see you were assigned the ${profile.assignedKit}. Ready to deploy your gear to Lagos?`;
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${cleanPhone}?text=${encodedMessage}`, "_blank");
  };

  const updateStatus = async (id: string, newStatus: string) => {
    const path = `profiles/${id}`;
    try {
      await updateDoc(doc(db, "profiles", id), { status: newStatus });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-bg flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-brand-accent animate-spin" />
      </div>
    );
  }

  if (!user || user.email !== "ogunlekeoluwafunmi@gmail.com") {
    return (
      <div className="min-h-screen bg-brand-bg flex flex-col items-center justify-center p-6">
        <ShieldCheck className="w-16 h-16 text-brand-muted mb-6" />
        <h1 className="text-3xl font-display uppercase mb-4">Access Restricted</h1>
        <p className="text-brand-muted mb-8 text-center max-w-md">
          This portal is reserved for LAGOS MIDNIGHT founders. Please authenticate with your authorized credentials.
        </p>
        <button 
          onClick={handleGoogleLogin}
          className="bg-brand-accent text-brand-bg px-8 py-4 font-display text-sm uppercase tracking-widest hover:brightness-110 transition-all flex items-center gap-3"
        >
          <LogIn className="w-5 h-5" />
          Founder Authentication
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-bg text-brand-text p-6 md:p-12">
      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <span className="text-brand-accent font-mono text-xs tracking-[0.3em] uppercase mb-2 block">
              Secure_Access_Granted // Founder_Portal
            </span>
            <h1 className="text-4xl md:text-6xl font-display uppercase leading-none">
              Mission Control
            </h1>
          </div>
          <div className="flex gap-4">
            <div className="px-4 py-2 border border-brand-border bg-brand-border/20">
              <span className="text-[0.625rem] text-brand-muted uppercase block mb-1">Total Leads</span>
              <span className="text-xl font-display">{profiles.length}</span>
            </div>
            <div className="px-4 py-2 border border-brand-border bg-brand-border/20">
              <span className="text-[0.625rem] text-brand-muted uppercase block mb-1">Deployed</span>
              <span className="text-xl font-display">{profiles.filter(p => p.status === 'deployed').length}</span>
            </div>
          </div>
        </header>

        <div className="w-full overflow-x-auto border border-brand-border bg-brand-border/5 mb-12">
          <div className="min-w-[75rem]">
            <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-brand-border bg-brand-border/10">
                <th className="p-6 font-display text-sm uppercase tracking-widest text-brand-muted">Name</th>
                <th className="p-6 font-display text-sm uppercase tracking-widest text-brand-muted">WhatsApp</th>
                <th className="p-6 font-display text-sm uppercase tracking-widest text-brand-muted">Assigned Kit</th>
                <th className="p-6 font-display text-sm uppercase tracking-widest text-brand-muted">Date</th>
                <th className="p-6 font-display text-sm uppercase tracking-widest text-brand-muted">Status</th>
                <th className="p-6 font-display text-sm uppercase tracking-widest text-brand-muted text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border">
              {profiles.map((profile) => (
                <motion.tr 
                  key={profile.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="hover:bg-brand-border/10 transition-colors group"
                >
                  <td className="p-6 font-medium">
                    {profile.name || <span className="text-brand-muted italic">Anonymous</span>}
                  </td>
                  <td className="p-6 font-mono text-sm">
                    {profile.whatsapp || "—"}
                  </td>
                  <td className="p-6">
                    <span className="text-xs font-bold tracking-tighter px-2 py-1 border border-brand-accent/30 text-brand-accent bg-brand-accent/5">
                      {profile.assignedKit}
                    </span>
                  </td>
                  <td className="p-6 text-brand-muted text-sm">
                    {profile.timestamp?.toDate().toLocaleDateString() || "—"}
                  </td>
                  <td className="p-6">
                    <select 
                      value={profile.status}
                      onChange={(e) => updateStatus(profile.id, e.target.value)}
                      className="bg-transparent border-none text-xs font-bold uppercase tracking-widest focus:ring-0 cursor-pointer hover:text-brand-accent transition-colors"
                    >
                      <option value="quiz_complete" className="bg-brand-bg">New</option>
                      <option value="deployed" className="bg-brand-bg">Deployed</option>
                      <option value="contacted" className="bg-brand-bg">Contacted</option>
                      <option value="shipped" className="bg-brand-bg">Shipped</option>
                    </select>
                  </td>
                  <td className="p-6 text-right">
                    {profile.whatsapp && (
                      <button 
                        onClick={() => openWhatsApp(profile)}
                        className="inline-flex items-center gap-2 bg-brand-accent text-brand-bg px-4 py-2 font-display text-[0.625rem] uppercase tracking-widest hover:brightness-110 transition-all shadow-[0_0_15px_rgba(204,255,0,0.2)] group-hover:shadow-[0_0_25px_rgba(204,255,0,0.4)]"
                      >
                        <MessageCircle className="w-3 h-3" />
                        Message on WhatsApp
                      </button>
                    )}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
);
}
