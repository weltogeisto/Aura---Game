import { EffectComposer, Noise, Vignette } from '@react-three/postprocessing';
import type { RenderPostprocessingSettings } from '@/lib/renderSettings';

interface RenderPostProcessingProps {
  settings: RenderPostprocessingSettings;
}

export function RenderPostProcessing({ settings }: RenderPostProcessingProps) {
  if (!settings.enabled) {
    return null;
  }

  return (
    <EffectComposer multisampling={settings.multisampling}>
      <Noise premultiply opacity={settings.noiseOpacity} />
      <Vignette eskil={false} offset={0.22} darkness={settings.vignetteDarkness} />
    </EffectComposer>
  );
}
