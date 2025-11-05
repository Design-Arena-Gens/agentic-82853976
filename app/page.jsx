"use client";

import { useEffect, useRef, useState } from "react";

const CANVAS_WIDTH = 960;
const CANVAS_HEIGHT = 600;

function mulberry32(seed) {
  let t = seed + 0x6d2b79f5;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

function drawBoatScene(ctx, seed) {
  const rand = (() => {
    let internalSeed = seed;
    return () => {
      internalSeed += 0x9e3779b9;
      return mulberry32(internalSeed);
    };
  })();

  const width = ctx.canvas.width;
  const height = ctx.canvas.height;
  ctx.clearRect(0, 0, width, height);

  // Sky gradient
  const skyGradient = ctx.createLinearGradient(0, 0, 0, height);
  skyGradient.addColorStop(0, "#dff3ff");
  skyGradient.addColorStop(0.35, "#9ad2ff");
  skyGradient.addColorStop(1, "#4f74e7");
  ctx.fillStyle = skyGradient;
  ctx.fillRect(0, 0, width, height);

  // Sun
  const sunX = width * 0.8;
  const sunY = height * 0.2;
  const sunRadius = 80 + rand() * 20;
  const sunGradient = ctx.createRadialGradient(sunX, sunY, sunRadius * 0.2, sunX, sunY, sunRadius);
  sunGradient.addColorStop(0, "rgba(255, 255, 220, 0.95)");
  sunGradient.addColorStop(1, "rgba(255, 200, 90, 0)");
  ctx.fillStyle = sunGradient;
  ctx.beginPath();
  ctx.arc(sunX, sunY, sunRadius, 0, Math.PI * 2);
  ctx.fill();

  // Water gradient
  const waterStart = height * 0.45;
  const waterGradient = ctx.createLinearGradient(0, waterStart, 0, height);
  waterGradient.addColorStop(0, "#2660a4");
  waterGradient.addColorStop(0.6, "#053f6b");
  waterGradient.addColorStop(1, "#01223b");
  ctx.fillStyle = waterGradient;
  ctx.fillRect(0, waterStart, width, height - waterStart);

  // Waves
  const waveLayers = 4;
  for (let layer = 0; layer < waveLayers; layer += 1) {
    const amplitude = 10 + layer * 8;
    const wavelength = 120 - layer * 15;
    const speed = rand() * 0.5 + 0.5;
    const offsetY = waterStart + layer * 35 + rand() * 10;
    ctx.beginPath();
    ctx.moveTo(0, offsetY);
    for (let x = 0; x <= width; x += 4) {
      const noise = (rand() - 0.5) * 8;
      const y =
        offsetY +
        Math.sin((x / wavelength) * Math.PI * 2 + speed) * amplitude +
        noise * (1 - layer * 0.15);
      ctx.lineTo(x, y);
    }
    ctx.lineTo(width, height);
    ctx.lineTo(0, height);
    ctx.closePath();
    ctx.fillStyle = `rgba(41, 109, 180, ${0.38 - layer * 0.07})`;
    ctx.fill();
  }

  // Boat geometry
  const hullWidth = width * 0.32;
  const hullHeight = height * 0.12;
  const hullX = width * 0.28;
  const hullY = waterStart + hullHeight * 0.12;
  const mastHeight = height * 0.42;
  const mastX = hullX + hullWidth * 0.5;
  const mastY = hullY - mastHeight;
  const sailWidth = hullWidth * 0.85;
  const sailBottom = hullY - hullHeight * 0.2;
  const sailTop = mastY + mastHeight * 0.05;

  ctx.beginPath();
  ctx.moveTo(hullX, hullY);
  ctx.quadraticCurveTo(hullX + hullWidth * 0.12, hullY + hullHeight * 1.2, hullX + hullWidth * 0.5, hullY + hullHeight * 1.3);
  ctx.quadraticCurveTo(hullX + hullWidth * 0.88, hullY + hullHeight * 1.2, hullX + hullWidth, hullY);
  ctx.lineTo(hullX, hullY);
  ctx.fillStyle = "#562403";
  ctx.fill();

  // Hull highlight
  ctx.beginPath();
  ctx.moveTo(hullX + hullWidth * 0.08, hullY + hullHeight * 0.2);
  ctx.quadraticCurveTo(hullX + hullWidth * 0.5, hullY + hullHeight * 0.9, hullX + hullWidth * 0.92, hullY + hullHeight * 0.2);
  ctx.strokeStyle = "rgba(255,255,255,0.25)";
  ctx.lineWidth = 6;
  ctx.stroke();

  // Mast
  ctx.beginPath();
  ctx.moveTo(mastX, hullY);
  ctx.lineTo(mastX, mastY);
  ctx.strokeStyle = "#704214";
  ctx.lineWidth = 12;
  ctx.lineCap = "round";
  ctx.stroke();

  // Sail
  ctx.beginPath();
  ctx.moveTo(mastX, sailTop);
  ctx.lineTo(mastX, sailBottom);
  ctx.lineTo(mastX - sailWidth * 0.9, sailBottom - sailWidth * 0.35);
  ctx.closePath();
  const sailGradient = ctx.createLinearGradient(mastX, sailTop, mastX - sailWidth, sailBottom);
  sailGradient.addColorStop(0, "#fefefe");
  sailGradient.addColorStop(0.6, "#eff4ff");
  sailGradient.addColorStop(1, "#d4e5ff");
  ctx.fillStyle = sailGradient;
  ctx.fill();

  // Sail shadow
  ctx.beginPath();
  ctx.moveTo(mastX, sailTop);
  ctx.lineTo(mastX, sailBottom);
  ctx.lineTo(mastX - sailWidth * 0.55, sailBottom - sailWidth * 0.2);
  ctx.closePath();
  ctx.fillStyle = "rgba(0, 0, 0, 0.08)";
  ctx.fill();

  // Flag
  ctx.beginPath();
  ctx.moveTo(mastX, mastY);
  ctx.lineTo(mastX + 40, mastY + 20);
  ctx.lineTo(mastX, mastY + 40);
  ctx.closePath();
  ctx.fillStyle = "#ff6150";
  ctx.fill();

  // Boat reflection
  drawBoatReflection(ctx, seed, {
    hullX,
    hullY,
    hullWidth,
    hullHeight,
    mastX,
    mastY,
    mastHeight,
    sailWidth,
    sailTop,
    sailBottom,
    waterStart,
    sceneHeight: height
  });

  // Distant birds
  ctx.strokeStyle = "rgba(255,255,255,0.7)";
  ctx.lineWidth = 3;
  const birdCount = 4;
  for (let i = 0; i < birdCount; i += 1) {
    const birdX = width * (0.1 + rand() * 0.35);
    const birdY = height * (0.1 + rand() * 0.2);
    const wingSpan = 26 + rand() * 18;
    ctx.beginPath();
    ctx.moveTo(birdX - wingSpan * 0.5, birdY);
    ctx.quadraticCurveTo(birdX, birdY + 10, birdX + wingSpan * 0.5, birdY);
    ctx.stroke();
  }

  // Floating sparkles
  const sparkleCount = 40;
  for (let i = 0; i < sparkleCount; i += 1) {
    const sparkleX = width * rand();
    const sparkleY = waterStart + (height - waterStart) * rand();
    const sparkleSize = rand() * 2.5;
    ctx.fillStyle = `rgba(255,255,255,${0.35 + rand() * 0.35})`;
    ctx.beginPath();
    ctx.arc(sparkleX, sparkleY, sparkleSize, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawBoatReflection(ctx, seed, geometry) {
  const rand = (() => {
    let internalSeed = seed * 17;
    return () => {
      internalSeed += 0x9e3779b9;
      return mulberry32(internalSeed);
    };
  })();

  const { hullX, hullY, hullWidth, hullHeight, mastX, mastY, mastHeight, sailWidth, sailTop, sailBottom, waterStart, sceneHeight } = geometry;

  ctx.save();
  ctx.translate(0, hullY * 2 + hullHeight * 0.4);
  ctx.scale(1, -1);
  ctx.globalAlpha = 0.28;

  ctx.beginPath();
  ctx.moveTo(hullX, hullY);
  ctx.quadraticCurveTo(hullX + hullWidth * 0.12, hullY + hullHeight * 1.2, hullX + hullWidth * 0.5, hullY + hullHeight * 1.3);
  ctx.quadraticCurveTo(hullX + hullWidth * 0.88, hullY + hullHeight * 1.2, hullX + hullWidth, hullY);
  ctx.fillStyle = "rgba(86, 36, 3, 0.3)";
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(hullX + hullWidth * 0.08, hullY + hullHeight * 0.2);
  ctx.quadraticCurveTo(hullX + hullWidth * 0.5, hullY + hullHeight * 0.9, hullX + hullWidth * 0.92, hullY + hullHeight * 0.2);
  ctx.strokeStyle = "rgba(255,255,255,0.12)";
  ctx.lineWidth = 6;
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(mastX, hullY);
  ctx.lineTo(mastX, mastY);
  ctx.strokeStyle = "rgba(112, 66, 20, 0.25)";
  ctx.lineWidth = 12;
  ctx.lineCap = "round";
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(mastX, sailTop);
  ctx.lineTo(mastX, sailBottom);
  ctx.lineTo(mastX - sailWidth * 0.9, sailBottom - sailWidth * 0.35);
  ctx.closePath();
  ctx.fillStyle = "rgba(255,255,255,0.15)";
  ctx.fill();

  const rippleSlices = 8;
  for (let i = 0; i < rippleSlices; i += 1) {
    const sliceHeight = (sceneHeight - waterStart) * 0.02 * (0.5 + rand());
    const sliceY = hullY + i * sliceHeight * 0.9;
    ctx.fillStyle = `rgba(20, 90, 160, ${0.08 + rand() * 0.08})`;
    ctx.fillRect(hullX - 20, sliceY, hullWidth + 40, sliceHeight);
  }

  ctx.restore();
}

export default function Home() {
  const [seed, setSeed] = useState(() => Math.floor(Math.random() * 10_000_000));
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }
    const ctx = canvas.getContext("2d");
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    const pixelRatio = window.devicePixelRatio ?? 1;
    canvas.width = CANVAS_WIDTH * pixelRatio;
    canvas.height = CANVAS_HEIGHT * pixelRatio;
    canvas.style.width = `${CANVAS_WIDTH}px`;
    canvas.style.height = `${CANVAS_HEIGHT}px`;
    ctx.scale(pixelRatio, pixelRatio);
    drawBoatScene(ctx, seed);
  }, [seed]);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }
    const link = document.createElement("a");
    link.download = `generated-boat-${seed}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  return (
    <main className="page">
      <header className="hero">
        <h1>Boat Illustration Generator</h1>
        <p>Create a stylized seascape featuring a handcrafted sailboat.</p>
      </header>
      <section className="canvas-wrapper">
        <canvas ref={canvasRef} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} aria-label="Procedurally generated sailboat illustration" />
      </section>
      <section className="controls">
        <button type="button" onClick={() => setSeed(Math.floor(Math.random() * 10_000_000))}>
          Generate New Scene
        </button>
        <button type="button" onClick={handleDownload}>
          Download PNG
        </button>
      </section>
      <section className="details">
        <h2>How it Works</h2>
        <p>
          This illustration is drawn entirely in your browser using the HTML5 canvas API. Every time you generate a new scene, a different seed feeds
          into the procedural gradients, waves, and reflections, giving you a unique nautical composition.
        </p>
      </section>
    </main>
  );
}
