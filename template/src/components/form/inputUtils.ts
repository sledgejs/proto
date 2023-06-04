import type { InputAction, InputHook, InputHookObject, InputProps, OmitInputProps } from './inputSchema';
import { InputState } from './inputState';

export function getInputAttributesFromProps<T extends Partial<InputProps>>(props: T): OmitInputProps<T> {
  const {
    id,
    modelRef,
    label,
    hooks,
    imperativeHooks,
    disabled,
    error,
    value,
    initialValue,
    onChange,
    onPress,
    onFocus,
    onBlur,
    onPointerEnter,
    onPointerLeave,
    ...nativeAttribs
  } = props;

  //@ts-ignore
  return nativeAttribs;
}

export function mergeInputHooks(hooks: (InputHook | InputHookObject)[]): InputHook {

  return ((input: InputState, action: InputAction) => {

    for (const hook of hooks) {

      let obj: InputHookObject | null;
      if (typeof hook === 'function')
        obj = hook(input, action) ?? null;
      else
        obj = hook ?? null;

      if (obj)
        return obj;
    }

    return null;
  }) as InputHook; // because of stupid eslint rules
}