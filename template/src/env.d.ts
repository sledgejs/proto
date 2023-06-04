/// <reference types="vite/client" />

type EnvBoolean = 'true' | 'false';

interface ImportMetaEnv {
  readonly STORYBOOK: EnvBoolean;
  
  readonly VITE_REACT_STRICT_MODE: EnvBoolean;
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}