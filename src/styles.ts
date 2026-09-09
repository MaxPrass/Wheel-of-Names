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

/* ---------- Checkbox ---------- */

export const CheckboxLabel = styled.label`
  display: inline-flex;
  align-items: center;
  gap: 0.7rem;
  padding: 0.6rem 1rem;
  background-color: #ffffff;
  border: 2px solid ${colors.lavendelgrau};
  border-radius: 999px;
  color: ${colors.kosmischesBlau};
  font-size: 0.98rem;
  font-weight: 600;
  cursor: pointer;
  user-select: none;
  transition:
    border-color 160ms ease,
    box-shadow 160ms ease;

  &:hover {
    border-color: ${colors.kosmischesBlau};
  }

  &:focus-within {
    border-color: ${colors.kosmischesBlau};
    box-shadow: 0 0 0 3px rgba(77, 255, 176, 0.6);
  }
`;

export const Checkbox = styled.input.attrs({ type: 'checkbox' })`
  appearance: none;
  -webkit-appearance: none;
  flex: 0 0 auto;
  width: 22px;
  height: 22px;
  margin: 0;
  border: 2px solid ${colors.kosmischesBlau};
  border-radius: 6px;
  background-color: #ffffff;
  cursor: pointer;
  position: relative;
  transition:
    background-color 160ms ease,
    border-color 160ms ease;

  &::after {
    content: '';
    position: absolute;
    top: 3px;
    left: 6px;
    width: 5px;
    height: 10px;
    border-right: 2.5px solid ${colors.kosmischesBlau};
    border-bottom: 2.5px solid ${colors.kosmischesBlau};
    transform: rotate(45deg) scale(0);
    transform-origin: center;
    transition: transform 160ms ease;
  }

  &:checked {
    background-color: ${colors.kosmischesBlau};
    border-color: ${colors.kosmischesBlau};
  }

  &:checked::after {
    border-right-color: ${colors.minze};
    border-bottom-color: ${colors.minze};
    transform: rotate(45deg) scale(1);
  }

  &:focus-visible {
    outline: none;
  }
`;
