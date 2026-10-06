import * as THREE from 'three'
import type { SceneGraph } from '../types/index'

export interface RendererState {
  isPlaying: boolean
  currentTime: number
  duration: number
}

export class MotionRenderer {
  private scene: THREE.Scene
  private camera: THREE.PerspectiveCamera
  private renderer: THREE.WebGLRenderer
  private sceneGraph: SceneGraph
  private sceneObjects: Map<string, THREE.Object3D> = new Map()
  private animationFrameId: number | null = null
  private startTime: number = 0
  private pausedTime: number = 0
  private isPlaying: boolean = false
  private duration: number = 12 // 12 second default duration

  constructor(canvas: HTMLCanvasElement, sceneGraph: SceneGraph, duration: number = 12) {
    this.sceneGraph = sceneGraph
    this.duration = duration

    // Initialize Three.js scene
    this.scene = new THREE.Scene()
    this.scene.background = new THREE.Color(0x0a0a0a)
    this.scene.fog = new THREE.Fog(0x0a0a0a, 20, 100)

    // Initialize camera
    const width = canvas.clientWidth
    const height = canvas.clientHeight
    this.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000)
    this.camera.position.set(0, 0, 8)
    this.camera.lookAt(0, 0, 0)

    // Initialize renderer
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false })
    this.renderer.setSize(width, height)
    this.renderer.setPixelRatio(window.devicePixelRatio)
    this.renderer.shadowMap.enabled = true

    // Setup lighting
    this.setupLighting()

    // Build scene from graph
    this.buildSceneFromGraph(sceneGraph)

    // Handle window resize
    window.addEventListener('resize', () => this.onWindowResize())
  }

  private setupLighting(): void {
    // Ambient light for base illumination
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4)
    this.scene.add(ambientLight)

    // Directional light for shadows and depth
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8)
    dirLight.position.set(5, 10, 7)
    dirLight.castShadow = true
    dirLight.shadow.mapSize.width = 2048
    dirLight.shadow.mapSize.height = 2048
    dirLight.shadow.camera.far = 50
    this.scene.add(dirLight)

    // Point light for glow effect
    const pointLight = new THREE.PointLight(0x60a5fa, 0.5)
    pointLight.position.set(0, 2, 3)
    this.scene.add(pointLight)
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

  private createObjectFromData(objData: any): THREE.Object3D | null {
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

  private createGeometry(objData: any): THREE.Object3D {
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

  private createGrid(objData: any): THREE.Object3D {
    const gridSize = objData.geometry?.size?.[0] ?? 10
    const gridDivisions = objData.geometry?.density ?? 10

    const grid = new THREE.GridHelper(gridSize, gridDivisions, 0x444444, 0x222222)
    grid.position.y = -1.5

    return grid
  }

  private onWindowResize(): void {
    const width = this.renderer.domElement.clientWidth
    const height = this.renderer.domElement.clientHeight

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
  }

  public seek(time: number): void {
    this.pausedTime = Math.max(0, Math.min(time, this.duration))
    this.updateScene(this.pausedTime)
    if (!this.isPlaying) {
      this.renderer.render(this.scene, this.camera)
    }
  }

  public getCurrentTime(): number {
    if (this.isPlaying) {
      return ((performance.now() - this.startTime) / 1000) % this.duration
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
    this.pausedTime = currentTime

    this.updateScene(currentTime)
    this.renderer.render(this.scene, this.camera)

    this.animationFrameId = requestAnimationFrame(this.animate)
  }

  private updateScene(time: number): void {
    // Rotate wireframe cube continuously
    const cube = this.sceneObjects.get('wireframe-cube')
    if (cube) {
      cube.rotation.x += 0.005
      cube.rotation.y += 0.008
    }

    // Gentle camera bob
    const bobAmount = Math.sin(time * 0.5) * 0.1
    this.camera.position.z = 8 + bobAmount

    // Pulsing grid opacity
    const grid = this.sceneObjects.get('grid-base')
    if (grid && grid instanceof THREE.GridHelper) {
      const opacity = 0.3 + Math.sin(time * 2) * 0.2
      grid.material.opacity = opacity
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

    // Dispose renderer
    this.renderer.dispose()

    // Remove event listeners
    window.removeEventListener('resize', () => this.onWindowResize())
  }
}
