import React, { useRef, useState, useEffect } from 'react';
import { MAP_NODES } from '../data/mapNodes';
import { Shield, Trees, Compass, Landmark, Castle, Flame, Navigation, Skull, ChevronRight, Lock, CheckCircle2, Sparkles, Heart, Users, Clock, Footprints, Zap, Award } from 'lucide-react';
import { audioManager } from '../engine/audioManager';
import { NODE_AFFIXES } from '../engine/saveManager';
import { 
  DEFAULT_MAP_PATHS, 
  DEFAULT_PATH_COLORS, 
  DEFAULT_MARKER_POSITIONS, 
  DEFAULT_PATH_STYLE, 
  getPathPairKey, 
  generateSvgPathData, 
  getBezierPoint 
} from '../data/mapPaths';

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
  const canvasRef = useRef(null);

  const currentMapNode = MAP_NODES.find(n => n.id === gameState.currentMapNodeId) || MAP_NODES[0];
  const initialMarkerPos = DEFAULT_MARKER_POSITIONS[currentMapNode.id] || { x: currentMapNode.x, y: currentMapNode.y };
  
  // Party Token Animation Coordinates & Walking Simulation State
  const [partyPos, setPartyPos] = useState({ x: initialMarkerPos.x, y: initialMarkerPos.y });
  const [walkBob, setWalkBob] = useState(0); // Vertical pixel bounce
  const [walkTilt, setWalkTilt] = useState(0); // Sway angle in degrees
  const [isTraveling, setIsTraveling] = useState(false);

  // Sync party position & center map scroll on party when changing locations or mounting
  useEffect(() => {
    if (!isTraveling) {
      const node = MAP_NODES.find(n => n.id === gameState.currentMapNodeId);
      if (node) {
        const markerPos = DEFAULT_MARKER_POSITIONS[node.id] || { x: node.x, y: node.y };
        setPartyPos({ x: markerPos.x, y: markerPos.y });
        setWalkBob(0);
        setWalkTilt(0);

        const timer = setTimeout(() => {
          if (containerRef.current) {
            const canvasWidth = 1800;
            const targetScrollX = (markerPos.x / 100) * canvasWidth - containerRef.current.clientWidth / 2;
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

  // A map node is accessible if it is in unlockedMapNodes OR has at least one connecting node visited/cleared/unlocked
  const isNodeAccessible = (node) => {
    if (!node) return false;
    if ((gameState.unlockedMapNodes || []).includes(node.id)) return true;
    if (node.isSecret) return false; // Secret areas must be unlocked via discovery

    const unlockedOrVisited = new Set([
      'oakhaven',
      gameState.currentMapNodeId,
      ...(gameState.unlockedMapNodes || []),
      ...(gameState.completedBattles || []),
      ...(gameState.visitedNodes || [])
    ]);

    return (node.connectedTo || []).some(connId => unlockedOrVisited.has(connId));
  };

  const isUnlocked = isNodeAccessible(selectedNode);
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

    const fullPathIds = findPath(gameState.currentMapNodeId, selectedNode.id);
    let gatedPathIds = [fullPathIds[0]];
    let stoppedNode = selectedNode;

    for (let i = 1; i < fullPathIds.length; i++) {
      const stepId = fullPathIds[i];
      gatedPathIds.push(stepId);
      const stepNode = MAP_NODES.find(n => n.id === stepId);

      const isHostile = stepNode && (!stepNode.isSafeSpot && stepNode.type !== 'town' && stepNode.type !== 'safe_sanctuary');
      const isCleared = completedBattles.includes(stepId);

      if (isHostile && !isCleared) {
        stoppedNode = stepNode;
        break; // Party MUST stop at the uncleared hostile node blocking the route!
      }
    }

    const waypoints = gatedPathIds.map(id => MAP_NODES.find(n => n.id === id)).filter(Boolean);

    if (waypoints.length <= 1) {
      onSelectMapNode(stoppedNode);
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
        const finalPos = DEFAULT_MARKER_POSITIONS[finalWp.id] || { x: finalWp.x, y: finalWp.y };
        setPartyPos({ x: finalPos.x, y: finalPos.y });
        setWalkBob(0);
        setWalkTilt(0);
        setIsTraveling(false);
        onSelectMapNode(stoppedNode);
        return;
      }

      const currentSegmentIdx = Math.floor(totalElapsed / SEGMENT_DURATION);
      const segmentElapsed = totalElapsed % SEGMENT_DURATION;
      const t = segmentElapsed / SEGMENT_DURATION;

      const fromWp = waypoints[currentSegmentIdx];
      const toWp = waypoints[currentSegmentIdx + 1] || fromWp;

      const pairKey = getPathPairKey(fromWp.id, toWp.id);
      const curveConfig = DEFAULT_MAP_PATHS[pairKey];

      // Calculate smooth frame position along curved route
      const { x: currX, y: currY } = getBezierPoint(fromWp, toWp, curveConfig, t);

      // Footstep cadence simulation (2 full strides per second)
      const strideFrequency = Math.PI * 4;
      const bob = Math.abs(Math.sin(t * strideFrequency)) * 8;
      const tilt = Math.sin(t * strideFrequency) * 4;

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

  // Mouse Drag handlers for map panning
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
    if (isDragging && !isTraveling) {
      e.preventDefault();
      const x = e.pageX - containerRef.current.offsetLeft;
      const walk = (x - startX) * 1.8;
      containerRef.current.scrollLeft = scrollLeft - walk;
    }
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
          {/* Internal Expansive Canvas (1800px Width) with User's Custom Map Artwork */}
          <div
            ref={canvasRef}
            style={{
              backgroundImage: "url('/assets/map/custom_map.png')",
              backgroundSize: '100% 100%',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat'
            }}
            className="relative w-[1800px] h-[500px] shadow-2xl rounded-xl border border-amber-500/40 overflow-hidden"
          >
            {/* Soft Contrast Tint */}
            <div className="absolute inset-0 bg-slate-950/15 pointer-events-none" />

            {/* Region Label Headers Across Map Width */}
            <div className="absolute top-4 left-[5%] text-xs font-serif font-bold uppercase tracking-widest text-amber-300 drop-shadow-md bg-slate-950/80 px-2.5 py-1 rounded-full border border-amber-500/30 pointer-events-none">
              🏞️ The Oakwood Lowlands
            </div>
            <div className="absolute top-4 left-[30%] text-xs font-serif font-bold uppercase tracking-widest text-blue-300 drop-shadow-md bg-slate-950/80 px-2.5 py-1 rounded-full border border-blue-500/30 pointer-events-none">
              🌊 The Arcane Coast
            </div>
            <div className="absolute top-4 left-[52%] text-xs font-serif font-bold uppercase tracking-widest text-emerald-300 drop-shadow-md bg-slate-950/80 px-2.5 py-1 rounded-full border border-emerald-500/30 pointer-events-none">
              ⛰️ The Gilded Mountains
            </div>
            <div className="absolute top-4 left-[75%] text-xs font-serif font-bold uppercase tracking-widest text-red-300 drop-shadow-md bg-slate-950/80 px-2.5 py-1 rounded-full border border-red-500/30 pointer-events-none">
              🌋 Nether Volcanic Summit
            </div>

            {/* SVG Color-Coded Curved Connection Routes */}
            <svg viewBox="0 0 1800 500" className="absolute inset-0 w-full h-full pointer-events-none">
              <defs>
                {/* SVG Dirt Road Noise Filter (Displacement of stroke edges for eroded dirt appearance) */}
                <filter id="dirtRoadNoiseFilter" x="-20%" y="-20%" width="140%" height="140%">
                  <feTurbulence
                    type="fractalNoise"
                    baseFrequency={DEFAULT_PATH_STYLE.roughness || 0.05}
                    numOctaves="3"
                    result="noise"
                  />
                  <feDisplacementMap
                    in="SourceGraphic"
                    in2="noise"
                    scale={DEFAULT_PATH_STYLE.noiseIntensity || 4.5}
                    xChannelSelector="R"
                    yChannelSelector="G"
                    result="displaced"
                  />
                </filter>
              </defs>

              {MAP_NODES.map(node => {
                return node.connectedTo.map(targetId => {
                  const targetNode = MAP_NODES.find(n => n.id === targetId);
                  if (!targetNode) return null;
                  if (node.id > targetId) return null;

                  const pairKey = getPathPairKey(node.id, targetId);
                  const pathD = generateSvgPathData(node, targetNode, DEFAULT_MAP_PATHS[pairKey]);

                  const nodeUnlocked = isNodeAccessible(node);
                  const targetUnlocked = isNodeAccessible(targetNode);

                  // Secret nodes and their pathways are hidden until unlocked
                  if (node.isSecret && !nodeUnlocked) return null;
                  if (targetNode.isSecret && !targetUnlocked) return null;

                  const isSafeBothVisited = nodeUnlocked && targetUnlocked;
                  const routeCustomCfg = DEFAULT_PATH_COLORS[pairKey];
                  const routePathColor = routeCustomCfg?.color || DEFAULT_PATH_STYLE.defaultPathColor;
                  const routeTrackColor = routeCustomCfg?.trackColor || DEFAULT_PATH_STYLE.defaultTrackColor;

                  let mainStrokeColor = routePathColor;
                  let mainStrokeWidth = DEFAULT_PATH_STYLE.strokeWidth;
                  let mainStrokeDash = 'none';
                  let mainOpacity = DEFAULT_PATH_STYLE.opacity || 0.88;

                  if (!nodeUnlocked && !targetUnlocked) {
                    mainOpacity = 0.35;
                    mainStrokeDash = '4 4';
                  } else if (!isSafeBothVisited) {
                    mainOpacity = 0.75;
                    mainStrokeDash = '6 3';
                  }

                  return (
                    <g key={pairKey}>
                      {/* Visual Curved Route Path (with dirt noise filter) */}
                      <path
                        d={pathD}
                        fill="none"
                        stroke={mainStrokeColor}
                        strokeWidth={mainStrokeWidth}
                        strokeDasharray={mainStrokeDash}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeOpacity={mainOpacity}
                        filter="url(#dirtRoadNoiseFilter)"
                      />

                      {/* Trodden Inner Wagon Rut / Dual Track */}
                      {DEFAULT_PATH_STYLE.showTracks && (
                        <path
                          d={pathD}
                          fill="none"
                          stroke={routeTrackColor}
                          strokeWidth={Math.max(1, DEFAULT_PATH_STYLE.strokeWidth * 0.35)}
                          strokeDasharray="6 3"
                          strokeLinecap="round"
                          strokeOpacity={mainOpacity * 0.85}
                          filter="url(#dirtRoadNoiseFilter)"
                        />
                      )}
                    </g>
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
            {MAP_NODES.filter(node => !node.isSecret || isNodeAccessible(node)).map(node => {
              const IconComp = ICON_MAP[node.icon] || Shield;
              const unlocked = isNodeAccessible(node);
              const isCurrent = node.id === gameState.currentMapNodeId;
              const isSelected = node.id === selectedNodeId;
              const isCleared = completedBattles.includes(node.id);
              const heroAtNode = wanderingHeroes.find(h => h.nodeId === node.id && !followers.some(f => f.id === h.id));
              const nodeAffixKey = (gameState.nodeAffixes || {})[node.id];
              const nodeAffix = nodeAffixKey ? NODE_AFFIXES[nodeAffixKey] : null;

              const markerPos = DEFAULT_MARKER_POSITIONS[node.id] || { x: node.x, y: node.y };

              return (
                <button
                  key={node.id}
                  type="button"
                  disabled={isTraveling}
                  onClick={() => handleNodeClick(node)}
                  style={{ left: `${markerPos.x}%`, top: `${markerPos.y}%` }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 group transition-all duration-200 z-20 focus:outline-none"
                >
                  {/* Node Outer Circle */}
                  <div className={`w-13 h-13 rounded-full flex items-center justify-center border-2 transition-transform duration-300 shadow-2xl relative ${
                    isCurrent
                      ? 'bg-amber-500 border-white text-slate-950 scale-125'
                      : isSelected
                      ? 'bg-slate-900 border-amber-400 text-amber-300 scale-110'
                      : node.isSecret
                      ? 'bg-purple-950/90 border-purple-400 text-purple-300 hover:scale-110 shadow-purple-900/50'
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

                    {/* Node Affix Indicator */}
                    {unlocked && nodeAffix && (
                      <span className="absolute -top-1 -left-1 px-1 py-0.5 bg-amber-500/90 rounded-full border border-amber-300 text-[8px] text-slate-950 font-bold shadow" title={nodeAffix.name}>
                        ⚡
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
                      : node.isSecret
                      ? 'bg-purple-950/90 text-purple-200 border-purple-500/50'
                      : 'bg-slate-950/90 text-slate-300 border-slate-800'
                  }`}>
                    {node.isSecret ? '✨ ' : ''}{node.name} {heroAtNode ? '👤' : ''} {isCleared ? '✓' : ''}
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

            <div className="space-y-4">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Region</span>
                <p className="text-xs text-amber-300/80 font-serif">{selectedNode.region || 'The Realm of Aethelgard'}</p>
                <h3 className="text-xl font-bold font-serif text-amber-200 mt-0.5">{selectedNode.name}</h3>
                <p className="text-xs text-slate-400 italic mt-0.5">{selectedNode.subtitle}</p>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/50 p-3 rounded-lg border border-slate-800">
                {selectedNode.description}
              </p>

              {/* Wandering Hero Encounter Notice */}
              {selectedHeroHere && (
                <div className="bg-purple-950/40 border border-purple-500/50 p-3 rounded-lg flex items-center justify-between gap-2 animate-fade-in">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-purple-400">Wandering Hero Resting Here</span>
                    <p className="text-xs font-bold text-purple-200">{selectedHeroHere.name} ({selectedHeroHere.classId})</p>
                    <p className="text-[11px] text-purple-300/70">Departs in {selectedHeroHere.turnsRemaining} turns.</p>
                  </div>
                  <span className="text-2xl">👤</span>
                </div>
              )}

              {/* Node Affix Indicator Card */}
              {gameState.nodeAffixes?.[selectedNode.id] && (() => {
                const affix = NODE_AFFIXES[gameState.nodeAffixes[selectedNode.id]];
                if (!affix) return null;
                return (
                  <div className="bg-amber-950/40 border border-amber-500/40 p-3 rounded-lg flex items-start gap-2.5 animate-fade-in">
                    <span className="text-lg">⚡</span>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-amber-400">Active Area Modifier</span>
                      <p className="text-xs font-bold text-amber-200">{affix.name}</p>
                      <p className="text-[11px] text-slate-300 mt-0.5">{affix.description}</p>
                    </div>
                  </div>
                );
              })()}

              <div className="space-y-2 pt-2 border-t border-slate-800 text-xs">
                <div className="flex justify-between items-center text-slate-400">
                  <span>Danger Level:</span>
                  <span className={`font-mono font-bold ${selectedNode.danger === 0 ? 'text-emerald-400' : selectedNode.danger > 2 ? 'text-red-400' : 'text-amber-400'}`}>
                    {selectedNode.danger === 0 ? 'Peaceful Safe Spot' : `Threat Level ${selectedNode.danger}`}
                  </span>
                </div>

                <div className="flex justify-between items-center text-slate-400">
                  <span>Location Status:</span>
                  <span className="font-semibold text-slate-200">
                    {isCurrentLocation ? '📍 Current Camp' : isSelectedCleared ? 'Cleared & Secured' : selectedNode.isSafeSpot ? 'Safe Haven' : 'Unexplored Encounter'}
                  </span>
                </div>

                {selectedNode.hasTavern && (
                  <div className="flex justify-between items-center text-slate-400">
                    <span>Facilities:</span>
                    <span className="text-amber-400 font-semibold">Tavern & Campfire</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action / Travel Button */}
          <button
            disabled={!isUnlocked || isTraveling || isCurrentLocation}
            onClick={handleTravelToNode}
            className={`w-full py-3.5 px-4 rounded-xl font-bold text-sm tracking-wide transition-all duration-300 shadow-xl flex items-center justify-center gap-2 ${
              isCurrentLocation
                ? 'bg-slate-800/80 text-slate-400 border border-slate-700 cursor-default'
                : isUnlocked && !isTraveling
                ? 'bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 shadow-amber-900/30 cursor-pointer active:scale-98'
                : 'bg-slate-900 border border-slate-800 text-slate-600 cursor-not-allowed'
            }`}
          >
            <span>
              {isTraveling
                ? 'Traveling Onward...'
                : isCurrentLocation
                ? 'Current Location'
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
