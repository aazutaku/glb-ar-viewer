"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useRef } from "react";
import dynamic from "next/dynamic";

const ARCanvas = dynamic(() => import("@/components/ARCanvas"), { ssr: false });

function InnerARPage() {
  const searchParams = useSearchParams();
  const glbUrl = searchParams.get("url");
  const containerRef = useRef<HTMLDivElement | null>(null);

  //   const launcherURL = key
  //     ? `https://launchar.app/launch/glb-ar-viewer?url=https%3A%2F%2Fglb-ar-viewer.hack-lab.app?key=${encodeURIComponent(
  //         key
  //       )}`
  //     : "https://launchar.app/launch/glb-ar-viewer?url=https%3A%2F%2Fglb-ar-viewer.hack-lab.app";

  if (!glbUrl) return <div>Invalid or missing GLB URL</div>;

  return (
    <div
      ref={containerRef}
      className="w-screen h-screen bg-transparent relative"
    >
      <ARCanvas
        glbUrl={glbUrl}
        launcherURL="/fallback"
        containerRef={containerRef}
      />
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
