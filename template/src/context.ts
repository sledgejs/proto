export type RuntimeType =
  'Test' |
  'Browser';

export type EnvType =
  'Development' |
  'Production';

function getRuntimeType(): RuntimeType {
  if (import.meta.env.MODE === 'test')
    return 'Test';

  return 'Browser';
}

function getEnvType(): EnvType {
  if (import.meta.env.PROD)
    return 'Production';

  return 'Development';
}

export const Context = {
  runtimeType: getRuntimeType(),
  envType: getEnvType()
}