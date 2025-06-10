"use client";

import { Canvas } from "@react-three/fiber";
import { XR, createXRStore } from "@react-three/xr";
import { useEffect, useState } from "react";

const store = createXRStore();

async function checkWebXRSupport(): Promise<string | null> {
  if (!("xr" in navigator) || !navigator.xr) {
    return "❌ WebXR 未対応：navigator.xr が存在しません";
  }

  try {
    const isSupported = await navigator.xr.isSessionSupported("immersive-ar");
    return isSupported
      ? null
      : "❌ WebXR はあるが AR セッション（immersive-ar）に非対応";
  } catch (e: unknown) {
    if (e instanceof Error) {
      return `❌ WebXR エラー: ${e.message}`;
    }
    return "❌ WebXR エラー: 不明なエラーが発生しました";
  }
}

export default function Page() {
  const [enabled, setEnabled] = useState(false);
  const [red, setRed] = useState(false);
  const [status, setStatus] = useState("📄 初期化中...");

  useEffect(() => {
    if (!navigator.xr) return;

    navigator.xr.requestSession("immersive-ar", {
      requiredFeatures: ["local", "anchors", "dom-overlay", "hit-test"],
    });
  }, []);

  const handleEnterAR = async () => {
    setStatus("🟡 AR セッション開始中...");
    setEnabled(true);

    store.enterAR();
  };

  const handleCheck = async () => {
    setStatus("🧪 WebXRサポートチェック中...");

    const error = await checkWebXRSupport();
    if (error) {
      alert(error);
      setStatus(error);
      return;
    }
    alert("問題なし");
    setStatus("問題なし");
    return;
  };

  return (
    <div className="w-screen h-screen bg-black relative">
      {/* ステータス表示 */}
      <div className="absolute top-2 left-2 z-20 bg-white text-black p-2 rounded text-sm max-w-xs">
        {status}
      </div>

      <div className="absolute top-4 left-4 z-10 flex gap-4">
        <button
          onClick={handleCheck}
          className="p-3 bg-white text-black rounded"
        >
          Check
        </button>

        {!enabled && (
          <button
            onClick={handleEnterAR}
            className="p-3 bg-white text-black rounded"
          >
            Enter AR
          </button>
        )}
      </div>

      <Canvas>
        <XR store={store}>
          <ambientLight />
          <directionalLight position={[1, 2, 3]} />
          <mesh
            pointerEventsType={{ deny: "grab" }}
            onClick={() => setRed(!red)}
            position={[0, 1, -1]}
          >
            <boxGeometry />
            <meshBasicMaterial color={red ? "red" : "blue"} />
          </mesh>
        </XR>
      </Canvas>
    </div>
  );
}
