import { createContext, useContext } from 'react';
import { LabelState } from './labelState';

export const LabelContext = createContext<LabelState | null>(null);

export function useLabelContext(): LabelState | null {
  const model = useContext(LabelContext);  
  return model;
}