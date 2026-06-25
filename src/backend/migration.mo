import Map "mo:core/Map";
import List "mo:core/List";
import Principal "mo:core/Principal";
import Types "./types/inventory";
import Common "./types/common";

module {
  // Old types defined inline (copied from .old/src/backend/main.mo)
  type OldTask = {
    id : Nat;
    title : Text;
    dueDate : ?Int;
    priority : Text;
    notes : ?Text;
    completed : Bool;
  };

  type OldUser = {
    displayName : Text;
  };

  type OldActor = {
    users : Map.Map<Principal, OldUser>;
    tasks : Map.Map<Principal, Map.Map<Nat, OldTask>>;
    var nextTaskId : Nat;
  };

  type NewActor = {
    items : List.List<Types.Item>;
    movements : List.List<Types.StockMovement>;
    state : { var nextItemId : Nat; var nextMovementId : Nat };
  };

  public func run(_old : OldActor) : NewActor {
    // Discard old state and initialize fresh inventory state
    let items = List.empty<Types.Item>();
    let movements = List.empty<Types.StockMovement>();
    {
      items = items;
      movements = movements;
      state = { var nextItemId = 0; var nextMovementId = 0 };
    };
  };
};
