# Scenario Definition of Done (DoD)

Ein Szenario darf nur dann auf `playable` gesetzt werden, wenn **alle** Exit-Kriterien erfüllt sind und die automatischen Checks grün sind.

## Exit-Kriterien
- **Gameplay:** Treffer-Feedback klar lesbar (Hit/Miss/Impact), One-Shot-Loop stabil, keine Blocker bei Zieltreffern.
- **Score-Balance:** Score-Spread zwischen High-Value-Target, normalen Targets und Easter-Eggs ist nachvollziehbar und reproduzierbar.
- **Copy:** Intro-/Location-Copy sitzt, Critic-Lines haben Qualität (low/mid/high, keine Placeholder, tonal konsistent).
- **Art:** Panorama + Color-Grading final genug für Release-Welle, Targets sind klar identifizierbar.
- **Audio:** Shot-/Impact-/Ambience-Layer geben direktes Feedback und überdecken keine Kernsignale.
- **QA:** Contract-Tests, `scenarios:check` und Kern-Regressionen sind erfolgreich.

## Kritische Validierungen
- **Treffer-Feedback:** sichtbares und konsistentes Feedback bei Hit/Miss inkl. UI-Rückmeldung.
- **Score-Balance:** kein einzelnes Ziel dominiert unbeabsichtigt den gesamten Score ohne Design-Intent.
- **Critic-Line-Qualität:** jede Score-Stufe (`low`, `mid`, `high`) enthält mind. eine finale, spielbare Zeile.
- **Easter-Egg-Validierung:** Sonderziele sind deterministisch (beabsichtigter Effekt, keine zufälligen Ausreißer im Gesamtscore).

## Rollout-Wellen (priorisiert nach Content-Fertigkeitsgrad)
- **Welle 1 (playable):** `louvre`, `st-peters`, `topkapi`
- **Welle 2 (prototype, next-up):** `tsmc`, `hermitage`, `moma`
- **Welle 3 (locked, später):** `forbidden-city`, `federal-reserve`, `borges-library`

Regel: Ein Szenario darf nur in die nächste Welle aufsteigen, wenn alle offenen Exit-Kriterien der aktuellen Stufe geschlossen sind.
