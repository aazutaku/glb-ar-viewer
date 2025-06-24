"use client";

import { Canvas } from "@react-three/fiber";
import { XR, createXRStore } from "@react-three/xr";
import { Suspense, useEffect, useRef, useState } from "react";
import GLBModel from "./GLBModel";

type Props = {
  glbUrl: string | null;
};

export default function ARCanvas({ glbUrl }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  const [store] = useState(() =>
    createXRStore({
      customSessionInit: {
        requiredFeatures: ["local", "hit-test", "dom-overlay"],
        optionalFeatures: ["anchors"],
        domOverlay: {
          root: containerRef.current
            ? containerRef.current
            : document.createElement("div"),
        },
      },
    })
  );

  const [isARSupported, setIsARSupported] = useState(false);

  // チェック: ブラウザがARに対応しているか
  useEffect(() => {
    if (navigator.xr) {
      navigator.xr.isSessionSupported("immersive-ar").then(setIsARSupported);
    }
  }, []);

  const handleEnterAR = async () => {
    if (store) await store.enterAR();
  };

  return (
    <div ref={containerRef} className="w-screen h-screen relative">
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex gap-4">
        {isARSupported && (
          <button
            onClick={handleEnterAR}
            className="p-3 bg-white text-black rounded"
          >
            Enter AR
          </button>
        )}
        {!isARSupported && (
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
          <Suspense>{glbUrl && <GLBModel url={glbUrl} />}</Suspense>
        </XR>
      </Canvas>
    </div>
  );
}
