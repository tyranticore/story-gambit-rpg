import React, { useState, useEffect } from 'react';
import { saveGoogleCloudProfile, loadGoogleCloudProfile, downloadSaveJson } from '../engine/saveManager';
import { signInWithGoogle, logOutFirebase, onAuthChange } from '../engine/firebaseConfig';
import { Save, Download, Upload, Check, X, UserCheck, LogOut, ShieldCheck, Flame, Lock } from 'lucide-react';
import { audioManager } from '../engine/audioManager';

export default function SaveSyncModal({ gameState, onLoadSaveState, onClose, onResetCampaign }) {
  const [user, setUser] = useState(null);
  const [authChecking, setAuthChecking] = useState(true);
  const [statusMsg, setStatusMsg] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthChange((currentUser) => {
      setUser(currentUser);
      setAuthChecking(false);
    });
    return () => unsubscribe();
  }, []);

  const handleSignIn = async () => {
    audioManager.playClick();
    setLoading(true);
    setStatusMsg('Signing in with Google...');
    try {
      const signedInUser = await signInWithGoogle();
      setUser(signedInUser);
      setStatusMsg(`✅ Signed in as ${signedInUser.displayName || signedInUser.email}`);
    } catch (err) {
      setStatusMsg(`❌ Sign-in failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    audioManager.playClick();
    setLoading(true);
    try {
      await logOutFirebase();
      setUser(null);
      setStatusMsg('Signed out successfully.');
    } catch (err) {
      setStatusMsg(`❌ Sign-out notice: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveToCloud = async () => {
    audioManager.playClick();
    if (!user) {
      setStatusMsg('❌ Please sign in with your Google account first.');
      return;
    }
    setLoading(true);
    setStatusMsg('Saving game data to your Google Cloud account...');

    try {
      const savedAt = await saveGoogleCloudProfile(user, gameState);
      const timeStr = new Date(savedAt).toLocaleTimeString();
      setStatusMsg(`✅ Saved successfully to Google Cloud Firestore at ${timeStr}!`);
    } catch (err) {
      setStatusMsg(`❌ Save failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadFromCloud = async () => {
    audioManager.playClick();
    if (!user) {
      setStatusMsg('❌ Please sign in with your Google account first.');
      return;
    }
    setLoading(true);
    setStatusMsg('Fetching your cloud save data from Google Firestore...');

    try {
      const loaded = await loadGoogleCloudProfile(user);
      onLoadSaveState(loaded);
      setStatusMsg('✅ Cloud save loaded successfully!');
      setTimeout(() => onClose(), 1200);
    } catch (err) {
      setStatusMsg(`❌ Load failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="fantasy-panel max-w-2xl w-full p-6 space-y-6 max-h-[90vh] overflow-y-auto relative border-amber-500/40">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 border-b border-amber-500/20 pb-4">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold">
            <ShieldCheck className="w-6 h-6 text-amber-400 animate-pulse" />
          </div>
          <div>
            <h2 className="text-xl font-bold font-serif text-amber-100">Secure Google Account Cloud Save</h2>
            <p className="text-xs text-slate-400">Authenticated 1-Click Game Saves with Firebase & Google OAuth 2.0</p>
          </div>
        </div>

        {/* Privacy & Security Guarantee Banner */}
        <div className="bg-slate-900/90 border border-emerald-500/30 p-3 rounded-xl flex items-start gap-2.5 text-xs">
          <Lock className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="text-emerald-300 font-bold block">Developer Privacy & Security Policy:</span>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              Google handles your sign-in securely. Your password is never shared or visible to the developer. Only relevant game save data (hero stats, progress, items) is linked to your unique account ID.
            </p>
          </div>
        </div>

        {/* GOOGLE AUTHENTICATION STATUS & ACTIONS */}
        {authChecking ? (
          <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-xl text-center text-xs text-amber-300">
            Checking Google Account authentication status...
          </div>
        ) : !user ? (
          /* NOT SIGNED IN STATE */
          <div className="bg-slate-900/90 border border-amber-500/30 p-6 rounded-xl text-center space-y-4">
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-amber-100">Sign in with Google to Save & Resume Progress</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Connect your Google profile to securely sync your game save across all mobile phones, tablets, and desktop computers.
              </p>
            </div>

            <button
              disabled={loading}
              onClick={handleSignIn}
              className="px-6 py-3 bg-white hover:bg-slate-100 text-slate-900 rounded-xl font-bold text-xs shadow-lg inline-flex items-center gap-2.5 transition-all hover:scale-105"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              <span>Sign in with Google</span>
            </button>
          </div>
        ) : (
          /* SIGNED IN STATE */
          <div className="bg-slate-900/90 border border-amber-500/30 p-5 rounded-xl space-y-5">
            {/* User Profile Info Card */}
            <div className="flex items-center justify-between bg-slate-950 p-3.5 rounded-xl border border-slate-800">
              <div className="flex items-center gap-3">
                {user.photoURL ? (
                  <img src={user.photoURL} alt={user.displayName} className="w-10 h-10 rounded-full border border-amber-400/40 shadow-md" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300 font-bold">
                    <UserCheck className="w-5 h-5" />
                  </div>
                )}
                <div>
                  <h4 className="text-xs font-bold text-amber-100">{user.displayName || 'Google User'}</h4>
                  <p className="text-[11px] text-slate-400">{user.email}</p>
                </div>
              </div>

              <button
                disabled={loading}
                onClick={handleSignOut}
                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                title="Sign out of Google Account"
              >
                <LogOut className="w-3.5 h-3.5 text-red-400" />
                <span>Sign Out</span>
              </button>
            </div>

            {/* Cloud Save / Load Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                disabled={loading}
                onClick={handleSaveToCloud}
                className="fantasy-button-gold py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-all hover:scale-105"
              >
                <Save className="w-4 h-4" />
                <span>Save Game to Cloud</span>
              </button>

              <button
                disabled={loading}
                onClick={handleLoadFromCloud}
                className="fantasy-button py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-all hover:scale-105"
              >
                <Upload className="w-4 h-4" />
                <span>Load Game from Cloud</span>
              </button>
            </div>
          </div>
        )}

        {statusMsg && (
          <p className="text-xs text-center font-mono font-semibold text-amber-400 bg-slate-950/80 p-2.5 rounded-lg border border-amber-500/20">
            {statusMsg}
          </p>
        )}

        {/* Offline Backup File & New Campaign Actions */}
        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-xs font-bold text-slate-300">Offline JSON Backup & Restart</h3>
            <p className="text-[11px] text-slate-400">Download save file or begin fresh campaign</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => downloadSaveJson(gameState)}
              className="fantasy-button text-xs px-3 py-1.5 flex items-center gap-1"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download JSON</span>
            </button>

            {onResetCampaign && (
              <button
                onClick={() => { onClose(); onResetCampaign(); }}
                className="fantasy-button-crimson text-xs px-3 py-1.5 rounded-lg flex items-center gap-1 font-semibold"
              >
                <X className="w-3.5 h-3.5" />
                <span>New Campaign</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
