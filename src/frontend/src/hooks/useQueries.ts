import { createActor } from "@/backend";
import type {
  DashboardSummary,
  Item,
  StockMovement,
  StockStatus,
  Variant_in_out,
} from "@/backend";
import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export type { Item, StockMovement, DashboardSummary };

export interface NearExpiryItem {
  id: bigint;
  name: string;
  sku: string;
  currentStock: number;
  expiryDate: bigint;
  daysUntilExpiry: number;
  unit: string;
}

export interface StockReportItem {
  id: bigint;
  name: string;
  sku: string;
  category: string;
  currentStock: number;
  minStock: number;
  status: "safe" | "low";
}

export interface MovementReportItem {
  id: bigint;
  itemName: string;
  sku: string;
  movementType: Variant_in_out;
  quantity: number;
  date: bigint;
  note: string | null;
}

// Dashboard
export function useGetDashboardSummary() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<DashboardSummary>({
    queryKey: ["dashboard", "summary"],
    queryFn: async () => {
      if (!actor)
        return {
          totalItems: 0n,
          totalStock: 0n,
          lowStockCount: 0n,
          nearExpiryCount: 0n,
        };
      return actor.getDashboardSummary();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetNearExpiryItems() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<NearExpiryItem[]>({
    queryKey: ["dashboard", "nearExpiry"],
    queryFn: async () => {
      if (!actor) return [];
      const items = await actor.getNearExpiryItems();
      const now = Date.now();
      return items.map((item) => {
        const daysUntilExpiry = item.expiryDate
          ? Math.ceil(
              (Number(item.expiryDate) / 1_000_000 - now) /
                (1000 * 60 * 60 * 24),
            )
          : 0;
        return {
          id: item.id,
          name: item.name,
          sku: item.sku,
          currentStock: Number(item.currentStock),
          expiryDate: item.expiryDate ?? 0n,
          daysUntilExpiry,
          unit: item.unit,
        };
      });
    },
    enabled: !!actor && !isFetching,
  });
}

// Master Barang
export function useListItems() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<Item[]>({
    queryKey: ["items"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listItems();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetItem(itemId: bigint | null) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<Item | null>({
    queryKey: ["items", itemId?.toString()],
    queryFn: async () => {
      if (!actor || !itemId) return null;
      return actor.getItem(itemId);
    },
    enabled: !!actor && !isFetching && !!itemId,
  });
}

export function useGetItemStockHistory(itemId: bigint | null) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<StockMovement[]>({
    queryKey: ["items", itemId?.toString(), "history"],
    queryFn: async () => {
      if (!actor || !itemId) return [];
      return actor.getItemStockHistory(itemId);
    },
    enabled: !!actor && !isFetching && !!itemId,
  });
}

export function useCreateItem() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      name: string;
      sku: string;
      category: string;
      unit: string;
      minStock: number;
      expiryDate: bigint | null;
    }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.createItem({
        name: params.name,
        sku: params.sku,
        category: params.category,
        unit: params.unit,
        minStock: BigInt(params.minStock),
        expiryDate: params.expiryDate ?? undefined,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["items"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useUpdateItem() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      id: bigint;
      name: string;
      sku: string;
      category: string;
      unit: string;
      minStock: number;
      expiryDate: bigint | null;
    }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.updateItem(params.id, {
        name: params.name,
        sku: params.sku,
        category: params.category,
        unit: params.unit,
        minStock: BigInt(params.minStock),
        expiryDate: params.expiryDate ?? undefined,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["items"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useDeleteItem() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Actor not available");
      return actor.deleteItem(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["items"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

// Stok Masuk
export function useRecordStockIn() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      itemId: bigint;
      quantity: number;
      date: bigint;
      notes: string | null;
    }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.recordStockIn(
        params.itemId,
        BigInt(params.quantity),
        params.date,
        params.notes ?? "",
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["items"] });
      queryClient.invalidateQueries({ queryKey: ["stockIn"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useListStockIn() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<StockMovement[]>({
    queryKey: ["stockIn"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listStockIn();
    },
    enabled: !!actor && !isFetching,
  });
}

// Stok Keluar
export function useRecordStockOut() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      itemId: bigint;
      quantity: number;
      date: bigint;
      notes: string | null;
    }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.recordStockOut(
        params.itemId,
        BigInt(params.quantity),
        params.date,
        params.notes ?? "",
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["items"] });
      queryClient.invalidateQueries({ queryKey: ["stockOut"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useListStockOut() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<StockMovement[]>({
    queryKey: ["stockOut"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listStockOut();
    },
    enabled: !!actor && !isFetching,
  });
}

// Laporan
export function useGetStockReport(category?: string, status?: string) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<StockReportItem[]>({
    queryKey: ["reports", "stock", category, status],
    queryFn: async () => {
      if (!actor) return [];
      const statusEnum: StockStatus | null =
        status === "low"
          ? ("low" as StockStatus)
          : status === "safe"
            ? ("safe" as StockStatus)
            : null;
      const items = await actor.getStockReport(category || null, statusEnum);
      return items.map((item) => ({
        id: item.id,
        name: item.name,
        sku: item.sku,
        category: item.category,
        currentStock: Number(item.currentStock),
        minStock: Number(item.minStock),
        status: (item.currentStock < item.minStock ? "low" : "safe") as
          | "safe"
          | "low",
      }));
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetMovementReport(startDate: bigint, endDate: bigint) {
  const { actor, isFetching } = useActor(createActor);
  const { data: items } = useListItems();
  return useQuery<MovementReportItem[]>({
    queryKey: ["reports", "movement", startDate.toString(), endDate.toString()],
    queryFn: async () => {
      if (!actor) return [];
      const movements = await actor.getMovementReport(startDate, endDate);
      return movements.map((m) => {
        const item = items?.find((i) => i.id === m.itemId);
        return {
          id: m.id,
          itemName: item?.name || "-",
          sku: item?.sku || "-",
          movementType: m.movementType as Variant_in_out,
          quantity: Number(m.quantity),
          date: m.date,
          note: m.note || null,
        };
      });
    },
    enabled: !!actor && !isFetching,
  });
}
