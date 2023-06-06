import { ObjectLiteral } from '../types';
import { ManagedEvent } from './managedEvent';

export type EventDictionary = Record<string, ObjectLiteral | null>;

export type ManagedEventHandler<
  TEvents extends EventDictionary,
  T extends keyof TEvents,
  TSource> =
  (evt: ManagedEvent<TEvents, T, TSource>) => void;