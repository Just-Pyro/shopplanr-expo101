import {
    ApiResponse,
    testApi as ApiTest,
    login,
} from "@/services/api/apiClient";
import { resetDB, showData } from "@/services/database/database";
import { runSync } from "@/services/sync/SyncService";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HomeScreen() {
    const [textInput, setTextInput] = useState({
        email: "",
        password: "",
    });
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        async () => {
            const user = await AsyncStorage.getItem("auth-user");
        };
    }, []);

    const handleLogin = async () => {
        try {
            setIsLoading(true);
            const response = await login(textInput);
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
        } finally {
            setIsLoading(false);
        }
    };

    const handleReset = async () => {
        try {
            const result = await resetDB();
        } catch (error: any) {
            console.error("error", error);
        }
    };

    const showDB = async () => {
        try {
            const result = await showData();
            // console.log("type:", typeof result);
            // console.log("po:", result);
            console.log("test");
            console.log("result", result);
            if (typeof result == "object") {
                result.forEach((item: any) => {
                    console.log(item);
                });
                // for (const [key, value] of Object.entries(result)) {
                //     console.log(`${key}: ${value}`);
                // }
            } else {
                console.log("empty", result);
            }
        } catch (error: any) {
            console.error("error", error);
        }
    };

    const syncOperation = async () => {
        try {
            await runSync();
        } catch (error: any) {
            console.error("error", error);
        }
    };

    const testApi = async () => {
        try {
            const result = await ApiTest();
            console.log("test api: ", result.message);
        } catch (error: any) {
            console.error("error", error);
        }
    };

    return (
        <SafeAreaView style={styles.pageContainer}>
            <View style={styles.formWrapper}>
                <View style={styles.loginForm}>
                    <Text style={styles.pageTitle}>Login</Text>
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
                            autoCapitalize="none"
                            keyboardType="email-address"
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
                            autoCapitalize="none"
                            autoCorrect={false}
                            secureTextEntry={true}
                        />
                        <View style={styles.inputShadow}></View>
                    </View>
                    <Pressable style={styles.loginBtn} onPress={handleLogin}>
                        {isLoading ? (
                            <ActivityIndicator color={"white"} />
                        ) : (
                            <Text style={{ color: "white", fontSize: 16 }}>
                                Login
                            </Text>
                        )}
                    </Pressable>
                </View>
                <View style={styles.formShadow}></View>
            </View>
            <Pressable
                style={{ borderWidth: 1, padding: 5, marginTop: 20 }}
                onPress={handleReset}
            >
                <Text>Reset</Text>
            </Pressable>
            <Pressable style={{ borderWidth: 1, padding: 5 }} onPress={showDB}>
                <Text>Show Pending</Text>
            </Pressable>
            {/* <Pressable
                style={{ borderWidth: 1, padding: 5 }}
                onPress={syncOperation}
            >
                <Text>Sync Online</Text>
            </Pressable>
            <Pressable style={{ borderWidth: 1, padding: 5 }} onPress={testApi}>
                <Text>test api</Text>
            </Pressable> */}
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
