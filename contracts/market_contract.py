from pyteal import *

def approval_program():
    # ===== Constants =====
    creator_key = Bytes("creator")
    outcome_a_asa_key = Bytes("outcome_a")
    outcome_b_asa_key = Bytes("outcome_b") 
    winning_outcome_key = Bytes("winner")
    is_resolved_key = Bytes("resolved")
    resolver_key = Bytes("resolver")
    escrow_key = Bytes("escrow")
    total_supply_a_key = Bytes("supply_a")
    total_supply_b_key = Bytes("supply_b")
    
    # ===== Helper Functions =====
    @Subroutine(TealType.uint64)
    def is_creator():
        return Txn.sender() == App.globalGet(creator_key)
    
    @Subroutine(TealType.uint64)
    def is_resolver():
        return Txn.sender() == App.globalGet(resolver_key)
    
    @Subroutine(TealType.uint64)
    def market_not_resolved():
        return App.globalGet(is_resolved_key) == Int(0)
    
    @Subroutine(TealType.uint64)
    def market_is_resolved():
        return App.globalGet(is_resolved_key) == Int(1)

    # ===== Application Creation =====
    on_creation = Seq([
        App.globalPut(creator_key, Txn.sender()),
        App.globalPut(resolver_key, Txn.sender()),
        App.globalPut(is_resolved_key, Int(0)),
        App.globalPut(total_supply_a_key, Int(0)),
        App.globalPut(total_supply_b_key, Int(0)),
        Approve()
    ])

    # ===== Setup Market =====
    on_setup = Seq([
        Assert(market_not_resolved()),
        Assert(is_creator()),
        Assert(Txn.application_args.length() == Int(3)),
        
        # Store ASA IDs for outcomes
        App.globalPut(outcome_a_asa_key, Btoi(Txn.application_args[1])),
        App.globalPut(outcome_b_asa_key, Btoi(Txn.application_args[2])),
        
        Approve()
    ])

    # ===== Resolve Market =====
    on_resolve = Seq([
        Assert(market_not_resolved()),
        Assert(is_resolver()),
        Assert(Txn.application_args.length() == Int(2)),
        
        # Set winning outcome (0 = outcome A, 1 = outcome B)
        App.globalPut(winning_outcome_key, Btoi(Txn.application_args[1])),
        App.globalPut(is_resolved_key, Int(1)),
        
        Approve()
    ])

    # ===== Buy Outcome Tokens =====
    on_buy = Seq([
        Assert(market_not_resolved()),
        Assert(Txn.application_args.length() == Int(3)),
        
        # Args: method, outcome (0=A, 1=B), amount
        # This would require a payment transaction in the group
        # For MVP, we'll just approve - actual token transfer handled by frontend
        Approve()
    ])

    # ===== Claim Winnings =====
    on_claim = Seq([
        Assert(market_is_resolved()),
        
        # In a full implementation, this would:
        # 1. Check user's balance of winning outcome tokens
        # 2. Calculate payout based on total pool and user's share
        # 3. Transfer ALGO from escrow to user
        # 4. Burn the user's outcome tokens
        
        Approve()
    ])

    # ===== Router =====
    on_call_method = Txn.application_args[0]
    on_call = Cond(
        [on_call_method == Bytes("setup"), on_setup],
        [on_call_method == Bytes("resolve"), on_resolve], 
        [on_call_method == Bytes("buy"), on_buy],
        [on_call_method == Bytes("claim"), on_claim],
    )

    # ===== Main Router =====
    program = Cond(
        [Txn.application_id() == Int(0), on_creation],
        [Txn.on_completion() == OnComplete.DeleteApplication, Return(is_creator())],
        [Txn.on_completion() == OnComplete.UpdateApplication, Return(is_creator())],
        [Txn.on_completion() == OnComplete.NoOp, on_call]
    )

    return program

def clear_state_program():
    return Approve()

if __name__ == "__main__":
    with open("market_approval.teal", "w") as f:
        f.write(compileTeal(approval_program(), mode=Mode.Application, version=6))
    
    with open("market_clear.teal", "w") as f:
        f.write(compileTeal(clear_state_program(), mode=Mode.Application, version=6))