import { FC } from 'react';
import styled from 'styled-components';
import { colors } from './styles';

const QuestionsContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 1.2rem;
  padding: 1.5rem;
  min-width: 260px;
  max-width: 340px;
  text-align: left;

  @media (max-width: 900px) {
    max-width: 100%;
    text-align: center;
    align-items: center;
  }
`;

const QuestionsTitle = styled.h2`
  font-size: 1.6rem;
  font-weight: 700;
  color: ${colors.kosmischesBlau};
  margin: 0;
`;

const QuestionLine = styled.p`
  font-size: 1.25rem;
  font-weight: 600;
  color: ${colors.kosmischesBlau};
  margin: 0;
`;

export const Question: FC = () => (
  <QuestionsContainer>
    <QuestionsTitle>Standup</QuestionsTitle>
    <QuestionLine>1. Was habe ich seit Montag gemacht?</QuestionLine>
    <QuestionLine>2. Was werde ich bis Freitag tun?</QuestionLine>
    <QuestionLine>3. Was hält mich auf?</QuestionLine>
  </QuestionsContainer>
);
