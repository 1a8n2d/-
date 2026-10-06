export type Vector3 = [number, number, number]
export type Vector2 = [number, number]

export type MotionIntent =
  | 'INTRODUCE'
  | 'REVEAL'
  | 'EMPHASIZE'
  | 'TRANSFORM'
  | 'CONNECT'
  | 'SEPARATE'
  | 'ESCALATE'
  | 'CALM'
  | 'FOCUS'
  | 'TRANSITION'
  | 'FINISH'

export type AudioBand = 'bass' | 'mid' | 'treble' | 'voice'
export type JobState = 'QUEUED' | 'RUNNING' | 'PARTIAL' | 'COMPLETED' | 'FAILED' | 'CANCELLED'
export type RenderQuality = 'DRAFT' | 'PREVIEW' | 'HIGH' | 'FINAL'

export interface SceneObject {
  id: string
  name: string
  type: 'camera' | 'mesh' | 'text' | 'light' | 'grid' | 'particleField'
  visible: boolean
  position: Vector3
  rotation: Vector3
  scale: Vector3
  opacity: number
  material?: {
    color?: string
    wireframe?: boolean
    transparent?: boolean
    emissive?: string
    roughness?: number
    metalness?: number
  }
  geometry?: {
    kind: 'cube' | 'sphere' | 'torus' | 'plane' | 'wireframe' | 'custom'
    size?: Vector3
    density?: number
  }
  text?: {
    value: string
    fontSize?: number
    anchor?: 'center' | 'left' | 'right'
  }
  metadata?: Record<string, unknown>
}

export interface AudioBinding {
  source: AudioBand | 'amplitude' | 'beat' | 'onset' | 'silence'
  target: string
  value: number
  curve?: 'linear' | 'easeIn' | 'easeOut' | 'easeInOut' | 'spring'
  min?: number
  max?: number
}

export interface PatternDNA {
  id: string
  name: string
  description: string
  category: 'camera' | 'typography' | 'geometry' | 'object' | 'particles' | 'transitions' | 'backgrounds' | 'hud' | 'audio-reactive'
  prompt: string
  tags: string[]
  seed: number
  duration: number
  camera: Record<string, unknown>
  geometry: Record<string, unknown>
  lighting: Record<string, unknown>
  typography: Record<string, unknown>
  particles: Record<string, unknown>
  motion: Record<string, unknown>
  timing: Record<string, unknown>
  easing: string
  audioBindings: AudioBinding[]
  parameters: Record<string, number | string | boolean>
  version: string
}

export interface TimelineClip {
  id: string
  name: string
  start: number
  duration: number
  objectId: string
  kind: 'camera' | 'object' | 'text' | 'audio' | 'transition'
  intent?: MotionIntent
  metadata?: Record<string, unknown>
}

export interface VoiceSegment {
  id: string
  text: string
  start: number
  end: number
  language?: string
  provider?: string
  words?: Array<{ text: string; start: number; end: number; emphasis?: number }>
  phonemes?: Array<{ symbol: string; start: number; end: number }>
}

export interface SceneGraph {
  id: string
  name: string
  camera: SceneObject
  objects: SceneObject[]
  timeline: TimelineClip[]
  voiceSegments: VoiceSegment[]
  bindings: AudioBinding[]
}

export interface ProjectDocument {
  id: string
  projectName: string
  version: string
  createdAt: string
  updatedAt: string
  metadata: {
    description?: string
    tags?: string[]
    renderQuality?: RenderQuality
  }
  scenes: SceneGraph[]
  patterns: PatternDNA[]
  audio?: {
    file?: string
    bpm?: number
    waveform?: number[]
  }
  voice?: {
    provider?: string
    language?: string
    voiceName?: string
    style?: string
    speed?: number
    pitch?: number
    emotion?: string
  }
  renderSettings: {
    fps: number
    quality: RenderQuality
    resolution: string
  }
  seeds: Record<string, number>
  versions: string[]
}

export interface ScenePatch {
  id: string
  objectId: string
  path: string
  oldValue: unknown
  newValue: unknown
  createdAt: string
}

export interface ProjectHistory {
  stack: ScenePatch[]
  index: number
}

export interface JobDescriptor {
  id: string
  type: 'TTS' | 'AUDIO_ANALYSIS' | 'PATTERN_GENERATION' | 'RENDER' | 'SCENE_PATCH'
  state: JobState
  progress: number
  createdAt: string
  updatedAt: string
  error?: string
}

export interface ProviderDefinition {
  id: string
  type: 'LLM' | 'STT' | 'TTS' | 'VIDEO' | 'AUDIO_ANALYSIS'
  name: string
  provider: string
  enabled: boolean
  config: Record<string, unknown>
}

export const defaultSceneGraph = (): SceneGraph => ({
  id: 'scene-default',
  name: 'Default Scene',
  camera: {
    id: 'camera-main',
    name: 'Main Camera',
    type: 'camera',
    visible: true,
    position: [0, 0, 8],
    rotation: [0, 0, 0],
    scale: [1, 1, 1],
    opacity: 1,
  },
  objects: [
    {
      id: 'grid-base',
      name: 'Perspective Grid',
      type: 'grid',
      visible: true,
      position: [0, -1.5, 0],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
      opacity: 0.5,
      geometry: { kind: 'plane', size: [10, 10, 1] },
    },
    {
      id: 'wireframe-cube',
      name: 'Wireframe Cube',
      type: 'mesh',
      visible: true,
      position: [0, 0, 0],
      rotation: [0.5, 0.8, 0.2],
      scale: [1.2, 1.2, 1.2],
      opacity: 1,
      material: { color: '#7dd3fc', wireframe: true, emissive: '#60a5fa' },
      geometry: { kind: 'cube', size: [1, 1, 1] },
    },
  ],
  timeline: [],
  voiceSegments: [],
  bindings: [],
})

export const defaultProject = (): ProjectDocument => ({
  id: 'project-default',
  projectName: 'AI Motion Studio Project',
  version: '0.1.0',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  metadata: {
    description: 'AI Motion Studio MVP',
    tags: ['motion', '3d', 'voice'],
    renderQuality: 'PREVIEW',
  },
  scenes: [defaultSceneGraph()],
  patterns: [],
  voice: {
    provider: 'local',
    language: 'en',
    style: 'cinematic',
    speed: 1,
    pitch: 1,
    emotion: 'calm',
  },
  renderSettings: {
    fps: 60,
    quality: 'PREVIEW',
    resolution: '1920x1080',
  },
  seeds: {
    default: 1,
  },
  versions: ['0.1.0'],
})
