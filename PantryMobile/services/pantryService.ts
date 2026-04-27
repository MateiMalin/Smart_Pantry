import { API_URL } from "../constants/Config";

console.log("[PantryService] API_URL:", API_URL);

export const pantryService = {
  async getItems() {
    const url = `${API_URL}/pantry`;
    console.log("[getItems] Fetching from:", url);
    try {
      const response = await fetch(url);
      console.log("[getItems] Response status:", response.status);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      console.log("[getItems] Raw response:", data);

      const items = Array.isArray(data) ? data : data?.value || [];
      console.log("[getItems] Extracted items:", items);
      return items;
    } catch (error) {
      console.error("[getItems] Error:", error);
      throw error;
    }
  },

  async deleteItem(id: number) {
    const response = await fetch(`${API_URL}/pantry/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error("Failed to delete item");
    return true;
  },

  async putItem(
    id: number,
    newItem: { name: string; quantity: number; unit: string },
  ) {
    const url = `${API_URL}/pantry/${id}`;
    try {
      // Include id in the body to match backend expectations
      const response = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id, ...newItem }),
      });

      console.log("[putItem] Response status:", response.status);

      if (!response.ok) {
        const bodyText = await response.text().catch(() => "");
        console.log("[putItem] Error response body:", bodyText);
        let errorMessage = `Failed to update item (${response.status})`;

        if (bodyText) {
          try {
            const errorData = JSON.parse(bodyText);
            if (errorData?.message) {
              errorMessage = errorData.message;
            } else if (errorData?.title) {
              errorMessage = errorData.title;
            }
          } catch {
            errorMessage = bodyText;
          }
        }

        throw new Error(errorMessage);
      }

      // If backend returns no content, return the updated item manually
      if (response.status === 204) {
        return { id, ...newItem };
      }

      const responseData = await response.json();
      console.log("[putItem] Raw response:", responseData);

      const updatedItem = responseData?.value || responseData;
      console.log("[putItem] Extracted item:", updatedItem);
      return updatedItem;
    } catch (error) {
      console.error("[putItem] Error:", error);
      throw error;
    }
  },

  async addItem(newItem: { name: string; quantity: number; unit: string }) {
    const url = `${API_URL}/pantry`;
    console.log("[addItem] POST to:", url, "with body:", newItem);
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newItem),
      });

      console.log("[addItem] Response status:", response.status);

      if (!response.ok) {
        const bodyText = await response.text().catch(() => "");
        console.log("[addItem] Error response body:", bodyText);
        let errorMessage = `Failed to add item (${response.status})`;

        if (bodyText) {
          try {
            const errorData = JSON.parse(bodyText);
            if (errorData?.message) {
              errorMessage = errorData.message;
            } else if (errorData?.title) {
              errorMessage = errorData.title;
            }
          } catch {
            errorMessage = bodyText;
          }
        }

        throw new Error(errorMessage);
      }

      const responseData = await response.json();
      console.log("[addItem] Raw response:", responseData);

      const createdItem = responseData?.value || responseData;
      console.log("[addItem] Extracted item:", createdItem);
      return createdItem;
    } catch (error) {
      console.error("[addItem] Error:", error);
      throw error;
    }
  },
};
