import { FindManyOptions, FindOneOptions } from 'typeorm';

export interface IRepository<T> {
  findById(id: string): Promise<T | null>;
  findOne(options: FindOneOptions<T>): Promise<T | null>;
  findMany(options?: FindManyOptions<T>): Promise<T[]>;
  save(entity: Partial<T>): Promise<T>;
  update(id: string, partial: Partial<T>): Promise<void>;
  delete(id: string): Promise<void>;
}
