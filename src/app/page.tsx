"use client";

import { Canvas } from "@react-three/fiber";
import { XR, createXRStore } from "@react-three/xr";
import { useState } from "react";

const store = createXRStore();

export default function Page() {
  const [enabled, setEnabled] = useState(false);
  const [red, setRed] = useState(false);

  // iOS向けVariant SDK対応（必要なら）
  // useEffect(() => {
  //   const onLaunch = (e: Event) => {
  //     const customEvent = e as CustomEvent<{
  //       launchRequired: boolean;
  //       launchUrl: string;
  //     }>;

  //     if (customEvent.detail.launchRequired) {
  //       window.location.href = customEvent.detail.launchUrl;
  //     }
  //   };

  //   window.addEventListener("vlaunch-initialized", onLaunch);
  //   return () => {
  //     window.removeEventListener("vlaunch-initialized", onLaunch);
  //   };
  // }, []);

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
