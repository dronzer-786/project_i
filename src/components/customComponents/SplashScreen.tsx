"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { SparklesText } from "./SparkleText";

export default function SplashScreen() {
  const [mounted, setMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    setMounted(true);
    // Check if splash screen has been shown in this session
    const hasBeenShown = sessionStorage.getItem('splashScreenShown') === 'true';
    if (hasBeenShown) {
      setIsVisible(false);
    } else {
      sessionStorage.setItem('splashScreenShown', 'true');
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, []);

  // Don't render anything on the server side
  if (!mounted) return null;

  // Don't show splash screen if it's already been shown
  if (!isVisible) return null;

  return (
    <motion.div
      className="fixed inset-0 flex items-center justify-center bg-white z-50"
      initial={{ opacity: 1 }}
      animate={{ opacity: 0 }}
      transition={{ duration: 0.5, delay: 1.5 }}
      onAnimationComplete={() => setIsVisible(false)}
    >
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <SparklesText text="Project - i"  sparklesCount={20}/>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="mt-12 text-center"
        >
          <div className="flex items-center justify-center gap-2">
            <div className="w-2 h-2 bg-black rounded-full animate-bounce [animation-delay:-0.3s]"></div>
            <div className="w-2 h-2 bg-black rounded-full animate-bounce [animation-delay:-0.15s]"></div>
            <div className="w-2 h-2 bg-black rounded-full animate-bounce"></div>
          </div>
          <p className="text-black mt-2 text-sm">Getting ready, please wait...</p>
        </motion.div>
      </motion.div>
    </motion.div>
  );
} 