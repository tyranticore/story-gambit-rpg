import React, { useState, useEffect } from 'react';
import { saveCloudProfile, loadCloudProfile, getRecentProfiles, generateQrSaveUrl, exportSaveCode, importSaveCode, downloadSaveJson } from '../engine/saveManager';
import { Save, Download, Upload, Copy, Check, Cloud, KeyRound, X, HardDrive, UserCheck, Sparkles, RefreshCw, Link as LinkIcon, Flame } from 'lucide-react';
import { audioManager } from '../engine/audioManager';

export default function SaveSyncModal({ gameState, onLoadSaveState, onClose, onResetCampaign }) {
  const [profileName, setProfileName] = useState(gameState.profileName || 'cycos');
  const [recentProfiles, setRecentProfiles] = useState([]);
  const [statusMsg, setStatusMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  const shareUrl = generateQrSaveUrl(gameState);

  useEffect(() => {
    setRecentProfiles(getRecentProfiles());
  }, []);

  const handleSaveProfile = async () => {
    audioManager.playClick();
    if (!profileName.trim()) {
      setStatusMsg('❌ Please enter a profile name.');
      return;
    }
    setLoading(true);
    setStatusMsg(`Saving progress to cloud profile "${profileName.trim()}"...`);

    try {
      const savedName = await saveCloudProfile(profileName, gameState);
      setRecentProfiles(getRecentProfiles());
      setStatusMsg(`✅ Profile "${savedName}" saved! On your phone, type "${savedName}" and click Load Profile.`);
    } catch (err) {
      setStatusMsg(`❌ Cloud sync notice: Saved to Profile Cache "${profileName}". Use Share Link for instant transfer!`);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadProfile = async (targetName) => {
    const nameToLoad = targetName || profileName;
    audioManager.playClick();
    if (!nameToLoad.trim()) {
      setStatusMsg('❌ Please enter a profile name.');
      return;
    }
    setLoading(true);
    setStatusMsg(`Fetching save data for profile "${nameToLoad.trim()}"...`);

    try {
      const loaded = await loadCloudProfile(nameToLoad);
      onLoadSaveState(loaded);
      setStatusMsg(`✅ Profile "${nameToLoad}" loaded successfully!`);
      setTimeout(() => onClose(), 1000);
    } catch (err) {
      setStatusMsg(`❌ Load notice: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyShareUrl = () => {
    audioManager.playClick();
    navigator.clipboard.writeText(shareUrl);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2500);
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
          <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400 font-bold">
            <Flame className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h2 className="text-xl font-bold font-serif text-amber-100">Firebase Cloud Firestore Save & Sync</h2>
            <p className="text-xs text-slate-400">Save on PC using a profile name, then type your profile name on your phone anywhere in public to resume!</p>
          </div>
        </div>

        {/* Firebase Storage Indicator */}
        <div className="bg-slate-900/90 border border-orange-500/30 p-3 rounded-xl flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-orange-400" />
            <span className="text-slate-200 font-semibold">Firebase Cloud Database:</span>
            <span className="text-emerald-400 font-mono font-bold">Connected (Free Tier)</span>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">Collection: user_saves</span>
        </div>

        {/* PROFILE NAME CLOUD SAVE / LOAD PANEL */}
        <div className="bg-slate-900/90 border border-amber-500/30 p-5 rounded-xl space-y-4">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
            <UserCheck className="w-4 h-4" />
            <span>Profile Sync Across All Devices & Networks</span>
          </div>

          <p className="text-xs text-slate-300">
            Enter a memorable profile name (e.g. <span className="text-amber-300 font-bold">cycos</span>). Click <span className="text-amber-300 font-bold">Save to Cloud</span> on your PC. Later on your phone anywhere in public on cellular/5G, type <span className="text-amber-300 font-bold">cycos</span>, and tap <span className="text-amber-300 font-bold">Load Profile</span>!
          </p>

          {/* Input Box */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
            <label className="block text-[11px] uppercase font-bold text-slate-400">Cloud Profile Name</label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. cycos"
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm font-semibold text-amber-200 focus:border-amber-400 focus:outline-none"
              />
              <button
                disabled={loading}
                onClick={handleSaveProfile}
                className="fantasy-button-gold text-xs px-4 py-2 rounded-lg font-bold flex items-center gap-1 shrink-0 shadow-md"
              >
                <Save className="w-4 h-4" />
                <span>Save to Cloud</span>
              </button>
              <button
                disabled={loading}
                onClick={() => handleLoadProfile()}
                className="fantasy-button text-xs px-4 py-2 rounded-lg font-bold flex items-center gap-1 shrink-0"
              >
                <Upload className="w-4 h-4" />
                <span>Load Profile</span>
              </button>
            </div>
          </div>

          {/* Quick-Click Recent Profiles */}
          {recentProfiles.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-[11px] text-slate-400 block font-semibold">Quick-Load Recent Profiles:</span>
              <div className="flex flex-wrap gap-2">
                {recentProfiles.map((p, idx) => (
                  <button
                    key={idx}
                    onClick={() => { setProfileName(p); handleLoadProfile(p); }}
                    className="px-3 py-1 bg-slate-950 border border-amber-500/30 hover:border-amber-400 text-amber-300 rounded-lg text-xs font-mono font-semibold transition-all"
                  >
                    👤 {p}
                  </button>
                ))}
              </div>
            </div>
          )}

          {statusMsg && <p className="text-xs text-center font-mono font-semibold text-amber-400 pt-1">{statusMsg}</p>}
        </div>

        {/* INSTANT 1-CLICK SHARE LINK */}
        <div className="bg-slate-900/90 border border-amber-500/20 p-4 rounded-xl space-y-2">
          <label className="block text-xs font-bold text-slate-300 flex items-center gap-1.5">
            <LinkIcon className="w-4 h-4 text-amber-400" />
            <span>1-Click Save Transfer URL (Open on Phone to Load Instantly)</span>
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              readOnly
              value={shareUrl}
              className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs font-mono text-amber-300 select-all focus:outline-none"
            />
            <button
              onClick={handleCopyShareUrl}
              className="fantasy-button-gold text-xs px-3 py-1.5 rounded-lg flex items-center gap-1 font-semibold shrink-0"
            >
              {linkCopied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
              <span>{linkCopied ? 'Link Copied!' : 'Copy Link'}</span>
            </button>
          </div>
        </div>

        {/* Offline JSON Download & New Game Actions */}
        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-xs font-bold text-slate-300">File Backup & Restart</h3>
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
                <RefreshCw className="w-3.5 h-3.5" />
                <span>New Campaign</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
