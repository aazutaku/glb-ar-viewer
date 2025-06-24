"use client";

import { Canvas } from "@react-three/fiber";
import { XR, createXRStore } from "@react-three/xr";
import { Suspense, useEffect, useRef, useState } from "react";
import GLBModel from "./GLBModel";
import NextImage from "next/image";

type Props = {
  glbUrl: string | null;
};

export default function ARCanvas({ glbUrl }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  const [isIOS, setIsIOS] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const launcherURL =
    "https://launchar.app/launch/glb-ar-viewer?url=https%3A%2F%2Fglb-ar-viewer.vercel.app";
  const launcherQrPath = "/img/launchar-app/glb-ar-viewer-launch-code.png";

  useEffect(() => {
    const ua = window.navigator.userAgent;
    if (/iPad|iPhone|iPod/.test(ua)) setIsIOS(true);
  }, []);

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
        {isIOS && (
          <button
            onClick={() => setShowModal(true)}
            className="p-3 bg-blue-500 text-white rounded"
          >
            iOSで見る方法
          </button>
        )}
      </div>

      {/* iOS用モーダル */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-20">
          <div className="bg-white rounded-lg p-6 max-w-xs w-full space-y-4">
            <h2 className="text-lg font-bold">iOSで見るには</h2>
            <p className="break-words text-sm">{launcherURL}</p>
            <div className="flex justify-center">
              <NextImage
                src={launcherQrPath}
                alt="QRコード"
                width={160}
                height={160}
                className="object-contain"
                unoptimized
              />
            </div>
            <button
              onClick={() => setShowModal(false)}
              className="mt-2 w-full p-2 bg-gray-200 rounded"
            >
              閉じる
            </button>
          </div>
        </div>
      )}

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
