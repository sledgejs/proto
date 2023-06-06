import { FormAction, FormHook, FormHookObject, FormProps, OmitFormProps } from './formSchema';
import { FormState } from './formState';

export function getFormAttributesFromProps<T extends Partial<FormProps>>(props: T): OmitFormProps<T> {
  const {
    id,
    containerId,
    modelRef,
    hooks,
    imperativeHooks,
    error,
    disabled,
    onSubmit,
    onReset,
    onInvalid,
    onChange,
    ...nativeAttribs
  } = props;

  return nativeAttribs;
}

export function unifyFormHooks(hooks: (FormHook | FormHookObject)[]): FormHook {
  
  return ((form: FormState, action: FormAction) => {

    for (const hook of hooks) {
      
      let obj: FormHookObject | null;
      if (typeof hook === 'function')
        obj = hook(form, action) ?? null;
      else
        obj = hook ?? null;

      if (obj)
        return obj;
    }

    return null;
  }) as FormHook; // because of stupid eslint rules
}