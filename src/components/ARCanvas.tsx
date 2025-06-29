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
  const [isARSupported, setIsARSupported] = useState(false);
  const [showControls, setShowControls] = useState(false);

  const [position, setPosition] = useState<[number, number, number]>([0, 0, 0]);
  const [rotation, setRotation] = useState<[number, number, number]>([0, 0, 0]);

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
      hitTest: false,
    });

    setStore(storeInstance);
  }, [containerRef]);

  useEffect(() => {
    const ua = window.navigator.userAgent;
    if (/iPad|iPhone|iPod/.test(ua)) setIsIOS(true);
  }, []);

  useEffect(() => {
    if (navigator.xr) {
      navigator.xr.isSessionSupported("immersive-ar").then(setIsARSupported);
    }
  }, []);

  const handleEnterAR = async () => {
    if (store) await store.enterAR();
  };

  const move = (dx: number, dy: number, dz: number) => {
    setPosition(([x, y, z]) => [x + dx, y + dy, z + dz]);
  };

  const rotate = (dx: number, dy: number, dz: number) => {
    setRotation(([rx, ry, rz]) => [rx + dx, ry + dy, rz + dz]);
  };

  return (
    <>
      {/* AR開始 or エラー表示 */}
      <div className="absolute bottom-36 left-1/2 -translate-x-1/2 z-20 flex gap-4">
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

      {/* 位置調整トグルボタン */}
      <div className="absolute bottom-28 left-1/2 -translate-x-1/2 z-30">
        <button
          onClick={() => setShowControls(!showControls)}
          className="px-4 py-2 bg-yellow-300 text-black rounded"
        >
          {showControls ? "調整を閉じる" : "位置調整"}
        </button>
      </div>

      {/* コントローラーUI */}
      {showControls && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-2 pointer-events-auto">
          {/* 移動 */}
          <div className="flex flex-col items-center gap-2">
            <div className="flex flex-col items-center gap-2">
              <div className="flex gap-2">
                <button
                  onClick={() => move(0, 0, -0.1)}
                  className="p-2 bg-white rounded"
                >
                  奥へ
                </button>
                <button
                  onClick={() => move(0, 0, 0.1)}
                  className="p-2 bg-white rounded"
                >
                  手前へ
                </button>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => move(-0.1, 0, 0)}
                  className="p-2 bg-white rounded"
                >
                  ←
                </button>
                <button
                  onClick={() => move(0.1, 0, 0)}
                  className="p-2 bg-white rounded"
                >
                  →
                </button>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => move(0, 0.1, 0)}
                  className="p-2 bg-white rounded"
                >
                  ⬆︎
                </button>
                <button
                  onClick={() => move(0, -0.1, 0)}
                  className="p-2 bg-white rounded"
                >
                  ⬇︎
                </button>
              </div>
            </div>
          </div>

          {/* 回転 */}
          <div className="flex gap-4 mt-2">
            <button
              onClick={() => rotate(0, -0.1, 0)}
              className="p-2 bg-white rounded"
            >
              ↺
            </button>
            <button
              onClick={() => rotate(0, 0.1, 0)}
              className="p-2 bg-white rounded"
            >
              ↻
            </button>
          </div>

          {/* ピッチ回転（X軸） */}
          <div className="flex gap-4 mt-2">
            <button
              onClick={() => rotate(-0.1, 0, 0)}
              className="p-2 bg-white rounded"
            >
              ⤴
            </button>
            <button
              onClick={() => rotate(0.1, 0, 0)}
              className="p-2 bg-white rounded"
            >
              ⤵
            </button>
          </div>
        </div>
      )}

      {/* AR Canvas */}
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
              {glbUrl && (
                <group position={position} rotation={rotation}>
                  <GLBModel url={glbUrl} />
                  {/* Debug プレーンとマーカー */}
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
