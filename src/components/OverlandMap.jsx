import React, { useRef, useState, useEffect } from 'react';
import { MAP_NODES } from '../data/mapNodes';
import { Shield, Trees, Compass, Landmark, Castle, Flame, Navigation, Skull, ChevronRight, Lock, CheckCircle2, Move, Sparkles, Heart, Users, Clock, CheckCircle, Footprints } from 'lucide-react';
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

const getPortraitPath = (id) => {
  const normalized = (id || 'warrior').toLowerCase();
  if (normalized === 'priest') return '/assets/portraits/healer_portrait.png';
  if (normalized === 'paladin') return '/assets/portraits/cleric_portrait.png';
  return `/assets/portraits/${normalized}_portrait.png`;
};

// Breadth-First Search Pathfinding for shortest map path
function findPath(startId, targetId) {
  if (startId === targetId) return [startId];
  const queue = [[startId]];
  const visited = new Set([startId]);

  while (queue.length > 0) {
    const path = queue.shift();
    const currId = path[path.length - 1];
    const currNode = MAP_NODES.find(n => n.id === currId);
    if (!currNode) continue;

    for (const neighborId of currNode.connectedTo) {
      if (neighborId === targetId) {
        return [...path, neighborId];
      }
      if (!visited.has(neighborId)) {
        visited.add(neighborId);
        queue.push([...path, neighborId]);
      }
    }
  }
  return [startId, targetId];
}

export default function OverlandMap({ gameState, onSelectMapNode }) {
  const [selectedNodeId, setSelectedNodeId] = useState(gameState.currentMapNodeId);
  const containerRef = useRef(null);

  const currentMapNode = MAP_NODES.find(n => n.id === gameState.currentMapNodeId) || MAP_NODES[0];
  
  // Party Token Animation Coordinates & Walking Simulation State
  const [partyPos, setPartyPos] = useState({ x: currentMapNode.x, y: currentMapNode.y });
  const [walkBob, setWalkBob] = useState(0); // Vertical pixel bounce
  const [walkTilt, setWalkTilt] = useState(0); // Sway angle in degrees
  const [isTraveling, setIsTraveling] = useState(false);

  // Sync initial party position & center map scroll on party when returning to map
  useEffect(() => {
    if (!isTraveling) {
      const node = MAP_NODES.find(n => n.id === gameState.currentMapNodeId);
      if (node) {
        setPartyPos({ x: node.x, y: node.y });
        setWalkBob(0);
        setWalkTilt(0);

        // Auto-center map viewport on current party location
        const timer = setTimeout(() => {
          if (containerRef.current) {
            const canvasWidth = 1800;
            const targetScrollX = (node.x / 100) * canvasWidth - containerRef.current.clientWidth / 2;
            containerRef.current.scrollLeft = Math.max(0, targetScrollX);
          }
        }, 50);
        return () => clearTimeout(timer);
      }
    }
  }, [gameState.currentMapNodeId, isTraveling]);

  // Drag panning state
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const completedBattles = gameState.completedBattles || [];
  const followers = gameState.followers || [];
  const wanderingHeroes = gameState.wanderingHeroes || [];

  const selectedNode = MAP_NODES.find(n => n.id === selectedNodeId) || MAP_NODES[0];
  const isCurrentLocation = selectedNode.id === gameState.currentMapNodeId;
  const isUnlocked = gameState.unlockedMapNodes.includes(selectedNode.id);
  const isSelectedCleared = completedBattles.includes(selectedNode.id);
  const selectedHeroHere = wanderingHeroes.find(h => h.nodeId === selectedNode.id && !followers.some(f => f.id === h.id));

  const handleNodeClick = (node) => {
    if (isTraveling) return;
    audioManager.playClick();
    setSelectedNodeId(node.id);
  };

  // REAL-TIME 60 FPS FRAME-BY-FRAME WALKING SIMULATION WITH RHYTHMIC BOBBING & SWAYING
  const handleTravelToNode = () => {
    if (!isUnlocked || isTraveling || isCurrentLocation) return;
    audioManager.playClick();

    const pathIds = findPath(gameState.currentMapNodeId, selectedNode.id);
    const waypoints = pathIds.map(id => MAP_NODES.find(n => n.id === id)).filter(Boolean);

    if (waypoints.length <= 1) {
      onSelectMapNode(selectedNode);
      return;
    }

    setIsTraveling(true);
    const SEGMENT_DURATION = 2800; // 2.8 seconds per map node segment (Deliberate, realistic walking pace)
    let startTime = null;

    const animateWalk = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const totalElapsed = timestamp - startTime;
      const totalSegments = waypoints.length - 1;
      const totalDuration = totalSegments * SEGMENT_DURATION;

      if (totalElapsed >= totalDuration) {
        const finalWp = waypoints[waypoints.length - 1];
        setPartyPos({ x: finalWp.x, y: finalWp.y });
        setWalkBob(0);
        setWalkTilt(0);
        setIsTraveling(false);
        onSelectMapNode(selectedNode);
        return;
      }

      const currentSegmentIdx = Math.floor(totalElapsed / SEGMENT_DURATION);
      const segmentElapsed = totalElapsed % SEGMENT_DURATION;
      const t = segmentElapsed / SEGMENT_DURATION;

      const fromWp = waypoints[currentSegmentIdx];
      const toWp = waypoints[currentSegmentIdx + 1] || fromWp;

      // Pure linear position interpolation (zero start delay / zero sudden acceleration)
      const currX = fromWp.x + (toWp.x - fromWp.x) * t;
      const currY = fromWp.y + (toWp.y - fromWp.y) * t;

      // Rhythmic footstep bob (bounce up/down) & sway (tilt side-to-side)
      const bob = Math.abs(Math.sin(t * Math.PI * 10)) * 3; // 3px subtle rhythmic step bounce
      const tilt = Math.sin(t * Math.PI * 10) * 1.5; // 1.5 degree subtle walking side sway

      setPartyPos({ x: currX, y: currY });
      setWalkBob(bob);
      setWalkTilt(tilt);

      // Smooth continuous camera panning to keep party centered
      if (containerRef.current) {
        const canvasWidth = 1800;
        const targetScrollX = (currX / 100) * canvasWidth - containerRef.current.clientWidth / 2;
        containerRef.current.scrollLeft = Math.max(0, targetScrollX);
      }

      requestAnimationFrame(animateWalk);
    };

    requestAnimationFrame(animateWalk);
  };

  // Mouse Drag handlers
  const handleMouseDown = (e) => {
    if (isTraveling) return;
    setIsDragging(true);
    setStartX(e.pageX - containerRef.current.offsetLeft);
    setScrollLeft(containerRef.current.scrollLeft);
  };

  const handleMouseLeaveOrUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e) => {
    if (!isDragging || isTraveling) return;
    e.preventDefault();
    const x = e.pageX - containerRef.current.offsetLeft;
    const walk = (x - startX) * 1.8;
    containerRef.current.scrollLeft = scrollLeft - walk;
  };

  // Touch Drag handlers for mobile
  const handleTouchStart = (e) => {
    if (isTraveling) return;
    setIsDragging(true);
    setStartX(e.touches[0].pageX - containerRef.current.offsetLeft);
    setScrollLeft(containerRef.current.scrollLeft);
  };

  const handleTouchMove = (e) => {
    if (!isDragging || isTraveling) return;
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
          <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
            <span className="w-3 h-1 bg-emerald-500 rounded-full inline-block" />
            <span>Green: Safe / Cleared</span>
          </div>
          <div className="flex items-center gap-1.5 text-yellow-400 font-bold">
            <span className="w-3 h-1 bg-yellow-500 rounded-full inline-block" />
            <span>Yellow: Available Route</span>
          </div>
          <div className="flex items-center gap-1.5 text-amber-300 font-bold">
            <span>⚔️ Party Location Marker</span>
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

            {/* DYNAMIC REAL-TIME 60 FPS PARTY LOCATION MARKER TOKEN WITH FOOTSTEP BOBBING */}
            <div
              style={{
                left: `${partyPos.x}%`,
                top: `${partyPos.y}%`,
                transform: `translate(-50%, calc(-135% - ${walkBob}px)) rotate(${walkTilt}deg)`
              }}
              className="absolute z-30 pointer-events-none transition-none"
            >
              <div className="flex flex-col items-center">
                {/* Floating Badge Header */}
                <div className="bg-slate-950/95 border-2 border-amber-400 px-3 py-1 rounded-full text-[11px] font-bold font-serif text-amber-300 shadow-2xl flex items-center gap-1.5 whitespace-nowrap">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span>⚔️ {gameState.player?.name || 'Party'}</span>
                  {isTraveling && (
                    <span className="text-amber-400 text-[10px] font-mono font-bold flex items-center gap-1">
                      <Footprints className="w-3 h-3 text-amber-400 animate-bounce" />
                      <span>Walking...</span>
                    </span>
                  )}
                </div>

                {/* Leader Avatar Crest Token */}
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-amber-500 via-amber-600 to-amber-800 p-0.5 shadow-2xl border-2 border-amber-300 relative mt-0.5">
                  <img
                    src={getPortraitPath(gameState.player?.classId)}
                    alt="Party Leader"
                    className="w-full h-full rounded-full object-cover shadow-inner"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-amber-400" />
                </div>
              </div>
            </div>

            {/* Node Markers Grid */}
            {MAP_NODES.map(node => {
              const IconComp = ICON_MAP[node.icon] || Shield;
              const unlocked = gameState.unlockedMapNodes.includes(node.id);
              const isCurrent = node.id === gameState.currentMapNodeId;
              const isSelected = node.id === selectedNodeId;
              const isCleared = completedBattles.includes(node.id);
              const heroAtNode = wanderingHeroes.find(h => h.nodeId === node.id && !followers.some(f => f.id === h.id));

              return (
                <button
                  key={node.id}
                  disabled={isTraveling}
                  onClick={() => handleNodeClick(node)}
                  style={{ left: `${node.x}%`, top: `${node.y}%` }}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 group transition-all duration-300 z-20 focus:outline-none`}
                >
                  {/* Node Outer Circle */}
                  <div className={`w-13 h-13 rounded-full flex items-center justify-center border-2 transition-transform duration-300 shadow-2xl relative ${
                    isCurrent
                      ? 'bg-amber-500 border-white text-slate-950 scale-125'
                      : isSelected
                      ? 'bg-slate-900 border-amber-400 text-amber-300 scale-110'
                      : unlocked
                      ? (isCleared || node.isSafeSpot ? 'bg-slate-900 border-emerald-500 text-emerald-400 hover:scale-110' : 'bg-slate-900 border-amber-500/60 text-amber-400 hover:scale-110')
                      : 'bg-slate-950/90 border-slate-800 text-slate-700 cursor-not-allowed'
                  }`}>
                    {unlocked ? <IconComp className="w-6 h-6" /> : <Lock className="w-5 h-5" />}

                    {/* Cleared or Safe Badge Indicator */}
                    {unlocked && (isCleared || node.isSafeSpot) && (
                      <span className="absolute -top-1 -right-1 w-4.5 h-4.5 bg-emerald-500 rounded-full border border-slate-950 flex items-center justify-center text-[10px] text-slate-950 font-bold" title={isCleared ? "Battle Defeated & Cleared" : "Safe Spot"}>
                        ✓
                      </span>
                    )}

                    {/* Wandering Hero Badge Indicator */}
                    {unlocked && heroAtNode && (
                      <span className="absolute -bottom-1 -right-1 px-1.5 py-0.5 bg-purple-600 rounded-full border border-purple-300 text-[9px] text-white font-bold animate-pulse flex items-center gap-0.5" title={`${heroAtNode.name} resting here (${heroAtNode.turnsRemaining} turns left)`}>
                        👤 {heroAtNode.turnsRemaining}t
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
                    {node.name} {heroAtNode ? '👤' : ''} {isCleared ? '✓' : ''}
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

            {/* Region, Safe Spot, Cleared & Hero Badges */}
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="text-[11px] bg-slate-950 px-2.5 py-1 rounded border border-slate-800 text-slate-400 font-mono">
                Region: {selectedNode.region || 'Aethelgard'}
              </span>

              {isSelectedCleared && (
                <span className="text-[11px] bg-emerald-500/20 text-emerald-300 px-2.5 py-1 rounded border border-emerald-500/40 font-bold flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Enemies Defeated & Cleared</span>
                </span>
              )}

              {selectedHeroHere && (
                <span className="text-[11px] bg-purple-500/20 text-purple-300 px-2.5 py-1 rounded border border-purple-500/40 font-bold flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-purple-400" />
                  <span>👤 {selectedHeroHere.name} Resting ({selectedHeroHere.turnsRemaining} turns left)</span>
                </span>
              )}

              {selectedNode.isSafeSpot && (
                <span className="text-[11px] bg-emerald-500/20 text-emerald-300 px-2.5 py-1 rounded border border-emerald-500/40 font-bold flex items-center gap-1">
                  <Heart className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Safe Spot Rest Stop</span>
                </span>
              )}
            </div>

            <p className="text-sm text-slate-300 leading-relaxed mb-6">
              {selectedNode.description}
            </p>

            {/* Danger Level Gauge */}
            {!selectedNode.isSafeSpot && !isSelectedCleared && (
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
            disabled={!isUnlocked || isCurrentLocation || isTraveling}
            onClick={handleTravelToNode}
            className={`w-full py-3.5 px-4 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all ${
              isTraveling
                ? 'bg-amber-600 text-slate-950 font-bold shadow-lg cursor-wait'
                : isCurrentLocation
                ? 'bg-slate-800/80 text-slate-400 border border-slate-700 cursor-default'
                : isUnlocked
                ? 'fantasy-button-gold shadow-lg hover:scale-105'
                : 'bg-slate-900 text-slate-600 border border-slate-800 cursor-not-allowed'
            }`}
          >
            {isTraveling ? (
              <Footprints className="w-4 h-4 text-slate-950 animate-bounce" />
            ) : (
              <Navigation className="w-4 h-4" />
            )}
            <span>
              {isTraveling
                ? 'Marching along route...'
                : isCurrentLocation
                ? 'Currently Here'
                : isUnlocked
                ? 'Set Course & Travel'
                : 'Path Locked'}
            </span>
            {isUnlocked && !isCurrentLocation && !isTraveling && <ChevronRight className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}
