import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Text,
  View,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  Platform,
  KeyboardAvoidingView,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { pantryService } from "../../services/pantryService";

interface PantryItem {
  id: number;
  name: string;
  quantity: number;
  unit: string;
}

export default function PantryListScreen() {
  const [items, setItems] = useState<PantryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [newItemName, setNewItemName] = useState("");
  const [newItemQty, setNewItemQty] = useState("");
  const [newItemUnit, setNewItemUnit] = useState("Grams");

  useEffect(() => {
    fetchPantryData();
  }, []);

  const fetchPantryData = async () => {
    try {
      setLoading(true);
      const data = await pantryService.getItems();
      setItems(data);
    } catch (error) {
      console.error("Fetch error:", error);
      Alert.alert("Error", "Could not load pantry items.");
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchPantryData();
    setRefreshing(false);
  };

  const handleDelete = async (id: number) => {
    const previousItems = [...items];

    setItems((prev) => prev.filter((item) => item.id !== id));

    try {
      await pantryService.deleteItem(id);
    } catch (error) {
      setItems(previousItems);
      Alert.alert("Error", "Delete failed.");
    }
  };

  const confirmDelete = (id: number, name: string) => {
    Alert.alert("Delete Item", `Are you sure you want to remove ${name}?`, [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => handleDelete(id),
      },
    ]);
  };

  const handleAddItem = async () => {
    console.log("[handleAddItem] Called with:", {
      name: newItemName,
      qty: newItemQty,
      unit: newItemUnit,
    });

    if (!newItemName.trim() || !newItemQty.trim()) {
      Alert.alert("Validation", "Please fill in name and quantity.");
      return;
    }

    const qty = parseFloat(newItemQty);

    if (isNaN(qty)) {
      Alert.alert("Validation", "Quantity must be a valid number.");
      return;
    }

    try {
      console.log("[handleAddItem] Calling pantryService.addItem...");
      const createdItem = await pantryService.addItem({
        name: newItemName.trim(),
        quantity: qty,
        unit: newItemUnit,
      });

      console.log("[handleAddItem] Item created successfully:", createdItem);
      setItems((prev) => [...prev, createdItem]);

      setNewItemName("");
      setNewItemQty("");
      setNewItemUnit("Grams");
      setModalVisible(false);
      Alert.alert("Success", "Item added!");
    } catch (error) {
      console.error("[handleAddItem] Exception caught:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Could not add item.";
      Alert.alert("Error", errorMessage);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Opening the pantry...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.title}>My Pantry</Text>

        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.buttonText}>Add</Text>
        </TouchableOpacity>
      </View>

      {/* LIST */}
      <FlatList
        data={items}
        keyExtractor={(item) => item.id.toString()}
        refreshing={refreshing}
        onRefresh={onRefresh}
        renderItem={({ item }) => (
          <View style={styles.itemCard}>
            <View>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemDetails}>{item.unit}</Text>
            </View>

            <Text style={styles.quantity}>{item.quantity}</Text>

            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => confirmDelete(item.id, item.name)}
            >
              <Text style={styles.buttonText}>Delete</Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            No items found. Time to go shopping!
          </Text>
        }
      />

      {/* MODAL */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <SafeAreaView>
            <KeyboardAvoidingView
              behavior={Platform.OS === "ios" ? "padding" : "height"}
            >
              <View style={styles.modalContainer}>
                <Text style={styles.modalTitle}>Add New Item</Text>

                <TextInput
                  style={styles.input}
                  placeholder="Item Name"
                  value={newItemName}
                  onChangeText={setNewItemName}
                />

                <TextInput
                  style={styles.input}
                  placeholder="Quantity"
                  keyboardType="numeric"
                  value={newItemQty}
                  onChangeText={setNewItemQty}
                />

                <TextInput
                  style={styles.input}
                  placeholder="Unit"
                  value={newItemUnit}
                  onChangeText={setNewItemUnit}
                />

                <View style={styles.buttonRow}>
                  <TouchableOpacity
                    style={styles.saveButton}
                    onPress={handleAddItem}
                  >
                    <Text style={styles.buttonText}>Save</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => setModalVisible(false)}
                  >
                    <Text style={styles.buttonText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </KeyboardAvoidingView>
          </SafeAreaView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  loadingText: {
    marginTop: 10,
    color: "#666",
  },

  header: {
    padding: 20,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
  },

  addButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },

  itemCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#fff",
    marginHorizontal: 15,
    marginTop: 10,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  itemName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2c3e50",
  },

  itemDetails: {
    color: "#7f8c8d",
    fontSize: 14,
  },

  quantity: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#4CAF50",
  },

  deleteButton: {
    backgroundColor: "#ff4444",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
  },

  emptyText: {
    textAlign: "center",
    marginTop: 50,
    color: "#999",
  },

  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingHorizontal: 20,
  },

  modalContainer: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 25,
  },

  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#333",
  },

  input: {
    backgroundColor: "#f9f9f9",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
  },

  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },

  saveButton: {
    backgroundColor: "#4CAF50",
    flex: 1,
    marginRight: 10,
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },

  cancelButton: {
    backgroundColor: "#999",
    flex: 1,
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },

  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
