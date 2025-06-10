"use client";

import { Canvas } from "@react-three/fiber";
import { XR, createXRStore } from "@react-three/xr";
import { useEffect, useState } from "react";

const store = createXRStore();

export default function Page() {
  const [enabled, setEnabled] = useState(false);
  const [red, setRed] = useState(false);
  const [status, setStatus] = useState("📄 初期化中...");

  useEffect(() => {
    setStatus("📡 Variant イベント待機中");

    const onLaunch = (e: Event) => {
      const customEvent = e as CustomEvent<{
        launchRequired: boolean;
        launchUrl: string;
      }>;

      setStatus("🚀 Variant イベント受信");

      if (customEvent.detail.launchRequired) {
        setStatus("🔁 iOSリダイレクト中...");
        window.location.href = customEvent.detail.launchUrl;
      }
    };

    window.addEventListener("vlaunch-initialized", onLaunch);
    return () => {
      window.removeEventListener("vlaunch-initialized", onLaunch);
    };
  }, []);

  const handleEnterAR = () => {
    setStatus("🟡 AR セッション開始中...");
    setEnabled(true);

    store
      .enterAR()
      .then(() => setStatus("✅ ARセッション開始！"))
      .catch((err) => {
        alert("❌ AR開始失敗: " + err.message);
        setStatus(`❌ AR開始失敗: ${err.message}`);
      });
  };

  return (
    <div className="w-screen h-screen bg-black relative">
      {/* ステータス表示 */}
      <div className="absolute top-2 left-2 z-20 bg-white text-black p-2 rounded text-sm max-w-xs">
        {status}
      </div>

      {!enabled && (
        <button
          onClick={handleEnterAR}
          className="absolute z-10 p-3 m-4 bg-white text-black rounded"
        >
          Enter AR
        </button>
      )}

      <Canvas>
        <XR store={store}>
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
