import { Kernel } from '../kernel/kernel';
import { DevAnnotatedObject } from './devSchema';

export class DevConsole {

  kernel: Kernel | null = null;

  globalIndexCursor = 1;
  readonly instanceIndexCursorLookup = new Map<string, number>();

  readonly objects: DevAnnotatedObject[] = [];

  register(obj: DevAnnotatedObject) {
    this.objects.push(obj);
  }

  get(query: string | number): DevAnnotatedObject | null {
    query = query.toString().toLowerCase();
    return this.objects.find(obj => {
      const dbg = obj._dev;
      
      if (!dbg)
        return false;

      if (dbg.label.toLowerCase().includes(query.toString()))
        return true;
    }) ?? null;
  }
}

declare global {
  interface Window {
    sledge: DevConsole;
  }
}

export const GlobalDevConsole = new DevConsole();

if (typeof window !== 'undefined') {
  window.sledge = GlobalDevConsole;
}