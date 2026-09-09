'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { motion } from 'framer-motion';
import {
  Sparkles,
  Cpu,
  Zap,
  Activity,
  Maximize2,
  RefreshCw,
  Eye,
  Layers,
  Globe,
  FileText,
} from 'lucide-react';

const T = THREE as any;

export default function Hero3DModel() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [activeMode, setActiveMode] = useState<'neural' | 'quantum' | 'synapse'>('neural');
  const [isHovered, setIsHovered] = useState(false);
  const [pulseCount, setPulseCount] = useState(0);

  // References for Three.js objects
  const sceneRef = useRef<any>(null);
  const rendererRef = useRef<any>(null);
  const coreMeshRef = useRef<any>(null);
  const wireframeMeshRef = useRef<any>(null);
  const ring1Ref = useRef<any>(null);
  const ring2Ref = useRef<any>(null);
  const ring3Ref = useRef<any>(null);
  const particlesRef = useRef<any>(null);

  // Mouse interaction state
  const mousePos = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });
  const isDragging = useRef(false);
  const previousMousePosition = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight || 520;

    // SCENE
    const scene = new T.Scene();
    sceneRef.current = scene;

    // CAMERA
    const camera = new T.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = 6.5;

    // RENDERER
    const renderer = new T.WebGLRenderer({
      canvas: canvasRef.current,
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    rendererRef.current = renderer;

    // LIGHTING (Calm, elegant, non-neon)
    const ambientLight = new T.AmbientLight(0xffffff, 1.1);
    scene.add(ambientLight);

    const pointLight1 = new T.PointLight(0x8b6fc9, 2.8, 50); // Muted lavender
    pointLight1.position.set(5, 5, 5);
    scene.add(pointLight1);

    const pointLight2 = new T.PointLight(0x7e9ac7, 2.2, 50); // Dusty blue
    pointLight2.position.set(-5, -5, 3);
    scene.add(pointLight2);

    const pointLight3 = new T.PointLight(0xb4a1de, 1.8, 40); // Pale violet
    pointLight3.position.set(0, 4, -4);
    scene.add(pointLight3);

    // 1. INNER SOLID CORE (Faceted Icosahedron - soft violet metallic)
    const coreGeo = new T.IcosahedronGeometry(1.3, 1);
    const coreMat = new T.MeshPhysicalMaterial({
      color: 0x4a3e68,
      emissive: 0x8b6fc9,
      emissiveIntensity: 0.35,
      roughness: 0.35,
      metalness: 0.6,
      clearcoat: 0.8,
      clearcoatRoughness: 0.2,
      wireframe: false,
      flatShading: true,
    });
    const coreMesh = new T.Mesh(coreGeo, coreMat);
    scene.add(coreMesh);
    coreMeshRef.current = coreMesh;

    // 2. OUTER WIREFRAME CAGE (Pale violet subtle wireframe)
    const wireGeo = new T.IcosahedronGeometry(1.65, 2);
    const wireMat = new T.MeshBasicMaterial({
      color: 0xb4a1de,
      wireframe: true,
      transparent: true,
      opacity: 0.35,
    });
    const wireMesh = new T.Mesh(wireGeo, wireMat);
    scene.add(wireMesh);
    wireframeMeshRef.current = wireMesh;

    // 3. GYROSCOPE ORBITAL RINGS (Muted lavender, dusty blue, pale violet)
    const createRing = (radius: number, tube: number, color: number, count = 8) => {
      const group = new T.Group();
      const ringGeo = new T.TorusGeometry(radius, tube, 16, 100);
      const ringMat = new T.MeshStandardMaterial({
        color: color,
        emissive: color,
        emissiveIntensity: 0.25,
        roughness: 0.3,
        metalness: 0.7,
      });
      const ring = new T.Mesh(ringGeo, ringMat);
      group.add(ring);

      // Add orbital node satellites on ring
      for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2;
        const nodeGeo = new T.SphereGeometry(tube * 2.8, 12, 12);
        const nodeMat = new T.MeshBasicMaterial({
          color: 0xfcfbfe,
        });
        const node = new T.Mesh(nodeGeo, nodeMat);
        node.position.set(Math.cos(angle) * radius, Math.sin(angle) * radius, 0);
        group.add(node);
      }
      return group;
    };

    const ring1 = createRing(2.1, 0.022, 0x8b6fc9, 6);
    ring1.rotation.x = Math.PI / 3;
    scene.add(ring1);
    ring1Ref.current = ring1;

    const ring2 = createRing(2.5, 0.018, 0x7e9ac7, 8);
    ring2.rotation.y = Math.PI / 4;
    scene.add(ring2);
    ring2Ref.current = ring2;

    const ring3 = createRing(2.85, 0.015, 0xb4a1de, 4);
    ring3.rotation.z = Math.PI / 6;
    scene.add(ring3);
    ring3Ref.current = ring3;

    // 4. PARTICLES SWARM (Soft lavender & dusty blue synapses)
    const particleCount = 200;
    const particleGeo = new T.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    const pColor1 = new T.Color(0x8b6fc9);
    const pColor2 = new T.Color(0x7e9ac7);

    for (let i = 0; i < particleCount; i++) {
      const radius = 2.0 + Math.random() * 2.2;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);

      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);

      const mixed = pColor1.clone().lerp(pColor2, Math.random());
      colors[i * 3] = mixed.r;
      colors[i * 3 + 1] = mixed.g;
      colors[i * 3 + 2] = mixed.b;
    }

    particleGeo.setAttribute('position', new T.BufferAttribute(positions, 3));
    particleGeo.setAttribute('color', new T.BufferAttribute(colors, 3));

    const particleMat = new T.PointsMaterial({
      size: 0.04,
      vertexColors: true,
      transparent: true,
      opacity: 0.55,
      blending: T.AdditiveBlending,
    });

    const particleSystem = new T.Points(particleGeo, particleMat);
    scene.add(particleSystem);
    particlesRef.current = particleSystem;

    // RESIZE HANDLER
    const handleResize = () => {
      if (!containerRef.current || !rendererRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight || 520;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    // MOUSE EVENTS
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      mousePos.current.targetX = x * 0.8;
      mousePos.current.targetY = y * 0.8;

      if (isDragging.current && coreMeshRef.current) {
        const deltaX = e.clientX - previousMousePosition.current.x;
        const deltaY = e.clientY - previousMousePosition.current.y;
        scene.rotation.y += deltaX * 0.008;
        scene.rotation.x += deltaY * 0.008;
      }
      previousMousePosition.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseDown = (e: MouseEvent) => {
      isDragging.current = true;
      previousMousePosition.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseUp = () => {
      isDragging.current = false;
    };

    const containerEl = containerRef.current;
    containerEl.addEventListener('mousemove', handleMouseMove);
    containerEl.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);

    // ANIMATION LOOP
    let animationFrameId: number;
    let clock = new T.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Smooth mouse lerp
      mousePos.current.x += (mousePos.current.targetX - mousePos.current.x) * 0.05;
      mousePos.current.y += (mousePos.current.targetY - mousePos.current.y) * 0.05;

      if (!isDragging.current) {
        scene.rotation.y = mousePos.current.x * 0.6 + elapsedTime * 0.12;
        scene.rotation.x = mousePos.current.y * 0.5 + Math.sin(elapsedTime * 0.3) * 0.08;
      }

      // Core rotation & gentle breathing
      if (coreMeshRef.current) {
        coreMeshRef.current.rotation.x = elapsedTime * 0.22;
        coreMeshRef.current.rotation.y = elapsedTime * 0.3;
        const pulse = 1 + Math.sin(elapsedTime * 2.0) * 0.03;
        coreMeshRef.current.scale.set(pulse, pulse, pulse);
      }

      // Wireframe rotation
      if (wireframeMeshRef.current) {
        wireframeMeshRef.current.rotation.x = -elapsedTime * 0.15;
        wireframeMeshRef.current.rotation.z = elapsedTime * 0.18;
      }

      // Ring rotations
      if (ring1Ref.current) {
        ring1Ref.current.rotation.z += 0.006;
        ring1Ref.current.rotation.x = Math.sin(elapsedTime * 0.3) * 0.25 + Math.PI / 3;
      }
      if (ring2Ref.current) {
        ring2Ref.current.rotation.y += 0.005;
        ring2Ref.current.rotation.z = Math.cos(elapsedTime * 0.25) * 0.25 + Math.PI / 4;
      }
      if (ring3Ref.current) {
        ring3Ref.current.rotation.x -= 0.005;
        ring3Ref.current.rotation.y += 0.004;
      }

      // Particle system gentle swirl
      if (particlesRef.current) {
        particlesRef.current.rotation.y = -elapsedTime * 0.06;
        particlesRef.current.rotation.x = Math.sin(elapsedTime * 0.2) * 0.08;
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      containerEl.removeEventListener('mousemove', handleMouseMove);
      containerEl.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      renderer.dispose();
    };
  }, []);

  // Handle Mode Change
  const handleModeSwitch = (mode: 'neural' | 'quantum' | 'synapse') => {
    setActiveMode(mode);
    setPulseCount((c) => c + 1);

    if (coreMeshRef.current && wireframeMeshRef.current && particlesRef.current) {
      if (mode === 'neural') {
        wireframeMeshRef.current.material.opacity = 0.4;
        wireframeMeshRef.current.material.color.setHex(0xb4a1de);
        coreMeshRef.current.material.emissive.setHex(0x8b6fc9);
      } else if (mode === 'quantum') {
        wireframeMeshRef.current.material.opacity = 0.35;
        wireframeMeshRef.current.material.color.setHex(0x7e9ac7);
        coreMeshRef.current.material.emissive.setHex(0x5b7aa8);
      } else if (mode === 'synapse') {
        wireframeMeshRef.current.material.opacity = 0.45;
        wireframeMeshRef.current.material.color.setHex(0x9f88d4);
        coreMeshRef.current.material.emissive.setHex(0x795bb8);
      }
    }
  };

  const triggerPulse = () => {
    setPulseCount((c) => c + 1);
    if (coreMeshRef.current) {
      coreMeshRef.current.scale.set(1.2, 1.2, 1.2);
      setTimeout(() => {
        if (coreMeshRef.current) coreMeshRef.current.scale.set(1, 1, 1);
      }, 250);
    }
  };

  return (
    <div
      ref={containerRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative w-full h-[440px] xs:h-[480px] sm:h-[530px] lg:h-[560px] rounded-2xl md:rounded-3xl border border-[#E8E4EF] dark:border-purple-400/25 bg-[#FFFFFF]/80 dark:bg-[#0b0819]/80 shadow-[0_8px_30px_rgba(41,38,51,0.04)] dark:shadow-2xl dark:shadow-black/80 backdrop-blur-xl overflow-hidden flex items-center justify-center cursor-grab active:cursor-grabbing transition-all select-none"
    >
      {/* Background radial glow - soft diffused lavender and dusty blue */}
      <div className="pointer-events-none absolute inset-0 -z-10 flex items-center justify-center overflow-hidden">
        <div className="h-[280px] w-[280px] sm:h-[400px] sm:w-[400px] rounded-full bg-gradient-to-br from-[#8B6FC9]/10 via-[#7E9AC7]/10 to-[#EEE8FA]/20 blur-[80px] sm:blur-[90px]" />
      </div>

      {/* 3D WebGL Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block" />

      {/* Top Left Floating Telemetry Badge */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="pointer-events-none absolute top-3 left-3 sm:top-6 sm:left-6 rounded-2xl border border-[#E8E4EF] dark:border-purple-400/25 bg-[#FFFFFF]/90 dark:bg-[#120c29]/90 px-3 py-2 sm:px-3.5 sm:py-2.5 shadow-[0_4px_16px_rgba(41,38,51,0.04)] backdrop-blur-md flex items-center gap-2 sm:gap-2.5 max-w-[210px] sm:max-w-[280px]"
      >
        <div className="flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-xl bg-[#EEE8FA] dark:bg-purple-950/80 border border-[#E8E4EF] dark:border-purple-500/30 text-[#6B52A3] dark:text-purple-300">
          <Cpu className="h-3.5 w-3.5 sm:h-4 sm:w-4 animate-pulse" />
        </div>
        <div className="truncate">
          <div className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-[#6FA58A] animate-pulse shrink-0" />
            <span className="text-[10px] sm:text-[11px] font-bold text-[#292633] dark:text-white truncate">Groq Qwen 3.6 / Llama 3.3</span>
          </div>
          <span className="text-[9px] sm:text-[10px] text-[#686477] dark:text-slate-400 font-mono">14ms TTFT • 70B Active</span>
        </div>
      </motion.div>

      {/* Top Right Mode Toggle Pills */}
      <div className="absolute top-3 right-3 sm:top-6 sm:right-6 z-20 flex items-center gap-1 rounded-full border border-[#E8E4EF] dark:border-purple-400/20 bg-[#FFFFFF]/90 dark:bg-[#120c29]/90 p-1 shadow-[0_2px_8px_rgba(41,38,51,0.04)] backdrop-blur-md">
        {(['neural', 'quantum', 'synapse'] as const).map((mode) => (
          <button
            key={mode}
            onClick={() => handleModeSwitch(mode)}
            className={`px-2 sm:px-2.5 py-0.8 sm:py-1 rounded-full text-[9px] sm:text-[10px] font-semibold capitalize transition-all cursor-pointer ${
              activeMode === mode
                ? 'bg-[#8B6FC9] text-white shadow-sm'
                : 'text-[#686477] dark:text-slate-400 hover:text-[#292633] dark:hover:text-white'
            }`}
          >
            {mode}
          </button>
        ))}
      </div>

      {/* Bottom Left Floating Badge: Context & RAG */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="pointer-events-none absolute bottom-3 left-3 sm:bottom-6 sm:left-6 rounded-2xl border border-[#E8E4EF] dark:border-purple-400/25 bg-[#FFFFFF]/90 dark:bg-[#120c29]/90 px-3 py-2 sm:px-3.5 sm:py-2.5 shadow-[0_4px_16px_rgba(41,38,51,0.04)] backdrop-blur-md flex items-center gap-2 sm:gap-2.5 hidden xs:flex"
      >
        <div className="flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-xl bg-[#EEE8FA] dark:bg-purple-950/80 border border-[#E8E4EF] dark:border-purple-500/30 text-[#6B52A3] dark:text-purple-300">
          <Globe className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        </div>
        <div>
          <span className="text-[10px] sm:text-[11px] font-bold text-[#292633] dark:text-white block">Tavily Web & PDF.js RAG</span>
          <span className="text-[9px] sm:text-[10px] text-[#686477] dark:text-slate-400 font-mono">128k Token Context Window</span>
        </div>
      </motion.div>

      {/* Bottom Right Interactive Pulse Button & Hint */}
      <div className="absolute bottom-3 right-3 sm:bottom-6 sm:right-6 z-20 flex items-center gap-1.5 sm:gap-2">
        <button
          onClick={triggerPulse}
          className="flex items-center gap-1 sm:gap-1.5 rounded-full border border-[#E8E4EF] dark:border-purple-400/30 bg-[#EEE8FA] hover:bg-[#E2D8F7] dark:bg-purple-950/70 dark:hover:bg-purple-900/80 px-2.5 sm:px-3 py-1 sm:py-1.5 text-[11px] sm:text-xs font-semibold text-[#6B52A3] dark:text-purple-300 shadow-[0_2px_8px_rgba(41,38,51,0.04)] backdrop-blur-md transition-all cursor-pointer"
          title="Click to emit energy pulse"
        >
          <Zap className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-[#8B6FC9] dark:text-purple-400 animate-pulse" />
          <span>Pulse Core</span>
        </button>

        <span className="hidden sm:inline-flex items-center gap-1 rounded-full border border-[#E8E4EF] dark:border-purple-400/20 bg-[#FFFFFF]/80 dark:bg-[#120c29]/80 px-2.5 py-1 text-[10px] font-mono text-[#686477] dark:text-slate-400">
          ✦ Drag to Orbit
        </span>
      </div>
    </div>
  );
}
