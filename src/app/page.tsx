"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { XR, createXRStore, XRStore } from "@react-three/xr";
import { useEffect, useState, useRef } from "react";
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

      console.log("Mesh position:", newPosition);
      console.log("Camera position:", camera.position);
    }
  });
  return null;
}

export default function Page() {
  const [store, setStore] = useState<XRStore | null>(null);
  const [red, setRed] = useState(false);
  const meshRef = useRef<THREE.Mesh>(null);

  useEffect(() => {
    if (typeof document !== "undefined") {
      const newStore = createXRStore({
        customSessionInit: {
          requiredFeatures: ["local"],
          optionalFeatures: ["hit-test", "anchors", "dom-overlay"],
        },
      });
      setStore(newStore);
    }
  }, []);

  const handleEnterAR = async () => {
    if (store) {
      console.log("Trying to enter AR");
      await store.enterAR();
      console.log("Entered AR session");
    }
  };

  return (
    <div className="w-screen h-screen relative">
      <div className="absolute top-4 left-4 z-10 flex gap-4">
        <button
          onClick={handleEnterAR}
          className="p-3 bg-white text-black rounded"
          disabled={!store}
        >
          Enter AR
        </button>
      </div>

      <Canvas
        id="ar-canvas"
        onCreated={({ gl }) => {
          gl.xr.setReferenceSpaceType("local");
        }}
      >
        {store && (
          <XR store={store}>
            <ambientLight />
            <directionalLight position={[1, 2, 3]} />
            <DebugFrame meshRef={meshRef} />
            <mesh
              ref={meshRef}
              pointerEventsType={{ deny: "grab" }}
              onClick={() => setRed(!red)}
              position={[0, 1, -1]}
            >
              <boxGeometry />
              <meshBasicMaterial color={red ? "red" : "blue"} />
            </mesh>
          </XR>
        )}
      </Canvas>
    </div>
  );
}
