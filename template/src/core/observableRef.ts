import { makeObservable, observable } from 'mobx';
import { MutableRefObject } from 'react';

export class ObservableRef<T>
  implements MutableRefObject<T> {

  constructor(initial: T) {
    makeObservable(this);
    this.current = initial;
  }

  @observable current: T = null!;
}