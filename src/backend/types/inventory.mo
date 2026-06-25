module {
  public type ItemId = Nat;

  public type Item = {
    id : ItemId;
    name : Text;
    sku : Text;
    category : Text;
    unit : Text;
    minStock : Nat;
    expiryDate : ?Int;
    currentStock : Nat;
  };

  public type ItemInput = {
    name : Text;
    sku : Text;
    category : Text;
    unit : Text;
    minStock : Nat;
    expiryDate : ?Int;
  };

  public type StockMovement = {
    id : Nat;
    itemId : ItemId;
    quantity : Nat;
    date : Int;
    note : Text;
    movementType : { #in_; #out };
  };

  public type DashboardSummary = {
    totalItems : Nat;
    totalStock : Nat;
    lowStockCount : Nat;
    nearExpiryCount : Nat;
  };
};
