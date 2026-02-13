import { Environment, Lightformer } from '@react-three/drei';
import { Color } from 'three';

interface MuseumLightingProps {
  scenarioId: string;
}

interface ScenarioLightingConfig {
  skylightIntensity: number;
  skylightTemperature: number;
  bounceIntensity: number;
  bounceTemperature: number;
  accentIntensity: number;
  accentTemperature: number;
  ambientIntensity: number;
  shadowSoftness: number;
}

const DEFAULT_LIGHTING_CONFIG: ScenarioLightingConfig = {
  skylightIntensity: 1.4,
  skylightTemperature: 6700,
  bounceIntensity: 0.65,
  bounceTemperature: 3200,
  accentIntensity: 0.45,
  accentTemperature: 4300,
  ambientIntensity: 0.12,
  shadowSoftness: 2.8,
};

const SCENARIO_LIGHTING_CONFIG: Record<string, Partial<ScenarioLightingConfig>> = {
  louvre: {
    skylightIntensity: 1.55,
    bounceIntensity: 0.75,
    accentIntensity: 0.5,
    shadowSoftness: 3.2,
  },
  hermitage: {
    skylightTemperature: 6100,
    bounceTemperature: 2900,
    accentIntensity: 0.55,
    shadowSoftness: 3.5,
  },
  tsmc: {
    skylightTemperature: 7600,
    bounceTemperature: 4100,
    ambientIntensity: 0.08,
    shadowSoftness: 2.2,
  },
  moma: {
    skylightIntensity: 1.35,
    bounceIntensity: 0.55,
    accentTemperature: 5000,
  },
};

const toRgbChannel = (value: number) => Math.min(255, Math.max(0, value));

function kelvinToColor(temperature: number) {
  const temp = temperature / 100;

  const red =
    temp <= 66
      ? 255
      : 329.698727446 * Math.pow(temp - 60, -0.1332047592);

  const green =
    temp <= 66
      ? 99.4708025861 * Math.log(temp) - 161.1195681661
      : 288.1221695283 * Math.pow(temp - 60, -0.0755148492);

  const blue =
    temp >= 66
      ? 255
      : temp <= 19
        ? 0
        : 138.5177312231 * Math.log(temp - 10) - 305.0447927307;

  return new Color(`rgb(${toRgbChannel(red)}, ${toRgbChannel(green)}, ${toRgbChannel(blue)})`);
}

export function MuseumLighting({ scenarioId }: MuseumLightingProps) {
  const config = {
    ...DEFAULT_LIGHTING_CONFIG,
    ...SCENARIO_LIGHTING_CONFIG[scenarioId],
  };

  const skylightColor = kelvinToColor(config.skylightTemperature);
  const bounceColor = kelvinToColor(config.bounceTemperature);
  const accentColor = kelvinToColor(config.accentTemperature);

  return (
    <group>
      <Environment resolution={256}>
        <Lightformer
          form="rect"
          intensity={config.skylightIntensity * 2.2}
          color={skylightColor}
          scale={[40, 16, 1]}
          position={[0, 12, -4]}
          target={[0, 0, 0]}
        />
        <Lightformer
          form="rect"
          intensity={config.bounceIntensity * 1.6}
          color={bounceColor}
          scale={[30, 6, 1]}
          position={[0, 2, 12]}
          target={[0, 1, 0]}
        />
      </Environment>

      <ambientLight intensity={config.ambientIntensity} color={skylightColor} />

      <directionalLight
        castShadow
        position={[0, 12, 0]}
        intensity={config.skylightIntensity}
        color={skylightColor}
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-bias={-0.00015}
        shadow-normalBias={0.015}
        shadow-radius={config.shadowSoftness}
        shadow-camera-left={-16}
        shadow-camera-right={16}
        shadow-camera-top={16}
        shadow-camera-bottom={-16}
        shadow-camera-near={1}
        shadow-camera-far={36}
      />

      <hemisphereLight args={[bounceColor, 0x2a1b14, config.bounceIntensity]} />

      <spotLight
        position={[7, 4, 8]}
        angle={0.38}
        penumbra={0.9}
        decay={2}
        distance={28}
        intensity={config.accentIntensity}
        color={accentColor}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-bias={-0.0001}
        shadow-radius={config.shadowSoftness + 1}
      />
      <spotLight
        position={[-7, 4, 8]}
        angle={0.4}
        penumbra={0.92}
        decay={2}
        distance={28}
        intensity={config.accentIntensity * 0.9}
        color={accentColor}
      />
    </group>
  );
}
