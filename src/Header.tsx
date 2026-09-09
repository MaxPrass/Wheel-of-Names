import { FC } from 'react';
import styled from 'styled-components';
import { colors } from './styles';

const HeaderContainer = styled.header`
  background-color: ${colors.kosmischesBlau};
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem 1rem;
  text-align: center;
`;

const Title = styled.h1`
  margin: 0;
  color: #ffffff;
  font-size: clamp(1.4rem, 3vw, 2.2rem);
  font-weight: 700;
`;

export const Header: FC = () => (
  <HeaderContainer>
    <Title>Namensrad des „Souveränen Arbeitsplatz“</Title>
  </HeaderContainer>
);
