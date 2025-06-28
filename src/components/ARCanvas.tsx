"use client";

import { Canvas } from "@react-three/fiber";
import { XR, XRHitTest, createXRStore } from "@react-three/xr";
import { Suspense, useEffect, useRef, useState } from "react";
import GLBModel from "./GLBModel";
import { Matrix4, Quaternion, Vector3 } from "three";

type Props = {
  glbUrl: string | null;
  launcherURL: string;
};

type Pose = {
  position: Vector3;
  quaternion: Quaternion;
  scale: Vector3;
};

export default function ARCanvas({ glbUrl, launcherURL }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  const [hitPose, setHitPose] = useState<Pose | null>(null);
  const hitPoseRef = useRef<Pose | null>(null);

  const [placedPose, setPlacedPose] = useState<Pose | null>(null);

  const [isIOS, setIsIOS] = useState(false);

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
      hitTest: true,
    })
  );

  const [isARSupported, setIsARSupported] = useState(false);

  useEffect(() => {
    if (navigator.xr) {
      navigator.xr.isSessionSupported("immersive-ar").then(setIsARSupported);
    }
  }, []);

  const handleEnterAR = async () => {
    if (store) await store.enterAR();
  };

  const mat = new Matrix4();
  const pos = new Vector3();
  const quat = new Quaternion();
  const scl = new Vector3(1, 1, 1);

  const handleConfirmPlacement = () => {
    if (hitPose) {
      setPlacedPose(hitPose);
      setHitPose(null);
    }
  };

  const handleResetPlacement = () => {
    setHitPose(null);
    setPlacedPose(null);
  };

  useEffect(() => {
    console.log("hitPose更新")
    hitPoseRef.current = hitPose; // 最新のhitPoseを追跡
  }, [hitPose]);

  return (
    <div ref={containerRef} className="w-screen h-screen relative">
      {/* UIボタン類 */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex gap-4">
        {isARSupported && !placedPose && !hitPose && (
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
        {/* プレビュー中の操作 */}
        {hitPose && !placedPose && (
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
          {!hitPose && !placedPose && (
            <XRHitTest
              trackableType="plane"
              onResults={(results, getWorldMatrix) => {
                if (results.length === 0) return;
                getWorldMatrix(mat, results[0]);
                mat.decompose(pos, quat, scl);

                const pose: Pose = {
                  position: pos.clone(),
                  quaternion: quat.clone(),
                  scale: scl.clone(),
                };

                if (
                  !hitPoseRef.current ||
                  !hitPoseRef.current.position.equals(pose.position) ||
                  !hitPoseRef.current.quaternion.equals(pose.quaternion)
                ) {
                  console.log("✅ 初回 hitPose 設定:", pose);
                  setHitPose(pose);
                } else {
                  console.log("⏭️ 同じposeなのでスキップ");
                }
              }}
            />
          )}

          <Suspense fallback={null}>

            {/* ③ プレビュー表示 */}
            {glbUrl && !hitPose && !placedPose && (
              <group position={[0, 0, -1]}>
                <mesh >
                  <sphereGeometry args={[0.02, 16, 16]} />
                  <meshStandardMaterial color="red" />
                </mesh>
              </group>
            )}

            {/* ③ プレビュー表示 */}
            {glbUrl && hitPose && !placedPose && (
              <group position={hitPose.position}>
                <mesh>
                  <sphereGeometry args={[0.02, 16, 16]} />
                  <meshStandardMaterial color="lime" />
                </mesh>
              </group>
            )}

            {/* ⑤ 確定表示 */}
            {glbUrl && placedPose && (
              <group
                position={placedPose.position}
                quaternion={placedPose.quaternion}
                scale={placedPose.scale}
              >
                <GLBModel url={glbUrl} />
              </group>
            )}
          </Suspense>
        </XR>
      </Canvas>
    </div>
  );
}
