import List "mo:core/List";
import Time "mo:core/Time";
import Runtime "mo:core/Runtime";
import Types "../types/inventory";
import Common "../types/common";
import InventoryLib "../lib/inventory";

mixin (
  items : List.List<Types.Item>,
  movements : List.List<Types.StockMovement>,
  state : { var nextItemId : Nat; var nextMovementId : Nat },
) {
  // Dashboard
  public query func getDashboardSummary() : async Types.DashboardSummary {
    let now = Time.now();
    InventoryLib.calculateDashboardSummary(items, now, 30);
  };

  public query func getNearExpiryItems() : async [Types.Item] {
    let now = Time.now();
    let nearExpiryItems = items.filter(func(item) {
      InventoryLib.isNearExpiry(item, now, 30);
    });
    nearExpiryItems.toArray();
  };

  // Master Barang
  public query func listItems() : async [Types.Item] {
    items.toArray();
  };

  public query func getItem(id : Types.ItemId) : async ?Types.Item {
    items.find(func(item) { item.id == id });
  };

  public shared func createItem(input : Types.ItemInput) : async { #ok : Types.ItemId; #err : { #invalidData : Text } } {
    // Check for duplicate SKU
    switch (items.find(func(item) { item.sku == input.sku })) {
      case (?_) {
        return #err(#invalidData("SKU sudah digunakan"));
      };
      case (null) {};
    };

    let id = state.nextItemId;
    state.nextItemId += 1;
    let newItem = InventoryLib.createItem(id, input);
    items.add(newItem);
    #ok(id);
  };

  public shared func updateItem(id : Types.ItemId, input : Types.ItemInput) : async { #ok : Bool; #err : { #invalidData : Text } } {
    // Check for duplicate SKU, excluding the item being updated
    switch (items.find(func(item) { item.sku == input.sku and item.id != id })) {
      case (?_) {
        return #err(#invalidData("SKU sudah digunakan oleh barang lain"));
      };
      case (null) {};
    };

    var found = false;
    items.mapInPlace(func(item) {
      if (item.id == id) {
        found := true;
        InventoryLib.updateItem(item, input);
      } else {
        item;
      };
    });
    #ok(found);
  };

  public shared func deleteItem(id : Types.ItemId) : async Bool {
    let originalSize = items.size();
    items.retain(func(item) { item.id != id });
    let newSize = items.size();
    if (newSize < originalSize) {
      movements.retain(func(movement) { movement.itemId != id });
      true;
    } else {
      false;
    };
  };

  public query func getItemStockHistory(itemId : Types.ItemId) : async [Types.StockMovement] {
    let itemMovements = InventoryLib.filterMovementsByItemId(movements, itemId);
    itemMovements.toArray();
  };

  // Stok Masuk
  public shared func recordStockIn(itemId : Types.ItemId, quantity : Nat, date : Int, note : Text) : async Bool {
    var found = false;
    items.mapInPlace(func(item) {
      if (item.id == itemId) {
        found := true;
        InventoryLib.addStock(item, quantity);
      } else {
        item;
      };
    });

    if (found) {
      let movementId = state.nextMovementId;
      state.nextMovementId += 1;
      movements.add({
        id = movementId;
        itemId = itemId;
        quantity = quantity;
        date = date;
        note = note;
        movementType = #in_;
      });
    };

    found;
  };

  public query func listStockIn() : async [Types.StockMovement] {
    let stockInMovements = movements.filter(func(movement) {
      movement.movementType == #in_;
    });
    stockInMovements.toArray();
  };

  // Stok Keluar
  public shared func recordStockOut(itemId : Types.ItemId, quantity : Nat, date : Int, note : Text) : async Bool {
    switch (items.find(func(item) { item.id == itemId })) {
      case (?item) {
        if (not InventoryLib.canRemoveStock(item, quantity)) {
          Runtime.trap("Stok tidak mencukupi");
        };

        items.mapInPlace(func(i) {
          if (i.id == itemId) {
            InventoryLib.removeStock(i, quantity);
          } else {
            i;
          };
        });

        let movementId = state.nextMovementId;
        state.nextMovementId += 1;
        movements.add({
          id = movementId;
          itemId = itemId;
          quantity = quantity;
          date = date;
          note = note;
          movementType = #out;
        });

        true;
      };
      case (null) {
        false;
      };
    };
  };

  public query func listStockOut() : async [Types.StockMovement] {
    let stockOutMovements = movements.filter(func(movement) {
      movement.movementType == #out;
    });
    stockOutMovements.toArray();
  };

  // Laporan
  public query func getStockReport(category : ?Text, status : ?Common.StockStatus) : async [Types.Item] {
    var result = items;

    switch (category) {
      case (?cat) {
        result := InventoryLib.filterItemsByCategory(result, cat);
      };
      case (null) {};
    };

    switch (status) {
      case (?stat) {
        result := InventoryLib.filterItemsByStockStatus(result, stat);
      };
      case (null) {};
    };

    result.toArray();
  };

  public query func getMovementReport(startDate : Int, endDate : Int) : async [Types.StockMovement] {
    let filteredMovements = InventoryLib.filterMovementsByDateRange(movements, startDate, endDate);
    filteredMovements.toArray();
  };
};
