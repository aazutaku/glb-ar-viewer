"use client";

import { Canvas } from "@react-three/fiber";
import { XR, createXRStore, XRStore } from "@react-three/xr";
import { useEffect, useState } from "react";

export default function Page() {
  const [store, setStore] = useState<XRStore | null>(null);
  const [red, setRed] = useState(false);

  useEffect(() => {
    if (typeof document !== "undefined") {
      const newStore = createXRStore({
        customSessionInit: {
          requiredFeatures: ["local"],
          optionalFeatures: ["hit-test", "anchors", "dom-overlay"],
          domOverlay: { root: document.body }, // ← ここはクライアントのみ
        },
      });
      setStore(newStore);
    }
  }, []);

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
          disabled={!store}
        >
          Enter AR
        </button>
      </div>

      {store && (
        <Canvas
          onCreated={({ gl }) => {
            gl.xr.setReferenceSpaceType("local");
          }}
        >
          <XR store={store}>
            <ambientLight />
            <directionalLight position={[1, 2, 3]} />
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
      )}
    </div>
  );
}
