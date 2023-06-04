import { useEffect, useId } from 'react';
import { observer } from 'mobx-react-lite';
import { useFormState } from './formState';
import { FormContext, useFormContext } from './formContext';
import { FormPropsWithAttributes } from './formSchema';
import { useDeepCompareEffect } from '../../vendor/react/reactHooks';
import { getFormAttributesFromProps } from './formUtils';
import classNames from 'classnames';

type Props = FormPropsWithAttributes;

export const Form = observer(({
  children,
  className,
  containerId,
  ...props
}: Props) => {

  const defaultId = 'form_' + useId();
  const outId: string = props.id ?? defaultId;
  props.id = outId;

  const model = useFormState({}, { ref: props.modelRef ?? null });
  const parentModel = useFormContext();

  className = classNames('form', className);

  useDeepCompareEffect(() =>
    model.elementPropsChanged(props),
    [props]);

  useEffect(() => {
    model.handleParentChange(parentModel);
  }, [model, parentModel]);

  return (
    <FormContext.Provider value={model}>
      <div className={className}
        id={containerId}
        onChange={model.handleChange}>

        <form id={model.formId ?? undefined}
          onSubmit={model.handleSubmit}
          onInvalid={model.handleInvalid}
          onReset={model.handleReset}
          {...getFormAttributesFromProps(props)} />

        {children}
      </div>
    </FormContext.Provider>
  );
});