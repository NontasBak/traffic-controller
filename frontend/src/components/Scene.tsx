import { useState, useEffect, Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import Road from "./Road";
import TrafficLight from "./TrafficLight";
import type { LightState } from "./TrafficLight";
import Car from "./Car";
import { carConfigs } from "../config/carConfigs";
import { connectWebSocket, disconnectWebSocket } from "../api/websocketService";

const WEBSOCKET_URL = "ws://localhost:8765";

function Scene() {
    const [light1State, setLight1State] = useState<LightState>("red");
    const [light2State, setLight2State] = useState<LightState>("green");
    const [connectionStatus, setConnectionStatus] =
        useState<string>("Connecting...");

    const roadWidth = 4;
    const mainRoadWidth = roadWidth;
    const secondaryRoadWidth = roadWidth / 2;
    const trafficLightOffset = mainRoadWidth / 2 + 0.2;
    const secondaryTrafficLightOffset = secondaryRoadWidth / 2 + 0.2;
    const carSpeed = 10;

    useEffect(() => {
        const handleOpen = () => {
            setConnectionStatus("Connected");
        };

        const handleMessage = (data: {
            light1State: string;
            light2State: string;
        }) => {
            // console.log("Data received in Scene component:", data);
            if (
                data.light1State &&
                (data.light1State === "red" || data.light1State === "green")
            ) {
                setLight1State(data.light1State);
            }
            if (
                data.light2State &&
                (data.light2State === "red" || data.light2State === "green")
            ) {
                setLight2State(data.light2State);
            }
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
                        <boxGeometry
                            args={[secondaryRoadWidth, 0.105, mainRoadWidth]}
                        />
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
