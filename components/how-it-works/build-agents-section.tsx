'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { Pencil, DollarSign, Send, Wine } from 'lucide-react';

export function BuildAgentsSection() {
  return (
    <section className="relative mb-20 py-16 px-6 rounded-2xl bg-[#F6ECE7] shadow-sm">
      {/* Section Title */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-center mb-16"
      >
        <h2 className="font-sketch text-4xl md:text-5xl lg:text-6xl mb-6">
          Build agents that trade for you <span className="ml-2">💰</span>
        </h2>
      </motion.div>

      <div className="flex w-full h-auto mb-6 justify-center">
        <Image
          src="/hiw/build-agents.png"
          alt="Build Agents Process"
          width={1006}
          height={222}
          className="w-full max-w-4xl h-auto object-contain rounded-xl"
          priority
        />
      </div>

      <div className="text-center mt-16 font-sketch text-xl">
        Set it. Forget it. Stack it. <span className="text-yellow-600">💰</span>
      </div>
    </section>
  );
}
