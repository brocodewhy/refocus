"use client";

import { useEffect } from "react";
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "framer-motion";

export function AnimatedNumber({ value }: { value: number }) {
  const reducedMotion = useReducedMotion();
  const target = useMotionValue(value);
  const spring = useSpring(target, { damping: 28, stiffness: 105, mass: 0.8 });
  const display = useTransform(spring, (current) => Math.round(current).toLocaleString());

  useEffect(() => {
    if (reducedMotion) {
      spring.jump(value);
      return;
    }
    target.set(value);
  }, [reducedMotion, spring, target, value]);

  return <motion.span aria-label={value.toLocaleString()}>{display}</motion.span>;
}