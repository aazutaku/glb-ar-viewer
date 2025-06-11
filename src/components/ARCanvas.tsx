"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { XR, createXRStore } from "@react-three/xr";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { ARButton } from "three/examples/jsm/webxr/ARButton.js";

function DebugFrame({
  meshRef,
}: {
  meshRef: React.RefObject<THREE.Mesh | null>;
}) {
  const { camera } = useThree();
  useFrame(() => {
    if (meshRef.current) {
      const distance = 1;
      const direction = new THREE.Vector3(0, 1, -distance);
      direction.applyQuaternion(camera.quaternion);
      const newPosition = camera.position.clone().add(direction);
      meshRef.current.position.copy(newPosition);
    }
  });
  return null;
}

function isIOS() {
  if (typeof window === "undefined") return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
}

export default function ARCanvas() {
  const meshRef = useRef<THREE.Mesh>(null);
  const [renderer, setRenderer] = useState<THREE.WebGLRenderer | null>(null);
  const [store] = useState(() =>
    createXRStore({
      customSessionInit: {
        requiredFeatures: ["local"],
        optionalFeatures: ["hit-test", "anchors", "dom-overlay"],
      },
    })
  );

  useEffect(() => {
    if (isIOS() && renderer) {
      console.log("isIOS-ARBUTTON-CREATE");
      const button = ARButton.createButton(renderer, {
        requiredFeatures: ["local", "hit-test", "dom-overlay"],
        domOverlay: { root: document.body },
      });
      document.body.appendChild(button);
    }
  }, [renderer]);

  const handleEnterAR = async () => {
    if (store) {
      console.log("Trying to enter AR");
      await store.enterAR();
      console.log("Entered AR session");
    }
  };

  return (
    <div className="w-screen h-screen relative">
      {!isIOS() && (
        <div className="absolute top-4 left-4 z-10 flex gap-4">
          <button
            onClick={handleEnterAR}
            className="p-3 bg-white text-black rounded"
          >
            Enter AR: 標準
          </button>
        </div>
      )}

      <Canvas
        style={{ backgroundColor: "transparent" }}
        onCreated={({ gl }) => {
          gl.xr.enabled = true;
          gl.xr.setReferenceSpaceType("local");
          setRenderer(gl);
        }}
      >
        <XR store={store}>
          <ambientLight />
          <directionalLight position={[1, 2, 3]} />
          <DebugFrame meshRef={meshRef} />
          <mesh
            ref={meshRef}
            pointerEventsType={{ deny: "grab" }}
            position={[0, 1, -1]}
          >
            <boxGeometry />
            <meshBasicMaterial color="red" />
          </mesh>
        </XR>
      </Canvas>
    </div>
  );
}
