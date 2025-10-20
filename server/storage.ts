export interface IStorage {
  // Storage methods will be added as needed for game features
}

export class MemStorage implements IStorage {
  constructor() {
    // In-memory storage for game data if needed
  }
}

export const storage = new MemStorage();
