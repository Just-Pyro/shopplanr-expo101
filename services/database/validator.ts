import { Item, ShopPlan, ShopPlanCreate, UpdateShopPlan } from "./database";

export function validateShopPlan(
    shopPlan: Omit<ShopPlan, "id">,
    items: Item[],
) {
    if (!shopPlan.address || shopPlan.address.length > 255)
        throw new Error("Address is required and max 255 characters");

    if (!shopPlan.date_scheduled || isNaN(Date.parse(shopPlan.date_scheduled)))
        throw new Error("date_scheduled is required and must be a valid date");

    if (shopPlan.budget === undefined || typeof shopPlan.budget !== "number")
        throw new Error("Budget is required and must be a number");

    if (
        shopPlan.number_of_items === undefined ||
        !Number.isInteger(shopPlan.number_of_items)
    )
        throw new Error("Number of items is required and must be an integer");

    if (!Array.isArray(items) || items.length < 1)
        throw new Error("At least one item is required");

    items.forEach((item, index) => {
        if (!item.name || item.name.length > 255)
            throw new Error(
                `Item ${index + 1}: name is required and max 255 chars`,
            );

        if (
            item.expected_quantity === undefined ||
            typeof item.expected_quantity !== "number" ||
            item.expected_quantity < 0
        )
            throw new Error(
                `Item ${index + 1}: quantity is required and must be >= 0`,
            );
    });
}

export function validateShopPlanCreate(shopPlan: ShopPlanCreate) {
    if (!shopPlan.created_by || !Number.isInteger(shopPlan.created_by))
        throw new Error("Created By is required and must be an integer");

    if (!shopPlan.address || shopPlan.address.length > 255)
        throw new Error("Address is required and max 255 characters");

    if (!shopPlan.date_scheduled || isNaN(Date.parse(shopPlan.date_scheduled)))
        throw new Error("date_scheduled is required and must be a valid date");

    if (
        shopPlan.budget === undefined ||
        typeof shopPlan.budget !== "number" ||
        shopPlan.budget === 0
    )
        throw new Error(
            "Budget is required and must be a number greater than zero",
        );

    if (
        shopPlan.number_of_items === undefined ||
        !Number.isInteger(shopPlan.number_of_items)
    )
        throw new Error("Number of items is required and must be an integer");

    if (!Array.isArray(shopPlan.items) || shopPlan.items.length < 1)
        throw new Error("At least one item is required");

    shopPlan.items.forEach((item, index) => {
        if (!item.name || item.name.length > 255)
            throw new Error(
                `Product ${index + 1}: name is required and max 255 chars`,
            );

        if (
            item.expected_quantity === undefined ||
            typeof item.expected_quantity !== "number" ||
            item.expected_quantity < 1
        )
            throw new Error(
                `${item.name}: quantity is required and must be greater than zero`,
            );
    });
}

export function validateUpdateShopPlan(shopPlan: UpdateShopPlan) {
    if (!shopPlan.shop_plan_id || !Number.isInteger(shopPlan.shop_plan_id))
        throw new Error("ID is required and must be an integer");

    if (
        !shopPlan.budget ||
        typeof shopPlan.budget !== "number" ||
        shopPlan.budget < 0
    )
        throw new Error("Budget is required and must be an integer");

    if (
        !shopPlan.status ||
        !Number.isInteger(shopPlan.status) ||
        ![2].includes(shopPlan.status)
    )
        throw new Error("Status is required and must be an integer 2");

    if (!Array.isArray(shopPlan.items) || shopPlan.items.length < 1)
        throw new Error("At least one item is required");

    shopPlan.items.forEach((item, index) => {
        if (!item.id || !Number.isInteger(item.id))
            throw new Error(
                `Item ${index + 1}: ID is required and must be an integer`,
            );

        if (
            item.price === undefined ||
            typeof item.price !== "number" ||
            item.price < 0
        )
            throw new Error(
                `Item ${index + 1}: Price is required and must be >= 0.00`,
            );

        if (
            item.actual_quantity === undefined ||
            !Number.isInteger(item.actual_quantity) ||
            item.actual_quantity < 0
        )
            throw new Error(
                `Item ${index + 1}: Actual Quantity is required and must be positive or zero`,
            );
    });
}

// export function validateStartShopPlan(shop_plan_id: number) {
//     if (!shop_plan_id || !Number.isInteger(shop_plan_id))
//         throw new Error("ID is required and must be an integer");

//     // if (
//     //     !shopPlan.status ||
//     //     !Number.isInteger(shopPlan.status) ||
//     //     ![1].includes(shopPlan.status)
//     // )
//     //     throw new Error("Status is required and must be an integer 1");
// }
