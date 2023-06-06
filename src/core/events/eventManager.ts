import { EventDictionary, ManagedEventHandler } from './eventSchema';
import { ManagedEvent } from './managedEvent';

/**
 * Simple event manager for emitting events and registering listeners.
 */
export class EventManager<TEvents extends EventDictionary = EventDictionary, TSource = any> {

  constructor(source: TSource) {
    this.source = source;
  }

  private readonly source: TSource;
  private readonly listeners = new Set<ManagedEventHandler<TEvents, keyof TEvents, TSource>>();
  private readonly handlerLookup = new Map<keyof TEvents, Set<ManagedEventHandler<TEvents, any, TSource>>>();

  /**
   * Emits an event using the provided type and payload.
   */
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

  /**
   * Registers an event listener to this manager.
   */
  listen(listener: ManagedEventHandler<TEvents, keyof TEvents, TSource>) {
    this.listeners.add(listener);
  }

  /**
   * Removes an event listener from this manager.
   */
  unlisten(listener: ManagedEventHandler<TEvents, keyof TEvents, TSource>) {
    this.listeners.delete(listener);
  }

  /**
   * Registers an event handler for a particular event.
   */
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

  /**
   * Removes an event handler for a particular event.
   */
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