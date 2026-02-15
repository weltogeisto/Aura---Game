export type RenderTier = 'low' | 'medium' | 'high';

export interface RenderPostprocessingSettings {
  enabled: boolean;
  multisampling: number;
  noiseOpacity: number;
  vignetteDarkness: number;
}

export interface RenderSettings {
  dpr: number;
  textureSize: number;
  antialias: boolean;
  postprocessing: RenderPostprocessingSettings;
}

export const DEFAULT_RENDER_TIER: RenderTier = 'high';

export const RENDER_TIER_SETTINGS: Record<RenderTier, RenderSettings> = {
  low: {
    dpr: 1,
    textureSize: 384,
    antialias: false,
    postprocessing: {
      enabled: false,
      multisampling: 0,
      noiseOpacity: 0,
      vignetteDarkness: 0,
    },
  },
  medium: {
    dpr: 1.25,
    textureSize: 768,
    antialias: true,
    postprocessing: {
      enabled: true,
      multisampling: 2,
      noiseOpacity: 0.015,
      vignetteDarkness: 0.24,
    },
  },
  high: {
    dpr: 1.75,
    textureSize: 1024,
    antialias: true,
    postprocessing: {
      enabled: true,
      multisampling: 4,
      noiseOpacity: 0.02,
      vignetteDarkness: 0.3,
    },
  },
};

export const FPS_DEGRADATION_THRESHOLDS: Record<RenderTier, number> = {
  high: 52,
  medium: 43,
  low: 0,
};

export const FPS_RECOVERY_THRESHOLDS: Record<RenderTier, number> = {
  high: Number.POSITIVE_INFINITY,
  medium: 56,
  low: 50,
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

export const getNextHigherTier = (tier: RenderTier): RenderTier => {
  if (tier === 'low') {
    return 'medium';
  }

  if (tier === 'medium') {
    return 'high';
  }

  return 'high';
};
