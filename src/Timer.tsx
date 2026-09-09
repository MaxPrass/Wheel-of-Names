import styled from 'styled-components';
import { useState, useMemo, useCallback } from 'react';
import { Participants } from './Participants';
import { Question } from './Question';
import { Wheel } from './Wheel';
import { Timer } from './Timer';
import { Header } from './Header';
import './App.css';

const Main = styled.main`
  display: flex;
  justify-content: center;
  align-items: flex-start;
  gap: 2rem;
  padding: 2rem 1rem;
  flex-wrap: wrap;

  @media (max-width: 900px) {
    flex-direction: column;
    align-items: center;
  }
`;

const SideColumn = styled.div`
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 1.5rem;
  padding-top: 1rem;
  min-width: 300px;
  max-width: 360px;

  @media (max-width: 900px) {
    padding-top: 0;
    max-width: 100%;
    align-items: center;
  }
`;

const ParticipantsWrapper = styled.div`
  display: flex;
  justify-content: center;
  padding: 1rem;
`;

export const MAX_PARTICIPANTS = 18;
const TIMER_DURATION_SECONDS = 180; // 3 Minuten

function App() {
  const [names, setNames] = useState<string[]>([]);
  const [drawn, setDrawn] = useState<string[]>([]);
  const [removeOnSpin, setRemoveOnSpin] = useState(true);

  const [timerEnabled, setTimerEnabled] = useState(true);
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerResetKey, setTimerResetKey] = useState(0);

  // Verbleibende Namen: alle Namen abzüglich der bereits gezogenen
  // (duplikatsicher, da jeder gezogene Eintrag nur einmal abgezogen wird)
  const remaining = useMemo(() => {
    const pool = [...drawn];
    return names.filter((name) => {
      const hit = pool.indexOf(name);
      if (hit >= 0) {
        pool.splice(hit, 1);
        return false;
      }
      return true;
    });
  }, [names, drawn]);

  const handleAddName = (name: string) => {
    if (names.length < MAX_PARTICIPANTS) {
      setNames([...names, name]);
    }
  };

  const handleRemoveName = (index: number) => {
    setNames(names.filter((_, i) => i !== index));
  };

  const shuffleNames = () => {
    setNames([...names].sort(() => Math.random() - 0.5));
  };

  const sortNames = () => {
    setNames([...names].sort((a, b) => a.localeCompare(b, 'de')));
  };

  const handleWinnerSelected = (index: number) => {
    if (!removeOnSpin) return;
    const winner = remaining[index];
    if (winner !== undefined) {
      setDrawn((prev) => [...prev, winner]);
    }
  };

  const toggleRemoveOnSpin = () => {
    setRemoveOnSpin((value) => !value);
  };

  const resetRound = () => {
    setDrawn([]);
  };

  /** Beim Drehen laufende Zeit abbrechen und zurücksetzen. */
  const handleSpinStart = useCallback(() => {
    setTimerRunning(false);
    setTimerResetKey((key) => key + 1);
  }, []);

  /** Wird aufgerufen, sobald die Meldung „Du bist dran!“ verschwindet. */
  const handleAnnouncementFinished = useCallback(() => {
    setTimerEnabled((enabled) => {
      if (enabled) {
        setTimerResetKey((key) => key + 1);
        setTimerRunning(true);
      }
      return enabled;
    });
  }, []);

  const toggleTimerEnabled = () => {
    setTimerEnabled((enabled) => {
      if (enabled) {
        setTimerRunning(false);
      }
      return !enabled;
    });
  };

  const handleTimerRunningChange = useCallback((running: boolean) => {
    setTimerRunning(running);
  }, []);

  return (
    <>
      <Header />
      <Main>
        <SideColumn>
          <Question />
          {timerEnabled && (
            <Timer
              durationSeconds={TIMER_DURATION_SECONDS}
              running={timerRunning}
              resetKey={timerResetKey}
              onRunningChange={handleTimerRunningChange}
            />
          )}
        </SideColumn>
        <Wheel
          participants={remaining}
          onWinnerSelected={handleWinnerSelected}
          removeOnSpin={removeOnSpin}
          onToggleRemoveOnSpin={toggleRemoveOnSpin}
          timerEnabled={timerEnabled}
          onToggleTimerEnabled={toggleTimerEnabled}
          onSpinStart={handleSpinStart}
          onAnnouncementFinished={handleAnnouncementFinished}
          onResetRound={resetRound}
          allDone={remaining.length === 0 && names.length > 0}
        />
      </Main>
      <ParticipantsWrapper>
        <Participants
          handleAddName={handleAddName}
          handleRemoveName={handleRemoveName}
          shuffleNames={shuffleNames}
          sortNames={sortNames}
          names={names}
        />
      </ParticipantsWrapper>
    </>
  );
}

export default App;
