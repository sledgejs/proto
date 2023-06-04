import { createContext, useContext } from 'react';
import { InputState } from './inputState';

export const InputContext = createContext<InputState | null>(null);

export function useInputContext(): InputState | null {
  const model = useContext(InputContext);  
  return model;
}