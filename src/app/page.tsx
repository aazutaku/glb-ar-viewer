import { Suspense } from "react";
import PageClient from "./PageClient";

export default function Page() {
  return (
    <Suspense fallback={<div className="text-white p-4">Loading viewer...</div>}>
      <PageClient />
    </Suspense>
  );
}