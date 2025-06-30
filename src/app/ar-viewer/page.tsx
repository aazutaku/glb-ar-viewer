"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useRef } from "react";
import dynamic from "next/dynamic";

const ARCanvas = dynamic(() => import("@/components/ARCanvas"), { ssr: false });

function InnerARPage() {
  const searchParams = useSearchParams();
  const glbUrl = searchParams.get("url");
  const key = searchParams.get("key");
  const containerRef = useRef<HTMLDivElement | null>(null);

  const launcherURL = key
    ? `https://launchar.app/launch/glb-ar-viewer?url=https%3A%2F%2Fglb-ar-viewer.hack-lab.app?key=${encodeURIComponent(
        key
      )}`
    : "https://launchar.app/launch/glb-ar-viewer?url=https%3A%2F%2Fglb-ar-viewer.hack-lab.app";

  if (!glbUrl) return <div>Invalid or missing GLB URL</div>;

  return (
    <div
      className={`w-screen h-screen relative bg-gradient-to-br from-black via-gray-900 to-gray-800 text-white font-sans`}
    >
      <div
        ref={containerRef}
        className="w-screen h-screen bg-transparent relative"
      >
        <ARCanvas
          glbUrl={glbUrl}
          launcherURL={launcherURL}
          containerRef={containerRef}
        />
      </div>
    </div>
  );
}

export default function ARPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <InnerARPage />
    </Suspense>
  );
}
