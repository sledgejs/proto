import dayjs from 'dayjs';
import { EventDictionary } from './eventSchema';

type Props<
  TEvents extends EventDictionary = EventDictionary,
  T extends keyof TEvents = string,
  TSource = any> = {
    type: T;
    payload: TEvents[T];
    source: TSource;
  }

export class ManagedEvent<
  TEvents extends EventDictionary = EventDictionary,
  T extends keyof TEvents = string,
  TSource = any> {

  constructor(props: Props<TEvents, T, TSource>) {
    this.type = props.type;
    this.payload = props.payload;
    this.source = props.source;
    this.emittedAt = dayjs();
  }

  readonly type: T;
  readonly payload: TEvents[T];
  readonly source: TSource;
  readonly emittedAt: dayjs.Dayjs;
}