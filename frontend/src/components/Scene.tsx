import { useState, useEffect, Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import Road from "./Road";
import TrafficLight from "./TrafficLight";
import type { LightState } from "./TrafficLight";
import Car from "./Car";

const carLength = 1.5;
const halfCarLength = carLength / 2;

const carConfigs = {
    // N-S Road Cars (controlled by light1State)
    redCar: {
        // Starts South, moves North (+Z)
        start: new THREE.Vector3(-0.5, 0.25, -15), 
        stop: new THREE.Vector3(-0.5, 0.25, -2 - halfCarLength), // Stop before Z=-2 line
        end: new THREE.Vector3(-0.5, 0.25, 15),
        rotationEulers: [0, 0, 0] as [number, number, number],
        color: "#e53e3e",
        axis: "z" as "x" | "z",
        direction: 1 as 1 | -1,
    },
    amberCar: {
        // Starts North, moves South (-Z)
        start: new THREE.Vector3(0.5, 0.25, 15),
        stop: new THREE.Vector3(0.5, 0.25, 2 + halfCarLength), // Stop before Z=2 line
        end: new THREE.Vector3(0.5, 0.25, -15),
        rotationEulers: [0, Math.PI, 0] as [number, number, number],
        color: "#f59e0b",
        axis: "z" as "x" | "z",
        direction: -1 as 1 | -1,
    },
    // E-W Road Cars (controlled by light2State)
    blueCar: {
        // Starts East, moves West (-X)
        start: new THREE.Vector3(15, 0.25, -0.5),
        stop: new THREE.Vector3(1 + halfCarLength, 0.25, -0.5), // Stop before X=1 line
        end: new THREE.Vector3(-15, 0.25, -0.5),
        rotationEulers: [0, -Math.PI / 2, 0] as [number, number, number],
        color: "#3b82f6",
        axis: "x" as "x" | "z",
        direction: -1 as 1 | -1,
    },
    violetCar: {
        // Starts West, moves East (+X)
        start: new THREE.Vector3(-15, 0.25, 0.5),
        stop: new THREE.Vector3(-1 - halfCarLength, 0.25, 0.5), // Stop before X=-1 line
        end: new THREE.Vector3(15, 0.25, 0.5),
        rotationEulers: [0, Math.PI / 2, 0] as [number, number, number],
        color: "#8b5cf6",
        axis: "x" as "x" | "z",
        direction: 1 as 1 | -1,
    },
};

function Scene() {
    const [light1State, setLight1State] = useState<LightState>("red");
    const [light2State, setLight2State] = useState<LightState>("green");

    const roadWidth = 4;
    const mainRoadWidth = roadWidth;
    const secondaryRoadWidth = roadWidth / 2;

    const trafficLightOffset = mainRoadWidth / 2 + 0.2;
    const secondaryTrafficLightOffset = secondaryRoadWidth / 2 + 0.2;

    useEffect(() => {
        const interval = setInterval(() => {
            setLight1State((prev) => (prev === "red" ? "green" : "red"));
            setLight2State((prev) => (prev === "red" ? "green" : "red"));
        }, 5000); // Increased interval for easier observation
        return () => clearInterval(interval);
    }, []);

    const carSpeed = 10;

    return (
        <>
            <Canvas camera={{ position: [0, 15, 20], fov: 50 }} shadows>
                {" "}
                <Suspense fallback={null}>
                    <ambientLight intensity={0.6} />
                    <directionalLight
                        position={[10, 10, 5]}
                        intensity={1.5}
                        castShadow
                        shadow-mapSize-width={1024}
                        shadow-mapSize-height={1024}
                    />
                    <directionalLight
                        position={[-10, 10, -5]}
                        intensity={0.4}
                    />
                    <mesh
                        rotation={[-Math.PI / 2, 0, 0]}
                        position={[0, -0.05, 0]}
                        receiveShadow
                    >
                        <planeGeometry args={[50, 50]} />
                        <meshStandardMaterial color="#689f38" />
                    </mesh>
                    <mesh>
                        <boxGeometry args={[secondaryRoadWidth, 0.103, mainRoadWidth]} />
                        <meshStandardMaterial color="#555555" />
                    </mesh>
                    {/* N-S Road (Secondary) */}
                    <Road
                        position={[0, 0, 0]}
                        rotation={[0, 0, 0]}
                        size={[secondaryRoadWidth, 0.1, 35]}
                    />
                    {/* E-W Road (Main) */}
                    <Road
                        position={[0, 0, 0]}
                        rotation={[0, Math.PI / 2, 0]}
                        size={[mainRoadWidth, 0.1, 35]}
                    />{" "}
                    <TrafficLight
                        position={[
                            -secondaryTrafficLightOffset,
                            0,
                            -trafficLightOffset,
                        ]}
                        rotation={[0, Math.PI, 0]}
                        lightState={light1State}
                    />
                    {/* NE corner for N-S road (facing South) */}
                    <TrafficLight
                        position={[
                            secondaryTrafficLightOffset,
                            0,
                            trafficLightOffset,
                        ]}
                        rotation={[0, 0, 0]}
                        lightState={light1State}
                    />
                    {/* NW corner for E-W road (facing East) */}
                    <TrafficLight
                        position={[
                            -secondaryTrafficLightOffset,
                            0,
                            trafficLightOffset,
                        ]}
                        rotation={[0, -Math.PI / 2, 0]}
                        lightState={light2State}
                    />
                    {/* SE corner for E-W road (facing West) */}
                    <TrafficLight
                        position={[
                            secondaryTrafficLightOffset,
                            0,
                            -trafficLightOffset,
                        ]}
                        rotation={[0, Math.PI / 2, 0]}
                        lightState={light2State}
                    />
                    {/* Cars */}
                    <Car
                        startPositionVec={carConfigs.redCar.start}
                        stopPositionVec={carConfigs.redCar.stop}
                        endPositionVec={carConfigs.redCar.end}
                        rotationEulers={carConfigs.redCar.rotationEulers}
                        color={carConfigs.redCar.color}
                        associatedLightState={light1State}
                        speed={carSpeed}
                        movementAxis={carConfigs.redCar.axis}
                        movementDirection={carConfigs.redCar.direction}
                    />
                    <Car
                        startPositionVec={carConfigs.amberCar.start}
                        stopPositionVec={carConfigs.amberCar.stop}
                        endPositionVec={carConfigs.amberCar.end}
                        rotationEulers={carConfigs.amberCar.rotationEulers}
                        color={carConfigs.amberCar.color}
                        associatedLightState={light1State}
                        speed={carSpeed}
                        movementAxis={carConfigs.amberCar.axis}
                        movementDirection={carConfigs.amberCar.direction}
                    />
                    <Car
                        startPositionVec={carConfigs.blueCar.start}
                        stopPositionVec={carConfigs.blueCar.stop}
                        endPositionVec={carConfigs.blueCar.end}
                        rotationEulers={carConfigs.blueCar.rotationEulers}
                        color={carConfigs.blueCar.color}
                        associatedLightState={light2State}
                        speed={carSpeed}
                        movementAxis={carConfigs.blueCar.axis}
                        movementDirection={carConfigs.blueCar.direction}
                    />
                    <Car
                        startPositionVec={carConfigs.violetCar.start}
                        stopPositionVec={carConfigs.violetCar.stop}
                        endPositionVec={carConfigs.violetCar.end}
                        rotationEulers={carConfigs.violetCar.rotationEulers}
                        color={carConfigs.violetCar.color}
                        associatedLightState={light2State}
                        speed={carSpeed}
                        movementAxis={carConfigs.violetCar.axis}
                        movementDirection={carConfigs.violetCar.direction}
                    />
                    <OrbitControls />
                </Suspense>
            </Canvas>

            <div className="bg-opacity-75 absolute top-4 left-4 rounded-md bg-gray-800 p-4 text-sm text-white shadow-lg">
                <h2 className="mb-2 text-lg font-semibold">
                    Intersection Status
                </h2>
                <p>
                    N/S Lights (Light 1):{" "}
                    <span
                        className={`font-bold ${
                            light1State === "red"
                                ? "text-red-400"
                                : "text-green-400"
                        }`}
                    >
                        {light1State.toUpperCase()}
                    </span>
                </p>
                <p>
                    E/W Lights (Light 2):{" "}
                    <span
                        className={`font-bold ${
                            light2State === "red"
                                ? "text-red-400"
                                : "text-green-400"
                        }`}
                    >
                        {light2State.toUpperCase()}
                    </span>
                </p>
            </div>
        </>
    );
}

export default Scene;
