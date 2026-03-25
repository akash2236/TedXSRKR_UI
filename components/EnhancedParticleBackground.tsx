import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

const ParticleField: React.FC = () => {
    const ref = useRef<THREE.Points>(null);

    // Generate random particle positions
    const particles = useMemo(() => {
        const positions = new Float32Array(2000 * 3);
        for (let i = 0; i < 2000; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 10;
            positions[i * 3 + 1] = (Math.random() - 0.5) * 10;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
        }
        return positions;
    }, []);

    // Animate particles
    useFrame((state) => {
        if (ref.current) {
            ref.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.1) * 0.1;
            ref.current.rotation.y = state.clock.elapsedTime * 0.05;
        }
    });

    return (
        <Points ref={ref} positions={particles} stride={3} frustumCulled={false}>
            <PointMaterial
                transparent
                color="#eb0028"
                size={0.02}
                sizeAttenuation={true}
                depthWrite={false}
                opacity={0.6}
            />
        </Points>
    );
};

const EnhancedParticleBackground: React.FC = () => {
    return (
        <div className="absolute inset-0 w-full h-full">
            <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
                <ambientLight intensity={0.5} />
                <ParticleField />
            </Canvas>
        </div>
    );
};

export default EnhancedParticleBackground;
