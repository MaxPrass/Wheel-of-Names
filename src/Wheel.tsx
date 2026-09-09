import React, { useRef, useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import styled from 'styled-components';

import { capitalize } from './utils';
import { Button, colors } from './styles';

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

const OptionsRow = styled.label`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 1rem;
  color: ${colors.kosmischesBlau};
  font-size: 1rem;
  cursor: pointer;
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

const palette = [
  { bg: colors.kosmischesBlau, text: '#FFFFFF' },
  { bg: colors.minze, text: '#0F2E22' },
  { bg: colors.kirsche, text: '#FFFFFF' },
  { bg: colors.lavendelgrau, text: colors.kosmischesBlau },
];

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

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const numSectors = participants.length;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (numSectors === 0) {
      ctx.save();
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(canvas.width / 2, canvas.height / 2, canvas.width / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      return;
    }

    drawWheel(ctx, canvas);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [participants, rotation]);

  const drawWheel = (
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
  ) => {
    const radius = canvas.width / 2;
    const sliceAngle = (2 * Math.PI) / numSectors;

    ctx.save();
    ctx.translate(radius, radius);
    ctx.rotate(-rotation * (Math.PI / 180));

    for (let i = 0; i < numSectors; i++) {
      const startAngle = i * sliceAngle;
      const endAngle = (i + 1) * sliceAngle;
      const sector = palette[i % palette.length];

      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, radius, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = sector.bg;
      ctx.fill();

      ctx.save();
      ctx.rotate((startAngle + endAngle) / 2);
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = sector.text;
      ctx.font = '600 16px "Open Sans", Arial, sans-serif';
      ctx.fillText(capitalize(participants[i]) || '', radius * 0.55, 0);
      ctx.restore();
    }

    ctx.restore();

    // Statischer Zeiger am rechten Rand
    const indicatorLength = 22;
    const indicatorWidth = 12;
    ctx.save();
    ctx.translate(canvas.width, canvas.height / 2);
    ctx.beginPath();
    ctx.moveTo(-indicatorLength, -indicatorWidth / 2);
    ctx.lineTo(0, -indicatorWidth / 2);
    ctx.lineTo(0, indicatorWidth / 2);
    ctx.lineTo(-indicatorLength, indicatorWidth / 2);
    ctx.closePath();
    ctx.fillStyle = colors.kirsche;
    ctx.fill();
    ctx.restore();
  };

  const startSpin = () => {
    if (spinning || numSectors === 0) return;
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

  useEffect(() => {
    if (!showPopup) return;

    confetti({
      particleCount: 120,
      spread: 75,
      origin: { y: 0.6 },
      colors: [colors.kosmischesBlau, colors.minze, colors.kirsche],
    });

    const timer = setTimeout(() => setShowPopup(false), 5000);
    return () => clearTimeout(timer);
  }, [showPopup]);

  return (
    <WheelContainer>
      <canvas
        ref={canvasRef}
        width={400}
        height={400}
        style={{
          borderRadius: '50%',
          border: `3px solid ${colors.kosmischesBlau}`,
          maxWidth: '100%',
          height: 'auto',
        }}
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

      <OptionsRow>
        <input
          type="checkbox"
          checked={removeOnSpin}
          onChange={onToggleRemoveOnSpin}
        />
        Ausgewählte Person aus dem Rad entfernen
      </OptionsRow>

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
