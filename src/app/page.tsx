"use client";

import { Canvas } from "@react-three/fiber";
import { XR, createXRStore } from "@react-three/xr";
import { useState } from "react";

const store = createXRStore({
  customSessionInit: {
    requiredFeatures: ["local", "anchors", "dom-overlay", "hit-test"],
  },
});

export default function Page() {
  const [red, setRed] = useState(false);

  const handleEnterAR = async () => {
    store.enterAR();
  };

  return (
    <div className="w-screen h-screen bg-black relative">
      <div className="absolute top-4 left-4 z-10 flex gap-4">
        <button
          onClick={handleEnterAR}
          className="p-3 bg-white text-black rounded"
        >
          Enter AR
        </button>
      </div>

      <Canvas>
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
