import * as THREE from "three";

export const carLength = 1.5;
export const halfCarLength = carLength / 2;

export const carConfigs = {
    redCar: {
        // Starts South, moves North (+Z)
        start: new THREE.Vector3(-0.5, 0.25, -15),
        stop: new THREE.Vector3(-0.5, 0.25, -3.5 - halfCarLength), // Stop before Z=-3.5 line
        end: new THREE.Vector3(-0.5, 0.25, 25),
        rotationEulers: [0, 0, 0] as [number, number, number],
        color: "#e53e3e",
        axis: "z" as "x" | "z",
        direction: 1 as 1 | -1,
        speed: 8,
    },
    amberCar: {
        // Starts North, moves South (-Z)
        start: new THREE.Vector3(0.5, 0.25, 15),
        stop: new THREE.Vector3(0.5, 0.25, 3.5 + halfCarLength), // Stop before Z=3.5 line
        end: new THREE.Vector3(0.5, 0.25, -25),
        rotationEulers: [0, Math.PI, 0] as [number, number, number],
        color: "#f59e0b",
        axis: "z" as "x" | "z",
        direction: -1 as 1 | -1,
        speed: 6,
    },
    // E-W Road Cars (controlled by light2State)
    blueCar: {
        // Starts East, moves West (-X)
        start: new THREE.Vector3(15, 0.25, -0.5),
        stop: new THREE.Vector3(2.5 + halfCarLength, 0.25, -0.5), // Stop before X=2.5 line
        end: new THREE.Vector3(-25, 0.25, -0.5),
        rotationEulers: [0, -Math.PI / 2, 0] as [number, number, number],
        color: "#3b82f6",
        axis: "x" as "x" | "z",
        direction: -1 as 1 | -1,
        speed: 12,
    },
    violetCar: {
        // Starts West, moves East (+X)
        start: new THREE.Vector3(-15, 0.25, 0.5),
        stop: new THREE.Vector3(-2.5 - halfCarLength, 0.25, 0.5), // Stop before X=-2.5 line
        end: new THREE.Vector3(25, 0.25, 0.5),
        rotationEulers: [0, Math.PI / 2, 0] as [number, number, number],
        color: "#8b5cf6",
        axis: "x" as "x" | "z",
        direction: 1 as 1 | -1,
        speed: 9,
    },
    greenCar: {
        // Starts West, moves East (+X) on north lane
        start: new THREE.Vector3(-15, 0.25, 1.5),
        stop: new THREE.Vector3(-2.5 - halfCarLength, 0.25, 1.5), // Stop before X=-2.5 line
        end: new THREE.Vector3(25, 0.25, 1.5),
        rotationEulers: [0, Math.PI / 2, 0] as [number, number, number],
        color: "#10b981",
        axis: "x" as "x" | "z",
        direction: 1 as 1 | -1,
        speed: 7,
    },
    orangeCar: {
        // Starts East, moves West (-X) on south lane
        start: new THREE.Vector3(15, 0.25, -1.5),
        stop: new THREE.Vector3(2.5 + halfCarLength, 0.25, -1.5), // Stop before X=2.5 line
        end: new THREE.Vector3(-25, 0.25, -1.5),
        rotationEulers: [0, -Math.PI / 2, 0] as [number, number, number],
        color: "#f97316",
        axis: "x" as "x" | "z",
        direction: -1 as 1 | -1,
        speed: 10,
    },
};
