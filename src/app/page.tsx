"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { XR, createXRStore, XRStore } from "@react-three/xr";
import { useEffect, useState, useRef } from "react";
import * as THREE from "three";

export default function Page() {
  const [store, setStore] = useState<XRStore | null>(null);
  const [red, setRed] = useState(false);
  const meshRef = useRef<THREE.Mesh | null>(null);

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

  // 毎フレーム mesh をカメラの前に移動させる
  function MoveMeshInFront() {
    useFrame(({ camera }) => {
      if (meshRef.current) {
        const distance = 0.5; // 50cm前
        const direction = new THREE.Vector3(0, 0, -distance);
        direction.applyQuaternion(camera.quaternion);
        const newPosition = camera.position.clone().add(direction);
        meshRef.current.position.copy(newPosition);

        // デバッグ出力
        console.log("Mesh position:", newPosition);
        console.log("Camera position:", camera.position);
      }
    });
    return null;
  }

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
            <MoveMeshInFront />
            <mesh
              ref={meshRef}
              pointerEventsType={{ deny: "grab" }}
              onClick={() => setRed(!red)}
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
