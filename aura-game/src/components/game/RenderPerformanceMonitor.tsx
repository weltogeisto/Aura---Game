import { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import {
  FPS_DEGRADATION_THRESHOLDS,
  RenderTier,
  getNextLowerTier,
} from '@/lib/renderSettings';

interface RenderPerformanceMonitorProps {
  tier: RenderTier;
  onTierChange: (tier: RenderTier) => void;
}

const SAMPLE_WINDOW_SECONDS = 0.5;
const SUSTAINED_DROP_SECONDS = 2;

export function RenderPerformanceMonitor({
  tier,
  onTierChange,
}: RenderPerformanceMonitorProps) {
  const tierRef = useRef(tier);
  const frameCountRef = useRef(0);
  const timeAccumRef = useRef(0);
  const belowThresholdTimeRef = useRef(0);

  useEffect(() => {
    tierRef.current = tier;
    belowThresholdTimeRef.current = 0;
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
    const threshold = FPS_DEGRADATION_THRESHOLDS[tierRef.current];

    if (averageFps < threshold) {
      belowThresholdTimeRef.current += timeAccumRef.current;
    } else {
      belowThresholdTimeRef.current = Math.max(
        0,
        belowThresholdTimeRef.current - timeAccumRef.current * 0.5
      );
    }

    if (
      belowThresholdTimeRef.current >= SUSTAINED_DROP_SECONDS &&
      tierRef.current !== 'low'
    ) {
      onTierChange(getNextLowerTier(tierRef.current));
      belowThresholdTimeRef.current = 0;
    }

    frameCountRef.current = 0;
    timeAccumRef.current = 0;
  });

  return null;
}
