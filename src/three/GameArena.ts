/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { BallMesh } from './BallMesh';
import { BallConfig, DifficultyLevel, GameModeType } from '../types/ball';
import { sound } from '../utils/audio';
import { checkSphereBoxCollision, BoxBounds } from '../game/rules';

export interface GameArenaCallbacks {
  onScoreUpdate: (score: number, coins: number, stars: number) => void;
  onStarCollected: (collected: number, total: number) => void;
  onLevelComplete: (timeUsed: number) => void;
  onGameOver: () => void;
  onCheckpointReached: () => void;
}

interface PlatformData {
  mesh: THREE.Mesh;
  bounds: BoxBounds;
  isMoving?: boolean;
  moveSpeed?: number;
  moveRange?: number;
  moveAxis?: 'x' | 'y' | 'z';
  originPos?: THREE.Vector3;
  isBouncePad?: boolean;
}

interface CollectibleItem {
  id: string;
  type: 'coin' | 'star' | 'color-orb';
  mesh: THREE.Mesh;
  pos: THREE.Vector3;
  color?: string;
  collected: boolean;
}

interface HazardItem {
  mesh: THREE.Mesh;
  type: 'spinner' | 'bumper' | 'patrol';
  speed: number;
  bounds?: BoxBounds;
}

export class GameArena {
  private container: HTMLElement;
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private ballMesh: BallMesh;
  private clock: THREE.Clock;
  private animFrameId = 0;
  private isDestroyed = false;
  private isPaused = false;

  // Ball physics state
  private ballPos = new THREE.Vector3(0, 2, 0);
  private ballVel = new THREE.Vector3(0, 0, 0);
  private ballRadius = 0.5;
  private isGrounded = false;
  private checkpointPos = new THREE.Vector3(0, 2, 0);

  // Level & Mode
  private levelIndex = 0;
  private mode: GameModeType = 'arcade';
  private difficulty: DifficultyLevel = 'normal';
  private callbacks: GameArenaCallbacks;

  // Arena Objects
  private platforms: PlatformData[] = [];
  private collectibles: CollectibleItem[] = [];
  private hazards: HazardItem[] = [];
  private finishPortal: THREE.Mesh | null = null;
  private finishPos = new THREE.Vector3(0, 2, -40);

  // Stats
  private score = 0;
  private coins = 0;
  private starsCollected = 0;
  private totalStars = 0;
  private timeElapsed = 0;

  // Input states
  private inputX = 0;
  private inputZ = 0;
  private isJumpRequested = false;

  // Color Catcher mode specific
  public targetColor = '#3B82F6';

  constructor(
    container: HTMLElement,
    ballConfig: BallConfig,
    levelIndex: number,
    mode: GameModeType,
    difficulty: DifficultyLevel,
    callbacks: GameArenaCallbacks
  ) {
    this.container = container;
    this.levelIndex = levelIndex;
    this.mode = mode;
    this.difficulty = difficulty;
    this.callbacks = callbacks;
    this.clock = new THREE.Clock();

    // Scene & Camera
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(this.getBackgroundColor(levelIndex, mode));
    this.scene.fog = new THREE.FogExp2(this.scene.background.getHex(), 0.015);

    const aspect = container.clientWidth / (container.clientHeight || 1);
    this.camera = new THREE.PerspectiveCamera(50, aspect, 0.1, 150);

    // Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.1;
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.appendChild(this.renderer.domElement);

    // RoomEnvironment
    const pmremGenerator = new THREE.PMREMGenerator(this.renderer);
    this.scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // Lighting
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444466, 0.8);
    this.scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xfff8ee, 1.4);
    keyLight.position.set(10, 20, 10);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far = 100;
    keyLight.shadow.camera.left = -25;
    keyLight.shadow.camera.right = 25;
    keyLight.shadow.camera.top = 25;
    keyLight.shadow.camera.bottom = -25;
    keyLight.shadow.bias = -0.0005;
    this.scene.add(keyLight);

    // Ball
    this.ballMesh = new BallMesh(ballConfig);
    this.ballRadius = 0.5 * ballConfig.size;
    this.ballMesh.group.scale.setScalar(0.5); // scaled to comfortable arcade size
    this.ballMesh.group.rotation.y = Math.PI; // Face forward down the track
    this.scene.add(this.ballMesh.group);

    // Build Current Level
    this.buildLevel(levelIndex, mode);

    // Bind loop
    this.loop = this.loop.bind(this);
    this.loop();
  }

  private getBackgroundColor(levelIndex: number, mode: GameModeType): number {
    if (mode === 'relax') return 0xe0f2fe; // Calm morning sky
    if (mode === 'color-catcher') return 0x1e1b4b; // Deep night indigo
    if (mode === 'obstacle-escape') return 0x18181b; // High stakes dark gray

    switch (levelIndex) {
      case 0:
        return 0x0f172a; // Deep twilight arena
      case 1:
        return 0x1e1b4b; // Cosmic floating clouds
      case 2:
        return 0x2e1065; // Sunset royal purple
      case 3:
        return 0x020617; // Cyber dark synthwave
      case 4:
        return 0x312e81; // Crystal galaxy
      default:
        return 0x0f172a;
    }
  }

  public setInput(x: number, z: number, jump: boolean) {
    this.inputX = x;
    this.inputZ = z;
    if (jump) {
      this.isJumpRequested = true;
    }
  }

  public pause() {
    this.isPaused = true;
  }

  public resume() {
    this.isPaused = false;
    this.clock.getDelta(); // flush delta
  }

  public restart() {
    this.ballPos.copy(this.checkpointPos);
    this.ballVel.set(0, 0, 0);
    this.score = 0;
    this.coins = 0;
    this.starsCollected = 0;
    this.timeElapsed = 0;

    // Reactivate collectibles
    for (const c of this.collectibles) {
      c.collected = false;
      c.mesh.visible = true;
    }

    this.callbacks.onScoreUpdate(this.score, this.coins, this.starsCollected);
    this.callbacks.onStarCollected(this.starsCollected, this.totalStars);
    this.resume();
  }

  private buildLevel(levelIdx: number, mode: GameModeType) {
    // Clear old arena objects
    this.platforms = [];
    this.collectibles = [];
    this.hazards = [];

    // Helper: Add static or moving platform with 3D edge borders
    const addPlatform = (
      x: number,
      y: number,
      z: number,
      w: number,
      h: number,
      d: number,
      color: number,
      opts?: { isMoving?: boolean; moveAxis?: 'x' | 'y' | 'z'; moveRange?: number; moveSpeed?: number; isBouncePad?: boolean }
    ) => {
      const geom = new THREE.BoxGeometry(w, h, d);
      const mat = new THREE.MeshStandardMaterial({
        color,
        roughness: 0.25,
        metalness: 0.15,
      });
      const mesh = new THREE.Mesh(geom, mat);
      mesh.position.set(x, y, z);
      mesh.receiveShadow = true;
      mesh.castShadow = true;

      // Contrasting edge border frame for high visual clarity
      const frameGeom = new THREE.BoxGeometry(w + 0.08, h * 0.3, d + 0.08);
      const frameMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.5 });
      const frameMesh = new THREE.Mesh(frameGeom, frameMat);
      frameMesh.position.set(0, -h * 0.35, 0);
      mesh.add(frameMesh);

      this.scene.add(mesh);

      const bounds: BoxBounds = {
        minX: x - w / 2,
        maxX: x + w / 2,
        minY: y - h / 2,
        maxY: y + h / 2,
        minZ: z - d / 2,
        maxZ: z + d / 2,
      };

      this.platforms.push({
        mesh,
        bounds,
        isMoving: opts?.isMoving,
        moveAxis: opts?.moveAxis,
        moveRange: opts?.moveRange,
        moveSpeed: opts?.moveSpeed,
        originPos: new THREE.Vector3(x, y, z),
        isBouncePad: opts?.isBouncePad,
      });
    };

    // Helper: Add collectible (coin or star)
    const addCollectible = (x: number, y: number, z: number, type: 'coin' | 'star' | 'color-orb', colorHex?: string) => {
      let geom: THREE.BufferGeometry;
      let mat: THREE.Material;

      if (type === 'star') {
        geom = new THREE.OctahedronGeometry(0.35, 0);
        mat = new THREE.MeshStandardMaterial({
          color: 0xfacc15,
          emissive: 0xfacc15,
          emissiveIntensity: 0.6,
          metalness: 0.8,
          roughness: 0.2,
        });
      } else if (type === 'coin') {
        geom = new THREE.CylinderGeometry(0.24, 0.24, 0.08, 16);
        mat = new THREE.MeshStandardMaterial({
          color: 0xf59e0b,
          metalness: 0.9,
          roughness: 0.2,
        });
      } else {
        geom = new THREE.SphereGeometry(0.3, 16, 16);
        mat = new THREE.MeshStandardMaterial({
          color: new THREE.Color(colorHex || '#3B82F6'),
          emissive: new THREE.Color(colorHex || '#3B82F6'),
          emissiveIntensity: 0.5,
        });
      }

      const mesh = new THREE.Mesh(geom, mat);
      mesh.position.set(x, y, z);
      if (type === 'coin') mesh.rotation.x = Math.PI / 2;
      mesh.castShadow = true;
      this.scene.add(mesh);

      this.collectibles.push({
        id: `col_${this.collectibles.length}`,
        type,
        mesh,
        pos: new THREE.Vector3(x, y, z),
        color: colorHex,
        collected: false,
      });
    };

    // Helper: Add Finish Portal
    const addFinish = (x: number, y: number, z: number) => {
      this.finishPos.set(x, y + 1, z);
      const ringGeom = new THREE.TorusGeometry(1.6, 0.22, 16, 32);
      const ringMat = new THREE.MeshStandardMaterial({
        color: 0x10b981,
        emissive: 0x10b981,
        emissiveIntensity: 0.8,
        roughness: 0.2,
      });
      this.finishPortal = new THREE.Mesh(ringGeom, ringMat);
      this.finishPortal.position.set(x, y + 1.8, z);
      this.scene.add(this.finishPortal);
    };

    // Build specific mode or level
    if (mode === 'relax') {
      // Peaceful Zen Meadow
      this.ballPos.set(0, 2, 0);
      this.checkpointPos.copy(this.ballPos);
      addPlatform(0, 0, 0, 16, 1, 30, 0x86efac);
      addPlatform(0, 2, -35, 12, 1, 20, 0x6ee7b7);
      addPlatform(0, 4, -65, 14, 1, 20, 0x5eead4);

      for (let z = -10; z >= -70; z -= 8) {
        addCollectible((Math.random() - 0.5) * 6, 1.5, z, 'coin');
      }
      addCollectible(0, 5.5, -65, 'star');
      addFinish(0, 4, -72);
    } else if (mode === 'color-catcher') {
      // Color Catcher Arena
      this.ballPos.set(0, 2, 0);
      this.checkpointPos.copy(this.ballPos);
      addPlatform(0, 0, 0, 24, 1, 24, 0x1e293b);

      const colors = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#EC4899'];
      this.targetColor = colors[Math.floor(Math.random() * colors.length)];

      for (let i = 0; i < 20; i++) {
        const col = colors[i % colors.length];
        const rx = (Math.random() - 0.5) * 18;
        const rz = (Math.random() - 0.5) * 18;
        addCollectible(rx, 1.2, rz, 'color-orb', col);
      }
    } else if (mode === 'obstacle-escape') {
      // Obstacle Escape
      this.ballPos.set(0, 2, 0);
      this.checkpointPos.copy(this.ballPos);
      addPlatform(0, 0, -40, 10, 1, 100, 0x334155);

      for (let z = -10; z >= -80; z -= 10) {
        // Spinning hazard bars
        const hazardGeom = new THREE.BoxGeometry(7, 0.6, 0.6);
        const hazardMat = new THREE.MeshStandardMaterial({ color: 0xef4444, emissive: 0xef4444, emissiveIntensity: 0.5 });
        const hMesh = new THREE.Mesh(hazardGeom, hazardMat);
        hMesh.position.set(0, 1.2, z);
        this.scene.add(hMesh);
        this.hazards.push({ mesh: hMesh, type: 'spinner', speed: 2.2 });
        addCollectible((Math.random() - 0.5) * 4, 1.2, z + 5, 'coin');
      }
      addFinish(0, 0, -88);
    } else {
      // 5 Classic Arcade Levels
      switch (levelIdx) {
        case 0: // Level 1: Colorful Training Arena
          this.ballPos.set(0, 2, 0);
          this.checkpointPos.copy(this.ballPos);
          addPlatform(0, 0, 0, 8, 1, 12, 0x60a5fa); // Start pad
          addPlatform(0, 0, -14, 6, 1, 12, 0x34d399); // Safe walkway
          addPlatform(0, 1.5, -28, 6, 1, 10, 0xfbbf24); // Raised step
          addPlatform(0, 2.5, -42, 8, 1, 12, 0xa78bfa); // Finish arena

          // Collectibles
          addCollectible(0, 1.2, -4, 'coin');
          addCollectible(-1.5, 1.2, -12, 'coin');
          addCollectible(1.5, 1.2, -16, 'coin');
          addCollectible(0, 2.8, -28, 'star');
          addCollectible(0, 3.8, -42, 'star');
          addFinish(0, 2.5, -46);
          break;

        case 1: // Level 2: Floating Platforms
          this.ballPos.set(0, 2, 0);
          this.checkpointPos.copy(this.ballPos);
          addPlatform(0, 0, 0, 7, 1, 8, 0x38bdf8);
          // Moving platform across X
          addPlatform(0, 0, -12, 5, 0.8, 5, 0xf472b6, {
            isMoving: true,
            moveAxis: 'x',
            moveRange: 4,
            moveSpeed: 1.5,
          });
          addPlatform(0, 1, -22, 6, 1, 7, 0x818cf8);
          // Bounce pad
          addPlatform(0, 1.2, -32, 4, 0.8, 4, 0x4ade80, { isBouncePad: true });
          addPlatform(0, 4, -44, 8, 1, 10, 0xfb923c);

          addCollectible(0, 1.2, -3, 'coin');
          addCollectible(0, 2.2, -22, 'star');
          addCollectible(0, 5.2, -44, 'star');
          addFinish(0, 4, -48);
          break;

        case 2: // Level 3: Moving Obstacles
          this.ballPos.set(0, 2, 0);
          this.checkpointPos.copy(this.ballPos);
          addPlatform(0, 0, 0, 8, 1, 10, 0xf59e0b);
          addPlatform(0, 0, -18, 6, 1, 20, 0xd97706);
          addPlatform(0, 1.5, -38, 8, 1, 14, 0xb45309);

          // Add spinning hazard bar
          const spinGeom = new THREE.BoxGeometry(5.5, 0.5, 0.5);
          const spinMat = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.2 });
          const spinMesh = new THREE.Mesh(spinGeom, spinMat);
          spinMesh.position.set(0, 1.0, -18);
          this.scene.add(spinMesh);
          this.hazards.push({ mesh: spinMesh, type: 'spinner', speed: 2.5 });

          addCollectible(-1.8, 1.2, -14, 'coin');
          addCollectible(1.8, 1.2, -22, 'coin');
          addCollectible(0, 1.5, -18, 'star');
          addCollectible(0, 2.8, -38, 'star');
          addFinish(0, 1.5, -43);
          break;

        case 3: // Level 4: Neon Challenge
          this.ballPos.set(0, 2, 0);
          this.checkpointPos.copy(this.ballPos);
          addPlatform(0, 0, 0, 8, 1, 10, 0x06b6d4);
          addPlatform(0, 0, -16, 5, 1, 16, 0x8b5cf6);
          addPlatform(0, 2, -34, 6, 1, 6, 0xec4899, {
            isMoving: true,
            moveAxis: 'z',
            moveRange: 5,
            moveSpeed: 2.0,
          });
          addPlatform(0, 3, -50, 9, 1, 12, 0x10b981);

          addCollectible(0, 1.2, -12, 'coin');
          addCollectible(0, 1.2, -20, 'coin');
          addCollectible(0, 3.2, -34, 'star');
          addCollectible(0, 4.4, -50, 'star');
          addFinish(0, 3, -55);
          break;

        case 4: // Level 5: Magic Crystal Arena
        default:
          this.ballPos.set(0, 2, 0);
          this.checkpointPos.copy(this.ballPos);
          addPlatform(0, 0, 0, 9, 1, 10, 0x7c3aed);
          addPlatform(0, 1, -16, 6, 1, 12, 0xa855f7);
          addPlatform(0, 2.5, -32, 5, 1, 5, 0xc084fc, {
            isMoving: true,
            moveAxis: 'y',
            moveRange: 2,
            moveSpeed: 1.8,
          });
          addPlatform(0, 4.5, -48, 10, 1, 14, 0xec4899);

          addCollectible(0, 1.2, -4, 'coin');
          addCollectible(-1.5, 2.2, -16, 'coin');
          addCollectible(1.5, 2.2, -16, 'coin');
          addCollectible(0, 2.2, -16, 'star');
          addCollectible(0, 5.8, -48, 'star');
          addFinish(0, 4.5, -53);
          break;
      }
    }

    // Tally stars
    this.totalStars = this.collectibles.filter((c) => c.type === 'star').length;
    this.callbacks.onStarCollected(0, this.totalStars);
    this.callbacks.onScoreUpdate(0, 0, 0);
  }

  private loop() {
    if (this.isDestroyed) return;

    const delta = Math.min(this.clock.getDelta(), 0.08);

    if (!this.isPaused) {
      this.timeElapsed += delta;
      this.updatePhysics(delta);
      this.updateArenaObjects(delta);
    }

    // Camera follow (smooth 3rd person behind ball looking forward down the track)
    const isPortrait = this.camera.aspect < 1.0;
    const targetCamX = this.ballPos.x;
    const targetCamY = this.ballPos.y + (isPortrait ? 4.2 : 3.4);
    const targetCamZ = this.ballPos.z + (isPortrait ? 8.5 : 6.2);
    this.camera.position.x = THREE.MathUtils.damp(this.camera.position.x, targetCamX, 7, delta);
    this.camera.position.y = THREE.MathUtils.damp(this.camera.position.y, targetCamY, 7, delta);
    this.camera.position.z = THREE.MathUtils.damp(this.camera.position.z, targetCamZ, 7, delta);
    this.camera.lookAt(this.ballPos.x, this.ballPos.y + 0.4, this.ballPos.z - 6.0);

    // Update ball idle & particles
    const isMoving = this.ballVel.lengthSq() > 0.1;
    this.ballMesh.update(delta, isMoving);

    // Render
    this.renderer.render(this.scene, this.camera);

    this.animFrameId = requestAnimationFrame(this.loop);
  }

  private updatePhysics(delta: number) {
    const accel = 28;
    const maxSpeed = 10;
    const friction = 6;
    const gravity = -24;
    const jumpVelocity = 9.5;

    // Movement Input
    if (Math.abs(this.inputX) > 0.01) {
      this.ballVel.x += this.inputX * accel * delta;
    } else {
      this.ballVel.x = THREE.MathUtils.damp(this.ballVel.x, 0, friction, delta);
    }

    if (Math.abs(this.inputZ) > 0.01) {
      this.ballVel.z += this.inputZ * accel * delta;
    } else {
      this.ballVel.z = THREE.MathUtils.damp(this.ballVel.z, 0, friction, delta);
    }

    // Clamp horizontal speed
    const horizSpeed = Math.sqrt(this.ballVel.x * this.ballVel.x + this.ballVel.z * this.ballVel.z);
    if (horizSpeed > maxSpeed) {
      this.ballVel.x = (this.ballVel.x / horizSpeed) * maxSpeed;
      this.ballVel.z = (this.ballVel.z / horizSpeed) * maxSpeed;
    }

    // Gravity
    this.ballVel.y += gravity * delta;

    // Jump
    if (this.isJumpRequested && this.isGrounded) {
      this.ballVel.y = jumpVelocity;
      this.isGrounded = false;
      this.ballMesh.applySquish(1.4);
      sound.playSfx('jump');
    }
    this.isJumpRequested = false;

    // Integrate position
    this.ballPos.x += this.ballVel.x * delta;
    this.ballPos.y += this.ballVel.y * delta;
    this.ballPos.z += this.ballVel.z * delta;

    // Platform Collisions
    this.isGrounded = false;
    for (const plat of this.platforms) {
      const col = checkSphereBoxCollision(
        this.ballPos.x,
        this.ballPos.y,
        this.ballPos.z,
        this.ballRadius,
        plat.bounds
      );

      if (col.collided) {
        // Resolve penetration
        this.ballPos.x += col.normalX * col.depth;
        this.ballPos.y += col.normalY * col.depth;
        this.ballPos.z += col.normalZ * col.depth;

        // If landing on top
        if (col.normalY > 0.5) {
          if (this.ballVel.y < -3) {
            this.ballMesh.applySquish(Math.abs(this.ballVel.y));
            sound.playSfx('bounce');
          }
          if (plat.isBouncePad) {
            this.ballVel.y = 16; // Super bounce!
            sound.playSfx('jump');
          } else {
            this.ballVel.y = 0;
            this.isGrounded = true;
          }
        } else if (col.normalY < -0.5) {
          this.ballVel.y = Math.min(0, this.ballVel.y);
        }

        // Horizontal bounce/slide
        if (Math.abs(col.normalX) > 0.5) this.ballVel.x = 0;
        if (Math.abs(col.normalZ) > 0.5) this.ballVel.z = 0;
      }
    }

    // Rolling rotation matching ground velocity
    this.ballMesh.group.position.copy(this.ballPos);
    this.ballMesh.group.rotation.x += (this.ballVel.z / this.ballRadius) * delta;
    this.ballMesh.group.rotation.z -= (this.ballVel.x / this.ballRadius) * delta;

    // Void fall detection
    if (this.ballPos.y < -15) {
      sound.playSfx('hit');
      this.ballPos.copy(this.checkpointPos);
      this.ballVel.set(0, 0, 0);
      this.ballMesh.applySquish(1.8);
    }
  }

  private updateArenaObjects(delta: number) {
    // 1. Moving platforms
    for (const plat of this.platforms) {
      if (plat.isMoving && plat.originPos && plat.moveAxis && plat.moveRange && plat.moveSpeed) {
        const offset = Math.sin(this.timeElapsed * plat.moveSpeed) * plat.moveRange;
        if (plat.moveAxis === 'x') {
          plat.mesh.position.x = plat.originPos.x + offset;
        } else if (plat.moveAxis === 'y') {
          plat.mesh.position.y = plat.originPos.y + offset;
        } else if (plat.moveAxis === 'z') {
          plat.mesh.position.z = plat.originPos.z + offset;
        }

        // Recompute platform bounds
        const geom = plat.mesh.geometry as THREE.BoxGeometry;
        const w = geom.parameters.width;
        const h = geom.parameters.height;
        const d = geom.parameters.depth;
        plat.bounds = {
          minX: plat.mesh.position.x - w / 2,
          maxX: plat.mesh.position.x + w / 2,
          minY: plat.mesh.position.y - h / 2,
          maxY: plat.mesh.position.y + h / 2,
          minZ: plat.mesh.position.z - d / 2,
          maxZ: plat.mesh.position.z + d / 2,
        };
      }
    }

    // 2. Spinning & Patrol hazards
    for (const h of this.hazards) {
      if (h.type === 'spinner') {
        h.mesh.rotation.y += h.speed * delta;
      }

      // Check ball collision with hazard
      const dist = h.mesh.position.distanceTo(this.ballPos);
      if (dist < 2.2) {
        // Knockback penalty
        sound.playSfx('hit');
        this.ballMesh.applySquish(2.2);
        this.ballVel.y = 8;
        this.ballVel.z += 6;
      }
    }

    // 3. Collectibles animation & pickup check
    for (let i = 0; i < this.collectibles.length; i++) {
      const c = this.collectibles[i];
      if (c.collected) continue;

      c.mesh.rotation.y += delta * 2.8;
      c.mesh.position.y = c.pos.y + Math.sin(this.timeElapsed * 3.5 + i) * 0.12;

      const dist = this.ballPos.distanceTo(c.pos);
      if (dist < this.ballRadius + 0.45) {
        c.collected = true;
        c.mesh.visible = false;

        if (c.type === 'coin') {
          this.coins += 1;
          this.score += 20;
          sound.playSfx('collect');
        } else if (c.type === 'star') {
          this.starsCollected += 1;
          this.score += 100;
          sound.playSfx('star');
          this.callbacks.onStarCollected(this.starsCollected, this.totalStars);
        } else if (c.type === 'color-orb') {
          if (c.color === this.targetColor) {
            this.score += 50;
            this.coins += 2;
            sound.playSfx('star');
          } else {
            this.score = Math.max(0, this.score - 20);
            sound.playSfx('hit');
          }
        }

        this.callbacks.onScoreUpdate(this.score, this.coins, this.starsCollected);
      }
    }

    // 4. Finish Portal check
    if (this.finishPortal) {
      this.finishPortal.rotation.z += delta * 1.5;
      const distToGoal = this.ballPos.distanceTo(this.finishPos);
      if (distToGoal < 2.0) {
        sound.playSfx('win');
        this.callbacks.onLevelComplete(Math.round(this.timeElapsed));
        this.pause();
      }
    }
  }

  public resize() {
    if (!this.container || this.isDestroyed) return;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight || 1;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
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
