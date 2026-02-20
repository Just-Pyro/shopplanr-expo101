import { createShopPlan } from "@/services/database/database";
import { runSync } from "@/services/sync/SyncService";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { DateTimePickerAndroid } from "@react-native-community/datetimepicker";
import NetInfo from "@react-native-community/netinfo";
import * as Crypto from "expo-crypto";
import { router } from "expo-router";
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

type Item = {
    id: string;
    name: string;
    price: number;
    expected_quantity: number;
    actual_quantity: number;
};
type ItemProp = {
    id: string;
    name: string;
    expected_quantity: number;
    changeValue: (
        id: string,
        text: string,
        key: "name" | "expected_quantity",
    ) => void;
    handleRemove: (id: string) => void;
    setTextInput: React.Dispatch<React.SetStateAction<TextInputType>>;
};

interface TextInputType {
    address: string;
    date_scheduled: string;
    budget: number;
    number_of_items: number;
    status: number;
}
export default function create() {
    const [textInput, setTextInput] = useState({
        address: "",
        date_scheduled: new Date().toDateString(),
        budget: 0,
        number_of_items: 0,
        status: 0,
    });
    const [productItems, setProductItems] = useState<Item[]>([]);
    const [showSave, setShowSave] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const onChange = (event: any, selectedDate?: Date) => {
        if (selectedDate) {
            setTextInput((prev) => ({
                ...prev,
                date_scheduled: new Date(selectedDate).toDateString(),
            }));
        }
    };

    const showMode = (currentMode: "date" | "time") => {
        DateTimePickerAndroid.open({
            value: new Date(),
            onChange,
            mode: currentMode,
            is24Hour: false,
        });
    };

    const addItem = () => {
        setProductItems((prev) => {
            return [
                ...prev,
                {
                    id: Crypto.randomUUID(),
                    name: "",
                    price: 0,
                    expected_quantity: 0,
                    actual_quantity: 0,
                },
            ];
        });
    };

    const updateProduct = (id: string, text: string, key: string) => {
        setProductItems((prev) =>
            prev.map((item) =>
                item.id === id
                    ? {
                          ...item,
                          [key]:
                              key === "expected_quantity" && text !== ""
                                  ? Number(text)
                                  : text,
                      }
                    : item,
            ),
        );
    };

    const sumTotalPrice = () => {
        const totalPrice = productItems.reduce((sum, item) => {
            return sum + Number(item.expected_quantity);
        }, 0);

        setTextInput((prev) => ({
            ...prev,
            number_of_items: totalPrice,
        }));
    };

    useEffect(() => {
        if (productItems.length > 0) {
            setShowSave(true);
        } else if (showSave) {
            setShowSave(false);
        }

        sumTotalPrice();
    }, [productItems]);

    const handleCreate = async () => {
        try {
            setIsLoading(true);
            const authUser = await AsyncStorage.getItem("auth-user");
            if (authUser) {
                const user = JSON.parse(authUser);

                const d = new Date(textInput.date_scheduled);
                const formattedDate =
                    d.getFullYear() +
                    "-" +
                    String(d.getMonth() + 1).padStart(2, "0") +
                    "-" +
                    String(d.getDate()).padStart(2, "0") +
                    " " +
                    String(d.getHours()).padStart(2, "0") +
                    ":" +
                    String(d.getMinutes()).padStart(2, "0") +
                    ":" +
                    String(d.getSeconds()).padStart(2, "0");
                const shopPlan = {
                    address: textInput.address,
                    date_scheduled: formattedDate,
                    budget: textInput.budget,
                    status: textInput.status,
                    number_of_items: textInput.number_of_items,
                    created_by: user.id,
                    items: productItems.map(({ id, ...rest }) => rest),
                };

                const result = await createShopPlan(shopPlan);

                if (result) {
                    const netState = await NetInfo.fetch();
                    if (netState.isConnected) {
                        await runSync();
                    }

                    router.back();
                }
            }
        } catch (error: any) {
            const message =
                error instanceof Error ? error.message : "Something went wrong";

            Alert.alert("Error", message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleRemoveItem = (id: string) => {
        setProductItems((prev) => prev.filter((item) => item.id !== id));
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
                        onChangeText={(text) =>
                            setTextInput((prev) => ({
                                ...prev,
                                address: text,
                            }))
                        }
                        autoCapitalize="none"
                    />
                </View>
                <View style={styles.inputGroup}>
                    <Text style={[styles.inputLabel, styles.textLightTheme]}>
                        Date Schedule
                    </Text>
                    <TextInput
                        style={[styles.textInput, styles.textLightTheme]}
                        placeholder="Schedule"
                        onChangeText={(text) =>
                            setTextInput((prev) => ({
                                ...prev,
                                date_scheduled: text,
                            }))
                        }
                        value={textInput.date_scheduled}
                        showSoftInputOnFocus={false}
                        onPress={() => showMode("date")}
                        autoCapitalize="none"
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
                            onChangeText={(text) =>
                                setTextInput((prev) => ({
                                    ...prev,
                                    budget: Number(text),
                                }))
                            }
                            value={textInput.budget.toString()}
                            autoCapitalize="none"
                            keyboardType="number-pad"
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
                            readOnly={true}
                            value={textInput.number_of_items.toString()}
                            autoCapitalize="none"
                            keyboardType="number-pad"
                        />
                    </View>
                </View>
                <View
                    style={{
                        position: "relative",
                        height: 34,
                        flex: 1,
                        marginTop: 24,
                    }}
                >
                    <Pressable style={styles.primaryBtn} onPress={addItem}>
                        <Text style={{ color: "white" }}>Add Item</Text>
                    </Pressable>
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
                    }}
                >
                    <Text style={{ flex: 1 }}>Item Name</Text>
                    <Text style={{ width: 140 }}>Expected QTY</Text>
                </View>
                <View
                    style={{
                        flex: 1,
                        backgroundColor: "#e8e8e8",
                        borderBottomLeftRadius: 10,
                        borderBottomRightRadius: 10,
                        paddingTop: 5,
                        paddingBottom: 15,
                        paddingHorizontal: 15,
                        boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.25) inset",
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
                                changeValue={updateProduct}
                                handleRemove={handleRemoveItem}
                                setTextInput={setTextInput}
                            />
                        )}
                    />
                </View>

                {showSave && (
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
                        onPress={handleCreate}
                    >
                        {isLoading ? (
                            <ActivityIndicator color={"white"} />
                        ) : (
                            <Text style={{ color: "white" }}>Create Plan</Text>
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
        changeValue,
        handleRemove,
        setTextInput,
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
                />
                <TextInput
                    style={[styles.textInput, { width: 100 }]}
                    value={expected_quantity.toString()}
                    onChangeText={(text) => {
                        changeValue(id, text, "expected_quantity");
                    }}
                    keyboardType="number-pad"
                />
                <Pressable
                    style={{
                        borderWidth: 4,
                        borderColor: "red",
                        alignItems: "center",
                        justifyContent: "center",
                        width: 40,
                        height: 40,
                        borderRadius: 10,
                    }}
                    onPress={() => handleRemove(id)}
                >
                    <MaterialIcons name="close" size={32} color="red" />
                </Pressable>
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
        gap: 32,
        alignItems: "center",
    },
    headContainer: {
        gap: 8,
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
        gap: 2,
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
