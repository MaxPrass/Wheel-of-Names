import React, { useRef, useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import styled from 'styled-components';

import { capitalize } from './utils';
import { Button, Checkbox, CheckboxLabel, colors } from './styles';
import { Timer } from './Timer';

const Popup = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: #ffffff;
  color: ${colors.kosmischesBlau};
  padding: 1rem 2.5rem;
  border-radius: 10px;
  border: 3px solid ${colors.minze};
  box-shadow: 0 8px 24px rgba(54, 52, 157, 0.35);
  text-align: center;
  z-index: 1000;
  animation: popin 0.6s ease-out;

  @keyframes popin {
    0% {
      opacity: 0;
      transform: translate(-50%, -50%) scale(0.5);
    }
    100% {
      opacity: 1;
      transform: translate(-50%, -50%) scale(1);
    }
  }
`;

const WheelContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem;
`;

const ButtonsContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 1rem;
  flex-wrap: wrap;
`;

const OptionsContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.6rem;
  margin-top: 1.2rem;
`;

const AllDoneMessage = styled.p`
  text-align: center;
  font-weight: 700;
  font-size: 1.1rem;
  color: ${colors.kirsche};
  margin: 1rem 0 0;
`;

const EmptyHint = styled.p`
  color: ${colors.kosmischesBlau};
  font-size: 1rem;
  margin: 1rem 0 0;
`;

interface Props {
  participants: string[];
  onWinnerSelected: (index: number) => void;
  removeOnSpin: boolean;
  onToggleRemoveOnSpin: () => void;
  onResetRound: () => void;
  allDone: boolean;
}

/* ---------- Farblogik ---------- */

const hexToRgb = (hex: string) => ({
  r: parseInt(hex.slice(1, 3), 16),
  g: parseInt(hex.slice(3, 5), 16),
  b: parseInt(hex.slice(5, 7), 16),
});

const toHex = (value: number) =>
  Math.round(Math.min(255, Math.max(0, value)))
    .toString(16)
    .padStart(2, '0');

/** Mischt zwei Markenfarben im angegebenen Verhältnis. */
const mix = (hexA: string, hexB: string, ratio = 0.5) => {
  const a = hexToRgb(hexA);
  const b = hexToRgb(hexB);
  const r = a.r + (b.r - a.r) * ratio;
  const g = a.g + (b.g - a.g) * ratio;
  const bl = a.b + (b.b - a.b) * ratio;
  return `#${toHex(r)}${toHex(g)}${toHex(bl)}`;
};

/** Wählt Schwarz oder Weiß je nach Helligkeit des Untergrunds. */
const textColorFor = (hex: string) => {
  const { r, g, b } = hexToRgb(hex);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.6 ? '#12123A' : '#FFFFFF';
};

const { kosmischesBlau, minze, kirsche, lavendelgrau } = colors;

/**
 * Reihenfolge bewusst so gesetzt, dass sich benachbarte Sektoren
 * in Helligkeit UND Farbton unterscheiden: kräftig, hell, kräftig, hell ...
 */
const wheelPalette = [
  kosmischesBlau,
  minze,
  kirsche,
  lavendelgrau,
  mix(kosmischesBlau, kirsche), // Aubergine
  mix(minze, lavendelgrau), // Pastellminze
  mix(kirsche, lavendelgrau, 0.45), // Altrosa
  mix(kosmischesBlau, minze), // Petrol
  mix(kirsche, minze, 0.35), // Koralle
  mix(kosmischesBlau, lavendelgrau, 0.6), // Taubenblau
];

/**
 * Weist jedem Sektor eine Farbe zu und stellt sicher, dass weder
 * direkte Nachbarn noch der letzte und erste Sektor gleich sind.
 */
const buildSectorColors = (count: number) => {
  const result: string[] = [];

  for (let i = 0; i < count; i++) {
    let color = wheelPalette[i % wheelPalette.length];
    const previous = result[i - 1];
    const isLast = i === count - 1;

    if (color === previous || (isLast && color === result[0])) {
      const alternative = wheelPalette.find(
        (candidate) =>
          candidate !== previous && !(isLast && candidate === result[0]),
      );
      if (alternative) color = alternative;
    }

    result.push(color);
  }

  return result;
};

/* ---------- Geometrie & Timer ---------- */

const CANVAS_WIDTH = 460;
const CANVAS_HEIGHT = 420;
const CENTER_X = 205;
const CENTER_Y = CANVAS_HEIGHT / 2;
const RADIUS = 196;

const TIMER_DURATION_SECONDS = 180; // 3 Minuten
const POPUP_VISIBLE_MS = 5000;

export const Wheel: React.FC<Props> = ({
  participants,
  onWinnerSelected,
  removeOnSpin,
  onToggleRemoveOnSpin,
  onResetRound,
  allDone,
}) => {
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [spinDirection, setSpinDirection] = useState<
    'clockwise' | 'counterclockwise'
  >('clockwise');
  const [showPopup, setShowPopup] = useState(false);
  const [popupWinner, setPopupWinner] = useState<string | null>(null);

  const [timerEnabled, setTimerEnabled] = useState(true);
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerResetKey, setTimerResetKey] = useState(0);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const numSectors = participants.length;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (numSectors === 0) {
      drawEmptyWheel(ctx);
    } else {
      drawSectors(ctx);
    }

    drawPointer(ctx);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [participants, rotation]);

  const drawEmptyWheel = (ctx: CanvasRenderingContext2D) => {
    ctx.save();
    ctx.beginPath();
    ctx.arc(CENTER_X, CENTER_Y, RADIUS, 0, Math.PI * 2);
    ctx.fillStyle = '#FFFFFF';
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = kosmischesBlau;
    ctx.stroke();
    ctx.restore();
  };

  const drawSectors = (ctx: CanvasRenderingContext2D) => {
    const sliceAngle = (2 * Math.PI) / numSectors;
    const sectorColors = buildSectorColors(numSectors);

    ctx.save();
    ctx.translate(CENTER_X, CENTER_Y);
    ctx.rotate(-rotation * (Math.PI / 180));

    for (let i = 0; i < numSectors; i++) {
      const startAngle = i * sliceAngle;
      const endAngle = (i + 1) * sliceAngle;
      const background = sectorColors[i];

      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, RADIUS, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = background;
      ctx.fill();

      // Feine Trennlinie, damit Sektorgrenzen immer sichtbar bleiben
      ctx.lineWidth = 1;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.55)';
      ctx.stroke();

      ctx.save();
      ctx.rotate((startAngle + endAngle) / 2);
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = textColorFor(background);
      ctx.font = '600 16px "Open Sans", Arial, sans-serif';
      ctx.fillText(capitalize(participants[i]) || '', RADIUS * 0.55, 0);
      ctx.restore();
    }

    ctx.restore();

    // Außenring
    ctx.save();
    ctx.beginPath();
    ctx.arc(CENTER_X, CENTER_Y, RADIUS, 0, Math.PI * 2);
    ctx.lineWidth = 3;
    ctx.strokeStyle = kosmischesBlau;
    ctx.stroke();
    ctx.restore();
  };

  /** Dreieckiger Zeiger am rechten Rand, Spitze nach innen, mit weißem Rand. */
  const drawPointer = (ctx: CanvasRenderingContext2D) => {
    const tipX = CENTER_X + RADIUS - 14;
    const baseX = CENTER_X + RADIUS + 26;
    const halfHeight = 17;

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(tipX, CENTER_Y);
    ctx.lineTo(baseX, CENTER_Y - halfHeight);
    ctx.lineTo(baseX, CENTER_Y + halfHeight);
    ctx.closePath();

    ctx.shadowColor = 'rgba(18, 18, 58, 0.35)';
    ctx.shadowBlur = 6;
    ctx.shadowOffsetX = 1;
    ctx.fillStyle = kirsche;
    ctx.fill();

    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.lineWidth = 4;
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#FFFFFF';
    ctx.stroke();
    ctx.restore();
  };

  const startSpin = () => {
    if (spinning || numSectors === 0) return;

    // Laufenden Timer abbrechen und zurücksetzen
    setTimerRunning(false);
    setTimerResetKey((key) => key + 1);

    setSpinning(true);

    const numFullRotations = Math.random() * 5 + 5;
    const totalRotation = numFullRotations * 360;
    const direction = spinDirection === 'clockwise' ? -1 : 1;
    const finalRotation = (rotation + direction * totalRotation) % 360;

    const spinDuration = 6000;
    const easing = (t: number) => 1 - Math.pow(1 - t, 3);

    let startTime: number | undefined;

    const animate = (time: number) => {
      if (startTime === undefined) startTime = time;
      const elapsed = time - startTime;
      const t = Math.min(elapsed / spinDuration, 1);
      const currentRotation = rotation + direction * totalRotation * easing(t);

      setRotation(currentRotation);

      if (elapsed < spinDuration) {
        requestAnimationFrame(animate);
      } else {
        setSpinning(false);
        determineWinner(finalRotation);
      }
    };

    requestAnimationFrame(animate);
  };

  const determineWinner = (finalRotation: number) => {
    const sliceAngle = 360 / numSectors;
    const normalizedRotation = ((finalRotation % 360) + 360) % 360;
    const winningSector = Math.min(
      Math.floor(normalizedRotation / sliceAngle),
      numSectors - 1,
    );

    setPopupWinner(participants[winningSector]);
    setShowPopup(true);
    onWinnerSelected(winningSector);
  };

  const changeSpinDirection = () => {
    setSpinDirection(
      spinDirection === 'clockwise' ? 'counterclockwise' : 'clockwise',
    );
  };

  // Konfetti zeigen, Popup ausblenden und danach den Timer starten
  useEffect(() => {
    if (!showPopup) return;

    confetti({
      particleCount: 120,
      spread: 75,
      origin: { y: 0.6 },
      colors: [kosmischesBlau, minze, kirsche],
    });

    const timeout = setTimeout(() => {
      setShowPopup(false);
      if (timerEnabled) {
        setTimerResetKey((key) => key + 1);
        setTimerRunning(true);
      }
    }, POPUP_VISIBLE_MS);

    return () => clearTimeout(timeout);
  }, [showPopup, timerEnabled]);

  const handleTimerRunningChange = useCallback((running: boolean) => {
    setTimerRunning(running);
  }, []);

  const handleToggleTimer = () => {
    setTimerEnabled((enabled) => {
      if (enabled) {
        // Timer wird abgeschaltet: laufende Zeit stoppen
        setTimerRunning(false);
      }
      return !enabled;
    });
  };

  return (
    <WheelContainer>
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        style={{ maxWidth: '100%', height: 'auto' }}
      />

      <ButtonsContainer>
        <Button
          onClick={changeSpinDirection}
          disabled={numSectors === 0 || spinning}
        >
          {spinDirection === 'clockwise'
            ? 'Im Uhrzeigersinn'
            : 'Gegen den Uhrzeigersinn'}
        </Button>
        <Button onClick={startSpin} disabled={numSectors === 0 || spinning}>
          Drehen
        </Button>
      </ButtonsContainer>

      <OptionsContainer>
        <CheckboxLabel>
          <Checkbox checked={removeOnSpin} onChange={onToggleRemoveOnSpin} />
          Ausgewählte Person aus dem Rad entfernen
        </CheckboxLabel>

        <CheckboxLabel>
          <Checkbox checked={timerEnabled} onChange={handleToggleTimer} />
          Timer über 3 Minuten nach der Auswahl starten
        </CheckboxLabel>
      </OptionsContainer>

      {timerEnabled && (
        <Timer
          durationSeconds={TIMER_DURATION_SECONDS}
          running={timerRunning}
          resetKey={timerResetKey}
          onRunningChange={handleTimerRunningChange}
        />
      )}

      {allDone && (
        <>
          <AllDoneMessage>Alle waren dran!</AllDoneMessage>
          <ButtonsContainer>
            <Button onClick={onResetRound}>Neue Runde starten</Button>
          </ButtonsContainer>
        </>
      )}

      {!allDone && numSectors === 0 && (
        <EmptyHint>Bitte unten Teilnehmende hinzufügen.</EmptyHint>
      )}

      {showPopup && popupWinner && (
        <Popup>
          <h2>Du bist dran!</h2>
          <h3>{capitalize(popupWinner)}</h3>
        </Popup>
      )}
    </WheelContainer>
  );
};
