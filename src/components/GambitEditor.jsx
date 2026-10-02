import React, { useState } from 'react';
import { GAMBIT_CONDITIONS, GAMBIT_TARGETS, GAMBIT_ACTIONS, DEFAULT_HERO_GAMBITS } from '../data/defaultGambits';
import { Zap, ArrowUp, ArrowDown, Plus, Trash2, Power, RotateCcw, Shield, Users } from 'lucide-react';
import { audioManager } from '../engine/audioManager';

export default function GambitEditor({ playerStats, followers, onUpdateCharGambits }) {
  const [selectedCharIdx, setSelectedCharIdx] = useState(0); // 0 = Leader, 1-3 = Followers

  const partyMembers = [
    { ...playerStats, isLeader: true, index: 0 },
    ...(followers || []).map((f, i) => ({ ...f, isLeader: false, index: i + 1 }))
  ];

  const currentChar = partyMembers[selectedCharIdx] || partyMembers[0];
  const charGambits = currentChar.gambits || DEFAULT_HERO_GAMBITS;

  const handleToggle = (index) => {
    audioManager.playClick();
    const updated = [...charGambits];
    updated[index].enabled = !updated[index].enabled;
    onUpdateCharGambits(selectedCharIdx, updated);
  };

  const handleMove = (index, direction) => {
    audioManager.playClick();
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= charGambits.length) return;
    const updated = [...charGambits];
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;
    onUpdateCharGambits(selectedCharIdx, updated);
  };

  const handleChange = (index, field, value) => {
    audioManager.playClick();
    const updated = [...charGambits];
    updated[index][field] = value;
    onUpdateCharGambits(selectedCharIdx, updated);
  };

  const handleAddSlot = () => {
    audioManager.playClick();
    const newGambit = {
      id: `g_${Date.now()}`,
      enabled: true,
      condition: 'ALWAYS',
      target: 'ENEMY_NEAREST',
      action: 'ATTACK'
    };
    const updated = [...charGambits, newGambit];
    onUpdateCharGambits(selectedCharIdx, updated);
  };

  const handleDeleteSlot = (index) => {
    audioManager.playClick();
    if (charGambits.length <= 1) return;
    const updated = charGambits.filter((_, idx) => idx !== index);
    onUpdateCharGambits(selectedCharIdx, updated);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Party Member Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-amber-500/20">
        {partyMembers.map((member, idx) => (
          <button
            key={idx}
            onClick={() => { audioManager.playClick(); setSelectedCharIdx(idx); }}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all whitespace-nowrap border ${
              selectedCharIdx === idx
                ? 'bg-amber-500/20 text-amber-300 border-amber-400 shadow-md'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
          >
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: member.color || '#d4af37' }}
            />
            <span>{member.name} {member.isLeader ? '(Leader)' : `(${member.classId || 'Follower'})`}</span>
          </button>
        ))}
      </div>

      {/* Header Info Panel */}
      <div className="fantasy-panel p-6 flex flex-wrap items-center justify-between gap-4 border-amber-500/30">
        <div>
          <div className="flex items-center gap-2 text-amber-400 font-semibold mb-1">
            <Zap className="w-5 h-5 animate-pulse" />
            <h2 className="text-xl font-bold font-serif text-amber-100">
              Tactical Gambits: {currentChar.name}
            </h2>
          </div>
          <p className="text-xs text-slate-300">
            Rules are evaluated sequentially from <span className="text-amber-400 font-bold">Priority #1</span> down during 2D party combat!
          </p>
        </div>

        <button
          onClick={handleAddSlot}
          className="fantasy-button-gold text-xs px-3 py-1.5 rounded-lg flex items-center gap-1 font-semibold"
        >
          <Plus className="w-4 h-4" />
          <span>Add Rule Slot</span>
        </button>
      </div>

      {/* Gambit Slot List */}
      <div className="space-y-3">
        {charGambits.map((gambit, idx) => {
          const selectedAction = GAMBIT_ACTIONS.find(a => a.id === gambit.action);

          return (
            <div
              key={gambit.id || idx}
              className={`fantasy-panel p-4 flex flex-wrap items-center justify-between gap-3 transition-all ${
                gambit.enabled ? 'border-amber-500/30 bg-slate-900/90' : 'border-slate-800 bg-slate-950/60 opacity-60'
              }`}
            >
              {/* Enable Toggle & Slot # */}
              <div className="flex items-center gap-3 shrink-0">
                <button
                  onClick={() => handleToggle(idx)}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs border transition-all ${
                    gambit.enabled
                      ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                      : 'bg-slate-800 border-slate-700 text-slate-500'
                  }`}
                  title={gambit.enabled ? 'Disable Slot' : 'Enable Slot'}
                >
                  <Power className="w-4 h-4" />
                </button>

                <span className="text-xs font-mono font-bold text-amber-400 bg-slate-950 px-2 py-1 rounded border border-slate-800">
                  #{idx + 1}
                </span>
              </div>

              {/* Rule Selectors Grid */}
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-3 min-w-[300px]">
                {/* Condition Selector */}
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">IF (Condition)</label>
                  <select
                    value={gambit.condition}
                    onChange={(e) => handleChange(idx, 'condition', e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-amber-200 focus:border-amber-400 focus:outline-none"
                  >
                    {GAMBIT_CONDITIONS.map(c => (
                      <option key={c.id} value={c.id}>{c.label}</option>
                    ))}
                  </select>
                </div>

                {/* Target Selector */}
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">TARGET</label>
                  <select
                    value={gambit.target}
                    onChange={(e) => handleChange(idx, 'target', e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-blue-200 focus:border-amber-400 focus:outline-none"
                  >
                    {GAMBIT_TARGETS.map(t => (
                      <option key={t.id} value={t.id}>{t.label}</option>
                    ))}
                  </select>
                </div>

                {/* Action Selector */}
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">ACTION</label>
                  <select
                    value={gambit.action}
                    onChange={(e) => handleChange(idx, 'action', e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-emerald-200 focus:border-amber-400 focus:outline-none"
                  >
                    {GAMBIT_ACTIONS.map(a => (
                      <option key={a.id} value={a.id}>
                        {a.label} {a.mpCost > 0 ? `(${a.mpCost} MP)` : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Priority Reordering & Delete Controls */}
              <div className="flex items-center gap-1 shrink-0">
                <button
                  disabled={idx === 0}
                  onClick={() => handleMove(idx, -1)}
                  className="p-1.5 bg-slate-900 border border-slate-800 hover:border-amber-400 rounded text-slate-400 hover:text-amber-300 disabled:opacity-30"
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                </button>
                <button
                  disabled={idx === charGambits.length - 1}
                  onClick={() => handleMove(idx, 1)}
                  className="p-1.5 bg-slate-900 border border-slate-800 hover:border-amber-400 rounded text-slate-400 hover:text-amber-300 disabled:opacity-30"
                >
                  <ArrowDown className="w-3.5 h-3.5" />
                </button>

                <button
                  disabled={charGambits.length <= 1}
                  onClick={() => handleDeleteSlot(idx)}
                  className="p-1.5 bg-slate-900 border border-slate-800 hover:border-red-500 rounded text-slate-400 hover:text-red-400 disabled:opacity-30"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
