# Minimal PyTeal smart contract example
# This is a placeholder showing how to write a simple stateless approval program.

from pyteal import *

def approval_program():
    # Simple stateless program that approves only on NoOp
    handle_noop = Return(Int(1))
    handle_optin = Return(Int(0))

    program = Cond(
        [Txn.application_id() == Int(0), Return(Int(1))],  # on creation
        [Txn.on_completion() == OnComplete.NoOp, handle_noop],
        [Txn.on_completion() == OnComplete.OptIn, handle_optin],
    )

    return program

if __name__ == "__main__":
    print(compileTeal(approval_program(), mode=Mode.Application, version=7))
