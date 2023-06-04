import { EventDictionary, ManagedEventHandler } from './eventSchema';
import { ManagedEvent } from './managedEvent';

export class EventManager<TEvents extends EventDictionary = EventDictionary, TSource = any> {

  constructor(source: TSource) {
    this.source = source;
  }

  readonly source: TSource;
  readonly listeners = new Set<ManagedEventHandler<TEvents, keyof TEvents, TSource>>();
  readonly handlerLookup = new Map<keyof TEvents, Set<ManagedEventHandler<TEvents, any, TSource>>>();

  emit<T extends keyof TEvents>(type: T, payload: TEvents[T]) {
    const evt = new ManagedEvent({
      type,
      payload,
      source: this.source
    });

    this.handlerLookup.get(type)?.forEach(handler =>
      handler?.(evt));

    this.listeners.forEach(listener =>
      listener?.(evt));
  }

  listen(listener: ManagedEventHandler<TEvents, keyof TEvents, TSource>) {
    this.listeners.add(listener);
  }

  unlisten(listener: ManagedEventHandler<TEvents, keyof TEvents, TSource>) {
    this.listeners.delete(listener);
  }

  on<T extends keyof TEvents>(type: T, handler: ManagedEventHandler<TEvents, T, TSource>) {
    const lookup = this.handlerLookup;
    let handlers = lookup.get(type);
    if (!handlers) {
      handlers = new Set();
      lookup.set(type, handlers);
    }

    handlers.add(handler);
    return true;
  }

  off<T extends keyof TEvents>(type: T, handler?: ManagedEventHandler<TEvents, T, TSource>) {
    const lookup = this.handlerLookup;
    let handlers = lookup.get(type);
    if (!handlers)
      return false;

    if (handler) {
      handlers.delete(handler);
    } else {
      lookup.delete(type);
    }

    this.purge();
    return true;
  }

  private purge() {
    const lookup = this.handlerLookup;
    for (const [type] of lookup) {
      if (lookup.get(type)?.size === 0)
        lookup.delete(type);
    }
  }
}