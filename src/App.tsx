import styled from 'styled-components';
import { useState, useMemo } from 'react';
import { Participants } from './Participants';
import { Question } from './Question';
import { Wheel } from './Wheel';
import { Header } from './Header';
import './App.css';

const Main = styled.main`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 2rem;
  padding: 2rem 1rem;
  flex-wrap: wrap;

  @media (max-width: 900px) {
    flex-direction: column;
  }
`;

const ParticipantsWrapper = styled.div`
  display: flex;
  justify-content: center;
  padding: 1rem;
`;

export const MAX_PARTICIPANTS = 18;

function App() {
  const [names, setNames] = useState<string[]>([]);
  const [drawn, setDrawn] = useState<string[]>([]);
  const [removeOnSpin, setRemoveOnSpin] = useState(true);

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

  return (
    <>
      <Header />
      <Main>
        <Question />
        <Wheel
          participants={remaining}
          onWinnerSelected={handleWinnerSelected}
          removeOnSpin={removeOnSpin}
          onToggleRemoveOnSpin={toggleRemoveOnSpin}
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
