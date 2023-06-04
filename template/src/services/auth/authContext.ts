import { nanoid } from 'nanoid';
import { AuthContextType } from './authSchema';
import { AuthPermit } from './authPermit';
import { UserIdentity } from './userIdentity';

type Props = {
  type: AuthContextType.Authenticated;
  permit: AuthPermit;
  identity: UserIdentity;
} | {
  type: AuthContextType.Anonymous;
};

export class AuthContext {

  constructor(props: Props) {

    this.type = props.type;

    switch (props.type) {
      case AuthContextType.Authenticated:
        this.permit = props.permit;
        this.identity = props.identity;
        break;

      case AuthContextType.Anonymous:
        this.permit = null;
        this.identity = null;
        break;
    }

    Object.freeze(this);
  }

  readonly contextId = nanoid();

  readonly type: AuthContextType;

  readonly permit: AuthPermit | null = null;
  readonly identity: UserIdentity | null = null;

  get isAuthenticated() {
    return this.type === AuthContextType.Authenticated;
  }

  get isAnonymous() {
    return this.type === AuthContextType.Anonymous;
  }

  get userId(): string | null {
    return this.identity?.id.toString() ?? null;
  }

  get isValid() {
    switch (this.type) {
      case AuthContextType.Authenticated:
        return this.permit?.isValid ?? false;

      case AuthContextType.Anonymous:
        return true;
    }
  }
}