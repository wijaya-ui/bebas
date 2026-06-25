import Map "mo:core/Map";
import List "mo:core/List";
import Nat "mo:core/Nat";
import Int "mo:core/Int";
import Time "mo:core/Time";
import Types "../types/inventory";
import Common "../types/common";

module {
  public type Item = Types.Item;
  public type ItemInput = Types.ItemInput;
  public type StockMovement = Types.StockMovement;
  public type DashboardSummary = Types.DashboardSummary;

  public func createItem(
    id : Nat,
    input : ItemInput,
  ) : Item {
    {
      id = id;
      name = input.name;
      sku = input.sku;
      category = input.category;
      unit = input.unit;
      minStock = input.minStock;
      expiryDate = input.expiryDate;
      currentStock = 0;
    };
  };

  public func updateItem(
    existing : Item,
    input : ItemInput,
  ) : Item {
    {
      existing with
      name = input.name;
      sku = input.sku;
      category = input.category;
      unit = input.unit;
      minStock = input.minStock;
      expiryDate = input.expiryDate;
    };
  };

  public func addStock(
    item : Item,
    quantity : Nat,
  ) : Item {
    { item with currentStock = item.currentStock + quantity };
  };

  public func removeStock(
    item : Item,
    quantity : Nat,
  ) : Item {
    { item with currentStock = item.currentStock - quantity };
  };

  public func canRemoveStock(
    item : Item,
    quantity : Nat,
  ) : Bool {
    item.currentStock >= quantity;
  };

  public func isLowStock(
    item : Item,
  ) : Bool {
    item.currentStock <= item.minStock;
  };

  public func isNearExpiry(
    item : Item,
    now : Int,
    daysThreshold : Int,
  ) : Bool {
    let thresholdNanos = daysThreshold * 24 * 60 * 60 * 1_000_000_000;
    switch (item.expiryDate) {
      case (?expiry) { expiry > now and expiry <= now + thresholdNanos };
      case (null) { false };
    };
  };

  public func calculateDashboardSummary(
    items : List.List<Item>,
    now : Int,
    daysThreshold : Int,
  ) : DashboardSummary {
    var totalItems = 0;
    var totalStock = 0;
    var lowStockCount = 0;
    var nearExpiryCount = 0;

    for (item in items.toArray().vals()) {
      totalItems += 1;
      totalStock += item.currentStock;
      if (isLowStock(item)) {
        lowStockCount += 1;
      };
      if (isNearExpiry(item, now, daysThreshold)) {
        nearExpiryCount += 1;
      };
    };

    {
      totalItems = totalItems;
      totalStock = totalStock;
      lowStockCount = lowStockCount;
      nearExpiryCount = nearExpiryCount;
    };
  };

  public func filterItemsByCategory(
    items : List.List<Item>,
    category : Text,
  ) : List.List<Item> {
    items.filter(func(item) { item.category == category });
  };

  public func filterItemsByStockStatus(
    items : List.List<Item>,
    status : Common.StockStatus,
  ) : List.List<Item> {
    items.filter(func(item) {
      let isLow = isLowStock(item);
      switch (status) {
        case (#low) { isLow };
        case (#safe) { not isLow };
      };
    });
  };

  public func filterMovementsByDateRange(
    movements : List.List<StockMovement>,
    startDate : Int,
    endDate : Int,
  ) : List.List<StockMovement> {
    movements.filter(func(movement) {
      movement.date >= startDate and movement.date <= endDate;
    });
  };

  public func filterMovementsByItemId(
    movements : List.List<StockMovement>,
    itemId : Types.ItemId,
  ) : List.List<StockMovement> {
    movements.filter(func(movement) { movement.itemId == itemId });
  };
};
