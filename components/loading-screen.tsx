'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

interface LoadingScreenProps {
  isLoading: boolean;
}

export function LoadingScreen({ isLoading }: LoadingScreenProps) {
  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: [0.43, 0.13, 0.23, 0.96] }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#050505]"
        >
          {/* Background Ambient Glow */}
          <motion.div
            animate={{
              opacity: [0.1, 0.2, 0.1],
              scale: [1, 1.1, 1]
            }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute w-[500px] h-[500px] bg-emerald-500/5 blur-[120px] rounded-full"
          />

          <div className="relative flex flex-col items-center gap-8">
            {/* Logo Container */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{
                duration: 1,
                ease: [0.16, 1, 0.3, 1]
              }}
              className="relative"
            >
              <motion.div
                animate={{
                  scale: [1, 1.05, 1],
                  opacity: [0.8, 1, 0.8]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <Image
                  src="/logo-dark.png"
                  alt="Finanze"
                  width={80}
                  height={80}
                  priority
                  className="rounded-2xl shadow-2xl shadow-emerald-500/20"
                />
              </motion.div>

              {/* Outer Ring Animation */}
              <motion.div
                animate={{
                  scale: [1, 1.4],
                  opacity: [0.5, 0]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeOut"
                }}
                className="absolute inset-0 border border-emerald-500/30 rounded-2xl"
              />
            </motion.div>

            {/* Brand Text */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="flex flex-col items-center gap-2"
            >
              <span className="text-2xl font-bold tracking-[0.3em] uppercase text-white font-lora">
                Finanze
              </span>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[8px] text-white/30 uppercase tracking-[0.2em] font-black">
                  Track Money Effortlessly
                </span>
              </div>
            </motion.div>
          </div>

          {/* Bottom Progress Bar (Subtle) */}
          <div className="absolute bottom-0 left-0 w-full h-[2px] bg-white/5">
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: "0%" }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
              className="w-full h-full bg-gradient-to-r from-transparent via-emerald-500 to-transparent opacity-50"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
