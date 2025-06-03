import { useState, useEffect, Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import Road from "./Road";
import TrafficLight from "./TrafficLight";
import type { LightState } from "./TrafficLight";
import Car from "./Car";
import { carConfigs } from "../config/carConfigs";
import { connectWebSocket, disconnectWebSocket } from "../api/websocketService";
import NumberFlow from "@number-flow/react";

const WEBSOCKET_URL = "ws://localhost:8765";

function Scene() {
    const [light1State, setLight1State] = useState<LightState>("red");
    const [light2State, setLight2State] = useState<LightState>("green");
    const [connectionStatus, setConnectionStatus] =
        useState<string>("Connecting...");
    const [timer, setTimer] = useState(0);
    const [fastSpeed, setFastSpeed] = useState(false);

    const roadWidth = 4;
    const mainRoadWidth = roadWidth;
    const secondaryRoadWidth = roadWidth / 2;
    const trafficLightOffset = mainRoadWidth / 2 + 0.2;
    const secondaryTrafficLightOffset = secondaryRoadWidth / 2 + 0.2;

    useEffect(() => {
        const handleOpen = () => {
            setConnectionStatus("Connected");
        };

        const handleMessage = (data: {
            current_light: number;
            light_timer_seconds: number;
            fast_speed: boolean;
        }) => {
            // Convert current_light number to light state
            // 0 = green, 1 = yellow, 2 = red
            let light1: LightState;
            switch (data.current_light) {
                case 0:
                    light1 = "green";
                    break;
                case 1:
                    light1 = "yellow";
                    break;
                case 2:
                    light1 = "red";
                    break;
                default:
                    light1 = "red";
            }

            // When light1 is green or yellow, light2 should be red
            // When light1 is red, light2 should be green
            const light2: LightState = light1 === "red" ? "green" : "red";

            setLight1State(light1);
            setLight2State(light2);
            setTimer(data.light_timer_seconds);
            setFastSpeed(data.fast_speed);
        };

        const handleError = (error: Event) => {
            console.error("WebSocket connection error in Scene:", error);
            setConnectionStatus("Error");
        };

        const handleClose = (event: CloseEvent) => {
            setConnectionStatus(`Disconnected (Code: ${event.code})`);
            // Reconnection logic
            setTimeout(
                () =>
                    connectWebSocket(WEBSOCKET_URL, {
                        onOpen: handleOpen,
                        onMessage: handleMessage,
                        onError: handleError,
                        onClose: handleClose,
                    }),
                3000,
            );
        };

        setConnectionStatus("Connecting...");
        connectWebSocket(WEBSOCKET_URL, {
            onOpen: handleOpen,
            onMessage: handleMessage,
            onError: handleError,
            onClose: handleClose,
        });

        return () => {
            disconnectWebSocket();
        };
    }, []);

    return (
        <div className="fixed inset-0 w-screen h-screen overflow-hidden">
            <Canvas
                style={{ width: "100%", height: "100%" }}
                camera={{ position: [0, 15, 20], fov: 50 }}
                shadows
            >
                {" "}
                <Suspense fallback={null}>
                    {/* Sky gradient background */}
                    <color attach="background" args={["#87CEEB"]} />
                    <fog attach="fog" args={["#87CEEB", 50, 150]} />
                    {/* Improved lighting for warm afternoon feel */}
                    <ambientLight intensity={0.4} color="#ffeaa7" />
                    <directionalLight
                        position={[10, 10, 5]}
                        intensity={1.2}
                        color="#fff5b8"
                        castShadow
                        shadow-mapSize-width={2048}
                        shadow-mapSize-height={2048}
                        shadow-camera-far={50}
                        shadow-camera-left={-25}
                        shadow-camera-right={25}
                        shadow-camera-top={25}
                        shadow-camera-bottom={-25}
                        shadow-bias={-0.0001}
                    />
                    <directionalLight
                        position={[-10, 10, -5]}
                        intensity={0.3}
                        color="#ddd6fe"
                    />
                    {/* Extended ground plane */}
                    <mesh
                        rotation={[-Math.PI / 2, 0, 0]}
                        position={[0, 0, 0]}
                        receiveShadow
                    >
                        <planeGeometry args={[200, 200]} />
                        <meshStandardMaterial
                            color="#7a9b76"
                            roughness={0.8}
                            metalness={0.1}
                        >
                            <canvasTexture
                                attach="map"
                                args={[
                                    (() => {
                                        const canvas =
                                            document.createElement("canvas");
                                        canvas.width = 256;
                                        canvas.height = 256;
                                        const ctx = canvas.getContext("2d");
                                        if (ctx) {
                                            // Base grass color
                                            ctx.fillStyle = "#7a9b76";
                                            ctx.fillRect(0, 0, 256, 256);

                                            // Add subtle noise pattern
                                            for (let i = 0; i < 1000; i++) {
                                                const x = Math.random() * 256;
                                                const y = Math.random() * 256;
                                                const shade =
                                                    Math.random() * 0.3 - 0.15;
                                                const r = Math.floor(
                                                    122 + shade * 255,
                                                );
                                                const g = Math.floor(
                                                    155 + shade * 255,
                                                );
                                                const b = Math.floor(
                                                    118 + shade * 255,
                                                );
                                                ctx.fillStyle = `rgb(${r},${g},${b})`;
                                                ctx.fillRect(x, y, 2, 2);
                                            }
                                        }
                                        return canvas;
                                    })(),
                                ]}
                                wrapS={1000}
                                wrapT={1000}
                                repeat={[20, 20]}
                            />
                        </meshStandardMaterial>
                    </mesh>
                    {/* Intersection center box */}
                    <mesh position={[0, 0.001, 0]} receiveShadow>
                        <boxGeometry
                            args={[secondaryRoadWidth, 0.002, mainRoadWidth]}
                        />
                        <meshStandardMaterial color="#4a4a4a" roughness={0.9} />
                    </mesh>
                    {/* Road markings - Center lines */}
                    {/* N-S Road center line */}
                    <mesh position={[0, 0.1005, 0]} receiveShadow>
                        <boxGeometry args={[0.1, 0.001, 180]} />
                        <meshStandardMaterial color="#ffffff" />
                    </mesh>
                    {/* E-W Road center line */}
                    <mesh
                        position={[0, 0.1005, 0]}
                        rotation={[0, Math.PI / 2, 0]}
                        receiveShadow
                    >
                        <boxGeometry args={[0.1, 0.001, 180]} />
                        <meshStandardMaterial color="#ffffff" />
                    </mesh>
                    {/* Crosswalk stripes */}
                    {/* North crosswalk */}
                    {[...Array(8)].map((_, i) => (
                        <mesh
                            key={`north-stripe-${i}`}
                            position={[
                                -secondaryRoadWidth / 2 +
                                    (i * secondaryRoadWidth) / 7 +
                                    secondaryRoadWidth / 14,
                                0.1005,
                                trafficLightOffset + 0.5,
                            ]}
                            receiveShadow
                        >
                            <boxGeometry args={[0.2, 0.001, 0.8]} />
                            <meshStandardMaterial color="#ffffff" />
                        </mesh>
                    ))}
                    {/* South crosswalk */}
                    {[...Array(8)].map((_, i) => (
                        <mesh
                            key={`south-stripe-${i}`}
                            position={[
                                -secondaryRoadWidth / 2 +
                                    (i * secondaryRoadWidth) / 7 +
                                    secondaryRoadWidth / 14,
                                0.1005,
                                -trafficLightOffset - 0.5,
                            ]}
                            receiveShadow
                        >
                            <boxGeometry args={[0.2, 0.001, 0.8]} />
                            <meshStandardMaterial color="#ffffff" />
                        </mesh>
                    ))}
                    {/* East crosswalk */}
                    {[...Array(12)].map((_, i) => (
                        <mesh
                            key={`east-stripe-${i}`}
                            position={[
                                trafficLightOffset - 0.3,
                                0.1005,
                                -mainRoadWidth / 2 +
                                    (i * mainRoadWidth) / 11 +
                                    mainRoadWidth / 22,
                            ]}
                            receiveShadow
                        >
                            <boxGeometry args={[0.8, 0.001, 0.2]} />
                            <meshStandardMaterial color="#ffffff" />
                        </mesh>
                    ))}
                    {/* West crosswalk */}
                    {[...Array(12)].map((_, i) => (
                        <mesh
                            key={`west-stripe-${i}`}
                            position={[
                                -trafficLightOffset + 0.3,
                                0.1005,
                                -mainRoadWidth / 2 +
                                    (i * mainRoadWidth) / 11 +
                                    mainRoadWidth / 22,
                            ]}
                            receiveShadow
                        >
                            <boxGeometry args={[0.8, 0.001, 0.2]} />
                            <meshStandardMaterial color="#ffffff" />
                        </mesh>
                    ))}
                    {/* Simple curbs */}
                    {/* N-S Road curbs */}
                    <mesh
                        position={[secondaryRoadWidth / 2, 0.05, 0]}
                        receiveShadow
                    >
                        <boxGeometry args={[0.1, 0.1, 180]} />
                        <meshStandardMaterial color="#cccccc" />
                    </mesh>
                    <mesh
                        position={[-secondaryRoadWidth / 2, 0.05, 0]}
                        receiveShadow
                    >
                        <boxGeometry args={[0.1, 0.1, 180]} />
                        <meshStandardMaterial color="#cccccc" />
                    </mesh>
                    {/* E-W Road curbs */}
                    <mesh position={[0, 0.05, mainRoadWidth / 2]} receiveShadow>
                        <boxGeometry args={[180, 0.1, 0.1]} />
                        <meshStandardMaterial color="#cccccc" />
                    </mesh>
                    <mesh
                        position={[0, 0.05, -mainRoadWidth / 2]}
                        receiveShadow
                    >
                        <boxGeometry args={[180, 0.1, 0.1]} />
                        <meshStandardMaterial color="#cccccc" />
                    </mesh>
                    {/* N-S Road (Secondary) */}
                    <Road
                        position={[0, 0, 0]}
                        rotation={[0, 0, 0]}
                        size={[secondaryRoadWidth, 0.1, 180]}
                    />
                    {/* E-W Road (Main) */}
                    <Road
                        position={[0, 0, 0]}
                        rotation={[0, Math.PI / 2, 0]}
                        size={[mainRoadWidth, 0.1, 180]}
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
                        speed={carConfigs.redCar.speed}
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
                        speed={carConfigs.amberCar.speed}
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
                        speed={carConfigs.blueCar.speed}
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
                        speed={carConfigs.violetCar.speed}
                        movementAxis={carConfigs.violetCar.axis}
                        movementDirection={carConfigs.violetCar.direction}
                    />
                    <Car
                        startPositionVec={carConfigs.greenCar.start}
                        stopPositionVec={carConfigs.greenCar.stop}
                        endPositionVec={carConfigs.greenCar.end}
                        rotationEulers={carConfigs.greenCar.rotationEulers}
                        color={carConfigs.greenCar.color}
                        associatedLightState={light2State}
                        speed={carConfigs.greenCar.speed}
                        movementAxis={carConfigs.greenCar.axis}
                        movementDirection={carConfigs.greenCar.direction}
                    />
                    <Car
                        startPositionVec={carConfigs.orangeCar.start}
                        stopPositionVec={carConfigs.orangeCar.stop}
                        endPositionVec={carConfigs.orangeCar.end}
                        rotationEulers={carConfigs.orangeCar.rotationEulers}
                        color={carConfigs.orangeCar.color}
                        associatedLightState={light2State}
                        speed={carConfigs.orangeCar.speed}
                        movementAxis={carConfigs.orangeCar.axis}
                        movementDirection={carConfigs.orangeCar.direction}
                    />
                    <OrbitControls />
                </Suspense>
            </Canvas>

            <div className="bg-opacity-75 absolute top-4 left-4 rounded-md bg-gray-800 p-4 text-sm text-white shadow-lg">
                <h2 className="mb-2 text-lg font-semibold">
                    Intersection Status
                </h2>
                <p>
                    WebSocket:{" "}
                    <span
                        className={
                            connectionStatus === "Connected"
                                ? "text-green-400"
                                : "text-yellow-400"
                        }
                    >
                        {connectionStatus}
                    </span>
                </p>
                <p>
                    N/S Lights (Light 1):{" "}
                    <span
                        className={`font-bold ${
                            light1State === "red"
                                ? "text-red-400"
                                : light1State === "yellow"
                                  ? "text-yellow-400"
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

            <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 transform gap-4">
                {/* <div className="bg-opacity-75 flex flex-col items-center justify-center rounded-md bg-gray-800 px-8 py-4 text-white shadow-lg">
                    <div className="text-center">
                        <h3 className="mb-4 text-2xl font-semibold">
                            Speed Radar
                        </h3>
                        <div className="text-4xl font-bold">
                            <span
                                className={
                                    fastSpeed
                                        ? "text-red-400"
                                        : "text-green-400"
                                }
                            >
                                {fastSpeed ? "Too fast" : "All good"}
                            </span>
                        </div>
                    </div>
                </div> */}

                <div className="bg-opacity-75 w-85 rounded-md bg-gray-800 px-8 text-white shadow-lg">
                    <div className="text-center">
                        <div className="flex items-center justify-center text-8xl font-bold">
                            <NumberFlow value={timer} />
                            <span className="ml-2 translate-y-3 text-6xl">
                                s
                            </span>
                            <span
                                className={`ml-8 text-4xl font-semibold ${
                                    light1State === "red"
                                        ? "text-red-400"
                                        : light1State === "yellow"
                                          ? "text-yellow-400"
                                          : "text-green-400"
                                }`}
                            >
                                {light1State.toUpperCase()}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Scene;
