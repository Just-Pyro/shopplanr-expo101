import { ApiResponse, registerUser } from "@/services/api/apiClient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Link, router } from "expo-router";
import { useState } from "react";
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

export default function TabTwoScreen() {
    const [textInput, setTextInput] = useState({
        first_name: "",
        last_name: "",
        email: "",
        password: "",
    });
    const [isLoading, setIsLoading] = useState(false);

    const handleRegister = async () => {
        try {
            setIsLoading(true);
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
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.pageContainer}>
            <Text style={[styles.pageTitle, styles.textLightTheme]}>
                Register
            </Text>
            <View style={styles.loginForm}>
                <TextInput
                    style={[styles.textInput, styles.textLightTheme]}
                    placeholder="First Name"
                    onChangeText={(text) =>
                        setTextInput((prev) => ({
                            ...prev,
                            first_name: text,
                        }))
                    }
                />
                <TextInput
                    style={[styles.textInput, styles.textLightTheme]}
                    placeholder="Last Name"
                    onChangeText={(text) =>
                        setTextInput((prev) => ({
                            ...prev,
                            last_name: text,
                        }))
                    }
                />
                <TextInput
                    style={[styles.textInput, styles.textLightTheme]}
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
                <TextInput
                    style={[styles.textInput, styles.textLightTheme]}
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
                <Pressable style={styles.primaryBtn} onPress={handleRegister}>
                    {isLoading ? (
                        <ActivityIndicator color={"white"} />
                    ) : (
                        <Text style={styles.btnFont}>Register</Text>
                    )}
                </Pressable>
            </View>
            <Text>
                Already have an account?{" "}
                <Link href={"/"} style={styles.pageLink}>
                    Login here
                </Link>
            </Text>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    pageContainer: {
        height: "100%",
        backgroundColor: "#F7F7F7",
        padding: 16,
        gap: 16,
        alignItems: "center",
        justifyContent: "center",
    },
    appLogo: {
        marginTop: 36,
        height: 117,
        width: 290,
    },
    pageTitle: {
        fontSize: 36,
        fontWeight: "bold",
    },
    loginForm: {
        justifyContent: "center",
        gap: 26,
        zIndex: 1,
    },
    textInput: {
        padding: 20,
        width: 336,
        height: 57,
        zIndex: 1,
        backgroundColor: "#EAEAEA",
        borderRadius: 15,
        boxShadow: "0 4px 4px lightgray",
    },
    textLightTheme: {
        color: "#1A1A1A",
    },
    textDarkTheme: {
        color: "#FFF",
    },
    primaryBtn: {
        borderRadius: 15,
        display: "flex",
        justifyContent: "center",
        alignContent: "center",
        backgroundColor: "#CC5500",
        flexDirection: "row",
        width: 336,
        height: 57,
        padding: 16,
        marginTop: 58,
        boxShadow: "0 4px 4px lightgray",
    },
    btnFont: {
        fontSize: 18,
        color: "#FFF",
    },
    pageLink: {
        textDecorationLine: "underline",
        color: "#CC5500",
    },
});
