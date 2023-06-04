import { AuthContext } from './authContext';
import { AuthPermit } from './authPermit';
import { AuthStateType } from './authSchema';

type Props = {
  type: AuthStateType.Authorized;
  context: AuthContext;
} | {
  type: AuthStateType.Unauthorized;
} | {
  type: AuthStateType.Authorizing;
  transientPermit: AuthPermit | null;
}

export class AuthState {

  constructor(props: Props) {
    const { type } = props;

    this.type = props.type;
    this.context = null;
    this.transientPermit = null;

    switch (type) {
      case AuthStateType.Unauthorized:
        break;

      case AuthStateType.Authorized:
        this.context = props.context;
        break;

      case AuthStateType.Authorizing:
        this.transientPermit = props.transientPermit ?? null;
        break;
    }
  }

  readonly type: AuthStateType;
  readonly context: AuthContext | null;
  readonly transientPermit: AuthPermit | null;

  get isUnauthorized() {
    return this.type === AuthStateType.Unauthorized;
  }

  get isAuthorized() {
    return this.type === AuthStateType.Authorized;
  }

  get isAuthorizing() {
    return this.type === AuthStateType.Authorizing;
  }
  
  get isStable() {
    return (
      this.isAuthorized || 
      this.isUnauthorized);
  }

  get isTransient() {
    return this.isAuthorizing;
  }
}