import NetInfo from "@react-native-community/netinfo";
import {
    createShopPlan as apiCreateShopPlan,
    updateShopPlan as apiUpdateShopPlan,
    insertItems,
    startShopPlan,
} from "../api/apiClient";
import { dbPromise } from "../database/database";

type PendingOperation = {
    id: number;
    entity_type: string;
    entity_id: string;
    operation_type: "insert" | "update" | "delete" | "start";
    payload: string | null;
    attempts: number;
};

let isSyncing = false;

export async function runSync() {
    if (isSyncing) return;

    const net = await NetInfo.fetch();
    if (!net.isConnected) {
        return;
    }

    isSyncing = true;

    try {
        const db = await dbPromise;

        const ops: PendingOperation[] = await db.getAllAsync(
            `SELECT * FROM pending_operations ORDER BY created_at ASC`,
        );

        console.log("ops", ops);

        for (const op of ops) {
            try {
                const payload = op.payload ? JSON.parse(op.payload) : null;

                if (op.entity_type === "shop_plans") {
                    if (op.operation_type === "insert") {
                        const response = await apiCreateShopPlan(payload);
                        await db.runAsync(
                            `UPDATE shop_plans SET server_id = ? WHERE id = ?`,
                            [response.data.id, Number(op.entity_id)],
                        );

                        // await db.runAsync(
                        //     `UPDATE pending_operations SET entity_id = ? WHERE shop_plan_id = ?`,
                        //     [response.data?.id, Number(op.entity_id)],
                        // );
                    } else if (op.operation_type === "start") {
                        let sid: number = payload.server_id;

                        if (!payload.server_id) {
                            const getRes = await db.getFirstAsync<{
                                server_id: number;
                            }>(
                                `SELECT server_id FROM shop_plans WHERE id = ?`,
                                Number(op.entity_id),
                            );
                            if (getRes) {
                                sid = getRes.server_id;
                            }
                        }

                        const res = await startShopPlan(Number(sid));
                    } else if (op.operation_type === "update") {
                        await apiUpdateShopPlan(payload, Number(op.entity_id));
                    } else if (op.operation_type === "delete") {
                    }
                } else if (op.entity_type === "items") {
                    if (op.operation_type === "insert") {
                        payload.forEach(async (item: any) => {
                            await insertItems(item);
                            // console.log("item", item);
                            // for (const [key, value] of Object.entries(item)) {
                            //     console.log("type", typeof value);
                            //     console.log(`${key}: ${value}`);
                            // }
                        });
                    }
                }

                await db.runAsync(
                    `DELETE FROM pending_operations WHERE id = ?`,
                    op.id,
                );
            } catch (err: any) {
                const message =
                    err?.response?.data?.message ||
                    err?.message ||
                    "Unknown error";

                await db.runAsync(
                    `UPDATE pending_operations
           SET attempts = attempts + 1,
               last_error = ?
           WHERE id = ?`,
                    message,
                    op.id,
                );

                console.log("errors: ", err?.response?.data);

                if (!err.response || err.response.status >= 500) {
                    break;
                }
            }
        }
    } catch (e: any) {
        console.log("error", e);
    } finally {
        isSyncing = false;
    }
}
