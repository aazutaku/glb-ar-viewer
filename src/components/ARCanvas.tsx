"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { XR, createXRStore } from "@react-three/xr";
import { useRef, useState } from "react";
import * as THREE from "three";

function DebugFrame({
  meshRef,
}: {
  meshRef: React.RefObject<THREE.Mesh | null>;
}) {
  const { camera } = useThree();
  useFrame(() => {
    if (meshRef.current) {
      const distance = 1;
      const direction = new THREE.Vector3(0, 1, -distance);
      direction.applyQuaternion(camera.quaternion);
      const newPosition = camera.position.clone().add(direction);
      meshRef.current.position.copy(newPosition);
    }
  });
  return null;
}

export default function ARCanvas() {
  const [red, setRed] = useState(false);
  const meshRef = useRef<THREE.Mesh>(null);
  const [store] = useState(() =>
    createXRStore({
      customSessionInit: {
        requiredFeatures: ["local", "hit-test", "dom-overlay"],
        optionalFeatures: ["anchors"],
        domOverlay: { root: document.body },
      },
    })
  );

  const handleEnterAR = async () => {
    if (store) {
      await store.enterAR();
    }
  };

  return (
    <div className="w-screen h-screen relative">
      <div className="absolute top-4 left-4 z-10 flex gap-4">
        <button
          onClick={handleEnterAR}
          className="p-3 bg-white text-black rounded"
        >
          Enter AR
        </button>
      </div>

      <Canvas
        style={{ backgroundColor: "transparent" }}
        onCreated={({ gl }) => {
          gl.xr.enabled = true;
          gl.xr.setReferenceSpaceType("local");
        }}
      >
        <XR store={store}>
          <ambientLight />
          <directionalLight position={[1, 2, 3]} />
          <DebugFrame meshRef={meshRef} />
          <mesh
            pointerEventsType={{ deny: "grab" }}
            onClick={() => setRed(!red)}
            position={[0, 1, -1]}
          >
            <boxGeometry />
            <meshBasicMaterial color={red ? "red" : "blue"} />
          </mesh>
        </XR>
      </Canvas>
    </div>
  );
}
