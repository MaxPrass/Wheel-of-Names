import styled from 'styled-components';

export const colors = {
  kosmischesBlau: '#36349D',
  minze: '#4DFFB0',
  kirsche: '#DB0045',
  lavendelgrau: '#E3E6F2',
};

export const Section = styled.section`
  width: 100%;
  max-width: 520px;
  margin: 0 auto;
  text-align: center;
`;

export const Button = styled.button`
  padding: 0.8rem 1.2rem;
  margin: 0.4rem;
  background-color: ${colors.kosmischesBlau};
  color: #ffffff;
  border: none;
  cursor: pointer;
  border-radius: 6px;
  font-size: 1.05rem;
  font-weight: 700;

  &:hover:not(:disabled) {
    background-color: ${colors.kirsche};
  }

  &:focus-visible {
    outline: 3px solid ${colors.minze};
    outline-offset: 2px;
  }

  &:disabled {
    background-color: #b9bcd0;
    cursor: not-allowed;
  }
`;

export const Input = styled.input`
  padding: 0.8rem;
  font-size: 1.1rem;
  margin: 0.5rem;
  width: 60%;
  border: 2px solid ${colors.kosmischesBlau};
  border-radius: 6px;
  background-color: #ffffff;
  color: ${colors.kosmischesBlau};

  &:focus-visible {
    outline: 3px solid ${colors.minze};
    outline-offset: 1px;
  }
`;
