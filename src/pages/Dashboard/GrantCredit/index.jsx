// ============================================
// BIT SOFTWARE — Admin Grant Credit
// ============================================
// Professional wallet admin tools:
//   1. Browse / search customers (name, email, Customer ID, Mongo ID)
//   2. Multi-select via checkboxes (+ Select All on page / Grant to Everyone)
//   3. Grant promotional (gift) credit — non-withdrawable
//   4. Manual balance correction (add/remove from Account or Gift credit)
//   5. Inspect a selected customer's wallet history

import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'motion/react';
import {
  Gift, Search, Loader2, AlertCircle, Users as UsersIcon,
  Sliders, Receipt, Check, RefreshCw, ChevronLeft, ChevronRight,
  Wallet, Info,
} from 'lucide-react';
import { SEOHead } from '@/components/common/SEOHead';
import { getAllUsers } from '@/api/adminUsersApi';
import { grantCredit, adjustBalance, getUserWalletTransactions } from '@/api/walletApi';
import { toast } from '@/components/common/Toast/Toast';

const TXN_LABELS = {
  topup: 'Top-up',
  purchase: 'Purchase',
  refund: 'Refund',
  bonus_credit: 'Bonus Credit',
  withdrawal: 'Withdrawal',
  withdrawal_reversal: 'Withdrawal Reversal',
  adjustment: 'Manual Adjustment',
};

const money = (n) => `$${Number(n || 0).toFixed(2)}`;

export default function AdminGrantCredit() {
  // ─── User list ───
  const [users, setUsers] = useState([]);
  const [meta, setMeta] = useState({ page: 1, total: 0, totalPage: 1, limit: 20 });
  /** Unfiltered customer count — used only for "grant to everyone" (site-wide). */
  const [siteWideTotal, setSiteWideTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const limit = 20;

  // Selected user IDs (Set for O(1) toggle)
  const [selectedIds, setSelectedIds] = useState(() => new Set());
  const [focusUserId, setFocusUserId] = useState(null); // for history / adjust

  // Grant
  const [grantAmount, setGrantAmount] = useState('');
  const [grantNote, setGrantNote] = useState('');
  const [grantEveryone, setGrantEveryone] = useState(false);
  const [granting, setGranting] = useState(false);

  // Adjust
  const [adjustTarget, setAdjustTarget] = useState('account'); // 'account' | 'promo'
  const [adjustAction, setAdjustAction] = useState('add'); // 'add' | 'remove'
  const [adjustAmount, setAdjustAmount] = useState('');
  const [adjustNote, setAdjustNote] = useState('');
  const [adjusting, setAdjusting] = useState(false);

  // Transactions
  const [txns, setTxns] = useState([]);
  const [loadingTxns, setLoadingTxns] = useState(false);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const params = { role: 'user', page, limit };
      if (search.trim()) params.search = search.trim();
      const res = await getAllUsers(params);
      if (res.success) {
        setUsers(res.data || []);
        if (res.meta) setMeta(res.meta);
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load users.');
    } finally {
      setIsLoading(false);
    }
  }, [page, search]);

  const fetchSiteWideTotal = useCallback(async () => {
    try {
      const res = await getAllUsers({ role: 'user', page: 1, limit: 1 });
      if (res.success && res.meta?.total != null) setSiteWideTotal(res.meta.total);
    } catch {
      /* non-blocking */
    }
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);
  useEffect(() => { fetchSiteWideTotal(); }, [fetchSiteWideTotal]);

  // Debounced search apply on Enter / button
  const applySearch = (e) => {
    e?.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  };

  const pageIds = useMemo(() => users.map((u) => u._id), [users]);
  const allPageSelected = pageIds.length > 0 && pageIds.every((id) => selectedIds.has(id));
  const somePageSelected = pageIds.some((id) => selectedIds.has(id));

  const toggleUser = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    setFocusUserId(id);
  };

  const toggleSelectAllPage = () => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (allPageSelected) {
        pageIds.forEach((id) => next.delete(id));
      } else {
        pageIds.forEach((id) => next.add(id));
      }
      return next;
    });
  };

  const clearSelection = () => {
    setSelectedIds(new Set());
    setGrantEveryone(false);
  };

  const focusUser = useMemo(
    () => users.find((u) => u._id === focusUserId) || null,
    [users, focusUserId],
  );

  const loadTxns = useCallback(async (userId) => {
    if (!userId) {
      setTxns([]);
      return;
    }
    setLoadingTxns(true);
    try {
      const res = await getUserWalletTransactions(userId, { limit: 25 });
      if (res.success) setTxns(res.data || []);
      else setTxns([]);
    } catch {
      setTxns([]);
    } finally {
      setLoadingTxns(false);
    }
  }, []);

  useEffect(() => {
    if (focusUserId) loadTxns(focusUserId);
  }, [focusUserId, loadTxns]);

  // ─── Grant Credit ───
  const handleGrant = async (e) => {
    e.preventDefault();
    const amount = Number(grantAmount);
    if (Number.isNaN(amount) || amount <= 0) {
      toast.error('Enter a credit amount greater than zero.');
      return;
    }

    if (!grantEveryone && selectedIds.size === 0) {
      toast.warning('Select at least one customer, or enable "Grant to everyone".');
      return;
    }

    if (grantEveryone) {
      const confirmed = window.confirm(
        `Grant ${money(amount)} promotional credit to ALL ${siteWideTotal || ''} customers site-wide?\n\n` +
          (search.trim()
            ? 'Note: your search filter is ignored — every customer receives credit, not only the filtered list.'
            : 'This cannot be undone from this screen.'),
      );
      if (!confirmed) return;
    }

    setGranting(true);
    try {
      const payload = grantEveryone
        ? { target: 'all', amountUSD: amount, note: grantNote.trim() || undefined }
        : {
            userIds: Array.from(selectedIds),
            amountUSD: amount,
            note: grantNote.trim() || undefined,
          };

      const res = await grantCredit(payload);
      if (res.success) {
        toast.success(
          res.message ||
            `Promotional credit of ${money(amount)} granted to ${res.data?.granted ?? 0} customer(s).`,
        );
        setGrantAmount('');
        setGrantNote('');
        setGrantEveryone(false);
        await Promise.all([fetchUsers(), fetchSiteWideTotal()]);
        if (focusUserId) loadTxns(focusUserId);
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Grant failed.');
    } finally {
      setGranting(false);
    }
  };

  // ─── Adjust Balance (clearer UX) ───
  const handleAdjust = async (e) => {
    e.preventDefault();
    if (!focusUserId) {
      toast.warning('Click a customer row first to adjust their balance.');
      return;
    }
    const amount = Number(adjustAmount);
    if (Number.isNaN(amount) || amount <= 0) {
      toast.error('Enter an amount greater than zero.');
      return;
    }

    const signed = adjustAction === 'add' ? amount : -amount;
    const payload = {
      userId: focusUserId,
      note: adjustNote.trim() || undefined,
      accountDelta: adjustTarget === 'account' ? signed : 0,
      promoDelta: adjustTarget === 'promo' ? signed : 0,
    };

    setAdjusting(true);
    try {
      const res = await adjustBalance(payload);
      if (res.success) {
        const label = adjustTarget === 'account' ? 'Account Balance' : 'Promotional Credit';
        toast.success(
          `${adjustAction === 'add' ? 'Added' : 'Removed'} ${money(amount)} ${adjustAction === 'add' ? 'to' : 'from'} ${label}.`,
        );
        setAdjustAmount('');
        setAdjustNote('');
        await fetchUsers();
        loadTxns(focusUserId);
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Adjustment failed.');
    } finally {
      setAdjusting(false);
    }
  };

  const recipientCount = grantEveryone ? (siteWideTotal || 'all') : selectedIds.size;

  return (
    <>
      <SEOHead title="Grant Credit" />
      <div>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 className="h3" style={{ marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Gift size={22} style={{ color: 'var(--color-primary)' }} /> Grant Credit
            </h1>
            <p className="body-sm" style={{ color: 'var(--color-text-muted)' }}>
              Give promotional (gift) credit for offers, or manually correct a customer&apos;s balances.
            </p>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={fetchUsers} disabled={isLoading}>
            <RefreshCw size={14} className={isLoading ? 'spin' : ''} /> Refresh
          </button>
        </div>

        {/* Info banner */}
        <div className="gc-info">
          <Info size={16} style={{ flexShrink: 0, color: 'var(--color-primary)' }} />
          <div>
            <strong>Promotional Credit</strong> is gift money — customers can spend it on services but cannot withdraw it.
            {' '}<strong>Account Balance</strong> is topped-up money — withdrawable.
            When buying, promotional credit is used first.
          </div>
        </div>

        <div className="gc-layout">
          {/* ════ LEFT: User list ════ */}
          <div className="card-elevated" style={{ padding: 0, overflow: 'hidden' }}>
            <div className="gc-panel-head">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <UsersIcon size={16} style={{ color: 'var(--color-primary)' }} />
                <h3 className="h6" style={{ margin: 0 }}>Customers</h3>
                <span className="gc-count">{meta.total} total</span>
              </div>
              {selectedIds.size > 0 && (
                <button type="button" className="btn btn-ghost btn-sm" onClick={clearSelection}>
                  Clear ({selectedIds.size})
                </button>
              )}
            </div>

            {/* Search */}
            <form onSubmit={applySearch} className="gc-search">
              <div style={{ position: 'relative', flex: 1 }}>
                <Search size={14} className="gc-search-icon" />
                <input
                  className="input"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Search by name, email, Customer ID, or user ID…"
                  style={{ paddingLeft: '2.1rem', fontSize: 'var(--text-sm)' }}
                />
              </div>
              <button className="btn btn-secondary btn-sm" type="submit" disabled={isLoading}>
                {isLoading ? <Loader2 size={14} className="spin" /> : 'Search'}
              </button>
            </form>

            {/* Select-all row */}
            <div className="gc-select-bar">
              <label className="gc-check-label">
                <input
                  type="checkbox"
                  checked={allPageSelected}
                  ref={(el) => {
                    if (el) el.indeterminate = somePageSelected && !allPageSelected;
                  }}
                  onChange={toggleSelectAllPage}
                  disabled={users.length === 0}
                />
                <span>Select all on this page</span>
              </label>
              <label className="gc-check-label" style={{ color: grantEveryone ? '#b45309' : undefined }}>
                <input
                  type="checkbox"
                  checked={grantEveryone}
                  onChange={(e) => {
                    setGrantEveryone(e.target.checked);
                    if (e.target.checked) setSelectedIds(new Set());
                  }}
                />
                <span>Grant to ALL customers site-wide ({siteWideTotal})</span>
              </label>
              {grantEveryone && search.trim() && (
                <div style={{ fontSize: 'var(--text-xs)', color: '#b45309', marginTop: '0.35rem' }}>
                  Search is active — site-wide grant still credits every customer, not only these results.
                </div>
              )}
            </div>

            {error && (
              <div className="gc-error">
                <AlertCircle size={15} /> {error}
              </div>
            )}

            {isLoading ? (
              <div className="gc-empty"><Loader2 size={26} className="spin" /></div>
            ) : users.length === 0 ? (
              <div className="gc-empty">No customers found.</div>
            ) : (
              <div className="gc-user-list">
                {users.map((u) => {
                  const checked = selectedIds.has(u._id);
                  const focused = focusUserId === u._id;
                  return (
                    <motion.div
                      key={u._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className={`gc-user-row ${checked ? 'is-checked' : ''} ${focused ? 'is-focused' : ''}`}
                      onClick={() => setFocusUserId(u._id)}
                    >
                      <label className="gc-check-label" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={checked}
                          disabled={grantEveryone}
                          onChange={() => toggleUser(u._id)}
                        />
                      </label>
                      <div className="gc-user-info">
                        <div className="gc-user-name">{u.name || '—'}</div>
                        <div className="gc-user-meta">
                          {u.email}
                          {u.userCode && <> · ID {u.userCode}</>}
                        </div>
                        <div className="gc-user-balances">
                          <span><Wallet size={11} /> {money(u.accountBalance)}</span>
                          <span><Gift size={11} /> {money(u.promotionalCredit)}</span>
                        </div>
                      </div>
                      {focused && (
                        <span className="gc-focus-pill">Active</span>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            )}

            {meta.totalPage > 1 && (
              <div className="gc-pagination">
                <span>Page {meta.page} of {meta.totalPage}</span>
                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  <button
                    className="btn btn-ghost btn-sm"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    <ChevronLeft size={15} /> Prev
                  </button>
                  <button
                    className="btn btn-ghost btn-sm"
                    disabled={page >= meta.totalPage}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    Next <ChevronRight size={15} />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ════ RIGHT: Actions ════ */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Grant Credit */}
            <div className="card-elevated">
              <div className="gc-card-title">
                <Gift size={17} style={{ color: 'var(--color-primary)' }} />
                Grant Promotional Credit
              </div>
              <p className="gc-card-sub">
                Gift credit for offers. Customers can spend it, but cannot withdraw it.
              </p>

              <form onSubmit={handleGrant} className="gc-form">
                <div className="gc-recipients">
                  Recipients:{' '}
                  <strong>
                    {grantEveryone
                      ? `ALL customers site-wide (${siteWideTotal})`
                      : selectedIds.size === 0
                        ? 'None selected'
                        : `${selectedIds.size} selected`}
                  </strong>
                </div>

                <div>
                  <label className="gc-label">Amount (USD)</label>
                  <input
                    type="number"
                    className="input"
                    min="0.01"
                    step="0.01"
                    value={grantAmount}
                    onChange={(e) => setGrantAmount(e.target.value)}
                    placeholder="e.g. 5.00"
                    required
                  />
                </div>

                <div>
                  <label className="gc-label">Note (optional)</label>
                  <input
                    className="input"
                    value={grantNote}
                    onChange={(e) => setGrantNote(e.target.value)}
                    placeholder="e.g. Eid offer bonus"
                    maxLength={1000}
                  />
                </div>

                {grantEveryone && (
                  <div className="gc-warn">
                    <AlertCircle size={14} style={{ flexShrink: 0 }} />
                    This will add credit to every customer account. Use carefully.
                  </div>
                )}

                <button
                  className="btn btn-primary"
                  type="submit"
                  disabled={granting || (!grantEveryone && selectedIds.size === 0)}
                  style={{ alignSelf: 'flex-start' }}
                >
                  {granting ? (
                    <><Loader2 size={15} className="spin" /> Granting…</>
                  ) : (
                    <><Gift size={15} /> Grant {grantAmount ? money(grantAmount) : 'Credit'} → {recipientCount}</>
                  )}
                </button>
              </form>
            </div>

            {/* Adjust Balance — clearer language */}
            <div className="card-elevated">
              <div className="gc-card-title">
                <Sliders size={17} style={{ color: 'var(--color-primary)' }} />
                Correct Balance
              </div>
              <p className="gc-card-sub">
                Manual fix for one customer — add or remove money from Account Balance or Promotional Credit.
                Use this for refunds, corrections, or mistakes. Not for offers (use Grant Credit above).
              </p>

              {!focusUserId ? (
                <div className="gc-empty" style={{ padding: '1.5rem' }}>
                  Click a customer in the list to correct their balance.
                </div>
              ) : (
                <form onSubmit={handleAdjust} className="gc-form">
                  <div className="gc-focus-card">
                    <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Correcting</div>
                    <div style={{ fontWeight: 700 }}>{focusUser?.name || focusUser?.email || 'Customer'}</div>
                    <div className="gc-user-balances" style={{ marginTop: '0.35rem' }}>
                      <span><Wallet size={11} /> Account {money(focusUser?.accountBalance)}</span>
                      <span><Gift size={11} /> Promo {money(focusUser?.promotionalCredit)}</span>
                    </div>
                  </div>

                  <div>
                    <label className="gc-label">Which balance?</label>
                    <div className="gc-seg">
                      <button
                        type="button"
                        className={adjustTarget === 'account' ? 'active' : ''}
                        onClick={() => setAdjustTarget('account')}
                      >
                        Account Balance
                      </button>
                      <button
                        type="button"
                        className={adjustTarget === 'promo' ? 'active' : ''}
                        onClick={() => setAdjustTarget('promo')}
                      >
                        Promotional Credit
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="gc-label">Action</label>
                    <div className="gc-seg">
                      <button
                        type="button"
                        className={adjustAction === 'add' ? 'active' : ''}
                        onClick={() => setAdjustAction('add')}
                      >
                        Add money
                      </button>
                      <button
                        type="button"
                        className={adjustAction === 'remove' ? 'active remove' : ''}
                        onClick={() => setAdjustAction('remove')}
                      >
                        Remove money
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="gc-label">Amount (USD)</label>
                    <input
                      type="number"
                      className="input"
                      min="0.01"
                      step="0.01"
                      value={adjustAmount}
                      onChange={(e) => setAdjustAmount(e.target.value)}
                      placeholder="e.g. 10.00"
                      required
                    />
                  </div>

                  <div>
                    <label className="gc-label">Reason (optional)</label>
                    <input
                      className="input"
                      value={adjustNote}
                      onChange={(e) => setAdjustNote(e.target.value)}
                      placeholder="e.g. Refund for failed domain order"
                      maxLength={1000}
                    />
                  </div>

                  <button className="btn btn-primary" type="submit" disabled={adjusting} style={{ alignSelf: 'flex-start' }}>
                    {adjusting ? (
                      <><Loader2 size={15} className="spin" /> Applying…</>
                    ) : (
                      <><Check size={15} /> {adjustAction === 'add' ? 'Add' : 'Remove'} {adjustAmount ? money(adjustAmount) : ''}</>
                    )}
                  </button>
                </form>
              )}
            </div>

            {/* Wallet History */}
            <div className="card-elevated">
              <div className="gc-card-title">
                <Receipt size={17} style={{ color: 'var(--color-primary)' }} />
                Wallet History
              </div>
              <p className="gc-card-sub">
                {focusUser
                  ? `Recent transactions for ${focusUser.name || focusUser.email}`
                  : 'Select a customer to view their ledger.'}
              </p>

              {!focusUserId ? (
                <div className="gc-empty" style={{ padding: '1.5rem' }}>No customer selected.</div>
              ) : loadingTxns ? (
                <div className="gc-empty" style={{ padding: '1.5rem' }}><Loader2 size={22} className="spin" /></div>
              ) : txns.length === 0 ? (
                <div className="gc-empty" style={{ padding: '1.5rem' }}>No transactions yet.</div>
              ) : (
                <div className="gc-txn-list">
                  {txns.map((t) => {
                    const net = Number(t.accountAmount || 0) + Number(t.promoAmount || 0);
                    const positive = net >= 0;
                    return (
                      <div key={t._id} className="gc-txn-row">
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>
                            {TXN_LABELS[t.type] || t.type}
                          </div>
                          <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', wordBreak: 'break-word' }}>
                            {t.note || '—'}
                            {t.createdAt ? ` · ${new Date(t.createdAt).toLocaleDateString()}` : ''}
                          </div>
                        </div>
                        <div style={{ fontWeight: 700, fontFamily: 'var(--font-display)', color: positive ? '#16a34a' : '#dc2626', whiteSpace: 'nowrap' }}>
                          {positive ? '+' : '-'}{money(Math.abs(net))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }

        .gc-info {
          display: flex; gap: 0.65rem; align-items: flex-start;
          padding: 0.85rem 1rem; border-radius: 10px; margin-bottom: 1.25rem;
          background: var(--color-primary-muted); font-size: var(--text-xs);
          color: var(--color-text-secondary); line-height: 1.55;
        }

        .gc-layout {
          display: grid; grid-template-columns: minmax(0, 1.15fr) minmax(0, 1fr);
          gap: 1.25rem; align-items: start;
        }
        @media (max-width: 960px) {
          .gc-layout { grid-template-columns: 1fr; }
        }

        .gc-panel-head {
          display: flex; align-items: center; justify-content: space-between;
          gap: 0.75rem; padding: 1rem 1.15rem; border-bottom: 1px solid var(--color-border);
        }
        .gc-count {
          font-size: 11px; font-weight: 700; padding: 0.15rem 0.5rem; border-radius: 999px;
          background: var(--color-bg-tertiary); color: var(--color-text-muted);
        }

        .gc-search {
          display: flex; gap: 0.5rem; padding: 0.85rem 1.15rem;
          border-bottom: 1px solid var(--color-border);
        }
        .gc-search-icon {
          position: absolute; left: 10px; top: 50%; transform: translateY(-50%);
          color: var(--color-text-muted); pointer-events: none;
        }

        .gc-select-bar {
          display: flex; flex-wrap: wrap; gap: 1rem; align-items: center;
          padding: 0.65rem 1.15rem; border-bottom: 1px solid var(--color-border);
          background: var(--color-bg-tertiary); font-size: var(--text-xs);
        }
        .gc-check-label {
          display: inline-flex; align-items: center; gap: 0.45rem;
          cursor: pointer; user-select: none; font-weight: 600;
        }
        .gc-check-label input { width: 16px; height: 16px; accent-color: var(--color-primary); cursor: pointer; }

        .gc-user-list { max-height: 520px; overflow-y: auto; }
        .gc-user-row {
          display: flex; align-items: center; gap: 0.75rem;
          padding: 0.75rem 1.15rem; border-bottom: 1px solid var(--color-border);
          cursor: pointer; transition: background .15s ease;
        }
        .gc-user-row:hover { background: var(--color-bg-tertiary); }
        .gc-user-row.is-checked { background: rgba(var(--color-primary-rgb, 14, 165, 233), 0.06); }
        .gc-user-row.is-focused { box-shadow: inset 3px 0 0 var(--color-primary); }

        .gc-user-info { flex: 1; min-width: 0; }
        .gc-user-name { font-weight: 700; font-size: var(--text-sm); }
        .gc-user-meta { font-size: 11px; color: var(--color-text-muted); word-break: break-word; }
        .gc-user-balances {
          display: flex; flex-wrap: wrap; gap: 0.65rem; margin-top: 0.25rem;
          font-size: 11px; font-weight: 600; color: var(--color-text-secondary);
        }
        .gc-user-balances span { display: inline-flex; align-items: center; gap: 0.25rem; }

        .gc-focus-pill {
          font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.04em;
          padding: 0.2rem 0.5rem; border-radius: 999px;
          background: var(--color-primary-muted); color: var(--color-primary); flex-shrink: 0;
        }

        .gc-pagination {
          display: flex; align-items: center; justify-content: space-between;
          padding: 0.85rem 1.15rem; border-top: 1px solid var(--color-border);
          font-size: var(--text-sm); color: var(--color-text-muted);
        }

        .gc-empty {
          padding: 3rem 1rem; text-align: center; color: var(--color-text-muted);
          font-size: var(--text-sm);
        }
        .gc-error {
          display: flex; gap: 0.5rem; align-items: center; margin: 0.75rem 1.15rem;
          padding: 0.75rem; border-radius: 8px; font-size: var(--text-xs);
          background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.2); color: #dc2626;
        }

        .gc-card-title {
          display: flex; align-items: center; gap: 0.45rem;
          font-family: var(--font-display); font-weight: 700; font-size: var(--text-base);
          margin-bottom: 0.25rem;
        }
        .gc-card-sub {
          font-size: var(--text-xs); color: var(--color-text-muted);
          margin: 0 0 1rem; line-height: 1.5;
        }
        .gc-form { display: flex; flex-direction: column; gap: 0.85rem; }
        .gc-label {
          display: block; font-weight: 600; font-size: var(--text-sm); margin-bottom: 0.3rem;
        }
        .gc-recipients {
          font-size: var(--text-sm); padding: 0.55rem 0.75rem; border-radius: 8px;
          background: var(--color-bg-tertiary); border: 1px solid var(--color-border);
        }
        .gc-warn {
          display: flex; gap: 0.5rem; align-items: flex-start;
          padding: 0.6rem 0.75rem; border-radius: 8px; font-size: var(--text-xs); color: #b45309;
          background: rgba(245,158,11,0.08); border: 1px solid rgba(245,158,11,0.2);
        }
        .gc-focus-card {
          padding: 0.75rem 0.9rem; border-radius: 10px;
          background: var(--color-primary-muted); border: 1px solid var(--color-border);
        }

        .gc-seg {
          display: flex; gap: 0.4rem; flex-wrap: wrap;
        }
        .gc-seg button {
          flex: 1; min-width: 120px; padding: 0.55rem 0.75rem; border-radius: 8px;
          border: 1px solid var(--color-border); background: var(--color-surface);
          font-size: var(--text-sm); font-weight: 600; cursor: pointer;
          color: var(--color-text-secondary); transition: all .15s ease;
        }
        .gc-seg button.active {
          border-color: var(--color-primary); background: var(--color-primary-muted);
          color: var(--color-primary);
        }
        .gc-seg button.active.remove {
          border-color: #ef4444; background: rgba(239,68,68,0.08); color: #dc2626;
        }

        .gc-txn-list {
          display: flex; flex-direction: column; gap: 0.5rem;
          max-height: 320px; overflow-y: auto;
        }
        .gc-txn-row {
          display: flex; align-items: center; justify-content: space-between; gap: 0.75rem;
          padding: 0.6rem 0.75rem; border-radius: 10px; border: 1px solid var(--color-border);
        }

        @media (max-width: 640px) {
          .gc-search { flex-direction: column; }
          .gc-search .btn { width: 100%; justify-content: center; }
          .gc-select-bar { flex-direction: column; align-items: flex-start; gap: 0.65rem; }
          .gc-panel-head { flex-wrap: wrap; }
          .gc-pagination {
            flex-direction: column; align-items: stretch; gap: 0.65rem;
          }
          .gc-pagination > div { justify-content: space-between; }
          .gc-form .btn { width: 100%; justify-content: center; align-self: stretch !important; }
          .gc-seg button { min-width: 0; }
          .gc-user-list { max-height: 420px; }
          .gc-focus-pill { display: none; }
        }
      `}</style>
    </>
  );
}
