"use client";

import { useRef, useMemo, Suspense } from "react";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { Points, PointMaterial, Float, OrbitControls } from "@react-three/drei";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import { MTLLoader } from "three/examples/jsm/loaders/MTLLoader.js";
import * as THREE from "three";
import { TextureLoader } from "three";

function generateSpherePoints(count: number, radius: number) {
  const points = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const r = radius * Math.cbrt(Math.random());
    
    const x = r * Math.sin(phi) * Math.cos(theta);
    const y = r * Math.sin(phi) * Math.sin(theta);
    const z = r * Math.cos(phi);
    
    points[i * 3] = x;
    points[i * 3 + 1] = y;
    points[i * 3 + 2] = z;
  }
  return points;
}

function EarthModel() {
  const meshRef = useRef<THREE.Group>(null);
  const materials = useLoader(MTLLoader, "/earth-2k.mtl");
  const obj = useLoader(
    OBJLoader,
    "/earth-2k.obj",
    (loader) => {
      materials?.preload();
      loader.setMaterials(materials);
    }
  );

  const [diffuseMap, bumpMap, nightMap, cloudsMap, oceanMask] = useLoader(
    TextureLoader,
    [
      "/Textures/Diffuse_2K.png",
      "/Textures/Bump_2K.png",
      "/Textures/Night_lights_2K.png",
      "/Textures/Clouds_2K.png",
      "/Textures/Ocean_Mask_2K.png",
    ]
  ) as THREE.Texture[];

  [diffuseMap, nightMap, cloudsMap].forEach((texture) => {
    texture.colorSpace = THREE.SRGBColorSpace;
  });

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.2;
    }
  });

  // Clone and apply material to the loaded model
  const earth = useMemo(() => {
    const clonedObj = obj.clone();
    
    // Calculate bounding box to center the model
    const box = new THREE.Box3().setFromObject(clonedObj);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);

    // Fit model inside view by scaling relative to its largest dimension
    const scale = maxDim > 0 ? 2.8 / maxDim : 1;

    // Center BEFORE scaling so translation isn't magnified
    clonedObj.position.set(-center.x, -center.y, -center.z);
    clonedObj.scale.setScalar(scale);
    
    const applyMaterialTweaks = (material: THREE.Material) => {
      material.side = THREE.DoubleSide;
      if ("wireframe" in material) {
        (material as THREE.MeshStandardMaterial).wireframe = false;
      }
    };

    const materialTemplates = {
      Earth: new THREE.MeshPhysicalMaterial({
        map: diffuseMap,
        bumpMap,
        bumpScale: 0.015,
        roughness: 0.9,
        roughnessMap: oceanMask,
        metalness: 0.05,
        emissive: new THREE.Color("#0f172a"),
        emissiveMap: nightMap,
        emissiveIntensity: 0.6,
        clearcoat: 0.4,
        clearcoatRoughness: 0.6,
      }),
      Clouds: new THREE.MeshStandardMaterial({
        map: cloudsMap,
        transparent: true,
        opacity: 0.5,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
      }),
      Atmosphere: new THREE.MeshStandardMaterial({
        color: "#60a5fa",
        transparent: true,
        opacity: 0.15,
        emissive: "#93c5fd",
        emissiveIntensity: 0.4,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        side: THREE.BackSide,
      }),
    } as const;

    const getMaterialFor = (name?: string) => {
      const template = (name && materialTemplates[name as keyof typeof materialTemplates]) || materialTemplates.Earth;
      return template.clone();
    };

    clonedObj.traverse((child: THREE.Object3D) => {
      if (child instanceof THREE.Mesh) {
        const materialName = Array.isArray(child.material)
          ? child.material[0]?.name
          : child.material?.name;

        child.material = getMaterialFor(materialName);
        child.castShadow = true;
        child.receiveShadow = true;

        if (materialName === "Clouds") {
          child.scale.multiplyScalar(1.01);
        }

        if (materialName === "Atmosphere") {
          child.scale.multiplyScalar(1.02);
        }
      }
    });
    
    console.log("Earth model loaded successfully:", {
      vertices: clonedObj.children.length,
      boundingBox: { center, size, maxDim, scale }
    });
    
    return clonedObj;
  }, [obj, diffuseMap, bumpMap, nightMap, cloudsMap, oceanMask]);

  return (
    <group ref={meshRef}>
      <primitive object={earth} />
    </group>
  );
}

// Fallback sphere component
function FallbackSphere() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.2;
    }
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[1.2, 64, 64]} />
      <meshStandardMaterial
        color="#60a5fa"
        roughness={0.5}
        metalness={0.4}
        emissive="#3b82f6"
        emissiveIntensity={0.3}
        wireframe={false}
      />
    </mesh>
  );
}

function FloatingParticles() {
    const ref = useRef<any>(null);
    const sphere = useMemo(() => generateSpherePoints(1500, 2.5), []);

    useFrame((state, delta) => {
        if (ref.current) {
            ref.current.rotation.x -= delta / 10;
            ref.current.rotation.y -= delta / 15;
        }
    });

    return (
        <group rotation={[0, 0, Math.PI / 4]}>
            <Points ref={ref} positions={sphere} stride={3} frustumCulled={false}>
                <PointMaterial
                    transparent
                    color="#60a5fa"
                    size={0.015}
                    sizeAttenuation={true}
                    depthWrite={false}
                    opacity={0.6}
                />
            </Points>
        </group>
    );
}

function Loader() {
  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
      <FallbackSphere />
    </Float>
  );
}

export default function Scene() {
  return (
    <div className="pointer-events-none fixed right-0 top-0 bottom-0 w-full lg:w-1/2 z-0">
      <Canvas 
        camera={{ position: [0, 0, 5], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.8} />
        <directionalLight position={[5, 5, 5]} intensity={2} castShadow />
        <directionalLight position={[-5, -5, -5]} intensity={0.8} color="#60a5fa" />
        <pointLight position={[0, 0, 3]} intensity={1.2} color="#ffffff" />
        <spotLight position={[10, 10, 10]} angle={0.3} intensity={1.5} castShadow />
        
        <Suspense fallback={<Loader />}>
          <Float speed={0.8} rotationIntensity={0.05} floatIntensity={0.1}>
            <group scale={0.8}>
              <EarthModel />
            </group>
          </Float>
        </Suspense>
        
        <FloatingParticles />
        <OrbitControls 
          enableZoom={true}
          enablePan={false}
          autoRotate
          autoRotateSpeed={0.3}
          maxPolarAngle={Math.PI / 1.5}
          minPolarAngle={Math.PI / 2.5}
          minDistance={4}
          maxDistance={10}
        />
      </Canvas>
    </div>
  );
}
