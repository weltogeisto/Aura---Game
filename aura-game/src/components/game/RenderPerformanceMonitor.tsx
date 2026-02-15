import { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import {
  FPS_DEGRADATION_THRESHOLDS,
  FPS_RECOVERY_THRESHOLDS,
  getNextHigherTier,
  getNextLowerTier,
  type RenderTier,
} from '@/lib/renderSettings';

interface RenderPerformanceMonitorProps {
  tier: RenderTier;
  onTierChange: (tier: RenderTier) => void;
  onFpsSample?: (fps: number) => void;
}

const SAMPLE_WINDOW_SECONDS = 0.5;
const SUSTAINED_DROP_SECONDS = 2;
const SUSTAINED_RECOVERY_SECONDS = 4;

export function RenderPerformanceMonitor({
  tier,
  onTierChange,
  onFpsSample,
}: RenderPerformanceMonitorProps) {
  const tierRef = useRef(tier);
  const frameCountRef = useRef(0);
  const timeAccumRef = useRef(0);
  const belowThresholdTimeRef = useRef(0);
  const aboveThresholdTimeRef = useRef(0);

  useEffect(() => {
    tierRef.current = tier;
    belowThresholdTimeRef.current = 0;
    aboveThresholdTimeRef.current = 0;
    frameCountRef.current = 0;
    timeAccumRef.current = 0;
  }, [tier]);

  useFrame((_, delta) => {
    frameCountRef.current += 1;
    timeAccumRef.current += delta;

    if (timeAccumRef.current < SAMPLE_WINDOW_SECONDS) {
      return;
    }

    const averageFps = frameCountRef.current / timeAccumRef.current;
    const degradationThreshold = FPS_DEGRADATION_THRESHOLDS[tierRef.current];
    const recoveryThreshold = FPS_RECOVERY_THRESHOLDS[tierRef.current];

    onFpsSample?.(averageFps);

    if (averageFps < degradationThreshold) {
      belowThresholdTimeRef.current += timeAccumRef.current;
      aboveThresholdTimeRef.current = Math.max(0, aboveThresholdTimeRef.current - timeAccumRef.current);
    } else if (averageFps > recoveryThreshold) {
      aboveThresholdTimeRef.current += timeAccumRef.current;
      belowThresholdTimeRef.current = Math.max(0, belowThresholdTimeRef.current - timeAccumRef.current);
    } else {
      belowThresholdTimeRef.current = Math.max(0, belowThresholdTimeRef.current - timeAccumRef.current * 0.5);
      aboveThresholdTimeRef.current = Math.max(0, aboveThresholdTimeRef.current - timeAccumRef.current * 0.5);
    }

    if (belowThresholdTimeRef.current >= SUSTAINED_DROP_SECONDS && tierRef.current !== 'low') {
      const nextTier = getNextLowerTier(tierRef.current);
      tierRef.current = nextTier;
      onTierChange(nextTier);
      belowThresholdTimeRef.current = 0;
      aboveThresholdTimeRef.current = 0;
    }

    if (aboveThresholdTimeRef.current >= SUSTAINED_RECOVERY_SECONDS && tierRef.current !== 'high') {
      const nextTier = getNextHigherTier(tierRef.current);
      tierRef.current = nextTier;
      onTierChange(nextTier);
      belowThresholdTimeRef.current = 0;
      aboveThresholdTimeRef.current = 0;
    }

    frameCountRef.current = 0;
    timeAccumRef.current = 0;
  });

  return null;
}
