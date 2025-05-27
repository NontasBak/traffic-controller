// src/components/Car.tsx
import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { LightState } from "./TrafficLight";

interface CarProps {
    startPositionVec: THREE.Vector3;
    stopPositionVec: THREE.Vector3;
    endPositionVec: THREE.Vector3;

    color?: THREE.ColorRepresentation;
    rotationEulers?: [number, number, number];
    associatedLightState: LightState;
    speed?: number;
    movementAxis: "x" | "z";
    movementDirection: 1 | -1;
}

const Car: React.FC<CarProps> = ({
    startPositionVec,
    stopPositionVec,
    endPositionVec,
    color = "blue",
    rotationEulers = [0, 0, 0],
    associatedLightState,
    speed = 5,
    movementAxis,
    movementDirection,
}) => {
    const carRef = useRef<THREE.Mesh>(null!);

    useFrame((_, delta) => {
        if (!carRef.current) return;

        const car = carRef.current;
        const effectiveSpeed = speed * delta;

        if (associatedLightState === "green") {
            if (movementAxis === "x") {
                car.position.x += effectiveSpeed * movementDirection;
                if (
                    (movementDirection === 1 &&
                        car.position.x >= endPositionVec.x) ||
                    (movementDirection === -1 &&
                        car.position.x <= endPositionVec.x)
                ) {
                    car.position.copy(startPositionVec);
                }
            } else {
                // movementAxis === 'z'
                car.position.z += effectiveSpeed * movementDirection;
                if (
                    (movementDirection === 1 &&
                        car.position.z >= endPositionVec.z) ||
                    (movementDirection === -1 &&
                        car.position.z <= endPositionVec.z)
                ) {
                    car.position.copy(startPositionVec);
                }
            }
        } else {
            // Light is 'red'
            if (movementAxis === "x") {
                const currentX = car.position.x;
                const stopX = stopPositionVec.x;
                if (
                    (movementDirection === 1 && currentX < stopX) ||
                    (movementDirection === -1 && currentX > stopX)
                ) {
                    let newX = currentX + effectiveSpeed * movementDirection;
                    if (
                        (movementDirection === 1 && newX >= stopX) ||
                        (movementDirection === -1 && newX <= stopX)
                    ) {
                        newX = stopX;
                    }
                    car.position.x = newX;
                } else if (
                    (movementDirection === 1 && currentX > stopX) ||
                    (movementDirection === -1 && currentX < stopX)
                ) {
                    car.position.x += effectiveSpeed * movementDirection;
                    if (
                        (movementDirection === 1 &&
                            car.position.x >= endPositionVec.x) ||
                        (movementDirection === -1 &&
                            car.position.x <= endPositionVec.x)
                    ) {
                        car.position.copy(startPositionVec);
                    }
                }
            } else {
                // movementAxis === 'z'
                const currentZ = car.position.z;
                const stopZ = stopPositionVec.z;

                if (
                    (movementDirection === 1 && currentZ < stopZ) ||
                    (movementDirection === -1 && currentZ > stopZ)
                ) {
                    let newZ = currentZ + effectiveSpeed * movementDirection;
                    if (
                        (movementDirection === 1 && newZ >= stopZ) ||
                        (movementDirection === -1 && newZ <= stopZ)
                    ) {
                        newZ = stopZ;
                    }
                    car.position.z = newZ;
                } else if (
                    (movementDirection === 1 && currentZ > stopZ) ||
                    (movementDirection === -1 && currentZ < stopZ)
                ) {
                    car.position.z += effectiveSpeed * movementDirection;
                    if (
                        (movementDirection === 1 &&
                            car.position.z >= endPositionVec.z) ||
                        (movementDirection === -1 &&
                            car.position.z <= endPositionVec.z)
                    ) {
                        car.position.copy(startPositionVec);
                    }
                }
            }
        }
    });

    return (
        <group
            ref={carRef}
            position={startPositionVec}
            rotation={rotationEulers}
        >
            {/* Car body */}
            <mesh position={[0, 0.1, 0]}>
                <boxGeometry args={[0.6, 0.4, 1.2]} />
                <meshStandardMaterial color={color} />
            </mesh>

            {/* Wheels */}
            <mesh position={[-0.3, -0.1, 0.4]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.15, 0.15, 0.1]} />
                <meshStandardMaterial color="black" />
            </mesh>
            <mesh position={[0.3, -0.1, 0.4]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.15, 0.15, 0.1]} />
                <meshStandardMaterial color="black" />
            </mesh>
            <mesh position={[-0.3, -0.1, -0.4]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.15, 0.15, 0.1]} />
                <meshStandardMaterial color="black" />
            </mesh>
            <mesh position={[0.3, -0.1, -0.4]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.15, 0.15, 0.1]} />
                <meshStandardMaterial color="black" />
            </mesh>
        </group>
    );
};

export default Car;
