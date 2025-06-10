"use client";

import { Canvas } from "@react-three/fiber";
import { XR, XRHitTest, createXRStore } from "@react-three/xr";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

const store = createXRStore();

function ARBox() {
  const ref = useRef<THREE.Mesh>(null);
  const [visible, setVisible] = useState(false);

  // 平面ヒット時の位置を保持
  const matrixHelper = useRef(new THREE.Matrix4());

  return (
    <>
      {/* AR平面へのヒットテスト */}
      <XRHitTest
        onResults={(results, getWorldMatrix) => {
          if (!ref.current || results.length === 0) return;
          console.log("results", results);

          // ヒット位置を取得して Box に適用
          getWorldMatrix(matrixHelper.current, results[0]);
          matrixHelper.current.decompose(
            ref.current.position,
            ref.current.quaternion,
            ref.current.scale
          );

          setVisible(true);
        }}
      />

      {/* Box 自体 */}
      <mesh ref={ref} visible={visible}>
        <boxGeometry args={[0.2, 0.2, 0.2]} />
        <meshStandardMaterial color="orange" />
      </mesh>
    </>
  );
}

export default function Page() {
  const [enabled, setEnabled] = useState(false);

  // iOS向けのVariant SDKイベント対応
  useEffect(() => {
    const onLaunch = (e: Event) => {
      const customEvent = e as CustomEvent<{
        launchRequired: boolean;
        launchUrl: string;
      }>;

      if (customEvent.detail.launchRequired) {
        window.location.href = customEvent.detail.launchUrl;
      }
    };

    window.addEventListener("vlaunch-initialized", onLaunch);
    return () => {
      window.removeEventListener("vlaunch-initialized", onLaunch);
    };
  }, []);

  return (
    <div className="w-screen h-screen bg-black relative">
      {!enabled && (
        <button
          onClick={() => {
            setEnabled(true);
            store.enterAR();
          }}
          className="absolute z-10 p-3 m-4 bg-white text-black rounded"
        >
          Enter AR
        </button>
      )}

      <Canvas>
        <XR store={store}>
          <ambientLight intensity={1} />
          <directionalLight position={[1, 2, 3]} />
          <ARBox />
        </XR>
      </Canvas>
    </div>
  );
}
