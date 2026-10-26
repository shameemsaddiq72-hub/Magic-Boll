/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { BallConfig } from '../types/ball';
import { getPatternTexture } from '../utils/textures';

export class BallMesh {
  public group: THREE.Group;
  public bodyMesh: THREE.Mesh;
  public leftEyeGroup: THREE.Group;
  public rightEyeGroup: THREE.Group;
  public leftSclera: THREE.Mesh;
  public rightSclera: THREE.Mesh;
  public leftPupil: THREE.Mesh;
  public rightPupil: THREE.Mesh;
  public leftHighlight: THREE.Mesh;
  public rightHighlight: THREE.Mesh;
  public leftLidUpper: THREE.Mesh;
  public rightLidUpper: THREE.Mesh;
  public leftEyebrow: THREE.Mesh;
  public rightEyebrow: THREE.Mesh;
  public mouthMesh: THREE.Mesh;
  public accessoryGroup: THREE.Group;
  public auraLight: THREE.PointLight;
  public particlesGroup: THREE.Group;

  private currentConfig: BallConfig;
  private blinkProgress = 0;
  private isBlinking = false;
  private nextBlinkTime = 2.5;
  private timeElapsed = 0;
  private squishFactor = new THREE.Vector3(1, 1, 1);
  private trailParticles: { mesh: THREE.Mesh; vel: THREE.Vector3; life: number; maxLife: number }[] = [];

  constructor(initialConfig: BallConfig) {
    this.currentConfig = initialConfig;
    this.group = new THREE.Group();

    // 1. Body Mesh
    const bodyGeom = new THREE.SphereGeometry(1, 64, 64);
    const bodyMat = this.createBodyMaterial(initialConfig);
    this.bodyMesh = new THREE.Mesh(bodyGeom, bodyMat);
    this.bodyMesh.castShadow = true;
    this.bodyMesh.receiveShadow = true;
    this.group.add(this.bodyMesh);

    // 2. Eyes Container
    this.leftEyeGroup = new THREE.Group();
    this.rightEyeGroup = new THREE.Group();

    // Sclera (White cartoon oval base, contoured to ball)
    const eyeGeom = new THREE.SphereGeometry(0.25, 32, 32);
    const scleraMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.1,
      metalness: 0.05,
    });
    this.leftSclera = new THREE.Mesh(eyeGeom, scleraMat);
    this.rightSclera = new THREE.Mesh(eyeGeom, scleraMat.clone());
    this.leftSclera.scale.set(1, 1.15, 0.45);
    this.rightSclera.scale.set(1, 1.15, 0.45);
    this.leftEyeGroup.add(this.leftSclera);
    this.rightEyeGroup.add(this.rightSclera);

    // Pupils
    const pupilGeom = new THREE.SphereGeometry(0.14, 24, 24);
    const pupilMatL = new THREE.MeshStandardMaterial({
      color: new THREE.Color(initialConfig.eyes.leftColor),
      roughness: 0.2,
      metalness: 0.1,
    });
    const pupilMatR = new THREE.MeshStandardMaterial({
      color: new THREE.Color(initialConfig.eyes.rightColor),
      roughness: 0.2,
      metalness: 0.1,
    });
    this.leftPupil = new THREE.Mesh(pupilGeom, pupilMatL);
    this.rightPupil = new THREE.Mesh(pupilGeom, pupilMatR);
    this.leftPupil.scale.set(1, 1.15, 0.35);
    this.rightPupil.scale.set(1, 1.15, 0.35);
    this.leftPupil.position.set(0, 0, 0.08);
    this.rightPupil.position.set(0, 0, 0.08);
    this.leftEyeGroup.add(this.leftPupil);
    this.rightEyeGroup.add(this.rightPupil);

    // Eye Highlights (Shine)
    const shineGeom = new THREE.SphereGeometry(0.045, 16, 16);
    const shineMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    this.leftHighlight = new THREE.Mesh(shineGeom, shineMat);
    this.rightHighlight = new THREE.Mesh(shineGeom, shineMat);
    this.leftHighlight.position.set(0.05, 0.06, 0.14);
    this.rightHighlight.position.set(0.05, 0.06, 0.14);
    this.leftEyeGroup.add(this.leftHighlight);
    this.rightEyeGroup.add(this.rightHighlight);

    // Eyelids (Upper dome for blinking/expressions)
    const lidGeom = new THREE.SphereGeometry(0.25, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2);
    const lidMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(initialConfig.color),
      roughness: 0.3,
    });
    this.leftLidUpper = new THREE.Mesh(lidGeom, lidMat);
    this.rightLidUpper = new THREE.Mesh(lidGeom, lidMat.clone());
    this.leftLidUpper.position.set(0, 0, 0.02);
    this.rightLidUpper.position.set(0, 0, 0.02);
    this.leftLidUpper.rotation.x = -Math.PI / 2;
    this.rightLidUpper.rotation.x = -Math.PI / 2;
    this.leftEyeGroup.add(this.leftLidUpper);
    this.rightEyeGroup.add(this.rightLidUpper);

    // Eyebrows (smooth rounded capsules)
    const browGeom = new THREE.CapsuleGeometry(0.025, 0.2, 8, 16);
    const browMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.35 });
    this.leftEyebrow = new THREE.Mesh(browGeom, browMat);
    this.rightEyebrow = new THREE.Mesh(browGeom, browMat.clone());
    this.leftEyebrow.rotation.z = Math.PI / 2;
    this.rightEyebrow.rotation.z = Math.PI / 2;
    this.leftEyebrow.position.set(0, 0.26, 0.08);
    this.rightEyebrow.position.set(0, 0.26, 0.08);
    this.leftEyeGroup.add(this.leftEyebrow);
    this.rightEyeGroup.add(this.rightEyebrow);

    // Position Left and Right Eyes on ball front
    this.group.add(this.leftEyeGroup);
    this.group.add(this.rightEyeGroup);

    // 3. Cute Mouth
    const mouthGeom = new THREE.TorusGeometry(0.12, 0.022, 12, 24, Math.PI);
    const mouthMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.6 });
    this.mouthMesh = new THREE.Mesh(mouthGeom, mouthMat);
    this.mouthMesh.position.set(0, -0.22, 0.94);
    this.mouthMesh.rotation.z = Math.PI; // Happy smile arc
    this.group.add(this.mouthMesh);

    // 4. Accessory Group
    this.accessoryGroup = new THREE.Group();
    this.group.add(this.accessoryGroup);

    // 5. Light Aura
    this.auraLight = new THREE.PointLight(new THREE.Color(initialConfig.color), 0, 4);
    this.auraLight.position.set(0, 0, 0);
    this.group.add(this.auraLight);

    // 6. Particles Group
    this.particlesGroup = new THREE.Group();
    this.group.add(this.particlesGroup);

    // Build accessory & configure initial parameters
    this.updateConfig(initialConfig);
  }

  public updateConfig(config: BallConfig) {
    this.currentConfig = config;

    // Body material & texture
    const newMat = this.createBodyMaterial(config);
    this.bodyMesh.material = newMat;

    // Ball Shape & Size
    let sx = config.size;
    let sy = config.size;
    let sz = config.size;
    if (config.shape === 'squishy') {
      sx *= 1.1;
      sy *= 0.9;
      sz *= 1.1;
    } else if (config.shape === 'jelly') {
      sx *= 1.05;
      sy *= 0.95;
      sz *= 1.05;
    } else if (config.shape === 'puffy') {
      sx *= 1.08;
      sy *= 1.08;
      sz *= 1.08;
    }
    this.bodyMesh.scale.set(sx, sy, sz);

    // Update Eyelids color to match ball
    (this.leftLidUpper.material as THREE.MeshStandardMaterial).color.set(config.color);
    (this.rightLidUpper.material as THREE.MeshStandardMaterial).color.set(config.color);

    // Eye Colors (independent!)
    (this.leftPupil.material as THREE.MeshStandardMaterial).color.set(config.eyes.leftColor);
    (this.rightPupil.material as THREE.MeshStandardMaterial).color.set(
      config.eyes.lockTogether ? config.eyes.leftColor : config.eyes.rightColor
    );

    // Eye Positions & Spacing
    const eyeSpacing = 0.36 * config.eyes.spacing;
    const eyeForward = 0.91;
    const eyeHeight = 0.16;
    this.leftEyeGroup.position.set(-eyeSpacing, eyeHeight, eyeForward);
    this.rightEyeGroup.position.set(eyeSpacing, eyeHeight, eyeForward);

    // Contoured angle facing outward slightly
    this.leftEyeGroup.rotation.y = -0.32;
    this.leftEyeGroup.rotation.x = -0.06;
    this.rightEyeGroup.rotation.y = 0.32;
    this.rightEyeGroup.rotation.x = -0.06;

    // Eye Scale & Pupil scale
    const baseEyeScale = 0.95 * config.eyes.size;
    this.leftEyeGroup.scale.set(baseEyeScale, baseEyeScale, baseEyeScale);
    this.rightEyeGroup.scale.set(baseEyeScale, baseEyeScale, baseEyeScale);

    const pupilScale = config.eyes.pupilSize;
    this.leftPupil.scale.set(pupilScale, pupilScale * 1.15, pupilScale * 0.35);
    this.rightPupil.scale.set(pupilScale, pupilScale * 1.15, pupilScale * 0.35);

    // Pupil Direction
    const pOffsetX = config.eyes.pupilDirX * 0.05;
    const pOffsetY = config.eyes.pupilDirY * 0.05;
    this.leftPupil.position.set(pOffsetX, pOffsetY, 0.08);
    this.rightPupil.position.set(pOffsetX, pOffsetY, 0.08);

    // Shine visibility
    this.leftHighlight.visible = config.eyes.shine;
    this.rightHighlight.visible = config.eyes.shine;

    // Eye Expressions & Shape Eyelids
    this.applyExpression(config.eyes.expression, config.eyes.shape);

    // Accessory Reconstruction
    this.buildAccessory(config.accessory, config.accessoryColor);

    // Aura Light & Glow
    if (config.effect === 'neon-glow' || config.effect === 'magical-aura') {
      this.auraLight.color.set(config.color);
      this.auraLight.intensity = (config.effectIntensity || 1) * 2.5;
    } else {
      this.auraLight.intensity = 0;
    }

    // Reset particles for trail
    this.initParticles(config.effect);
  }

  private createBodyMaterial(config: BallConfig): THREE.Material {
    const tex = getPatternTexture(
      config.pattern,
      config.color,
      config.patternColor,
      config.gradient,
      config.patternScale
    );

    const baseColor = tex ? 0xffffff : new THREE.Color(config.color);

    switch (config.material) {
      case 'rubber':
        return new THREE.MeshStandardMaterial({
          map: tex,
          color: baseColor,
          roughness: 0.85,
          metalness: 0.05,
        });

      case 'chrome':
        return new THREE.MeshStandardMaterial({
          map: tex,
          color: baseColor,
          roughness: 0.08,
          metalness: 0.92,
        });

      case 'gold':
        return new THREE.MeshPhysicalMaterial({
          map: tex,
          color: 0xf59e0b,
          roughness: 0.15,
          metalness: 0.95,
          clearcoat: 0.6,
        });

      case 'silver':
        return new THREE.MeshPhysicalMaterial({
          map: tex,
          color: 0xe2e8f0,
          roughness: 0.12,
          metalness: 0.92,
          clearcoat: 0.5,
        });

      case 'glass':
        return new THREE.MeshPhysicalMaterial({
          map: tex,
          color: baseColor,
          roughness: 0.08,
          metalness: 0.1,
          transmission: 0.85,
          thickness: 1.0,
          transparent: true,
          opacity: 0.85,
          ior: 1.5,
        });

      case 'crystal':
        return new THREE.MeshPhysicalMaterial({
          map: tex,
          color: baseColor,
          roughness: 0.1,
          metalness: 0.1,
          transmission: 0.65,
          thickness: 1.5,
          clearcoat: 1.0,
          clearcoatRoughness: 0.05,
          ior: 1.7,
        });

      case 'neon':
        return new THREE.MeshStandardMaterial({
          map: tex,
          color: baseColor,
          emissive: new THREE.Color(config.color),
          emissiveIntensity: 0.7,
          roughness: 0.25,
          metalness: 0.2,
        });

      case 'jelly':
        return new THREE.MeshPhysicalMaterial({
          map: tex,
          color: baseColor,
          roughness: 0.2,
          metalness: 0.05,
          transmission: 0.55,
          clearcoat: 0.9,
          transparent: true,
          opacity: 0.92,
        });

      case 'holographic':
        return new THREE.MeshPhysicalMaterial({
          map: tex,
          color: baseColor,
          roughness: 0.12,
          metalness: 0.3,
          iridescence: 0.95,
          iridescenceIOR: 1.6,
          clearcoat: 0.8,
        });

      case 'ice':
        return new THREE.MeshPhysicalMaterial({
          map: tex,
          color: 0x93c5fd,
          roughness: 0.25,
          metalness: 0.1,
          transmission: 0.75,
          clearcoat: 0.9,
          ior: 1.31,
        });

      case 'lava':
        return new THREE.MeshStandardMaterial({
          map: tex,
          color: 0x991b1b,
          emissive: 0xf97316,
          emissiveIntensity: 0.8,
          roughness: 0.6,
          metalness: 0.1,
        });

      case 'galaxy':
        return new THREE.MeshPhysicalMaterial({
          map: tex,
          color: 0x312e81,
          roughness: 0.2,
          metalness: 0.5,
          clearcoat: 0.9,
          clearcoatRoughness: 0.1,
        });

      case 'glossy':
      default:
        return new THREE.MeshPhysicalMaterial({
          map: tex,
          color: baseColor,
          roughness: 0.15,
          metalness: 0.1,
          clearcoat: 0.9,
          clearcoatRoughness: 0.1,
        });
    }
  }

  private applyExpression(expression: string, shape: string) {
    // Reset rotations (horizontal capsule baseline)
    const baseRotZ = Math.PI / 2;
    this.leftEyebrow.rotation.set(0, 0, baseRotZ);
    this.rightEyebrow.rotation.set(0, 0, baseRotZ);
    this.mouthMesh.rotation.set(0, 0, Math.PI);
    this.mouthMesh.scale.set(1, 1, 1);

    // Eyelid angle
    let lidAngle = -Math.PI / 2; // fully open

    switch (expression) {
      case 'angry':
        this.leftEyebrow.rotation.z = baseRotZ - 0.35;
        this.rightEyebrow.rotation.z = baseRotZ + 0.35;
        lidAngle = -Math.PI * 0.35;
        this.mouthMesh.rotation.z = 0; // frown
        break;

      case 'sad':
        this.leftEyebrow.rotation.z = baseRotZ + 0.3;
        this.rightEyebrow.rotation.z = baseRotZ - 0.3;
        lidAngle = -Math.PI * 0.38;
        this.mouthMesh.rotation.z = 0; // frown
        break;

      case 'excited':
        this.leftEyebrow.position.y = 0.32;
        this.rightEyebrow.position.y = 0.32;
        this.mouthMesh.scale.set(1.3, 1.4, 1.3);
        break;

      case 'sleepy':
        lidAngle = -Math.PI * 0.28;
        this.mouthMesh.scale.set(0.6, 0.4, 0.6);
        break;

      case 'surprised':
        this.leftEyebrow.position.y = 0.34;
        this.rightEyebrow.position.y = 0.34;
        this.mouthMesh.rotation.z = 0;
        this.mouthMesh.scale.set(0.7, 1.6, 0.7); // 'O' mouth
        break;

      case 'confused':
        this.leftEyebrow.position.y = 0.32;
        this.leftEyebrow.rotation.z = baseRotZ + 0.25;
        this.rightEyebrow.position.y = 0.25;
        this.rightEyebrow.rotation.z = baseRotZ - 0.15;
        lidAngle = -Math.PI * 0.38;
        this.mouthMesh.rotation.z = 0.4;
        break;

      case 'laughing':
        lidAngle = -Math.PI * 0.2; // closed eye squint
        this.mouthMesh.scale.set(1.4, 1.6, 1.4);
        break;

      case 'wink':
        this.rightLidUpper.rotation.x = -Math.PI * 0.08; // right eye closed
        lidAngle = -Math.PI / 2; // left eye open
        this.mouthMesh.rotation.z = Math.PI - 0.2;
        break;

      case 'love-struck':
        this.leftEyebrow.position.y = 0.3;
        this.rightEyebrow.position.y = 0.3;
        this.mouthMesh.scale.set(1.2, 1.2, 1.2);
        break;

      case 'happy':
      default:
        this.leftEyebrow.position.y = 0.28;
        this.rightEyebrow.position.y = 0.28;
        break;
    }

    if (expression !== 'wink') {
      this.leftLidUpper.rotation.x = lidAngle;
      this.rightLidUpper.rotation.x = lidAngle;
    } else {
      this.leftLidUpper.rotation.x = lidAngle;
    }

    // Pupil style geometry tweaks
    if (shape === 'robot') {
      this.leftPupil.scale.set(1.2, 0.5, 0.8);
      this.rightPupil.scale.set(1.2, 0.5, 0.8);
    } else if (shape === 'star') {
      this.leftPupil.scale.set(0.9, 0.9, 0.9);
      this.rightPupil.scale.set(0.9, 0.9, 0.9);
    } else if (shape === 'heart') {
      this.leftPupil.scale.set(1.0, 1.1, 1.0);
      this.rightPupil.scale.set(1.0, 1.1, 1.0);
    }
  }

  private buildAccessory(type: string, colorHex: string) {
    // Clear old accessories
    while (this.accessoryGroup.children.length > 0) {
      const child = this.accessoryGroup.children[0];
      this.accessoryGroup.remove(child);
      if (child instanceof THREE.Mesh) {
        child.geometry.dispose();
        if (Array.isArray(child.material)) child.material.forEach((m) => m.dispose());
        else child.material.dispose();
      }
    }

    if (type === 'none') return;

    const accColor = new THREE.Color(colorHex);
    const goldMat = new THREE.MeshStandardMaterial({ color: accColor, metalness: 0.8, roughness: 0.2 });

    switch (type) {
      case 'crown': {
        const crownBase = new THREE.CylinderGeometry(0.5, 0.45, 0.25, 16);
        const crownMesh = new THREE.Mesh(crownBase, goldMat);
        crownMesh.position.set(0, 1.08, 0);

        // 5 spikes on top
        for (let i = 0; i < 5; i++) {
          const angle = (i / 5) * Math.PI * 2;
          const cone = new THREE.ConeGeometry(0.1, 0.35, 8);
          const spike = new THREE.Mesh(cone, goldMat);
          spike.position.set(Math.cos(angle) * 0.45, 0.28, Math.sin(angle) * 0.45);
          crownMesh.add(spike);

          // Jewel bead
          const bead = new THREE.SphereGeometry(0.06, 12, 12);
          const beadMat = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.1 });
          const jewel = new THREE.Mesh(bead, beadMat);
          jewel.position.set(Math.cos(angle) * 0.45, 0.48, Math.sin(angle) * 0.45);
          crownMesh.add(jewel);
        }
        this.accessoryGroup.add(crownMesh);
        break;
      }

      case 'hat': {
        const brimGeom = new THREE.CylinderGeometry(0.7, 0.7, 0.06, 24);
        const topGeom = new THREE.CylinderGeometry(0.42, 0.48, 0.55, 24);
        const hatMat = new THREE.MeshStandardMaterial({ color: accColor, roughness: 0.4 });
        const brim = new THREE.Mesh(brimGeom, hatMat);
        const top = new THREE.Mesh(topGeom, hatMat);
        top.position.set(0, 0.28, 0);
        brim.add(top);
        brim.position.set(0, 1.02, 0.1);
        brim.rotation.x = -0.15;
        this.accessoryGroup.add(brim);
        break;
      }

      case 'sunglasses': {
        const frameMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.2 });
        const lensMat = new THREE.MeshPhysicalMaterial({
          color: accColor,
          roughness: 0.1,
          metalness: 0.5,
          transmission: 0.4,
          transparent: true,
          opacity: 0.85,
        });
        const frame = new THREE.BoxGeometry(1.05, 0.28, 0.08);
        const frameMesh = new THREE.Mesh(frame, frameMat);
        frameMesh.position.set(0, 0.2, 0.98);

        const lensGeom = new THREE.BoxGeometry(0.42, 0.22, 0.04);
        const leftLens = new THREE.Mesh(lensGeom, lensMat);
        const rightLens = new THREE.Mesh(lensGeom, lensMat);
        leftLens.position.set(-0.25, 0, 0.03);
        rightLens.position.set(0.25, 0, 0.03);
        frameMesh.add(leftLens);
        frameMesh.add(rightLens);
        this.accessoryGroup.add(frameMesh);
        break;
      }

      case 'headphones': {
        const bandGeom = new THREE.TorusGeometry(0.98, 0.06, 12, 24, Math.PI);
        const bandMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.3 });
        const band = new THREE.Mesh(bandGeom, bandMat);
        band.position.set(0, 0.3, 0);
        band.rotation.z = Math.PI;

        const cupGeom = new THREE.CylinderGeometry(0.32, 0.32, 0.2, 16);
        const cupMat = new THREE.MeshStandardMaterial({ color: accColor, roughness: 0.2 });
        const leftCup = new THREE.Mesh(cupGeom, cupMat);
        const rightCup = new THREE.Mesh(cupGeom, cupMat);
        leftCup.position.set(-1.02, 0, 0);
        leftCup.rotation.z = Math.PI / 2;
        rightCup.position.set(1.02, 0, 0);
        rightCup.rotation.z = Math.PI / 2;
        band.add(leftCup);
        band.add(rightCup);
        this.accessoryGroup.add(band);
        break;
      }

      case 'bow': {
        const knotGeom = new THREE.SphereGeometry(0.12, 16, 16);
        const loopGeom = new THREE.ConeGeometry(0.24, 0.42, 16);
        const bowMat = new THREE.MeshStandardMaterial({ color: accColor, roughness: 0.4 });
        const knot = new THREE.Mesh(knotGeom, bowMat);
        knot.position.set(0, 1.05, 0);

        const leftLoop = new THREE.Mesh(loopGeom, bowMat);
        const rightLoop = new THREE.Mesh(loopGeom, bowMat);
        leftLoop.position.set(-0.22, 0, 0);
        leftLoop.rotation.z = Math.PI / 2;
        rightLoop.position.set(0.22, 0, 0);
        rightLoop.rotation.z = -Math.PI / 2;
        knot.add(leftLoop);
        knot.add(rightLoop);
        this.accessoryGroup.add(knot);
        break;
      }

      case 'wings': {
        const wingMat = new THREE.MeshStandardMaterial({
          color: accColor,
          roughness: 0.3,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.9,
        });
        const wingShape = new THREE.Shape();
        wingShape.moveTo(0, 0);
        wingShape.quadraticCurveTo(0.6, 0.8, 1.2, 0.4);
        wingShape.quadraticCurveTo(0.8, 0, 0.5, -0.3);
        wingShape.quadraticCurveTo(0.2, -0.2, 0, 0);

        const wingGeom = new THREE.ShapeGeometry(wingShape);
        const leftWing = new THREE.Mesh(wingGeom, wingMat);
        const rightWing = new THREE.Mesh(wingGeom, wingMat);
        leftWing.position.set(-0.85, 0.2, -0.2);
        leftWing.rotation.y = -0.4;
        rightWing.position.set(0.85, 0.2, -0.2);
        rightWing.rotation.y = Math.PI + 0.4;
        this.accessoryGroup.add(leftWing);
        this.accessoryGroup.add(rightWing);
        break;
      }

      case 'horns': {
        const hornGeom = new THREE.ConeGeometry(0.14, 0.5, 12);
        const hornMat = new THREE.MeshStandardMaterial({ color: accColor, roughness: 0.3 });
        const leftHorn = new THREE.Mesh(hornGeom, hornMat);
        const rightHorn = new THREE.Mesh(hornGeom, hornMat);
        leftHorn.position.set(-0.55, 0.95, 0.1);
        leftHorn.rotation.z = 0.4;
        leftHorn.rotation.x = -0.2;
        rightHorn.position.set(0.55, 0.95, 0.1);
        rightHorn.rotation.z = -0.4;
        rightHorn.rotation.x = -0.2;
        this.accessoryGroup.add(leftHorn);
        this.accessoryGroup.add(rightHorn);
        break;
      }

      case 'flower': {
        const centerGeom = new THREE.SphereGeometry(0.1, 16, 16);
        const centerMat = new THREE.MeshStandardMaterial({ color: 0xfef08a, roughness: 0.3 });
        const flower = new THREE.Mesh(centerGeom, centerMat);
        flower.position.set(0.75, 0.75, 0.4);

        const petalGeom = new THREE.SphereGeometry(0.08, 12, 12);
        const petalMat = new THREE.MeshStandardMaterial({ color: accColor, roughness: 0.3 });
        for (let i = 0; i < 5; i++) {
          const a = (i / 5) * Math.PI * 2;
          const petal = new THREE.Mesh(petalGeom, petalMat);
          petal.position.set(Math.cos(a) * 0.14, Math.sin(a) * 0.14, 0);
          flower.add(petal);
        }
        this.accessoryGroup.add(flower);
        break;
      }

      case 'mask': {
        const maskGeom = new THREE.CylinderGeometry(1.02, 1.02, 0.38, 32, 1, true, -Math.PI * 0.35, Math.PI * 0.7);
        const maskMat = new THREE.MeshStandardMaterial({ color: accColor, roughness: 0.3, side: THREE.DoubleSide });
        const mask = new THREE.Mesh(maskGeom, maskMat);
        mask.position.set(0, 0.2, 0);
        this.accessoryGroup.add(mask);
        break;
      }

      case 'stars': {
        for (let i = 0; i < 4; i++) {
          const a = (i / 4) * Math.PI * 2;
          const starGeom = new THREE.OctahedronGeometry(0.12, 0);
          const starMat = new THREE.MeshStandardMaterial({
            color: accColor,
            emissive: accColor,
            emissiveIntensity: 0.6,
          });
          const starMesh = new THREE.Mesh(starGeom, starMat);
          starMesh.position.set(Math.cos(a) * 1.35, 1.15, Math.sin(a) * 1.35);
          this.accessoryGroup.add(starMesh);
        }
        break;
      }
    }
  }

  private initParticles(effect: string) {
    // Clear old trail particles
    while (this.particlesGroup.children.length > 0) {
      const p = this.particlesGroup.children[0];
      this.particlesGroup.remove(p);
      if (p instanceof THREE.Mesh) {
        p.geometry.dispose();
        p.material.dispose();
      }
    }
    this.trailParticles = [];

    if (effect === 'none') return;

    const count = 16;
    for (let i = 0; i < count; i++) {
      let pColor = 0xffffff;
      if (effect === 'fire-trail') pColor = 0xf97316;
      else if (effect === 'ice-trail') pColor = 0x38bdf8;
      else if (effect === 'rainbow-trail') {
        const colors = [0xef4444, 0xf59e0b, 0x10b981, 0x3b82f6, 0xec4899];
        pColor = colors[i % colors.length];
      } else if (effect === 'sparkles' || effect === 'stars') pColor = 0xfef08a;
      else if (effect === 'lightning') pColor = 0x67e8f9;

      const pGeom = new THREE.SphereGeometry(0.06, 8, 8);
      const pMat = new THREE.MeshBasicMaterial({ color: pColor, transparent: true, opacity: 0.8 });
      const pMesh = new THREE.Mesh(pGeom, pMat);
      pMesh.visible = false;
      this.particlesGroup.add(pMesh);

      this.trailParticles.push({
        mesh: pMesh,
        vel: new THREE.Vector3((Math.random() - 0.5) * 0.4, (Math.random() - 0.5) * 0.4, -0.5 - Math.random() * 0.5),
        life: 0,
        maxLife: 0.5 + Math.random() * 0.5,
      });
    }
  }

  // Animation Update loop
  public update(delta: number, isMoving = false) {
    this.timeElapsed += delta;

    // 1. Natural Blinking logic
    if (!this.isBlinking && this.timeElapsed >= this.nextBlinkTime) {
      this.isBlinking = true;
      this.blinkProgress = 0;
    }

    if (this.isBlinking) {
      this.blinkProgress += delta * 12; // fast blink
      if (this.blinkProgress >= Math.PI) {
        this.isBlinking = false;
        this.blinkProgress = 0;
        this.nextBlinkTime = this.timeElapsed + 2 + Math.random() * 3.5;
        this.applyExpression(this.currentConfig.eyes.expression, this.currentConfig.eyes.shape);
      } else {
        const blinkAmount = Math.sin(this.blinkProgress);
        const lidClosed = -Math.PI / 2 + blinkAmount * (Math.PI / 2);
        this.leftLidUpper.rotation.x = lidClosed;
        this.rightLidUpper.rotation.x = lidClosed;
      }
    }

    // 2. Idle breathing & squish recovery
    this.squishFactor.lerp(new THREE.Vector3(1, 1, 1), 0.15);
    const breathe = 1 + Math.sin(this.timeElapsed * 3) * 0.02;
    this.group.scale.set(
      this.squishFactor.x * breathe,
      this.squishFactor.y * breathe,
      this.squishFactor.z * breathe
    );

    // 3. Orbiting star accessories
    if (this.currentConfig.accessory === 'stars') {
      this.accessoryGroup.rotation.y += delta * 1.5;
    }

    // 4. Update particles if moving or idle
    if (this.trailParticles.length > 0) {
      for (const p of this.trailParticles) {
        p.life += delta;
        if (p.life > p.maxLife) {
          p.life = 0;
          p.mesh.position.set((Math.random() - 0.5) * 0.5, (Math.random() - 0.5) * 0.5, (Math.random() - 0.5) * 0.5);
          p.mesh.visible = isMoving || Math.random() > 0.4;
        } else {
          p.mesh.position.addScaledVector(p.vel, delta);
          const ratio = 1 - p.life / p.maxLife;
          (p.mesh.material as THREE.MeshBasicMaterial).opacity = ratio * 0.8;
          p.mesh.scale.setScalar(ratio);
        }
      }
    }
  }

  // Squish on impact / jump
  public applySquish(impactStrength: number) {
    const s = Math.min(0.4, impactStrength * 0.08);
    this.squishFactor.set(1 + s, 1 - s * 1.2, 1 + s);
  }
}
