"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { XR, createXRStore, XRStore } from "@react-three/xr";
import { useEffect, useState, useRef } from "react";
import * as THREE from "three";

function DebugFrame({
  meshRef,
}: {
  meshRef: React.RefObject<THREE.Mesh | null>;
}) {
  useFrame(({ camera }) => {
    if (meshRef.current) {
      const meshPos = meshRef.current.position;
      console.log("Mesh position:", meshPos.x, meshPos.y, meshPos.z);
    }
    console.log(
      "Camera position:",
      camera.position.x,
      camera.position.y,
      camera.position.z
    );
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

      {store && (
        <Canvas
          onCreated={({ gl, scene, camera }) => {
            gl.xr.setReferenceSpaceType("local");

            gl.setAnimationLoop(() => {
              gl.render(scene, camera);
            });
          }}
        >
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
        </Canvas>
      )}
    </div>
  );
}
