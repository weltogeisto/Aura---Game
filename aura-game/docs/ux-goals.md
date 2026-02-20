# UX Goals (Beta Vertical Slice)

## Messbare Ziele

1. **Time-to-first-shot ≤ 12s (Median)**
   - Messung: `runTelemetry.firstShotAt - runTelemetry.runStartedAt`.
2. **Verständnis der Score-Logik ≥ 85%**
   - Proxy in-app: `scoreBreakdownViewed === true` nachdem Results geöffnet wurden.
3. **Replay-Nutzung ≥ 35%**
   - Proxy in-app: `runTelemetry.replayUsed === true` beim Neustart derselben Scenario.

## Sichtbarkeit im Produkt

- Results-Screen zeigt den Score-Pfad als **Treffer → Modifier → Final Score**.
- Results-Screen zeigt aktuelle Run-Metriken gegen Zielwerte als direkte UX-Qualitätsanzeige.

## Iterations-Loop

- Bei Verfehlung von Ziel 1: Einstieg vereinfachen (HUD-Hinweise, stärkere visuelle Führung).
- Bei Verfehlung von Ziel 2: Score-Formel prominenter erklären, Begriffe vereinheitlichen.
- Bei Verfehlung von Ziel 3: klareres Replay-Value-Propositioning und schnellerer Restart.
