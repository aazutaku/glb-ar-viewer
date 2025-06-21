"use client";

import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import { useState, useEffect } from "react";
import { Orbitron } from "next/font/google";
import { motion, AnimatePresence } from "framer-motion";

const orbitron = Orbitron({ subsets: ["latin"], variable: "--font-orbitron" });
const ARCanvas = dynamic(() => import("@/components/ARCanvas"), { ssr: false });

export default function Page() {
  const searchParams = useSearchParams();
  const key = searchParams.get("key");
  const defaultUrl = key ? `/api/model?key=${encodeURIComponent(key)}` : null;

  const [glbUrl, setGlbUrl] = useState<string | null>(null);

  useEffect(() => {
    if (defaultUrl) {
      setGlbUrl(defaultUrl);
    }
  }, [defaultUrl]);

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
    <div className={`w-screen h-screen relative bg-gradient-to-br from-black via-gray-900 to-gray-800 text-white ${orbitron.variable} font-sans`}>
      <AnimatePresence>
        {!glbUrl && (
          <motion.div
            key="intro"
            className="absolute inset-0 flex flex-col items-center justify-center p-6 space-y-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.h1
              className="text-5xl md:text-6xl font-bold tracking-widest text-cyan-400 drop-shadow-lg"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              GLB AR Viewer
            </motion.h1>

            <motion.label
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-6 py-3 rounded-lg shadow-lg cursor-pointer"
            >
              <input
                type="file"
                accept=".glb"
                onChange={handleFileChange}
                className="hidden"
              />
              Select GLB File
            </motion.label>

            <motion.div
              className="w-full max-w-2xl border border-cyan-600 rounded-xl p-4 bg-white/5 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <h2 className="text-xl font-semibold mb-2 text-cyan-300">How to Use</h2>
              <p className="text-sm text-gray-300">（後で説明をここに追加）</p>
            </motion.div>

            <motion.div
              className="w-full max-w-2xl border border-indigo-500 rounded-xl p-4 bg-white/5 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <h2 className="text-xl font-semibold mb-2 text-indigo-300">Sponsored</h2>
              <p className="text-sm text-gray-300">（広告スペース）</p>
            </motion.div>

            <motion.footer
              className="text-xs text-gray-400 mt-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
            >
              <a href="/terms" className="underline mr-4">利用規約</a>
              <a href="/privacy" className="underline">プライバシーポリシー</a>
            </motion.footer>
          </motion.div>
        )}
      </AnimatePresence>

      {glbUrl && <ARCanvas glbUrl={glbUrl} />}
    </div>
  );
}
