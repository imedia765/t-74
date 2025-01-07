import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const R2D2Scene = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Scene setup with improved configuration
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1f2c);
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      alpha: true,
    });
    
    renderer.setSize(window.innerWidth / 2, window.innerHeight / 2);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    containerRef.current.appendChild(renderer.domElement);

    // Add OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxDistance = 10;
    controls.minDistance = 3;

    // Create R2D2 body with improved materials
    const bodyGeometry = new THREE.CylinderGeometry(1, 1.2, 2, 32);
    const bodyMaterial = new THREE.MeshPhysicalMaterial({ 
      color: 0xffffff,
      metalness: 0.9,
      roughness: 0.1,
      clearcoat: 0.5,
      clearcoatRoughness: 0.1
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.castShadow = true;
    body.receiveShadow = true;

    // Create detailed head
    const headGeometry = new THREE.SphereGeometry(0.8, 32, 32);
    const headMaterial = new THREE.MeshPhysicalMaterial({ 
      color: 0xffffff,
      metalness: 0.9,
      roughness: 0.1,
      clearcoat: 0.5,
      clearcoatRoughness: 0.1
    });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.y = 1.4;
    head.castShadow = true;

    // Create eye lens
    const eyeGeometry = new THREE.CircleGeometry(0.2, 32);
    const eyeMaterial = new THREE.MeshPhysicalMaterial({ 
      color: 0x000000,
      metalness: 1,
      roughness: 0,
      transmission: 0.9,
      thickness: 0.5
    });
    const eye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    eye.position.set(0, 1.4, 0.8);
    eye.rotation.y = Math.PI;

    // Create blue details with glowing effect
    const detailGeometry = new THREE.BoxGeometry(0.3, 0.3, 0.1);
    const detailMaterial = new THREE.MeshPhongMaterial({ 
      color: 0x00ffff,
      emissive: 0x0066ff,
      emissiveIntensity: 0.5,
      shininess: 100
    });

    const details = [];
    const detailPositions = [
      { x: 0.5, y: 0, z: 1 },
      { x: -0.5, y: 0.5, z: 1 },
      { x: 0.3, y: -0.5, z: 1 },
      { x: -0.3, y: 0.2, z: 1 }
    ];

    detailPositions.forEach(pos => {
      const detail = new THREE.Mesh(detailGeometry, detailMaterial);
      detail.position.set(pos.x, pos.y, pos.z);
      detail.castShadow = true;
      details.push(detail);
    });

    // Add legs
    const legGeometry = new THREE.CylinderGeometry(0.2, 0.3, 1, 16);
    const legMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xcccccc,
      metalness: 0.8,
      roughness: 0.2
    });

    const leg1 = new THREE.Mesh(legGeometry, legMaterial);
    leg1.position.set(0.7, -1.5, 0);
    leg1.castShadow = true;

    const leg2 = leg1.clone();
    leg2.position.set(-0.7, -1.5, 0);

    // Group all parts
    const r2d2 = new THREE.Group();
    r2d2.add(body);
    r2d2.add(head);
    r2d2.add(eye);
    details.forEach(detail => r2d2.add(detail));
    r2d2.add(leg1);
    r2d2.add(leg2);
    scene.add(r2d2);

    // Enhanced lighting setup
    const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
    scene.add(ambientLight);
    
    const mainLight = new THREE.DirectionalLight(0xffffff, 1);
    mainLight.position.set(5, 5, 5);
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.width = 2048;
    mainLight.shadow.mapSize.height = 2048;
    scene.add(mainLight);

    const backLight = new THREE.DirectionalLight(0x8080ff, 0.5);
    backLight.position.set(-5, 5, -5);
    scene.add(backLight);

    // Add point lights for dramatic effect
    const pointLight1 = new THREE.PointLight(0x00ffff, 1, 10);
    pointLight1.position.set(2, 2, 2);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0xff00ff, 1, 10);
    pointLight2.position.set(-2, -2, -2);
    scene.add(pointLight2);

    // Position camera
    camera.position.z = 5;
    camera.position.y = 1;

    // Animation
    const animate = () => {
      requestAnimationFrame(animate);

      // Smooth rotation
      r2d2.rotation.y += 0.005;
      
      // Animate lights
      const time = Date.now() * 0.001;
      pointLight1.intensity = 1 + Math.sin(time) * 0.5;
      pointLight2.intensity = 1 + Math.cos(time) * 0.5;

      // Update controls
      controls.update();
      
      renderer.render(scene, camera);
    };

    animate();

    // Handle resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth / 2, window.innerHeight / 2);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      if (containerRef.current) {
        containerRef.current.removeChild(renderer.domElement);
      }
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      className="flex justify-center items-center py-12"
    />
  );
};

export default R2D2Scene;