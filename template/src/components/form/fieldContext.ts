import { createContext, useContext } from 'react';
import { FieldState } from './fieldState';

export const FieldContext = createContext<FieldState | null>(null);

export function useFieldContext(): FieldState | null {
  const model = useContext(FieldContext);  
  return model;
}