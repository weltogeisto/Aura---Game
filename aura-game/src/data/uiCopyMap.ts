export const UI_COPY_MAP = {
  release: {
    badge: 'Desktop Beta Vertical Slice',
    title: 'Aura of the 21st Century',
    subtitle: 'Louvre operations are live. One polished scenario, one shot, one verdict.',
  },
  startView: {
    overline: 'Aura / Desktop Beta',
    title: 'Louvre Entry Hall',
    body: 'You are entering the desktop beta vertical slice: a single-room, single-shot appraisal loop tuned for visual fidelity and rapid iteration.',
    ctaPrimary: 'Enter Louvre Slice',
    ctaSecondary: 'Open Main Menu',
  },
  mainMenu: {
    overline: 'Desktop Beta',
    heading: 'of the 21st Century',
    scenarioSummary: 'The beta currently ships one release-ready vertical slice while additional rooms mature in parallel.',
    ctaScenarioSelect: 'Select Scenario',
    criticFraming:
      '“The aura is no longer in the object. It is in the system that predicts your desire to destroy it.”',
  },
  scenarioSelect: {
    overline: 'Scenario Selection',
    heading: 'Choose your target room',
    availableNowLabel: 'Available now',
    availableSoonLabel: 'In maturation',
    backToMenu: '← Back to main menu',
  },
  results: {
    overline: 'Run complete',
    heading: 'Appraisal archived',
    scoreLabel: 'Total score',
    scoreFraming: 'Score reflects sampled cultural-value zones, not physical realism.',
    impactLabel: 'Impact location',
    targetLabel: 'Target',
    criticLabel: 'Critic',
    damageHeading: 'Damage breakdown',
    replayCta: 'Play again',
    newScenarioCta: 'New scenario',
  },
  hud: {
    controls: ['Move mouse to aim.', 'Use arrows or WASD for micro-adjustments.', 'Click to fire your only shot.'],
    blockedShot: 'Shot already locked for this run.',
    evaluating: 'Shot in evaluation…',
    registeredPrefix: 'Registered:',
  },
  hints: {
    gameTagline: 'One shot. One appraisal. No undo.',
    scenarioPickerHint: 'Choose your room, take the shot, live with the verdict.',
    aimingHint: 'Center your aim, then commit to the only shot.',
    shootingHint: 'Shot locked. Appraising impact…',
    resultsHint: 'Run archived. Decide what to do with the next attempt.',
  },
  limitations: {
    heading: 'Known limitations (beta honesty)',
    items: [
      'Single-shot constraint is hard-locked per run; no reload or second attempt inside the same appraisal.',
      'Scenario maturity is uneven: Louvre is production-polished, other rooms remain in content and balancing iteration.',
      'Performance tiers auto-adjust visual fidelity when sustained FPS drops; image quality may step down to preserve control responsiveness.',
    ],
  },
} as const;

export const KEY_UI_STRINGS = [
  UI_COPY_MAP.release.subtitle,
  UI_COPY_MAP.startView.body,
  UI_COPY_MAP.mainMenu.scenarioSummary,
  UI_COPY_MAP.hints.gameTagline,
  UI_COPY_MAP.hints.scenarioPickerHint,
  UI_COPY_MAP.hints.aimingHint,
  UI_COPY_MAP.hints.shootingHint,
  UI_COPY_MAP.hints.resultsHint,
  ...UI_COPY_MAP.hud.controls,
  UI_COPY_MAP.hud.blockedShot,
  UI_COPY_MAP.hud.evaluating,
  UI_COPY_MAP.results.scoreFraming,
  ...UI_COPY_MAP.limitations.items,
] as const;
