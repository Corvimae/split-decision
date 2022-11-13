import React, { useCallback, useMemo, useState } from 'react';
import styled from 'styled-components';
import { Button } from '../components/layout';
import { SiteConfig } from './siteConfig';

type UseConfirmationPromptReturn = [
  React.ReactNode,
  () => void,
];

export function useConfirmationPrompt(message: string, onConfirm: () => void): UseConfirmationPromptReturn {
  const [isVisible, setIsVisible] = useState(false);

  const showComponent = useCallback(() => {
    setIsVisible(true);
  }, []);

  const hideComponent = useCallback(() => {
    setIsVisible(false);
  }, []);

  const component = useMemo(() => {
    if (isVisible) {
      return (
        <Backdrop>
          <ConfirmationPrompt>
            <Message>{message}</Message>
            <Actions>
              <Button onClick={hideComponent}>Cancel</Button>
              <Button onClick={onConfirm}>Okay</Button>
            </Actions>
          </ConfirmationPrompt>
        </Backdrop>
      );
    }
     
    return null;
  }, [message, isVisible, hideComponent, onConfirm]);

  return [component, showComponent];
}

const Backdrop = styled.div`
  position: fixed;
  left: 0;
  top: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.7);
  z-index: 99;
`;

const ConfirmationPrompt = styled.div`
  position: absolute;
  display: flex;
  left: 50%;
  top: 50%;
  flex-direction: column;
  padding: 1rem;
  color: ${SiteConfig.colors.text.dark};
  border-radius: 0.25rem;
  background-color: #fff;
  box-shadow: 0 0 0.25rem rgba(0, 0, 0, 0.5);
  transform: translate(-50%, -50%);
`;

const Message = styled.div`
  height: max-content;
  text-align: center;
  line-height: 1.2;
  font-size: 1.5rem;
  font-weight: 400;
  margin-bottom: 1rem;
`;

const Actions = styled.div`
  display: flex;
  height: max-content;
  justify-content: center;

  & button + button {
    margin-left: 1rem;
  }
`;
