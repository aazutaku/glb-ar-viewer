"use client";

import { useGLTF } from "@react-three/drei";
import { useEffect } from "react";

export default function GLBModel({ url }: { url: string }) {
  const { scene } = useGLTF(url);

  // Blob URL のキャッシュをクリア（メモリリーク防止）
  useEffect(() => {
    return () => {
      URL.revokeObjectURL(url);
    };
  }, [url]);

  return <primitive object={scene} position={[0, 1, -1]} />;
}