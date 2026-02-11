import {
    shopPlanList as getPlanList,
    initDB,
    ShopPlan,
} from "@/services/database/database";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useIsFocused } from "@react-navigation/native";
import { Link, router } from "expo-router";
import React, { useEffect, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type ShopPlanList = {
    id: number;
    address: string;
    date_scheduled: string;
    budget: number;
    number_of_items: number;
    status: number;
};

export default function list() {
    const isFocus = useIsFocused();
    const [spList, setSpList] = useState<ShopPlan[]>([]);

    useEffect(() => {
        (async () => {
            await initDB();
        })();

        fetchShopPlanList();
    }, []);

    useEffect(() => {
        if (isFocus) {
            fetchShopPlanList();
        }
    }, [isFocus]);

    const fetchShopPlanList = async () => {
        try {
            const authUser = await AsyncStorage.getItem("auth-user");
            if (authUser) {
                const user = JSON.parse(authUser);
                const result = await getPlanList(user.id);

                if (result.length > 0) {
                    setSpList(result);
                } else {
                    setSpList([]);
                }
            }
        } catch (error) {
            console.error("error", error);
        }
    };

    const handleLogout = async () => {
        try {
            await AsyncStorage.removeItem("auth-user");

            router.replace("/");
        } catch (error) {
            console.error("error:", error);
        }
    };

    interface PlanItemType {
        id?: number;
        address: string;
        total: number;
        status: number;
    }

    const PlanItem = ({ id, address, total, status }: PlanItemType) => {
        if (!id) return;

        const statusName = ["Pending", "In Progress", "Completed", "Overdue"];

        return (
            <Pressable
                style={{
                    borderWidth: 4,
                    width: "100%",
                    padding: 20,
                    marginBottom: 15,
                    position: "relative",
                    alignSelf: "center",
                    boxShadow: "0px 4px 4px lightgray",
                    flexDirection: "row",
                    justifyContent: "space-between",
                }}
                onPress={() => {
                    router.push({
                        pathname: "/shopplanr/[planId]",
                        params: { planId: id.toString() },
                    });
                }}
            >
                <Text
                    style={{
                        flex: 1,
                        fontWeight: "bold",
                        fontSize: 24,
                    }}
                >
                    {address}
                </Text>
                <Text style={{ width: 100 }}>Items: {total}</Text>
                <Text style={{ width: 100 }}>{statusName[status]}</Text>
            </Pressable>
        );
    };

    return (
        <SafeAreaView style={styles.pageContainer}>
            <View style={styles.headerContainer}>
                <Link href="/shopplanr/create" asChild>
                    <Pressable style={styles.primaryButton}>
                        <Text style={{ color: "white" }}>Create ShopPlan</Text>
                    </Pressable>
                </Link>
            </View>
            <View
                style={{
                    flex: 1,
                    width: "100%",
                    position: "relative",
                }}
            >
                <FlatList
                    data={spList}
                    renderItem={({ item }) => (
                        // <Text style={{ borderWidth: 1, width: "100%" }}>
                        //     {item.address}
                        // </Text>
                        <PlanItem
                            id={item?.id}
                            address={item.address}
                            total={item.number_of_items}
                            status={item.status}
                        />
                    )}
                    keyExtractor={(item) =>
                        item.id?.toString() ?? "fallback-key"
                    }
                />
                <Pressable
                    style={({ pressed }) => [
                        styles.logoutButton,
                        {
                            backgroundColor: pressed ? "red" : "transparent",
                        },
                    ]}
                    onPress={handleLogout}
                >
                    {({ pressed }) => (
                        <Text
                            style={{
                                color: pressed ? "white" : "red",
                            }}
                        >
                            Logout
                        </Text>
                    )}
                </Pressable>
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
        gap: 10,
    },
    primaryButton: {
        paddingVertical: 15,
        paddingHorizontal: 20,
        width: "100%",
        borderRadius: 10,
        backgroundColor: "black",
        justifyContent: "center",
        alignItems: "center",
    },
    logoutButton: {
        paddingVertical: 15,
        paddingHorizontal: 20,
        width: "80%",
        borderRadius: 10,
        borderWidth: 4,
        borderColor: "red",
        justifyContent: "center",
        alignItems: "center",
        alignSelf: "center",
        position: "absolute",
        bottom: 10,
        boxShadow: "0px 2px 4px lightgray",
    },
    headerContainer: {
        width: "100%",
    },
});
