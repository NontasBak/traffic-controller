import { useState, useEffect, Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import Road from "./Road";
import TrafficLight from "./TrafficLight";
import type { LightState } from "./TrafficLight";
import Car from "./Car";

function Scene() {
    const [light1State, setLight1State] = useState<LightState>("red");
    const [light2State, setLight2State] = useState<LightState>("green");

    const roadWidth = 4; // Main road width, secondary road width is half of this
    const offset = roadWidth / 2 + 0.2;

    // Simulate light changes for now
    useEffect(() => {
        const interval = setInterval(() => {
            setLight1State((prev) => (prev === "red" ? "green" : "red"));
            setLight2State((prev) => (prev === "red" ? "green" : "red"));
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    return (
        <>
            {/* Canvas takes full screen from parent div (styled in App.tsx) */}
            <Canvas camera={{ position: [0, 10, 15], fov: 50 }} shadows>
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
                    {/* Ground Plane */}
                    <mesh
                        rotation={[-Math.PI / 2, 0, 0]}
                        position={[0, -0.05, 0]}
                        receiveShadow
                    >
                        <planeGeometry args={[50, 50]} />
                        <meshStandardMaterial color="#689f38" />{" "}
                    </mesh>
                    {/* Roads */}
                    <Road
                        position={[0, 0, 0]}
                        rotation={[0, 0, 0]}
                        size={[roadWidth / 2, 0.1, 20]}
                    />{" "}
                    {/* Main road vvvv */}
                    <Road
                        position={[0, 0, 0]}
                        rotation={[0, Math.PI / 2, 0]}
                        size={[roadWidth, 0.1, 20]}
                    />{" "}
                    <TrafficLight
                        position={[-offset + 1, 0, -offset]}
                        rotation={[0, Math.PI, 0]}
                        lightState={light1State}
                    />
                    <TrafficLight
                        position={[offset - 1, 0, offset]}
                        rotation={[0, 0, 0]}
                        lightState={light1State}
                    />
                    <TrafficLight
                        position={[-offset + 1, 0, offset]}
                        rotation={[0, -Math.PI / 2, 0]}
                        lightState={light2State}
                    />
                    <TrafficLight
                        position={[offset - 1, 0, -offset]}
                        rotation={[0, Math.PI / 2, 0]}
                        lightState={light2State}
                    />
                    <Car initialPosition={[-0.5, 0.25, -7]} color="#e53e3e" />{" "}
                    {/* Red car ^^^ */}
                    <Car
                        initialPosition={[7, 0.25, -0.5]}
                        rotation={[0, Math.PI / 2, 0]}
                        color="#3b82f6"
                    />{" "}
                    {/* Blue car ^^^ */}
                    <Car
                        initialPosition={[0.5, 0.25, 6]}
                        rotation={[0, 0, 0]}
                        color="#f59e0b"
                    />{" "}
                    {/* Amber car ^^^ */}
                    <Car
                        initialPosition={[-6, 0.25, 0.5]}
                        rotation={[0, Math.PI / 2, 0]}
                        color="#8b5cf6"
                    />{" "}
                    {/* Violet car ^^^ */}
                    <OrbitControls />
                    {/* <Stats className="!absolute !top-0 !left-0" /> */}
                </Suspense>
            </Canvas>

            {/* Tailwind Styled Overlay */}
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
