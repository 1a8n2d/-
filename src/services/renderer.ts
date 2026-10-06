import * as THREE from 'three'
import type { SceneGraph, SceneObject } from '../types/index'

export interface RendererState {
  isPlaying: boolean
  currentTime: number
  duration: number
}

/**
 * MotionRenderer: Deterministic Three.js-based scene renderer.
 *
 * Guarantees:
 * - All transforms are derived from `time` parameter, never accumulated
 * - Timeline ends deterministically (no modulo looping)
 * - Animation loop is never duplicated
 * - All WebGL resources and event listeners are fully cleaned up on dispose
 * - Initial frame renders before playback
 */
export class MotionRenderer {
  private scene: THREE.Scene
  private camera: THREE.PerspectiveCamera
  private renderer: THREE.WebGLRenderer
  private sceneGraph: SceneGraph
  private sceneObjects: Map<string, THREE.Object3D> = new Map()
  private lights: THREE.Light[] = []
  private animationFrameId: number | null = null
  private startTime: number = 0
  private pausedTime: number = 0
  private isPlaying: boolean = false
  private duration: number = 12 // 12 second default duration
  private resizeHandler: (() => void) | null = null

  constructor(canvas: HTMLCanvasElement, sceneGraph: SceneGraph, duration: number = 12) {
    this.sceneGraph = sceneGraph
    this.duration = Math.max(0.1, duration)

    // Validate canvas dimensions
    const width = canvas.clientWidth
    const height = canvas.clientHeight
    if (width <= 0 || height <= 0) {
      console.warn('[MotionRenderer] Canvas has invalid dimensions:', width, 'x', height)
    }

    // Initialize Three.js scene
    this.scene = new THREE.Scene()
    this.scene.background = new THREE.Color(0x0a0a0a)
    this.scene.fog = new THREE.Fog(0x0a0a0a, 20, 100)

    // Initialize camera
    this.camera = new THREE.PerspectiveCamera(
      75,
      width > 0 && height > 0 ? width / height : 1,
      0.1,
      1000
    )
    this.camera.position.set(0, 0, 8)
    this.camera.lookAt(0, 0, 0)

    // Initialize renderer with clamped pixel ratio
    const pixelRatio = Math.min(window.devicePixelRatio, 2)
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false })
    this.renderer.setSize(width, height)
    this.renderer.setPixelRatio(pixelRatio)
    this.renderer.shadowMap.enabled = true

    // Setup lighting
    this.setupLighting()

    // Build scene from graph
    this.buildSceneFromGraph(sceneGraph)

    // Register resize handler (save reference for later removal)
    this.resizeHandler = () => this.onWindowResize()
    window.addEventListener('resize', this.resizeHandler)

    // Render initial frame
    this.renderer.render(this.scene, this.camera)
  }

  private setupLighting(): void {
    // Ambient light for base illumination
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4)
    this.scene.add(ambientLight)
    this.lights.push(ambientLight)

    // Directional light for shadows and depth
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8)
    dirLight.position.set(5, 10, 7)
    dirLight.castShadow = true
    dirLight.shadow.mapSize.width = 2048
    dirLight.shadow.mapSize.height = 2048
    dirLight.shadow.camera.far = 50
    this.scene.add(dirLight)
    this.lights.push(dirLight)

    // Point light for glow effect
    const pointLight = new THREE.PointLight(0x60a5fa, 0.5)
    pointLight.position.set(0, 2, 3)
    this.scene.add(pointLight)
    this.lights.push(pointLight)
  }

  private buildSceneFromGraph(graph: SceneGraph): void {
    // Set camera from graph
    const camData = graph.camera
    this.camera.position.set(...camData.position)
    this.camera.rotation.order = 'YXZ'
    this.camera.rotation.set(...camData.rotation)

    // Build objects
    for (const objData of graph.objects) {
      const object = this.createObjectFromData(objData)
      if (object) {
        this.scene.add(object)
        this.sceneObjects.set(objData.id, object)
      }
    }
  }

  private createObjectFromData(objData: SceneObject): THREE.Object3D | null {
    let object: THREE.Object3D | null = null

    if (objData.type === 'mesh' && objData.geometry) {
      object = this.createGeometry(objData)
    } else if (objData.type === 'grid') {
      object = this.createGrid(objData)
    }

    if (object) {
      object.position.set(...objData.position)
      object.rotation.set(...objData.rotation)
      object.scale.set(...objData.scale)
      object.visible = objData.visible
    }

    return object
  }

  private createGeometry(objData: SceneObject): THREE.Object3D {
    let geometry: THREE.BufferGeometry

    switch (objData.geometry?.kind) {
      case 'cube':
        const size = objData.geometry.size ?? [1, 1, 1]
        geometry = new THREE.BoxGeometry(size[0], size[1], size[2])
        break
      case 'sphere':
        geometry = new THREE.SphereGeometry(1, 32, 32)
        break
      case 'torus':
        geometry = new THREE.TorusGeometry(1, 0.4, 16, 100)
        break
      default:
        geometry = new THREE.BoxGeometry(1, 1, 1)
    }

    const material = new THREE.MeshStandardMaterial({
      color: objData.material?.color || 0x7dd3fc,
      wireframe: objData.material?.wireframe || false,
      transparent: objData.material?.transparent || false,
      opacity: objData.opacity ?? 1,
      emissive: objData.material?.emissive ? new THREE.Color(objData.material.emissive) : undefined,
      roughness: objData.material?.roughness ?? 0.7,
      metalness: objData.material?.metalness ?? 0.3,
    })

    const mesh = new THREE.Mesh(geometry, material)
    mesh.castShadow = true
    mesh.receiveShadow = true

    return mesh
  }

  private createGrid(objData: SceneObject): THREE.Object3D {
    const gridSize = objData.geometry?.size?.[0] ?? 10
    const gridDivisions = objData.geometry?.density ?? 10

    const grid = new THREE.GridHelper(gridSize, gridDivisions, 0x444444, 0x222222)
    grid.position.y = -1.5

    return grid
  }

  private onWindowResize(): void {
    const width = this.renderer.domElement.clientWidth
    const height = this.renderer.domElement.clientHeight

    if (width <= 0 || height <= 0) return

    this.camera.aspect = width / height
    this.camera.updateProjectionMatrix()

    this.renderer.setSize(width, height)
  }

  public play(): void {
    if (this.isPlaying) return
    this.isPlaying = true
    this.startTime = performance.now() - this.pausedTime * 1000
    this.animate()
  }

  public pause(): void {
    this.isPlaying = false
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId)
      this.animationFrameId = null
    }
  }

  public restart(): void {
    this.pausedTime = 0
    this.pause()
    this.updateScene(0)
    this.renderer.render(this.scene, this.camera)
  }

  public seek(time: number): void {
    const clampedTime = Math.max(0, Math.min(time, this.duration))
    this.pausedTime = clampedTime
    this.updateScene(clampedTime)
    if (!this.isPlaying) {
      this.renderer.render(this.scene, this.camera)
    }
  }

  public getCurrentTime(): number {
    if (this.isPlaying) {
      const elapsed = (performance.now() - this.startTime) / 1000
      return Math.min(elapsed, this.duration)
    }
    return this.pausedTime
  }

  public getDuration(): number {
    return this.duration
  }

  public getState(): RendererState {
    return {
      isPlaying: this.isPlaying,
      currentTime: this.getCurrentTime(),
      duration: this.duration,
    }
  }

  private animate = (): void => {
    if (!this.isPlaying) return

    const currentTime = this.getCurrentTime()

    // Stop animation at end of timeline
    if (currentTime >= this.duration) {
      this.pausedTime = this.duration
      this.isPlaying = false
      this.updateScene(this.duration)
      this.renderer.render(this.scene, this.camera)
      return
    }

    this.pausedTime = currentTime
    this.updateScene(currentTime)
    this.renderer.render(this.scene, this.camera)

    this.animationFrameId = requestAnimationFrame(this.animate)
  }

  /**
   * Update scene state based on current time.
   * All transforms MUST be derived from `time` parameter, never accumulated.
   */
  private updateScene(time: number): void {
    // Rotate wireframe cube: derive rotation from time (deterministic)
    const cube = this.sceneObjects.get('wireframe-cube')
    if (cube) {
      cube.rotation.x = 0.5 + Math.sin(time * 0.5) * 0.3
      cube.rotation.y = 0.8 + time * 0.3
      cube.rotation.z = 0.2 + Math.cos(time * 0.4) * 0.2
    }

    // Gentle camera bob: derived from time
    const bobAmount = Math.sin(time * 0.5) * 0.1
    this.camera.position.z = 8 + bobAmount

    // Pulsing grid: GridHelper doesn't support material opacity, so we adjust via position
    const grid = this.sceneObjects.get('grid-base')
    if (grid) {
      const scale = 0.8 + Math.sin(time * 2) * 0.2
      grid.scale.y = scale
    }
  }

  public dispose(): void {
    this.pause()

    // Dispose geometries and materials
    this.sceneObjects.forEach((object) => {
      if (object instanceof THREE.Mesh) {
        object.geometry.dispose()
        if (Array.isArray(object.material)) {
          object.material.forEach((m) => m.dispose())
        } else {
          object.material.dispose()
        }
      }
    })
    this.sceneObjects.clear()

    // Dispose lights
    this.lights.forEach((light) => {
      if ('dispose' in light && typeof light.dispose === 'function') {
        light.dispose()
      }
      this.scene.remove(light)
    })
    this.lights = []

    // Dispose renderer
    this.renderer.dispose()

    // Remove event listener with exact handler reference
    if (this.resizeHandler) {
      window.removeEventListener('resize', this.resizeHandler)
      this.resizeHandler = null
    }
  }
}
