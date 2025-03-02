import Storage, { type Item } from './Storage';

//const db = await (indexedDB.open('data', 1)).result;

// TODO: Rewrite this to use IndexedDB for persistence, right now is in-memory
export default class IndexedDbStorage<T extends Item> extends Storage<T> {
  #items: T[] = [];

  async migrate() {
    //db.createObjectStore('items', { keyPath: 'id', autoIncrement: true });
  }

  async getAll() {
    return this.#items;
  }

  async add(item: Exclude<T, 'id'>) {
    const id = Math.max(0, ...this.#items.map(item => item.id)) + 1;
    this.#items.push({ ...item, id });
  }

  async remove(id: number) {
    const index = this.#items.findIndex(item => item.id === id);
    if (index === -1) {
      throw new Error('Item not found');
    }

    this.#items.splice(index, 1);
  }

  async update(id: number, item: Exclude<T, 'id'>) {
    const index = this.#items.findIndex(item => item.id === id);
    if (index === -1) {
      throw new Error('Item not found');
    }

    this.#items[index] = { ...this.#items[index], ...item, id };
  }

  async clear() {
    this.#items = [];
  }

  async reset(items: T[]) {
    this.#items = items;
  }
}
