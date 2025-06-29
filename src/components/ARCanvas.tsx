"use client";

import { Canvas } from "@react-three/fiber";
import { XR, XRHitTest, createXRStore } from "@react-three/xr";
import { Suspense, useEffect, useRef, useState } from "react";
import GLBModel from "./GLBModel";
import { Matrix4, Vector3 } from "three";

type Props = {
  glbUrl: string | null;
  launcherURL: string;
};

export default function ARCanvas({ glbUrl, launcherURL }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [store, setStore] = useState<ReturnType<typeof createXRStore> | null>(
    null
  );

  const [mode, setMode] = useState<"start" | "enterAR" | "hitTest" | "placed">(
    "start"
  );

  const matrixHelper: Matrix4 = new Matrix4();
  const [hitTestPosition, setHitTestPosition] = useState<Vector3 | null>(null);

  const [placedPosition, setPlacedPosition] = useState<Vector3 | null>(null);

  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    const ua = window.navigator.userAgent;
    if (/iPad|iPhone|iPod/.test(ua)) setIsIOS(true);
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;

    const newStore = createXRStore({
      customSessionInit: {
        requiredFeatures: ["local", "hit-test", "dom-overlay"],
        optionalFeatures: ["anchors"],
        domOverlay: {
          root: containerRef.current,
        },
      },
      hitTest: true,
    });

    setStore(newStore);
  }, [containerRef]);

  const [isARSupported, setIsARSupported] = useState(false);

  useEffect(() => {
    if (navigator.xr) {
      navigator.xr.isSessionSupported("immersive-ar").then(setIsARSupported);
    }
  }, []);

  const handleEnterAR = async () => {
    if (store) await store.enterAR();
    setMode("enterAR");
  };

  const handleHitTest = (positon: Vector3) => {
    console.log("hitTest", positon);
    setMode("hitTest");
    setHitTestPosition(positon);
  };

  const handleConfirmPlacement = () => {
    if (hitTestPosition) {
      setPlacedPosition(hitTestPosition);
      setMode("placed");
    }
  };

  const handleResetPlacement = () => {
    setHitTestPosition(null);
    setMode("enterAR");
  };

  return (
    <div className="w-screen h-screen relative bg-transparent">
      {/* UIボタン類 */}
      <div
        ref={containerRef}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-4"
      >
        {isARSupported && mode === "start" && (
          <button
            onClick={handleEnterAR}
            className="p-3 bg-white text-black rounded"
          >
            Enter AR
          </button>
        )}
        {!isARSupported && !isIOS && mode === "start" && (
          <span className="p-3 bg-red-200 text-black rounded">
            WebXR not supported
          </span>
        )}
        {!isARSupported && isIOS && mode === "start" && (
          <a href={launcherURL} className="p-3 bg-blue-500 text-white rounded">
            iOSはこちら
          </a>
        )}
        {/* プレビュー中の操作 */}
        {mode === "hitTest" && (
          <>
            <button
              onClick={handleConfirmPlacement}
              className="p-3 bg-green-500 text-white rounded"
            >
              配置確定
            </button>
            <button
              onClick={handleResetPlacement}
              className="p-3 bg-gray-500 text-white rounded"
            >
              やり直し
            </button>
          </>
        )}
        <span className="p-3 bg-red-200 text-black rounded">
          position: {hitTestPosition}
        </span>
      </div>
      {/* Canvas + AR内容 */}
      {store && (
        <Canvas
          style={{ backgroundColor: "transparent" }}
          onCreated={({ gl }) => {
            gl.xr.enabled = true;
            gl.xr.setReferenceSpaceType("viewer");
          }}
        >
          <XR store={store}>
            <ambientLight />
            <directionalLight position={[1, 2, 3]} />

            {/* ① 平面検出：最初のヒットだけ使う */}
            {mode === "enterAR" && (
              <XRHitTest
                trackableType="plane"
                onResults={(results, getWorldMatrix) => {
                  if (results.length === 0) return;
                  getWorldMatrix(matrixHelper, results[0]);
                  handleHitTest(
                    new Vector3().setFromMatrixPosition(matrixHelper)
                  );
                }}
              />
            )}

            <Suspense fallback={null}>
              {/* ③ プレビュー表示 */}
              {glbUrl && mode === "enterAR" && (
                <group position={[0, 0, -1]}>
                  <mesh>
                    <sphereGeometry args={[0.02, 16, 16]} />
                    <meshStandardMaterial color="red" />
                  </mesh>
                </group>
              )}

              {/* ③ プレビュー表示 */}
              {glbUrl && mode === "hitTest" && hitTestPosition && (
                <group position={hitTestPosition}>
                  <mesh>
                    <sphereGeometry args={[0.02, 16, 16]} />
                    <meshStandardMaterial color="lime" />
                  </mesh>
                </group>
              )}

              {/* ⑤ 確定表示 */}
              {glbUrl && mode === "placed" && placedPosition && (
                <group position={placedPosition}>
                  <GLBModel url={glbUrl} />
                </group>
              )}
            </Suspense>
          </XR>
        </Canvas>
      )}
    </div>
  );
}
