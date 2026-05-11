import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { Formik } from "formik";
import * as Yup from "yup";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import api from "../../services/api";

const registerSchema = Yup.object().shape({
  email: Yup.string().email("Invalid email").required("Email is required"),
  password: Yup.string()
    .min(8, "Password must be at least 8 characters")
    .required("Password is required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password")], "Passwords do not match")
    .required("Please confirm your password"),
});

export default function RegisterScreen() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [registerError, setRegisterError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleRegister = async (values: {
    email: string;
    password: string;
    confirmPassword: string;
  }) => {
    setRegisterError(null);
    setLoading(true);
    try {
      await api.post("/auth/register", {
        email: values.email,
        password: values.password,
      });
      // Registration successful — go to login
      router.replace("/auth/login");
    } catch (error: any) {
      const message =
        error?.response?.data ?? "Registration failed. Please try again.";
      setRegisterError(
        typeof message === "string" ? message : "Registration failed.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Account</Text>

      <Formik
        initialValues={{ email: "", password: "", confirmPassword: "" }}
        validationSchema={registerSchema}
        onSubmit={handleRegister}
      >
        {({
          handleChange,
          handleBlur,
          handleSubmit,
          values,
          errors,
          touched,
        }) => (
          <>
            {/* EMAIL */}
            <TextInput
              placeholder="Email"
              style={[
                styles.input,
                touched.email && errors.email ? styles.inputError : undefined,
              ]}
              value={values.email}
              onChangeText={handleChange("email")}
              onBlur={handleBlur("email")}
              autoCapitalize="none"
              keyboardType="email-address"
            />
            {touched.email && errors.email && (
              <Text style={styles.error}>{errors.email}</Text>
            )}

            {/* PASSWORD */}
            <View
              style={[
                styles.passwordContainer,
                touched.password && errors.password
                  ? styles.inputError
                  : undefined,
              ]}
            >
              <TextInput
                placeholder="Password"
                secureTextEntry={!showPassword}
                style={styles.passwordInput}
                value={values.password}
                onChangeText={handleChange("password")}
                onBlur={handleBlur("password")}
              />
              <TouchableOpacity onPress={() => setShowPassword((p) => !p)}>
                <Ionicons
                  name={showPassword ? "eye-off-outline" : "eye-outline"}
                  size={22}
                  color="#4CAF50"
                />
              </TouchableOpacity>
            </View>
            {touched.password && errors.password && (
              <Text style={styles.error}>{errors.password}</Text>
            )}

            {/* CONFIRM PASSWORD */}
            <View
              style={[
                styles.passwordContainer,
                touched.confirmPassword && errors.confirmPassword
                  ? styles.inputError
                  : undefined,
              ]}
            >
              <TextInput
                placeholder="Confirm Password"
                secureTextEntry={!showConfirm}
                style={styles.passwordInput}
                value={values.confirmPassword}
                onChangeText={handleChange("confirmPassword")}
                onBlur={handleBlur("confirmPassword")}
              />
              <TouchableOpacity onPress={() => setShowConfirm((p) => !p)}>
                <Ionicons
                  name={showConfirm ? "eye-off-outline" : "eye-outline"}
                  size={22}
                  color="#4CAF50"
                />
              </TouchableOpacity>
            </View>
            {touched.confirmPassword && errors.confirmPassword && (
              <Text style={styles.error}>{errors.confirmPassword}</Text>
            )}

            {registerError && <Text style={styles.error}>{registerError}</Text>}

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleSubmit as any}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Create Account</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.linkButton}
              onPress={() => router.replace("/auth/login")}
            >
              <Text style={styles.linkText}>
                Already have an account? Log in
              </Text>
            </TouchableOpacity>
          </>
        )}
      </Formik>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 30,
    textAlign: "center",
    color: "#333",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 12,
    borderRadius: 10,
    marginBottom: 4,
    backgroundColor: "#fff",
    fontSize: 16,
  },
  inputError: {
    borderColor: "#ff4444",
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    marginBottom: 4,
    paddingHorizontal: 10,
    backgroundColor: "#fff",
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
  },
  error: {
    color: "red",
    marginBottom: 10,
    fontSize: 12,
    marginLeft: 4,
  },
  button: {
    backgroundColor: "#4CAF50",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
  },
  buttonDisabled: {
    backgroundColor: "#a5d6a7",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  linkButton: {
    marginTop: 16,
    alignItems: "center",
  },
  linkText: {
    color: "#4CAF50",
    fontSize: 14,
  },
});
