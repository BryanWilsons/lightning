import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate, useParams, useSearchParams, useLocation } from 'react-router-dom';


import { toast } from 'react-toastify';
import {
  Plus,
  Trash2,
  FileSpreadsheet,
  Users,
  MapPin,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  CheckCircle2,
  Upload,
  ChevronsRight,
} from 'lucide-react';
import CsvSeedMapper from '../CSVMapper';
import { useAuth } from '../../../../context/AuthContext';
import api from '../../../../Helpers/Api';
import './../mailowners/MailOwners.css';
import './SuppressionForm.css';
import './SuppressionMobile.css';


const emptySeed = () => ({
  prefix: '',
  firstName: '',
  lastName: '',
  middleName: '',
  company: '',
  suffix: '',
  address1: '',
  address2: '',
  address3: '',
  city: '',
  state: '',
  zip: '',
  email: '',
});

const REQUIRED_FIELDS = [
  ['firstName', 'First name'],
  ['lastName', 'Last name'],
  ['address1', 'Address'],
  ['city', 'City'],
  ['state', 'State'],
  ['zip', 'ZIP code'],
];

const missingFieldsFor = (seed) =>
  REQUIRED_FIELDS.filter(([key]) => !String(seed[key] ?? '').trim()).map(
    ([, label]) => label
  );

// Make sure every imported row has every key, as a trimmed string.
const normalizeSeed = (row) => {
  const seed = emptySeed();
  Object.keys(seed).forEach((key) => {
    seed[key] = String(row?.[key] ?? '').trim();
  });
  return seed;
};

const AddSuppressionList = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [form, setForm] = useState({
      _id: null,
    suppressionListName: '',
    description: '',
    mailOwner: '',
    bmeuFacility: '',
    seeds: [],
  });
// inside the component
const { id } = useParams();
const isEdit = Boolean(id);
const [searchParams] = useSearchParams();



const [pageLoading, setPageLoading] = useState(isEdit);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState([]); // [{ message, index? }]
  const [currentIndex, setCurrentIndex] = useState(0);
  const [jumpValue, setJumpValue] = useState('1');
  const [showImport, setShowImport] = useState(true);

  const total = form.seeds.length;
  const currentSeed = form.seeds[currentIndex];
  const showErrors = errors.length > 0;

  const incompleteCount = useMemo(
    () => form.seeds.filter((s) => missingFieldsFor(s).length > 0).length,
    [form.seeds]
  );

const descriptionRef = useRef(null);

useEffect(() => {
  const textarea = descriptionRef.current;

  if (textarea) {
    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight}px`;
  }
}, [form.description]);


  useEffect(() => {
  if (!id || !user?.company?._id) return;
  let cancelled = false;

  (async () => {
    try {
      setPageLoading(true);

      const { data } = await api.post('/permits/suppressionlist', {
        _id: id,
        company: user.company._id,
      });

      if (cancelled) return;

      setForm({
        _id: data._id,
        suppressionListName: data.suppressionListName || '',
        description: data.description || '',
        mailOwner: data.mailOwner || '',
        bmeuFacility: data.bmeuFacility || '',
        seeds: (data.seeds || []).map(normalizeSeed),
      });

      setCurrentIndex(0);
      setJumpValue('1');
      setShowImport(false); // start on the records, with "Import another CSV" available
    } catch (error) {
      if (cancelled) return;
      toast.error(error.response?.data?.error || 'Unable to load suppression list.');
      navigate('/permits?tab=suppress');
    } finally {
      if (!cancelled) setPageLoading(false);
    }
  })();

  return () => { cancelled = true; };
}, [id, user?.company?._id]);


  const goTo = (index) => {
    if (!total) return;
    const clamped = Math.min(Math.max(index, 0), total - 1);
    setCurrentIndex(clamped);
    setJumpValue(String(clamped + 1));
  };

  const goToNextIncomplete = () => {
    if (!total) return;
    for (let step = 1; step <= total; step++) {
      const i = (currentIndex + step) % total;
      if (missingFieldsFor(form.seeds[i]).length) {
        goTo(i);
        return;
      }
    }
    toast.success('Every record has its required fields.');
  };

  const commitJump = () => {
    const n = parseInt(jumpValue, 10);
    if (Number.isNaN(n)) {
      setJumpValue(String(currentIndex + 1));
      return;
    }
    goTo(n - 1);
  };

  const handleTextarea = (e) => {
  const textarea = e.target;

  // Reset height to recalculate
  textarea.style.height = 'auto';

  // Expand to fit content
  textarea.style.height = `${textarea.scrollHeight}px`;

  setForm((prev) => ({
    ...prev,
    description: textarea.value
  }));
};

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Called by CsvSeedMapper. Appends to whatever is already in the list,
  // so users can import more than one file.
const handleCsvImport = (importedSeeds, mode = 'add') => {
  const cleaned = (importedSeeds || [])
    .map(normalizeSeed)
    .filter((seed) =>
      Object.values(seed).some((v) => v !== '')
    );

  if (!cleaned.length) {
    toast.error('No usable rows were found in that import.');
    return;
  }

  if (mode === 'replace') {
    setForm((prev) => ({
      ...prev,
      seeds: cleaned,
    }));

    setCurrentIndex(0);
    setJumpValue('1');
    setShowImport(false);

    toast.success(
      `${cleaned.length} address records replaced the existing list.`
    );

    return;
  }

  // Add to existing
  const firstNewIndex = form.seeds.length;

  setForm((prev) => ({
    ...prev,
    seeds: [...prev.seeds, ...cleaned],
  }));

  setCurrentIndex(firstNewIndex);
  setJumpValue(String(firstNewIndex + 1));
  setShowImport(false);

  toast.success(`${cleaned.length} address records added.`);
};

  const addSeed = () => {
    const newIndex = form.seeds.length;
    setForm((prev) => ({ ...prev, seeds: [...prev.seeds, emptySeed()] }));
    setCurrentIndex(newIndex);
    setJumpValue(String(newIndex + 1));
  };

  const removeSeed = (index) => {
    setForm((prev) => ({
      ...prev,
      seeds: prev.seeds.filter((_, i) => i !== index),
    }));

    const newTotal = total - 1;
    const nextIndex = Math.max(0, Math.min(index, newTotal - 1));
    setCurrentIndex(nextIndex);
    setJumpValue(String(nextIndex + 1));
  };

  const handleSeedChange = (index, field, value) => {
    setForm((prev) => ({
      ...prev,
      seeds: prev.seeds.map((seed, i) =>
        i === index ? { ...seed, [field]: value } : seed
      ),
    }));
  };

  const validateForm = () => {
    const validationErrors = [];

    if (!form.suppressionListName.trim()) {
      validationErrors.push({ message: 'Suppression list name is required.' });
    }

   

    if (!form.seeds.length) {
      validationErrors.push({
        message: 'Add at least one address or import a CSV file.',
      });
    }

    // One line per record, not one line per missing field.
    form.seeds.forEach((seed, index) => {
      const missing = missingFieldsFor(seed);
      if (missing.length) {
        validationErrors.push({
          index,
          message: `Record ${index + 1}: missing ${missing.join(', ')}.`,
        });
      }
    });

    setErrors(validationErrors);
    return validationErrors.length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please correct the highlighted issues.');
      return;
    }

    if (!user?.company?._id) {
      toast.error('Unable to identify your company.');
      return;
    }

   const payload = {
  ...(form._id && { _id: form._id }),
  suppressionListName: form.suppressionListName.trim(),
  description: form.description.trim(),
  company: user.company?._id,
  seeds: form.seeds.map(normalizeSeed),
};

    try {
      setLoading(true);

      // Replace this URL if your backend uses a different create route.
      await api.post('/permits/suppress', payload);

    toast.success(isEdit ? 'Suppression list updated.' : 'Suppression list created successfully.');
      navigate('/permits?tab=suppress');
    } catch (error) {
      console.error('Create suppression list error:', error);

      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        'Unable to create suppression list.';

      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const fieldClass = (key, required) =>
    `suppression-field${
      showErrors && required && !String(currentSeed?.[key] ?? '').trim()
        ? ' is-missing'
        : ''
    }`;

  const pagerNav = (extraClass = '') => (
    <div className={`suppression-pager-nav ${extraClass}`}>
      <button
        type="button"
        className="suppression-pager-arrow"
        onClick={() => goTo(currentIndex - 1)}
        disabled={currentIndex === 0}
        aria-label="Previous record"
      >
        <ChevronLeft size={20} />
      </button>

      <div className="suppression-pager-status">
        <span>Record</span>
        <input
          type="number"
          inputMode="numeric"
          min={1}
          max={total}
          value={jumpValue}
          onChange={(e) => setJumpValue(e.target.value)}
          onBlur={commitJump}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              commitJump();
            }
          }}
          aria-label="Jump to record number"
        />
        <span>of {total}</span>
      </div>

      <button
        type="button"
        className="suppression-pager-arrow"
        onClick={() => goTo(currentIndex + 1)}
        disabled={currentIndex >= total - 1}
        aria-label="Next record"
      >
        <ChevronRight size={20} />
      </button>
    </div>
  );

  if (pageLoading) {
  return <div className="suppression-form-container">Loading list…</div>;
}

  return (
    <div className="suppression-form-container">
      <form onSubmit={handleSubmit}>
        {/* Header */}
   <div className="dashboard-header">
        <div>
          <h1>{isEdit ? 'Edit Suppression List' : 'Add Suppression List'}</h1>
          {/* <p>Manage mail owner.</p> */}
        </div>

        <button
          type="button"
          className="btn-primary"
       onClick={() => navigate('/permits?tab=suppress')}
        >
          ← Back to Suppression List
        </button>
      </div>

        {/* Validation */}
        {errors.length > 0 && (
          <div className="suppression-validation">
            <strong>Please review the following:</strong>

            <ul>
              {errors.slice(0, 10).map((error, i) => (
                <li key={i}>
                  {error.message}{' '}
                  {error.index !== undefined && (
                    <button
                      type="button"
                      className="suppression-link-button"
                      onClick={() => goTo(error.index)}
                    >
                      Go to record
                    </button>
                  )}
                </li>
              ))}
              {errors.length > 10 && (
                <li>
                  …and {errors.length - 10} more. Use “Next incomplete” to step
                  through them.
                </li>
              )}
            </ul>
          </div>
        )}

        {/* List Information */}
        <section className="suppression-section">
          <div className="suppression-section-heading">
            <div className="suppression-section-icon">
              <FileSpreadsheet size={19} />
            </div>

            <div>
              <h3>List Information</h3>
              <p>Enter the basic information for this suppression list.</p>
            </div>
          </div>

          <div className="suppression-fields-grid" style={{display:'flex'}}>
            <div
            style={{flex:'1'}}
              className={`suppression-field full${
                showErrors && !form.suppressionListName.trim() ? ' is-missing' : ''
              }`}
            >
              <label>
                Suppression List Name <span>*</span>
              </label>
              <input
                type="text"
                name="suppressionListName"
                value={form.suppressionListName}
                onChange={handleChange}
                placeholder="Example: Customer Suppression List"
              />
            </div>

            <div
               style={{flex:'1'}}
              className={`suppression-field full${
                showErrors && !form.description.trim() ? ' is-missing' : ''
              }`}
            >
              <label>
                Description <span>*</span></label>
         <textarea
          ref={descriptionRef}
  name="description"
  value={form.description}
  onChange={handleTextarea}
  placeholder="Describe the purpose of this suppression list..."
  rows={1}
  style={{
    minHeight: '38px',
    resize: 'none',
    overflow: 'hidden',
    boxSizing: 'border-box'
  }}
/>
            </div>
          </div>
      
          <div className="suppression-section-heading suppression-seeds-heading mt-10">
            <div className="suppression-section-icon">
              <MapPin size={19} />
            </div>

            <div>
              <h3>Suppression Addresses</h3>
              <p>Import addresses from a CSV file or enter them individually.</p>
            </div>

            <div className="suppression-count">
              {total} {total === 1 ? 'Record' : 'Records'}
            </div>
          </div>

          {/* Import: open when empty, collapsed behind a button once there are records */}
          {showImport || total === 0 ? (
            <div className="suppression-import-panel">
     <CsvSeedMapper
  onImport={handleCsvImport}
  existingSeeds={form.seeds}
  isEdit={isEdit}
/>

              {total > 0 && (
                <button
                  type="button"
                  className="suppression-secondary-button"
                  onClick={() => setShowImport(false)}
                >
                  Close import
                </button>
              )}
            </div>
          ) : (
           <div className="suppression-toolbar">

  <button
    type="button"
    className="suppression-secondary-button"
    onClick={() => setShowImport(true)}
  >
    <Upload size={16} />
    {isEdit ? 'Remap / Import CSV' : 'Import another CSV'}
  </button>

  <button
    type="button"
    className="suppression-add-button"
    onClick={addSeed}
  >
    <Plus size={16} />
    Add Address
  </button>

</div>
          )}

          {total === 0 ? (
            <div className="suppression-empty">
              <div className="suppression-empty-icon">
                <MapPin size={25} />
              </div>
              <strong>No addresses added yet</strong>
              <p>
                Import a CSV file above or{' '}
                <button
                  type="button"
                  className="suppression-link-button"
                  onClick={addSeed}
                >
                  add an address manually
                </button>
                .
              </p>
            </div>
          ) : (
            <>
              {incompleteCount > 0 && (
                <div className="suppression-incomplete-banner">
                  <AlertTriangle size={16} />
                  <span>
                    {incompleteCount}{' '}
                    {incompleteCount === 1 ? 'record needs' : 'records need'}{' '}
                    attention
                  </span>
                  <button
                    type="button"
                    className="suppression-link-button"
                    onClick={goToNextIncomplete}
                  >
                    Next incomplete <ChevronsRight size={14} />
                  </button>
                </div>
              )}

              {pagerNav()}

              {currentSeed && (
                <div className="suppression-seed-card" key={currentIndex}>
                  <div className="suppression-seed-card-header">
                    <div>
                      <span className="suppression-record-number">
                        RECORD {String(currentIndex + 1).padStart(2, '0')}
                        {missingFieldsFor(currentSeed).length === 0 ? (
                          <span className="suppression-badge ok">
                            <CheckCircle2 size={12} /> Complete
                          </span>
                        ) : (
                          <span className="suppression-badge warn">
                            Needs: {missingFieldsFor(currentSeed).join(', ')}
                          </span>
                        )}
                      </span>

                      <strong>
                        {currentSeed.firstName || currentSeed.lastName
                          ? `${currentSeed.firstName} ${currentSeed.lastName}`.trim()
                          : 'New Address'}
                      </strong>
                    </div>

                    <button
                      type="button"
                      className="suppression-remove-button"
                      onClick={() => removeSeed(currentIndex)}
                      title="Remove this address"
                    >
                      <Trash2 size={16} />
                      Remove
                    </button>
                  </div>

                  <div className="suppression-fields-grid">
                    <div className="suppression-field">
                      <label>Prefix</label>
                      <input
                        value={currentSeed.prefix}
                        onChange={(e) =>
                          handleSeedChange(currentIndex, 'prefix', e.target.value)
                        }
                        placeholder="Mr., Mrs., Dr."
                      />
                    </div>

                    <div className={fieldClass('firstName', true)}>
                      <label>
                        First Name <span>*</span>
                      </label>
                      <input
                        value={currentSeed.firstName}
                        onChange={(e) =>
                          handleSeedChange(currentIndex, 'firstName', e.target.value)
                        }
                        placeholder="First name"
                      />
                    </div>

                    <div className="suppression-field">
                      <label>Middle Name</label>
                      <input
                        value={currentSeed.middleName}
                        onChange={(e) =>
                          handleSeedChange(currentIndex, 'middleName', e.target.value)
                        }
                        placeholder="Middle name"
                      />
                    </div>

                    <div className={fieldClass('lastName', true)}>
                      <label>
                        Last Name <span>*</span>
                      </label>
                      <input
                        value={currentSeed.lastName}
                        onChange={(e) =>
                          handleSeedChange(currentIndex, 'lastName', e.target.value)
                        }
                        placeholder="Last name"
                      />
                    </div>

                    <div className="suppression-field">
                      <label>Suffix</label>
                      <input
                        value={currentSeed.suffix}
                        onChange={(e) =>
                          handleSeedChange(currentIndex, 'suffix', e.target.value)
                        }
                        placeholder="Jr., Sr., III"
                      />
                    </div>

                    <div className="suppression-field col-span-3">
                      <label>
                        Address 1 <span>*</span>
                      </label>
                      <input
                        value={currentSeed.address1}
                        onChange={(e) =>
                          handleSeedChange(currentIndex, 'address1', e.target.value)
                        }
                        placeholder="Street address"
                      />
                    </div>

                    <div  className="suppression-field col-span-2">
                      <label>Address 2</label>
                      <input
                        value={currentSeed.address2}
                        onChange={(e) =>
                          handleSeedChange(currentIndex, 'address2', e.target.value)
                        }
                        placeholder="Apartment, suite, unit..."
                      />
                    </div>

                    <div className="suppression-field col-span-1">
                      <label>
                        City <span>*</span>
                      </label>
                      <input
                        value={currentSeed.city}
                        onChange={(e) =>
                          handleSeedChange(currentIndex, 'city', e.target.value)
                        }
                        placeholder="City"
                      />
                    </div>

                    <div className="suppression-field col-span-1">
                      <label>
                        State <span>*</span>
                      </label>
                      <input
                        value={currentSeed.state}
                        onChange={(e) =>
                          handleSeedChange(
                            currentIndex,
                            'state',
                            e.target.value.toUpperCase()
                          )
                        }
                        placeholder="FL"
                        maxLength={2}
                      />
                    </div>

                    <div className="suppression-field col-span-1">
                      <label>
                        ZIP Code <span>*</span>
                      </label>
                      <input
                        value={currentSeed.zip}
                        onChange={(e) =>
                          handleSeedChange(currentIndex, 'zip', e.target.value)
                        }
                        placeholder="ZIP code"
                      />
                    </div>

                    <div className="suppression-field col-span-2">
                      <label>Email</label>
                      <input
                        type="email"
                        value={currentSeed.email}
                        onChange={(e) =>
                          handleSeedChange(currentIndex, 'email', e.target.value)
                        }
                        placeholder="Email address"
                      />
                    </div>
                  </div>
                </div>
              )}

              {pagerNav('bottom')}

              {/* Add more, right where they're working */}
              {showImport === false && (
                <p className="suppression-hint">
                  Need to add more? Use <strong>Add Address</strong> or{' '}
                  <strong>Import another CSV</strong> above. New records are
                  added to the end of this list.
                </p>
              )}
            </>
          )}
        </section>

        {/* Footer */}
        <div className="suppression-form-footer">
          <button
            type="button"
            className="suppression-cancel-button"
            onClick={() => navigate('/permits?tab=suppress')}
            disabled={loading}
          >
            Cancel
          </button>

          <button
            type="submit"
            className="suppression-save-button"
            disabled={loading}
          >
          {loading ? 'Saving List...' : isEdit ? 'Save Changes' : 'Create Suppression List'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddSuppressionList;
