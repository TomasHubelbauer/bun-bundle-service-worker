export type Item = { id: number; };

export default class Storage<T extends Item> {
  async migrate(): Promise<void> {
    throw new Error('Not implemented');
  }

  async getAll(): Promise<T[]> {
    throw new Error('Not implemented');
  }

  async add(item: Exclude<T, 'id'>): Promise<void> {
    throw new Error('Not implemented');
  }

  async remove(id: number): Promise<void> {
    throw new Error('Not implemented');
  }

  async update(id: number, item: Exclude<T, 'id'>): Promise<void> {
    throw new Error('Not implemented');
  }

  async clear(): Promise<void> {
    throw new Error('Not implemented');
  }
}
