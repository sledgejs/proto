export type EntityId = string;

export interface IEntity {
  id: EntityId;
}

export type EntityData<TData> = TData extends IEntity ? (
  Partial<Omit<TData, 'id'>> & IEntity) : 
  Partial<TData>; 