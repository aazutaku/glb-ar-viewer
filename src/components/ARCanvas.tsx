"use client";

import { Canvas } from "@react-three/fiber";
import { XR, createXRStore } from "@react-three/xr";
import { Suspense, useEffect, useState } from "react";
import GLBModel from "./GLBModel";
import { SlidersHorizontal } from "lucide-react";

type Props = {
  glbUrl: string | null;
  launcherURL: string;
  containerRef: React.RefObject<HTMLDivElement | null>;
};

export default function ARCanvas({ glbUrl, launcherURL, containerRef }: Props) {
  const [store, setStore] = useState<ReturnType<typeof createXRStore> | null>(
    null
  );

  const [mode, setMode] = useState<"start" | "enterAR" | "">("start");
  const [isIOS, setIsIOS] = useState(false);
  const [isARSupported, setIsARSupported] = useState(false);

  const [showControls, setShowControls] = useState(false);
  const [position, setPosition] = useState<[number, number, number]>([0, 0, 0]);
  const [rotation, setRotation] = useState<[number, number, number]>([0, 0, 0]);

  const [playAnimation, setPlayAnimation] = useState<boolean>(true);

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
    if (store) {
      await store.enterAR();
      setMode("enterAR");
    }
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
      </div>

      {/* トグルボタン */}
      {mode === "enterAR" && (
        <div className="absolute bottom-6 right-6 z-40 flex gap-3">
          {/* アニメーション トグル */}
          <button
            onClick={() => setPlayAnimation((prev) => !prev)}
            className="w-12 h-12 flex items-center justify-center 
        bg-gray-700/70 hover:bg-gray-600/70 
        text-white rounded-full shadow-xl 
        backdrop-blur-md border border-white/10 
        transition"
            title="Toggle Animation"
          >
            {playAnimation ? "⏸" : "▶"}
          </button>

          {/* 位置調整 トグル */}
          <button
            onClick={() => setShowControls(!showControls)}
            className="w-12 h-12 flex items-center justify-center 
        bg-gray-700/70 hover:bg-gray-600/70 
        text-white rounded-full shadow-xl 
        backdrop-blur-md border border-white/10 
        transition"
            title="Adjust"
          >
            <SlidersHorizontal size={24} />
          </button>
        </div>
      )}

      {/* コントローラーUI */}
      {showControls && (
        <div className="absolute bottom-20 right-6 z-30 bg-[#111]/90 p-4 rounded-xl shadow-xl text-white font-mono text-xs space-y-4 border border-gray-700 backdrop-blur-md w-[150px]">
          {/* Translate Controls */}
          <div>
            <div className="mb-2 font-bold text-cyan-400 tracking-wide text-sm">
              Translate
            </div>
            <div className="space-y-1.5">
              {["X", "Y", "Z"].map((axis, i) => (
                <div key={axis} className="flex items-center gap-2">
                  <span className="w-6 text-cyan-300">{axis}:</span>
                  <button
                    onClick={() =>
                      move(
                        i === 0 ? 0.1 : 0,
                        i === 1 ? 0.1 : 0,
                        i === 2 ? 0.1 : 0
                      )
                    }
                    className="w-9 h-9 rounded-lg bg-cyan-700 hover:bg-cyan-500 text-white font-bold shadow transition"
                  >
                    +
                  </button>
                  <button
                    onClick={() =>
                      move(
                        i === 0 ? -0.1 : 0,
                        i === 1 ? -0.1 : 0,
                        i === 2 ? -0.1 : 0
                      )
                    }
                    className="w-9 h-9 rounded-lg bg-cyan-700 hover:bg-cyan-500 text-white font-bold shadow transition"
                  >
                    −
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Rotate Controls */}
          <div>
            <div className="mb-2 font-bold text-green-400 tracking-wide text-sm">
              Rotate
            </div>
            <div className="space-y-1.5">
              {["Rx", "Ry", "Rz"].map((axis, i) => (
                <div key={axis} className="flex items-center gap-2">
                  <span className="w-6 text-green-300">{axis}:</span>
                  <button
                    onClick={() =>
                      rotate(
                        i === 0 ? 0.1 : 0,
                        i === 1 ? 0.1 : 0,
                        i === 2 ? 0.1 : 0
                      )
                    }
                    className="w-9 h-9 rounded-lg bg-green-700 hover:bg-green-500 text-white font-bold shadow transition"
                  >
                    +
                  </button>
                  <button
                    onClick={() =>
                      rotate(
                        i === 0 ? -0.1 : 0,
                        i === 1 ? -0.1 : 0,
                        i === 2 ? -0.1 : 0
                      )
                    }
                    className="w-9 h-9 rounded-lg bg-green-700 hover:bg-green-500 text-white font-bold shadow transition"
                  >
                    −
                  </button>
                </div>
              ))}
            </div>
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
                  <GLBModel url={glbUrl} play={playAnimation} />
                  {/* Debug プレーンとマーカー */}
                  <mesh rotation={[-Math.PI / 2, 0, 0]}>
                    <planeGeometry args={[0.5, 0.5]} />
                    <meshStandardMaterial
                      color="gray"
                      transparent
                      opacity={0.5}
                    />
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
