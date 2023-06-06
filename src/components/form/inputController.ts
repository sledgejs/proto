import { FunctionComponent, useEffect, useId } from 'react';
import useDeepCompareEffect from 'use-deep-compare-effect';
import { useFormContext } from '../form/formContext';
import { useFieldContext } from './fieldContext';
import { useInputContext } from './inputContext';
import { InputProps, InputRole } from './inputSchema';
import { FormState } from '../form/formState';
import { InputState, useInputState } from './inputState';
import { FieldState } from './fieldState';
import { useLabelContext } from './labelContext';

type Params = {
  role: InputRole;
  component: FunctionComponent;
} & InputProps;

type InputController = {
  model: InputState;
  id: string;
  parentForm: FormState | null;
  parentField: FieldState | null;
  parentInput: InputState | null;
}

export function useInputController({
  role,
  component,
  modelRef,
  value,
  initialValue,
  ...props
}: Params): InputController {

  const defaultId = useId();
  const outId: string = props.id ?? defaultId;
  props.id = outId;

  const model = useInputState({
    role,
    component,
    id: outId,
    initialValue
  });

  useEffect(() => {
    if (!modelRef)
      return;

    modelRef.current = model;
    return () => {
      modelRef.current = null;
    }
  }, [model, modelRef]);

  let parentForm = useFormContext();
  let parentField = useFieldContext();
  let parentInput = useInputContext();
  let parentLabel = useLabelContext();

  if (parentInput) {
    parentForm = null;
    parentField = null;
  }

  useDeepCompareEffect(() =>
    model.elementPropsChanged(props),
    [model, props]);

  useEffect(() =>
    model.elementValueChanged(value),
    [model, value]);

  useEffect(() => {
    model.parentFormAttached(parentForm);
    return () =>
      model.parentFormDetached();
  }, [model, parentForm]);

  useEffect(() => {
    model.parentFieldAttached(parentField);
    return () =>
      model.parentFieldDetached();
  }, [model, parentField]);

  useEffect(() => {
    model.parentInputAttached(parentInput);
    return () =>
      model.parentFormDetached();
  }, [model, parentInput]);

  useEffect(() => {
    model.setInitialValue(initialValue);
  }, [model, initialValue]);

  useEffect(() => {
    parentLabel?.setInputId(outId);
    return () =>
      parentLabel?.clearInputId();
  }, [outId, parentLabel]);

  return {
    model,
    id: outId,
    parentForm,
    parentField,
    parentInput
  }
}