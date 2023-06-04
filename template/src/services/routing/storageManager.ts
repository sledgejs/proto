import { Config } from '../../config/config';
import { consumeSession, setSession } from '../../core/storage/sessionStorageUtils';
import { IRouteStorage } from '../../routes/routeSchema';
import { Node } from '../../kernel/node';
import { Kernel } from '../../kernel/kernel';

const ServiceConfig = Config.routing;
const ModuleConfig = ServiceConfig.storage;

const LastPrivatePathKey = ModuleConfig.lastPrivatePathKey;

export class StorageManager
  extends Node
  implements IRouteStorage {

  constructor(kernel: Kernel) {
    super(kernel);
    this.load();
  }

  lastPrivatePath: string | null = null;

  setLastPrivatePath(path: string) {
    this.lastPrivatePath = path;
    this.sync();
  }

  clearLastPrivateRoute(path: string) {
    this.lastPrivatePath = null;
    this.sync();
  }

  clear() {
    this.lastPrivatePath = null;
    this.sync();
  }

  private sync() {
    this.saveValue(LastPrivatePathKey, this.lastPrivatePath);
  }

  private load(): void {
    this.lastPrivatePath =
      this.loadValue(LastPrivatePathKey);
  }

  private loadValue(key: string): string | null {

    // if not, try from storage
    const storageValue = consumeSession(getSessionStorageKey(key));
    if (storageValue)
      return storageValue;

    return null;
  }

  private saveValue(key: string, value: string | null): void {
    setSession(getSessionStorageKey(key), value);
  }
}

function getSessionStorageKey(key: string) {
  return ModuleConfig.keyPrefix + key;
}