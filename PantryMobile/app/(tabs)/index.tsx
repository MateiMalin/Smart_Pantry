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
  Keyboard,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { BlurView } from "expo-blur"; // Futuristic glass effect
import { LinearGradient } from "expo-linear-gradient"; // Vibrant background
import { pantryService } from "../../services/pantryService";
import { showConfirm } from "../../utils/crossPlatformAlert";

interface PantryItem {
  id: number;
  name: string;
  quantity: number;
  unit: string;
}

interface FieldErrors {
  name?: string;
  quantity?: string;
}

function showAlert(title: string, message: string) {
  if (Platform.OS === "web") {
    window.alert(`${title}\n\n${message}`);
  } else {
    Alert.alert(title, message);
  }
}

export default function PantryListScreen() {
  const [items, setItems] = useState<PantryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [newItemName, setNewItemName] = useState("");
  const [newItemQty, setNewItemQty] = useState("");
  const [newItemUnit, setNewItemUnit] = useState("Grams");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

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
      showAlert("Error", "Could not load pantry items.");
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
      setItems(previousItems); // Rollback on failure
      showAlert("Error", "Delete failed. Please try again.");
    }
  };

  const confirmDelete = (id: number, name: string) => {
    showConfirm("Delete Item", `Are you sure you want to remove ${name}?`, () =>
      handleDelete(id),
    );
  };

  const validate = (): FieldErrors => {
    const errors: FieldErrors = {};
    if (newItemName.trim().length === 0) {
      errors.name = "Item name is required.";
    }
    if (newItemQty.trim().length === 0) {
      errors.quantity = "Quantity is required.";
    } else if (isNaN(parseFloat(newItemQty)) || parseFloat(newItemQty) <= 0) {
      errors.quantity = "Must be a number greater than 0.";
    }
    return errors;
  };

  const handleAddItem = async () => {
    Keyboard.dismiss();
    const errors = validate();

    if (Object.keys(errors).length > 0) {
      if (Platform.OS === "web") {
        setFieldErrors(errors);
      } else {
        const firstError = errors.name ?? errors.quantity ?? "Invalid input.";
        Alert.alert("Validation", firstError);
      }
      return;
    }

    setFieldErrors({});

    try {
      const createdItem = await pantryService.addItem({
        name: newItemName.trim(),
        quantity: parseFloat(newItemQty),
        unit: newItemUnit.trim() || "Grams",
      });

      setItems((prev) => [...prev, createdItem]);
      handleCloseModal();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Could not add item.";
      showAlert("Error", errorMessage);
    }
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setNewItemName("");
    setNewItemQty("");
    setNewItemUnit("Grams");
    setFieldErrors({});
    Keyboard.dismiss();
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#38bdf8" />
        <Text style={styles.loadingText}>Calibrating pantry sensors...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <LinearGradient
        colors={["#0f172a", "#1e293b", "#334155"]}
        style={StyleSheet.absoluteFill}
      />

      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.header}>
          <Text style={styles.title}>Smart Pantry</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setModalVisible(true)}
          >
            <Text style={styles.addButtonText}>+ Add</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={items}
          keyExtractor={(item) => item.id.toString()}
          refreshing={refreshing}
          onRefresh={onRefresh}
          contentContainerStyle={{ paddingBottom: 40 }}
          renderItem={({ item }) => (
            <BlurView intensity={25} tint="light" style={styles.glassCard}>
              <View style={styles.cardContent}>
                {/* LEFT SECTION: TEXT STACK */}
                <View style={styles.textContainer}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <View style={styles.quantityRow}>
                    <Text style={styles.quantityValue}>{item.quantity}</Text>
                    <Text style={styles.unitLabel}>{item.unit}</Text>
                  </View>
                </View>

                {/* RIGHT SECTION: DELETE ONLY */}
                <TouchableOpacity
                  onPress={() => confirmDelete(item.id, item.name)}
                  style={styles.deleteCircle}
                >
                  <Text style={styles.deleteIcon}>✕</Text>
                </TouchableOpacity>
              </View>
            </BlurView>
          )}
          ListEmptyComponent={
            <Text style={styles.emptyText}>Pantry database empty.</Text>
          }
        />

        <Modal
          visible={modalVisible}
          animationType="fade"
          transparent
          onRequestClose={handleCloseModal}
        >
          <View style={styles.modalOverlay}>
            <BlurView intensity={100} tint="dark" style={styles.glassModal}>
              <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
              >
                <Text style={styles.modalTitle}>New Entry</Text>

                <TextInput
                  style={[
                    styles.glassInput,
                    fieldErrors.name && styles.inputError,
                  ]}
                  placeholder="Item Name"
                  placeholderTextColor="#94a3b8"
                  value={newItemName}
                  onChangeText={(text) => {
                    setNewItemName(text);
                    if (fieldErrors.name)
                      setFieldErrors((prev) => ({ ...prev, name: undefined }));
                  }}
                />
                {fieldErrors.name && (
                  <Text style={styles.errorText}>{fieldErrors.name}</Text>
                )}

                <TextInput
                  style={[
                    styles.glassInput,
                    fieldErrors.quantity && styles.inputError,
                  ]}
                  placeholder="Quantity"
                  placeholderTextColor="#94a3b8"
                  keyboardType="numeric"
                  value={newItemQty}
                  onChangeText={(text) => {
                    setNewItemQty(text);
                    if (fieldErrors.quantity)
                      setFieldErrors((prev) => ({
                        ...prev,
                        quantity: undefined,
                      }));
                  }}
                />
                {fieldErrors.quantity && (
                  <Text style={styles.errorText}>{fieldErrors.quantity}</Text>
                )}

                <TextInput
                  style={styles.glassInput}
                  placeholder="Unit (e.g. Grams)"
                  placeholderTextColor="#94a3b8"
                  value={newItemUnit}
                  onChangeText={setNewItemUnit}
                  onSubmitEditing={handleAddItem}
                />

                <View style={styles.buttonRow}>
                  <TouchableOpacity
                    style={styles.saveBtn}
                    onPress={handleAddItem}
                  >
                    <Text style={styles.btnText}>Save</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.cancelBtn}
                    onPress={handleCloseModal}
                  >
                    <Text style={styles.btnText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </KeyboardAvoidingView>
            </BlurView>
          </View>
        </Modal>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0f172a",
  },
  loadingText: { marginTop: 10, color: "#38bdf8", fontWeight: "500" },

  header: {
    padding: 24,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    color: "#f8fafc",
    letterSpacing: -1,
  },
  addButton: {
    backgroundColor: "#38bdf8",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
    shadowColor: "#38bdf8",
    shadowOpacity: 0.4,
    shadowRadius: 12,
  },
  addButtonText: { color: "#0f172a", fontWeight: "bold", fontSize: 16 },

  glassCard: {
    marginHorizontal: 20,
    marginTop: 15,
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  cardContent: {
    padding: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  textContainer: {
    flex: 1,
  },
  itemName: {
    fontSize: 20,
    fontWeight: "700",
    color: "#f1f5f9",
    marginBottom: 4,
  },
  quantityRow: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  quantityValue: {
    fontSize: 18,
    fontWeight: "600",
    color: "#38bdf8",
  },
  unitLabel: {
    fontSize: 14,
    color: "#94a3b8",
    marginLeft: 6,
    textTransform: "lowercase",
  },
  itemDetails: { color: "#94a3b8", fontSize: 14, marginTop: 4 },
  cardRight: { flexDirection: "row", alignItems: "center" },
  quantityText: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#38bdf8",
    marginRight: 15,
  },
  deleteCircle: {
    backgroundColor: "rgba(239, 68, 68, 0.15)",
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.3)",
  },
  deleteIcon: { color: "#ef4444", fontSize: 14, fontWeight: "bold" },
  emptyText: {
    textAlign: "center",
    marginTop: 100,
    color: "#64748b",
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    // 2. Darker overlay (0.85 instead of 0.7) to kill background noise
    backgroundColor: "rgba(0,0,0,0.85)",
  },
  glassModal: {
    width: "88%",
    borderRadius: 32,
    padding: 30,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    overflow: "hidden",
    // 3. Adding a solid base color helps the blur feel "thicker"
    backgroundColor: "rgba(30, 41, 59, 0.5)",
  },
  modalTitle: {
    fontSize: 26, // Slightly larger
    fontWeight: "800", // Extra bold
    color: "#fff",
    marginBottom: 25,
    textAlign: "center",
    letterSpacing: 0.5,
  },
  glassInput: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 15,
    padding: 15,
    marginBottom: 10,
    color: "#fff",
    fontSize: 16,
  },
  inputError: {
    borderColor: "#ef4444",
    backgroundColor: "rgba(239, 68, 68, 0.1)",
  },
  errorText: {
    color: "#ef4444",
    fontSize: 12,
    marginBottom: 10,
    marginLeft: 5,
  },

  buttonRow: { flexDirection: "row", gap: 10, marginTop: 15 },
  saveBtn: {
    flex: 2,
    backgroundColor: "#38bdf8",
    padding: 16,
    borderRadius: 15,
    alignItems: "center",
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.1)",
    padding: 16,
    borderRadius: 15,
    alignItems: "center",
  },
  btnText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});
