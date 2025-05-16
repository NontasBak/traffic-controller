// src/components/Car.tsx
import React, { useRef } from "react";
// import { useFrame } from '@react-three/fiber';
import * as THREE from "three";

interface CarProps {
    initialPosition?: THREE.Vector3 | [number, number, number];
    color?: THREE.ColorRepresentation;
    rotation?: THREE.Euler | [number, number, number];
}

const Car: React.FC<CarProps> = ({
    initialPosition = [0, 0.25, 0],
    rotation = [0, 0, 0],
    color = "blue",
}) => {
    const carRef = useRef<THREE.Mesh>(null!); // Use non-null assertion or type guard

    return (
        <mesh ref={carRef} position={initialPosition} rotation={rotation}>
            <boxGeometry args={[0.6, 0.5, 1.2]} /> {/* Width, Height, Length */}
            <meshStandardMaterial color={color} />
        </mesh>
    );
};

export default Car;
