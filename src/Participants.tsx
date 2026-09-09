import styled from 'styled-components';
import { Section, Button, Input, colors } from './styles';
import { FC, useState, KeyboardEvent } from 'react';
import { MAX_PARTICIPANTS } from './App';
import { capitalize } from './utils';

const ListItemContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.5rem;
`;

const ListItem = styled.li`
  flex: 1;
  padding: 0.7rem 1rem;
  margin: 0.3rem 0;
  background-color: #ffffff;
  border-radius: 6px;
  list-style: none;
  color: ${colors.kosmischesBlau};
  font-weight: 600;
  font-size: 1rem;
  text-align: left;
`;

const List = styled.ul`
  padding: 0;
  margin: 0;
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 0.5rem;
`;

const SectionTitle = styled.h2`
  color: ${colors.kosmischesBlau};
  font-size: 1.3rem;
  margin-bottom: 0.5rem;
`;

const ErrorMessage = styled.p`
  color: ${colors.kirsche};
  font-weight: 600;
  margin: 0.3rem 0;
`;

interface ParticipantsProps {
  handleAddName: (name: string) => void;
  handleRemoveName: (index: number) => void;
  shuffleNames: () => void;
  sortNames: () => void;
  names: string[];
}

export const Participants: FC<ParticipantsProps> = ({
  handleAddName,
  handleRemoveName,
  shuffleNames,
  sortNames,
  names,
}) => {
  const [participant, setParticipant] = useState('');
  const [error, setError] = useState('');

  const isMaxParticipantsReached = names.length >= MAX_PARTICIPANTS;
  const hasParticipants = names.length > 0;

  const validateInput = (name: string) => {
    const specialCharPattern = /[^a-zA-ZäöüÄÖÜß0-9 -]/;
    if (!name.trim()) {
      return 'Bitte einen Namen eingeben.';
    }
    if (specialCharPattern.test(name)) {
      return 'Der Name darf keine Sonderzeichen enthalten.';
    }
    return '';
  };

  const handleAddParticipant = () => {
    const validationError = validateInput(participant);
    if (validationError) {
      setError(validationError);
      return;
    }
    handleAddName(participant.trim());
    setParticipant('');
    setError('');
  };

  return (
    <Section>
      <SectionTitle>Teilnehmende hinzufügen</SectionTitle>
      <Input
        type="text"
        placeholder="Name eingeben"
        value={participant}
        onChange={(e) => setParticipant(e.target.value)}
        onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
          if (e.key === 'Enter') {
            handleAddParticipant();
          }
        }}
      />
      <Button
        onClick={handleAddParticipant}
        disabled={isMaxParticipantsReached}
      >
        Hinzufügen
      </Button>

      {error && <ErrorMessage>{error}</ErrorMessage>}
      {isMaxParticipantsReached && (
        <ErrorMessage>
          Maximale Anzahl an Teilnehmenden erreicht.
        </ErrorMessage>
      )}

      <SectionTitle>Teilnehmende</SectionTitle>
      <ButtonGroup>
        <Button onClick={shuffleNames} disabled={!hasParticipants}>
          Mischen
        </Button>
        <Button onClick={sortNames} disabled={!hasParticipants}>
          Sortieren
        </Button>
      </ButtonGroup>

      <List>
        {names.map((name, index) => (
          <ListItemContainer key={`${name}-${index}`}>
            <ListItem>{capitalize(name)}</ListItem>
            <Button onClick={() => handleRemoveName(index)}>Entfernen</Button>
          </ListItemContainer>
        ))}
      </List>
    </Section>
  );
};
