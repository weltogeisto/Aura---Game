export type RenderTier = 'low' | 'medium' | 'high';

export interface RenderSettings {
  dpr: number;
  postprocessing: boolean;
  textureSize: number;
}

export const DEFAULT_RENDER_TIER: RenderTier = 'high';

export const RENDER_TIER_SETTINGS: Record<RenderTier, RenderSettings> = {
  low: {
    dpr: 1,
    postprocessing: false,
    textureSize: 256,
  },
  medium: {
    dpr: 1.5,
    postprocessing: true,
    textureSize: 512,
  },
  high: {
    dpr: 2,
    postprocessing: true,
    textureSize: 1024,
  },
};

export const FPS_DEGRADATION_THRESHOLDS: Record<RenderTier, number> = {
  high: 50,
  medium: 40,
  low: 0,
};

export const getNextLowerTier = (tier: RenderTier): RenderTier => {
  if (tier === 'high') {
    return 'medium';
  }

  if (tier === 'medium') {
    return 'low';
  }

  return 'low';
};
