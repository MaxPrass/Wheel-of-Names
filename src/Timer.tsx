import { FC, useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { Button, colors } from './styles';

const TimerCard = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.6rem;
  margin-top: 1rem;
  padding: 1rem 1.5rem;
  background-color: #ffffff;
  border: 2px solid ${colors.lavendelgrau};
  border-radius: 12px;
  min-width: 260px;
`;

const TimeDisplay = styled.span<{ $warning: boolean; $done: boolean }>`
  font-size: 2.6rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.02em;
  line-height: 1;
  color: ${({ $warning, $done }) =>
    $warning || $done ? colors.kirsche : colors.kosmischesBlau};
`;

const ProgressTrack = styled.div`
  width: 100%;
  height: 8px;
  background-color: ${colors.lavendelgrau};
  border-radius: 999px;
  overflow: hidden;
`;

const ProgressFill = styled.div<{ $ratio: number; $warning: boolean }>`
  height: 100%;
  width: ${({ $ratio }) => Math.max(0, Math.min(1, $ratio)) * 100}%;
  background-color: ${({ $warning }) =>
    $warning ? colors.kirsche : colors.minze};
  border-radius: 999px;
  transition:
    width 300ms linear,
    background-color 300ms ease;
`;

const StatusText = styled.p`
  margin: 0;
  font-size: 0.95rem;
  font-weight: 600;
  color: ${colors.kosmischesBlau};
`;

const SmallButton = styled(Button)`
  padding: 0.45rem 0.9rem;
  font-size: 0.9rem;
  margin: 0 0.2rem;
`;

const formatTime = (totalSeconds: number) => {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

interface TimerProps {
  durationSeconds: number;
  running: boolean;
  /** Änderung dieses Werts setzt den Timer zurück. */
  resetKey: number;
  onRunningChange: (running: boolean) => void;
}

export const Timer: FC<TimerProps> = ({
  durationSeconds,
  running,
  resetKey,
  onRunningChange,
}) => {
  const [remaining, setRemaining] = useState(durationSeconds);
  const intervalRef = useRef<number | undefined>(undefined);

  // Zurücksetzen, sobald eine neue Runde beginnt
  useEffect(() => {
    setRemaining(durationSeconds);
  }, [resetKey, durationSeconds]);

  useEffect(() => {
    if (!running) return;

    intervalRef.current = window.setInterval(() => {
      setRemaining((previous) => {
        if (previous <= 1) {
          window.clearInterval(intervalRef.current);
          onRunningChange(false);
          return 0;
        }
        return previous - 1;
      });
    }, 1000);

    return () => window.clearInterval(intervalRef.current);
  }, [running, onRunningChange]);

  const isDone = remaining === 0;
  const isWarning = !isDone && remaining <= 30;
  const ratio = durationSeconds === 0 ? 0 : remaining / durationSeconds;

  const statusText = isDone
    ? 'Zeit ist um'
    : running
      ? 'Läuft'
      : remaining === durationSeconds
        ? 'Bereit'
        : 'Pausiert';

  return (
    <TimerCard>
      <TimeDisplay $warning={isWarning} $done={isDone} aria-live="polite">
        {formatTime(remaining)}
      </TimeDisplay>

      <ProgressTrack>
        <ProgressFill $ratio={ratio} $warning={isWarning || isDone} />
      </ProgressTrack>

      <StatusText>{statusText}</StatusText>

      <div>
        <SmallButton
          onClick={() => onRunningChange(!running)}
          disabled={isDone}
        >
          {running ? 'Pause' : 'Weiter'}
        </SmallButton>
        <SmallButton
          onClick={() => {
            onRunningChange(false);
            setRemaining(durationSeconds);
          }}
        >
          Zurücksetzen
        </SmallButton>
      </div>
    </TimerCard>
  );
};
