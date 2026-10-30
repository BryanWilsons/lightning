
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useOutlet } from 'react-router-dom';
import {Scroll } from '../../../../util/StyledComponents'
import axios from 'axios';
import { toast } from 'react-toastify';
import { confirm } from '../../../../Helpers/Confirm';
import { useAuth } from '../../../../context/AuthContext';
import './../mailowners/MailOwners.css';
import api from '../../../../Helpers/Api';


const PermitOwnersDashboard = () => {
  const navigate = useNavigate();
  const outlet = useOutlet();
  const formOpen = Boolean(outlet);
  const { user } = useAuth();

  const [crids, setCrids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const fetchCrids = useCallback(async () => {
    setLoading(true);

    try {
        const payload = {'id':user.company?._id}
      const res = await api.post(`/permits/getpermitholders`,payload);
      console.log(res.data )
      setCrids(res.data);
    } catch (err) {
      toast.error(
        err.response?.data?.message || 'Failed to load mail owners'
      );
    } finally {
      setLoading(false);
    }
  }, []);

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
        <h3>Delete Permit Owner</h3>
        <span className="delete-owner-subtitle">
          Confirm deletion before continuing
        </span>
      </div>
    </div>

    <div className="delete-owner-toast-content">
      <p>
        You are about to delete{' '}
        <strong>{c.companyName}</strong> from your permit owners.
      </p>

      <div className="delete-owner-crid">
        <span>Permit #</span>
        <strong>{c.permitNumber}</strong>
      </div>

      <div className="delete-owner-warning">
        <span className="delete-owner-warning-dot" />
        <span>
          This action cannot be undone. Verify the permit owner
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
        Delete Permit Owner
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
    await api.delete('permits/removepermit', {
      data: payload,
    });

    toast.success('Permit owner deleted');

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
        c.removepermit,
        c.companyName,
        c.permitNumber,
        c.contactName,
        c.email,
        c.city,
        c.state,
        ...(c.mailerIds || []),
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(q));
    });
  }, [crids, search, statusFilter]);





  if (formOpen) return outlet;

  return (
    <main className="mail-dashboard">


      {/* Main table panel */}
      <section className="mail-table-card">
<div className="mail-table-heading">
  <div className="mail-table-title">
    <h2>Registered Permit Owners</h2>
    <p>View and manage your permit owner records.</p>
  </div>

  <button
    type="button"
    className="mail-add-button"
    onClick={() => navigate('permit?tab=permit-owner')}
  >
    <span className="mail-add-icon">+</span>
    Add Permit Owner
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
              aria-label="Search permit owners"
              placeholder="Search company, Permit #, Location..."
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
              <p>Loading permit owners...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="mail-state">
              <div className="mail-empty-icon">⌕</div>
              <h3>
                {crids.length === 0
                  ? 'No permit owners yet'
                  : 'No matching permit owners'}
              </h3>
              <p>
                {crids.length === 0
                  ? 'Add a permit owner to get started.'
                  : 'Try changing your search or status filter.'}
              </p>

              {crids.length === 0 && (
                <button
                  type="button"
                  className="mail-add-button mail-empty-button"
                  onClick={() => navigate('permit?tab=permit-owner')}
                >
                  + Add Permit Owner
                </button>
              )}
            </div>
          ) : (
           <div className="mail-table-scroll" style={{height:'35vh'}}>
  <table className="mail-owners-table">
                <thead>
                  <tr>
                     <th>Permit Name</th>
  <th> Legal Company Name</th>
                    
                    <th>Permit #</th>
                    <th>Location</th>
                 
                  
                    <th className="mail-actions-heading"></th>
                  </tr>
                </thead>

                <tbody>
                  {filtered.map((c) => (
                    <tr key={c._id} className="list-hover"  onClick={() =>
                              navigate(`permit/${c._id}?tab=permit-owners`)
                            }>
                      <td >
                          <div className="mail-company-name">
                          {c.permitName || '—'}
                        </div>
                        
                      </td>
   <td >
                          <div className="mail-company-name">
                          {c.companyName || '—'}
                        </div>
                        
                      </td>
                      <td className="mail-crid-cell">
                      {c.permitNumber || '—'}
                
                      </td>
                      <td>
                        <div className="mail-location">
                          {[c.city, c.state].filter(Boolean).join(', ') || '—'}
                        </div>
                        {c.zip && (
                          <div className="mail-secondary-text">{c.zip}</div>
                        )}
                      </td>

                    {/* <td>
  {c.mailerIds?.length ? (
    <span
      className="mailer-ids"
      title={c.mailerIds.join(', ')}
    >
      {c.mailerIds.slice(0, 2).join(', ')}
      {c.mailerIds.length > 2 &&
        `\n+${c.mailerIds.length - 2} more`}
    </span>
  ) : (
    <span className="mail-muted">—</span>
  )}
</td> */}

                     

                      <td>
                        <div className="mail-row-actions">
                          {/* <button
                            type="button"
                            className="mail-edit-button"
                           
                          >
                            Edit
                          </button> */}
<button
  type="button"
  className="mail-delete-button"
  onClick={(e) => {
    e.stopPropagation();
    handleDelete(c);
  }}
  title={`Delete ${c.companyName || 'mail owner'}`}
  aria-label={`Delete ${c.companyName || 'mail owner'}`}
  style={{ zIndex: 100 }}
>
  ×
</button>
                          {/* <button
                            type="button"
                            className="mail-delete-button"
                            onClick={() => handleDelete(c)}
                            title={`Delete ${c.companyName || 'mail owner'}`}
                            aria-label={`Delete ${c.companyName || 'mail owner'}`}
                            style={{zIndex:'100'}}
                          >
                            ×
                          </button> */}
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
            Showing {filtered.length} of {crids.length} mail owners
          </footer>
        )}
      </section>
    </main>
  );
};

export default PermitOwnersDashboard;
