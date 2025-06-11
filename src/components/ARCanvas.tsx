"use client";

import { Canvas } from "@react-three/fiber";
import { XR, createXRStore } from "@react-three/xr";
import { useState } from "react";

export default function ARCanvas() {
  const [red, setRed] = useState(false);
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
          // gl.xr.enabled = true;
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
    </div>
  );
}
