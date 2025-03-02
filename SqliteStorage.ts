import Storage, { type Item } from './Storage';
import { Database } from "bun:sqlite";

const db = new Database("data.sqlite");

export default class IndexedDbStorage<T extends Item> extends Storage<T> {
  async migrate() {
    db.run("CREATE TABLE IF NOT EXISTS items (id INTEGER PRIMARY KEY, name TEXT)");
  }

  async getAll() {
    return db.query("SELECT * FROM items").all() as T[];
  }

  async add(item: Exclude<T, 'id'>) {
    const keys = Object.keys(item);
    const values = Object.values(item);
    const query = `INSERT INTO items (${keys.join(", ")}) VALUES (${keys.map(() => "?").join(", ")})`;
    const { lastInsertRowid } = db.run(query, values);
  }

  async remove(id: number) {
    db.run("DELETE FROM items WHERE id = ?", [id]);
  }

  async update(id: number, item: Exclude<T, 'id'>) {
    const keys = Object.keys(item);
    const values = Object.values(item);
    const query = `UPDATE items SET ${keys.map(key => `${key} = ?`).join(", ")} WHERE id = ?`;
    db.run(query, [...values, id]);
  }

  async clear() {
    db.run("DELETE FROM items");
  }
}
