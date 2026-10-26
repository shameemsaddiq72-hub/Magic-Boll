/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { PatternType } from '../types/ball';

const textureCache = new Map<string, THREE.CanvasTexture>();

export function getPatternTexture(
  pattern: PatternType,
  baseColor: string,
  patternColor: string,
  gradient: string,
  scale: number
): THREE.CanvasTexture | null {
  if (pattern === 'none' && gradient === 'none') {
    return null;
  }

  const key = `${pattern}_${baseColor}_${patternColor}_${gradient}_${scale}`;
  if (textureCache.has(key)) {
    return textureCache.get(key)!;
  }

  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  // 1. Draw Base / Gradient
  if (gradient === 'none') {
    ctx.fillStyle = baseColor;
    ctx.fillRect(0, 0, size, size);
  } else {
    let grad: CanvasGradient;
    switch (gradient) {
      case 'sunset':
        grad = ctx.createLinearGradient(0, 0, 0, size);
        grad.addColorStop(0, '#F59E0B');
        grad.addColorStop(0.5, '#EC4899');
        grad.addColorStop(1, '#8B5CF6');
        break;
      case 'ocean':
        grad = ctx.createLinearGradient(0, 0, size, size);
        grad.addColorStop(0, '#06B6D4');
        grad.addColorStop(0.5, '#3B82F6');
        grad.addColorStop(1, '#1E3A8A');
        break;
      case 'galaxy':
        grad = ctx.createRadialGradient(size / 2, size / 2, 20, size / 2, size / 2, size / 2);
        grad.addColorStop(0, '#C084FC');
        grad.addColorStop(0.4, '#7C3AED');
        grad.addColorStop(0.8, '#1E1B4B');
        grad.addColorStop(1, '#020617');
        break;
      case 'neon':
        grad = ctx.createLinearGradient(0, 0, size, 0);
        grad.addColorStop(0, '#10B981');
        grad.addColorStop(0.5, '#06B6D4');
        grad.addColorStop(1, '#A855F7');
        break;
      case 'rainbow':
        grad = ctx.createLinearGradient(0, 0, size, size);
        grad.addColorStop(0, '#EF4444');
        grad.addColorStop(0.2, '#F59E0B');
        grad.addColorStop(0.4, '#10B981');
        grad.addColorStop(0.6, '#06B6D4');
        grad.addColorStop(0.8, '#6366F1');
        grad.addColorStop(1, '#EC4899');
        break;
      case 'fire':
        grad = ctx.createLinearGradient(0, size, 0, 0);
        grad.addColorStop(0, '#7F1D1D');
        grad.addColorStop(0.3, '#DC2626');
        grad.addColorStop(0.7, '#EA580C');
        grad.addColorStop(1, '#FDE047');
        break;
      case 'ice':
        grad = ctx.createLinearGradient(0, 0, size, size);
        grad.addColorStop(0, '#E0F2FE');
        grad.addColorStop(0.5, '#38BDF8');
        grad.addColorStop(1, '#0284C7');
        break;
      case 'candy':
        grad = ctx.createLinearGradient(0, 0, size, 0);
        grad.addColorStop(0, '#FDA4AF');
        grad.addColorStop(0.5, '#F472B6');
        grad.addColorStop(1, '#BAE6FD');
        break;
      default:
        grad = ctx.createLinearGradient(0, 0, size, size);
        grad.addColorStop(0, baseColor);
        grad.addColorStop(1, '#111827');
    }
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);
  }

  // 2. Draw Pattern Overlay
  if (pattern !== 'none') {
    ctx.fillStyle = patternColor;
    ctx.strokeStyle = patternColor;
    ctx.lineWidth = Math.max(2, size / (scale * 8));

    const step = size / scale;
    const halfStep = step / 2;

    switch (pattern) {
      case 'stripes':
        ctx.beginPath();
        for (let x = -size; x < size * 2; x += step) {
          ctx.moveTo(x, 0);
          ctx.lineTo(x + size, size);
        }
        ctx.stroke();
        break;

      case 'dots':
        const radius = step * 0.18;
        for (let y = halfStep; y < size; y += step) {
          for (let x = halfStep; x < size; x += step) {
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            ctx.fill();
          }
        }
        break;

      case 'stars':
        const drawStar = (cx: number, cy: number, spikes: number, outerR: number, innerR: number) => {
          let rot = (Math.PI / 2) * 3;
          let x = cx;
          let y = cy;
          const sStep = Math.PI / spikes;

          ctx.beginPath();
          ctx.moveTo(cx, cy - outerR);
          for (let i = 0; i < spikes; i++) {
            x = cx + Math.cos(rot) * outerR;
            y = cy + Math.sin(rot) * outerR;
            ctx.lineTo(x, y);
            rot += sStep;

            x = cx + Math.cos(rot) * innerR;
            y = cy + Math.sin(rot) * innerR;
            ctx.lineTo(x, y);
            rot += sStep;
          }
          ctx.lineTo(cx, cy - outerR);
          ctx.closePath();
          ctx.fill();
        };

        for (let y = halfStep; y < size; y += step) {
          for (let x = halfStep; x < size; x += step) {
            drawStar(x, y, 5, step * 0.28, step * 0.12);
          }
        }
        break;

      case 'hearts':
        const drawHeart = (cx: number, cy: number, w: number) => {
          ctx.save();
          ctx.translate(cx, cy);
          ctx.beginPath();
          const topCurveHeight = w * 0.3;
          ctx.moveTo(0, topCurveHeight);
          // top left curve
          ctx.bezierCurveTo(0, 0, -w / 2, 0, -w / 2, topCurveHeight);
          // bottom left curve
          ctx.bezierCurveTo(-w / 2, (w + topCurveHeight) / 2, 0, (w + topCurveHeight) / 1.5, 0, w);
          // bottom right curve
          ctx.bezierCurveTo(0, (w + topCurveHeight) / 1.5, w / 2, (w + topCurveHeight) / 2, w / 2, topCurveHeight);
          // top right curve
          ctx.bezierCurveTo(w / 2, 0, 0, 0, 0, topCurveHeight);
          ctx.closePath();
          ctx.fill();
          ctx.restore();
        };
        for (let y = step * 0.3; y < size; y += step) {
          for (let x = halfStep; x < size; x += step) {
            drawHeart(x, y, step * 0.35);
          }
        }
        break;

      case 'lightning':
        for (let y = 0; y < size; y += step) {
          for (let x = 0; x < size; x += step) {
            ctx.beginPath();
            ctx.moveTo(x + step * 0.5, y + step * 0.1);
            ctx.lineTo(x + step * 0.3, y + step * 0.5);
            ctx.lineTo(x + step * 0.6, y + step * 0.45);
            ctx.lineTo(x + step * 0.4, y + step * 0.9);
            ctx.stroke();
          }
        }
        break;

      case 'flames':
        for (let y = 0; y < size; y += step) {
          for (let x = 0; x < size; x += step) {
            ctx.beginPath();
            ctx.moveTo(x + step * 0.5, y + step * 0.1);
            ctx.quadraticCurveTo(x + step * 0.8, y + step * 0.6, x + step * 0.5, y + step * 0.9);
            ctx.quadraticCurveTo(x + step * 0.2, y + step * 0.6, x + step * 0.5, y + step * 0.1);
            ctx.fill();
          }
        }
        break;

      case 'clouds':
        for (let y = halfStep; y < size; y += step) {
          for (let x = halfStep; x < size; x += step) {
            const r = step * 0.14;
            ctx.beginPath();
            ctx.arc(x - r, y, r * 0.9, 0, Math.PI * 2);
            ctx.arc(x, y - r * 0.4, r * 1.2, 0, Math.PI * 2);
            ctx.arc(x + r, y, r * 0.9, 0, Math.PI * 2);
            ctx.fill();
          }
        }
        break;

      case 'spirals':
        for (let y = halfStep; y < size; y += step) {
          for (let x = halfStep; x < size; x += step) {
            ctx.beginPath();
            const maxRadius = step * 0.28;
            for (let a = 0; a < Math.PI * 4; a += 0.2) {
              const currentR = (a / (Math.PI * 4)) * maxRadius;
              const px = x + Math.cos(a) * currentR;
              const py = y + Math.sin(a) * currentR;
              if (a === 0) ctx.moveTo(px, py);
              else ctx.lineTo(px, py);
            }
            ctx.stroke();
          }
        }
        break;

      case 'checkerboard':
        for (let row = 0; row < scale; row++) {
          for (let col = 0; col < scale; col++) {
            if ((row + col) % 2 === 0) {
              ctx.fillRect(col * step, row * step, step, step);
            }
          }
        }
        break;

      case 'geometric':
        ctx.beginPath();
        for (let y = 0; y < size; y += step) {
          for (let x = 0; x < size; x += step) {
            ctx.rect(x + step * 0.1, y + step * 0.1, step * 0.8, step * 0.8);
            ctx.moveTo(x + step * 0.5, y + step * 0.1);
            ctx.lineTo(x + step * 0.9, y + step * 0.5);
            ctx.lineTo(x + step * 0.5, y + step * 0.9);
            ctx.lineTo(x + step * 0.1, y + step * 0.5);
            ctx.closePath();
          }
        }
        ctx.stroke();
        break;

      case 'galaxy':
        // galaxy nebula clusters and tiny stars
        for (let i = 0; i < 40 * scale; i++) {
          const sx = Math.random() * size;
          const sy = Math.random() * size;
          const sr = Math.random() * 2 + 1;
          ctx.beginPath();
          ctx.arc(sx, sy, sr, 0, Math.PI * 2);
          ctx.fill();
        }
        break;
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.needsUpdate = true;
  textureCache.set(key, texture);
  return texture;
}
