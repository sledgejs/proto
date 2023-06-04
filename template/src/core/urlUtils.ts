import { isDefinedObject } from './typeUtils';
import type { Location } from 'react-router-dom';

export function isAbsoluteUrl(url: string) {
  // TODO: test
  try {
    new URL(url);
    return true;
  } catch (err) {
    return false;
  }
}

export function getOrigin() {
  return window.location.origin;
}

export function convertToAbsolutUrl(relativePath: string) {
  const absolutePath = getOrigin() + relativePath;

  if (!isAbsoluteUrl(absolutePath))
    return null;

  return absolutePath;
}

export type URLQueryParamsSource = ConstructorParameters<typeof URLSearchParams>[0];

export function queryParamsToString(queryParams: Partial<URLQueryParamsSource>) {
  //@ts-ignore
  return (new URLSearchParams(queryParams))
    .toString();
}

export function getRelativeUrl(loc: Location | URL | string): string {

  let locStr: string = '';
  if (typeof loc === 'string') {
    locStr = loc;
  } else if (isDefinedObject(loc)) {
    locStr = [
      loc.pathname ?? '',
      loc.search ?? '',
      loc.hash ?? ''
    ].join('');
  }

  // TODO: check
  // if a base is not provided, URL might throw an error
  // however when a base is provided the URL constructor should not throw any error
  // we don't wrap this in a try..catch block because if an error does occurr
  // it means something really unusual happened and it's better to crash the app
  // than to return something that is misleading

  const url = new URL(locStr, window.location.origin);
  const relUrl = [url.pathname, url.search, url.hash].join('');

  return relUrl;
}

export function getAbsoluteUrl(loc: Location | URL | string, base: string = window.location.origin): string {
  if (typeof loc === 'string') {
    try {
      const url = new URL(loc);
      return url.href;
    } catch (err) { }
  }

  // url is not absolute
  const url = new URL(getRelativeUrl(loc), base);
  return url.href;
}

export function readParamsFromQueryString(queryString: string) {
  const params = Object.fromEntries(new URLSearchParams(queryString));
  return params;
}