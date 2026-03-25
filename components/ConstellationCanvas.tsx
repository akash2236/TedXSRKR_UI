import React, { useRef, useMemo } from 'react';
// FIX: Import `ThreeElements` to provide types for react-three-fiber's intrinsic elements.
import { Canvas, useFrame, ThreeElements } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

// FIX: Extend the global JSX namespace to include react-three-fiber's intrinsic elements
// and explicitly merge with React's standard HTML elements to fix widespread JSX type errors.
declare global {
    namespace JSX {
        interface IntrinsicElements extends React.JSX.IntrinsicElements {
            group: ThreeElements['group'];
            ambientLight: ThreeElements['ambientLight'];
        }
    }
}

const Constellation = () => {
    // FIX: Initialize useRef with null and provide a specific type for the group.
    // This resolves the "Expected 1 arguments, but got 0" error, improves type safety,
    // and refactors to use a single ref on the group to rotate both point sets together.
    const ref = useRef<THREE.Group>(null);
    const count = 5000;
    const radius = 50;

    const positions = useMemo(() => {
        const pos = new Float32Array(count * 3);
        for (let i = 0; i < count; i++) {
            const theta = THREE.MathUtils.randFloatSpread(360);
            const phi = THREE.MathUtils.randFloatSpread(360);
            const x = radius * Math.sin(theta) * Math.cos(phi);
            const y = radius * Math.sin(theta) * Math.sin(phi);
            const z = radius * Math.cos(theta);
            pos.set([x, y, z], i * 3);
        }
        return pos;
    }, []);

    useFrame((state, delta) => {
        if(ref.current) {
            ref.current.rotation.x -= delta / 20;
            ref.current.rotation.y -= delta / 25;

            const { pointer } = state;
            ref.current.rotation.y += pointer.x * delta * 0.5;
            ref.current.rotation.x += pointer.y * delta * 0.5;
        }
    });

    return (
        <group ref={ref}>
            <Points positions={positions} stride={3} frustumCulled={false}>
                <PointMaterial
                    transparent
                    color="#ffffff"
                    size={0.03}
                    sizeAttenuation={true}
                    depthWrite={false}
                />
            </Points>
             <Points positions={positions} stride={3} frustumCulled={false}>
                <PointMaterial
                    transparent
                    color="#EB0028"
                    size={0.05}
                    sizeAttenuation={true}
                    depthWrite={false}
                />
            </Points>
        </group>
    );
};

const ConstellationCanvas: React.FC = () => {
    return (
        <div className="absolute top-0 left-0 w-full h-full">
            <Canvas camera={{ position: [0, 0, 15] }}>
                <ambientLight intensity={0.5} />
                <Constellation />
            </Canvas>
        </div>
    );
};

export default ConstellationCanvas;