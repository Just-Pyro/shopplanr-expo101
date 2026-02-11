import { ApiResponse, registerUser } from "@/services/api/apiClient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useState } from "react";
import {
    Alert,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function TabTwoScreen() {
    const [textInput, setTextInput] = useState({
        first_name: "",
        last_name: "",
        email: "",
        password: "",
    });

    const handleRegister = async () => {
        try {
            const response = await registerUser(textInput);
            if (response.success) {
                await AsyncStorage.setItem(
                    "auth-user",
                    JSON.stringify(response.data),
                );
                router.replace("/shopplanr/list");
            }
        } catch (error: any) {
            const data = error.response?.data as ApiResponse;
            if (data?.errors) {
                const message = Object.values(data.errors).flat()[0];

                Alert.alert("Login Failed", message);
            } else {
                Alert.alert("Login Failed", data?.message);
            }
        }
    };

    return (
        <SafeAreaView style={styles.pageContainer}>
            <View style={styles.formWrapper}>
                <View style={styles.loginForm}>
                    <Text style={styles.pageTitle}>Register</Text>
                    <View
                        style={{
                            position: "relative",
                            height: 34,
                        }}
                    >
                        <TextInput
                            style={styles.textInput}
                            placeholder="First Name"
                            onChangeText={(text) =>
                                setTextInput((prev) => ({
                                    ...prev,
                                    first_name: text,
                                }))
                            }
                        />
                        <View style={styles.inputShadow}></View>
                    </View>
                    <View
                        style={{
                            position: "relative",
                            height: 34,
                        }}
                    >
                        <TextInput
                            style={styles.textInput}
                            placeholder="Last Name"
                            onChangeText={(text) =>
                                setTextInput((prev) => ({
                                    ...prev,
                                    last_name: text,
                                }))
                            }
                        />
                        <View style={styles.inputShadow}></View>
                    </View>
                    <View
                        style={{
                            position: "relative",
                            height: 34,
                        }}
                    >
                        <TextInput
                            style={styles.textInput}
                            placeholder="Email"
                            onChangeText={(text) =>
                                setTextInput((prev) => ({
                                    ...prev,
                                    email: text,
                                }))
                            }
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                        <View style={styles.inputShadow}></View>
                    </View>
                    <View
                        style={{
                            position: "relative",
                            height: 34,
                        }}
                    >
                        <TextInput
                            style={styles.textInput}
                            placeholder="Password"
                            onChangeText={(text) =>
                                setTextInput((prev) => ({
                                    ...prev,
                                    password: text,
                                }))
                            }
                            secureTextEntry={true}
                            autoCapitalize="none"
                            autoCorrect={false}
                        />
                        <View style={styles.inputShadow}></View>
                    </View>
                    <Pressable style={styles.loginBtn} onPress={handleRegister}>
                        <Text style={{ color: "white", fontSize: 16 }}>
                            Register
                        </Text>
                    </Pressable>
                </View>
                <View style={styles.formShadow}></View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    pageContainer: {
        height: "100%",
        borderWidth: 1,
        backgroundColor: "white",
        padding: 30,
        justifyContent: "center",
        alignItems: "center",
    },
    formWrapper: {
        position: "relative",
        width: "100%",
        maxWidth: 450,
    },
    loginForm: {
        borderWidth: 4,
        borderRadius: 20,
        height: 500,
        width: "100%",
        justifyContent: "center",
        padding: 45,
        gap: 16,
        backgroundColor: "white",
        zIndex: 1,
    },
    formShadow: {
        height: 500,
        width: "100%",
        position: "absolute",
        top: 16,
        left: 16,
        backgroundColor: "black",
        borderRadius: 20,
        zIndex: -1,
    },
    pageTitle: {
        fontSize: 32,
        fontWeight: "bold",
    },
    textInput: {
        borderWidth: 4,
        paddingVertical: 5,
        paddingHorizontal: 10,
        height: 40,
        zIndex: 1,
        backgroundColor: "white",
    },
    inputShadow: {
        height: 40,
        position: "absolute",
        top: 6,
        left: 6,
        borderWidth: 2,
        width: "100%",
        backgroundColor: "black",
        zIndex: -1,
    },
    loginBtn: {
        borderRadius: 5,
        justifyContent: "center",
        alignContent: "center",
        backgroundColor: "black",
        flexDirection: "row",
        paddingVertical: 10,
        paddingHorizontal: 20,
        width: "102%",
        marginTop: 20,
    },
});
