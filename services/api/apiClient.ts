import axios from "axios";

const BASE_URL = "http://10.10.1.102:8005/api";

export interface ApiResponse<T = unknown> {
    success: boolean;
    data: T;
    message: string;
    errors?: Record<string, string[]>;
    meta?: unknown;
}

export interface loginCreds {
    email: string;
    password: string;
}

export interface User {
    id: number;
    first_name: string;
    last_name: string;
    full_name: string;
    email: string;
}

export interface userRegisterType {
    first_name: string;
    last_name: string;
    email: string;
    password: string;
}

export interface ShopPlan {
    id: number;
    address: string;
    date_scheduled: string;
    budget: number;
    number_of_items: number;
    status: number;
    in_progress?: number;
    items?: ShopPlanItem[];
}

export interface ShopPlanCreate {
    created_by: number;
    address: string;
    date_scheduled: string;
    budget: number;
    number_of_items: number;
    items: ItemFields[];
}

type ItemFields = {
    id?: number;
    item_name: string;
    item_quantity: number;
};

export interface ShopPlanItem {
    id: number;
    shop_plan_id: number;
    name: string;
    price: number;
    expected_quantity: number;
    actual_quantity: number;
}

export interface ShopPlanStatus {
    id: number;
    status: number;
}

export interface ShopPlanUpdate {
    status: number;
    items: ItemFields[];
}

export const login = async (
    loginCreds: loginCreds,
): Promise<ApiResponse<User>> => {
    const url = `${BASE_URL}/users/login`;
    const response = await axios.post<ApiResponse<User>>(url, loginCreds);
    return response.data;
};

export const registerUser = async (
    user: userRegisterType,
): Promise<ApiResponse<User>> => {
    const url = `${BASE_URL}/users`;
    const response = await axios.post<ApiResponse<User>>(url, user);
    return response.data;
};

export const shopPlanList = async (
    userId: number,
): Promise<ApiResponse<ShopPlan>> => {
    const url = `${BASE_URL}/shop_plans/by-user/${userId}`;
    const response = await axios.get<ApiResponse<ShopPlan>>(url);
    return response.data;
};

export const createShopPlan = async (
    shopPlan: ShopPlanCreate,
): Promise<ApiResponse<ShopPlan>> => {
    const url = `${BASE_URL}/shop_plans`;
    const response = await axios.post<ApiResponse<ShopPlan>>(url, shopPlan);
    return response.data;
};

export const showShopPlan = async (
    shopId: number,
): Promise<ApiResponse<ShopPlan>> => {
    const url = `${BASE_URL}/shop_plans/${shopId}`;
    const response = await axios.get<ApiResponse<ShopPlan>>(url);
    return response.data;
};

export const updateShopPlan = async (
    shopPlan: ShopPlanUpdate,
    shop_plan_id: number,
): Promise<ApiResponse<ShopPlanStatus>> => {
    const url = `${BASE_URL}/shop_plans/update-status/${shop_plan_id}`;
    const response = await axios.put<ApiResponse<ShopPlanStatus>>(
        url,
        shopPlan,
    );
    return response.data;
};
