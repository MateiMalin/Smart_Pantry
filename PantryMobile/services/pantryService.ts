import api from "././api";

export interface PantryItemData {
  name: string;
  quantity: number;
  unit: string;
}

export const pantryService = {
  async getItems() {
    const response = await api.get("/pantry");
    return response.data;
  },

  async deleteItem(id: number) {
    await api.delete(`/pantry/${id}`);
  },

  async putItem(id: number, item: PantryItemData) {
    const response = await api.put(`/pantry/${id}`, item);
    return response.data;
  },

  async addItem(newItem: PantryItemData) {
    const response = await api.post("/pantry", newItem);
    return response.data;
  },
};
