import type { TransactionType } from '../types'
import { TopControls } from '../components/dashboard/TopControls'
import { RouteMeta } from '../components/seo/RouteMeta'
import { useDashboard } from '../context/DashboardContext'
import { downloadCsv, downloadJson, formatCurrency, percentFormatter } from '../utils/finance'

export function TransactionsPage() {
  const {
    filteredTransactions,
    accounts,
    categories,
    role,
    setRole,
    theme,
    setTheme,
    currency,
    setCurrency,
    range,
    setRange,
    category,
    setCategory,
    search,
    setSearch,
    draft,
    setDraft,
    insightMessage,
    recentTransactions,
    highestSpendingCategory,
    savingsRate,
    handleCreateTransaction,
    handleDeleteTransaction,
    asDisplayCurrency,
  } = useDashboard()

  return (
    <>
      <RouteMeta
        title="Transactions"
        description="Transaction management page with filtering, search, add transaction form, and detailed activity table."
        path="/transactions"
      />
      <TopControls
        title="Transactions"
        eyebrow="Manage and review transaction activity"
        search={search}
        setSearch={setSearch}
        role={role}
        setRole={setRole}
        currency={currency}
        setCurrency={setCurrency}
        themeChecked={theme === 'dark'}
        onThemeChange={(checked) => setTheme(checked ? 'dark' : 'light')}
        onExportCsv={() => downloadCsv(filteredTransactions)}
        onExportJson={() => downloadJson(filteredTransactions)}
        range={range}
        setRange={setRange}
        category={category}
        setCategory={setCategory}
        categories={categories}
      />

      <section className="lower-grid">
        <article className="panel panel--form">
          <div className="panel__heading">
            <div>
              <span className="eyebrow">Admin controls</span>
              <h2>Record a transaction</h2>
            </div>
            <span className={`badge ${role === 'admin' ? 'is-positive' : ''}`}>
              {role === 'admin' ? 'Editable' : 'Viewer locked'}
            </span>
          </div>

          <form className="transaction-form" onSubmit={handleCreateTransaction}>
            <label className="field">
              <span>Description</span>
              <input value={draft.description} disabled={role !== 'admin'} onChange={(event) => setDraft((current) => ({ ...current, description: event.target.value }))} placeholder="Add a note" />
            </label>
            <label className="field">
              <span>Amount</span>
              <input type="number" value={draft.amount} disabled={role !== 'admin'} onChange={(event) => setDraft((current) => ({ ...current, amount: event.target.value }))} placeholder="0" />
            </label>
            <label className="field">
              <span>Type</span>
              <select value={draft.type} disabled={role !== 'admin'} onChange={(event) => setDraft((current) => ({ ...current, type: event.target.value as TransactionType }))}>
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </select>
            </label>
            <label className="field">
              <span>Category</span>
              <select value={draft.category} disabled={role !== 'admin'} onChange={(event) => setDraft((current) => ({ ...current, category: event.target.value }))}>
                {categories.filter((item) => item !== 'All categories').map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              <span>Account</span>
              <select value={draft.account} disabled={role !== 'admin'} onChange={(event) => setDraft((current) => ({ ...current, account: event.target.value }))}>
                {accounts.map((accountName) => (
                  <option key={accountName} value={accountName}>
                    {accountName}
                  </option>
                ))}
              </select>
            </label>
            <button className="solid-button" type="submit" disabled={role !== 'admin'}>
              Add transaction
            </button>
          </form>
          {role !== 'admin' ? <p className="form-hint">Switch to admin to edit transactions and unlock form controls.</p> : null}
        </article>

        <article className="panel">
          <div className="panel__heading">
            <div>
              <span className="eyebrow">Insights</span>
              <h2>What changed</h2>
            </div>
          </div>
          <p className="insight-copy">{insightMessage}</p>
          <ul className="insights-list">
            <li>
              <span>Highest spending category</span>
              <strong>{highestSpendingCategory?.category ?? 'N/A'}</strong>
            </li>
            <li>
              <span>Current savings rate</span>
              <strong>{percentFormatter.format(savingsRate)}</strong>
            </li>
            <li>
              <span>Role mode</span>
              <strong>{role === 'admin' ? 'Full access' : 'Read only'}</strong>
            </li>
          </ul>
        </article>
      </section>

      <section className="panel">
        <div className="panel__heading">
          <div>
            <span className="eyebrow">Recent activity</span>
            <h2>Transactions</h2>
          </div>
          <strong>{recentTransactions.length} rows</strong>
        </div>

        <div className="table-wrap">
          <table className="transactions-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th>Category</th>
                <th>Account</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {recentTransactions.length === 0 ? (
                <tr className="table-row-empty">
                  <td className="table-empty" colSpan={7}>
                    No results found for the current search or filter.
                  </td>
                </tr>
              ) : (
                recentTransactions.map((transaction) => (
                  <tr key={transaction.id}>
                    <td>{transaction.date}</td>
                    <td>{transaction.description}</td>
                    <td>{transaction.category}</td>
                    <td>{transaction.account}</td>
                    <td>
                      <span className={`table-badge ${transaction.type === 'income' ? 'is-income' : 'is-expense'}`}>{transaction.type}</span>
                    </td>
                    <td className={transaction.type === 'income' ? 'amount amount--positive' : 'amount'}>
                      {transaction.type === 'income' ? '+' : '-'}
                      {formatCurrency(asDisplayCurrency(transaction.amount), currency)}
                    </td>
                    <td>
                      <button className="table-action" type="button" disabled={role !== 'admin'} title={role === 'admin' ? 'Delete transaction' : 'Switch to admin to edit'} onClick={() => handleDeleteTransaction(transaction.id)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </>
  )
}
