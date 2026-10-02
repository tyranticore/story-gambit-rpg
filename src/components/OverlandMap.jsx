import React, { useRef, useState } from 'react';
import { MAP_NODES } from '../data/mapNodes';
import { Shield, Trees, Compass, Landmark, Castle, Flame, Navigation, Skull, ChevronRight, Lock, CheckCircle2, Move, Sparkles, Heart } from 'lucide-react';
import { audioManager } from '../engine/audioManager';

const ICON_MAP = {
  Shield,
  Trees,
  Compass,
  Landmark,
  Castle,
  Flame,
  Sparkles
};

export default function OverlandMap({ gameState, onSelectMapNode }) {
  const [selectedNodeId, setSelectedNodeId] = useState(gameState.currentMapNodeId);
  const containerRef = useRef(null);

  // Drag panning state
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const selectedNode = MAP_NODES.find(n => n.id === selectedNodeId) || MAP_NODES[0];
  const isCurrentLocation = selectedNode.id === gameState.currentMapNodeId;
  const isUnlocked = gameState.unlockedMapNodes.includes(selectedNode.id);

  const handleNodeClick = (node) => {
    audioManager.playClick();
    setSelectedNodeId(node.id);
  };

  const handleTravelToNode = () => {
    if (!isUnlocked) return;
    audioManager.playClick();
    onSelectMapNode(selectedNode);
  };

  // Mouse Drag handlers
  const handleMouseDown = (e) => {
    setIsDragging(true);
    setStartX(e.pageX - containerRef.current.offsetLeft);
    setScrollLeft(containerRef.current.scrollLeft);
  };

  const handleMouseLeaveOrUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - containerRef.current.offsetLeft;
    const walk = (x - startX) * 1.8;
    containerRef.current.scrollLeft = scrollLeft - walk;
  };

  // Touch Drag handlers for mobile
  const handleTouchStart = (e) => {
    setIsDragging(true);
    setStartX(e.touches[0].pageX - containerRef.current.offsetLeft);
    setScrollLeft(containerRef.current.scrollLeft);
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    const x = e.touches[0].pageX - containerRef.current.offsetLeft;
    const walk = (x - startX) * 1.8;
    containerRef.current.scrollLeft = scrollLeft - walk;
  };

  return (
    <div className="max-w-6xl mx-auto space-y-4">
      {/* Top Map Banner Tooltip & Color-Coded Legend */}
      <div className="fantasy-panel px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 border-amber-500/30 text-xs">
        <div className="flex items-center gap-2 text-amber-300 font-serif font-bold">
          <Compass className="w-4 h-4 text-amber-400 animate-spin-slow" />
          <span>Continent of Aethelgard</span>
        </div>

        {/* Path Legend */}
        <div className="flex flex-wrap items-center gap-3 text-[11px] font-mono">
          <div className="flex items-center gap-1.5 text-emerald-400">
            <span className="w-3 h-1 bg-emerald-500 rounded-full inline-block" />
            <span>Green: Safe (Both Visited)</span>
          </div>
          <div className="flex items-center gap-1.5 text-yellow-400">
            <span className="w-3 h-1 bg-yellow-500 rounded-full inline-block" />
            <span>Yellow: Undiscovered Available</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-400">
            <span className="w-3 h-1 bg-slate-600 rounded-full inline-block" />
            <span>Grey: Inaccessible</span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-slate-300 font-mono">
          <Move className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
          <span>👈 Drag / Swipe Map 👉</span>
        </div>
      </div>

      {/* Main Grid: Scrollable Drag Map (2 Cols on Desktop) & Inspector Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* DRAGGABLE & SCROLLABLE EXPANSIVE MAP CONTAINER */}
        <div
          ref={containerRef}
          onMouseDown={handleMouseDown}
          onMouseLeave={handleMouseLeaveOrUp}
          onMouseUp={handleMouseLeaveOrUp}
          onMouseMove={handleMouseMove}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleMouseLeaveOrUp}
          onTouchMove={handleTouchMove}
          className="lg:col-span-2 fantasy-panel parchment-bg relative min-h-[460px] sm:min-h-[520px] overflow-x-auto overflow-y-hidden border-amber-500/30 cursor-grab active:cursor-grabbing select-none"
        >
          {/* Internal Expansive Canvas (1800px Width) */}
          <div className="relative w-[1800px] h-[500px]">

            {/* Region Label Headers Across Map Width */}
            <div className="absolute top-4 left-[5%] text-xs font-serif font-bold uppercase tracking-widest text-amber-500/40 pointer-events-none">
              🏞️ The Oakwood Lowlands
            </div>
            <div className="absolute top-4 left-[30%] text-xs font-serif font-bold uppercase tracking-widest text-blue-400/40 pointer-events-none">
              🌊 The Arcane Coast
            </div>
            <div className="absolute top-4 left-[52%] text-xs font-serif font-bold uppercase tracking-widest text-emerald-400/40 pointer-events-none">
              ⛰️ The Gilded Mountains
            </div>
            <div className="absolute top-4 left-[75%] text-xs font-serif font-bold uppercase tracking-widest text-red-400/40 pointer-events-none">
              🌋 Nether Volcanic Summit
            </div>

            {/* SVG Color-Coded Connection Lines */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              {MAP_NODES.map(node => {
                return node.connectedTo.map(targetId => {
                  const targetNode = MAP_NODES.find(n => n.id === targetId);
                  if (!targetNode) return null;
                  if (node.id > targetId) return null;

                  const nodeUnlocked = gameState.unlockedMapNodes.includes(node.id);
                  const targetUnlocked = gameState.unlockedMapNodes.includes(targetId);

                  // Color logic:
                  // Green: Both end locations have been visited/unlocked (Safe cleared path!)
                  // Yellow: One location visited, leading to an undiscovered location (Available route!)
                  // Grey: Neither location visited yet (Inaccessible)
                  const isSafeBothVisited = nodeUnlocked && targetUnlocked;
                  const isAvailableUndiscovered = (nodeUnlocked || targetUnlocked) && !isSafeBothVisited;

                  const strokeColor = isSafeBothVisited ? '#22c55e' : isAvailableUndiscovered ? '#eab308' : '#475569';
                  const strokeWidth = isSafeBothVisited ? '3.5' : isAvailableUndiscovered ? '3' : '1.5';
                  const strokeDash = isSafeBothVisited ? 'none' : isAvailableUndiscovered ? '6 3' : '3 3';

                  return (
                    <line
                      key={`${node.id}-${targetId}`}
                      x1={`${node.x}%`}
                      y1={`${node.y}%`}
                      x2={`${targetNode.x}%`}
                      y2={`${targetNode.y}%`}
                      stroke={strokeColor}
                      strokeWidth={strokeWidth}
                      strokeDasharray={strokeDash}
                    />
                  );
                });
              })}
            </svg>

            {/* Node Markers Grid */}
            {MAP_NODES.map(node => {
              const IconComp = ICON_MAP[node.icon] || Shield;
              const unlocked = gameState.unlockedMapNodes.includes(node.id);
              const isCurrent = node.id === gameState.currentMapNodeId;
              const isSelected = node.id === selectedNodeId;

              return (
                <button
                  key={node.id}
                  onClick={() => handleNodeClick(node)}
                  style={{ left: `${node.x}%`, top: `${node.y}%` }}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 group transition-all duration-300 z-20 focus:outline-none`}
                >
                  {/* Node Outer Circle */}
                  <div className={`w-13 h-13 rounded-full flex items-center justify-center border-2 transition-transform duration-300 shadow-2xl relative ${
                    isCurrent
                      ? 'bg-amber-500 border-white text-slate-950 scale-125 animate-pulse-glow'
                      : isSelected
                      ? 'bg-slate-900 border-amber-400 text-amber-300 scale-110'
                      : unlocked
                      ? (node.isSafeSpot ? 'bg-slate-900 border-emerald-500 text-emerald-400 hover:scale-110' : 'bg-slate-900 border-amber-500/60 text-amber-400 hover:scale-110')
                      : 'bg-slate-950/90 border-slate-800 text-slate-700 cursor-not-allowed'
                  }`}>
                    {unlocked ? <IconComp className="w-6 h-6" /> : <Lock className="w-5 h-5" />}

                    {/* Safe Spot Badge Indicator */}
                    {unlocked && node.isSafeSpot && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border border-slate-950 flex items-center justify-center text-[9px] text-slate-950 font-bold" title="Safe Spot / Campfire Sanctuary">
                        ✓
                      </span>
                    )}
                  </div>

                  {/* Node Label Tooltip */}
                  <div className={`mt-1.5 px-2.5 py-0.5 rounded text-[11px] font-semibold tracking-wide whitespace-nowrap border transition-all ${
                    isCurrent
                      ? 'bg-amber-500 text-slate-950 border-amber-300 shadow-md font-bold'
                      : isSelected
                      ? 'bg-slate-900 text-amber-200 border-amber-400'
                      : 'bg-slate-950/90 text-slate-300 border-slate-800'
                  }`}>
                    {node.name}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Node Information Inspector Card (1 Column) */}
        <div className="fantasy-panel p-6 flex flex-col justify-between space-y-6">
          <div>
            <div className="flex items-center justify-between gap-2 mb-4 pb-3 border-b border-amber-500/20">
              <span className="text-xs font-bold uppercase tracking-widest text-amber-400">Node Inspector</span>
              <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${
                isUnlocked ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' : 'bg-red-500/20 text-red-300 border-red-500/40'
              }`}>
                {isUnlocked ? 'Accessible' : 'Locked Node'}
              </span>
            </div>

            <h3 className="text-2xl font-bold font-serif text-amber-100 mb-1">
              {selectedNode.name}
            </h3>
            <p className="text-xs font-medium text-amber-400/80 mb-3">
              {selectedNode.subtitle}
            </p>

            {/* Region & Safe Spot Badges */}
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="text-[11px] bg-slate-950 px-2.5 py-1 rounded border border-slate-800 text-slate-400 font-mono">
                Region: {selectedNode.region || 'Aethelgard'}
              </span>
              {selectedNode.isSafeSpot && (
                <span className="text-[11px] bg-emerald-500/20 text-emerald-300 px-2.5 py-1 rounded border border-emerald-500/40 font-bold flex items-center gap-1">
                  <Heart className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Safe Spot Rest Stop</span>
                </span>
              )}
              {selectedNode.hasTavern && (
                <span className="text-[11px] bg-amber-500/20 text-amber-300 px-2.5 py-1 rounded border border-amber-500/40 font-bold">
                  🍺 Tavern Available
                </span>
              )}
            </div>

            <p className="text-sm text-slate-300 leading-relaxed mb-6">
              {selectedNode.description}
            </p>

            {/* Danger Level Gauge */}
            {!selectedNode.isSafeSpot && (
              <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 space-y-2 mb-4">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-400 flex items-center gap-1"><Skull className="w-4 h-4 text-red-400" /> Danger Rating</span>
                  <span className="text-red-400 font-mono">Rank {selectedNode.danger} / 5</span>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden flex gap-0.5">
                  {[1, 2, 3, 4, 5].map(lv => (
                    <div
                      key={lv}
                      className={`flex-1 ${lv <= selectedNode.danger ? 'bg-red-500' : 'bg-slate-800'}`}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Travel Trigger Button */}
          <button
            disabled={!isUnlocked || isCurrentLocation}
            onClick={handleTravelToNode}
            className={`w-full py-3.5 px-4 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all ${
              isCurrentLocation
                ? 'bg-slate-800/80 text-slate-400 border border-slate-700 cursor-default'
                : isUnlocked
                ? 'fantasy-button-gold shadow-lg hover:scale-105'
                : 'bg-slate-900 text-slate-600 border border-slate-800 cursor-not-allowed'
            }`}
          >
            <Navigation className="w-4 h-4" />
            <span>
              {isCurrentLocation
                ? 'Currently Here'
                : isUnlocked
                ? 'Set Course & Travel'
                : 'Path Locked'}
            </span>
            {isUnlocked && !isCurrentLocation && <ChevronRight className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}
