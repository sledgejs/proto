import { AsyncResult } from '../../core/types'

export enum LoadResourceInjectPoint {
	HeadStart,
	HeadEnd,
	BodyStart,
	BodyEnd
}

export type LoadResourceOptions<T = any> = {
	injectPoint?: LoadResourceInjectPoint;
	callback?: () => AsyncResult<T>;
}

export const DefaultLoadResourceOptions: LoadResourceOptions = {
	injectPoint: LoadResourceInjectPoint.BodyEnd
}