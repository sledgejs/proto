import './loginPage.scss';

import { observer } from 'mobx-react-lite';
import { Helmet } from 'react-helmet-async';
import { Form } from '../../components/form/form';
import { Field } from '../../components/form/field';
import { TextField } from '../../components/textField/textField';
import { Button } from '../../components/button/button';
import { RequiredLabelContent } from '../../components/form/labelContent';
import { useModel, useModelBindings } from '../../components/componentHooks';
import { LoginPageState } from './loginPageState';
import { Memo } from '../../components/memo/memo';
import { MemoType } from '../../components/memo/memoSchema';
import { AuthFlowResponseInterpreter } from '../../components/auth/authFlowResponseInterpreter';
import { CircleDashedSpinner } from '../../components/spinners/circleDashedSpinner';

export const LoginPage = observer(() => {

  const model = useModel(kernel => new LoginPageState(kernel));
  useModelBindings(model);

  const { flowResponse } = model;
  if (flowResponse) {
    return <AuthFlowResponseInterpreter
      response={flowResponse} />
  }

  const { form } = model;
  const formError = form?.error ?? null;

  const spinnerIcon = model.isSubmitting ? (
    <CircleDashedSpinner />
  ) : null;

  return (
    <div id="login-page" className="app-page auth-page">
      <Helmet>
        <title>Sign in to Sledge Template Demo</title>
      </Helmet>

      <div className="form-col">
        <header className="form-logo">
          Login
        </header>

        <div className="form-content sp-large bmg-same tmg-same">

          <Form
            modelRef={model.formRef}
            onSubmit={model.handleSubmit}
            onReset={model.handleReset}
            onInvalid={model.handleInvalid}
            onChange={model.handleChange}
            hooks={model.formHooks}
            noValidate={true}>

            <div className="grid vgap-medium">
              <div className="grid-item bmg-same">
                <h2>Sign in to Sledge Template</h2>
              </div>

              {formError && (
                <div className="grid-item">
                  <Memo
                    content={formError}
                    type={MemoType.Error}
                    className="fill" />
                </div>
              )}

              <div className="grid-item">
                <Field label={<RequiredLabelContent content="Email Address / Username" />}>
                  <TextField
                    id="loginForm_email"
                    modelRef={model.emailInputRef}
                    hooks={model.emailInputHooks}
                    autoComplete="email"
                    required />
                </Field>
              </div>

              <div className="grid-item">
                <Field label={<RequiredLabelContent content="Password" />}>
                  <TextField
                    id="loginForm_password"
                    modelRef={model.passwordInputRef}
                    hooks={model.passwordInputHooks}
                    autoComplete="current-password"
                    required />
                </Field>
              </div>

              <div className="grid-item tmg-same">
                <Field>
                  <Button
                    type="submit"
                    className="primary pivot-start-icon"
                    startIcon={spinnerIcon}>
                    Sign in
                  </Button>
                </Field>
              </div>
            </div>
          </Form>
        </div>
      </div>
    </div>
  )
});

export default LoginPage;