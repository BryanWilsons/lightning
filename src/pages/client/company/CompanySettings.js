import { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { toast } from 'react-toastify';
import './CompanySettings.css';

export default function CompanySettings() {

  const [saving, setSaving] = useState(false);

   const { user, company } = useAuth();

console.log(company)
  const [form, setForm] = useState({
    companyName: company?.name || '',
    legalName: company?.name || '',
    ein:company?.ein || '',
mailerType: 'presort',
    phone: '',
    website: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    zip: '',
    country: 'US',
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    
    notes: '',
  });

  // Multiple CRIDs & MIDs
  const [crids, setCrids] = useState([{ value: '', label: 'Primary' }]);
  const [mids, setMids] = useState([{ value: '', label: 'Primary', type: '9-digit' }]);

  const [errors, setErrors] = useState({});

  useEffect(() => {
    // Load existing data here when you connect the API
    // if (user?.company) { setForm(...); setCrids(...); setMids(...); }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  // ── CRID helpers ──────────────────────────────────────
  const addCrid = () => {
    setCrids((prev) => [...prev, { value: '', label: '' }]);
  };

  const removeCrid = (index) => {
    if (crids.length === 1) return;
    setCrids((prev) => prev.filter((_, i) => i !== index));
  };

  const updateCrid = (index, field, value) => {
    setCrids((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  };

  // ── MID helpers ───────────────────────────────────────
  const addMid = () => {
    setMids((prev) => [...prev, { value: '', label: '', type: '9-digit' }]);
  };

  const removeMid = (index) => {
    if (mids.length === 1) return;
    setMids((prev) => prev.filter((_, i) => i !== index));
  };

  const updateMid = (index, field, value) => {
    setMids((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  };

  const validate = () => {
    const newErrors = {};
    if (!form.companyName.trim()) newErrors.companyName = 'Company name is required';
    if (!form.addressLine1.trim()) newErrors.addressLine1 = 'Address is required';
    if (!form.city.trim()) newErrors.city = 'City is required';
    if (!form.state.trim()) newErrors.state = 'State is required';
    if (!form.zip.trim()) newErrors.zip = 'ZIP code is required';
    if (!form.contactName.trim()) newErrors.contactName = 'Contact name is required';
    if (!form.contactEmail.trim()) newErrors.contactEmail = 'Contact email is required';

    // At least one CRID required
    if (!crids.some((c) => c.value.trim())) {
      newErrors.crids = 'At least one CRID is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      toast.error('Please fix the highlighted fields');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...form,
        crids: crids.filter((c) => c.value.trim()),
        mids: mids.filter((m) => m.value.trim()),
      };

      // await api.put('/company', payload);
      console.log('Saving company:', payload);
      await new Promise((r) => setTimeout(r, 800));
      toast.success('Company information saved');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h1>Company Profile</h1>
          <p>Business details required for USPS mail presort and Informed Delivery campaigns.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="company-form">
        {/* Business Identity */}
        <section className="card">
          <div className="card-header">
            <h2>Business Identity</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="form-group">
              <label>Company Name <span className="required">*</span></label>
              <input
                name="companyName"
                value={form.companyName}
                onChange={handleChange}
                placeholder="Lightning Presort Services"
              />
              {errors.companyName && <p className="field-error">{errors.companyName}</p>}
            </div>

            <div className="form-group">
              <label>Legal Business Name</label>
              <input
                name="legalName"
                value={form.legalName}
                onChange={handleChange}
                placeholder="If different from display name"
              />
            </div>

            <div className="form-group">
              <label>EIN / Tax ID</label>
              <input
                name="ein"
                value={form.ein}
                onChange={handleChange}
                placeholder="XX-XXXXXXX"
              />
            </div>

            <div className="form-group">
              <label>Mailer Type</label>
              <select name="mailerType" value={form.mailerType} onChange={handleChange}>
                <option value="presort">Presort Bureau / Mail Service Provider</option>
                <option value="owner">Mail Owner</option>
                <option value="nonprofit">Nonprofit</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
        </section>

        {/* CRIDs */}
        <section className="card">
          <div className="card-header">
            <h2>Customer Registration IDs (CRIDs)</h2>
            <button type="button" className="add-btn" onClick={addCrid}>
              + Add CRID
            </button>
          </div>
          <p className="section-help">
            One CRID per physical business location. A company can have multiple CRIDs.
          </p>

          {errors.crids && <p className="field-error" style={{ marginBottom: 12 }}>{errors.crids}</p>}

          <div className="id-list">
            {crids.map((crid, index) => (
              <div key={index} className="id-row">
                <div className="form-group" style={{ flex: 1 }}>
                  <label>{index === 0 ? 'Primary CRID' : `CRID ${index + 1}`} {index === 0 && <span className="required">*</span>}</label>
                  <input
                    value={crid.value}
                    onChange={(e) => updateCrid(index, 'value', e.target.value)}
                    placeholder="USPS Customer Registration ID"
                  />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Label / Location</label>
                  <input
                    value={crid.label}
                    onChange={(e) => updateCrid(index, 'label', e.target.value)}
                    placeholder="e.g. Main Facility, Tampa Plant"
                  />
                </div>
                {crids.length > 1 && (
                  <button
                    type="button"
                    className="remove-id-btn"
                    onClick={() => removeCrid(index)}
                    title="Remove"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* MIDs */}
        <section className="card">
          <div className="card-header">
            <h2>Mailer IDs (MIDs)</h2>
            <button type="button" className="add-btn" onClick={addMid}>
              + Add MID
            </button>
          </div>
          <p className="section-help">
            Multiple MIDs can be linked to a single CRID. Used in Intelligent Mail barcodes.
          </p>

          <div className="id-list">
            {mids.map((mid, index) => (
              <div key={index} className="id-row">
                <div className="form-group" style={{ flex: 1 }}>
                  <label>{index === 0 ? 'Primary MID' : `MID ${index + 1}`}</label>
                  <input
                    value={mid.value}
                    onChange={(e) => updateMid(index, 'value', e.target.value)}
                    placeholder="6 or 9 digit Mailer ID"
                  />
                </div>
                <div className="form-group" style={{ width: 140 }}>
                  <label>Type</label>
                  <select
                    value={mid.type}
                    onChange={(e) => updateMid(index, 'type', e.target.value)}
                  >
                    <option value="9-digit">9-digit</option>
                    <option value="6-digit">6-digit</option>
                  </select>
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Label / Nickname</label>
                  <input
                    value={mid.label}
                    onChange={(e) => updateMid(index, 'label', e.target.value)}
                    placeholder="e.g. Informed Delivery, Standard"
                  />
                </div>
                {mids.length > 1 && (
                  <button
                    type="button"
                    className="remove-id-btn"
                    onClick={() => removeMid(index)}
                    title="Remove"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Business Address */}
        <section className="card">
          <div className="card-header">
            <h2>Business Address</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="form-group md:col-span-2">
              <label>Address Line 1 <span className="required">*</span></label>
              <input name="addressLine1" value={form.addressLine1} onChange={handleChange} placeholder="Street address" />
              {errors.addressLine1 && <p className="field-error">{errors.addressLine1}</p>}
            </div>

            <div className="form-group md:col-span-2">
              <label>Address Line 2</label>
              <input name="addressLine2" value={form.addressLine2} onChange={handleChange} placeholder="Suite, unit, building, etc." />
            </div>

            <div className="form-group">
              <label>City <span className="required">*</span></label>
              <input name="city" value={form.city} onChange={handleChange} />
              {errors.city && <p className="field-error">{errors.city}</p>}
            </div>

            <div className="form-group">
              <label>State <span className="required">*</span></label>
              <input name="state" value={form.state} onChange={handleChange} placeholder="e.g. FL" maxLength={2} />
              {errors.state && <p className="field-error">{errors.state}</p>}
            </div>

            <div className="form-group">
              <label>ZIP Code <span className="required">*</span></label>
              <input name="zip" value={form.zip} onChange={handleChange} placeholder="12345" />
              {errors.zip && <p className="field-error">{errors.zip}</p>}
            </div>

            <div className="form-group">
              <label>Country</label>
              <select name="country" value={form.country} onChange={handleChange}>
                <option value="US">United States</option>
              </select>
            </div>
          </div>
        </section>

        {/* Primary Contact */}
        <section className="card">
          <div className="card-header">
            <h2>Primary Contact</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="form-group">
              <label>Contact Name <span className="required">*</span></label>
              <input name="contactName" value={form.contactName} onChange={handleChange} placeholder="Full name" />
              {errors.contactName && <p className="field-error">{errors.contactName}</p>}
            </div>

            <div className="form-group">
              <label>Contact Email <span className="required">*</span></label>
              <input type="email" name="contactEmail" value={form.contactEmail} onChange={handleChange} placeholder="name@company.com" />
              {errors.contactEmail && <p className="field-error">{errors.contactEmail}</p>}
            </div>

            <div className="form-group">
              <label>Contact Phone</label>
              <input name="contactPhone" value={form.contactPhone} onChange={handleChange} placeholder="(555) 123-4567" />
            </div>

            <div className="form-group">
              <label>Company Phone</label>
              <input name="phone" value={form.phone} onChange={handleChange} placeholder="Main business number" />
            </div>

            <div className="form-group md:col-span-2">
              <label>Website</label>
              <input name="website" value={form.website} onChange={handleChange} placeholder="https://www.yourcompany.com" />
            </div>
          </div>
        </section>

        {/* Notes */}
        <section className="card">
          <div className="card-header">
            <h2>Additional Notes</h2>
          </div>
          <div className="form-group">
            <label>Internal notes (optional)</label>
            <textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
              rows={3}
              placeholder="Any special handling instructions or notes about this account..."
            />
          </div>
        </section>

        <div className="form-actions">
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? 'Saving…' : 'Save Company Profile'}
          </button>
        </div>
      </form>
    </div>
  );
}