import * as THREE from "three";

interface RoadProps {
    position?: THREE.Vector3 | [number, number, number];
    rotation?: THREE.Euler | [number, number, number];
    size?: [number, number, number];
}

const Road: React.FC<RoadProps> = ({
    position = [0, 0, 0],
    rotation = [0, 0, 0],
    size = [10, 0.1, 2],
}) => {
    return (
        <group position={position} rotation={rotation}>
            <mesh>
                <boxGeometry args={size} />
                <meshStandardMaterial color="#555555" />
            </mesh>
            <mesh position={[0, 0.051, 0]}>
                <boxGeometry args={[0.05, 0.00001, size[2]]} />
                <meshStandardMaterial color="white" />
            </mesh>
        </group>
    );
};

export default Road;
