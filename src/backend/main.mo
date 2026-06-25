import List "mo:core/List";
import InventoryTypes "types/inventory";
import InventoryMixin "mixins/inventory-api";
import Migration "migration";
import MixinViews "mo:caffeineai-data-viewer/MixinViews";

(with migration = Migration.run)
actor {
  include MixinViews();

  let items = List.empty<InventoryTypes.Item>();
  let movements = List.empty<InventoryTypes.StockMovement>();
  let state = { var nextItemId = 0; var nextMovementId = 0 };

  include InventoryMixin(items, movements, state);
};
