import { queryParamsToString, URLQueryParamsSource } from '../core/urlUtils';

export function wrapRouteWithQuery(route: string, queryParams: Partial<URLQueryParamsSource>) {
  return [route, queryParamsToString(queryParams)]
    .filter(x => x)
    .join('?');
}