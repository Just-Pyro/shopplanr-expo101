import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, Switch, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function settings() {
    const handleLogout = async () => {
        try {
            await AsyncStorage.removeItem("auth-user");

            router.replace("/");
        } catch (error) {
            console.error("error:", error);
        }
    };

    return (
        <SafeAreaView style={styles.pageContainer}>
            <View style={styles.profileHeader}>
                <View style={styles.profileIcon}>
                    <Text style={styles.profileInitials}>SS</Text>
                </View>
                <View style={styles.profileInfo}>
                    <Text style={[styles.profileName, styles.textLightTheme]}>
                        Settings
                    </Text>
                    <Text style={[styles.profileEmail, styles.textLightTheme]}>
                        Settings
                    </Text>
                </View>
            </View>
            <View style={styles.infoGrouping}>
                <Text style={[styles.textLightTheme, styles.textInfo]}>
                    Version
                </Text>
                <Text style={{ flex: 1 }}>v1.0</Text>
            </View>
            <View style={styles.infoGrouping}>
                <Text style={[styles.textLightTheme, styles.textInfo]}>
                    Auto-Sync
                </Text>
                <View
                    style={{
                        flex: 1,
                        alignItems: "flex-start",
                    }}
                >
                    <Switch />
                </View>
            </View>
            <View style={styles.infoGrouping}>
                <Pressable onPress={handleLogout}>
                    <Text style={styles.textAccent}>Log out</Text>
                </Pressable>
                <View style={{ flex: 1 }}></View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    pageContainer: {
        height: "100%",
        backgroundColor: "#F7F7F7",
        padding: 20,
        gap: 32,
        alignItems: "center",
    },
    profileHeader: {
        flexDirection: "row",
        gap: 16,
    },
    profileIcon: {
        width: 75,
        height: 75,
        backgroundColor: "#EAEAEA",
        borderRadius: 50,
        justifyContent: "center",
        alignItems: "center",
    },
    profileInitials: {
        fontSize: 30,
        fontWeight: "bold",
    },
    profileInfo: {
        flex: 1,
        justifyContent: "center",
    },
    profileName: {
        fontSize: 22,
        fontWeight: "bold",
    },
    profileEmail: {
        fontSize: 16,
    },
    textLightTheme: {
        color: "#1A1A1A",
    },
    textAccent: {
        color: "#CC5500",
        fontSize: 16,
        alignSelf: "center",
    },
    textInfo: {
        fontSize: 16,
        width: "30%",
        alignSelf: "center",
    },
    infoGrouping: {
        flexDirection: "row",
    },
});
