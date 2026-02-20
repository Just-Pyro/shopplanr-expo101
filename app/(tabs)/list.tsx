import { updateOverdue } from "@/services/api/apiClient";
import {
    shopPlanList as getPlanList,
    ShopPlan,
} from "@/services/database/database";
import { runSync } from "@/services/sync/SyncService";
import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";
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
    const [isRefreshing, setIsRefreshing] = useState(false);

    useEffect(() => {
        fetchShopPlanList();
    }, []);

    useEffect(() => {
        if (isFocus) {
            fetchShopPlanList();
        }
    }, [isFocus]);

    const fetchShopPlanList = async () => {
        try {
            setIsRefreshing(true);
            const authUser = await AsyncStorage.getItem("auth-user");
            if (authUser) {
                const user = JSON.parse(authUser);
                // const checkUp = await checkUpdates(user.id);
                // console.log("checkUp:", checkUp);
                const netState = await NetInfo.fetch();
                if (netState.isConnected) {
                    await runSync();
                }

                const result = await getPlanList(user.id);
                // console.log("result", result);

                if (result.length > 0) {
                    setSpList(result);
                } else {
                    setSpList([]);
                }

                const uod = await updateOverdue(user.id);
                // console.log("uod:", uod);
            }
        } catch (error) {
            console.error("error", error);
        } finally {
            setIsRefreshing(false);
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
                style={styles.planCard}
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
                        fontSize: 20,
                    }}
                >
                    {address}
                </Text>
                <View style={styles.planCardFooter}>
                    <Text style={styles.textFooter}>Total Items: {total}</Text>
                    <Text
                        style={[
                            statusName[status] == "Overdue"
                                ? styles.textDue
                                : styles.textLightTheme,
                            styles.textFooter,
                        ]}
                    >
                        {statusName[status]}
                    </Text>
                </View>
            </Pressable>
        );
    };

    const handleRefresh = () => {
        fetchShopPlanList();
    };

    return (
        <SafeAreaView style={styles.pageContainer}>
            <Link href="/shopplanr/create" asChild>
                <Pressable style={styles.primaryBtn}>
                    <Text style={styles.btnFont}>Add Plan</Text>
                </Pressable>
            </Link>
            <View style={styles.listContainer}>
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
                    ItemSeparatorComponent={() => (
                        <View style={{ height: 16 }} />
                    )}
                    keyExtractor={(item) =>
                        item.id?.toString() ?? "fallback-key"
                    }
                    onRefresh={handleRefresh}
                    refreshing={isRefreshing}
                />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    pageContainer: {
        height: "100%",
        backgroundColor: "#F7F7F7",
        padding: 16,
        gap: 32,
        alignItems: "center",
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
        boxShadow: "0 4px 4px lightgray",
    },
    btnFont: {
        fontSize: 18,
        color: "#FFF",
    },
    planCard: {
        width: 336,
        padding: 20,
        borderRadius: 15,
        backgroundColor: "#EAEAEA",
        boxShadow: "0 4px 4px lightgray",
        gap: 20,
    },
    listContainer: {
        flex: 1,
    },
    planCardFooter: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    textLightTheme: {
        color: "#1A1A1A",
    },
    textDue: {
        color: "#9F2305",
    },
    textFooter: {
        fontSize: 12,
    },
});
