import { updateOverdue } from "@/services/api/apiClient";
import {
    showShopPlan,
    startShopPlan,
    UpdateShopPlan,
    updateShopPlan,
} from "@/services/database/database";
import { runSync } from "@/services/sync/SyncService";
import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";
import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Params = {
    planId: string;
};

type Item = {
    id: string;
    name: string;
    price: number;
    expected_quantity: number;
    actual_quantity: number;
    total: number;
};
type ItemExport = {
    id: number;
    price: number;
    actual_quantity: number;
};
type ItemProp = {
    id: string;
    name: string;
    expected_quantity: number;
    actual_quantity: number;
    price: number;
    total: number;
    changeValue: (
        id: string,
        text: string,
        key:
            | "name"
            | "expected_quantity"
            | "actual_quantity"
            | "price"
            | "total",
    ) => void;
    start: boolean;
};

interface TextInputType {
    address: string;
    date_scheduled: string;
    budget: number;
    number_of_items: number;
    status: number;
}

export default function updateProduct() {
    const { planId } = useLocalSearchParams<Params>();

    const [textInput, setTextInput] = useState<TextInputType>({
        address: "",
        date_scheduled: new Date().toDateString(),
        budget: 0,
        number_of_items: 0,
        status: 0,
    });
    const [productItems, setProductItems] = useState<Item[]>([]);
    const [origBudget, setOrigBudget] = useState(0);
    const [start, setStart] = useState(false);
    const [switchButton, setSwitchButton] = useState(false);
    const [dateIsNow, setDateIsNow] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        (async () => {
            const authUser = await AsyncStorage.getItem("auth-user");
            if (authUser) {
                const user = JSON.parse(authUser);
                await updateOverdue(user.id);
            }
        })();
        fetchPlan(planId);
    }, []);

    const fetchPlan = async (id: string) => {
        try {
            const result = await showShopPlan(Number(id));

            if (result) {
                const plan_info = result.shop_plan_info;

                const d = new Date(plan_info.date_scheduled.replace(" ", "T"));
                const year = d.getFullYear();
                const month = (d.getMonth() + 1).toString().padStart(2, "0");
                const day = d.getDate().toString().padStart(2, "0");
                const rd_f = `${year}-${month}-${day}`;
                const formattedDate = d.toDateString();

                const d_now = new Date();
                const y_now = d_now.getFullYear();
                const m_now = (d_now.getMonth() + 1)
                    .toString()
                    .padStart(2, "0");
                const day_n = d_now.getDate().toString().padStart(2, "0");
                const d_f = `${y_now}-${m_now}-${day_n}`;

                if (rd_f === d_f) {
                    setDateIsNow(true);
                }

                setTextInput({
                    address: plan_info.address,
                    date_scheduled: formattedDate,
                    budget: plan_info.budget,
                    number_of_items: plan_info.number_of_items,
                    status: plan_info.status,
                });
                setOrigBudget(plan_info.budget);

                if (plan_info.status == 1) {
                    setStart(true);
                } else {
                    setStart(false);
                }

                const plan_items = result.shop_plan_items;
                plan_items.forEach((shopitem) => {
                    setProductItems((prev) => {
                        return [
                            ...prev,
                            {
                                id: shopitem.id.toString(),
                                name: shopitem.name,
                                price: shopitem.price,
                                expected_quantity: shopitem.expected_quantity,
                                actual_quantity: shopitem.actual_quantity,
                                total:
                                    shopitem.price * shopitem.actual_quantity,
                            },
                        ];
                    });
                });
                // }
            }
        } catch (error: any) {
            console.error("error", error);
        }
    };

    const updateProduct = (id: string, text: string, key: string) => {
        setProductItems((prev) =>
            prev.map((item) => {
                if (item.id === id) {
                    const numbered_prop = ["actual_quantity", "price"];

                    const newValue =
                        numbered_prop.includes(key) &&
                        text !== "" &&
                        (text[text.length - 1] != "." ||
                            (text[text.length - 1] == "." &&
                                key == "actual_quantity"))
                            ? Number(text)
                            : text;

                    const nextPrice =
                        key === "price" ? Number(newValue) : Number(item.price);

                    const nextQty =
                        key === "actual_quantity"
                            ? Number(newValue)
                            : Number(item.actual_quantity);

                    const total_price = parseFloat(
                        (nextPrice * nextQty).toFixed(2),
                    );

                    return {
                        ...item,
                        [key]: newValue,
                        total: total_price,
                    };
                } else {
                    return item;
                }
            }),
        );

        // setTextInput((prev) => ({
        //     ...prev,
        //     budget: prev.budget - total_price,
        // }));
    };

    useEffect(() => {
        const total_price = productItems.reduce((acc, val) => {
            return acc + val.total;
        }, 0);

        setTextInput((prev) => ({
            ...prev,
            budget: parseFloat((origBudget - total_price).toFixed(2)),
        }));
    }, [productItems]);

    const startShopping = async () => {
        try {
            setStart(true);

            const result = await startShopPlan(Number(planId));

            if (result === true) {
                setSwitchButton(true);

                const netState = await NetInfo.fetch();
                if (netState.isConnected) {
                    runSync();
                }
            } else if (result === false) {
                Alert.alert("Failed To Start", "Another Plan is In Progress");
            }
        } catch (error: any) {
            console.error("error:", error);
        }
    };

    const completeShopping = async () => {
        try {
            setIsLoading(true);
            const updatePlan: UpdateShopPlan = {
                shop_plan_id: Number(planId),
                budget: textInput.budget,
                status: 2,
                items: productItems.map(
                    ({ id, name, price, actual_quantity }) => ({
                        id: Number(id),
                        name,
                        price,
                        actual_quantity,
                    }),
                ),
            };
            const result = await updateShopPlan(updatePlan);

            if (result === true) {
                setSwitchButton(false);
                setTextInput((prev) => ({ ...prev, status: 3 }));
                setStart(false);

                const netState = await NetInfo.fetch();
                if (netState.isConnected) {
                    runSync();
                }
            }
        } catch (error: any) {
            console.error("error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.pageContainer}>
            <View style={styles.headContainer}>
                <View style={styles.inputGroup}>
                    <Text style={[styles.inputLabel, styles.textLightTheme]}>
                        Address
                    </Text>
                    <TextInput
                        style={[styles.textInput, styles.textLightTheme]}
                        placeholder="Address"
                        // onChangeText={(text) =>
                        //     setTextInput((prev) => ({
                        //         ...prev,
                        //         address: text,
                        //     }))
                        // }
                        autoCapitalize="none"
                        value={textInput.address}
                        readOnly
                    />
                </View>
                <View style={styles.inputGroup}>
                    <Text style={[styles.inputLabel, styles.textLightTheme]}>
                        Date Schedule
                    </Text>
                    <TextInput
                        style={[styles.textInput, styles.textLightTheme]}
                        placeholder="Schedule"
                        // onChangeText={(text) =>
                        //     setTextInput((prev) => ({
                        //         ...prev,
                        //         date_scheduled: text,
                        //     }))
                        // }
                        value={textInput.date_scheduled}
                        showSoftInputOnFocus={false}
                        // onPress={() => showMode("date")}
                        autoCapitalize="none"
                        readOnly
                    />
                </View>
                <View style={styles.dualInputGroup}>
                    <View style={styles.inputGroup}>
                        <Text
                            style={[styles.inputLabel, styles.textLightTheme]}
                        >
                            Budget
                        </Text>
                        <TextInput
                            style={[
                                styles.textInputHalf,
                                styles.textLightTheme,
                            ]}
                            placeholder="Budget"
                            // onChangeText={(text) =>
                            //     setTextInput((prev) => ({
                            //         ...prev,
                            //         budget: Number(text),
                            //     }))
                            // }
                            value={textInput.budget.toString()}
                            autoCapitalize="none"
                            keyboardType="number-pad"
                            readOnly
                        />
                    </View>
                    <View style={styles.inputGroup}>
                        <Text
                            style={[styles.inputLabel, styles.textLightTheme]}
                        >
                            Total
                        </Text>
                        <TextInput
                            style={[
                                styles.textInputHalf,
                                styles.textLightTheme,
                            ]}
                            placeholder="Total Items"
                            readOnly
                            value={textInput.number_of_items.toString()}
                            autoCapitalize="none"
                            keyboardType="number-pad"
                        />
                    </View>
                </View>
            </View>
            <View style={styles.listContainer}>
                <FlatList
                    data={productItems}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <Item
                            id={item.id}
                            name={item.name}
                            expected_quantity={item.expected_quantity}
                            actual_quantity={item.actual_quantity}
                            price={item.price}
                            total={item.total}
                            changeValue={updateProduct}
                            start={start}
                        />
                    )}
                />

                {textInput.status == 0 && !switchButton && dateIsNow && (
                    <Pressable
                        style={[styles.primaryBtn, styles.createBtn]}
                        onPress={startShopping}
                    >
                        <Text style={styles.btnFont}>Start Shopping</Text>
                    </Pressable>
                )}

                {(switchButton || textInput.status == 1) && (
                    <Pressable
                        style={[styles.primaryBtn, styles.createBtn]}
                        onPress={completeShopping}
                    >
                        {isLoading ? (
                            <ActivityIndicator color={"white"} />
                        ) : (
                            <Text style={styles.btnFont}>Complete</Text>
                        )}
                    </Pressable>
                )}
            </View>
        </SafeAreaView>
    );
}

const Item = React.memo(
    ({
        id,
        name,
        expected_quantity,
        actual_quantity,
        price,
        total,
        changeValue,
        start,
    }: ItemProp) => {
        return (
            <View style={styles.itemCard}>
                <View style={styles.inputGroup}>
                    <Text
                        style={[
                            styles.inputLabel,
                            styles.textLightTheme,
                            { fontSize: 14 },
                        ]}
                    >
                        Item Name
                    </Text>
                    <TextInput
                        style={[styles.cardInputReg, styles.textLightTheme]}
                        value={name}
                        placeholder="Item Name"
                        onChangeText={(text) => changeValue(id, text, "name")}
                        autoCapitalize="none"
                        autoCorrect={false}
                        readOnly
                    />
                </View>
                <View style={styles.dualInputGroup}>
                    <View style={styles.inputGroup}>
                        <Text
                            style={[
                                styles.inputLabel,
                                styles.textLightTheme,
                                { fontSize: 14 },
                            ]}
                        >
                            Expected Quantity
                        </Text>
                        <TextInput
                            style={[
                                styles.cardInputReg,
                                styles.textInputHalf,
                                { backgroundColor: "#FFF" },
                            ]}
                            value={expected_quantity.toString()}
                            onChangeText={(text) => {
                                changeValue(id, text, "expected_quantity");
                            }}
                            keyboardType="number-pad"
                            readOnly
                        />
                    </View>
                    <View style={styles.inputGroup}>
                        <Text
                            style={[
                                styles.inputLabel,
                                styles.textLightTheme,
                                { fontSize: 14 },
                            ]}
                        >
                            Actual Quantity
                        </Text>
                        <TextInput
                            style={[
                                styles.cardInputReg,
                                styles.textInputHalf,
                                { backgroundColor: "#FFF", width: 126 },
                            ]}
                            value={actual_quantity.toString()}
                            onChangeText={(text) => {
                                changeValue(id, text, "actual_quantity");
                            }}
                            keyboardType="number-pad"
                            readOnly={!start}
                        />
                    </View>
                </View>
                <View style={styles.dualInputGroup}>
                    <View style={styles.inputGroup}>
                        <Text
                            style={[
                                styles.inputLabel,
                                styles.textLightTheme,
                                { fontSize: 14 },
                            ]}
                        >
                            Price
                        </Text>
                        <TextInput
                            style={[
                                styles.cardInputReg,
                                styles.textInputHalf,
                                { backgroundColor: "#FFF", width: 126 },
                            ]}
                            value={price.toString()}
                            onChangeText={(text) => {
                                changeValue(id, text, "price");
                            }}
                            keyboardType="number-pad"
                            readOnly={!start}
                        />
                    </View>
                    <View style={styles.inputGroup}>
                        <Text
                            style={[
                                styles.inputLabel,
                                styles.textLightTheme,
                                { fontSize: 14 },
                            ]}
                        >
                            Total
                        </Text>
                        <TextInput
                            style={[
                                styles.cardInputReg,
                                styles.textInputHalf,
                                { backgroundColor: "#FFF" },
                            ]}
                            value={total.toString()}
                            keyboardType="number-pad"
                            readOnly
                        />
                    </View>
                </View>
            </View>
        );
    },
);

const styles = StyleSheet.create({
    pageContainer: {
        height: "100%",
        backgroundColor: "#F7F7F7",
        paddingHorizontal: 16,
        paddingBottom: 16,
        alignItems: "center",
        gap: 32,
    },
    headContainer: {
        gap: 8,
        height: "auto",
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
    textInputHalf: {
        padding: 20,
        width: 146,
        height: 57,
        zIndex: 1,
        backgroundColor: "#EAEAEA",
        borderRadius: 15,
        boxShadow: "0 4px 4px lightgray",
    },
    inputLabel: {
        marginLeft: 12,
    },
    dualInputGroup: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    bodyContainer: {
        position: "relative",
        paddingHorizontal: 15,
        paddingTop: 15,
        width: "100%",
        flex: 1,
    },
    textLightTheme: {
        color: "#1A1A1A",
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
    listContainer: {
        flex: 1,
        overflow: "visible",
        paddingBottom: 67,
        position: "relative",
    },
    itemCard: {
        width: 336,
        borderRadius: 16,
        boxShadow: "0 4px 4px lightgray",
        padding: 20,
        backgroundColor: "#EAEAEA",
        position: "relative",
        gap: 16,
        marginBottom: 20,
    },
    cardInputReg: {
        padding: 20,
        width: 285,
        height: 57,
        zIndex: 1,
        backgroundColor: "#FFFFFF",
        borderRadius: 15,
        boxShadow: "0 4px 4px lightgray",
    },
    createBtn: {
        position: "absolute",
        bottom: 0,
    },
    inputGroup: {
        gap: 2,
    },
});
