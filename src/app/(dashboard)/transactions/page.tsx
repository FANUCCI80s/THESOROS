export default function TransactionsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-[family-name:var(--font-playfair)] text-2xl sm:text-3xl font-semibold">
          Transactions
        </h1>
        <p className="mt-1 text-sm text-foreground-muted">
          Complete history of deposits, withdrawals, and investment movements
        </p>
      </div>

      <div className="card-premium overflow-hidden">
        <div className="px-6 py-12 text-center text-foreground-muted text-sm">
          No transactions yet. Deposits and withdrawals will appear here with
          full ledger details (type, status, amount, balance before/after,
          reference).
        </div>
      </div>
    </div>
  );
}
