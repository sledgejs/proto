export function getEnumLikeObjectFromLookup<TKey extends string>(lookup: Record<TKey, any>)
  : { [key in TKey]: key } {

  const keys = Object.keys(lookup) as TKey[];
  const entries = keys.map(x => [x, x]) as [TKey, TKey][];

  return Object.fromEntries(entries) as { [key in TKey]: key };
}