import * as THREE from 'three';
import type { GraterMode } from '../types';
import { MODE_CONFIGS } from '../types';

export function createGraterTexture(mode: GraterMode): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  const size = 512;
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  const config = MODE_CONFIGS[mode];

  // White = opaque metal, black = transparent hole (alphaMap convention)
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, size, size);
  ctx.fillStyle = '#000000';

  if (config.holeShape === 'circle') {
    const { holeSize, holeSpacing } = config;
    const radius = holeSize / 2;
    let row = 0;
    for (let y = holeSpacing; y < size; y += holeSpacing) {
      const offset = (row % 2 === 1) ? holeSpacing / 2 : 0;
      for (let x = offset + holeSpacing / 2; x < size; x += holeSpacing) {
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
      }
      row++;
    }
  } else {
    // Slot pattern (microplane / zester style)
    const slotW = 16;
    const slotH = config.holeSize;
    const spacingX = 26;
    const spacingY = 16;
    let row = 0;
    for (let y = spacingY; y < size; y += spacingY) {
      const offset = (row % 2 === 1) ? spacingX / 2 : 0;
      for (let x = offset; x < size; x += spacingX) {
        ctx.beginPath();
        if (typeof ctx.roundRect === 'function') {
          ctx.roundRect(x - slotW / 2, y - slotH / 2, slotW, slotH, 2);
        } else {
          ctx.rect(x - slotW / 2, y - slotH / 2, slotW, slotH);
        }
        ctx.fill();
      }
      row++;
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2, 5);
  return texture;
}
