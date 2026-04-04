import { useState } from 'react'
import { mockTransactions } from '../../data/mockData'
import { formatDate } from '../../data/helpers'
import type { Transaction, TransactionType } from '../../types/domain'

type Filter = 'all' | TransactionType

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'credit', label: 'Credits' },
  { key: 'debit', label: 'Debits' },
]

function computeBalance(transactions: Transaction[]): number {
  return transactions.reduce((acc, t) => {
    return t.type === 'credit' ? acc + t.amount : acc - t.amount
  }, 0)
}

interface TransactionRowProps {
  transaction: Transaction
}

function TransactionRow({ transaction }: TransactionRowProps) {
  const isCredit = transaction.type === 'credit'
  return (
    <div className="flex items-center gap-3 py-3 border-b border-default last:border-b-0">
      <div
        className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
          isCredit ? 'bg-brand-soft' : 'bg-muted'
        }`}
        aria-hidden="true"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className={`w-4 h-4 ${isCredit ? 'text-brand' : 'text-secondary'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          {isCredit
            ? <path d="M12 19V5M5 12l7-7 7 7" />
            : <path d="M12 5v14M5 12l7 7 7-7" />}
        </svg>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-primary truncate">{transaction.description}</p>
        <p className="text-xs text-muted mt-0.5">
          {formatDate(transaction.date)}
          {transaction.bookingRef && (
            <span className="ml-2 text-brand">· {transaction.bookingRef}</span>
          )}
        </p>
      </div>
      <span
        className={`font-brand font-bold text-sm flex-shrink-0 ${
          isCredit ? 'text-success' : 'text-brand'
        }`}
      >
        {isCredit ? '+' : '-'}₹{transaction.amount.toLocaleString('en-IN')}
      </span>
    </div>
  )
}

export default function WalletPage() {
  const [filter, setFilter] = useState<Filter>('all')

  const balance = computeBalance(mockTransactions)
  const filtered = filter === 'all'
    ? mockTransactions
    : mockTransactions.filter(t => t.type === filter)

  return (
    <main className="min-h-screen bg-surface">
      <div className="max-w-xl mx-auto px-4 py-6 md:py-8">
        <header className="mb-6">
          <h1 className="font-brand text-2xl md:text-3xl font-bold text-primary">Wallet</h1>
          <p className="text-muted text-sm mt-1">Your balance and transaction history</p>
        </header>

        {/* Balance card */}
        <div
          className="rounded-2xl p-6 md:p-8 mb-6 text-white relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, var(--color-primary-dark) 0%, var(--color-primary) 100%)' }}
          aria-label="Wallet balance"
        >
          {/* Decorative circles */}
          <div className="absolute -top-8 -right-8 w-36 h-36 rounded-full opacity-10 bg-white" aria-hidden="true" />
          <div className="absolute -bottom-10 right-16 w-28 h-28 rounded-full opacity-5 bg-white" aria-hidden="true" />

          <p className="text-sm font-medium opacity-80 mb-1">Available Balance</p>
          <p className="font-brand text-4xl font-bold tracking-tight">
            ₹{balance.toLocaleString('en-IN')}
          </p>
          <p className="text-xs opacity-60 mt-3">Based on {mockTransactions.length} transactions</p>
        </div>

        {/* Filter tabs */}
        <div
          className="flex gap-1 bg-muted rounded-xl p-1 mb-5"
          role="tablist"
          aria-label="Transaction filter"
        >
          {FILTERS.map(({ key, label }) => (
            <button
              key={key}
              role="tab"
              aria-selected={filter === key}
              onClick={() => setFilter(key)}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
                filter === key
                  ? 'bg-card text-brand shadow-sm'
                  : 'text-secondary hover:text-primary'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Transaction list */}
        <section className="glass-card px-4 py-1" aria-label="Transactions">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-muted text-sm">No transactions found.</div>
          ) : (
            filtered.map(t => <TransactionRow key={t.id} transaction={t} />)
          )}
        </section>
      </div>
    </main>
  )
}
