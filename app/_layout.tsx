import {
    DarkTheme,
    DefaultTheme,
    ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import "react-native-reanimated";

import { AppProvider } from "@/context/AppContext";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { initDB } from "@/services/database/database";
import { runSync } from "@/services/sync/SyncService";
import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";
import { useEffect } from "react";

export const unstable_settings = {
    anchor: "(tabs)",
};

export default function RootLayout() {
    useEffect(() => {
        (async () => {
            await initDB();
        })();

        (async () => {
            const usersync = await AsyncStorage.getItem("user-autosync");
            let autosync = true;
            if (usersync) {
                autosync = JSON.parse(usersync);
            }

            if (autosync) runSync();
        })();

        const unsub = NetInfo.addEventListener(async (state) => {
            const usersync = await AsyncStorage.getItem("user-autosync");
            let autosync = true;
            if (usersync) {
                autosync = JSON.parse(usersync);
            }

            if (state.isConnected && autosync) {
                runSync();
            }
        });

        return () => unsub();
    }, []);

    const colorScheme = useColorScheme();

    return (
        <AppProvider>
            <ThemeProvider
                value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
            >
                <Stack>
                    <Stack.Screen
                        name="index"
                        options={{
                            headerShown: false,
                            presentation: "card",
                            animation: "none",
                        }}
                    />
                    <Stack.Screen
                        name="register"
                        options={{
                            headerShown: false,
                            presentation: "card",
                            animation: "none",
                        }}
                    />
                    <Stack.Screen
                        name="(tabs)"
                        options={{
                            headerShown: false,
                            animation: "none",
                        }}
                    />
                    <Stack.Screen
                        name="modal"
                        options={{ presentation: "modal", title: "Modal" }}
                    />
                    <Stack.Screen
                        name="shopplanr/create"
                        options={{
                            headerShown: true,
                            headerStyle: {
                                backgroundColor: "#fff",
                            },
                            headerTintColor: "black",
                            headerTitleStyle: {
                                color: "black",
                            },
                            presentation: "modal",
                            title: "Create Plan",
                        }}
                    />

                    <Stack.Screen
                        name="shopplanr/[planId]"
                        options={{
                            headerShown: true,
                            headerStyle: {
                                backgroundColor: "#fff",
                            },
                            headerTintColor: "black",
                            headerTitleStyle: {
                                color: "black",
                            },
                            presentation: "modal",
                            title: "Shop Plan",
                        }}
                    />
                </Stack>
                {/* <StatusBar style="auto" /> */}
            </ThemeProvider>
        </AppProvider>
    );
}
