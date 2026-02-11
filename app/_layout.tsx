import {
    DarkTheme,
    DefaultTheme,
    ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import "react-native-reanimated";

import { useColorScheme } from "@/hooks/use-color-scheme";

export const unstable_settings = {
    anchor: "(tabs)",
};

export default function RootLayout() {
    const colorScheme = useColorScheme();

    return (
        <ThemeProvider
            value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
        >
            <Stack>
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

                <Stack.Screen
                    name="modal"
                    options={{ presentation: "modal", title: "Modal" }}
                />
                <Stack.Screen
                    name="shopplanr/list"
                    options={{
                        headerShown: false,
                        presentation: "card",
                        animation: "none",
                    }}
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
                        title: "Shop Plan Item List",
                    }}
                />
            </Stack>
            {/* <StatusBar style="auto" /> */}
        </ThemeProvider>
    );
}
