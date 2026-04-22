import { useState, useEffect } from 'react'
import useStore from '../../store/useStore'
import { walletService } from '../../services/walletService'
import { formatDate } from '../../data/helpers'
import type { Transaction, TransactionType } from '../../types/domain'
import { ListEmptyState } from '../../components/common/ListEmptyState'
import { WalletIcon } from '../../components/common/Icons'

type Filter = 'all' | TransactionType

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'credit', label: 'Credits' },
  { key: 'debit', label: 'Debits' },
]

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
  const [balance, setBalance] = useState<number>(0)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const showToast = useStore(state => state.showToast)

  const fetchWalletData = async () => {
    try {
      setError(null)
      const [balanceResult, txResult] = await Promise.all([
        walletService.getBalance(),
        walletService.getTransactions(),
      ])
      setBalance(balanceResult.data.balance)
      setTransactions(txResult.data.data)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load wallet data'
      setError(message)
      showToast(message, 'danger')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchWalletData()
  }, [])

  const filtered = filter === 'all'
    ? transactions
    : transactions.filter(t => t.type === filter)

  if (isLoading) {
    return (
      <main className="min-h-screen bg-surface">
        <div className="max-w-xl mx-auto px-4 py-6 md:py-8">
          <header className="mb-6">
            <h1 className="font-brand text-2xl md:text-3xl font-bold text-primary">Wallet</h1>
            <p className="text-muted text-sm mt-1">Your balance and transaction history</p>
          </header>
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-8 h-8 border-3 border-muted border-t-brand rounded-full animate-spin" />
            <p className="text-muted text-sm mt-3">Loading wallet...</p>
          </div>
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="min-h-screen bg-surface">
        <div className="max-w-xl mx-auto px-4 py-6 md:py-8">
          <header className="mb-6">
            <h1 className="font-brand text-2xl md:text-3xl font-bold text-primary">Wallet</h1>
            <p className="text-muted text-sm mt-1">Your balance and transaction history</p>
          </header>
          <div className="flex flex-col items-center justify-center py-16 text-center fade-in">
            <p className="text-error text-sm font-medium">{error}</p>
            <button
              className="btn-base btn-secondary px-4 py-2 text-sm mt-4"
              onClick={() => { setIsLoading(true); fetchWalletData() }}
              aria-label="Retry loading wallet"
            >
              Retry
            </button>
          </div>
        </div>
      </main>
    )
  }

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
          <p className="text-xs opacity-60 mt-3">Based on {transactions.length} transactions</p>
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
            <ListEmptyState
              icon={<WalletIcon className="w-12 h-12" />}
              title={
                transactions.length === 0
                  ? 'No transactions yet'
                  : 'No transactions in this view'
              }
              description={
                transactions.length === 0
                  ? 'Credits and debits from bookings will appear here.'
                  : 'Try switching to All, Credits, or Debits.'
              }
              variant="embedded"
            />
          ) : (
            filtered.map(t => <TransactionRow key={t.id} transaction={t} />)
          )}
        </section>
      </div>
    </main>
  )
}
