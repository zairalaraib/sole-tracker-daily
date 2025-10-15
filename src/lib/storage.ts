export interface Shoe {
  id: string;
  name: string;
  brand: string;
  price: number;
  size: string;
  color: string;
  occasion: string;
  type: string;
  purchaseDate: string;
  image: string;
  wearCount: number;
}

export interface WearLog {
  id: string;
  shoeId: string;
  date: string;
}

export const storage = {
  getShoes: (): Shoe[] => {
    const shoes = localStorage.getItem('shoes');
    return shoes ? JSON.parse(shoes) : [];
  },

  saveShoes: (shoes: Shoe[]) => {
    localStorage.setItem('shoes', JSON.stringify(shoes));
  },

  addShoe: (shoe: Omit<Shoe, 'id' | 'wearCount'>) => {
    const shoes = storage.getShoes();
    const newShoe: Shoe = {
      ...shoe,
      id: Date.now().toString(),
      wearCount: 0,
    };
    shoes.push(newShoe);
    storage.saveShoes(shoes);
    return newShoe;
  },

  updateShoe: (id: string, updates: Partial<Shoe>) => {
    const shoes = storage.getShoes();
    const index = shoes.findIndex(s => s.id === id);
    if (index !== -1) {
      shoes[index] = { ...shoes[index], ...updates };
      storage.saveShoes(shoes);
      return shoes[index];
    }
    return null;
  },

  deleteShoe: (id: string) => {
    const shoes = storage.getShoes().filter(s => s.id !== id);
    storage.saveShoes(shoes);
    // Also delete wear logs for this shoe
    const logs = storage.getWearLogs().filter(l => l.shoeId !== id);
    storage.saveWearLogs(logs);
  },

  getShoeById: (id: string): Shoe | null => {
    return storage.getShoes().find(s => s.id === id) || null;
  },

  getWearLogs: (): WearLog[] => {
    const logs = localStorage.getItem('wearLogs');
    return logs ? JSON.parse(logs) : [];
  },

  saveWearLogs: (logs: WearLog[]) => {
    localStorage.setItem('wearLogs', JSON.stringify(logs));
  },

  addWearLog: (shoeId: string) => {
    const logs = storage.getWearLogs();
    const newLog: WearLog = {
      id: Date.now().toString(),
      shoeId,
      date: new Date().toISOString(),
    };
    logs.push(newLog);
    storage.saveWearLogs(logs);

    // Increment wear count
    const shoe = storage.getShoeById(shoeId);
    if (shoe) {
      storage.updateShoe(shoeId, { wearCount: shoe.wearCount + 1 });
    }
    return newLog;
  },

  getWearLogsByShoeId: (shoeId: string): WearLog[] => {
    return storage.getWearLogs().filter(l => l.shoeId === shoeId);
  },

  isLoggedIn: (): boolean => {
    return localStorage.getItem('isLoggedIn') === 'true';
  },

  login: () => {
    localStorage.setItem('isLoggedIn', 'true');
  },

  logout: () => {
    localStorage.setItem('isLoggedIn', 'false');
  },
};
