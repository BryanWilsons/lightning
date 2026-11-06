
import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import './../mailowners/MailOwners.css';
import api from '../../../../Helpers/Api';
import { useAuth } from '../../../../context/AuthContext';
import { normalizedFacilities } from '../../../../util/Normalizedfacilities';
import FacilitySearchSelect from '../../../../Helpers/FacilitySelector';
import ValidationSummary from '../../../../Helpers/Valiodationsummary'; // adjust path
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { buildSavedItem, goBackToCaller, returnToCaller } from '../../../../Helpers/returnToCaller';


const FIELD_LABELS = {
  permitName: 'Permit Name',
  companyName: 'Legal Company Name',
  address: 'Address 1',
  city: 'City',
  state: 'State',
  zip: 'ZIP',
  permitType: 'Permit Type',
  permitNumber: 'Permit #',
  bmeuFacility: 'Post Office of Permit',
};

const FIELD_TARGETS = {
  permitName: 'permitName',
  companyName: 'companyName',
  address: 'address',
  city: 'city',
  state: 'state',
  zip: 'zip',
  permitType: 'permitType',
  permitNumber: 'permitNumber',
  // bmeuFacility is omitted on purpose: FacilitySearchSelect has no
  // name attribute, so it uses fallbackTargetId below.
};

const EMPTY = {
  permitName: '',
  owner: '',
  company: '',
  companyName:"",
  address: '',
  address2: '',
  city: '',
  state: 'FL',
  zip: '',
  permitType: 'Indicia',
  permitNumber: '',
  netDueNumber: '',
  accountNumber: '',
  postOfficeOfPermit: '',
    bmeuFacility: null, // Add this
};

const STATES = [
  ['AL', 'Alabama'], ['AK', 'Alaska'], ['AZ', 'Arizona'],
  ['AR', 'Arkansas'], ['CA', 'California'], ['CO', 'Colorado'],
  ['CT', 'Connecticut'], ['DE', 'Delaware'], ['FL', 'Florida'],
  ['GA', 'Georgia'], ['HI', 'Hawaii'], ['ID', 'Idaho'],
  ['IL', 'Illinois'], ['IN', 'Indiana'], ['IA', 'Iowa'],
  ['KS', 'Kansas'], ['KY', 'Kentucky'], ['LA', 'Louisiana'],
  ['ME', 'Maine'], ['MD', 'Maryland'], ['MA', 'Massachusetts'],
  ['MI', 'Michigan'], ['MN', 'Minnesota'], ['MS', 'Mississippi'],
  ['MO', 'Missouri'], ['MT', 'Montana'], ['NE', 'Nebraska'],
  ['NV', 'Nevada'], ['NH', 'New Hampshire'], ['NJ', 'New Jersey'],
  ['NM', 'New Mexico'], ['NY', 'New York'], ['NC', 'North Carolina'],
  ['ND', 'North Dakota'], ['OH', 'Ohio'], ['OK', 'Oklahoma'],
  ['OR', 'Oregon'], ['PA', 'Pennsylvania'], ['RI', 'Rhode Island'],
  ['SC', 'South Carolina'], ['SD', 'South Dakota'],
  ['TN', 'Tennessee'], ['TX', 'Texas'], ['UT', 'Utah'],
  ['VT', 'Vermont'], ['VA', 'Virginia'], ['WA', 'Washington'],
  ['WV', 'West Virginia'], ['WI', 'Wisconsin'], ['WY', 'Wyoming'],
];

const Field = ({
  label,
  name,
  value,
  onChange,
  error,
  required = false,
  ...props
}) => (
  <div className="form-group">
    <label htmlFor={name}>
      {label} {required && <span className="required">*</span>}
    </label>

    <input
      id={name}
      name={name}
      value={value ?? ''}
      onChange={onChange}
      aria-invalid={Boolean(error)}
      {...props}
    />

    {error && <p className="field-error">{error}</p>}
  </div>
);

const PermitOwner = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { user } = useAuth();

  const [formData, setFormData] = useState({ ...EMPTY });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(isEdit);
  const [isSubmitting, setIsSubmitting] = useState(false);
const [apiErrors, setApiErrors] = useState([]);
const location = useLocation();
const [showValidationSummary, setShowValidationSummary] = useState(false);
  useEffect(() => {
    if (!isEdit) return;

    const fetchPermit = async () => {
      try {
        // Replace this endpoint with your existing permit lookup route.
        const { data } = await api.post('/permits/getpermitholder', { id });

        setFormData({
          ...EMPTY,
          ...data,
          permitName: data.permitName ?? '',
          owner: data.owner ?? '',
          company: data.companyId ?? '',
          companyName:data.companyName ?? "",
          address: data.address ?? '',
          address2: data.address2 ?? '',
          city: data.city ?? '',
          state: data.state ?? 'FL',
          zip: data.zip ?? '',
          permitType: data.permitType ?? 'Indicia',
          permitNumber: data.permitNumber ?? '',
          netDueNumber: data.netDueNumber ?? '',
          accountNumber: data.accountNumber ?? '',
    bmeuFacility: data.bmeuFacility ?? null,
        });
      } catch (err) {
        toast.error(
          err.response?.data?.message || 'Unable to load permit'
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchPermit();
  }, [id, isEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let nextValue = value;

    if (name === 'zip') {
      nextValue = value.replace(/[^\d-]/g, '').slice(0, 10);
    }

    setFormData((prev) => ({
      ...prev,
      [name]: nextValue,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };
const validate = () => {
  const nextErrors = {};

  if (!formData.permitName.trim())
    nextErrors.permitName = 'Permit name is required';

  if (!formData.companyName.trim())
    nextErrors.companyName = 'Company Name is required';

  if (!formData.address.trim())
    nextErrors.address = 'Address 1 is required';

  if (!formData.city.trim())
    nextErrors.city = 'City is required';

  if (!formData.state)
    nextErrors.state = 'State is required';

  if (!/^\d{5}(-\d{4})?$/.test(formData.zip))
    nextErrors.zip = 'Enter a valid ZIP code';

  if (!formData.permitType)
    nextErrors.permitType = 'Select a permit type';

  if (!formData.permitNumber.trim())
    nextErrors.permitNumber = 'Permit number is required';

 if (!formData.bmeuFacility) {
  nextErrors.bmeuFacility = 'Post Office of Permit is required';
}

  setErrors(nextErrors);
  return Object.keys(nextErrors).length === 0;
};


  const goBack = () => {
  if (location.state?.returnTo) {
    navigate(location.state.returnTo, {
      state: { returnData: location.state.returnData },
    });
  } else {
    navigate('/permits');
  }
};

const showSummary = () => {
  setShowValidationSummary(true);
  setTimeout(() => {
    document.getElementById('validation-summary')?.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    });
  }, 100);
};

const handleSubmit = async (e) => {
  e.preventDefault();
  setApiErrors([]);

  if (!validate()) {
    showSummary();
    return;
  }

  setShowValidationSummary(false);
  setIsSubmitting(true);

  try {
    const payload = {
      ...formData,
      ...(!isEdit && user?.company?._id ? { company: user.company._id } : {}),
      ...(isEdit ? { id } : {}),
    };

   let response;

if (isEdit) {
  response = await api.put('/permits/updatepermitholders', payload);
  toast.success('Permit updated successfully');
} else {
  response = await api.post('/permits/addpermitholder', payload);
  toast.success('Permit added successfully');
}

if (!isEdit && location.state?.returnTo) {
  const savedPermit = buildSavedItem({
    responseData: response.data,
    keys: ['item', 'permitholder', 'permitHolder', 'permit'],
    payload,
  });

  if (!savedPermit._id) {
    toast.error('Permit was saved, but the API did not return its ID.');
    return;
  }

  returnToCaller(navigate, location, 'permitHolder', savedPermit);
  return;
}

navigate('/permits?tab=permit-owner');
  } catch (err) {
    setApiErrors(parseApiErrors(err));
    toast.error('Unable to save. Review the errors below.');
    showSummary();
  } finally {
    setIsSubmitting(false);
  }
};
//   const handleSubmit = async (e) => {
  
//     e.preventDefault();
//   console.log(validate())
//     if (!validate()) return;

//    // setIsSubmitting(true);

//      try {
//  const payload = {
//   ...formData,
//   ...(!isEdit && user?.company?._id
//     ? { company: user.company._id }
//     : {}),
//   ...(isEdit ? { id } : {}),
// };


//       console.log(payload)
//       if (isEdit) {
//         // Replace with your actual permit update endpoint.
//         await api.put('/permits/updatepermitholders', payload);
//         toast.success('Permit updated successfully');
//       } else {
//         // Replace with your actual permit creation endpoint.
//         await api.post('/permits/addpermitholder', payload);
//         toast.success('Permit added successfully');
//       }

//       navigate('/permits?tab=permit-owner');
//     } catch (err) {
//       toast.error(
//         err.response?.data?.message || 'Unable to save permit'
//       );
//     } finally {
//       setIsSubmitting(false);
//     }
//   };


  const parseApiErrors = (error) => {
  const data = error.response?.data;

  let list =
    data?.errors ||
    data?.details?.error?.errors ||
    data?.error?.errors ||
    data?.data?.errors ||
    data?.validationErrors ||
    [];

  if (list && !Array.isArray(list)) list = [list];

  if (list.length > 0) {
    return list.map((item) => ({
      title: item?.title || item?.code || item?.error || 'Validation Error',
      detail:
        item?.detail || item?.message || item?.description ||
        'This field was rejected.',
    }));
  }

  return [
    {
      title: data?.error || data?.message || 'Unable to Save Mail Owner',
      detail:
        data?.details?.error?.message ||
        data?.details?.message ||
        (typeof data?.details === 'string' ? data.details : null) ||
        data?.message ||
        error.message ||
        'An unexpected error occurred.',
    },
  ];
};


  if (isLoading) {
    return (
      <div className="dashboard">
        <p>Loading permit...</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h1>{isEdit ? 'Edit Permit' : 'Add Permit'}</h1>
          <p>Manage permit details and postal information.</p>
        </div>

        <button
          type="button"
          className="btn-primary"
        onClick={() => goBackToCaller(navigate, location, '/permits')}
        >
          ← Back to Permit Owners
        </button>
      </div>

      
<form onSubmit={handleSubmit} className="space-y-6">
  {showValidationSummary && (
    <ValidationSummary
      errors={errors}
      apiErrors={apiErrors}
      apiErrorsTitle="Save Errors"
      apiErrorsSubtitle="The permit could not be saved. Review the messages below."
      title="Please review this permit"
      message="This permit hasn't been saved yet. Please correct the following items."
      fieldLabels={FIELD_LABELS}
      fieldTargets={FIELD_TARGETS}
      fallbackTargetId="bmeu-facility"
      onDismiss={() => setShowValidationSummary(false)}
    />
  )}
{/* Owner Information */}
<section className="card">
  <div className="card-header">
    <h2>Owner Information</h2>
  </div>

  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
    <Field
      label="Permit Name"
      name="permitName"
      required
      maxLength={100}
      placeholder="Enter permit name"
      value={formData.permitName}
      onChange={handleChange}
      error={errors.permitName}
    />
    <Field
      label={
    <>
      Legal Company Name{' '}
      <span className="label-note">(name assigned to this permit)</span>
    </>
  }
      name="companyName"
      required
      maxLength={100}
      placeholder="Company name"
      value={formData.companyName}
      onChange={handleChange}
      error={errors.companyName}
    />
  </div>

  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5">
    <Field
      label="Address 1"
      name="address"
      required
      maxLength={80}
      placeholder="Street address"
      value={formData.address}
      onChange={handleChange}
      error={errors.address}
    />

    <Field
      label="Address 2"
      name="address2"
      maxLength={80}
      placeholder="Suite, unit, etc. (optional)"
      value={formData.address2}
      onChange={handleChange}
      error={errors.address2}
    />
  </div>

  <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-5">
    <Field
      label="City"
      name="city"
      required
      maxLength={40}
      placeholder="City"
      value={formData.city}
      onChange={handleChange}
      error={errors.city}
    />

    <div className="form-group">
      <label htmlFor="state">
        State <span className="required">*</span>
      </label>

      <select
        id="state"
        name="state"
        value={formData.state}
        onChange={handleChange}
        aria-invalid={Boolean(errors.state)}
      >
        <option value="">Select State</option>
        {STATES.map(([code, name]) => (
          <option key={code} value={code}>
            {name}
          </option>
        ))}
      </select>

      {errors.state && (
        <p className="field-error">{errors.state}</p>
      )}
    </div>

    <Field
      label="ZIP"
      name="zip"
      required
      inputMode="numeric"
      placeholder="33781"
      value={formData.zip}
      onChange={handleChange}
      error={errors.zip}
    />
  </div>
</section>

{/* Permit Information */}
<section className="card">
  <div className="card-header">
    <h2>Permit Information</h2>
  </div>

  <div className="form-group permit-type-group">
    <label>
      Permit Type <span className="required">*</span>
    </label>

    <div className="permit-type-options" role="radiogroup" aria-label="Permit Type">
      {['Indicia', 'Stamp', 'Meter'].map((type) => (
        <label
          key={type}
          className={`permit-type-option ${
            formData.permitType === type ? 'selected' : ''
          }`}
        >
          <input
            type="radio"
            name="permitType"
            value={type}
            checked={formData.permitType === type}
            onChange={handleChange}
          />
          <span className="permit-radio-indicator" />
          <span>{type}</span>
        </label>
      ))}
    </div>

    {errors.permitType && (
      <p className="field-error">{errors.permitType}</p>
    )}
  </div>

  <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-5">
    <Field
      label="Permit #"
      name="permitNumber"
      required
      maxLength={50}
      placeholder="Enter permit number"
      value={formData.permitNumber}
      onChange={handleChange}
      error={errors.permitNumber}
    />

    <Field
      label="Net Due #"
      name="netDueNumber"
      maxLength={50}
      placeholder="Enter net due number"
      value={formData.netDueNumber}
      onChange={handleChange}
      error={errors.netDueNumber}
    />

    <Field
      label="Account #"
      name="accountNumber"
      maxLength={50}
      placeholder="Enter account number"
      value={formData.accountNumber}
      onChange={handleChange}
      error={errors.accountNumber}
    />
  </div>

  <div
  className="grid grid-cols-1 md:grid-cols-2 gap-5"
  style={{ marginTop: '15px' }}
>
  <div className="form-group" id="bmeu-facility">
  <label>Post Office of Permit <span className="required">*</span></label>

    <FacilitySearchSelect
      facilities={normalizedFacilities}
      value={formData.bmeuFacility}
      onChange={(facility) => {
        setFormData((prev) => ({
          ...prev,
          bmeuFacility: facility,
        }));

        setErrors((prev) => ({
          ...prev,
          bmeuFacility: '',
        }));
      }}
    />

    {errors.bmeuFacility && (
      <p className="field-error">{errors.bmeuFacility}</p>
    )}
  </div>
</div>
</section>

  <div className="suppression-form-footer">
          <button
            type="button"
            className="suppression-cancel-button"
        onClick={() => goBackToCaller(navigate, location, '/permits')}
            disabled={isSubmitting}
          >
            Cancel
          </button>

          <button
            type="submit"
            className="suppression-save-button"
            disabled={isSubmitting}
          >
           {isSubmitting
      ? 'Saving...'
      : isEdit
        ? 'Update Permit Owner'
        : 'Save Permit Owner'}
          </button>
        </div>

{/* <div className="pt-2">
  <button
    type="submit"
    disabled={isSubmitting}
  className="px-5 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition"
  >
    {isSubmitting
      ? 'Saving...'
      : isEdit
        ? 'Update Permit'
        : 'Save Permit'}
  </button>
</div> */}

      </form>
    </div>
  );
};

export default PermitOwner;
