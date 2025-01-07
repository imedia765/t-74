import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

const R2D2Scene = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    
    renderer.setSize(window.innerWidth / 2, window.innerHeight / 2);
    containerRef.current.appendChild(renderer.domElement);

    // Create R2D2 body (simplified version)
    const bodyGeometry = new THREE.CylinderGeometry(1, 1, 2, 32);
    const bodyMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);

    // Create head
    const headGeometry = new THREE.SphereGeometry(0.8, 32, 32);
    const headMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.y = 1.4;

    // Create blue details
    const detailGeometry = new THREE.BoxGeometry(0.3, 0.3, 0.1);
    const detailMaterial = new THREE.MeshPhongMaterial({ color: 0x0066ff });
    const detail1 = new THREE.Mesh(detailGeometry, detailMaterial);
    detail1.position.set(0.5, 0, 1);

    const detail2 = detail1.clone();
    detail2.position.set(-0.5, 0.5, 1);

    // Group all parts
    const r2d2 = new THREE.Group();
    r2d2.add(body);
    r2d2.add(head);
    r2d2.add(detail1);
    r2d2.add(detail2);
    scene.add(r2d2);

    // Add lighting
    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    // Position camera
    camera.position.z = 5;

    // Animation
    const animate = () => {
      requestAnimationFrame(animate);

      r2d2.rotation.y += 0.01;
      
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