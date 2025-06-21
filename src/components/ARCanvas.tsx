"use client";

import { Canvas } from "@react-three/fiber";
import { XR, createXRStore } from "@react-three/xr";
import { Suspense, useEffect, useState } from "react";
import GLBModel from "./GLBModel";

type Props = {
  glbUrl: string | null;
};

export default function ARCanvas({ glbUrl }: Props) {
  const [store] = useState(() =>
    createXRStore({
      customSessionInit: {
        requiredFeatures: ["local", "hit-test", "dom-overlay"],
        optionalFeatures: ["anchors"],
        domOverlay: { root: document.body },
      },
    })
  );

  const [isARSupported, setIsARSupported] = useState(false);
  const [isVRSupported, setIsVRSupported] = useState(false);

  // チェック: ブラウザがAR/VRに対応しているか
  useEffect(() => {
    if (navigator.xr) {
      navigator.xr.isSessionSupported("immersive-ar").then(setIsARSupported);
      navigator.xr.isSessionSupported("immersive-vr").then(setIsVRSupported);
    }
  }, []);

  const handleEnterAR = async () => {
    if (store) await store.enterAR();
  };

  const handleEnterVR = async () => {
    if (store) await store.enterVR(); // XR store 経由で enterVR を呼べる
  };

  return (
    <div className="w-screen h-screen relative">
      <div className="absolute top-4 left-4 z-10 flex gap-4">
        {isARSupported && (
          <button
            onClick={handleEnterAR}
            className="p-3 bg-white text-black rounded"
          >
            Enter AR
          </button>
        )}
        {isVRSupported && (
          <button
            onClick={handleEnterVR}
            className="p-3 bg-white text-black rounded"
          >
            Enter VR
          </button>
        )}
        {!isARSupported && !isVRSupported && (
          <span className="p-3 bg-red-200 text-black rounded">
            WebXR not supported
          </span>
        )}
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

          {/* <mesh
            pointerEventsType={{ deny: "grab" }}
            position={[0, 0, -1]}
          >
            <boxGeometry />
            <meshBasicMaterial color={"red"} />
          </mesh> */}
          <Suspense>{glbUrl && <GLBModel url={glbUrl} />}</Suspense>
        </XR>
      </Canvas>
    </div>
  );
}