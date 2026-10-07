# AI Motion Studio

**AI-powered 3D motion graphics generator using TypeScript, Vue 3, Three.js, and Web Audio.**

A real-time motion visualization platform that transforms textual scene descriptions into deterministic, timeline-driven 3D animations with audio-reactive bindings.

## Local Development

### Prerequisites

- **Node.js** 18+ (https://nodejs.org/)
- **npm** 9+ (included with Node.js)
- **Git** (https://git-scm.com/)

### Quick Start

Clone the repository:
```powershell
git clone https://github.com/1a8n2d/ai-motion-studio.git
cd ai-motion-studio
```

Install dependencies:
```powershell
npm install
```

Verify the build:
```powershell
npm run typecheck
npm run build
```

Start the development server:
```powershell
npm run dev
```

The application will be available at `http://localhost:5173`.

### Development Commands

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run typecheck` | Run TypeScript type checking |
| `npm run api` | Start mock API server (separate terminal) |

### Update Workflow

After pulling changes:
```powershell
git pull
npm install
npm run build
```

### Commit Workflow

Create a feature branch:
```powershell
git checkout -b feature/your-feature-name
```

Make changes and commit:
```powershell
git add .
git commit -m "brief description"
git push origin feature/your-feature-name
```

Open a pull request on GitHub.

### Troubleshooting

**`npm install` fails with peer dependency warnings:**
- These are expected. Vite with `latest` dependencies may have loose peer constraints.
- If the build succeeds, it is safe to proceed.

**Port 5173 already in use:**
```powershell
npm run dev -- --port 5174
```

**TypeScript errors on import of Three.js:**
- Run `npm install` again to ensure `@types/three` is installed.
- Clear node_modules and reinstall if persists: `rm -r node_modules && npm install`

---

## Project Architecture

### Directory Structure

```
ai-motion-studio/
├── src/
│   ├── types/index.ts          # Scene graph, project, and motion types
│   ├── services/renderer.ts    # Three.js renderer for 3D scenes
│   ├── App.vue                 # Main Vue application
│   ├── main.ts                 # Vue entry point
│   └── style.css               # Global styles
├── docs/
│   ├── AI_MOTION_STUDIO_ANALYSIS.md
│   └── PROJECT_FORMAT.md       # Scene/project serialization format
├── index.html                  # HTML entry point
├── package.json                # Dependencies and scripts
├── tsconfig.json               # TypeScript configuration
├── vite.config.ts              # Vite build configuration
├── server.mjs                  # Mock API server
└── .gitignore                  # Git ignore rules
```

### Data Flow

```
Scene Model (src/types/index.ts)
    ↓
Motion Renderer (src/services/renderer.ts)
    ↓
Three.js WebGL Canvas
    ↓
Browser Preview
```

### Key Components

- **SceneGraph**: Typed representation of a 3D scene (camera, objects, lights, timeline)
- **MotionRenderer**: Deterministic Three.js renderer that consumes SceneGraph and produces WebGL output
- **TimelineState**: Play/pause/seek/restart control and time tracking
- **ProjectDocument**: Serializable project state with scenes, patterns, and metadata

---

## Repository Workflow

### Branch Strategy

- **`main`**: Stable, verified working state
- **`feature/*`**: Development work (create pull request for review)

### CI/CD

GitHub Actions automatically:
1. Installs dependencies
2. Runs TypeScript type checking
3. Builds the application
4. Reports success/failure

View CI status in the **Actions** tab.

### Commits

- Use descriptive commit messages
- Prefix with: `feat:`, `fix:`, `docs:`, `refactor:`, `test:`
- Example: `feat: add audio waveform analysis to renderer`

---

## Architecture & Design

### Motion Model

All motion is **deterministic** and **time-based**:
- Transforms are **derived from time**, never accumulated
- Timeline ends deterministically (no looping)
- Animation state is reproducible from a scene definition and time value

### Renderer Separation

- **Scene model** (data) is independent of **renderer** (implementation)
- Easy to swap renderer (Three.js → Babylon.js, etc.)
- Scene can be serialized and reloaded

### Type Safety

- Full TypeScript with strict mode enabled
- Scene data is validated at compile time
- No runtime `any` usage in core motion logic

---

## Future Work

- TTS integration for voice narration
- Pattern Lab for reusable motion DNA
- Audio analysis and reactive bindings
- LLM-based scene generation from natural language
- Multi-user collaboration

---

## License

See LICENSE file.

---

## Support

For issues, feature requests, or documentation, open a GitHub issue.
