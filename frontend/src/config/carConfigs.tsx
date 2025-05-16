import * as THREE from "three";

export const carLength = 1.5;
export const halfCarLength = carLength / 2;

export const carConfigs = {
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