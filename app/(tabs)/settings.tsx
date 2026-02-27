import { useAppContext } from "@/context/AppContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { Pressable, StyleSheet, Switch, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function settings() {
    const [userInfo, setUserInfo] = useState({
        profile_initial: "SS",
        full_name: "Settings",
        email: "settings",
    });
    // const [isSync, setIsSync] = useState(true);
    const { isSync, setIsSync } = useAppContext();

    const toggleSwitch = async () => {
        const flipVal = !isSync;
        setIsSync(flipVal);

        await AsyncStorage.setItem("user-autosync", flipVal.toString());
    };

    const handleLogout = async () => {
        try {
            await AsyncStorage.removeItem("auth-user");

            router.replace("/");
        } catch (error) {
            console.error("error:", error);
        }
    };

    useEffect(() => {
        processUserInfo();
    }, []);

    const processUserInfo = async () => {
        const authUser = await AsyncStorage.getItem("auth-user");
        if (authUser) {
            const user = JSON.parse(authUser);

            const initialName =
                user.first_name[0].toUpperCase() +
                user.last_name[0].toUpperCase();

            setUserInfo({
                profile_initial: initialName,
                full_name: user.full_name,
                email: user.email,
            });
        }
    };

    return (
        <SafeAreaView style={styles.pageContainer}>
            <View style={styles.profileHeader}>
                <View style={styles.profileIcon}>
                    <Text style={styles.profileInitials}>
                        {userInfo.profile_initial}
                    </Text>
                </View>
                <View style={styles.profileInfo}>
                    <Text style={[styles.profileName, styles.textLightTheme]}>
                        {userInfo.full_name}
                    </Text>
                    <Text style={[styles.profileEmail, styles.textLightTheme]}>
                        {userInfo.email}
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
                        flexDirection: "row",
                        justifyContent: "space-between",
                    }}
                >
                    <Switch onValueChange={toggleSwitch} value={isSync} />

                    {!isSync && (
                        <Pressable style={styles.primaryBtn}>
                            <Text
                                style={{
                                    color: "#fff",
                                    fontSize: 16,
                                    textAlign: "center",
                                }}
                            >
                                Sync &uarr;
                            </Text>
                        </Pressable>
                    )}
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
    primaryBtn: {
        borderRadius: 15,
        display: "flex",
        justifyContent: "center",
        alignContent: "center",
        backgroundColor: "#CC5500",
        // flexDirection: "row",
        width: 80,
        height: 50,
        padding: 14,
        boxShadow: "0 4px 4px lightgray",
    },
});
