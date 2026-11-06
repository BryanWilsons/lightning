
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useOutlet } from 'react-router-dom';
import {Scroll } from '../../../../util/StyledComponents'
import axios from 'axios';
import { toast } from 'react-toastify';
import { confirm } from '../../../../Helpers/Confirm';
import { useAuth } from '../../../../context/AuthContext';
import '../mailowners/MailOwners.css';
import api from '../../../../Helpers/Api';
import {formatPhoneNumber} from '../../../../Helpers/FormatPhoneNumber '

const ProvidersDashboard = () => {
  const navigate = useNavigate();
  const outlet = useOutlet();
  const formOpen = Boolean(outlet);
  const { user } = useAuth();

  const [crids, setCrids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const fetchCrids = useCallback(async () => {
  if (!user?.company?._id) {
    setCrids([]);
    setLoading(false);
    return;
  }

  setLoading(true);

  try {
    const res = await api.post('/permits/getmailproviders', {
      id: user.company._id,
    });

    // Support either a direct array or a wrapped response.
    const providers = Array.isArray(res.data)
      ? res.data
      : res.data?.providers ?? res.data?.data ?? [];

    setCrids(providers);
  } catch (err) {
    toast.error(
      err.response?.data?.message ||
      err.response?.data?.error ||
      'Failed to load mail providers'
    );
  } finally {
    setLoading(false);
  }
}, [user?.company?._id]);
  useEffect(() => {
    if (!formOpen) {
      fetchCrids();
    }
  }, [fetchCrids, formOpen]);

 

const handleDelete = (c) => {

const toastId = toast(
  <div className="delete-owner-toast">
    <div className="delete-owner-toast-header">
      <div className="delete-owner-toast-icon">
        <svg
          viewBox="0 0 24 24"
          width="23"
          height="23"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M12 9v4" />
          <path d="M12 17h.01" />
          <path d="M10.3 3.9 2.6 17.2a2 2 0 0 0 1.7 2.8h15.4a2 2 0 0 0 1.7-2.8L13.7 3.9a2 2 0 0 0-3.4 0Z" />
        </svg>
      </div>

      <div>
        <h3>Delete Mail Provider</h3>
        <span className="delete-owner-subtitle">
          Confirm deletion before continuing
        </span>
      </div>
    </div>

    <div className="delete-owner-toast-content">
      <p>
        You are about to delete{' '}
       <strong>{c.providerName || c.name || 'this provider'}</strong> from your providers.
      </p>

      <div className="delete-owner-crid">
        <span>Mail Provider CRID</span>
        <strong>{c.crid || '—'}</strong>
      </div>

      <div className="delete-owner-warning">
        <span className="delete-owner-warning-dot" />
        <span>
          This action cannot be undone. Verify the mail provider
          before proceeding.
        </span>
      </div>
    </div>

    <div className="delete-owner-toast-actions">
      <button
        type="button"
        className="delete-owner-cancel"
        onClick={() => toast.dismiss(toastId)}
      >
        Cancel
      </button>

      <button
  type="button"
  className="delete-owner-confirm"
  onClick={() => {
    toast.dismiss(toastId);
    deleteMailOwner(c);
  }}
>
  Delete Mail Provider
</button>
    </div>
  </div>,
  {
    position: 'top-center',
    autoClose: false,
    closeOnClick: false,
    closeButton: true,
    draggable: false,
    className: 'delete-owner-toast-container',
    style: {
      width: '460px',
      maxWidth: 'calc(100vw - 32px)',
      padding: 0,
    },
  }
);

};


const deleteMailOwner = async (c) => {
  const payload = { id: c._id };

  try {
    await api.delete('permits/provider', {
      data: payload,
    });

    toast.success('Mail provider deleted');

    setCrids((prev) =>
      prev.filter((x) => x._id !== c._id)
    );
  } catch (err) {
    toast.error(
      err.response?.data?.message || 'Delete failed'
    );
  }
};


const filtered = useMemo(() => {
  const q = search.trim().toLowerCase();

  return crids.filter((c) => {
    if (statusFilter !== 'ALL' && c.status !== statusFilter) {
      return false;
    }

    if (!q) return true;

    return [
      c.providerName,
      c.name,
      c.address,
      c.address2,
      c.city,
      c.state,
      c.zip,
      c.crid,
      c.mid,
      c.repname,
      c.repphone,
      c.repemail,
      c.postOfficeEntryLocation,
      c.einduction ? 'eInduction' : '',
      c.seamless ? 'Seamless Acceptance' : '',
      c.postOfficeEntry ? 'Post Office Entry' : '',
    ]
      .filter(Boolean)
      .some((value) =>
        String(value).toLowerCase().includes(q)
      );
  });
}, [crids, search, statusFilter]);



const stats = useMemo(
  () => ({
    total: crids.length,
    active: crids.filter((c) => c.status === 'ACTIVE').length,
    pending: crids.filter((c) => c.status === 'PENDING').length,
    mids: crids.filter((c) => Boolean(c.mid)).length,
  }),
  [crids]
);

  if (formOpen) return outlet;

  return (
    <main className="mail-dashboard">


      {/* Main table panel */}
      <section className="mail-table-card">
<div className="mail-table-heading">
  <div className="mail-table-title">
    <h2>Registered Mail Providers</h2>
    <p>View and manage your mail provider records.</p>
  </div>

  <button
    type="button"
    className="mail-add-button"
    onClick={() => navigate('provider?tab=mail-providers')}
  >
    <span className="mail-add-icon">+</span>
    Add Mail Provider
  </button>
</div>

        {/* Search and filters */}
        <div className="mail-toolbar">
          <div className="mail-search">
            <svg
              viewBox="0 0 24 24"
              width="19"
              height="19"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="m16 16 4 4" />
            </svg>

            <input
              type="search"
              aria-label="Search mail providers"
              placeholder="Search company, CRID, contact, MID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

        
          </div>

    
        </div>

        {/* Table with independent scrolling */}
        <div className="mail-table-viewport">
          {loading ? (
            <div className="mail-state">
              <span className="mail-spinner" />
              <p>Loading mail providers...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="mail-state">
              <div className="mail-empty-icon">⌕</div>
              <h3>
                {crids.length === 0
                  ? 'No mail providers yet'
                  : 'No matching mail providers'}
              </h3>
              <p>
                {crids.length === 0
                  ? 'Add a mail provider to get started.'
                  : 'Try changing your search or status filter.'}
              </p>

              {/* {crids.length === 0 && (
                <button
                  type="button"
                  className="mail-add-button mail-empty-button"
                  onClick={() => navigate('/permits/provider?tab=mail-provider')}
                >
                  + Add Mail Provider
                </button>
              )} */}
            </div>
          ) : (
           <div className="mail-table-scroll" style={{height:'35vh'}}>
  <table className="mail-owners-table">
                <thead>
                  <tr>
                     <th>Company</th>
  <th> USPS Registered Name</th>
                    
                    <th>CRID</th>
                    <th>Location</th>
                    <th>Rep</th>
                  
                    <th className="mail-actions-heading"></th>
                  </tr>
                </thead>

             <tbody>
  {filtered.map((c) => (
    <tr
      key={c._id}
      className="list-hover"
      onClick={() =>
        navigate(`provider/${c._id}?tab=mail-providers`)
      }
    >
      <td>
        <div className="mail-company-name">
          {c.providerName || '—'}
        </div>
      </td>

      <td>
        <div className="mail-company-name">
          {c.name || '—'}
        </div>
      </td>

      <td className="mail-crid-cell">
        {c.crid || '—'}
      </td>

      <td>
        <div className="mail-location">
          {[c.city, c.state].filter(Boolean).join(', ') || '—'}
        </div>
        {c.zip && (
          <div className="mail-secondary-text">
            {c.zip}
          </div>
        )}
      </td>

    <td> 
  {c.mid ? (
    <span className="mailer-ids">
      {c.repname} - {formatPhoneNumber(c.repphone)}
      <br />
      <a
        href={`mailto:${c.repemail}`}
        onClick={(e) => e.stopPropagation()}
      >
        {c.repemail}
      </a>
    </span>
  ) : (
    <span className="mail-muted">—</span>
  )}
</td>

      <td>
        <div className="mail-row-actions">
          <button
            type="button"
            className="mail-delete-button"
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(c);
            }}
            title={`Delete ${c.providerName || 'mail provider'}`}
            aria-label={`Delete ${c.providerName || 'mail provider'}`}
          >
            ×
          </button>
        </div>
      </td>
    </tr>
  ))}
</tbody>
              </table>
            </div>
          )}
        </div>

        {!loading && filtered.length > 0 && (
          <footer className="mail-table-footer">
            Showing {filtered.length} of {crids.length} mail providers
          </footer>
        )}
      </section>
    </main>
  );
};

export default ProvidersDashboard;
