import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { Sparkles, ShieldCheck, Activity, CheckCircle2, AlertTriangle } from "lucide-react";
import { api } from "../api.js";

export default function HeroCityCanvas() {
  const mountRef = useRef(null);
  const [issues, setIssues] = useState([]);
  const [stats, setStats] = useState({
    active: 0,
    resolved: 0,
    resolvedToday: 0,
    aiVerifiedCount: 0,
    total: 0
  });
  const [selectedIssue, setSelectedIssue] = useState(null);

  // Fetch real issues and stats from backend
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        const [issuesRes, statsRes] = await Promise.allSettled([
          api.get("/issues"),
          api.get("/issues/stats")
        ]);

        if (issuesRes.status === "fulfilled" && issuesRes.value.data?.issues) {
          const fetchedIssues = issuesRes.value.data.issues;
          if (isMounted) {
            setIssues(fetchedIssues);
            if (fetchedIssues.length > 0) {
              setSelectedIssue(fetchedIssues[0]);
            }
          }
        }

        if (statsRes.status === "fulfilled" && statsRes.value.data?.stats) {
          if (isMounted) {
            setStats(statsRes.value.data.stats);
          }
        }
      } catch (err) {
        console.error("Failed to fetch live city telemetry:", err);
      }
    }

    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

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

    const pointLight = new THREE.PointLight(0xffffff, 2.2, 20);
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

    // 6. REAL ISSUES AS DYNAMIC MARKERS
    const markersGroup = new THREE.Group();
    scene.add(markersGroup);

    const markerMeshes = [];
    const sphereGeo = new THREE.SphereGeometry(0.22, 16, 16);
    const beamGeo = new THREE.CylinderGeometry(0.02, 0.02, 2.8, 8);
    const ringGeo = new THREE.RingGeometry(0.15, 0.65, 32);
    ringGeo.rotateX(-Math.PI / 2);

    // Map real issues from state (or default to center if none)
    const activeIssueItems = issues.length > 0 ? issues : [];

    // Color resolution for issue status
    function getStatusColor(issue) {
      const phase = (issue.phase || issue.status || "").toUpperCase();
      if (phase === "RESOLVED" || phase === "CLOSED") return 0xffffff; // Monochrome White
      if (phase === "IN_PROGRESS") return 0xf59e0b; // Orange
      if (phase === "RESOLUTION_REVIEW") return 0x38bdf8; // Cyan / AI Verified
      return 0xef4444; // Red (NEW / URGENT)
    }

    // Center coordinates for delta mapping
    const centerLat = activeIssueItems[0]?.latitude || 28.6139;
    const centerLng = activeIssueItems[0]?.longitude || 77.2090;

    const lineCoords = [];

    activeIssueItems.forEach((issue, idx) => {
      // Calculate normalized 3D position from actual latitude/longitude
      const dLat = ((issue.latitude || centerLat) - centerLat) * 350;
      const dLng = ((issue.longitude || centerLng) - centerLng) * 350;
      
      // Add slight offset if multiple issues share exact same location
      const angleOffset = (idx * Math.PI * 2) / (activeIssueItems.length || 1);
      const radiusOffset = idx === 0 ? 0 : 2.5;
      const posX = idx === 0 ? 0 : Math.cos(angleOffset) * radiusOffset + dLng;
      const posZ = idx === 0 ? 1.5 : Math.sin(angleOffset) * radiusOffset + dLat;
      const posY = 0.4;

      const markerColor = getStatusColor(issue);

      const g = new THREE.Group();
      g.position.set(posX, posY, posZ);

      // Glowing Sphere
      const sphereMat = new THREE.MeshBasicMaterial({ color: markerColor });
      const sphere = new THREE.Mesh(sphereGeo, sphereMat);
      sphere.position.y = 0.2;
      g.add(sphere);

      // Vertical Light Beam
      const beamMat = new THREE.MeshBasicMaterial({
        color: markerColor,
        transparent: true,
        opacity: 0.65,
        blending: THREE.AdditiveBlending
      });
      const beam = new THREE.Mesh(beamGeo, beamMat);
      beam.position.y = 1.4;
      g.add(beam);

      // Pulse Ring
      const ringMat = new THREE.MeshBasicMaterial({
        color: markerColor,
        transparent: true,
        opacity: 0.7,
        side: THREE.DoubleSide
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.position.y = 0.02;
      g.add(ring);

      markerMeshes.push({ group: g, ring, ringMat, sphere, issue });
      markersGroup.add(g);

      // Connect lines
      lineCoords.push(posX, posY, posZ);
    });

    // 7. DYNAMIC NETWORK LINES
    let netLines = null;
    if (lineCoords.length >= 6) {
      const netGeo = new THREE.BufferGeometry();
      netGeo.setAttribute("position", new THREE.Float32BufferAttribute(lineCoords, 3));
      const netMat = new THREE.LineBasicMaterial({
        color: 0x38bdf8,
        transparent: true,
        opacity: 0.35,
        blending: THREE.AdditiveBlending
      });
      netLines = new THREE.LineSegments(netGeo, netMat);
      scene.add(netLines);
    }

    // 8. INTERACTIVE ROTATION
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };
    const rotationVelocity = { y: 0.0015 };

    const handleMouseDown = (e) => {
      isDragging = true;
      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const handleMouseMove = (e) => {
      if (!isDragging) return;
      const deltaX = e.clientX - previousMousePosition.x;
      cityGroup.rotation.y += deltaX * 0.005;
      markersGroup.rotation.y += deltaX * 0.005;
      if (netLines) netLines.rotation.y += deltaX * 0.005;
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

      if (!isDragging) {
        cityGroup.rotation.y += rotationVelocity.y;
        markersGroup.rotation.y += rotationVelocity.y;
        if (netLines) netLines.rotation.y += rotationVelocity.y;
      }

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
  }, [issues]);

  return (
    <div className="relative h-[480px] w-full rounded-2xl border border-slate-800 bg-[#020817] p-2 shadow-xl overflow-hidden select-none">
      {/* 3D WebGL Canvas */}
      <div ref={mountRef} className="h-full w-full cursor-grab active:cursor-grabbing rounded-xl overflow-hidden" />

      {/* Top Left Live Status Panel - Bound to Real Database Telemetry */}
      <div className="absolute top-4 left-4 z-10 flex items-center gap-2 rounded-xl border border-neutral-800 bg-black/90 px-3 py-1.5 text-xs text-white backdrop-blur-md shadow-lg">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
        </span>
        <span className="font-mono text-[11px] tracking-wider text-neutral-300 font-bold uppercase">
          CIVIC RADAR
        </span>
        <span className="text-neutral-600">•</span>
        <span className="text-[11px] text-white font-semibold">{stats.active} Active</span>
        <span className="text-neutral-600">•</span>
        <span className="text-[11px] text-neutral-300 font-semibold">{stats.aiVerifiedCount} Verified</span>
        <span className="text-neutral-600">•</span>
        <span className="text-[11px] text-neutral-400 font-semibold">{stats.resolvedToday || stats.resolved} Resolved</span>
      </div>

      {/* Bottom Floating Legend Pills */}
      <div className="absolute bottom-4 left-4 z-10 flex flex-wrap gap-2 text-[10px] font-mono">
        <span className="flex items-center gap-1 rounded-lg border border-neutral-700 bg-black/90 px-2.5 py-1 text-white backdrop-blur-md">
          <span className="h-1.5 w-1.5 rounded-full bg-white" /> Resolved
        </span>
        <span className="flex items-center gap-1 rounded-lg border border-neutral-700 bg-black/90 px-2.5 py-1 text-neutral-300 backdrop-blur-md">
          <span className="h-1.5 w-1.5 rounded-full bg-neutral-300" /> AI Verified
        </span>
        <span className="flex items-center gap-1 rounded-lg border border-amber-500/30 bg-black/90 px-2.5 py-1 text-amber-400 backdrop-blur-md">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-400" /> In Progress
        </span>
        <span className="flex items-center gap-1 rounded-lg border border-rose-500/30 bg-black/90 px-2.5 py-1 text-rose-400 backdrop-blur-md">
          <span className="h-1.5 w-1.5 rounded-full bg-rose-400" /> Critical
        </span>
      </div>

      {/* HERO MICRO-UI: Floating Real AI Verification / Active Issue Card */}
      {selectedIssue && (
        <div className="absolute top-4 right-4 z-10 w-60 rounded-xl border border-neutral-800 bg-black/90 p-3.5 text-xs text-white backdrop-blur-xl shadow-xl">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
            <span className="flex items-center gap-1.5 text-[10px] font-mono font-bold tracking-widest text-white uppercase">
              <Sparkles size={11} /> {selectedIssue.issueCode || "LIVE ISSUE"}
            </span>
            <span className="rounded bg-neutral-800 px-1.5 py-0.5 font-mono text-[9px] font-bold text-neutral-300 border border-neutral-700">
              {selectedIssue.phase || selectedIssue.status}
            </span>
          </div>

          <div className="mt-2.5 space-y-1.5">
            <p className="font-bold text-white truncate text-[11px]" title={selectedIssue.title}>
              {selectedIssue.title}
            </p>
            <div className="flex items-center justify-between text-[10px] text-neutral-400">
              <span>Category</span>
              <span className="font-bold text-neutral-200 capitalize">{selectedIssue.category || "General"}</span>
            </div>
            <div className="flex items-center justify-between text-[10px] text-neutral-400">
              <span>Priority</span>
              <span className="font-bold text-amber-400">{selectedIssue.priority || "MEDIUM"}</span>
            </div>
            <div className="flex items-center justify-between text-[10px] text-neutral-400">
              <span>Community Votes</span>
              <span className="font-mono text-white">{selectedIssue.upvotes || 0} Upvotes</span>
            </div>
          </div>

          <div className="mt-3 pt-2 border-t border-neutral-800 flex items-center justify-between text-[10px] font-semibold text-white">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 size={12} className="text-white shrink-0" />
              <span>{selectedIssue.phase === "RESOLVED" ? "Resolved & Audited" : "In Live Pipeline"}</span>
            </div>
            <span className="text-neutral-500 font-mono text-[9px]">
              {selectedIssue.latitude ? `${selectedIssue.latitude.toFixed(2)}, ${selectedIssue.longitude.toFixed(2)}` : "GPS LOGGED"}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
