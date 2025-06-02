// src/components/TrafficLight.tsx
import React from "react";
import * as THREE from "three";

export type LightState = "red" | "green" | "yellow" | "off"; // Added yellow and off

interface TrafficLightProps {
    position?: THREE.Vector3 | [number, number, number];
    rotation?: THREE.Euler | [number, number, number];
    lightState?: LightState;
}

const TrafficLight: React.FC<TrafficLightProps> = ({
    position = [0, 0, 0],
    rotation = [0, 0, 0],
    lightState = "red",
}) => {
    const redOn = lightState === "red";
    const yellowOn = lightState === "yellow";
    const greenOn = lightState === "green";

    return (
        <group position={position} rotation={rotation}>
            {/* Pole */}
            <mesh position={[0, 1, 0]}>
                <cylinderGeometry args={[0.1, 0.1, 2, 8]} />
                <meshStandardMaterial color="grey" />
            </mesh>
            {/* Housing */}
            <mesh position={[0, 2.2, 0]}>
                <boxGeometry args={[0.5, 1.5, 0.5]} />
                <meshStandardMaterial color="darkgrey" />
            </mesh>
            {/* Red Light */}
            <mesh position={[0, 2.7, 0.26]}>
                <sphereGeometry args={[0.2, 16, 16]} />
                <meshStandardMaterial
                    color={redOn ? "red" : "#500000"}
                    emissive={redOn ? "red" : "#000000"}
                    emissiveIntensity={redOn ? 1 : 0}
                />
            </mesh>
            {/* Yellow Light */}
            <mesh position={[0, 2.2, 0.26]}>
                <sphereGeometry args={[0.2, 16, 16]} />
                <meshStandardMaterial
                    color={yellowOn ? "yellow" : "#505000"}
                    emissive={yellowOn ? "yellow" : "#000000"}
                    emissiveIntensity={yellowOn ? 1 : 0}
                />
            </mesh>
            {/* Green Light */}
            <mesh position={[0, 1.7, 0.26]}>
                <sphereGeometry args={[0.2, 16, 16]} />
                <meshStandardMaterial
                    color={greenOn ? "lime" : "#005000"}
                    emissive={greenOn ? "lime" : "#000000"}
                    emissiveIntensity={greenOn ? 1 : 0}
                />
            </mesh>
        </group>
    );
};

export default TrafficLight;
