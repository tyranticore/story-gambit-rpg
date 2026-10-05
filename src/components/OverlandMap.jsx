import React, { useRef, useState, useEffect } from 'react';
import { MAP_NODES } from '../data/mapNodes';
import { Shield, Trees, Compass, Landmark, Castle, Flame, Navigation, Skull, ChevronRight, Lock, CheckCircle2, Move, Sparkles, Heart, Users, Clock, CheckCircle, Footprints, Zap, Award, Crosshair, Copy, Trash2, Eye, EyeOff, MapPin, Spline, RotateCcw, Plus, Minus, Palette, Sliders } from 'lucide-react';
import { audioManager } from '../engine/audioManager';
import { NODE_AFFIXES } from '../engine/saveManager';
import { DEFAULT_MAP_PATHS, DEFAULT_PATH_COLORS, DEFAULT_MARKER_POSITIONS, getPathPairKey, generateSvgPathData, getBezierPoint } from '../data/mapPaths';

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

export const DEFAULT_PATH_STYLE = {
  filterEnabled: true,
  colorMode: 'custom', // 'custom' | 'gameplay'
  defaultPathColor: '#8c6239', // Warm earthy dirt
  defaultTrackColor: '#54381e', // Inner trodden wheel rut
  showTracks: true,
  strokeWidth: 4.5,
  noiseIntensity: 4.5, // 1 to 12
  roughness: 0.05, // 0.01 to 0.15
  opacity: 0.88,
  routeColors: { ...DEFAULT_PATH_COLORS }
};

const DIRT_PALETTES = [
  { name: 'Warm Dirt', color: '#8c6239', track: '#54381e' },
  { name: 'Dusty Trail', color: '#bfa17a', track: '#876c49' },
  { name: 'Forest Mud', color: '#523924', track: '#332113' },
  { name: 'Cobblestone', color: '#64748b', track: '#334155' },
  { name: 'Volcanic Ash', color: '#475569', track: '#1e293b' },
  { name: 'Crimson Clay', color: '#991b1b', track: '#581c87' },
  { name: 'Golden Sand', color: '#d97706', track: '#92400e' }
];

export default function OverlandMap({ gameState, onSelectMapNode }) {
  const [selectedNodeId, setSelectedNodeId] = useState(gameState.currentMapNodeId);
  const containerRef = useRef(null);
  const canvasRef = useRef(null);

  // Developer Map Tools Mode State
  // When false (default in production on GitHub Pages): all 4 editing tools and toolbars are 100% hidden.
  // Can be toggled with secret hotkey: Ctrl + Shift + M (or Cmd + Shift + M)
  // Or unlocked via URL parameter: ?editor=true or ?dev=true
  const [devMode, setDevMode] = useState(() => {
    try {
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        if (params.get('editor') === 'true' || params.get('dev') === 'true') {
          return true;
        }
        const stored = localStorage.getItem('story_gambit_dev_mode');
        if (stored !== null) return stored === 'true';
      }
    } catch (e) {}
    return Boolean(import.meta.env?.DEV);
  });

  // Hotkey listener for Ctrl + Shift + M (Cmd + Shift + M on Mac)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'M' || e.key === 'm')) {
        e.preventDefault();
        setDevMode(prev => {
          const next = !prev;
          try {
            localStorage.setItem('story_gambit_dev_mode', String(next));
          } catch (err) {}
          return next;
        });
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // When devMode is deactivated, reset all editing tools to inactive
  useEffect(() => {
    if (!devMode) {
      setCoordToolActive(false);
      setCurveToolActive(false);
      setStyleToolActive(false);
      setMarkerDragToolActive(false);
    }
  }, [devMode]);

  // Temporary Interactive Coordinate Calibration Tool State
  const [coordToolActive, setCoordToolActive] = useState(false);
  const [showExistingMarkers, setShowExistingMarkers] = useState(true);
  const [hoverCoords, setHoverCoords] = useState(null);
  const [pinnedCoords, setPinnedCoords] = useState([]);
  const [selectedNodeToTag, setSelectedNodeToTag] = useState('oakhaven');
  const [copiedNotice, setCopiedNotice] = useState('');
  const dragDistanceRef = useRef(0);

  // Interactive Path Curve Manipulation Tool State
  const [curveToolActive, setCurveToolActive] = useState(false);
  const [customCurves, setCustomCurves] = useState(() => {
    try {
      const stored = localStorage.getItem('story_gambit_custom_paths');
      if (stored) return { ...DEFAULT_MAP_PATHS, ...JSON.parse(stored) };
    } catch (e) {
      console.warn('Error reading stored custom paths', e);
    }
    return { ...DEFAULT_MAP_PATHS };
  });
  const [selectedRouteKey, setSelectedRouteKey] = useState('oakhaven__whispering_woods');
  const [draggingHandle, setDraggingHandle] = useState(null); // { routeKey, handleIndex }
  const [curveCopiedNotice, setCurveCopiedNotice] = useState('');

  // Pathway Dirt Noise Filter & Styling Tool State
  const [styleToolActive, setStyleToolActive] = useState(false);
  const [colorsCopiedNotice, setColorsCopiedNotice] = useState('');
  const [pathStyle, setPathStyle] = useState(() => {
    try {
      const stored = localStorage.getItem('story_gambit_path_style');
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          ...DEFAULT_PATH_STYLE,
          ...parsed,
          defaultPathColor: parsed.defaultPathColor || parsed.pathColor || DEFAULT_PATH_STYLE.defaultPathColor,
          defaultTrackColor: parsed.defaultTrackColor || parsed.trackColor || DEFAULT_PATH_STYLE.defaultTrackColor,
          routeColors: { ...DEFAULT_PATH_COLORS, ...(parsed.routeColors || {}) }
        };
      }
    } catch (e) {
      console.warn('Error reading stored path style', e);
    }
    return { ...DEFAULT_PATH_STYLE, routeColors: { ...DEFAULT_PATH_COLORS } };
  });

  useEffect(() => {
    try {
      localStorage.setItem('story_gambit_path_style', JSON.stringify(pathStyle));
    } catch (err) {}
  }, [pathStyle]);

  // Marker Reposition Dragging Tool State (Moves visual marker icons without changing roads)
  const [markerDragToolActive, setMarkerDragToolActive] = useState(false);
  const [draggingMarkerId, setDraggingMarkerId] = useState(null);
  const [markerPositionsCopiedNotice, setMarkerPositionsCopiedNotice] = useState('');
  const [customMarkerPositions, setCustomMarkerPositions] = useState(() => {
    try {
      const stored = localStorage.getItem('story_gambit_custom_marker_coords');
      if (stored) return { ...DEFAULT_MARKER_POSITIONS, ...JSON.parse(stored) };
    } catch (e) {
      console.warn('Error reading stored marker positions', e);
    }
    return { ...DEFAULT_MARKER_POSITIONS };
  });

  useEffect(() => {
    try {
      localStorage.setItem('story_gambit_custom_marker_coords', JSON.stringify(customMarkerPositions));
    } catch (err) {}
  }, [customMarkerPositions]);

  // Extract all unique route connection pairs (Road endpoints are fixed to MAP_NODES)
  const allConnectionPairs = React.useMemo(() => {
    const pairs = [];
    const seen = new Set();
    MAP_NODES.forEach(node => {
      (node.connectedTo || []).forEach(targetId => {
        const targetNode = MAP_NODES.find(n => n.id === targetId);
        if (!targetNode) return;
        const key = getPathPairKey(node.id, targetId);
        if (!seen.has(key)) {
          seen.add(key);
          const n1 = node.id < targetId ? node : targetNode;
          const n2 = node.id < targetId ? targetNode : node;
          pairs.push({ key, node1: n1, node2: n2, label: `${n1.name} ↔ ${n2.name}` });
        }
      });
    });
    return pairs;
  }, []);

  const getRouteControlPoints = (routeKey) => {
    if (customCurves[routeKey]?.controlPoints?.length > 0) {
      return customCurves[routeKey].controlPoints;
    }
    const pair = allConnectionPairs.find(p => p.key === routeKey);
    if (!pair) return [];
    return [{
      x: Number(((pair.node1.x + pair.node2.x) / 2).toFixed(1)),
      y: Number(((pair.node1.y + pair.node2.y) / 2).toFixed(1))
    }];
  };

  const handleSelectRouteToCurve = (routeKey) => {
    setSelectedRouteKey(routeKey);
    if (!customCurves[routeKey] || !customCurves[routeKey].controlPoints || customCurves[routeKey].controlPoints.length === 0) {
      const pair = allConnectionPairs.find(p => p.key === routeKey);
      if (pair) {
        const initialCp = {
          x: Number(((pair.node1.x + pair.node2.x) / 2).toFixed(1)),
          y: Number(((pair.node1.y + pair.node2.y) / 2).toFixed(1))
        };
        const updated = {
          ...customCurves,
          [routeKey]: { controlPoints: [initialCp] }
        };
        setCustomCurves(updated);
        try {
          localStorage.setItem('story_gambit_custom_paths', JSON.stringify(updated));
        } catch (e) {}
      }
    }
  };

  const handleAddSecondBend = () => {
    const pair = allConnectionPairs.find(p => p.key === selectedRouteKey);
    if (!pair) return;
    const cp1 = {
      x: Number((pair.node1.x + (pair.node2.x - pair.node1.x) * 0.33).toFixed(1)),
      y: Number((pair.node1.y + (pair.node2.y - pair.node1.y) * 0.33).toFixed(1))
    };
    const cp2 = {
      x: Number((pair.node1.x + (pair.node2.x - pair.node1.x) * 0.67).toFixed(1)),
      y: Number((pair.node1.y + (pair.node2.y - pair.node1.y) * 0.67).toFixed(1))
    };
    const updated = {
      ...customCurves,
      [selectedRouteKey]: { controlPoints: [cp1, cp2] }
    };
    setCustomCurves(updated);
    try {
      localStorage.setItem('story_gambit_custom_paths', JSON.stringify(updated));
    } catch (e) {}
  };

  const handleRemoveSecondBend = () => {
    const pair = allConnectionPairs.find(p => p.key === selectedRouteKey);
    if (!pair) return;
    const cp = {
      x: Number(((pair.node1.x + pair.node2.x) / 2).toFixed(1)),
      y: Number(((pair.node1.y + pair.node2.y) / 2).toFixed(1))
    };
    const updated = {
      ...customCurves,
      [selectedRouteKey]: { controlPoints: [cp] }
    };
    setCustomCurves(updated);
    try {
      localStorage.setItem('story_gambit_custom_paths', JSON.stringify(updated));
    } catch (e) {}
  };

  const handleResetStraight = () => {
    const updated = { ...customCurves };
    delete updated[selectedRouteKey];
    setCustomCurves(updated);
    try {
      localStorage.setItem('story_gambit_custom_paths', JSON.stringify(updated));
    } catch (e) {}
  };

  const handleCopyCurvesJson = () => {
    const jsonStr = JSON.stringify(customCurves, null, 2);
    navigator.clipboard.writeText(jsonStr);
    setCurveCopiedNotice('Copied all custom path curves to clipboard!');
    setTimeout(() => setCurveCopiedNotice(''), 3000);
  };

  const getCurrentRouteColor = (routeKey) => {
    return pathStyle.routeColors?.[routeKey]?.color || pathStyle.defaultPathColor;
  };

  const handleSetSelectedRouteColor = (color, trackColor) => {
    setPathStyle(prev => ({
      ...prev,
      routeColors: {
        ...(prev.routeColors || {}),
        [selectedRouteKey]: {
          color,
          trackColor: trackColor || prev.defaultTrackColor
        }
      }
    }));
  };

  const handleApplyColorToAllRoutes = (color, trackColor) => {
    const newRouteColors = {};
    allConnectionPairs.forEach(p => {
      newRouteColors[p.key] = {
        color: color || pathStyle.defaultPathColor,
        trackColor: trackColor || pathStyle.defaultTrackColor
      };
    });
    setPathStyle(prev => ({
      ...prev,
      defaultPathColor: color || prev.defaultPathColor,
      defaultTrackColor: trackColor || prev.defaultTrackColor,
      routeColors: newRouteColors
    }));
  };

  const handleCopyPathColorsJson = () => {
    const output = {};
    allConnectionPairs.forEach(p => {
      const rc = pathStyle.routeColors?.[p.key];
      output[p.key] = {
        color: rc?.color || pathStyle.defaultPathColor,
        trackColor: rc?.trackColor || pathStyle.defaultTrackColor
      };
    });
    navigator.clipboard.writeText(JSON.stringify(output, null, 2));
    setColorsCopiedNotice('Copied all pathway colors JSON to clipboard!');
    setTimeout(() => setColorsCopiedNotice(''), 3000);
  };

  // Global drag handler for curve control handles to ensure continuous smooth dragging
  useEffect(() => {
    if (!draggingHandle) return;

    const handleWindowMouseMove = (e) => {
      if (!canvasRef.current) return;
      const rect = canvasRef.current.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;
      const clampedX = Math.max(0, Math.min(1800, clickX));
      const clampedY = Math.max(0, Math.min(500, clickY));
      const xPct = Number(((clampedX / 1800) * 100).toFixed(1));
      const yPct = Number(((clampedY / 500) * 100).toFixed(1));

      setCustomCurves(prev => {
        const next = { ...prev };
        const curve = next[draggingHandle.routeKey] || { controlPoints: [] };
        const updatedPoints = [...(curve.controlPoints || [])];
        updatedPoints[draggingHandle.handleIndex] = { x: xPct, y: yPct };
        next[draggingHandle.routeKey] = {
          ...curve,
          controlPoints: updatedPoints
        };
        return next;
      });
    };

    const handleWindowMouseUp = () => {
      setDraggingHandle(null);
    };

    window.addEventListener('mousemove', handleWindowMouseMove);
    window.addEventListener('mouseup', handleWindowMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleWindowMouseMove);
      window.removeEventListener('mouseup', handleWindowMouseUp);
    };
  }, [draggingHandle]);

  // Global drag handler for repositioning visual map markers without adjusting roads
  useEffect(() => {
    if (!draggingMarkerId) return;

    const handleWindowMouseMove = (e) => {
      e.preventDefault();
      if (!canvasRef.current) return;
      const rect = canvasRef.current.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;
      const clampedX = Math.max(0, Math.min(1800, clickX));
      const clampedY = Math.max(0, Math.min(500, clickY));
      const xPct = Number(((clampedX / 1800) * 100).toFixed(1));
      const yPct = Number(((clampedY / 500) * 100).toFixed(1));

      setCustomMarkerPositions(prev => ({
        ...prev,
        [draggingMarkerId]: { x: xPct, y: yPct }
      }));
    };

    const handleWindowMouseUp = () => {
      setDraggingMarkerId(null);
    };

    window.addEventListener('mousemove', handleWindowMouseMove);
    window.addEventListener('mouseup', handleWindowMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleWindowMouseMove);
      window.removeEventListener('mouseup', handleWindowMouseUp);
    };
  }, [draggingMarkerId]);

  const handleCopyMarkerPositionsJson = () => {
    const output = {};
    MAP_NODES.forEach(n => {
      const pos = customMarkerPositions[n.id] || DEFAULT_MARKER_POSITIONS[n.id] || { x: n.x, y: n.y };
      output[n.id] = {
        name: n.name,
        x: pos.x,
        y: pos.y
      };
    });
    navigator.clipboard.writeText(JSON.stringify(output, null, 2));
    setMarkerPositionsCopiedNotice('Copied all marker coordinates JSON to clipboard!');
    setTimeout(() => setMarkerPositionsCopiedNotice(''), 3000);
  };

  const handleResetMarkerPositions = () => {
    setCustomMarkerPositions({ ...DEFAULT_MARKER_POSITIONS });
    try {
      localStorage.setItem('story_gambit_custom_marker_coords', JSON.stringify(DEFAULT_MARKER_POSITIONS));
    } catch (e) {}
  };

  // Synchronize customCurves to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('story_gambit_custom_paths', JSON.stringify(customCurves));
    } catch (err) {}
  }, [customCurves]);

  const currentMapNode = MAP_NODES.find(n => n.id === gameState.currentMapNodeId) || MAP_NODES[0];
  const initialMarkerPos = customMarkerPositions[currentMapNode.id] || DEFAULT_MARKER_POSITIONS[currentMapNode.id] || { x: currentMapNode.x, y: currentMapNode.y };
  
  // Party Token Animation Coordinates & Walking Simulation State
  const [partyPos, setPartyPos] = useState({ x: initialMarkerPos.x, y: initialMarkerPos.y });
  const [walkBob, setWalkBob] = useState(0); // Vertical pixel bounce
  const [walkTilt, setWalkTilt] = useState(0); // Sway angle in degrees
  const [isTraveling, setIsTraveling] = useState(false);

  // Sync initial party position & center map scroll on party when returning to map
  useEffect(() => {
    if (!isTraveling && !markerDragToolActive) {
      const node = MAP_NODES.find(n => n.id === gameState.currentMapNodeId);
      if (node) {
        const markerPos = customMarkerPositions[node.id] || DEFAULT_MARKER_POSITIONS[node.id] || { x: node.x, y: node.y };
        setPartyPos({ x: markerPos.x, y: markerPos.y });
        setWalkBob(0);
        setWalkTilt(0);

        // Auto-center map viewport on current party location
        const timer = setTimeout(() => {
          if (containerRef.current && !markerDragToolActive) {
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
        setPartyPos({ x: finalWp.x, y: finalWp.y });
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

      // Smooth interpolation along custom curve if defined, else linear
      const segRouteKey = getPathPairKey(fromWp.id, toWp.id);
      const segCurve = customCurves[segRouteKey];
      const curvePos = getBezierPoint(fromWp, toWp, segCurve, t);
      const currX = curvePos.x;
      const currY = curvePos.y;

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
    if (isTraveling || markerDragToolActive) return;
    setIsDragging(true);
    dragDistanceRef.current = 0;
    setStartX(e.pageX - containerRef.current.offsetLeft);
    setScrollLeft(containerRef.current.scrollLeft);
  };

  const handleMouseLeaveOrUp = () => {
    setIsDragging(false);
    if (draggingHandle) {
      setDraggingHandle(null);
      try {
        localStorage.setItem('story_gambit_custom_paths', JSON.stringify(customCurves));
      } catch (err) {}
    }
  };

  const handleMouseMove = (e) => {
    if (draggingHandle && canvasRef.current) {
      e.preventDefault();
      const rect = canvasRef.current.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;
      const clampedX = Math.max(0, Math.min(1800, clickX));
      const clampedY = Math.max(0, Math.min(500, clickY));
      const xPct = Number(((clampedX / 1800) * 100).toFixed(1));
      const yPct = Number(((clampedY / 500) * 100).toFixed(1));

      setCustomCurves(prev => {
        const next = { ...prev };
        const curve = next[draggingHandle.routeKey] || { controlPoints: [] };
        const updatedPoints = [...(curve.controlPoints || [])];
        updatedPoints[draggingHandle.handleIndex] = { x: xPct, y: yPct };
        next[draggingHandle.routeKey] = {
          ...curve,
          controlPoints: updatedPoints
        };
        return next;
      });
      return;
    }

    if (isDragging && !isTraveling && !markerDragToolActive) {
      e.preventDefault();
      const x = e.pageX - containerRef.current.offsetLeft;
      const walk = (x - startX) * 1.8;
      dragDistanceRef.current += Math.abs(x - startX);
      containerRef.current.scrollLeft = scrollLeft - walk;
    }

    if (coordToolActive && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;
      if (clickX >= 0 && clickX <= 1800 && clickY >= 0 && clickY <= 500) {
        setHoverCoords({
          xPercent: ((clickX / 1800) * 100).toFixed(1),
          yPercent: ((clickY / 500) * 100).toFixed(1),
          px1800: Math.round(clickX),
          py500: Math.round(clickY),
          px3600: Math.round(clickX * 2),
          py1000: Math.round(clickY * 2)
        });
      }
    }
  };

  // Canvas Click to drop a coordinate pin
  const handleCanvasClick = (e) => {
    if (!coordToolActive || dragDistanceRef.current > 6) return;
    if (!canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const clampedX = Math.max(0, Math.min(1800, clickX));
    const clampedY = Math.max(0, Math.min(500, clickY));

    const xPercent = Number(((clampedX / 1800) * 100).toFixed(1));
    const yPercent = Number(((clampedY / 500) * 100).toFixed(1));
    const px1800 = Math.round(clampedX);
    const py500 = Math.round(clampedY);
    const px3600 = px1800 * 2;
    const py1000 = py500 * 2;

    const targetNodeObj = MAP_NODES.find(n => n.id === selectedNodeToTag);

    const newPin = {
      id: Date.now(),
      nodeId: selectedNodeToTag,
      nodeName: targetNodeObj ? targetNodeObj.name : selectedNodeToTag,
      xPercent,
      yPercent,
      px1800,
      py500,
      px3600,
      py1000
    };

    setPinnedCoords(prev => [...prev, newPin]);
    audioManager.playClick();

    // Advance to next node automatically for convenience
    const curIdx = MAP_NODES.findIndex(n => n.id === selectedNodeToTag);
    if (curIdx !== -1 && curIdx + 1 < MAP_NODES.length) {
      setSelectedNodeToTag(MAP_NODES[curIdx + 1].id);
    }
  };

  const handleCopyAllPins = () => {
    if (pinnedCoords.length === 0) return;
    const textOutput = pinnedCoords.map((pin, i) => 
      `${i + 1}. [${pin.nodeName} (${pin.nodeId})]: x: ${pin.xPercent}%, y: ${pin.yPercent}% | (1800x500 px: ${pin.px1800}, ${pin.py500}) | (3600x1000 px: ${pin.px3600}, ${pin.py1000})`
    ).join('\n');

    navigator.clipboard.writeText(textOutput);
    setCopiedNotice('Copied all pinned coordinates to clipboard!');
    setTimeout(() => setCopiedNotice(''), 3000);
  };

  const handleRemovePin = (id) => {
    setPinnedCoords(prev => prev.filter(p => p.id !== id));
  };

  // Touch Drag handlers for mobile
  const handleTouchStart = (e) => {
    if (isTraveling || markerDragToolActive) return;
    setIsDragging(true);
    setStartX(e.touches[0].pageX - containerRef.current.offsetLeft);
    setScrollLeft(containerRef.current.scrollLeft);
  };

  const handleTouchMove = (e) => {
    if (!isDragging || isTraveling || markerDragToolActive) return;
    const x = e.touches[0].pageX - containerRef.current.offsetLeft;
    const walk = (x - startX) * 1.8;
    containerRef.current.scrollLeft = scrollLeft - walk;
  };

  return (
    <div className="max-w-6xl mx-auto space-y-4">
      {/* Developer Map Tools Header Controls (Hidden from production players unless unlocked) */}
      {devMode && (
        <div className="fantasy-panel px-4 py-3 flex flex-wrap items-center justify-between gap-3 border-amber-500/40 bg-slate-950/90 shadow-xl text-xs animate-fade-in">
          <div className="flex flex-wrap items-center gap-3">
            <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-mono text-[10px] font-bold">
              🛠️ DEV TOOLS
            </span>

            <button
              onClick={() => setCoordToolActive(prev => !prev)}
              className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all shadow-md ${
                coordToolActive
                  ? 'bg-gradient-to-r from-red-600 to-amber-600 text-white border border-amber-300 animate-pulse'
                  : 'bg-slate-900 text-slate-400 border border-slate-700 hover:text-white'
              }`}
            >
              <Crosshair className="w-4 h-4" />
              <span>📍 Pin Tool: {coordToolActive ? 'ON' : 'OFF'}</span>
            </button>

            <button
              onClick={() => setCurveToolActive(prev => !prev)}
              className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all shadow-md ${
                curveToolActive
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white border border-cyan-300 ring-2 ring-cyan-400/50'
                  : 'bg-slate-900 text-slate-400 border border-slate-700 hover:text-cyan-300'
              }`}
            >
              <Spline className="w-4 h-4 text-cyan-300" />
              <span>🎨 Curve Tool: {curveToolActive ? 'ACTIVE' : 'OFF'}</span>
            </button>

            <button
              onClick={() => setStyleToolActive(prev => !prev)}
              className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all shadow-md ${
                styleToolActive
                  ? 'bg-gradient-to-r from-amber-700 to-amber-600 text-white border border-amber-300 ring-2 ring-amber-400/50'
                  : 'bg-slate-900 text-slate-400 border border-slate-700 hover:text-amber-300'
              }`}
            >
              <Palette className="w-4 h-4 text-amber-400" />
              <span>🌾 Dirt Road Tool: {styleToolActive ? 'OPEN' : 'OFF'}</span>
            </button>

            <button
              onClick={() => setMarkerDragToolActive(prev => !prev)}
              className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all shadow-md ${
                markerDragToolActive
                  ? 'bg-gradient-to-r from-emerald-600 to-green-600 text-white border border-emerald-300 ring-2 ring-emerald-400/50'
                  : 'bg-slate-900 text-slate-400 border border-slate-700 hover:text-emerald-300'
              }`}
            >
              <Move className="w-4 h-4 text-emerald-400" />
              <span>🎯 Move Markers: {markerDragToolActive ? 'ACTIVE (Drag Marker Pin)' : 'OFF'}</span>
            </button>

            <button
              onClick={() => setShowExistingMarkers(prev => !prev)}
              className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 hover:text-amber-300 flex items-center gap-1.5 transition-colors"
            >
              {showExistingMarkers ? <Eye className="w-3.5 h-3.5 text-amber-400" /> : <EyeOff className="w-3.5 h-3.5 text-slate-500" />}
              <span>Markers: {showExistingMarkers ? 'Visible' : 'Hidden'}</span>
            </button>

            {coordToolActive && (
              <div className="flex items-center gap-1.5 bg-slate-900/90 border border-amber-500/30 px-2.5 py-1.5 rounded-lg text-slate-200">
                <span className="text-[11px] text-amber-400 font-bold">Tag As:</span>
                <select
                  value={selectedNodeToTag}
                  onChange={(e) => setSelectedNodeToTag(e.target.value)}
                  className="bg-slate-950 border border-slate-700 rounded px-2 py-0.5 text-xs text-amber-200 focus:outline-none focus:border-amber-400"
                >
                  {MAP_NODES.map(n => (
                    <option key={n.id} value={n.id}>{n.name} ({n.id})</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Live Hover Readout & Hide Dev Tools Button */}
          <div className="flex items-center gap-3 font-mono text-[11px]">
            {hoverCoords ? (
              <div className="bg-slate-900 border border-amber-500/40 px-3 py-1 rounded-lg text-amber-300 flex items-center gap-2 shadow">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>X: <strong>{hoverCoords.xPercent}%</strong> ({hoverCoords.px1800}px / 3600px: {hoverCoords.px3600})</span>
                <span>•</span>
                <span>Y: <strong>{hoverCoords.yPercent}%</strong> ({hoverCoords.py500}px / 1000px: {hoverCoords.py1000})</span>
              </div>
            ) : (
              <span className="text-slate-500 italic">Hover over map to inspect coordinates</span>
            )}

            <button
              onClick={() => {
                setDevMode(false);
                try {
                  localStorage.setItem('story_gambit_dev_mode', 'false');
                } catch (e) {}
              }}
              className="px-2 py-1 rounded bg-slate-900 border border-slate-700 text-slate-400 hover:text-amber-300 transition-colors flex items-center gap-1"
              title="Hide Developer Tools (Press Ctrl+Shift+M to re-open)"
            >
              <span>✕ Hide Dev Tools</span>
              <kbd className="text-[9px] bg-slate-800 px-1 py-0.5 rounded border border-slate-700 text-slate-400">Ctrl+Shift+M</kbd>
            </button>
          </div>
        </div>
      )}

      {/* Path Curve Tool Dedicated Sub-bar (Visible when devMode and curveToolActive are true) */}
      {devMode && curveToolActive && (
        <div className="fantasy-panel px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 border-cyan-500/50 bg-slate-950/95 shadow-2xl text-xs">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5 bg-slate-900/90 border border-cyan-500/40 px-2.5 py-1.5 rounded-lg text-slate-200">
              <span className="text-[11px] text-cyan-400 font-bold">Selected Route:</span>
              <select
                value={selectedRouteKey}
                onChange={(e) => handleSelectRouteToCurve(e.target.value)}
                className="bg-slate-950 border border-cyan-600/60 rounded px-2 py-0.5 text-xs text-cyan-200 focus:outline-none focus:border-cyan-400 max-w-[260px] sm:max-w-none"
              >
                {allConnectionPairs.map(p => (
                  <option key={p.key} value={p.key}>
                    {p.label} {customCurves[p.key]?.controlPoints?.length ? `(${customCurves[p.key].controlPoints.length} bend)` : '(straight)'}
                  </option>
                ))}
              </select>
            </div>

            {/* Bend count toggle */}
            {(customCurves[selectedRouteKey]?.controlPoints?.length || 1) === 1 ? (
              <button
                onClick={handleAddSecondBend}
                className="px-2.5 py-1.5 rounded-lg bg-cyan-950/70 border border-cyan-500/50 text-cyan-300 hover:bg-cyan-900/80 flex items-center gap-1 transition-all"
                title="Add 2nd control point for S-curves and winding mountain passes"
              >
                <Plus className="w-3.5 h-3.5 text-cyan-400" />
                <span>Add 2nd Bend (S-Curve)</span>
              </button>
            ) : (
              <button
                onClick={handleRemoveSecondBend}
                className="px-2.5 py-1.5 rounded-lg bg-cyan-950/70 border border-cyan-500/50 text-cyan-300 hover:bg-cyan-900/80 flex items-center gap-1 transition-all"
                title="Reduce to 1 control point"
              >
                <Minus className="w-3.5 h-3.5 text-cyan-400" />
                <span>1 Bend (Single Arc)</span>
              </button>
            )}

            {/* Straighten / Reset route */}
            <button
              onClick={handleResetStraight}
              className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 hover:text-red-400 flex items-center gap-1 transition-all"
              title="Reset this path to a straight line"
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
              <span>Straighten Path</span>
            </button>

            <span className="text-[11px] text-cyan-300/80 italic hidden md:inline">
              Tip: Click any path on map to select it, then drag the glowing cyan handle(s) to curve!
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyCurvesJson}
              className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold border border-emerald-400 flex items-center gap-1.5 transition-all shadow-md hover:from-emerald-500 hover:to-teal-500"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Copy Curves JSON</span>
            </button>

            {curveCopiedNotice && (
              <span className="text-emerald-400 font-bold text-[11px] animate-fade-in bg-emerald-950/80 border border-emerald-500/40 px-2 py-1 rounded">
                ✓ {curveCopiedNotice}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Dirt Road & Pathway Styling Tool Dedicated Sub-bar (Visible when devMode and styleToolActive are true) */}
      {devMode && styleToolActive && (
        <div className="fantasy-panel px-4 py-3 flex flex-wrap items-center justify-between gap-4 border-amber-600/50 bg-slate-950/95 shadow-2xl text-xs animate-fade-in">
          <div className="flex flex-wrap items-center gap-3">
            {/* Route Selector Dropdown */}
            <div className="flex items-center gap-1.5 bg-slate-900/90 border border-amber-500/40 px-2.5 py-1.5 rounded-lg text-slate-200">
              <span className="text-[11px] text-amber-400 font-bold">Selected Path:</span>
              <select
                value={selectedRouteKey}
                onChange={(e) => setSelectedRouteKey(e.target.value)}
                className="bg-slate-950 border border-amber-600/60 rounded px-2 py-0.5 text-xs text-amber-200 focus:outline-none focus:border-amber-400 max-w-[240px] sm:max-w-none"
              >
                {allConnectionPairs.map(p => (
                  <option key={p.key} value={p.key}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Filter Enable/Disable Toggle */}
            <button
              onClick={() => setPathStyle(prev => ({ ...prev, filterEnabled: !prev.filterEnabled }))}
              className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all shadow-md ${
                pathStyle.filterEnabled
                  ? 'bg-amber-700 text-amber-100 border border-amber-400'
                  : 'bg-slate-900 text-slate-400 border border-slate-700 hover:text-white'
              }`}
            >
              <span>🌾 Noise Filter: {pathStyle.filterEnabled ? 'ON (Eroded Dirt)' : 'OFF (Clean Smooth)'}</span>
            </button>

            {/* Color Mode Toggle */}
            <button
              onClick={() => setPathStyle(prev => ({
                ...prev,
                colorMode: prev.colorMode === 'custom' ? 'gameplay' : 'custom'
              }))}
              className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 hover:text-amber-300 flex items-center gap-1.5 transition-colors"
            >
              <Palette className="w-3.5 h-3.5 text-amber-400" />
              <span>Color: {pathStyle.colorMode === 'custom' ? 'Custom Trail Colors' : 'Game Status (Green/Yellow)'}</span>
            </button>

            {/* Color Swatches (applied to currently selected route) */}
            {pathStyle.colorMode === 'custom' && (
              <div className="flex items-center gap-1.5 bg-slate-900/90 border border-amber-500/30 px-2.5 py-1 rounded-lg">
                <span className="text-[11px] text-amber-400 font-bold">Path Color:</span>
                {DIRT_PALETTES.map(p => {
                  const currColor = getCurrentRouteColor(selectedRouteKey);
                  return (
                    <button
                      key={p.name}
                      onClick={() => handleSetSelectedRouteColor(p.color, p.track)}
                      className={`w-5 h-5 rounded-full border transition-transform ${
                        currColor === p.color ? 'scale-125 border-white ring-2 ring-amber-400' : 'border-slate-700 hover:scale-110'
                      }`}
                      style={{ backgroundColor: p.color }}
                      title={`${p.name} (Set for selected path)`}
                    />
                  );
                })}
                {/* Custom Color Input for selected route */}
                <label className="flex items-center gap-1 cursor-pointer ml-1 pl-1 border-l border-slate-700" title="Custom color picker for selected path">
                  <input
                    type="color"
                    value={getCurrentRouteColor(selectedRouteKey)}
                    onChange={(e) => handleSetSelectedRouteColor(e.target.value)}
                    className="w-5 h-5 rounded cursor-pointer bg-transparent border-none"
                  />
                </label>

                {/* Apply to All Roads button */}
                <button
                  onClick={() => handleApplyColorToAllRoutes(getCurrentRouteColor(selectedRouteKey))}
                  className="ml-2 px-2 py-0.5 rounded bg-slate-950 border border-amber-500/40 text-[10px] text-amber-300 hover:text-white hover:bg-amber-950 transition-colors"
                  title="Apply current color to ALL paths on the map"
                >
                  All Roads
                </button>
              </div>
            )}

            {/* Road Roughness Slider (Noise Intensity) */}
            {pathStyle.filterEnabled && (
              <div className="flex items-center gap-2 bg-slate-900/90 border border-amber-500/30 px-2.5 py-1 rounded-lg text-slate-300">
                <span className="text-[11px] text-amber-400 font-bold">Roughness:</span>
                <input
                  type="range"
                  min="1"
                  max="10"
                  step="0.5"
                  value={pathStyle.noiseIntensity}
                  onChange={(e) => setPathStyle(prev => ({ ...prev, noiseIntensity: parseFloat(e.target.value) }))}
                  className="w-20 accent-amber-500 cursor-pointer"
                />
                <span className="font-mono text-[10px] text-amber-300">{pathStyle.noiseIntensity}</span>
              </div>
            )}

            {/* Path Width Slider */}
            <div className="flex items-center gap-2 bg-slate-900/90 border border-amber-500/30 px-2.5 py-1 rounded-lg text-slate-300">
              <span className="text-[11px] text-amber-400 font-bold">Width:</span>
              <input
                type="range"
                min="1.5"
                max="8"
                step="0.5"
                value={pathStyle.strokeWidth}
                onChange={(e) => setPathStyle(prev => ({ ...prev, strokeWidth: parseFloat(e.target.value) }))}
                className="w-18 accent-amber-500 cursor-pointer"
              />
              <span className="font-mono text-[10px] text-amber-300">{pathStyle.strokeWidth}px</span>
            </div>

            {/* Dual Track Rut Toggle */}
            <button
              onClick={() => setPathStyle(prev => ({ ...prev, showTracks: !prev.showTracks }))}
              className={`px-2.5 py-1.5 rounded-lg border transition-all ${
                pathStyle.showTracks
                  ? 'bg-amber-950/80 border-amber-500 text-amber-300'
                  : 'bg-slate-900 border-slate-700 text-slate-500'
              }`}
              title="Show trodden wheel ruts along center of path"
            >
              Wagon Ruts: {pathStyle.showTracks ? 'ON' : 'OFF'}
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyPathColorsJson}
              className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold border border-emerald-400 flex items-center gap-1.5 transition-all shadow-md hover:from-emerald-500 hover:to-teal-500"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Copy Path Colors JSON</span>
            </button>

            {colorsCopiedNotice && (
              <span className="text-emerald-400 font-bold text-[11px] animate-fade-in bg-emerald-950/80 border border-emerald-500/40 px-2 py-1 rounded">
                ✓ {colorsCopiedNotice}
              </span>
            )}

            <button
              onClick={() => setPathStyle({ ...DEFAULT_PATH_STYLE })}
              className="px-2.5 py-1 rounded bg-slate-900 border border-slate-700 text-slate-400 hover:text-amber-300 transition-colors"
            >
              Reset
            </button>
          </div>
        </div>
      )}

      {/* Marker Reposition Dragging Tool Dedicated Sub-bar (Visible when devMode and markerDragToolActive are true) */}
      {devMode && markerDragToolActive && (
        <div className="fantasy-panel px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 border-emerald-500/50 bg-slate-950/95 shadow-2xl text-xs animate-fade-in">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-emerald-300 font-bold flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <span>🎯 Move Markers Mode: Drag any marker into place. (Map pan drag is disabled)</span>
            </span>

            {/* Quick Map Pan Navigation Buttons */}
            <div className="flex items-center gap-1 bg-slate-900 border border-slate-700 rounded-lg p-1">
              <span className="text-[10px] text-slate-400 uppercase font-bold px-1.5">Pan View:</span>
              <button
                type="button"
                onClick={() => containerRef.current?.scrollTo({ left: 0, behavior: 'smooth' })}
                className="px-2 py-0.5 rounded bg-slate-800 hover:bg-emerald-800 text-amber-200 text-[11px] font-medium transition-colors"
                title="Scroll to Oakwood Lowlands"
              >
                Oakwood
              </button>
              <button
                type="button"
                onClick={() => containerRef.current?.scrollTo({ left: 450, behavior: 'smooth' })}
                className="px-2 py-0.5 rounded bg-slate-800 hover:bg-emerald-800 text-blue-200 text-[11px] font-medium transition-colors"
                title="Scroll to Arcane Coast"
              >
                Coast
              </button>
              <button
                type="button"
                onClick={() => containerRef.current?.scrollTo({ left: 900, behavior: 'smooth' })}
                className="px-2 py-0.5 rounded bg-slate-800 hover:bg-emerald-800 text-emerald-200 text-[11px] font-medium transition-colors"
                title="Scroll to Gilded Mountains"
              >
                Mountains
              </button>
              <button
                type="button"
                onClick={() => containerRef.current?.scrollTo({ left: 1400, behavior: 'smooth' })}
                className="px-2 py-0.5 rounded bg-slate-800 hover:bg-emerald-800 text-red-200 text-[11px] font-medium transition-colors"
                title="Scroll to Nether Summit"
              >
                Nether
              </button>
            </div>

            {draggingMarkerId && (
              <span className="bg-slate-900 border border-emerald-500/40 px-2.5 py-1 rounded text-emerald-300 font-mono text-[11px] animate-pulse">
                Moving: <strong>{MAP_NODES.find(n => n.id === draggingMarkerId)?.name}</strong> ({(customMarkerPositions[draggingMarkerId]?.x ?? MAP_NODES.find(n => n.id === draggingMarkerId)?.x)}%, {(customMarkerPositions[draggingMarkerId]?.y ?? MAP_NODES.find(n => n.id === draggingMarkerId)?.y)}%)
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyMarkerPositionsJson}
              className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold border border-emerald-400 flex items-center gap-1.5 transition-all shadow-md hover:from-emerald-500 hover:to-teal-500"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Copy Marker Coords JSON</span>
            </button>

            {markerPositionsCopiedNotice && (
              <span className="text-emerald-400 font-bold text-[11px] animate-fade-in bg-emerald-950/80 border border-emerald-500/40 px-2 py-1 rounded">
                ✓ {markerPositionsCopiedNotice}
              </span>
            )}

            <button
              onClick={handleResetMarkerPositions}
              className="px-2.5 py-1 rounded bg-slate-900 border border-slate-700 text-slate-400 hover:text-red-400 transition-colors"
            >
              Reset to Defaults
            </button>
          </div>
        </div>
      )}

      {/* Main Grid: Scrollable Drag Map (2 Cols on Desktop) & Inspector Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* DRAGGABLE & SCROLLABLE EXPANSIVE MAP CONTAINER */}
        <div
          ref={containerRef}
          onMouseDown={markerDragToolActive ? undefined : handleMouseDown}
          onMouseLeave={markerDragToolActive ? undefined : handleMouseLeaveOrUp}
          onMouseUp={markerDragToolActive ? undefined : handleMouseLeaveOrUp}
          onMouseMove={markerDragToolActive ? undefined : handleMouseMove}
          onTouchStart={markerDragToolActive ? undefined : handleTouchStart}
          onTouchEnd={markerDragToolActive ? undefined : handleMouseLeaveOrUp}
          onTouchMove={markerDragToolActive ? undefined : handleTouchMove}
          className={`lg:col-span-2 fantasy-panel parchment-bg relative min-h-[460px] sm:min-h-[520px] overflow-y-hidden border-amber-500/30 select-none ${
            markerDragToolActive ? 'overflow-x-hidden cursor-default' : 'overflow-x-auto cursor-grab active:cursor-grabbing'
          }`}
        >
          {/* Internal Expansive Canvas (1800px Width) with User's Custom Map Artwork */}
          <div
            ref={canvasRef}
            onClick={handleCanvasClick}
            style={{
              backgroundImage: "url('/assets/map/custom_map.png')",
              backgroundSize: '100% 100%',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat'
            }}
            className="relative w-[1800px] h-[500px] shadow-2xl rounded-xl border border-amber-500/40 overflow-hidden cursor-crosshair"
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

            {/* SVG Color-Coded Curved Connection Routes & Control Handles */}
            {showExistingMarkers && (
              <svg viewBox="0 0 1800 500" className="absolute inset-0 w-full h-full pointer-events-none">
                <defs>
                  {/* SVG Dirt Road Noise Filter (Displacement of stroke edges to appear like eroded dirt road) */}
                  {pathStyle.filterEnabled && (
                    <filter id="dirtRoadNoiseFilter" x="-20%" y="-20%" width="140%" height="140%">
                      <feTurbulence
                        type="fractalNoise"
                        baseFrequency={pathStyle.roughness || 0.05}
                        numOctaves="4"
                        result="noise"
                      />
                      <feDisplacementMap
                        in="SourceGraphic"
                        in2="noise"
                        scale={pathStyle.noiseIntensity || 4.5}
                        xChannelSelector="R"
                        yChannelSelector="G"
                        result="displaced"
                      />
                    </filter>
                  )}
                </defs>

                {MAP_NODES.map(node => {
                  return node.connectedTo.map(targetId => {
                    const targetNode = MAP_NODES.find(n => n.id === targetId);
                    if (!targetNode) return null;
                    if (node.id > targetId) return null;

                    const pairKey = getPathPairKey(node.id, targetId);
                    const isSelectedRoute = (curveToolActive || styleToolActive) && selectedRouteKey === pairKey;
                    const pathD = generateSvgPathData(node, targetNode, customCurves[pairKey]);

                    const nodeUnlocked = isNodeAccessible(node);
                    const targetUnlocked = isNodeAccessible(targetNode);

                    // Secret nodes and their pathways are hidden until unlocked
                    if (node.isSecret && !nodeUnlocked) return null;
                    if (targetNode.isSecret && !targetUnlocked) return null;

                    const isSafeBothVisited = nodeUnlocked && targetUnlocked;
                    const isAvailableUndiscovered = (nodeUnlocked || targetUnlocked) && !isSafeBothVisited;

                    const statusStrokeColor = isSafeBothVisited ? '#22c55e' : isAvailableUndiscovered ? '#eab308' : '#475569';
                    const statusStrokeDash = isSafeBothVisited ? 'none' : isAvailableUndiscovered ? '6 3' : '3 3';

                    const isCustomColor = pathStyle.colorMode === 'custom';
                    const routeCustomCfg = pathStyle.routeColors?.[pairKey];
                    const routePathColor = routeCustomCfg?.color || pathStyle.defaultPathColor;
                    const routeTrackColor = routeCustomCfg?.trackColor || pathStyle.defaultTrackColor;

                    let mainStrokeColor = isSelectedRoute ? '#38bdf8' : statusStrokeColor;
                    let mainStrokeWidth = isSelectedRoute ? (pathStyle.strokeWidth + 1.5) : pathStyle.strokeWidth;
                    let mainStrokeDash = isSelectedRoute ? 'none' : statusStrokeDash;
                    let mainOpacity = 1;

                    if (isCustomColor && !isSelectedRoute) {
                      mainStrokeColor = routePathColor;
                      if (!nodeUnlocked && !targetUnlocked) {
                        mainOpacity = 0.35;
                        mainStrokeDash = '4 4';
                      } else if (!isSafeBothVisited) {
                        mainOpacity = 0.75;
                        mainStrokeDash = '6 3';
                      } else {
                        mainOpacity = pathStyle.opacity || 0.88;
                        mainStrokeDash = 'none';
                      }
                    }

                    return (
                      <g key={pairKey}>
                        {/* Glowing halo for selected route in curve tool or dirt style tool */}
                        {isSelectedRoute && (
                          <path
                            d={pathD}
                            fill="none"
                            stroke="#06b6d4"
                            strokeWidth={mainStrokeWidth + 6}
                            strokeOpacity="0.55"
                            className="animate-pulse"
                          />
                        )}

                        {/* Visual Curved Route Path (with optional dirt noise filter) */}
                        <path
                          d={pathD}
                          fill="none"
                          stroke={mainStrokeColor}
                          strokeWidth={mainStrokeWidth}
                          strokeDasharray={mainStrokeDash}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeOpacity={mainOpacity}
                          filter={pathStyle.filterEnabled ? "url(#dirtRoadNoiseFilter)" : undefined}
                        />

                        {/* Trodden Inner Wagon Rut / Dual Track (when custom color and showTracks is ON) */}
                        {isCustomColor && pathStyle.showTracks && !isSelectedRoute && (
                          <path
                            d={pathD}
                            fill="none"
                            stroke={routeTrackColor}
                            strokeWidth={Math.max(1, pathStyle.strokeWidth * 0.35)}
                            strokeDasharray="6 3"
                            strokeLinecap="round"
                            strokeOpacity={mainOpacity * 0.85}
                            filter={pathStyle.filterEnabled ? "url(#dirtRoadNoiseFilter)" : undefined}
                          />
                        )}

                        {/* Interactive Click Target to select path when curve tool OR dirt style tool is active */}
                        {(curveToolActive || styleToolActive) && (
                          <path
                            d={pathD}
                            fill="none"
                            stroke="transparent"
                            strokeWidth="24"
                            className="pointer-events-auto cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedRouteKey(pairKey);
                            }}
                          />
                        )}
                      </g>
                    );
                  });
                })}

                {/* DRAGGABLE CURVE CONTROL HANDLES & TETHERS (Rendered when Curve Tool is active) */}
                {curveToolActive && (() => {
                  const selectedPair = allConnectionPairs.find(p => p.key === selectedRouteKey);
                  if (!selectedPair) return null;

                  const currentControlPoints = getRouteControlPoints(selectedRouteKey);
                  const n1 = selectedPair.node1;
                  const n2 = selectedPair.node2;

                  return (
                    <g key={`curve-controls-${selectedRouteKey}`} className="z-50">
                      {/* Dotted tether line from Node 1 to first control point */}
                      {currentControlPoints.length > 0 && (
                        <line
                          x1={(n1.x / 100) * 1800}
                          y1={(n1.y / 100) * 500}
                          x2={(currentControlPoints[0].x / 100) * 1800}
                          y2={(currentControlPoints[0].y / 100) * 500}
                          stroke="#06b6d4"
                          strokeWidth="2"
                          strokeDasharray="4 4"
                          className="pointer-events-none"
                        />
                      )}

                      {/* Tether between CP1 and CP2 if 2 handles */}
                      {currentControlPoints.length === 2 && (
                        <line
                          x1={(currentControlPoints[0].x / 100) * 1800}
                          y1={(currentControlPoints[0].y / 100) * 500}
                          x2={(currentControlPoints[1].x / 100) * 1800}
                          y2={(currentControlPoints[1].y / 100) * 500}
                          stroke="#06b6d4"
                          strokeWidth="2"
                          strokeDasharray="4 4"
                          className="pointer-events-none"
                        />
                      )}

                      {/* Tether from last control point to Node 2 */}
                      {currentControlPoints.length > 0 && (
                        <line
                          x1={(currentControlPoints[currentControlPoints.length - 1].x / 100) * 1800}
                          y1={(currentControlPoints[currentControlPoints.length - 1].y / 100) * 500}
                          x2={(n2.x / 100) * 1800}
                          y2={(n2.y / 100) * 500}
                          stroke="#06b6d4"
                          strokeWidth="2"
                          strokeDasharray="4 4"
                          className="pointer-events-none"
                        />
                      )}

                      {/* Interactive Drag Handles */}
                      {currentControlPoints.map((cp, idx) => {
                        const px = (cp.x / 100) * 1800;
                        const py = (cp.y / 100) * 500;
                        const isThisDragging = draggingHandle?.routeKey === selectedRouteKey && draggingHandle?.handleIndex === idx;

                        return (
                          <g
                            key={`handle-${idx}`}
                            className="pointer-events-auto cursor-grab active:cursor-grabbing"
                            onMouseDown={(e) => {
                              e.stopPropagation();
                              e.preventDefault();
                              setDraggingHandle({ routeKey: selectedRouteKey, handleIndex: idx });
                            }}
                          >
                            {/* Glowing Aura */}
                            <circle
                              cx={px}
                              cy={py}
                              r={isThisDragging ? 22 : 16}
                              fill="rgba(6, 182, 212, 0.35)"
                              stroke="#06b6d4"
                              strokeWidth="2"
                              className="animate-pulse"
                            />
                            {/* Inner Circle Pin */}
                            <circle
                              cx={px}
                              cy={py}
                              r={isThisDragging ? 12 : 9}
                              fill="#38bdf8"
                              stroke="#ffffff"
                              strokeWidth="2.5"
                            />
                            {/* Number label */}
                            <text
                              x={px}
                              y={py + 3.5}
                              textAnchor="middle"
                              fontSize="10"
                              fontWeight="bold"
                              fill="#0f172a"
                              className="select-none pointer-events-none font-mono"
                            >
                              {idx + 1}
                            </text>
                            {/* Coordinates Tooltip Tag */}
                            <text
                              x={px}
                              y={py - 16}
                              textAnchor="middle"
                              fontSize="11"
                              fontWeight="bold"
                              fill="#38bdf8"
                              stroke="#020617"
                              strokeWidth="3.5"
                              paintOrder="stroke"
                              className="select-none pointer-events-none font-mono"
                            >
                              Bend {idx + 1} ({cp.x}%, {cp.y}%)
                            </text>
                          </g>
                        );
                      })}
                    </g>
                  );
                })()}
              </svg>
            )}

            {/* INTERACTIVE PINNED COORDINATE CALIBRATION TARGETS */}
            {pinnedCoords.map((pin, i) => (
              <div
                key={pin.id}
                style={{ left: `${pin.xPercent}%`, top: `${pin.yPercent}%` }}
                className="absolute -translate-x-1/2 -translate-y-1/2 z-40 pointer-events-none flex flex-col items-center animate-fade-in"
              >
                <div className="relative flex items-center justify-center">
                  <span className="w-8 h-8 rounded-full bg-red-500/40 border-2 border-red-500 animate-ping absolute" />
                  <div className="w-7 h-7 rounded-full bg-red-600 border-2 border-white shadow-2xl flex items-center justify-center text-white text-xs font-bold z-10">
                    {i + 1}
                  </div>
                </div>
                <div className="bg-slate-950/95 border border-amber-400 px-2 py-0.5 rounded text-[10px] font-bold text-amber-300 shadow whitespace-nowrap mt-1">
                  {pin.nodeName} ({pin.xPercent}%, {pin.yPercent}%)
                </div>
              </div>
            ))}

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

            {/* Node Markers Grid (Toggleable so you can view clean artwork unobstructed) */}
            {showExistingMarkers && MAP_NODES.filter(node => !node.isSecret || isNodeAccessible(node)).map(node => {
              const IconComp = ICON_MAP[node.icon] || Shield;
              const unlocked = isNodeAccessible(node);
              const isCurrent = node.id === gameState.currentMapNodeId;
              const isSelected = node.id === selectedNodeId;
              const isCleared = completedBattles.includes(node.id);
              const heroAtNode = wanderingHeroes.find(h => h.nodeId === node.id && !followers.some(f => f.id === h.id));
              const nodeAffixKey = (gameState.nodeAffixes || {})[node.id];
              const nodeAffix = nodeAffixKey ? NODE_AFFIXES[nodeAffixKey] : null;

              const markerPos = customMarkerPositions[node.id] || DEFAULT_MARKER_POSITIONS[node.id] || { x: node.x, y: node.y };
              const isViewOnly = !markerDragToolActive && (curveToolActive || styleToolActive);
              const isThisMarkerDragging = draggingMarkerId === node.id;

              return (
                <button
                  key={node.id}
                  type="button"
                  draggable={false}
                  onDragStart={(e) => e.preventDefault()}
                  disabled={isTraveling || isViewOnly}
                  onClick={() => {
                    if (!markerDragToolActive) handleNodeClick(node);
                  }}
                  onMouseDown={(e) => {
                    if (markerDragToolActive) {
                      e.stopPropagation();
                      e.preventDefault();
                      setDraggingMarkerId(node.id);
                    }
                  }}
                  style={{ left: `${markerPos.x}%`, top: `${markerPos.y}%` }}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 group transition-all duration-200 z-20 focus:outline-none ${
                    isViewOnly
                      ? 'pointer-events-none opacity-80'
                      : markerDragToolActive
                      ? 'pointer-events-auto cursor-grab active:cursor-grabbing z-50 hover:scale-115'
                      : ''
                  } ${isThisMarkerDragging ? 'scale-125 z-50' : ''}`}
                >
                  {/* Node Outer Circle */}
                  <div className={`w-13 h-13 rounded-full flex items-center justify-center border-2 transition-transform duration-300 shadow-2xl relative ${
                    isThisMarkerDragging
                      ? 'bg-emerald-600 border-white text-white ring-4 ring-emerald-400/80 animate-pulse'
                      : markerDragToolActive
                      ? 'bg-slate-900 border-emerald-400 text-emerald-300 ring-2 ring-emerald-500/40'
                      : isCurrent
                      ? 'bg-amber-500 border-white text-slate-950 scale-125'
                      : isSelected
                      ? 'bg-slate-900 border-amber-400 text-amber-300 scale-110'
                      : node.isSecret
                      ? 'bg-purple-950/90 border-purple-400 text-purple-300 hover:scale-110 shadow-purple-900/50'
                      : unlocked
                      ? (isCleared || node.isSafeSpot ? 'bg-slate-900 border-emerald-500 text-emerald-400 hover:scale-110' : 'bg-slate-900 border-amber-500/60 text-amber-400 hover:scale-110')
                      : 'bg-slate-950/90 border-slate-800 text-slate-700 cursor-not-allowed'
                  }`}>
                    {markerDragToolActive ? <Move className="w-6 h-6 text-emerald-300" /> : unlocked ? <IconComp className="w-6 h-6" /> : <Lock className="w-5 h-5" />}

                    {/* Drag indicator icon in drag mode */}
                    {markerDragToolActive && (
                      <span className="absolute -top-1.5 -left-1.5 w-4 h-4 bg-emerald-500 rounded-full border border-slate-950 flex items-center justify-center text-[9px] text-slate-950 font-bold">
                        ✥
                      </span>
                    )}

                    {/* Cleared or Safe Badge Indicator */}
                    {!markerDragToolActive && unlocked && (isCleared || node.isSafeSpot) && (
                      <span className="absolute -top-1 -right-1 w-4.5 h-4.5 bg-emerald-500 rounded-full border border-slate-950 flex items-center justify-center text-[10px] text-slate-950 font-bold" title={isCleared ? "Battle Defeated & Cleared" : "Safe Spot"}>
                        ✓
                      </span>
                    )}

                    {/* Node Affix Indicator */}
                    {!markerDragToolActive && unlocked && nodeAffix && (
                      <span className="absolute -top-1 -left-1 px-1 py-0.5 bg-amber-500/90 rounded-full border border-amber-300 text-[8px] text-slate-950 font-bold shadow" title={nodeAffix.name}>
                        ⚡
                      </span>
                    )}

                    {/* Wandering Hero Badge Indicator */}
                    {!markerDragToolActive && unlocked && heroAtNode && (
                      <span className="absolute -bottom-1 -right-1 px-1.5 py-0.5 bg-purple-600 rounded-full border border-purple-300 text-[9px] text-white font-bold animate-pulse flex items-center gap-0.5" title={`${heroAtNode.name} resting here (${heroAtNode.turnsRemaining} turns left)`}>
                        👤 {heroAtNode.turnsRemaining}t
                      </span>
                    )}
                  </div>

                  {/* Node Label Tooltip with Live Coordinates in Drag Mode */}
                  <div className={`mt-1.5 px-2.5 py-0.5 rounded text-[11px] font-semibold tracking-wide whitespace-nowrap border transition-all ${
                    isThisMarkerDragging
                      ? 'bg-emerald-600 text-white border-white shadow-xl font-bold font-mono'
                      : markerDragToolActive
                      ? 'bg-slate-950/95 text-emerald-300 border-emerald-500/50 font-mono font-bold'
                      : isCurrent
                      ? 'bg-amber-500 text-slate-950 border-amber-300 shadow-md font-bold'
                      : isSelected
                      ? 'bg-slate-900 text-amber-200 border-amber-400'
                      : node.isSecret
                      ? 'bg-purple-950/90 text-purple-200 border-purple-500/50'
                      : 'bg-slate-950/90 text-slate-300 border-slate-800'
                  }`}>
                    {markerDragToolActive ? `${node.name} (${markerPos.x}%, ${markerPos.y}%)` : (
                      <>
                        {node.isSecret ? '✨ ' : ''}{node.name} {heroAtNode ? '👤' : ''} {isCleared ? '✓' : ''}
                      </>
                    )}
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

              {selectedNode.isSecret && (
                <span className="text-[11px] bg-purple-500/20 text-purple-300 px-2.5 py-1 rounded border border-purple-500/40 font-bold flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
                  <span>✨ Secret Uncharted Realm Node</span>
                </span>
              )}

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

            {/* Active Node Affix Modifier Banner */}
            {(gameState.nodeAffixes || {})[selectedNode.id] && (
              <div className="mb-4 p-3 rounded-xl bg-slate-900/90 border border-amber-500/40 space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300">
                  <Zap className="w-4 h-4 text-amber-400 animate-pulse" />
                  <span>Realm Modifier: {NODE_AFFIXES[(gameState.nodeAffixes || {})[selectedNode.id]]?.name}</span>
                </div>
                <p className="text-xs text-slate-300 leading-normal">
                  {NODE_AFFIXES[(gameState.nodeAffixes || {})[selectedNode.id]]?.desc}
                </p>
              </div>
            )}

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

      {/* Pinned Coordinates Log Panel (Visible when devMode and coordToolActive are true) */}
      {devMode && coordToolActive && (
        <div className="fantasy-panel p-5 border-amber-500/40 bg-slate-950/90 shadow-2xl space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-amber-500/20 pb-3">
            <div className="flex items-center gap-2">
              <Crosshair className="w-5 h-5 text-red-500 animate-pulse" />
              <div>
                <h3 className="text-base font-bold font-serif text-amber-200">
                  Calibration Log: Pinned Coordinates ({pinnedCoords.length} Points Marked)
                </h3>
                <p className="text-xs text-slate-400">
                  Click anywhere on your custom map above to drop a coordinate pin. When done, click Copy All and paste them into the chat!
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              {pinnedCoords.length > 0 && (
                <>
                  <button
                    onClick={handleCopyAllPins}
                    className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-950 bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 shadow-lg flex items-center gap-1.5 transition-transform hover:scale-105"
                  >
                    <Copy className="w-4 h-4 text-slate-950" />
                    <span>📋 Copy All Coordinates to Clipboard</span>
                  </button>

                  <button
                    onClick={() => setPinnedCoords([])}
                    className="px-3 py-2 rounded-xl text-xs font-semibold text-red-400 hover:text-red-300 hover:bg-red-950/50 border border-red-500/30 flex items-center gap-1.5 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Clear All</span>
                  </button>
                </>
              )}
            </div>
          </div>

          {copiedNotice && (
            <div className="p-2.5 rounded-lg bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs font-mono font-bold animate-fade-in flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>{copiedNotice}</span>
            </div>
          )}

          {pinnedCoords.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs border border-dashed border-slate-800 rounded-xl bg-slate-900/30 space-y-1">
              <p className="font-semibold text-slate-400">No calibration pins dropped yet.</p>
              <p>Click any town, ruin, bridge, mountain, or landmark on your custom map above to log its exact coordinate.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-amber-400/90 text-[11px] uppercase">
                    <th className="py-2 px-3">#</th>
                    <th className="py-2 px-3">Target Node</th>
                    <th className="py-2 px-3">Node ID</th>
                    <th className="py-2 px-3">Percentage (X%, Y%)</th>
                    <th className="py-2 px-3">1800×500 px</th>
                    <th className="py-2 px-3">3600×1000 px (Original)</th>
                    <th className="py-2 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900">
                  {pinnedCoords.map((pin, idx) => (
                    <tr key={pin.id} className="hover:bg-slate-900/50 transition-colors">
                      <td className="py-2 px-3 text-red-400 font-bold">{idx + 1}</td>
                      <td className="py-2 px-3 font-serif font-bold text-amber-200">{pin.nodeName}</td>
                      <td className="py-2 px-3 text-slate-400">{pin.nodeId}</td>
                      <td className="py-2 px-3 text-emerald-400 font-bold">x: {pin.xPercent}%, y: {pin.yPercent}%</td>
                      <td className="py-2 px-3 text-blue-300">({pin.px1800}px, {pin.py500}px)</td>
                      <td className="py-2 px-3 text-purple-300">({pin.px3600}px, {pin.py1000}px)</td>
                      <td className="py-2 px-3 text-right">
                        <button
                          onClick={() => handleRemovePin(pin.id)}
                          className="text-slate-500 hover:text-red-400 p-1 transition-colors"
                          title="Delete Pin"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
