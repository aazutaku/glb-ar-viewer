"use client";

import { Canvas } from "@react-three/fiber";
import { XR, XRHitTest, createXRStore } from "@react-three/xr";
import { Suspense, useEffect, useState } from "react";
import GLBModel from "./GLBModel";
import { Matrix4, Quaternion, Vector3 } from "three";

type Props = {
  glbUrl: string | null;
  launcherURL: string;
  containerRef: React.RefObject<HTMLDivElement | null>;
};

type Pose = {
  position: Vector3;
  quaternion: Quaternion;
};

export default function ARCanvas({ glbUrl, launcherURL, containerRef }: Props) {
  const [store, setStore] = useState<ReturnType<typeof createXRStore> | null>(
    null
  );

  const [mode, setMode] = useState<"start" | "enterAR" | "hitTest" | "placed">(
    "start"
  );

  const matrixHelper: Matrix4 = new Matrix4();
  const [hitTestPose, setHitTestPose] = useState<Pose | null>(null);

  const [placedPose, setPlacedPose] = useState<Pose | null>(null);

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
    setMode("enterAR");
  };

  const handleHitTest = (pose: Pose) => {
    console.log("HitTestPosition", pose.position.clone());
    setMode("hitTest");
    setHitTestPose({
      position: pose.position.clone(),
      quaternion: pose.quaternion.clone(),
    });
  };

  const handleConfirmPlacement = () => {
    if (hitTestPose) {
      console.log("HitTestPosition", hitTestPose.position.clone());
      setMode("placed");
      setPlacedPose(hitTestPose);
    }
  };

  const handleResetPlacement = () => {
    setHitTestPose(null);
    setMode("enterAR");
  };

  return (
    <>
      {/* UIボタン類 */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-4">
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
                  handleHitTest({
                    position: new Vector3().setFromMatrixPosition(matrixHelper),
                    quaternion: new Quaternion().setFromRotationMatrix(
                      matrixHelper
                    ),
                  });
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
              {glbUrl && mode === "hitTest" && hitTestPose && (
                <group
                  position={hitTestPose.position}
                  quaternion={hitTestPose.quaternion}
                  scale={[1, 1, 1]}
                >
                  <GLBModel url={glbUrl} />
                </group>
              )}

              {/* ⑤ 確定表示 */}
              {glbUrl && mode === "placed" && placedPose && (
                <group
                  position={placedPose.position}
                  quaternion={placedPose.quaternion}
                  scale={[1, 1, 1]}
                >
                  <GLBModel url={glbUrl} />
                </group>
              )}
            </Suspense>
          </XR>
        </Canvas>
      )}
    </>
  );
}
