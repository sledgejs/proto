import dayjs, { Dayjs } from 'dayjs';

export function getNowSeconds() {
  return new Date().getTime() / 1000;
}

export function toValidDateTime(arg?: number | string | Dayjs | Date | null): Dayjs | null {

  const date = dayjs(arg)
  if (!date.isValid())
    return null;
  return date;
}