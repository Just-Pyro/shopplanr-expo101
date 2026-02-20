import { Tabs } from "expo-router";
import React from "react";

import { HapticTab } from "@/components/haptic-tab";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Text } from "react-native";

export default function TabLayout() {
    const colorScheme = useColorScheme();

    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
                headerShown: false,
                tabBarButton: HapticTab,
                tabBarLabelPosition: "beside-icon",
                tabBarStyle: { backgroundColor: "#1A1A1A" },
            }}
        >
            <Tabs.Screen
                name="list"
                options={{
                    title: "Home",
                    tabBarIcon: () => (
                        <MaterialIcons
                            color={"#fff"}
                            size={22}
                            name="home-filled"
                        />
                    ),
                    tabBarLabel: () => (
                        <Text
                            style={{
                                color: "#fff",
                            }}
                        >
                            Home
                        </Text>
                    ),
                }}
            />
            <Tabs.Screen
                name="settings"
                options={{
                    title: "Settings",
                    tabBarIcon: () => (
                        <MaterialIcons
                            color={"#fff"}
                            size={22}
                            name="settings"
                        />
                    ),
                    tabBarLabel: () => (
                        <Text
                            style={{
                                color: "#fff",
                            }}
                        >
                            Settings
                        </Text>
                    ),
                }}
            />
        </Tabs>
    );
}
