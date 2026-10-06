# Overland Map Developer Tools - Complete Archive & Reference

This document contains the complete, unabridged source code for all 4 developer map calibration tools created for the Overland Map in **Story Gambit RPG**:
1. **📍 Pin Calibration Tool**: Tag coordinate percentages on the map canvas, live cursor tracker, and clipboard export.
2. **🎨 Path Curve Tool**: Interactive draggable Bezier curve control handles (1-bend & 2-bend S-curves) with live SVG tether lines and JSON exporter.
3. **🌾 Dirt Road Tool**: SVG fractal turbulence filter controls (roughness, intensity), palette swatches, custom hex color pickers, wagon track ruts, and color JSON exporter.
4. **🎯 Move Markers Tool**: Interactive pin dragging to align marker pins with background art while road path coordinates remain locked, viewport jump buttons, and marker JSON exporter.

---

## 1. Top Header Toolbar JSX

```jsx
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
```

---

## 2. Curve Tool Sub-bar JSX

```jsx
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
          <Plus className="w-3.5 h-3.5" />
          <span>Add 2nd Bend (S-Curve)</span>
        </button>
      ) : (
        <button
          onClick={handleRemoveSecondBend}
          className="px-2.5 py-1.5 rounded-lg bg-red-950/70 border border-red-500/50 text-red-300 hover:bg-red-900/80 flex items-center gap-1 transition-all"
          title="Convert back to a single bend curve"
        >
          <Minus className="w-3.5 h-3.5" />
          <span>Remove 2nd Bend</span>
        </button>
      )}

      <button
        onClick={handleResetRouteToStraight}
        className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-400 hover:text-amber-300 flex items-center gap-1 transition-colors"
        title="Reset selected route to a straight line"
      >
        <RotateCcw className="w-3.5 h-3.5" />
        <span>Straighten Route</span>
      </button>
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

      <button
        onClick={handleResetCurves}
        className="px-2.5 py-1 rounded bg-slate-900 border border-slate-700 text-slate-400 hover:text-red-400 transition-colors"
        title="Reset all custom curves to defaults"
      >
        Reset All to Defaults
      </button>
    </div>
  </div>
)}
```

---

## 3. Dirt Road Styling Sub-bar JSX

```jsx
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

      {/* Preset Earth Color Swatches */}
      <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-700 px-2 py-1 rounded-lg">
        <span className="text-[10px] text-slate-400 uppercase font-bold">Palettes:</span>
        {DIRT_COLOR_PALETTES.map(p => (
          <button
            key={p.name}
            type="button"
            onClick={() => {
              setPathStyle(prev => ({
                ...prev,
                routeColors: {
                  ...(prev.routeColors || {}),
                  [selectedRouteKey]: { color: p.color, trackColor: p.track }
                }
              }));
            }}
            title={p.name}
            className="w-5 h-5 rounded-full border border-slate-500 shadow-sm transition-transform hover:scale-125 focus:scale-125"
            style={{ backgroundColor: p.color }}
          />
        ))}
      </div>

      {/* Custom Color Pickers */}
      <div className="flex items-center gap-2 bg-slate-900 border border-slate-700 px-2.5 py-1 rounded-lg">
        <label className="flex items-center gap-1 text-[11px] text-slate-300">
          <span>Path:</span>
          <input
            type="color"
            value={pathStyle.routeColors?.[selectedRouteKey]?.color || pathStyle.defaultPathColor}
            onChange={(e) => {
              const val = e.target.value;
              setPathStyle(prev => ({
                ...prev,
                routeColors: {
                  ...(prev.routeColors || {}),
                  [selectedRouteKey]: {
                    color: val,
                    trackColor: prev.routeColors?.[selectedRouteKey]?.trackColor || prev.defaultTrackColor
                  }
                }
              }));
            }}
            className="w-5 h-5 rounded cursor-pointer bg-transparent border-0"
          />
        </label>
        <label className="flex items-center gap-1 text-[11px] text-slate-300">
          <span>Ruts:</span>
          <input
            type="color"
            value={pathStyle.routeColors?.[selectedRouteKey]?.trackColor || pathStyle.defaultTrackColor}
            onChange={(e) => {
              const val = e.target.value;
              setPathStyle(prev => ({
                ...prev,
                routeColors: {
                  ...(prev.routeColors || {}),
                  [selectedRouteKey]: {
                    color: prev.routeColors?.[selectedRouteKey]?.color || prev.defaultPathColor,
                    trackColor: val
                  }
                }
              }));
            }}
            className="w-5 h-5 rounded cursor-pointer bg-transparent border-0"
          />
        </label>
      </div>

      {/* Noise Intensity Slider */}
      <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-700 px-2 py-1 rounded-lg text-slate-300">
        <span className="text-[10px] text-amber-400 font-bold">Roughness:</span>
        <input
          type="range"
          min="1"
          max="12"
          step="0.5"
          value={pathStyle.noiseIntensity}
          onChange={(e) => setPathStyle(prev => ({ ...prev, noiseIntensity: parseFloat(e.target.value) }))}
          className="w-18 accent-amber-500 cursor-pointer"
        />
        <span className="font-mono text-[10px] text-amber-300">{pathStyle.noiseIntensity}</span>
      </div>

      {/* Stroke Width Slider */}
      <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-700 px-2 py-1 rounded-lg text-slate-300">
        <span className="text-[10px] text-amber-400 font-bold">Width:</span>
        <input
          type="range"
          min="2"
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
```

---

## 4. Move Markers Sub-bar JSX

```jsx
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
```

---

## 5. Canvas Overlays (Handles & Pins) JSX

```jsx
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
      <line
        x1={`${n1.x}%`}
        y1={`${n1.y}%`}
        x2={`${currentControlPoints[0].x}%`}
        y2={`${currentControlPoints[0].y}%`}
        stroke="#38bdf8"
        strokeWidth="1.5"
        strokeDasharray="4 3"
        strokeOpacity="0.75"
      />

      {/* Tether between control points (if 2 bends) */}
      {currentControlPoints.length === 2 && (
        <line
          x1={`${currentControlPoints[0].x}%`}
          y1={`${currentControlPoints[0].y}%`}
          x2={`${currentControlPoints[1].x}%`}
          y2={`${currentControlPoints[1].y}%`}
          stroke="#facc15"
          strokeWidth="1.5"
          strokeDasharray="3 3"
          strokeOpacity="0.6"
        />
      )}

      {/* Tether from last control point to Node 2 */}
      <line
        x1={`${currentControlPoints[currentControlPoints.length - 1].x}%`}
        y1={`${currentControlPoints[currentControlPoints.length - 1].y}%`}
        x2={`${n2.x}%`}
        y2={`${n2.y}%`}
        stroke="#38bdf8"
        strokeWidth="1.5"
        strokeDasharray="4 3"
        strokeOpacity="0.75"
      />

      {/* Draggable Control Point Handles */}
      {currentControlPoints.map((cp, idx) => {
        const isDraggingThis = draggingHandle?.routeKey === selectedRouteKey && draggingHandle?.handleIndex === idx;
        return (
          <g key={`cp-${idx}`}>
            <circle
              cx={`${cp.x}%`}
              cy={`${cp.y}%`}
              r={isDraggingThis ? "14" : "10"}
              fill={idx === 0 ? "#eab308" : "#f97316"}
              stroke="#ffffff"
              strokeWidth="2.5"
              className="cursor-grab active:cursor-grabbing pointer-events-auto filter drop-shadow-lg transition-transform hover:scale-125"
              onMouseDown={(e) => {
                e.stopPropagation();
                e.preventDefault();
                setDraggingHandle({ routeKey: selectedRouteKey, handleIndex: idx });
              }}
            />
            <text
              x={`${cp.x}%`}
              y={`${cp.y - 3}%`}
              textAnchor="middle"
              fill="#fef08a"
              fontSize="10"
              fontWeight="bold"
              className="pointer-events-none select-none drop-shadow font-mono"
            >
              {`CP${idx + 1}: ${cp.x}%, ${cp.y}%`}
            </text>
          </g>
        );
      })}
    </g>
  );
})()}
```
