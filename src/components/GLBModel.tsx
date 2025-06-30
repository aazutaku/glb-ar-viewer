"use client";

import { useGLTF } from "@react-three/drei";
import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { AnimationMixer } from "three";

type Props = {
  url: string;
  play: boolean;
};

export default function GLBModel({ url, play }: Props) {
  const { scene, animations } = useGLTF(url);
  const mixerRef = useRef<AnimationMixer | null>(null);

  useEffect(() => {
    if (animations.length > 0) {
      mixerRef.current = new AnimationMixer(scene);
      animations.forEach((clip) => {
        const action = mixerRef.current!.clipAction(clip);
        if (play) {
          action.play();
        } else {
          action.stop();
        }
      });
    }
    return () => {
      URL.revokeObjectURL(url);
      mixerRef.current?.stopAllAction();
      mixerRef.current?.uncacheRoot(scene);
      mixerRef.current = null;
    };
  }, [url, scene, animations, play]);

  useFrame((_, delta) => {
    if (mixerRef.current && play) {
      mixerRef.current.update(delta);
    }
  });

  return <primitive object={scene} scale={[1, 1, 1]} />;
}
