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

  const [placedPose, setPlacedPose] = useState<Pose | null>(null);

  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    const ua = window.navigator.userAgent;
    if (/iPad|iPhone|iPod/.test(ua)) setIsIOS(true);
  }, []);

  const [store] = useState(() => {
    function ScreenInputHitTest() {
      const matrixHelper = new Matrix4();
      const posHelper = new Vector3();
      const quatHelper = new Quaternion();
      const scaleHelper = new Vector3(1, 1, 1);
      return (
        <XRHitTest
          onResults={(results, getWorldMatrix) => {
            if (!results.length) return;
            // 行列を取得して分解
            getWorldMatrix(matrixHelper, results[0]);
            matrixHelper.decompose(posHelper, quatHelper, scaleHelper);
            // 配置位置をステートに保存
            setPlacedPose({
              position: posHelper.clone(),
              quaternion: quatHelper.clone(),
              scale: scaleHelper.clone(),
            });
          }}
        />
      );
    }

    return createXRStore({
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
      screenInput: ScreenInputHitTest,
    });
  });

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

          {/* 平面検出＆モデル配置のロジックはここに追加 */}
          {/* 例: XRHitTest で hitPose を取得 → setPlacedPose(hitPose) */}

          <Suspense fallback={null}>
            {glbUrl && !placedPose && <GLBModel url={glbUrl} />}
          </Suspense>

          <Suspense fallback={null}>
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
