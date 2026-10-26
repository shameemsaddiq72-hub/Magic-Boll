/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { BallMesh } from './BallMesh';
import { BallConfig } from '../types/ball';
import { sound } from '../utils/audio';

export class ThreeScene {
  private container: HTMLElement;
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private ball: BallMesh;
  private clock: THREE.Clock;
  private animFrameId = 0;
  private isDestroyed = false;

  // Interaction
  private isDragging = false;
  private prevPointerX = 0;
  private prevPointerY = 0;
  private targetRotationY = 0;
  private targetRotationX = 0;
  private targetCameraDist = 3.6;
  private isSoftwareGl = false;
  private timeElapsed = 0;

  constructor(container: HTMLElement, initialConfig: BallConfig) {
    this.container = container;
    this.clock = new THREE.Clock();

    // Software GL detection
    this.isSoftwareGl = (() => {
      try {
        const gl = document.createElement('canvas').getContext('webgl2');
        if (!gl) return true;
        const ext = gl.getExtension('WEBGL_debug_renderer_info');
        const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
        const gpu = String(gl.getParameter(param));
        gl.getExtension('WEBGL_lose_context')?.loseContext();
        return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
      } catch {
        return false;
      }
    })();

    // Scene setup
    this.scene = new THREE.Scene();

    // Camera setup
    const aspect = container.clientWidth / (container.clientHeight || 1);
    this.camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 100);
    this.camera.position.set(0, 0.4, this.targetCameraDist);

    // Renderer setup
    this.renderer = new THREE.WebGLRenderer({
      antialias: !this.isSoftwareGl,
      powerPreference: 'high-performance',
      alpha: true,
    });
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.1;
    this.renderer.setPixelRatio(this.isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.shadowMap.enabled = !this.isSoftwareGl;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.appendChild(this.renderer.domElement);

    // RoomEnvironment reflections
    const pmremGenerator = new THREE.PMREMGenerator(this.renderer);
    this.scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // Lighting
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444466, 0.8);
    this.scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xfff8ee, 1.4);
    keyLight.position.set(3, 5, 4);
    keyLight.castShadow = !this.isSoftwareGl;
    if (keyLight.castShadow) {
      keyLight.shadow.mapSize.width = 1024;
      keyLight.shadow.mapSize.height = 1024;
      keyLight.shadow.bias = -0.0005;
      keyLight.shadow.camera.near = 0.5;
      keyLight.shadow.camera.far = 15;
    }
    this.scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x88bbff, 0.6);
    rimLight.position.set(-3, 2, -3);
    this.scene.add(rimLight);

    // Contact Shadow Ground Plane
    const shadowGeom = new THREE.PlaneGeometry(3.5, 3.5);
    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = 128;
    shadowCanvas.height = 128;
    const sCtx = shadowCanvas.getContext('2d')!;
    const grad = sCtx.createRadialGradient(64, 64, 10, 64, 64, 64);
    grad.addColorStop(0, 'rgba(0,0,0,0.45)');
    grad.addColorStop(0.5, 'rgba(0,0,0,0.15)');
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    sCtx.fillStyle = grad;
    sCtx.fillRect(0, 0, 128, 128);

    const shadowTex = new THREE.CanvasTexture(shadowCanvas);
    const shadowMat = new THREE.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      depthWrite: false,
    });
    const shadowPlane = new THREE.Mesh(shadowGeom, shadowMat);
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.y = -1.34;
    this.scene.add(shadowPlane);

    // Add Ball Mesh
    this.ball = new BallMesh(initialConfig);
    this.ball.group.position.set(0, -0.32, 0);
    this.scene.add(this.ball.group);

    // Bind Interaction listeners
    this.setupControls();

    // Start Loop
    this.loop = this.loop.bind(this);
    this.loop();
  }

  public updateBall(config: BallConfig) {
    this.ball.updateConfig(config);
  }

  public triggerTapReaction() {
    this.ball.applySquish(1.8);
    sound.playSfx('bounce');
    this.targetRotationY += 0.8;
  }

  private setupControls() {
    const el = this.renderer.domElement;

    const onPointerDown = (e: PointerEvent) => {
      this.isDragging = true;
      this.prevPointerX = e.clientX;
      this.prevPointerY = e.clientY;
      el.setPointerCapture(e.pointerId);
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!this.isDragging) return;
      const dx = e.clientX - this.prevPointerX;
      const dy = e.clientY - this.prevPointerY;
      this.prevPointerX = e.clientX;
      this.prevPointerY = e.clientY;

      this.targetRotationY += dx * 0.012;
      this.targetRotationX = Math.max(-0.6, Math.min(0.6, this.targetRotationX + dy * 0.008));
    };

    const onPointerUp = (e: PointerEvent) => {
      if (!this.isDragging) return;
      this.isDragging = false;
      try {
        el.releasePointerCapture(e.pointerId);
      } catch {
        // ignore
      }
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      this.targetCameraDist = Math.max(2.2, Math.min(6.0, this.targetCameraDist + e.deltaY * 0.003));
    };

    el.addEventListener('pointerdown', onPointerDown);
    el.addEventListener('pointermove', onPointerMove);
    el.addEventListener('pointerup', onPointerUp);
    el.addEventListener('pointercancel', onPointerUp);
    el.addEventListener('wheel', onWheel, { passive: false });
  }

  public resize() {
    if (!this.container || this.isDestroyed) return;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight || 1;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  private loop() {
    if (this.isDestroyed) return;

    const delta = Math.min(this.clock.getDelta(), 0.1);
    this.timeElapsed += delta;

    // Smooth rotation damping
    this.ball.group.rotation.y = THREE.MathUtils.damp(
      this.ball.group.rotation.y,
      this.targetRotationY,
      8,
      delta
    );
    this.ball.group.rotation.x = THREE.MathUtils.damp(
      this.ball.group.rotation.x,
      this.targetRotationX,
      8,
      delta
    );

    // Auto idle gentle sway when not dragging (keeps face visible to player)
    if (!this.isDragging) {
      this.targetRotationY = THREE.MathUtils.damp(this.targetRotationY, Math.sin(this.timeElapsed * 1.4) * 0.22, 2, delta);
      this.targetRotationX = THREE.MathUtils.damp(this.targetRotationX, Math.cos(this.timeElapsed * 1.1) * 0.05, 2, delta);
    }

    // Gentle float bob centered around -0.32
    this.ball.group.position.y = -0.32 + Math.sin(this.timeElapsed * 2) * 0.05;

    // Camera distance damping (responsive for portrait vs landscape)
    const baseDist = this.camera.aspect < 1.0 ? this.targetCameraDist + 1.3 : this.targetCameraDist;
    this.camera.position.z = THREE.MathUtils.damp(
      this.camera.position.z,
      baseDist,
      6,
      delta
    );

    // Update ball idle & blinking
    this.ball.update(delta, false);

    // Render
    this.renderer.render(this.scene, this.camera);

    this.animFrameId = requestAnimationFrame(this.loop);
  }

  public dispose() {
    this.isDestroyed = true;
    cancelAnimationFrame(this.animFrameId);
    this.renderer.dispose();
    if (this.renderer.domElement && this.renderer.domElement.parentNode) {
      this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
    }
  }
}
