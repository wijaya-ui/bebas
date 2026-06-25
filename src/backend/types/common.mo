module {
  public type UserId = Principal;
  public type Timestamp = Int;
  public type ItemId = Nat;
  public type TransactionId = Nat;

  public type StockStatus = {
    #low;
    #safe;
  };

  public type MovementType = {
    #in_;
    #out;
  };
};
