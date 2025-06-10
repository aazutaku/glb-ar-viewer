"use client";

import { Canvas } from "@react-three/fiber";
import { XR, createXRStore } from "@react-three/xr";
import { Suspense, useState } from "react";
import { useGLTF } from "@react-three/drei";

function Model() {
  const { scene } = useGLTF("/model/ninja.glb");
  scene.scale.set(0.5, 0.5, 0.5);
  scene.position.set(0, 0, -1);
  return <primitive object={scene} />;
}

const store = createXRStore();

export default function Page() {
  const [enabled, setEnabled] = useState(false);

  return (
    <div className="w-screen h-screen bg-black relative">
      {!enabled && (
        <button
          onClick={() => {
            setEnabled(true);
            store.enterAR();
          }}
          className="absolute z-10 p-3 m-4 bg-white text-black rounded"
        >
          Enter AR
        </button>
      )}

      <Canvas>
        <XR store={store}>
          <ambientLight />
          <Suspense fallback={null}>
            <Model />
          </Suspense>
        </XR>
      </Canvas>
    </div>
  );
}
