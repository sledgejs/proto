/**
 * Specifies the type of the ID for all entities.
 */
export type EntityId = string;

/**
 * Generic interface for all entities in the application.
 */
export interface IEntity {
  id: EntityId;
}

/**
 * Utility type to be used by GraphQL entity sources.
 * Used to only keep the `id` as mandatory and the rest of the fields optional.
 */
export type EntitySource<TData> = TData extends IEntity ? (
  Partial<Omit<TData, 'id'>> & IEntity) : 
  Partial<TData>; 