import { createContext, useContext } from 'react';
import { FormState } from './formState';

export const FormContext = createContext<FormState | null>(null);

export function useFormContext(): FormState | null {
  const model = useContext(FormContext);  
  return model;
}