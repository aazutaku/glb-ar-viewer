"use client";

import dynamic from "next/dynamic";

const ARCanvas = dynamic(() => import("@/components/ARCanvas"), {
  ssr: false,
});

export default function Page() {
  return <ARCanvas />;
}
