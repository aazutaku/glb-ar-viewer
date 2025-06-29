"use client";

import { Canvas } from "@react-three/fiber";
import { XR, createXRStore } from "@react-three/xr";
import { Suspense, useEffect, useState } from "react";
import GLBModel from "./GLBModel";

type Props = {
  glbUrl: string | null;
  launcherURL: string;
  containerRef: React.RefObject<HTMLDivElement | null>;
};

export default function ARCanvas({ glbUrl, launcherURL, containerRef }: Props) {
  const [store, setStore] = useState<ReturnType<typeof createXRStore> | null>(
    null
  );

  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;

    const storeInstance = createXRStore({
      customSessionInit: {
        requiredFeatures: ["local", "hit-test", "dom-overlay"],
        optionalFeatures: ["anchors"],
        domOverlay: {
          root: containerRef.current,
        },
      },
      hitTest: true,
    });

    setStore(storeInstance);
  }, [containerRef]);

  useEffect(() => {
    const ua = window.navigator.userAgent;
    if (/iPad|iPhone|iPod/.test(ua)) setIsIOS(true);
  }, []);

  const [isARSupported, setIsARSupported] = useState(false);

  useEffect(() => {
    if (navigator.xr) {
      navigator.xr.isSessionSupported("immersive-ar").then(setIsARSupported);
    }
  }, []);

  const handleEnterAR = async () => {
    if (store) await store.enterAR();
  };

  return (
    <>
      {/* UIボタン類 */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-4">
        {isARSupported && (
          <button
            onClick={handleEnterAR}
            className="p-3 bg-white text-black rounded"
          >
            Enter AR
          </button>
        )}
        {!isARSupported && !isIOS && (
          <span className="p-3 bg-red-200 text-black rounded">
            WebXR not supported
          </span>
        )}
        {!isARSupported && isIOS && (
          <a href={launcherURL} className="p-3 bg-blue-500 text-white rounded">
            iOSはこちら
          </a>
        )}
      </div>
      {/* Canvas + AR内容 */}
      {store && (
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

            <Suspense fallback={null}>
              {/* ずっと表示されるモデル */}
              {glbUrl && (
                <group position={[0, 0, -1]}>
                  <GLBModel url={glbUrl} />

                  {/* デバッグプレーンとマーカー */}
                  <mesh rotation={[-Math.PI / 2, 0, 0]}>
                    <planeGeometry args={[0.5, 0.5]} />
                    <meshStandardMaterial
                      color="gray"
                      transparent
                      opacity={0.5}
                    />
                  </mesh>
                  <mesh>
                    <sphereGeometry args={[0.02, 16, 16]} />
                    <meshStandardMaterial color="blue" />
                  </mesh>
                </group>
              )}
            </Suspense>
          </XR>
        </Canvas>
      )}
    </>
  );
}
