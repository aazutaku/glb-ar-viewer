"use client";

import dynamic from "next/dynamic";
import { useState } from "react";

const ARCanvas = dynamic(() => import("@/components/ARCanvas"), {
  ssr: false,
});

export default function Page() {
  const [glbUrl, setGlbUrl] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.name.endsWith(".glb")) {
      const url = URL.createObjectURL(file);
      setGlbUrl(url);
    } else {
      alert("GLBファイルを選択してください。");
    }
  };

  return (
    <div className="w-screen h-screen relative">
      <div className="absolute top-4 left-4 z-10 flex gap-4 bg-white p-4 rounded">
        <input type="file" accept=".glb" onChange={handleFileChange} />
      </div>
      <ARCanvas glbUrl={glbUrl} />
    </div>
  );
}