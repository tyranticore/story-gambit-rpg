import React from 'react';
import { GAME_VERSION, CHANGELOG_HISTORY } from '../version';
import { Scroll, Sparkles, X, CheckCircle, Tag, Clock } from 'lucide-react';
import { audioManager } from '../engine/audioManager';

export default function ChangelogModal({ onClose }) {
  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="fantasy-panel max-w-2xl w-full p-6 space-y-6 max-h-[90vh] overflow-y-auto relative border-amber-500/40">
        
        {/* Close Button */}
        <button
          onClick={() => { audioManager.playClick(); onClose(); }}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 border-b border-amber-500/20 pb-4">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold">
            <Scroll className="w-6 h-6 text-amber-400 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold font-serif text-amber-100">Release Notes & Version History</h2>
              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 font-mono text-xs font-bold">
                {GAME_VERSION}
              </span>
            </div>
            <p className="text-xs text-slate-400">Track incremental features, balance updates, and patch notes for Aethelgard CYOA Gambit RPG.</p>
          </div>
        </div>

        {/* Changelog Timeline Entries */}
        <div className="space-y-6">
          {CHANGELOG_HISTORY.map((entry, idx) => {
            const isLatest = idx === 0;

            return (
              <div
                key={entry.version}
                className={`p-4 rounded-xl border space-y-3 transition-all ${
                  isLatest
                    ? 'bg-slate-900/90 border-amber-500/40 shadow-xl'
                    : 'bg-slate-950/80 border-slate-800/80 opacity-90'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2">
                  <div className="flex items-center gap-2 font-mono">
                    <Tag className="w-4 h-4 text-amber-400" />
                    <span className="text-amber-300 font-bold text-sm">{entry.version}</span>
                    {isLatest && (
                      <span className="px-2 py-0.5 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[10px] font-bold rounded-full">
                        CURRENT RELEASE
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-slate-400 font-mono">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    <span>{entry.date}</span>
                  </div>
                </div>

                <h3 className="text-sm font-bold font-serif text-amber-100">{entry.title}</h3>

                <ul className="space-y-1.5 text-xs text-slate-300 font-sans">
                  {entry.highlights.map((item, itemIdx) => (
                    <li key={itemIdx} className="flex items-start gap-2 leading-relaxed">
                      <span className="text-amber-400 font-bold shrink-0 mt-0.5">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        {/* Footer Close Action */}
        <div className="pt-2 border-t border-slate-800 text-center">
          <button
            onClick={() => { audioManager.playClick(); onClose(); }}
            className="fantasy-button-gold text-xs px-6 py-2 rounded-xl font-bold shadow-md"
          >
            Close Patch Notes
          </button>
        </div>
      </div>
    </div>
  );
}
