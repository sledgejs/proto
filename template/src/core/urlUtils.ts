import { isDefinedObject } from './typeUtils';
import type { Location } from 'react-router-dom';

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

  const url = new URL(locStr, window.location.origin);
  const relUrl = [url.pathname, url.search, url.hash].join('');

  return relUrl;
}