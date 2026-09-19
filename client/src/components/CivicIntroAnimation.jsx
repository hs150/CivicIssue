import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import gsap from "gsap";

export default function CivicIntroAnimation({ onComplete }) {
  const mountRef = useRef(null);
  const [uiStage, setUiStage] = useState(0); // 0: void, 1: detected badge, 2: network categories, 3: brand reveal, 4: transition
  const [skipHover, setSkipHover] = useState(false);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = window.innerWidth;
    const height = window.innerHeight;

    // 1. SCENE & CAMERA
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x030712); // Deep charcoal black void
    scene.fog = new THREE.FogExp2(0x030712, 0.038);

    const camera = new THREE.PerspectiveCamera(48, width / height, 0.1, 100);
    // Initial camera close to the ground
    camera.position.set(0, 0.9, 3.2);
    const cameraLookTarget = new THREE.Vector3(0, 0.5, 0);
    camera.lookAt(cameraLookTarget);

    // 2. RENDERER
    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(renderer.domElement);

    // 3. LIGHTING (Restrained, cool cyan / enterprise palette)
    const ambientLight = new THREE.AmbientLight(0x0f2938, 1.6);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0x38bdf8, 2.2);
    dirLight.position.set(12, 20, 10);
    scene.add(dirLight);

    const pointLight = new THREE.PointLight(0x10b981, 2.5, 25);
    pointLight.position.set(0, 3, 2);
    scene.add(pointLight);

    // 4. PROCEDURAL PERSPECTIVE GRID
    const gridHelper = new THREE.GridHelper(50, 50, 0x06b6d4, 0x0a2233);
    gridHelper.position.y = 0;
    scene.add(gridHelper);

    // 5. PROCEDURAL CITY (Cuboid Buildings with illuminated edges)
    const cityGroup = new THREE.Group();
    scene.add(cityGroup);

    const buildingBoxGeo = new THREE.BoxGeometry(1, 1, 1);
    const buildingMat = new THREE.MeshLambertMaterial({
      color: 0x07111c,
      emissive: 0x041724,
      transparent: true,
      opacity: 0
    });

    const edgeLineMat = new THREE.LineBasicMaterial({
      color: 0x0284c7,
      transparent: true,
      opacity: 0
    });

    const buildings = [];
    const cityGridSize = 7;
    const spacing = 2.4;

    for (let x = -cityGridSize; x <= cityGridSize; x++) {
      for (let z = -cityGridSize; z <= cityGridSize; z++) {
        // Skip central corridor for camera travel
        if (Math.abs(x) <= 1 && Math.abs(z) <= 1) continue;
        if (Math.random() > 0.42) continue; // Natural urban density variation

        const bWidth = 0.9 + Math.random() * 0.7;
        const bDepth = 0.9 + Math.random() * 0.7;
        const bHeight = 1.2 + Math.random() * 5.2;

        const posX = x * spacing + (Math.random() - 0.5) * 0.6;
        const posZ = z * spacing + (Math.random() - 0.5) * 0.6;

        const mesh = new THREE.Mesh(buildingBoxGeo, buildingMat);
        mesh.scale.set(bWidth, bHeight, bDepth);
        mesh.position.set(posX, bHeight / 2, posZ);
        cityGroup.add(mesh);

        // Architectural edge lines
        const edges = new THREE.EdgesGeometry(new THREE.BoxGeometry(bWidth, bHeight, bDepth));
        const line = new THREE.LineSegments(edges, edgeLineMat);
        line.position.copy(mesh.position);
        cityGroup.add(line);

        buildings.push({ mesh, line, initialY: bHeight / 2, height: bHeight });
      }
    }

    // 6. PROCEDURAL FLOATING PARTICLES (BufferGeometry)
    const particleCount = 380;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleVelocities = [];

    for (let i = 0; i < particleCount; i++) {
      particlePositions[i * 3] = (Math.random() - 0.5) * 36;
      particlePositions[i * 3 + 1] = Math.random() * 12;
      particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 36;
      particleVelocities.push({
        x: (Math.random() - 0.5) * 0.015,
        y: 0.008 + Math.random() * 0.012,
        z: (Math.random() - 0.5) * 0.015
      });
    }

    particleGeo.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0x38bdf8,
      size: 0.12,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending
    });
    const particleSystem = new THREE.Points(particleGeo, particleMat);
    scene.add(particleSystem);

    // 7. CIVIC ISSUE MARKERS
    // Marker coordinates across city
    const issueCoords = [
      { x: 0, y: 0.6, z: 1.8, isCenterFocus: true },
      { x: -3.5, y: 0.5, z: 4.2 },
      { x: 4.2, y: 0.5, z: 2.8 },
      { x: -2.8, y: 0.5, z: -2.4 },
      { x: 3.2, y: 0.5, z: -3.8 },
      { x: 5.6, y: 0.5, z: -1.2 },
      { x: -4.8, y: 0.5, z: 1.0 }
    ];

    const issueMarkersGroup = new THREE.Group();
    scene.add(issueMarkersGroup);

    const markerSphereGeo = new THREE.SphereGeometry(0.24, 16, 16);
    const markerBeamGeo = new THREE.CylinderGeometry(0.025, 0.025, 3.2, 8);
    const ringGeo = new THREE.RingGeometry(0.2, 0.85, 32);
    ringGeo.rotateX(-Math.PI / 2);

    const markerData = issueCoords.map((coord) => {
      const group = new THREE.Group();
      group.position.set(coord.x, coord.y, coord.z);
      group.scale.set(0, 0, 0);

      // Core sphere
      const sphereMat = new THREE.MeshBasicMaterial({
        color: coord.isCenterFocus ? 0x00f2fe : 0x10b981,
        transparent: true,
        opacity: 0.95
      });
      const sphere = new THREE.Mesh(markerSphereGeo, sphereMat);
      sphere.position.y = 0.2;
      group.add(sphere);

      // Vertical beam
      const beamMat = new THREE.MeshBasicMaterial({
        color: coord.isCenterFocus ? 0x38bdf8 : 0x34d399,
        transparent: true,
        opacity: 0.75,
        blending: THREE.AdditiveBlending
      });
      const beam = new THREE.Mesh(markerBeamGeo, beamMat);
      beam.position.y = 1.6;
      group.add(beam);

      // Ground pulse ring
      const ringMat = new THREE.MeshBasicMaterial({
        color: coord.isCenterFocus ? 0x00f2fe : 0x10b981,
        transparent: true,
        opacity: 0.8,
        side: THREE.DoubleSide
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.position.y = 0.02;
      group.add(ring);

      issueMarkersGroup.add(group);
      return { group, sphere, beam, ring, ringMat, isCenterFocus: coord.isCenterFocus, pos: coord };
    });

    // 8. CIVIC INTELLIGENCE NETWORK LINES
    const linePairs = [];
    for (let i = 0; i < issueCoords.length; i++) {
      for (let j = i + 1; j < issueCoords.length; j++) {
        linePairs.push(issueCoords[i].x, issueCoords[i].y + 0.2, issueCoords[i].z);
        linePairs.push(issueCoords[j].x, issueCoords[j].y + 0.2, issueCoords[j].z);
      }
    }
    const networkLineGeo = new THREE.BufferGeometry();
    networkLineGeo.setAttribute("position", new THREE.Float32BufferAttribute(linePairs, 3));
    const networkLineMat = new THREE.LineBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending
    });
    const networkLines = new THREE.LineSegments(networkLineGeo, networkLineMat);
    scene.add(networkLines);

    // 9. CENTRAL INTELLIGENCE NODE (Spherical core + Gyro Rings)
    const centralNodeGroup = new THREE.Group();
    centralNodeGroup.position.set(0, 3.5, 0);
    centralNodeGroup.scale.set(0, 0, 0);
    scene.add(centralNodeGroup);

    // Central orb
    const centralOrb = new THREE.Mesh(
      new THREE.SphereGeometry(0.65, 24, 24),
      new THREE.MeshBasicMaterial({
        color: 0x00f2fe,
        transparent: true,
        opacity: 0.95
      })
    );
    centralNodeGroup.add(centralOrb);

    // Rotating Gyro Rings
    const gyroRingGeo1 = new THREE.TorusGeometry(1.4, 0.025, 16, 64);
    const gyroRingMat1 = new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.8 });
    const gyro1 = new THREE.Mesh(gyroRingGeo1, gyroRingMat1);
    centralNodeGroup.add(gyro1);

    const gyroRingGeo2 = new THREE.TorusGeometry(1.8, 0.02, 16, 64);
    const gyroRingMat2 = new THREE.MeshBasicMaterial({ color: 0x10b981, transparent: true, opacity: 0.7 });
    const gyro2 = new THREE.Mesh(gyroRingGeo2, gyroRingMat2);
    gyro2.rotation.x = Math.PI / 3;
    centralNodeGroup.add(gyro2);

    // 10. GSAP TIMELINE ORCHESTRATION (Deterministic, 0.0s to 5.0s)
    const tl = gsap.timeline({
      onComplete: () => {
        handleComplete();
      }
    });

    // ───────────────────────────────────────────────
    // 0.0 – 0.7s | DIGITAL VOID → CITY
    // ───────────────────────────────────────────────
    tl.to(particleMat, { opacity: 0.85, duration: 0.6, ease: "power2.out" }, 0);
    tl.to(buildingMat, { opacity: 0.95, duration: 0.7, ease: "power2.out" }, 0.1);
    tl.to(edgeLineMat, { opacity: 0.8, duration: 0.7, ease: "power2.out" }, 0.1);

    // Camera rapid cinematic pull-back
    tl.to(
      camera.position,
      {
        x: 0,
        y: 8.5,
        z: 17.0,
        duration: 1.4,
        ease: "power3.out"
      },
      0
    );

    // ───────────────────────────────────────────────
    // 0.7 – 1.5s | CIVIC ISSUES APPEAR
    // ───────────────────────────────────────────────
    markerData.forEach((item, idx) => {
      tl.to(
        item.group.scale,
        {
          x: 1,
          y: 1,
          z: 1,
          duration: 0.45,
          ease: "back.out(2)"
        },
        0.7 + idx * 0.09
      );

      // Radar pulse ring animation
      tl.to(
        item.ring.scale,
        {
          x: 2.6,
          y: 2.6,
          duration: 0.8,
          ease: "power2.out"
        },
        0.75 + idx * 0.09
      );
      tl.to(
        item.ringMat,
        {
          opacity: 0,
          duration: 0.8,
          ease: "power2.out"
        },
        0.75 + idx * 0.09
      );
    });

    // ───────────────────────────────────────────────
    // 1.5 – 2.2s | ISSUE DETECTION
    // ───────────────────────────────────────────────
    // Camera zooms smoothly to central issue
    tl.to(
      camera.position,
      {
        x: 0,
        y: 2.4,
        z: 4.8,
        duration: 0.7,
        ease: "power3.inOut"
      },
      1.5
    );

    // Dims ambient city slightly to heighten focus
    tl.to(ambientLight, { intensity: 0.6, duration: 0.4 }, 1.5);

    // Show floating technical HUD badge
    tl.call(() => setUiStage(1), null, 1.6);
    tl.call(() => setUiStage(0), null, 2.2);

    // ───────────────────────────────────────────────
    // 2.2 – 3.2s | CIVIC INTELLIGENCE NETWORK
    // ───────────────────────────────────────────────
    // Camera pulls back to high-altitude overhead
    tl.to(
      camera.position,
      {
        x: 0,
        y: 16.0,
        z: 18.0,
        duration: 1.0,
        ease: "power3.out"
      },
      2.2
    );

    tl.to(ambientLight, { intensity: 1.5, duration: 0.5 }, 2.2);

    // Activate network lines across city
    tl.to(networkLineMat, { opacity: 0.85, duration: 0.6, ease: "power2.out" }, 2.25);

    // Scale central intelligence node
    tl.to(
      centralNodeGroup.scale,
      {
        x: 1,
        y: 1,
        z: 1,
        duration: 0.8,
        ease: "back.out(1.7)"
      },
      2.3
    );

    // Flash categorical nodes (ROADS, WASTE, WATER, LIGHTING, SAFETY)
    tl.call(() => setUiStage(2), null, 2.5);
    tl.call(() => setUiStage(0), null, 3.1);

    // ───────────────────────────────────────────────
    // 3.2 – 4.2s | NETWORK → LOGO (Magnetic Convergence)
    // ───────────────────────────────────────────────
    // All lines and particles accelerate inward
    tl.to(networkLineMat, { opacity: 0, duration: 0.7, ease: "power4.in" }, 3.2);
    tl.to(buildingMat, { opacity: 0, duration: 0.6, ease: "power3.in" }, 3.2);
    tl.to(edgeLineMat, { opacity: 0, duration: 0.6, ease: "power3.in" }, 3.2);
    tl.to(gridHelper.material, { opacity: 0, duration: 0.6 }, 3.2);

    // Collapse particle system to center
    tl.to(
      particleSystem.scale,
      {
        x: 0.05,
        y: 0.05,
        z: 0.05,
        duration: 0.75,
        ease: "power4.in"
      },
      3.2
    );

    // Issue markers converge to center
    issueMarkersGroup.children.forEach((marker) => {
      tl.to(
        marker.position,
        {
          x: 0,
          y: 3.5,
          z: 0,
          duration: 0.65,
          ease: "power4.in"
        },
        3.25
      );
      tl.to(marker.scale, { x: 0, y: 0, z: 0, duration: 0.5 }, 3.3);
    });

    // Central node expands then morphs
    tl.to(centralNodeGroup.scale, { x: 1.6, y: 1.6, z: 1.6, duration: 0.35, ease: "power2.out" }, 3.65);
    tl.to(centralNodeGroup.scale, { x: 0, y: 0, z: 0, duration: 0.35, ease: "power3.in" }, 4.0);

    // ───────────────────────────────────────────────
    // 4.2 – 5.0s | BRAND REVEAL & SEAMLESS HERO TRANSITION
    // ───────────────────────────────────────────────
    tl.call(() => setUiStage(3), null, 4.1);

    // Direct dissolution into website (NO fade to black)
    tl.call(() => setUiStage(4), null, 4.8);

    // 11. ANIMATION RENDER LOOP
    let animationFrameId;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Camera lookAt tracking
      camera.lookAt(0, 0.6, 0);

      // Rotate central node gyro rings
      gyro1.rotation.y += 0.035;
      gyro1.rotation.x += 0.02;
      gyro2.rotation.y -= 0.025;
      gyro2.rotation.z += 0.03;

      // Slow particle float
      const positions = particleGeo.attributes.position.array;
      for (let i = 0; i < particleCount; i++) {
        positions[i * 3 + 1] += particleVelocities[i].y;
        if (positions[i * 3 + 1] > 14) {
          positions[i * 3 + 1] = 0;
        }
      }
      particleGeo.attributes.position.needsUpdate = true;

      renderer.render(scene, camera);
    };

    animate();

    // 12. RESIZE HANDLER
    function handleResize() {
      const w = window.innerWidth;
      const h = window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    }
    window.addEventListener("resize", handleResize);

    // 13. KEYBOARD ESCAPE TO SKIP
    function handleKeyDown(e) {
      if (e.key === "Escape" || e.key === "Enter") {
        tl.kill();
        handleComplete();
      }
    }
    window.addEventListener("keydown", handleKeyDown);

    function handleComplete() {
      setUiStage(4);
      setTimeout(() => {
        if (onComplete) onComplete();
      }, 350);
    }

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("keydown", handleKeyDown);
      tl.kill();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  function handleSkip() {
    setUiStage(4);
    setTimeout(() => {
      if (onComplete) onComplete();
    }, 300);
  }

  return (
    <div
      className={`fixed inset-0 z-[9999] bg-[#030712] overflow-hidden select-none transition-opacity duration-500 ${
        uiStage === 4 ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      {/* 3D WEBGL PROCEDURAL CANVAS */}
      <div ref={mountRef} className="absolute inset-0" />

      {/* SUBTLE CINEMATIC VIGNETTE */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at center, transparent 40%, rgba(3, 7, 18, 0.75) 100%)"
        }}
      />

      {/* STAGE 1: MINIMAL FLOATING ISSUE DETECTION BADGE (1.5s - 2.2s) */}
      {uiStage === 1 && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none transition-all duration-300">
          <div className="ml-16 mt-4 rounded-xl border border-cyan-500/40 bg-slate-950/80 px-4 py-2.5 backdrop-blur-md shadow-[0_0_25px_rgba(6,182,212,0.25)] text-left">
            <div className="flex items-center gap-2 text-xs font-mono font-bold tracking-wider text-cyan-300">
              <span className="h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
              <span>ISSUE DETECTED</span>
            </div>
            <div className="mt-1 flex items-center justify-between gap-4 text-[11px] font-mono text-slate-400">
              <span>LOCATION VERIFIED</span>
              <span className="font-bold text-amber-400">PRIORITY HIGH</span>
            </div>
          </div>
        </div>
      )}

      {/* STAGE 2: CIVIC CATEGORIES NETWORK FLASH (2.5s - 3.1s) */}
      {uiStage === 2 && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          <div className="relative w-full max-w-lg h-64 flex items-center justify-center">
            <div className="absolute -top-6 text-xs font-mono font-bold tracking-widest text-cyan-400 bg-slate-950/70 px-3 py-1 rounded-full border border-cyan-500/30">
              ROADS
            </div>
            <div className="absolute -bottom-6 text-xs font-mono font-bold tracking-widest text-emerald-400 bg-slate-950/70 px-3 py-1 rounded-full border border-emerald-500/30">
              WASTE
            </div>
            <div className="absolute -left-4 text-xs font-mono font-bold tracking-widest text-sky-400 bg-slate-950/70 px-3 py-1 rounded-full border border-sky-500/30">
              WATER
            </div>
            <div className="absolute -right-4 text-xs font-mono font-bold tracking-widest text-amber-400 bg-slate-950/70 px-3 py-1 rounded-full border border-amber-500/30">
              LIGHTING
            </div>
            <div className="absolute text-[10px] font-mono font-semibold tracking-widest text-slate-300 bg-slate-900/60 px-2.5 py-0.5 rounded-full border border-slate-700">
              SAFETY
            </div>
          </div>
        </div>
      )}

      {/* STAGE 3: BRAND REVEAL (4.1s - 4.8s) */}
      {uiStage === 3 && (
        <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center text-center">
          {/* Procedural Geometric Logo Shield SVG */}
          <div className="mb-5 animate-pulse">
            <svg width="68" height="68" viewBox="0 0 68 68" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M34 6L56 16V34C56 46.5 46.5 57.5 34 62C21.5 57.5 12 46.5 12 34V16L34 6Z"
                stroke="url(#shield-grad)"
                strokeWidth="2.5"
                fill="rgba(6, 182, 212, 0.08)"
              />
              <path
                d="M34 18V50M18 34H50"
                stroke="rgba(56, 189, 248, 0.5)"
                strokeWidth="1.5"
                strokeDasharray="2 3"
              />
              <circle cx="34" cy="34" r="5" fill="#38bdf8" />
              <defs>
                <linearGradient id="shield-grad" x1="12" y1="6" x2="56" y2="62" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#38bdf8" />
                  <stop offset="0.5" stopColor="#00f2fe" />
                  <stop offset="1" stopColor="#10b981" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          <h1 className="text-4xl sm:text-5xl font-black tracking-[0.2em] text-white">
            CIVIC<span className="text-cyan-400">ISSUE</span>
          </h1>

          <p className="mt-3 text-xs sm:text-sm font-mono tracking-[0.35em] text-slate-400 uppercase">
            REPORT • TRACK • RESOLVE
          </p>

          {/* Horizontal Light Sweep */}
          <div className="mt-6 h-[1px] w-64 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_rgba(56,189,248,0.8)]" />
        </div>
      )}

      {/* MINIMAL UNOBTRUSIVE SKIP (ESC) */}
      <div className="absolute top-6 right-6 z-20">
        <button
          type="button"
          onClick={handleSkip}
          onMouseEnter={() => setSkipHover(true)}
          onMouseLeave={() => setSkipHover(false)}
          className="flex items-center gap-1.5 rounded-full border border-slate-800/80 bg-slate-950/70 px-3.5 py-1.5 text-[11px] font-mono text-slate-400 hover:text-white hover:border-cyan-500/40 transition cursor-pointer backdrop-blur-md"
        >
          <span>SKIP</span>
          <kbd className="rounded bg-slate-900 px-1 py-0.2 text-[9px] text-slate-500 border border-slate-800">
            ESC
          </kbd>
        </button>
      </div>
    </div>
  );
}
