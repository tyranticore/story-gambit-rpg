// ==============================================================================
// MAP EDITOR TOOLS - COMPLETE CODE BACKUP
// ==============================================================================
// This file is a complete backup of the 4 Overland Map Developer Tools:
//   1. 📍 Pin Calibration Tool (Hover coords, click to drop pins, export pin list)
//   2. 🎨 Path Curve Tool (Bezier drag handles, 1-bend / 2-bend S-curves, export curves JSON)
//   3. 🌾 Dirt Road Styling Tool (Noise displacement, earth palettes, wagon ruts, export colors JSON)
//   4. 🎯 Marker Reposition Drag Tool (Drag marker pins without altering road endpoints, export marker coords JSON)
//
// The permanent calibrated data produced by these tools is stored in:
//   - src/data/mapPaths.js (DEFAULT_MAP_PATHS, DEFAULT_PATH_COLORS, DEFAULT_MARKER_POSITIONS)
// ==============================================================================

import React, { useRef, useState, useEffect } from 'react';
import { MAP_NODES } from '../data/mapNodes';
import { 
  DEFAULT_MAP_PATHS, 
  DEFAULT_PATH_COLORS, 
  DEFAULT_MARKER_POSITIONS, 
  DEFAULT_PATH_STYLE,
  getPathPairKey, 
  generateSvgPathData 
} from '../data/mapPaths';
import { Crosshair, Spline, Palette, Move, Eye, EyeOff, Copy, Trash2, CheckCircle } from 'lucide-react';

/*
--------------------------------------------------------------------------------
PART 1: STATE DECLARATIONS
--------------------------------------------------------------------------------
*/

export const useMapEditorState = (canvasRef, containerRef) => {
  // Master Dev Mode Toggle (HotKey: Ctrl + Shift + M)
  const [devMode, setDevMode] = useState(() => {
    try {
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        if (params.get('editor') === 'true' || params.get('dev') === 'true') return true;
        const stored = localStorage.getItem('story_gambit_dev_mode');
        if (stored !== null) return stored === 'true';
      }
    } catch (e) {}
    return Boolean(import.meta.env?.DEV);
  });

  // Hotkey listener (Ctrl + Shift + M)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'M' || e.key === 'm')) {
        e.preventDefault();
        setDevMode(prev => {
          const next = !prev;
          try { localStorage.setItem('story_gambit_dev_mode', String(next)); } catch (err) {}
          return next;
        });
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // 1. PIN TOOL STATE
  const [coordToolActive, setCoordToolActive] = useState(false);
  const [hoverCoords, setHoverCoords] = useState(null);
  const [pinnedCoords, setPinnedCoords] = useState([]);
  const [selectedNodeToTag, setSelectedNodeToTag] = useState('oakhaven');
  const [copiedNotice, setCopiedNotice] = useState('');
  const [showExistingMarkers, setShowExistingMarkers] = useState(true);

  // 2. CURVE TOOL STATE
  const [curveToolActive, setCurveToolActive] = useState(false);
  const [customCurves, setCustomCurves] = useState(() => {
    try {
      const stored = localStorage.getItem('story_gambit_custom_paths');
      if (stored) return { ...DEFAULT_MAP_PATHS, ...JSON.parse(stored) };
    } catch (e) {}
    return { ...DEFAULT_MAP_PATHS };
  });
  const [selectedRouteKey, setSelectedRouteKey] = useState('oakhaven__whispering_woods');
  const [draggingHandle, setDraggingHandle] = useState(null); // { routeKey, handleIndex }
  const [curveCopiedNotice, setCurveCopiedNotice] = useState('');

  // 3. DIRT ROAD TOOL STATE
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
    } catch (e) {}
    return { ...DEFAULT_PATH_STYLE, routeColors: { ...DEFAULT_PATH_COLORS } };
  });

  // 4. MARKER DRAG TOOL STATE
  const [markerDragToolActive, setMarkerDragToolActive] = useState(false);
  const [draggingMarkerId, setDraggingMarkerId] = useState(null);
  const [markerPositionsCopiedNotice, setMarkerPositionsCopiedNotice] = useState('');
  const [customMarkerPositions, setCustomMarkerPositions] = useState(() => {
    try {
      const stored = localStorage.getItem('story_gambit_custom_marker_coords');
      if (stored) return { ...DEFAULT_MARKER_POSITIONS, ...JSON.parse(stored) };
    } catch (e) {}
    return { ...DEFAULT_MARKER_POSITIONS };
  });

  // Reset tools when devMode is deactivated
  useEffect(() => {
    if (!devMode) {
      setCoordToolActive(false);
      setCurveToolActive(false);
      setStyleToolActive(false);
      setMarkerDragToolActive(false);
    }
  }, [devMode]);

  // Sync customCurves & pathStyle & customMarkerPositions to localStorage
  useEffect(() => {
    try { localStorage.setItem('story_gambit_custom_paths', JSON.stringify(customCurves)); } catch (e) {}
  }, [customCurves]);

  useEffect(() => {
    try { localStorage.setItem('story_gambit_path_style', JSON.stringify(pathStyle)); } catch (e) {}
  }, [pathStyle]);

  useEffect(() => {
    try { localStorage.setItem('story_gambit_custom_marker_coords', JSON.stringify(customMarkerPositions)); } catch (e) {}
  }, [customMarkerPositions]);

  // Global window listeners for dragging curve handles
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
        next[draggingHandle.routeKey] = { ...curve, controlPoints: updatedPoints };
        return next;
      });
    };

    const handleWindowMouseUp = () => setDraggingHandle(null);
    window.addEventListener('mousemove', handleWindowMouseMove);
    window.addEventListener('mouseup', handleWindowMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleWindowMouseMove);
      window.removeEventListener('mouseup', handleWindowMouseUp);
    };
  }, [draggingHandle]);

  // Global window listeners for dragging marker pins
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

    const handleWindowMouseUp = () => setDraggingMarkerId(null);
    window.addEventListener('mousemove', handleWindowMouseMove);
    window.addEventListener('mouseup', handleWindowMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleWindowMouseMove);
      window.removeEventListener('mouseup', handleWindowMouseUp);
    };
  }, [draggingMarkerId]);

  return {
    devMode, setDevMode,
    coordToolActive, setCoordToolActive,
    hoverCoords, setHoverCoords,
    pinnedCoords, setPinnedCoords,
    selectedNodeToTag, setSelectedNodeToTag,
    copiedNotice, setCopiedNotice,
    showExistingMarkers, setShowExistingMarkers,
    curveToolActive, setCurveToolActive,
    customCurves, setCustomCurves,
    selectedRouteKey, setSelectedRouteKey,
    draggingHandle, setDraggingHandle,
    curveCopiedNotice, setCurveCopiedNotice,
    styleToolActive, setStyleToolActive,
    colorsCopiedNotice, setColorsCopiedNotice,
    pathStyle, setPathStyle,
    markerDragToolActive, setMarkerDragToolActive,
    draggingMarkerId, setDraggingMarkerId,
    markerPositionsCopiedNotice, setMarkerPositionsCopiedNotice,
    customMarkerPositions, setCustomMarkerPositions
  };
};

/*
--------------------------------------------------------------------------------
PART 2: HELPER FUNCTIONS
--------------------------------------------------------------------------------
*/

export const getRouteControlPoints = (routeKey, customCurves, allConnectionPairs) => {
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

export const handleCopyCurvesJson = (customCurves, setCurveCopiedNotice) => {
  navigator.clipboard.writeText(JSON.stringify(customCurves, null, 2));
  setCurveCopiedNotice('Copied all custom paths JSON to clipboard!');
  setTimeout(() => setCurveCopiedNotice(''), 3000);
};

export const handleCopyPathColorsJson = (pathStyle, setColorsCopiedNotice) => {
  const exportData = pathStyle.routeColors || {};
  navigator.clipboard.writeText(JSON.stringify(exportData, null, 2));
  setColorsCopiedNotice('Copied path colors JSON to clipboard!');
  setTimeout(() => setColorsCopiedNotice(''), 3000);
};

export const handleCopyMarkerPositionsJson = (customMarkerPositions, setMarkerPositionsCopiedNotice) => {
  const output = {};
  MAP_NODES.forEach(n => {
    const pos = customMarkerPositions[n.id] || DEFAULT_MARKER_POSITIONS[n.id] || { x: n.x, y: n.y };
    output[n.id] = { name: n.name, x: pos.x, y: pos.y };
  });
  navigator.clipboard.writeText(JSON.stringify(output, null, 2));
  setMarkerPositionsCopiedNotice('Copied all marker coordinates JSON to clipboard!');
  setTimeout(() => setMarkerPositionsCopiedNotice(''), 3000);
};
