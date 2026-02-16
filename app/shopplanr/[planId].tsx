import {
    showShopPlan,
    startShopPlan,
    UpdateShopPlan,
    updateShopPlan,
} from "@/services/database/database";
import { runSync } from "@/services/sync/SyncService";
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
                    <View
                        style={{
                            flex: 1,
                            gap: 5,
                        }}
                    >
                        <Text>Address</Text>
                        <View
                            style={{
                                position: "relative",
                                height: 34,
                                flex: 1,
                            }}
                        >
                            <TextInput
                                style={styles.textInput}
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
                            <View style={styles.inputShadow}></View>
                        </View>
                    </View>
                    <View
                        style={{
                            flex: 1,
                            gap: 5,
                        }}
                    >
                        <Text>Date Schedule</Text>
                        <View
                            style={{
                                position: "relative",
                                height: 34,
                                flex: 1,
                            }}
                        >
                            <TextInput
                                style={styles.textInput}
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
                            <View style={styles.inputShadow}></View>
                        </View>
                    </View>
                </View>
                <View style={styles.inputGroup}>
                    <View
                        style={{
                            gap: 5,
                        }}
                    >
                        <Text>Budget</Text>
                        <View
                            style={{
                                position: "relative",
                                height: 34,
                                width: 200,
                            }}
                        >
                            <TextInput
                                style={styles.textInput}
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
                            <View style={styles.inputShadow}></View>
                        </View>
                    </View>
                    <View
                        style={{
                            gap: 5,
                        }}
                    >
                        <Text>Total</Text>
                        <View
                            style={{
                                position: "relative",
                                height: 34,
                                width: 100,
                            }}
                        >
                            <TextInput
                                style={styles.textInput}
                                placeholder="Total Items"
                                readOnly
                                value={textInput.number_of_items.toString()}
                                autoCapitalize="none"
                                keyboardType="number-pad"
                            />
                            <View style={styles.inputShadow}></View>
                        </View>
                    </View>
                    <View
                        style={{
                            position: "relative",
                            height: 34,
                            flex: 1,
                            marginTop: 24,
                            width: "35%",
                        }}
                    >
                        {/* <Pressable
                            style={({ pressed }) => [
                                styles.secondaryButton,
                                {
                                    top: pressed ? 6 : 0,
                                    left: pressed ? 6 : 0,
                                    position: pressed ? "absolute" : "relative",
                                },
                            ]}
                            // onPress={addItem}
                        >
                            <Text style={{ color: "white" }}>Add Item</Text>
                        </Pressable>
                        <View
                            style={[styles.inputShadow, { borderRadius: 10 }]}
                        ></View> */}
                    </View>
                </View>
            </View>
            <View style={styles.bodyContainer}>
                <View
                    style={{
                        height: 30,
                        borderTopLeftRadius: 10,
                        borderTopRightRadius: 10,
                        borderWidth: 1,
                        borderColor: "lightgray",
                        paddingHorizontal: 20,
                        paddingTop: 5,
                        flexDirection: "row",
                        gap: 15,
                    }}
                >
                    <Text style={{ flex: 1, paddingLeft: 5 }}>Item Name</Text>
                    <Text style={{ width: 60, paddingLeft: 5 }}>E. QTY</Text>
                    <Text style={{ width: 60, paddingLeft: 5 }}>A. QTY</Text>
                    <Text style={{ width: 75, paddingLeft: 5 }}>Price</Text>
                    <Text style={{ width: 100, paddingLeft: 5 }}>Total</Text>
                </View>
                <View
                    style={{
                        borderWidth: 1,
                        flex: 1,
                        backgroundColor: "#e8e8e8",
                        borderBottomLeftRadius: 10,
                        borderBottomRightRadius: 10,
                        boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.25) inset",
                        paddingTop: 5,
                        paddingBottom: 15,
                        paddingHorizontal: 15,
                    }}
                >
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
                        scrollEnabled={false}
                    />
                </View>

                {textInput.status == 0 && !switchButton && dateIsNow && (
                    <Pressable
                        style={[
                            styles.primaryButton,
                            {
                                position: "absolute",
                                bottom: 10,
                                alignSelf: "center",
                                width: "95%",
                                elevation: 2,
                            },
                        ]}
                        onPress={startShopping}
                    >
                        <Text style={{ color: "white" }}>Start Shopping</Text>
                    </Pressable>
                )}

                {(switchButton || textInput.status == 1) && (
                    <Pressable
                        style={[
                            styles.primaryButton,
                            {
                                position: "absolute",
                                bottom: 10,
                                alignSelf: "center",
                                width: "95%",
                                elevation: 2,
                                backgroundColor: "#24a0ed",
                            },
                        ]}
                        onPress={completeShopping}
                    >
                        {isLoading ? (
                            <ActivityIndicator color={"white"} />
                        ) : (
                            <Text style={{ color: "white" }}>Complete</Text>
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
            <View
                style={{
                    flexDirection: "row",
                    gap: 15,
                    marginBottom: 10,
                }}
            >
                <TextInput
                    style={[styles.textInput, { flex: 1 }]}
                    value={name}
                    placeholder="Item Name"
                    onChangeText={(text) => changeValue(id, text, "name")}
                    autoCapitalize="none"
                    autoCorrect={false}
                    readOnly
                />
                <TextInput
                    style={[styles.textInput, { width: 60 }]}
                    value={expected_quantity.toString()}
                    onChangeText={(text) => {
                        changeValue(id, text, "expected_quantity");
                    }}
                    keyboardType="number-pad"
                    readOnly
                />
                <TextInput
                    style={[styles.textInput, { width: 60 }]}
                    value={actual_quantity.toString()}
                    onChangeText={(text) => {
                        changeValue(id, text, "actual_quantity");
                    }}
                    keyboardType="number-pad"
                    readOnly={!start}
                />
                <TextInput
                    style={[styles.textInput, { width: 75 }]}
                    value={price.toString()}
                    onChangeText={(text) => {
                        changeValue(id, text, "price");
                    }}
                    keyboardType="number-pad"
                    readOnly={!start}
                />
                <TextInput
                    style={[styles.textInput, { width: 100 }]}
                    value={total.toString()}
                    keyboardType="number-pad"
                    readOnly
                />
            </View>
        );
    },
);

const styles = StyleSheet.create({
    pageContainer: {
        height: "100%",
        backgroundColor: "white",
        justifyContent: "center",
        alignItems: "center",
        paddingTop: 0,
    },
    headContainer: {
        paddingTop: 30,
        paddingHorizontal: 30,
        borderBottomWidth: 1,
        borderBottomColor: "lightgray",
        width: "100%",
        gap: 20,
    },
    bodyContainer: {
        position: "relative",
        paddingHorizontal: 15,
        paddingTop: 15,
        width: "100%",
        flex: 1,
    },
    textInput: {
        borderWidth: 4,
        paddingVertical: 5,
        paddingHorizontal: 5,
        height: 40,
        zIndex: 1,
        backgroundColor: "white",
    },
    inputShadow: {
        height: 40,
        position: "absolute",
        top: 6,
        left: 6,
        borderWidth: 2,
        width: "100%",
        backgroundColor: "black",
        zIndex: -1,
    },
    inputGroup: {
        flexDirection: "row",
        width: "100%",
        gap: 10,
        marginBottom: 34,
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
    secondaryButton: {
        // paddingVertical: 10,
        // paddingHorizontal: 20,
        height: 40,
        backgroundColor: "#24a0ed",
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 4,
        borderRadius: 10,
        width: "100%",
    },
});
