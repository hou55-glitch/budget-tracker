import { useState, useEffect, useCallback, useRef } from 'react'
import { Doughnut, Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS, ArcElement, Tooltip, Legend,
  CategoryScale, LinearScale, BarElement,
} from 'chart.js'
import { supabase } from './lib/supabase'

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement)

// ─── Constants ────────────────────────────────────────────────────────────────

const ALLOWED_EMAIL = 'choursogloukon55@gmail.com'

const ENVELOPES = [
  { id: 'food',          name: 'Food',          budget: 300,     color: '#1D9E75' },
  { id: 'transport',     name: 'Transportation', budget: 30,      color: '#378ADD' },
  { id: 'cleaning',      name: 'Cleaning',       budget: 80,      color: '#7F77DD' },
  { id: 'phone',         name: 'Cell phone',     budget: 30,      color: '#888780' },
  { id: 'books',         name: 'Books',          budget: 50,      color: '#BA7517' },
  { id: 'care',          name: 'Personal care',  budget: 50,      color: '#D4537E' },
  { id: 'clothes',       name: 'Clothes',        budget: 0,       color: '#D85A30' },
  { id: 'subscriptions', name: 'Subscriptions',  budget: 125.98,  color: '#639922' },
  { id: 'savings',       name: 'Savings',        budget: 250,     color: '#5DCAA5' },
  { id: 'investments',   name: 'Investments',    budget: 5280,    color: '#3C3489' },
  { id: 'other',         name: 'Other',          budget: 0,       color: '#888780' },
]

const RECURRING = [
  { id: 'r1', desc: 'Revolut',  eur: 45,    cat: 'subscriptions' },
  { id: 'r2', desc: 'Netflix',  eur: 15.99, cat: 'subscriptions' },
  { id: 'r3', desc: 'Starlink', eur: 40,    cat: 'subscriptions' },
  { id: 'r4', desc: 'iCloud',   eur: 2.99,  cat: 'subscriptions' },
  { id: 'r5', desc: 'Claude',   eur: 22,    cat: 'subscriptions' },
]

const SEED_EXPENSES = [
  { date: '2026-04-12', desc: 'Gyros',              cat: 'food',          eur: 15.59 },
  { date: '2026-04-11', desc: 'Jumbo',              cat: 'food',          eur: 10.31 },
  { date: '2026-04-11', desc: 'Haircut',            cat: 'care',          eur: 18.81 },
  { date: '2026-04-10', desc: 'Lunch',              cat: 'food',          eur: 18.37 },
  { date: '2026-04-10', desc: 'Coffee',             cat: 'food',          eur: 2.38  },
  { date: '2026-04-10', desc: 'Uber',               cat: 'food',          eur: 3.67  },
  { date: '2026-04-09', desc: 'Coffee',             cat: 'food',          eur: 4.94  },
  { date: '2026-04-09', desc: 'Uber',               cat: 'transport',     eur: 3.69  },
  { date: '2026-04-09', desc: 'Cheese',             cat: 'food',          eur: 0.99  },
  { date: '2026-04-08', desc: 'Coffee',             cat: 'food',          eur: 2.56  },
  { date: '2026-04-08', desc: 'Water',              cat: 'food',          eur: 1.60  },
  { date: '2026-04-07', desc: 'Coffee',             cat: 'food',          eur: 2.56  },
  { date: '2026-04-07', desc: 'Uber',               cat: 'transport',     eur: 3.69  },
  { date: '2026-04-06', desc: 'Coffee',             cat: 'cleaning',      eur: 2.80  },
  { date: '2026-04-05', desc: 'Food for the month', cat: 'food',          eur: 164.63 },
  { date: '2026-04-05', desc: 'KFC',                cat: 'food',          eur: 14.37 },
  { date: '2026-04-05', desc: 'Cleaning',           cat: 'cleaning',      eur: 23.50 },
  { date: '2026-04-05', desc: 'DollarCity',         cat: 'cleaning',      eur: 21.87 },
  { date: '2026-04-05', desc: 'Adapter',            cat: 'books',         eur: 7.06  },
  { date: '2026-04-04', desc: 'Lunch',              cat: 'food',          eur: 11.14 },
  { date: '2026-04-04', desc: 'Supermarket',        cat: 'food',          eur: 56.01 },
  { date: '2026-04-04', desc: 'Coffee',             cat: 'food',          eur: 2.82  },
  { date: '2026-04-03', desc: 'Uber',               cat: 'transport',     eur: 3.69  },
  { date: '2026-04-03', desc: 'Steak',              cat: 'food',          eur: 58.46 },
  { date: '2026-04-03', desc: 'Indian',             cat: 'food',          eur: 20.15 },
  { date: '2026-04-03', desc: 'Credit Card',        cat: 'care',          eur: 74.00 },
  { date: '2026-04-02', desc: 'Bacu',               cat: 'food',          eur: 13.55 },
  { date: '2026-04-02', desc: 'Wipes',              cat: 'care',          eur: 2.47  },
  { date: '2026-04-02', desc: 'Coffee',             cat: 'food',          eur: 2.82  },
  { date: '2026-04-01', desc: 'Food',               cat: 'food',          eur: 14.77 },
  { date: '2026-04-01', desc: 'Coffee',             cat: 'food',          eur: 2.80  },
  { date: '2026-04-04', desc: 'Revolut',            cat: 'subscriptions', eur: 45.00,    recurring_id: 'r1' },
  { date: '2026-04-04', desc: 'Netflix',            cat: 'subscriptions', eur: 15.99,    recurring_id: 'r2' },
  { date: '2026-04-04', desc: 'Starlink',           cat: 'subscriptions', eur: 40.00,    recurring_id: 'r3' },
  { date: '2026-04-04', desc: 'iCloud',             cat: 'subscriptions', eur: 2.99,     recurring_id: 'r4' },
  { date: '2026-04-04', desc: 'Claude',             cat: 'subscriptions', eur: 22.00,    recurring_id: 'r5' },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function currentMonthKey() {
  const d = new Date()
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0')
}

function monthLabel(key) {
  const [y, m] = key.split('-')
  return new Date(y, m - 1, 1).toLocaleString('en', { month: 'long', year: 'numeric' })
}

function downloadCSV(rows, filename) {
  const blob = new Blob([rows.map(r => r.map(v => '"' + v + '"').join(',')).join('\n')], { type: 'text/csv' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = filename
  a.click()
}

function todayKey() {
  return new Date().toISOString().slice(0, 10)
}

async function createBackupToStorage(expensesData, archiveData) {
  const payload = {
    backed_up_at: new Date().toISOString(),
    expenses: expensesData,
    archive: archiveData,
  }
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
  const path = `backup-${todayKey()}.json`
  // upsert: overwrite if same-day backup already exists
  const { error } = await supabase.storage
    .from('backups')
    .upload(path, blob, { upsert: true })
  if (error) console.error('Backup upload failed:', error)
  return !error
}

// ─── Login Screen ─────────────────────────────────────────────────────────────

function LoginScreen({ onLogin }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleGoogleLogin() {
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    })
    if (error) {
      setError(error.message)
      setLoading(false)
    }
  }

  return (
    <div id="login-screen">
      <div className="login-box">
        <h1>💸 Budget Tracker</h1>
        <p>Sign in to continue</p>
        <button className="btn-google" onClick={handleGoogleLogin} disabled={loading}>
          <svg width="18" height="18" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.35-8.16 2.35-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            <path fill="none" d="M0 0h48v48H0z"/>
          </svg>
          {loading ? 'Signing in…' : 'Sign in with Google'}
        </button>
        {error && <div style={{ fontSize: 13, color: 'var(--red)', marginTop: 8 }}>{error}</div>}
      </div>
    </div>
  )
}

// ─── Envelopes Tab ────────────────────────────────────────────────────────────

function EnvelopesTab({ expenses }) {
  const spent = {}
  ENVELOPES.forEach(e => { spent[e.id] = 0 })
  expenses.forEach(e => { if (spent[e.cat] !== undefined) spent[e.cat] += e.eur })

  return (
    <div className="envelopes">
      {ENVELOPES.map(env => {
        const s = spent[env.id] || 0
        const b = env.budget
        if (b === 0 && s === 0) return null
        const pct = b > 0 ? Math.min(100, (s / b) * 100) : 100
        const over = b > 0 && s > b
        const rem = b - s
        return (
          <div className="env-card" key={env.id}>
            <div className="env-header">
              <span className="env-name">{env.name}</span>
              <span className="env-amounts">€{s.toFixed(0)} / {b > 0 ? '€' + b : '—'}</span>
            </div>
            <div className="bar-bg">
              <div className="bar-fill" style={{ width: pct + '%', background: over ? '#E24B4A' : env.color }} />
            </div>
            <div className={'env-remaining ' + (over ? 'warn' : 'ok')}>
              {b > 0
                ? (over ? 'Over €' + Math.abs(rem).toFixed(2) : '€' + rem.toFixed(2) + ' left')
                : '€' + s.toFixed(2) + ' spent'}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ─── Add Expense Tab ──────────────────────────────────────────────────────────

function AddTab({ rate, onAdd, onSwitchTab }) {
  const [desc, setDesc] = useState('')
  const [cop, setCop] = useState('')
  const [eur, setEur] = useState('')
  const [cat, setCat] = useState('food')
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))

  function handleCopChange(val) {
    setCop(val)
    const c = parseFloat(val)
    setEur(!isNaN(c) && c > 0 ? (c / rate).toFixed(2) : '')
  }

  function handleEurChange(val) {
    setEur(val)
    const e = parseFloat(val)
    setCop(!isNaN(e) && e > 0 ? String(Math.round(e * rate)) : '')
  }

  async function handleAdd() {
    const eurVal = parseFloat(eur)
    if (!desc.trim() || isNaN(eurVal) || eurVal <= 0) {
      alert('Please fill in description and amount.')
      return
    }
    await onAdd({ desc: desc.trim(), eur: eurVal, cat, date: date || new Date().toISOString().slice(0, 10) })
    setDesc('')
    setCop('')
    setEur('')
    setDate(new Date().toISOString().slice(0, 10))
    onSwitchTab('envelopes')
  }

  return (
    <div className="add-form">
      <div className="form-group">
        <label>Description</label>
        <input type="text" placeholder="e.g. Mercado Exito" value={desc} onChange={e => setDesc(e.target.value)} />
      </div>
      <div className="form-row">
        <div>
          <label>Amount in COP</label>
          <input type="number" placeholder="0" value={cop} onChange={e => handleCopChange(e.target.value)} />
        </div>
        <div>
          <label>Amount in EUR</label>
          <input type="number" placeholder="0" value={eur} onChange={e => handleEurChange(e.target.value)} />
        </div>
      </div>
      <div className="fx-hint">Enter COP or EUR — the other converts automatically</div>
      <div className="form-row" style={{ marginTop: 10 }}>
        <div>
          <label>Category</label>
          <select value={cat} onChange={e => setCat(e.target.value)}>
            {ENVELOPES.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
          </select>
        </div>
        <div>
          <label>Date</label>
          <input type="date" value={date} onChange={e => setDate(e.target.value)} />
        </div>
      </div>
      <button className="btn-add" onClick={handleAdd}>Add expense</button>
    </div>
  )
}

// ─── History Tab ──────────────────────────────────────────────────────────────

function HistoryTab({ expenses, archive, rate, onDelete }) {
  // Build list of available months: current + archived
  const currentMK = currentMonthKey()
  const archivedKeys = Object.keys(archive).sort().reverse()
  const allMonths = [currentMK, ...archivedKeys.filter(k => k !== currentMK)]

  const [selectedMonth, setSelectedMonth] = useState(currentMK)

  const isCurrent = selectedMonth === currentMK
  const raw = isCurrent ? expenses : (archive[selectedMonth] || [])
  const items = [...raw].sort((a, b) => b.date.localeCompare(a.date))

  function handleDownloadCSV() {
    const rows = [['Date', 'Description', 'Category', 'EUR']]
    items.forEach(e => {
      const env = ENVELOPES.find(v => v.id === e.cat) || { name: e.cat }
      rows.push([e.date, e.desc, env.name, e.eur.toFixed(2)])
    })
    downloadCSV(rows, 'budget-' + selectedMonth + '.csv')
  }

  return (
    <div>
      <div className="history-controls">
        <select
          className="month-select"
          value={selectedMonth}
          onChange={e => setSelectedMonth(e.target.value)}
        >
          {allMonths.map(k => (
            <option key={k} value={k}>{monthLabel(k)}{k === currentMK ? ' (current)' : ''}</option>
          ))}
        </select>
        {items.length > 0 && (
          <button className="export-btn-sm" onClick={handleDownloadCSV}>⬇ CSV</button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="tx-list"><div className="empty">No expenses for {monthLabel(selectedMonth)}</div></div>
      ) : (
        <div className="tx-list">
          <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 6 }}>
            {items.length} expense{items.length !== 1 ? 's' : ''} · Total: €{items.reduce((a, e) => a + e.eur, 0).toFixed(2)}
          </div>
          {items.map((e, i) => {
            const env = ENVELOPES.find(v => v.id === e.cat) || { name: e.cat }
            const isRec = !!e.recurring_id
            return (
              <div className={'tx-item' + (isRec ? ' recurring' : '')} key={e.id || i}>
                <div className="tx-left">
                  <span className="tx-name">
                    {e.desc}
                    {isRec && <span style={{ fontSize: 10, color: '#378ADD' }}> ↻</span>}
                  </span>
                  <span className="tx-meta">{e.date} · {env.name}</span>
                </div>
                <div className="tx-right">
                  <div className="tx-eur">−€{e.eur.toFixed(2)}</div>
                  <div className="tx-cop">{Math.round(e.eur * rate).toLocaleString()} COP</div>
                </div>
                {isCurrent && <button className="tx-del" onClick={() => onDelete(e.id)}>✕</button>}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ─── Charts Tab ───────────────────────────────────────────────────────────────

function ChartsTab({ expenses, rate, darkMode }) {
  const spent = {}
  ENVELOPES.forEach(e => { spent[e.id] = 0 })
  expenses.forEach(e => { if (spent[e.cat] !== undefined) spent[e.cat] += e.eur })

  const totalBudget = ENVELOPES.reduce((a, e) => a + e.budget, 0)
  const totalSpent = Object.values(spent).reduce((a, b) => a + b, 0)
  const pct = totalBudget > 0 ? ((totalSpent / totalBudget) * 100).toFixed(1) : 0

  const catLabels = [], catData = [], catColors = []
  ENVELOPES.forEach(e => {
    if ((spent[e.id] || 0) > 0) {
      catLabels.push(e.name)
      catData.push(parseFloat(spent[e.id].toFixed(2)))
      catColors.push(e.color)
    }
  })

  const visEnvs = ENVELOPES.filter(e => (spent[e.id] || 0) > 0 || e.budget > 0)
  const barH = Math.max(260, visEnvs.length * 44 + 60)
  const tickColor = darkMode ? '#888' : '#555'
  const gridColor = darkMode ? '#333' : '#eee'
  const legendColor = darkMode ? '#ccc' : '#555'

  return (
    <>
      <div className="summary-cards">
        <div className="sum-card">
          <div className="sum-title">Total budget</div>
          <div className="sum-val">€{totalBudget.toLocaleString()}</div>
          <div className="sum-sub">{Math.round(totalBudget * rate).toLocaleString()} COP</div>
        </div>
        <div className="sum-card">
          <div className="sum-title">Spent</div>
          <div className="sum-val">€{totalSpent.toFixed(2)}</div>
          <div className="sum-sub">{Math.round(totalSpent * rate).toLocaleString()} COP</div>
        </div>
        <div className="sum-card">
          <div className="sum-title">Used</div>
          <div className="sum-val" style={{ color: pct > 100 ? '#E24B4A' : '#1D9E75' }}>{pct}%</div>
          <div className="sum-sub">{monthLabel(currentMonthKey())}</div>
        </div>
      </div>

      <div className="section-title">Spending by category</div>
      {catData.length > 0 && (
        <div className="chart-wrap">
          <Doughnut
            data={{ labels: catLabels, datasets: [{ data: catData, backgroundColor: catColors, borderWidth: 1 }] }}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: { legend: { position: 'right', labels: { font: { size: 11 }, boxWidth: 10, color: legendColor } } },
            }}
          />
        </div>
      )}

      <div className="section-title">Budget vs spent</div>
      <div className="chart-wrap" style={{ height: barH }}>
        <Bar
          data={{
            labels: visEnvs.map(e => e.name),
            datasets: [
              { label: 'Budget', data: visEnvs.map(e => e.budget), backgroundColor: darkMode ? '#444' : '#D3D1C7', borderRadius: 3 },
              { label: 'Spent',  data: visEnvs.map(e => parseFloat((spent[e.id] || 0).toFixed(2))), backgroundColor: '#378ADD', borderRadius: 3 },
            ],
          }}
          options={{
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { labels: { font: { size: 11 }, boxWidth: 10, color: legendColor } } },
            scales: {
              x: { ticks: { font: { size: 10 }, color: tickColor }, grid: { color: gridColor } },
              y: { ticks: { font: { size: 11 }, color: tickColor }, grid: { color: gridColor } },
            },
          }}
        />
      </div>
    </>
  )
}

// ─── Recurring Tab ────────────────────────────────────────────────────────────

function RecurringTab() {
  const total = RECURRING.reduce((a, r) => a + r.eur, 0)
  return (
    <>
      <div className="section-title">Auto-logged on the 1st of each month</div>
      <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 10 }}>
        Total: €{total.toFixed(2)}/month — auto-added on the 1st
      </div>
      {RECURRING.map(r => {
        const env = ENVELOPES.find(v => v.id === r.cat) || { name: r.cat }
        return (
          <div className="rec-card" key={r.id}>
            <div>
              <span className="rec-name">{r.desc}</span>
              <span className="rec-badge">{env.name}</span>
            </div>
            <span className="rec-amount">€{r.eur.toFixed(2)}</span>
          </div>
        )
      })}
    </>
  )
}

// ─── Archive Tab ──────────────────────────────────────────────────────────────

function ArchiveTab({ archive, onExportAll }) {
  const [open, setOpen] = useState({})
  const keys = Object.keys(archive).sort().reverse()

  function toggle(k) {
    setOpen(prev => ({ ...prev, [k]: !prev[k] }))
  }

  return (
    <>
      <div className="section-title">Past months</div>
      {keys.length === 0
        ? <div className="empty">No archived months yet</div>
        : keys.map(k => {
            const txs = archive[k]
            const total = txs.reduce((a, e) => a + e.eur, 0)
            return (
              <div className="archive-month" key={k}>
                <div className="archive-header" onClick={() => toggle(k)}>
                  <span>{monthLabel(k)}</span>
                  <span style={{ color: 'var(--text3)', fontWeight: 400 }}>
                    €{total.toFixed(2)} · {txs.length} exp ▾
                  </span>
                </div>
                {open[k] && (
                  <div className="archive-body">
                    {txs.map((e, i) => {
                      const env = ENVELOPES.find(v => v.id === e.cat) || { name: e.cat }
                      return (
                        <div className="archive-tx" key={i}>
                          <span>{e.date} · {e.desc} · {env.name}</span>
                          <span>−€{e.eur.toFixed(2)}</span>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })
      }
      <button className="export-btn" onClick={onExportAll}>⬇ Export all history to CSV</button>
    </>
  )
}

// ─── Main App ─────────────────────────────────────────────────────────────────

export default function App() {
  const [session, setSession] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [accessDenied, setAccessDenied] = useState(false)

  const [expenses, setExpenses] = useState([])
  const [archive, setArchive] = useState({})
  const [rate, setRate] = useState(4251.93)
  const [rateStatus, setRateStatus] = useState('')
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('bt_dark') === '1')
  const [activeTab, setActiveTab] = useState('envelopes')
  const [newMonthNotice, setNewMonthNotice] = useState(false)
  const [backupStatus, setBackupStatus] = useState('')
  const [archiveCount, setArchiveCount] = useState(0)
  const loadingRef = useRef(false)

  // ── Auth ──────────────────────────────────────────────────────────────────

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      handleSession(session)
      setAuthLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      handleSession(session)
    })
    return () => subscription.unsubscribe()
  }, [])

  async function handleSession(session) {
    if (!session) { setSession(null); return }
    const email = session.user?.email
    if (email !== ALLOWED_EMAIL) {
      setAccessDenied(true)
      await supabase.auth.signOut()
      setSession(null)
      return
    }
    setAccessDenied(false)
    setSession(session)
  }

  // ── Data loading ──────────────────────────────────────────────────────────

  useEffect(() => {
    if (!session) return
    loadExpenses()
    loadArchive()
    fetchRate()
    const interval = setInterval(fetchRate, 60 * 60 * 1000)
    return () => clearInterval(interval)
  }, [session])

  async function loadExpenses() {
    if (loadingRef.current) return
    loadingRef.current = true
    try {
      const monthKey = currentMonthKey()
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .eq('month_key', monthKey)
        .order('date', { ascending: false })
      if (error) { console.error(error); return }

      if (data.length === 0 && monthKey === '2026-04') {
        await seedApril2026()
      } else {
        setExpenses(data || [])
        await checkMonthRollover(monthKey)
      }
    } finally {
      loadingRef.current = false
    }
  }

  async function loadArchive() {
    const { data, error } = await supabase
      .from('archive')
      .select('*')
      .order('month_key', { ascending: false })
    if (error) { console.error(error); return }
    const arc = {}
    ;(data || []).forEach(row => {
      if (!arc[row.month_key]) arc[row.month_key] = []
      arc[row.month_key].push(row)
    })
    setArchive(arc)
    setArchiveCount((data || []).length)
  }

  // ── Backups ────────────────────────────────────────────────────────────────

  // Auto-backup once per day on app load
  useEffect(() => {
    if (!session || expenses.length === 0) return
    const lastBackup = localStorage.getItem('bt_last_backup')
    const today = todayKey()
    if (lastBackup === today) return
    // Fetch all data fresh for backup
    ;(async () => {
      setBackupStatus('backing up...')
      const { data: allExp } = await supabase.from('expenses').select('*')
      const { data: allArc } = await supabase.from('archive').select('*')
      const ok = await createBackupToStorage(allExp || [], allArc || [])
      if (ok) {
        localStorage.setItem('bt_last_backup', today)
        setBackupStatus('backed up today')
      } else {
        setBackupStatus('backup failed')
      }
    })()
  }, [session, expenses])

  async function handleManualBackup() {
    setBackupStatus('backing up...')
    const { data: allExp } = await supabase.from('expenses').select('*')
    const { data: allArc } = await supabase.from('archive').select('*')
    // Download as CSV locally
    const rows = [['Source', 'Month', 'Date', 'Description', 'Category', 'EUR', 'Recurring ID']]
    ;(allExp || []).forEach(e => {
      const env = ENVELOPES.find(v => v.id === e.cat) || { name: e.cat }
      rows.push(['expenses', e.month_key, e.date, e.desc, env.name, e.eur, e.recurring_id || ''])
    })
    ;(allArc || []).forEach(e => {
      const env = ENVELOPES.find(v => v.id === e.cat) || { name: e.cat }
      rows.push(['archive', e.month_key, e.date, e.desc, env.name, e.eur, e.recurring_id || ''])
    })
    downloadCSV(rows, 'budget-full-backup-' + todayKey() + '.csv')
    // Also save to Supabase storage
    const ok = await createBackupToStorage(allExp || [], allArc || [])
    if (ok) {
      localStorage.setItem('bt_last_backup', todayKey())
      setBackupStatus('backed up today')
    } else {
      setBackupStatus('CSV downloaded, cloud backup failed')
    }
  }

  async function seedApril2026() {
    const monthKey = '2026-04'
    const rows = SEED_EXPENSES.map(e => ({ ...e, month_key: monthKey }))
    const { data, error } = await supabase.from('expenses').insert(rows).select()
    if (error) { console.error(error); return }
    setExpenses((data || []).sort((a, b) => b.date.localeCompare(a.date)))
  }

  async function checkMonthRollover(current) {
    const stored = localStorage.getItem('bt_month')
    if (stored && stored !== current) {
      // SAFETY: backup all data before any rollover
      const { data: preExp } = await supabase.from('expenses').select('*')
      const { data: preArc } = await supabase.from('archive').select('*')
      await createBackupToStorage(preExp || [], preArc || [])
      localStorage.setItem('bt_last_backup', todayKey())

      // Fetch the OLD month's expenses from the DB to archive them
      const { data: oldExpenses } = await supabase
        .from('expenses')
        .select('*')
        .eq('month_key', stored)
      if (oldExpenses && oldExpenses.length > 0) {
        const archiveRows = oldExpenses.map(e => ({
          month_key: stored,
          date: e.date,
          desc: e.desc,
          cat: e.cat,
          eur: e.eur,
          recurring_id: e.recurring_id || null,
        }))
        await supabase.from('archive').insert(archiveRows)
        await supabase.from('expenses').delete().eq('month_key', stored)
      }
      setNewMonthNotice(true)
      // Add recurring for new month
      await addRecurringExpenses(current)
      // Reload current month expenses after adding recurring
      const { data: fresh } = await supabase
        .from('expenses')
        .select('*')
        .eq('month_key', current)
        .order('date', { ascending: false })
      setExpenses(fresh || [])
      await loadArchive()
    }
    localStorage.setItem('bt_month', current)
  }

  async function addRecurringExpenses(monthKey) {
    const today = new Date().toISOString().slice(0, 10)
    const rows = RECURRING.map(r => ({
      desc: r.desc, eur: r.eur, cat: r.cat, date: today,
      month_key: monthKey, recurring_id: r.id,
    }))
    // upsert with onConflict on the unique index — duplicates are silently ignored
    await supabase.from('expenses').upsert(rows, {
      onConflict: 'month_key,recurring_id',
      ignoreDuplicates: true,
    })
  }

  // ── Rate ──────────────────────────────────────────────────────────────────

  async function fetchRate() {
    setRateStatus('updating...')
    try {
      const res = await fetch('https://api.frankfurter.app/latest?from=EUR&to=COP')
      const data = await res.json()
      if (data.rates?.COP) {
        setRate(data.rates.COP)
        localStorage.setItem('bt_rate', data.rates.COP)
        setRateStatus('● live')
      }
    } catch {
      const saved = parseFloat(localStorage.getItem('bt_rate'))
      if (!isNaN(saved)) setRate(saved)
      setRateStatus('● offline')
    }
  }

  // ── Expense CRUD ──────────────────────────────────────────────────────────

  async function handleAdd(exp) {
    const row = { ...exp, month_key: currentMonthKey() }
    const { data, error } = await supabase.from('expenses').insert(row).select().single()
    if (error) { console.error(error); return }
    setExpenses(prev => [data, ...prev].sort((a, b) => b.date.localeCompare(a.date)))
  }

  async function handleDelete(id) {
    if (!confirm('Delete this expense?')) return
    const { error } = await supabase.from('expenses').delete().eq('id', id)
    if (error) { console.error(error); return }
    setExpenses(prev => prev.filter(e => e.id !== id))
  }

  // ── Export ────────────────────────────────────────────────────────────────

  function exportCSV() {
    const rows = [['Date', 'Description', 'Category', 'EUR', 'COP']]
    expenses.forEach(e => {
      const env = ENVELOPES.find(v => v.id === e.cat) || { name: e.cat }
      rows.push([e.date, e.desc, env.name, e.eur.toFixed(2), Math.round(e.eur * rate)])
    })
    downloadCSV(rows, 'budget-' + currentMonthKey() + '.csv')
  }

  function exportArchiveCSV() {
    const rows = [['Month', 'Date', 'Description', 'Category', 'EUR']]
    Object.keys(archive).sort().forEach(k => {
      archive[k].forEach(e => {
        const env = ENVELOPES.find(v => v.id === e.cat) || { name: e.cat }
        rows.push([monthLabel(k), e.date, e.desc, env.name, e.eur.toFixed(2)])
      })
    })
    downloadCSV(rows, 'budget-history.csv')
  }

  // ── Dark mode ─────────────────────────────────────────────────────────────

  useEffect(() => {
    document.body.classList.toggle('dark', darkMode)
    localStorage.setItem('bt_dark', darkMode ? '1' : '0')
  }, [darkMode])

  // ── Metrics ───────────────────────────────────────────────────────────────

  const spentByEnv = {}
  ENVELOPES.forEach(e => { spentByEnv[e.id] = 0 })
  expenses.forEach(e => { if (spentByEnv[e.cat] !== undefined) spentByEnv[e.cat] += e.eur })
  const totalSpent = Object.values(spentByEnv).reduce((a, b) => a + b, 0)
  const fixedRem = 430 - (spentByEnv.food || 0) - (spentByEnv.transport || 0) - (spentByEnv.cleaning || 0) - (spentByEnv.phone || 0)

  // ── Render ────────────────────────────────────────────────────────────────

  if (authLoading) {
    return (
      <div id="login-screen">
        <div className="login-box">
          <h1>💸 Budget Tracker</h1>
          <p style={{ color: 'var(--text3)' }}>Loading…</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return (
      <div>
        {accessDenied && (
          <div id="login-screen">
            <div className="login-box">
              <h1>💸 Budget Tracker</h1>
              <p style={{ color: 'var(--red)', fontWeight: 500 }}>Access denied.</p>
              <p style={{ fontSize: 13, color: 'var(--text3)', marginTop: 6 }}>
                This app is private. Please sign in with the authorized account.
              </p>
              <button className="btn-google" style={{ marginTop: 16 }} onClick={() => setAccessDenied(false)}>
                Try again
              </button>
            </div>
          </div>
        )}
        {!accessDenied && <LoginScreen />}
      </div>
    )
  }

  const TABS = ['envelopes', 'log', 'history', 'charts', 'recurring', 'archive']
  const TAB_LABELS = ['Envelopes', 'Add', 'History', 'Charts', 'Recurring', 'Archive']

  return (
    <div id="app">
      <div className="top-bar">
        <div>
          <h1>Budget tracker</h1>
          <div className="month-label">{monthLabel(currentMonthKey())}</div>
        </div>
        <div className="top-bar-right">
          <div className="rate-pill">
            1 EUR = <span>{rate.toLocaleString('en', { maximumFractionDigits: 0 })}</span> COP
          </div>
          <div
            className="rate-status"
            style={{ color: rateStatus === '● live' ? 'var(--green)' : 'var(--text4)' }}
          >
            {rateStatus}
          </div>
          <div className="top-btns">
            <button className="icon-btn" onClick={() => setDarkMode(d => !d)}>🌙</button>
            <button className="icon-btn" onClick={exportCSV}>⬇ CSV</button>
            <button className="icon-btn" onClick={() => supabase.auth.signOut()}>🔒</button>
          </div>
          {backupStatus && (
            <div className="backup-status">{backupStatus}</div>
          )}
        </div>
      </div>

      {newMonthNotice && (
        <div className="notice">
          <span>🎉 New month! Previous expenses archived and recurring expenses added. Fresh start!</span>
          <button className="notice-close" onClick={() => setNewMonthNotice(false)}>✕</button>
        </div>
      )}

      <div className="metrics">
        <div className="metric">
          <div className="metric-label">Monthly budget</div>
          <div className="metric-value">€6,110</div>
          <div className="metric-sub">Total</div>
        </div>
        <div className="metric">
          <div className="metric-label">Spent</div>
          <div className="metric-value">€{totalSpent.toFixed(2)}</div>
          <div className="metric-sub">{Math.round(totalSpent * rate).toLocaleString()} COP</div>
        </div>
        <div className="metric">
          <div className="metric-label">Fixed left</div>
          <div
            className="metric-value"
            style={{ color: fixedRem < 0 ? 'var(--red)' : 'var(--green)' }}
          >
            €{fixedRem.toFixed(2)}
          </div>
          <div className="metric-sub">of €430</div>
        </div>
        <div className="metric">
          <div className="metric-label">Data stored</div>
          <div className="metric-value">{expenses.length + archiveCount}</div>
          <div className="metric-sub">{expenses.length} this month · {archiveCount} archived</div>
        </div>
      </div>

      <button className="backup-btn" onClick={handleManualBackup}>
        🛡 Backup all data
      </button>

      <div className="tabs">
        {TABS.map((t, i) => (
          <div
            key={t}
            className={'tab' + (activeTab === t ? ' active' : '')}
            onClick={() => setActiveTab(t)}
          >
            {TAB_LABELS[i]}
          </div>
        ))}
      </div>

      <div id="sec-envelopes" className={'section' + (activeTab === 'envelopes' ? ' visible' : '')}>
        <EnvelopesTab expenses={expenses} />
      </div>
      <div id="sec-log" className={'section' + (activeTab === 'log' ? ' visible' : '')}>
        <AddTab rate={rate} onAdd={handleAdd} onSwitchTab={setActiveTab} />
      </div>
      <div id="sec-history" className={'section' + (activeTab === 'history' ? ' visible' : '')}>
        <HistoryTab expenses={expenses} archive={archive} rate={rate} onDelete={handleDelete} />
      </div>
      <div id="sec-charts" className={'section' + (activeTab === 'charts' ? ' visible' : '')}>
        <ChartsTab expenses={expenses} rate={rate} darkMode={darkMode} />
      </div>
      <div id="sec-recurring" className={'section' + (activeTab === 'recurring' ? ' visible' : '')}>
        <RecurringTab />
      </div>
      <div id="sec-archive" className={'section' + (activeTab === 'archive' ? ' visible' : '')}>
        <ArchiveTab archive={archive} onExportAll={exportArchiveCSV} />
      </div>
    </div>
  )
}
