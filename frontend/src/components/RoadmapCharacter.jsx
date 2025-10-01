import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

// A lightweight 3D character canvas. Attempts to load /models/runner.glb if present.
// Gracefully falls back to a stylized sphere if loading fails.
export default function RoadmapCharacter({ width = 120, height = 120, className = '' }) {
  const ref = useRef(null);
  const rendererRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const animRef = useRef(null);
  const mixerRef = useRef(null);

  useEffect(() => {
    const mount = ref.current;
    if (!mount) return;
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 1.2, 3.2);

    const hemi = new THREE.HemisphereLight(0xffffff, 0x202030, 1.0);
    scene.add(hemi);
    const dir = new THREE.DirectionalLight(0xffffff, 0.8);
    dir.position.set(3, 5, 2);
    scene.add(dir);

    const clock = new THREE.Clock();

    let disposed = false;

    const addFallback = () => {
      const body = new THREE.Mesh(
        new THREE.SphereGeometry(0.5, 24, 24),
        new THREE.MeshStandardMaterial({ color: 0x6bc5ff, metalness: 0.2, roughness: 0.4 })
      );
      body.position.y = 0.6;
      scene.add(body);
      return body;
    };

    const animate = () => {
      const dt = clock.getDelta();
      if (mixerRef.current) mixerRef.current.update(dt);
      // gentle bob for fallback meshes
      scene.traverse(obj => {
        if (obj.userData.__fallback) {
          obj.position.y = 0.6 + Math.sin(clock.elapsedTime * 4) * 0.03;
          obj.rotation.y += 0.01;
        }
      });
      renderer.render(scene, camera);
      animRef.current = requestAnimationFrame(animate);
    };

    // Try to dynamically load GLTFLoader only on client
    (async () => {
      try {
        const [{ GLTFLoader }] = await Promise.all([
          import('three/examples/jsm/loaders/GLTFLoader.js')
        ]);
        const loader = new GLTFLoader();
        const url = '/models/runner.glb';
        loader.load(url, (gltf) => {
          if (disposed) return;
          const model = gltf.scene || gltf.scenes?.[0];
          if (model) {
            model.scale.set(1.1, 1.1, 1.1);
            model.position.y = 0;
            scene.add(model);
          }
          if (gltf.animations && gltf.animations.length) {
            const mixer = new THREE.AnimationMixer(model);
            const clip = THREE.AnimationClip.findByName(gltf.animations, 'Run') || gltf.animations[0];
            const action = mixer.clipAction(clip);
            action.play();
            mixerRef.current = mixer;
          }
          animate();
        }, undefined, (err) => {
          // Fallback primitive
          const fb = addFallback();
          fb.userData.__fallback = true;
          animate();
        });
      } catch (e) {
        const fb = addFallback();
        fb.userData.__fallback = true;
        animate();
      }
    })();

    rendererRef.current = renderer;
    sceneRef.current = scene;
    cameraRef.current = camera;

    return () => {
      disposed = true;
      cancelAnimationFrame(animRef.current);
      if (renderer) {
        renderer.dispose();
        if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
      }
      scene.traverse(obj => {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
          if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose());
          else obj.material.dispose();
        }
      });
    };
  }, [width, height]);

  return <div ref={ref} className={className} style={{ width, height, pointerEvents: 'none' }} />;
}
