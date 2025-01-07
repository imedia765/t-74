import React from 'react';
import Hero from '@/components/Hero';
import Features from '@/components/Features';
import Background3D from '@/components/Background3D';
import R2D2Scene from '@/components/R2D2Scene';

const Home = () => {
  return (
    <div className="min-h-screen relative">
      <Background3D />
      
      <div className="relative z-10">
        <Hero />
        
        <div className="container mx-auto px-4 py-12">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent mb-4">
              Meet Our Assistant
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Your friendly AI companion powered by advanced technology
            </p>
          </div>

          <R2D2Scene />
        </div>
        
        <Features />
      </div>
    </div>
  );
};

export default Home;