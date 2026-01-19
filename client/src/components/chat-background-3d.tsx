import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useRef, useMemo } from "react";
import * as THREE from "three";

function Particles({ count = 300 }) {
    const mesh = useRef<THREE.InstancedMesh>(null);
    const { viewport } = useThree();
    const dummy = useMemo(() => new THREE.Object3D(), []);
    const particles = useMemo(() => {
        return new Array(count).fill(0).map(() => {
            const angle = Math.random() * Math.PI * 2;
            const speed = 0.002 + Math.random() * 0.005;

            return {
                x: 0,
                y: 0,
                z: 0,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                vz: (Math.random() - 0.5) * 0.05,
                scale: 0.5 + Math.random() * 1.5,
                speed
            }
        });
    }, [count]);

    useFrame((state) => {
        const instancedMesh = mesh.current;
        if (!instancedMesh) return;
        particles.forEach((particle, i) => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.z += particle.vz;
            const limitX = viewport.width;
            const limitY = viewport.height;
            const dist = Math.sqrt(particle.x * particle.x + particle.y * particle.y);
            if (dist > Math.max(limitX, limitY) * 0.8) {
                particle.x = 0;
                particle.y = 0;
                particle.z = 0;
                const angle = Math.random() * Math.PI * 2;
                particle.vx = Math.cos(angle) * particle.speed;
                particle.vy = Math.sin(angle) * particle.speed;
            }

            dummy.position.set(particle.x, particle.y, particle.z);
            dummy.scale.setScalar(particle.scale * 0.2);
            dummy.updateMatrix();
            instancedMesh.setMatrixAt(i, dummy.matrix);
        });

        instancedMesh.instanceMatrix.needsUpdate = true;
    });

    return (
        <instancedMesh ref={mesh} args={[undefined, undefined, count]}>
            <circleGeometry args={[0.2, 8]} />
            <meshBasicMaterial
                color="#F06292"
                transparent
                opacity={0.95}
                blending={THREE.AdditiveBlending}
                depthWrite={false}
            />
        </instancedMesh>
    );
}

export function ChatBackground3D() {
    return (
        <div className="fixed inset-0 z-0 pointer-events-none">
            <Canvas camera={{ position: [0, 0, 8], fov: 45 }}>
                <ambientLight intensity={0.5} />
                <Particles count={300} />
            </Canvas>
        </div>
    );
}
