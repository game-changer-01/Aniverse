import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

// Premium luxury animated background using Three.js: golden particles + elegant motion.
export default function ThreeBackground({ className = '' }) {
  const ref = useRef(null);
  const rendererRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const animRef = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const width = el.clientWidth;
    const height = el.clientHeight;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    el.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, width / height, 0.1, 100);
    camera.position.z = 8;

    // Premium golden particles
    const count = 200;
    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    
    for (let i = 0; i < count * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 25; // x
      positions[i + 1] = (Math.random() - 0.5) * 15; // y
      positions[i + 2] = (Math.random() - 0.5) * 12; // z
      sizes[i / 3] = Math.random() * 0.8 + 0.2; // varying sizes
    }
    
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    
    // Luxury gold color scheme
    const material = new THREE.PointsMaterial({ 
      color: 0xd4af37, // luxury gold
      size: 0.03, 
      transparent: true, 
      opacity: 0.4,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true
    });
    
    const points = new THREE.Points(geometry, material);
    scene.add(points);

    // Add subtle rose gold accent particles
    const accentCount = 100;
    const accentPositions = new Float32Array(accentCount * 3);
    for (let i = 0; i < accentCount * 3; i += 3) {
      accentPositions[i] = (Math.random() - 0.5) * 20;
      accentPositions[i + 1] = (Math.random() - 0.5) * 12;
      accentPositions[i + 2] = (Math.random() - 0.5) * 8;
    }
    
    const accentGeometry = new THREE.BufferGeometry();
    accentGeometry.setAttribute('position', new THREE.BufferAttribute(accentPositions, 3));
    
    const accentMaterial = new THREE.PointsMaterial({ 
      color: 0xe8b4b8, // luxury rose
      size: 0.02, 
      transparent: true, 
      opacity: 0.3,
      blending: THREE.AdditiveBlending
    });
    
    const accentPoints = new THREE.Points(accentGeometry, accentMaterial);
    scene.add(accentPoints);

    const clock = new THREE.Clock();

    const resize = () => {
      const w = el.clientWidth;
      const h = el.clientHeight;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    const onResize = () => { resize(); };
    window.addEventListener('resize', onResize);

    const tick = () => {
      const t = clock.getElapsedTime();
      
      // Elegant, slow rotation for main particles
      points.rotation.y = t * 0.02;
      points.rotation.x = Math.sin(t * 0.01) * 0.1;
      
      // Counter-rotate accent particles for depth
      accentPoints.rotation.y = -t * 0.015;
      accentPoints.rotation.z = Math.cos(t * 0.008) * 0.05;
      
      // Subtle floating motion
      points.position.y = Math.sin(t * 0.3) * 0.1;
      accentPoints.position.x = Math.cos(t * 0.2) * 0.08;
      
      renderer.render(scene, camera);
      animRef.current = requestAnimationFrame(tick);
    };
    tick();

    rendererRef.current = renderer; sceneRef.current = scene; cameraRef.current = camera;
    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', onResize);
      geometry.dispose(); 
      material.dispose();
      accentGeometry.dispose(); 
      accentMaterial.dispose();
      if (renderer) { renderer.dispose(); el.removeChild(renderer.domElement); }
    };
  }, []);

  return <div ref={ref} className={className} style={{ position: 'absolute', inset: 0, zIndex: 0 }} />;
}
