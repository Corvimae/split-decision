import React, { useCallback } from 'react';
import styled, { createGlobalStyle } from 'styled-components';
import { SiteConfig } from '../utils/siteConfig';

export const GlobalStyle = createGlobalStyle`
  body {
    background-color: ${SiteConfig.colors.primary};
  }  
`;

export const TextButton = styled.button`
  margin: 0;
  padding: 0;
  border: none;
  font-family: inherit;
  font-size: inherit;
  background: transparent;
  color: ${SiteConfig.colors.accents.link};
  text-decoration: underline;
  transition: color 100ms ease-in;
  cursor: pointer;

  &:hover,
  &:active {
    color: ${SiteConfig.colors.accents.alert};
  }
`;

export const Anchor = styled.a`
  color: ${SiteConfig.colors.accents.link};
  text-decoration: underline;
  transition: color 100ms ease-in;
  cursor: pointer;

  &:hover,
  &:active {
    color: ${SiteConfig.colors.accents.alert};
  }
`;

export const FormItem = styled.div`
  display: flex;
  flex-direction: column;

  & + & {
    margin-top: 0.75rem;
  }
`;

export const Label = styled.label`
  margin-bottom: 0.125rem;
`;

const InputControlContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const TextInputControl = styled.input<{ hasError: boolean }>`
  font-size: 1rem;
  font-family: inherit;
  background-color: #fff;
  color: #000;
  border: 1px solid ${({ hasError }) => hasError ? SiteConfig.colors.error.text : SiteConfig.colors.accents.control};
  border-radius: 0.25rem;
  padding: 0.5rem;
`;

const TextAreaInputControl = styled.textarea<{ hasError: boolean }>`
  font-size: 1rem;
  font-family: inherit;
  height: 10rem;
  background-color: #fff;
  color: #000;
  border: 1px solid ${({ hasError }) => hasError ? SiteConfig.colors.error.text : SiteConfig.colors.accents.control};
  border-radius: 0.25rem;
  padding: 0.5rem;
  resize: vertical;
`;

const SelectInputControl = styled.select<{ hasError: boolean }>`
  font-size: 1rem;
  font-family: inherit;
  background-color: #fff;
  color: #000;
  border: 1px solid ${({ hasError }) => hasError ? SiteConfig.colors.error.text : SiteConfig.colors.accents.control};
  border-radius: 0.25rem;
  padding: 0.5rem;
`;

const InputError = styled.p`
  margin: 0.25rem 0 0;
  color: ${SiteConfig.colors.error.text};
  font-size: 1rem;
`;

const HelpText = styled.p`
  margin: 0.5rem 0 0;
  color: ${SiteConfig.colors.text.light};
  font-style: italic;
  font-size: 1rem;
`;

interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string | null;
  helpText?: string | null;
}

export const TextInput: React.FC<TextInputProps> = ({ error, helpText, ...inputProps }) => (
  <InputControlContainer>
    <TextInputControl hasError={error !== null && error !== undefined} {...inputProps} />
    {helpText && <HelpText>{helpText}</HelpText>}
    {error && <InputError>{error}</InputError>}
  </InputControlContainer>
);

interface TextAreaInputProps extends React.InputHTMLAttributes<HTMLTextAreaElement> {
  error?: string | null;
  helpText?: string | null;
}

export const TextAreaInput: React.FC<TextAreaInputProps> = ({ error, helpText, ...inputProps }) => (
  <InputControlContainer>
    <TextAreaInputControl hasError={error !== null && error !== undefined} {...inputProps} />
    {helpText && <HelpText>{helpText}</HelpText>}
    {error && <InputError>{error}</InputError>}
  </InputControlContainer>
);

interface SelectInputProps extends React.InputHTMLAttributes<HTMLSelectElement> {
  error?: string | null;
  helpText?: string | null;
}

export const SelectInput: React.FC<SelectInputProps> = ({ error, helpText, ...inputProps }) => (
  <InputControlContainer>
    <SelectInputControl hasError={error !== null && error !== undefined} {...inputProps} />
    {helpText && <HelpText>{helpText}</HelpText>}
    {error && <InputError>{error}</InputError>}
  </InputControlContainer>
);

export const StaticInput = styled.div`
  font-size: 1.5rem;
  color: ${SiteConfig.colors.text.light};
`;

const ToggleSwitchContainer = styled.label`
  position: relative;
  display: flex;
  flex-direction: row;
  align-items: center;
`;

const ToggleSwitchSlider = styled.span`
  position: relative;
  display: block;
  cursor: pointer;
  width: 4rem;
  height: 2rem;
  background-color: ${SiteConfig.colors.text.primary};
  transition: 0.4s;
  border-radius: 1.75rem;

  &:before {
    content: '';
    position: absolute;
    width: 1.75rem;
    height: 1.75rem;
    border-radius: 50%;
    left: 0.25rem;
    bottom: 0.125rem;
    background-color: #fff;
    transition: 0.4s;
  }
`;
const ToggleSwitchInput = styled.input`
  opacity: 0;
  width: 0;
  height: 0;
  margin: 0;
  padding: 0;
  margin-left: -4px;
  border: none;

  &:checked + ${ToggleSwitchSlider} {
    background-color: ${SiteConfig.colors.accents.control};
  }

  &:checked + ${ToggleSwitchSlider}:before {
    transform: translateX(1.75rem);
  }

  &:focus + ${ToggleSwitchSlider} {
    box-shadow: 0 0 1px ${SiteConfig.colors.accents.control};
  }
`;

const ToggleSwitchLabelText = styled.div`
  margin: 0.125rem 0 0 0.5rem;
`;

interface ToggleSwitchProps {
  toggled: boolean;
  onChange: (value: boolean) => void;
  children: React.ReactNode;
}

export const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ toggled, onChange, children }) => {
  const onToggle = useCallback(() => {
    onChange?.(!toggled);
  }, [onChange, toggled]);
  return (
    <ToggleSwitchContainer>
      <ToggleSwitchInput type="checkbox" checked={toggled} onChange={onToggle} />
      <ToggleSwitchSlider />
      <ToggleSwitchLabelText>{children}</ToggleSwitchLabelText>
    </ToggleSwitchContainer>
  );
};

export const ButtonElement = styled.button`
  height: 2.75rem;
  border: none;
  background-color: ${SiteConfig.colors.accents.control};
  color: #fff;
  font-family: inherit;
  font-size: 1.5rem;
  padding: 0.5rem 0.5rem;
  text-align: center;
  border-radius: 1.375rem;
  transition: background-color 200ms ease-in;
  line-height: 1.5;
  cursor: pointer;
  
  &:disabled {
    opacity: 0.5;
  }
  
  &:not(:disabled):hover {
    background-color: ${SiteConfig.colors.accents.hover.control};
  }

  &:not(:disabled):active {
    background-color: ${SiteConfig.colors.accents.control};
  }

  &.danger,
  &.danger:not(:disabled):active  {
    background-color: ${SiteConfig.colors.error.dark.background};
  }

  &.danger:not(:disabled):hover {
    background-color: ${SiteConfig.colors.error.text};
  }
`;

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: string;
}
 
export const Button: React.FC<ButtonProps> = ({ variant = 'default', className, ...buttonProps }) => (
  <ButtonElement className={[variant, className ?? ''].join(' ')} {...buttonProps} />
);

export const AlertElement = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 0.25rem;
  padding: 0.5rem;
  background-color: ${SiteConfig.colors.accents.alert};
  color: ${SiteConfig.colors.text.dark};
  margin-bottom: 0.5rem;
  text-align: center;

  &.error {
    background-color: ${SiteConfig.colors.error.background};
    color: ${SiteConfig.colors.error.text};
  }
`;

interface AlertProps {
  variant?: string;
  children: React.ReactNode;
}

export const Alert: React.FC<AlertProps> = ({ children, variant }) => (
  <AlertElement className={variant}>{children}</AlertElement>
);
