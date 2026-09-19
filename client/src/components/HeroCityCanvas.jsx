import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { Sparkles, ShieldCheck, Activity, CheckCircle2, AlertTriangle, Flame } from "lucide-react";

export default function HeroCityCanvas() {
  const mountRef = useRef(null);
  const [hoveredIssue, setHoveredIssue] = useState(null);
  const [selectedIssue, setSelectedIssue] = useState({
    title: "Structural Road Fracture & Pothole",
    category: "Road Infrastructure",
    confidence: "96.8%",
    severity: "HIGH",
    dupRisk: "2.1%",
    location: "Sector 4, Central Corridor",
    status: "AI VERIFIED"
  });

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 500;
    const height = container.clientHeight || 460;

    // 1. SCENE & CAMERA
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x06111a, 0.045);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 11, 16);
    camera.lookAt(0, 0.5, 0);

    // 2. RENDERER
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(renderer.domElement);

    // 3. LIGHTING
    const ambientLight = new THREE.AmbientLight(0x1a3344, 2.0);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0x38bdf8, 2.5);
    dirLight.position.set(10, 20, 12);
    scene.add(dirLight);

    const pointLight = new THREE.PointLight(0x10b981, 2.2, 20);
    pointLight.position.set(0, 4, 2);
    scene.add(pointLight);

    // 4. PROCEDURAL GRID
    const grid = new THREE.GridHelper(30, 30, 0x0ea5e9, 0x11293b);
    grid.position.y = 0;
    scene.add(grid);

    // 5. PROCEDURAL CITY BUILDINGS
    const cityGroup = new THREE.Group();
    scene.add(cityGroup);

    const boxGeo = new THREE.BoxGeometry(1, 1, 1);
    const buildingMat = new THREE.MeshLambertMaterial({
      color: 0x081622,
      emissive: 0x030c14,
      transparent: true,
      opacity: 0.94
    });
    const edgeMat = new THREE.LineBasicMaterial({
      color: 0x0284c7,
      transparent: true,
      opacity: 0.6
    });

    const gridSize = 5;
    const spacing = 2.2;

    for (let x = -gridSize; x <= gridSize; x++) {
      for (let z = -gridSize; z <= gridSize; z++) {
        if (Math.abs(x) <= 1 && Math.abs(z) <= 1) continue;
        if (Math.random() > 0.45) continue;

        const bWidth = 0.8 + Math.random() * 0.6;
        const bDepth = 0.8 + Math.random() * 0.6;
        const bHeight = 1.0 + Math.random() * 4.2;

        const mesh = new THREE.Mesh(boxGeo, buildingMat);
        mesh.scale.set(bWidth, bHeight, bDepth);
        mesh.position.set(x * spacing, bHeight / 2, z * spacing);
        cityGroup.add(mesh);

        const edges = new THREE.EdgesGeometry(new THREE.BoxGeometry(bWidth, bHeight, bDepth));
        const line = new THREE.LineSegments(edges, edgeMat);
        line.position.copy(mesh.position);
        cityGroup.add(line);
      }
    }

    // 6. PROCEDURAL ISSUE MARKERS (Green, Orange, Red, Blue)
    // GREEN = resolved, ORANGE = investigation, RED = critical, BLUE = AI verified
    const issueList = [
      {
        id: 1,
        title: "Structural Road Fracture & Pothole",
        category: "Road Infrastructure",
        type: "BLUE",
        color: 0x38bdf8,
        pos: [0, 0.4, 1.8],
        severity: "HIGH",
        confidence: "96.8%",
        status: "AI VERIFIED"
      },
      {
        id: 2,
        title: "High-Voltage Cable Exposure",
        category: "Electrical Hazard",
        type: "RED",
        color: 0xef4444,
        pos: [-3.2, 0.4, 2.5],
        severity: "CRITICAL",
        confidence: "99.1%",
        status: "CRITICAL ALERT"
      },
      {
        id: 3,
        title: "Municipal Drain Overflow Resolved",
        category: "Sanitation & Water",
        type: "GREEN",
        color: 0x10b981,
        pos: [3.4, 0.4, 3.2],
        severity: "RESOLVED",
        confidence: "98.4%",
        status: "RESOLVED & AUDITED"
      },
      {
        id: 4,
        title: "Damaged Traffic Signal Post",
        category: "Traffic & Transit",
        type: "ORANGE",
        color: 0xf59e0b,
        pos: [-2.5, 0.4, -2.4],
        severity: "INVESTIGATION",
        confidence: "94.2%",
        status: "OFFICER ASSIGNED"
      },
      {
        id: 5,
        title: "Water Pipeline Leak Fixed",
        category: "Public Utilities",
        type: "GREEN",
        color: 0x10b981,
        pos: [3.0, 0.4, -3.2],
        severity: "RESOLVED",
        confidence: "97.5%",
        status: "RESOLVED & AUDITED"
      }
    ];

    const markersGroup = new THREE.Group();
    scene.add(markersGroup);

    const markerMeshes = [];
    const sphereGeo = new THREE.SphereGeometry(0.22, 16, 16);
    const beamGeo = new THREE.CylinderGeometry(0.02, 0.02, 2.8, 8);
    const ringGeo = new THREE.RingGeometry(0.15, 0.65, 32);
    ringGeo.rotateX(-Math.PI / 2);

    issueList.forEach((issue) => {
      const g = new THREE.Group();
      g.position.set(...issue.pos);

      // Glowing Sphere
      const sphereMat = new THREE.MeshBasicMaterial({ color: issue.color });
      const sphere = new THREE.Mesh(sphereGeo, sphereMat);
      sphere.position.y = 0.2;
      g.add(sphere);

      // Vertical Light Beam
      const beamMat = new THREE.MeshBasicMaterial({
        color: issue.color,
        transparent: true,
        opacity: 0.65,
        blending: THREE.AdditiveBlending
      });
      const beam = new THREE.Mesh(beamGeo, beamMat);
      beam.position.y = 1.4;
      g.add(beam);

      // Pulse Ring
      const ringMat = new THREE.MeshBasicMaterial({
        color: issue.color,
        transparent: true,
        opacity: 0.7,
        side: THREE.DoubleSide
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.position.y = 0.02;
      g.add(ring);

      sphere.userData = issue;
      markerMeshes.push({ group: g, ring, ringMat, sphere, issue });
      markersGroup.add(g);
    });

    // 7. DYNAMIC NETWORK LINES
    const lineCoords = [];
    for (let i = 0; i < issueList.length; i++) {
      for (let j = i + 1; j < issueList.length; j++) {
        lineCoords.push(...issueList[i].pos);
        lineCoords.push(...issueList[j].pos);
      }
    }
    const netGeo = new THREE.BufferGeometry();
    netGeo.setAttribute("position", new THREE.Float32BufferAttribute(lineCoords, 3));
    const netMat = new THREE.LineBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.35,
      blending: THREE.AdditiveBlending
    });
    const netLines = new THREE.LineSegments(netGeo, netMat);
    scene.add(netLines);

    // 8. INTERACTIVE ROTATION & RAYCASTING
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };
    let rotationVelocity = { x: 0, y: 0.0015 };

    const handleMouseDown = (e) => {
      isDragging = true;
      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const handleMouseMove = (e) => {
      if (!isDragging) return;
      const deltaX = e.clientX - previousMousePosition.x;
      const deltaY = e.clientY - previousMousePosition.y;

      cityGroup.rotation.y += deltaX * 0.005;
      markersGroup.rotation.y += deltaX * 0.005;
      netLines.rotation.y += deltaX * 0.005;

      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const handleMouseUp = () => {
      isDragging = false;
    };

    container.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    // 9. ANIMATION LOOP
    let reqId;
    let time = 0;

    const animate = () => {
      reqId = requestAnimationFrame(animate);
      time += 0.03;

      // Gentle continuous ambient rotation
      if (!isDragging) {
        cityGroup.rotation.y += rotationVelocity.y;
        markersGroup.rotation.y += rotationVelocity.y;
        netLines.rotation.y += rotationVelocity.y;
      }

      // Pulse markers
      markerMeshes.forEach((item, idx) => {
        const s = 1 + Math.sin(time * 2 + idx) * 0.15;
        item.sphere.scale.set(s, s, s);

        const rScale = 1 + ((time * 1.5 + idx * 0.5) % 2.0);
        item.ring.scale.set(rScale, rScale, 1);
        item.ringMat.opacity = Math.max(0, 0.8 - (rScale - 1) * 0.7);
      });

      renderer.render(scene, camera);
    };

    animate();

    // Resize
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(reqId);
      container.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div className="relative h-[480px] w-full rounded-3xl border border-slate-200/80 bg-slate-950 p-2 shadow-2xl shadow-slate-950/20 overflow-hidden select-none">
      {/* 3D WebGL Canvas */}
      <div ref={mountRef} className="h-full w-full cursor-grab active:cursor-grabbing rounded-2xl overflow-hidden" />

      {/* Top Left Live Status Panel */}
      <div className="absolute top-4 left-4 z-10 flex items-center gap-2 rounded-xl border border-slate-800/80 bg-slate-900/85 px-3 py-1.5 text-xs text-white backdrop-blur-md shadow-lg">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
        </span>
        <span className="font-mono text-[11px] tracking-wider text-slate-300 font-bold uppercase">
          LIVE CIVIC NETWORK
        </span>
        <span className="text-slate-600">•</span>
        <span className="text-[11px] text-emerald-400 font-semibold">24 Active</span>
        <span className="text-slate-600">•</span>
        <span className="text-[11px] text-cyan-400 font-semibold">17 Verified</span>
        <span className="text-slate-600">•</span>
        <span className="text-[11px] text-slate-400 font-semibold">9 Resolved Today</span>
      </div>

      {/* Bottom Floating Legend Pills */}
      <div className="absolute bottom-4 left-4 z-10 flex flex-wrap gap-2 text-[10px] font-mono">
        <span className="flex items-center gap-1 rounded-lg border border-emerald-500/30 bg-slate-900/80 px-2.5 py-1 text-emerald-400 backdrop-blur-md">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Resolved
        </span>
        <span className="flex items-center gap-1 rounded-lg border border-cyan-500/30 bg-slate-900/80 px-2.5 py-1 text-cyan-400 backdrop-blur-md">
          <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" /> AI Verified
        </span>
        <span className="flex items-center gap-1 rounded-lg border border-amber-500/30 bg-slate-900/80 px-2.5 py-1 text-amber-400 backdrop-blur-md">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-400" /> Under Review
        </span>
        <span className="flex items-center gap-1 rounded-lg border border-rose-500/30 bg-slate-900/80 px-2.5 py-1 text-rose-400 backdrop-blur-md">
          <span className="h-1.5 w-1.5 rounded-full bg-rose-400" /> Critical
        </span>
      </div>

      {/* 7. HERO MICRO-UI: Floating Minimal AI Verification Card */}
      <div className="absolute top-4 right-4 z-10 w-56 rounded-2xl border border-cyan-500/30 bg-slate-900/85 p-3.5 text-xs text-white backdrop-blur-xl shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <span className="flex items-center gap-1.5 text-[10px] font-mono font-bold tracking-widest text-cyan-400 uppercase">
            <Sparkles size={11} /> AI VERIFICATION
          </span>
          <span className="rounded bg-cyan-950/80 px-1.5 py-0.2 font-mono text-[9px] font-bold text-cyan-300 border border-cyan-500/40">
            {selectedIssue.confidence}
          </span>
        </div>

        <div className="mt-2.5 space-y-1.5">
          <p className="font-bold text-slate-100 truncate text-[11px]">{selectedIssue.title}</p>
          <div className="flex items-center justify-between text-[10px] text-slate-400">
            <span>Severity</span>
            <span className="font-bold text-amber-400">{selectedIssue.severity}</span>
          </div>
          <div className="flex items-center justify-between text-[10px] text-slate-400">
            <span>Duplicate Risk</span>
            <span className="font-mono text-emerald-400">{selectedIssue.dupRisk}</span>
          </div>
          <div className="flex items-center justify-between text-[10px] text-slate-400">
            <span>Location</span>
            <span className="font-mono text-cyan-300">VERIFIED</span>
          </div>
        </div>

        <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center gap-1.5 text-[10px] font-semibold text-emerald-400">
          <CheckCircle2 size={12} className="text-emerald-400 shrink-0" />
          <span>✓ AI verification complete</span>
        </div>
      </div>
    </div>
  );
}
