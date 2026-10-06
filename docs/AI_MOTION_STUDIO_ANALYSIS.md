# AI Motion Studio — Architecture Analysis & Roadmap

**Date:** 2026-10-06  
**Status:** PHASE 1 — Architecture Definition  
**Target:** Transform Botan Comic Clip Factory into AI Motion Studio

---

## Current Architecture

### Frontend Stack
- **Framework:** Vue 3 (Composition API)
- **Build Tool:** Vite
- **Language:** TypeScript
- **Styling:** CSS3 (DM Mono, Manrope fonts)
- **State Management:** Vue reactive refs (minimal)
- **Renderer:** CSS 3D (visual mockup only, not functional 3D)

### Backend Stack
- **Runtime:** Node.js
- **HTTP Server:** Node's native `http` module
- **Protocol Support:** HTTP/1.1 + WebSocket
- **API Format:** JSON REST
- **Process:** Single-threaded (no clustering/load balancing)

### Architecture Overview
```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND (Vite + Vue 3)              │
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  Magic Dir   │  │  Timeline    │  │  Inspector   │  │
│  │   Panel      │  │   (CSS vis)  │  │   (Props)    │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
│  ┌──────────────────────────────────────────────────┐  │
│  │   Preview Canvas (CSS 3D, not real 3D)          │  │
│  └──────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────┘
                          ↕ HTTP/JSON/WS
┌──────────────────────────────────────────────────────────┐
│                  BACKEND (Node.js server.mjs)            │
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │ /api/generate│  │ /api/v1/*    │  │  /ws (mock)  │  │
│  │  (queued 3s) │  │  (metrics)   │  │  (analytics) │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
│                                                          │
│  No DB | No LLM | No TTS | No audio processing         │
└──────────────────────────────────────────────────────────┘
```

---

## Capabilities Matrix

| Capability | Exists | Partial | Status | Priority |
|---|---|---|---|---|
| **Natural Language Commands** | ❌ | ✓ | UI only (no backend) | P1 |
| **Voice Input** | ❌ | ❌ | Not started | P2 |
| **Speech-to-Text** | ❌ | ❌ | Needs STT provider | P2 |
| **Text-to-Speech** | ❌ | ❌ | Needs TTS provider + abstraction | P1 |
| **TTS Streaming** | ❌ | ❌ | Optional (after MVP) | P3 |
| **Audio Waveform Analysis** | ❌ | ❌ | Needs Web Audio API | P1 |
| **3D Renderer** | ❌ | ❌ | Needs Three.js or Babylon.js | P0 |
| **Scene Graph** | ❌ | ✓ | Minimal mock data | P0 |
| **Timeline** | ✓ | ❌ | CSS layout only, not functional | P0 |
| **Kinetic Typography** | ❌ | ❌ | Requires 3D renderer + animation | P1 |
| **Particles** | ❌ | ❌ | Depends on 3D renderer | P2 |
| **Camera System** | ❌ | ❌ | Depends on 3D renderer | P1 |
| **Wireframe Geometry** | ❌ | ❌ | Depends on 3D renderer | P1 |
| **Audio-Reactive Motion** | ❌ | ❌ | Needs audio analysis + bindings | P2 |
| **Voice-Reactive Motion** | ❌ | ❌ | Needs STT + semantic understanding | P2 |
| **Pattern Lab** | ❌ | ❌ | Needs pattern data model | P1 |
| **Pattern DNA** | ❌ | ❌ | Needs structured pattern format | P1 |
| **Pattern Generation** | ❌ | ❌ | Needs LLM integration | P2 |
| **Pattern Variations** | ❌ | ❌ | Depends on pattern generation | P3 |
| **Pattern Search** | ❌ | ❌ | Needs semantic search | P3 |
| **Seeds + Reproducibility** | ❌ | ❌ | Needs deterministic seeding | P1 |
| **Scene Patches** | ❌ | ❌ | Needs differential updates | P1 |
| **Undo/Redo** | ❌ | ❌ | Needs history stack | P1 |
| **Project Serialization** | ❌ | ❌ | Needs project.json format | P1 |
| **Job System** | ❌ | ❌ | Mock exists, needs real implementation | P1 |
| **Job Cancellation** | ❌ | ❌ | Depends on job system | P2 |
| **Asset Cache** | ❌ | ❌ | Depends on provider adapters | P2 |
| **Provider Abstraction** | ❌ | ✓ | Folder structure exists | P0 |
| **Real-time Preview** | ✓ | ❌ | CSS only, not real-time 3D | P1 |
| **Realtime Sync** | ❌ | ❌ | Needs sync protocol | P2 |
| **Export/Render** | ❌ | ❌ | Not started | P3 |

---

## Reusable Components

### Frontend
- ✅ **App.vue** — Master layout with tabs, sidebar, inspector
- ✅ **style.css** — Complete design system (colors, typography, spacing)
- ✅ **main.ts** — Vue app bootstrap
- ✅ **vite.config.ts** — Build configuration

### Backend
- ✅ **server.mjs** — HTTP server + WebSocket base
- ✅ **API shape** — POST /api/generate, GET /api/v1/*, WebSocket structure
- ✅ **Mock response pattern** — Can be extended into real endpoints

### Architecture
- ✅ **Package structure** — `apps/`, `packages/`, `providers/` folders
- ✅ **Provider adapter pattern** — Folder per provider (can reuse for TTS, LLM, etc.)

---

## Missing Capabilities (Critical Path)

### Tier 0: Foundational (Blocks everything else)
1. **3D Renderer** — Canvas-based 3D (Three.js recommended for maturity + ecosystem)
   - Needed for: All 3D visuals, camera, geometry, materials, lighting
   - Blocker: Without this, cannot visualize scenes

2. **Provider Abstraction** — Generalized interface for external services
   - Needed for: TTS, LLM, audio, video generation
   - Pattern: `src/services/providers/index.ts` + concrete adapters

3. **Scene Graph Data Model** — Structured representation of 3D scene
   - Needed for: Serialization, patches, undo/redo, AI understanding
   - Pattern: TypeScript types + validation

### Tier 1: MVP Vertical Slice
4. **Voice Studio** — TEXT → TTS → AUDIO → TIMESTAMPS → TIMELINE
5. **Timeline Engine** — Functional seek, play, pause, drag
6. **Scene Patches** — Differential updates instead of full rebuild
7. **Project Serialization** — Save/load projects reproducibly
8. **Job System** — Real asynchronous operations with status tracking
9. **Kinetic Typography** — Text animation tied to audio timing
10. **Audio Analysis** — Waveform, beats, bass/mids/highs

### Tier 2: Pattern Lab
11. **Pattern DNA** — Machine-readable motion specification
12. **Pattern Library** — Initial 10-15 reusable patterns
13. **Pattern Variations** — Deterministic seeding for reproducibility

### Tier 3: Motion Intelligence
14. **LLM Integration** — Understand natural language commands
15. **Semantic Motion** — Map intent (EMPHASIZE, REVEAL, etc.) to patterns
16. **Audio-Reactive Bindings** — Connect audio features to motion properties

---

## Technical Risks

### High Risk
1. **Renderer integration** — Three.js into Vue component could create state sync issues
   - Mitigation: Use `<canvas>` ref + separate lifecycle, not Vue reactivity for 3D state

2. **State management explosion** — Current Vue refs won't scale to 100+ motion properties
   - Mitigation: Introduce Pinia store or custom state machine

3. **Server single-threaded bottleneck** — Node.js server.mjs will block on TTS/LLM calls
   - Mitigation: Move long operations to workers, implement proper queuing

4. **Audio sync drift** — Timeline playhead vs. audio playback will desynchronize
   - Mitigation: Use Web Audio API native timing, not setTimeout

### Medium Risk
5. **Provider lock-in** — If TTS/LLM hardcoded, switching providers breaks code
   - Mitigation: Strict interface contracts, inject dependencies

6. **Procedural determinism** — Procedural patterns must be reproducible from seed
   - Mitigation: Use seeded PRNGs, document all randomness sources

7. **Memory leaks in 3D** — Three.js textures, geometries not properly disposed
   - Mitigation: Explicit cleanup in Vue lifecycle hooks

### Low Risk
8. **Build performance** — Vite is fast but Vue + Three.js + TypeScript may grow
   - Mitigation: Monitor bundle size, lazy-load Pattern Lab

---

## Security Risks

1. **API keys in environment variables** — TTS/LLM keys must never reach frontend
   - Action: Server-only secrets, validate all client requests

2. **AI-generated code execution** — AI could generate malicious scene code
   - Action: Schema validation, no `eval()`, use declarative scene data only

3. **WebSocket injection** — Real-time updates could be spoofed
   - Action: Auth tokens, message signing, rate limiting

---

## Performance Targets

| Component | Target | Metric |
|---|---|---|
| **Timeline seek** | < 50ms | Frame skip allowed |
| **3D render** | 60 FPS | 16.67ms/frame at 1080p |
| **TTS generation** | 100–500ms | Per 10-word segment |
| **Scene patch** | < 30ms | No flicker |
| **Undo/redo** | < 10ms | Instant feel |
| **Project save** | < 500ms | No UI block |
| **Audio analysis** | Real-time | Web Audio API native timing |

---

## Implementation Roadmap

```
PHASE 1: Architecture (1–2 days)
├── Data types (Scene, Pattern, Timeline, etc.)
├── Provider abstractions
└── Project format

PHASE 2: 3D Renderer (2–3 days)
├── Three.js integration
├── Basic geometry (cube, sphere, wireframe)
├── Camera system
└── Lighting

PHASE 3: Timeline Engine (1–2 days)
├── Functional playhead
├── Seek/play/pause
├── Drag-and-drop reordering
└── Frame sync

PHASE 4: Voice Studio (2–3 days)
├── TTS provider abstraction
├── Text input → audio generation
├── Waveform visualization
└── Timestamp extraction

PHASE 5: Scene Patches + Serialization (1–2 days)
├── Differential updates
├── project.json format
└── Save/load/undo

PHASE 6: Pattern Lab MVP (2–3 days)
├── Pattern data model
├── Initial library (10–15 patterns)
├── Preview sandbox
└── Save as pattern

PHASE 7: Audio Analysis (1–2 days)
├── Web Audio API integration
├── Beat/bass/treble detection
└── Realtime visualizer

PHASE 8+: LLM + Motion Director
├── Natural language commands
├── Semantic scene patches
└── Full voice control
```

---

## Files to Create/Modify

### Create
- `src/types/index.ts` — All TypeScript definitions
- `src/types/scene.ts` — Scene graph types
- `src/types/timeline.ts` — Timeline types
- `src/types/pattern.ts` — Pattern DNA types
- `src/types/project.ts` — Project serialization types
- `src/services/providers/index.ts` — Provider abstraction layer
- `src/services/providers/tts/index.ts` — TTS provider interface
- `src/services/renderer/index.ts` — 3D renderer abstraction
- `src/components/PreviewCanvas.vue` — Three.js canvas component
- `src/components/Timeline.vue` — Functional timeline (rewrite)
- `src/components/VoiceStudio.vue` — TTS + audio UI
- `src/stores/sceneStore.ts` — Pinia store for scene state (if adopted)
- `server/tts.mjs` — TTS provider router
- `server/audioAnalysis.mjs` — Audio analysis endpoints
- `docs/PROJECT_FORMAT.md` — project.json specification

### Modify
- `src/App.vue` — Integrate new components, fix state management
- `server.mjs` — Real API endpoints instead of mocks
- `package.json` — Add Three.js, Pinia, other dependencies

---

## Success Criteria

Phase 1 complete when:
- [ ] All types defined and validated
- [ ] Provider abstraction designed
- [ ] Project format documented

Phase 2 complete when:
- [ ] Three.js renders a scene
- [ ] Camera responds to mouse/touch
- [ ] Simple geometry (wireframe cube, grid) visible

Phase 3 complete when:
- [ ] Timeline playhead syncs with animation
- [ ] Drag-and-drop reordering works
- [ ] Seek to any point works

Phase 4 complete when:
- [ ] TTS generates audio from text
- [ ] Timestamps extracted
- [ ] Audio added to timeline
- [ ] Kinetic typography syncs to words

Phase 5 complete when:
- [ ] Scenes can be saved to project.json
- [ ] Scene can be loaded from project.json
- [ ] Patches applied without full rebuild
- [ ] Undo/redo functional

Phase 6 complete when:
- [ ] 10+ patterns defined with Pattern DNA
- [ ] Patterns preview in sandbox
- [ ] Save scene as pattern works

Phase 7 complete when:
- [ ] Audio waveform analyzed in real-time
- [ ] Bindings (audio → motion) functional
- [ ] Visual feedback of audio features

---

## Known Limitations

1. **No distributed rendering** — Single-threaded Node.js, no GPU acceleration yet
2. **No persistence database** — In-memory only, projects lost on restart
3. **No real LLM integration** — Mock API only until providers connected
4. **No multi-user** — Single-user session, no concurrent editing
5. **No export** — Video rendering not yet implemented
6. **Browser compatibility** — Requires modern browser (Chrome 90+, Firefox 88+, Safari 15+) for WebGL

---

## Next Step

→ **PHASE 1 implementation:** Create `src/types/index.ts` + all type definitions.
