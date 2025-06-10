"use client";

import { Canvas } from "@react-three/fiber";
import { XR, createXRStore } from "@react-three/xr";
import { Suspense, useEffect, useState } from "react";
import { useGLTF } from "@react-three/drei";

function Model() {
  const { scene } = useGLTF("/models/ninja.glb");
  scene.scale.set(20, 20, 20);
  scene.position.set(0, 0, -10);
  return <primitive object={scene} />;
}

const store = createXRStore();

export default function Page() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const onLaunch = (e: Event) => {
      const customEvent = e as CustomEvent<{
        launchRequired: boolean;
        launchUrl: string;
      }>;

      if (customEvent.detail.launchRequired) {
        window.location.href = customEvent.detail.launchUrl; // iOS対応用リダイレクト
      }
    };

    window.addEventListener("vlaunch-initialized", onLaunch);

    return () => {
      window.removeEventListener("vlaunch-initialized", onLaunch);
    };
  }, []);

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
