import { makeObservable, observable } from 'mobx';
import { MutableRefObject } from 'react';

/**
 * Simple implementation for having the React ref be mobx observable.
 */
export class ObservableRef<T>
  implements MutableRefObject<T> {

  constructor(initial: T) {
    makeObservable(this);
    this.current = initial;
  }

  @observable current: T = null!;
}