import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Item {
    id: ItemId;
    sku: string;
    expiryDate?: bigint;
    name: string;
    unit: string;
    minStock: bigint;
    category: string;
    currentStock: bigint;
}
export interface DashboardSummary {
    lowStockCount: bigint;
    totalStock: bigint;
    totalItems: bigint;
    nearExpiryCount: bigint;
}
export interface StockMovement {
    id: bigint;
    itemId: ItemId;
    date: bigint;
    note: string;
    movementType: Variant_in_out;
    quantity: bigint;
}
export type ItemId = bigint;
export interface ItemInput {
    sku: string;
    expiryDate?: bigint;
    name: string;
    unit: string;
    minStock: bigint;
    category: string;
}
export enum StockStatus {
    low = "low",
    safe = "safe"
}
export enum Variant_in_out {
    in_ = "in",
    out = "out"
}
export interface backendInterface {
    createItem(input: ItemInput): Promise<{
        __kind__: "ok";
        ok: ItemId;
    } | {
        __kind__: "err";
        err: {
            __kind__: "invalidData";
            invalidData: string;
        };
    }>;
    deleteItem(id: ItemId): Promise<boolean>;
    getDashboardSummary(): Promise<DashboardSummary>;
    getItem(id: ItemId): Promise<Item | null>;
    getItemStockHistory(itemId: ItemId): Promise<Array<StockMovement>>;
    getMovementReport(startDate: bigint, endDate: bigint): Promise<Array<StockMovement>>;
    getNearExpiryItems(): Promise<Array<Item>>;
    getStockReport(category: string | null, status: StockStatus | null): Promise<Array<Item>>;
    listItems(): Promise<Array<Item>>;
    listStockIn(): Promise<Array<StockMovement>>;
    listStockOut(): Promise<Array<StockMovement>>;
    recordStockIn(itemId: ItemId, quantity: bigint, date: bigint, note: string): Promise<boolean>;
    recordStockOut(itemId: ItemId, quantity: bigint, date: bigint, note: string): Promise<boolean>;
    updateItem(id: ItemId, input: ItemInput): Promise<{
        __kind__: "ok";
        ok: boolean;
    } | {
        __kind__: "err";
        err: {
            __kind__: "invalidData";
            invalidData: string;
        };
    }>;
}
