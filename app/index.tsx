import { ApiResponse, login } from "@/services/api/apiClient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Link, router } from "expo-router";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
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
        (async () => {
            const user = await AsyncStorage.getItem("auth-user");

            // console.log("user", user);
            if (user) {
                router.replace("/(tabs)/list");
            }
        })();
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
                router.replace("/(tabs)/list");
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
            <Image
                style={styles.appLogo}
                source={require("../assets/images/ShopPlanr-nobg.png")}
            />
            <Text style={[styles.pageTitle, styles.textLightTheme]}>
                Log in
            </Text>
            <View style={styles.loginForm}>
                <TextInput
                    style={[styles.textInput, styles.textLightTheme]}
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

                <TextInput
                    style={[styles.textInput, styles.textLightTheme]}
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

                <Pressable style={styles.primaryBtn} onPress={handleLogin}>
                    {isLoading ? (
                        <ActivityIndicator color={"white"} />
                    ) : (
                        <Text style={styles.btnFont}>Login</Text>
                    )}
                </Pressable>
            </View>
            <Text>
                Don't have an account?{" "}
                <Link href={"/register"} style={styles.pageLink}>
                    Register here
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
        height: 117,
        width: 290,
    },
    pageTitle: {
        fontSize: 36,
        fontWeight: "bold",
    },
    loginForm: {
        justifyContent: "center",
        gap: 32,
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
