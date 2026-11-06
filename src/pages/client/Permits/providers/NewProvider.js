import React, { useState, useEffect } from 'react';
import { useNavigate, useParams,useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import '../mailowners/MailOwners.css'
import { useAuth } from '../../../../context/AuthContext';
import api, { setAccessToken, setTokenHandlers } from "../../../../Helpers/Api";
import FacilitySearchSelect from '../../../../Helpers/FacilitySelector';
import ValidationSummary from '../../../../Helpers/Valiodationsummary'; // adjust path
import { normalizedFacilities } from '../../../../util/Normalizedfacilities';
import { buildSavedItem, goBackToCaller, returnToCaller } from '../../../../Helpers/returnToCaller';



const FIELD_LABELS = {
  providerName: 'Company',
  address: 'Address 1',
  address2: 'Address 2',
  city: 'City',
  state: 'State',
  zip: 'ZIP',
  crid: 'CRID',
  mid: 'MID',
  repname: 'Representative Name',
  repphone: 'Phone',
  repemail: 'Email',
  postOfficeEntryLocation: 'Post Office of Entry Location',
};

const FIELD_TARGETS = {
  providerName: 'providerName',
  address: 'address',
  address2: 'address2',
  city: 'city',
  state: 'state',
  zip: 'zip',
  crid: 'crid',
  mid: 'mid',
  repname: 'repname',
  repphone: 'repphone',
  repemail: 'repemail',
  postOfficeEntryLocation: 'postOfficeEntryLocation',
};

// Pulls a list of { title, detail } out of whatever shape the API returns
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


const EMPTY = {
  providerName: '',
  name: '',
  address: '',
  address2: '',
  city: '',
  state: 'FL',
  zip: '',
  crid: '',
  mid: '',
  repname: '',
  repphone: '',
  repemail: '',
  einduction: false,
  seamless: false,
  postOfficeEntry: false,
  postOfficeEntryLocation: '',
  company: '',
};


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
      {...props}
    />

    {error && <p className="field-error">{error}</p>}
  </div>
);

const MailProvider = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
const param = useParams()
  const [formData, setFormData] = useState({ ...EMPTY });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(isEdit);
  const [isSubmitting, setIsSubmitting] = useState(false);
const {user} = useAuth()
const location = useLocation();
const [apiErrors, setApiErrors] = useState([]);
const [showValidationSummary, setShowValidationSummary] = useState(false);

  useEffect(() => {
    if (!isEdit) return;
    const fetchMailOwner = async () => {
      try {
        console.log(param.id)
        const { data } = await api.post(`/permits/getprovider`,{id:param.id});
 console.log(data)
setFormData({
  ...EMPTY,
  ...data,

  providerName:
    data.providerName ??
    data.companyName ??
    data.name ??
    '',

  name:
    data.name ??
    data.mailOwnerName ??
    data.providerName ??
    '',

  address: data.address ?? '',
  address2: data.address2 ?? '',
  city: data.city ?? '',
  state: data.state ?? 'FL',
  zip: String(data.zip ?? ''),

  crid: String(data.crid ?? data.CRID ?? ''),
  mid: String(data.mid ?? data.MID ?? ''),

  repname: data.repname ?? data.representativeName ?? '',
  repphone: data.repphone ?? data.representativePhone ?? '',
  repemail: data.repemail ?? data.representativeEmail ?? '',

  einduction: Boolean(data.einduction),
  seamless: Boolean(data.seamless),
  postOfficeEntry: Boolean(data.postOfficeEntry),
  postOfficeEntryLocation: data.postOfficeEntryLocation ?? '',

  company: data.company?._id ?? data.company ?? user?.company?._id ?? '',
});
      } catch (err) {
        toast.error(
          err.response?.data?.message || 'Unable to load mail owner'
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchMailOwner();
  }, [id, isEdit]);


 const handleChange = (e) => {
  const { name, value } = e.target;
  let nextValue = value;

  if (name === 'crid') {
    nextValue = value.replace(/\D/g, '').slice(0, 9);
  }

  if (name === 'mid') {
    nextValue = value.replace(/\D/g, '').slice(0, 9);
  }

  if (name === 'zip') {
    nextValue = value.replace(/[^\d-]/g, '').slice(0, 10);
  }

  setFormData(prev => ({
    ...prev,
    [name]: nextValue,
  }));

  if (errors[name]) {
    setErrors(prev => ({
      ...prev,
      [name]: '',
    }));
  }
};

const validate = () => {
  const nextErrors = {};

  if (!formData.providerName.trim()) {
    nextErrors.providerName = 'Company is required';
  }

  if (!formData.address.trim()) {
    nextErrors.address = 'Address 1 is required';
  }

  if (!formData.city.trim()) {
    nextErrors.city = 'City is required';
  }

  if (!formData.state.trim()) {
    nextErrors.state = 'State is required';
  }

  if (!/^\d{5}(-\d{4})?$/.test(formData.zip)) {
    nextErrors.zip = 'Enter a valid ZIP code';
  }

  if (!/^(\d{8}|\d{9})$/.test(formData.crid)) {
    nextErrors.crid = 'CRID must be 8 or 9 digits';
  }

  if (!/^(\d{6}|\d{9})$/.test(formData.mid)) {
    nextErrors.mid = 'MID must be 6 or 9 digits';
  }

  if (!formData.repname.trim()) {
    nextErrors.repname = 'Representative Name is required';
  }

  if (!formData.repphone.trim()) {
    nextErrors.repphone = 'Phone is required';
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.repemail)) {
    nextErrors.repemail = 'Enter a valid email address';
  }

  if (
    formData.postOfficeEntry &&
    !formData.postOfficeEntryLocation.trim()
  ) {
    nextErrors.postOfficeEntryLocation =
      'Select or enter a Post Office of Entry location';
  }

  setErrors(nextErrors);
  return Object.keys(nextErrors).length === 0;
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

      // Keep provider/company names consistent.
      name: formData.providerName,
      providerName: formData.providerName,

      // Normalize USPS identifiers.
      crid: String(formData.crid).trim(),
      mid: String(formData.mid).trim(),

      // Keep the associated company.
      company: isEdit
        ? (formData.company?._id ?? formData.company)
        : user?.company?._id,
    };

    let response;

    if (isEdit) {
      response = await api.post('/permits/addmailprovider', {
        ...payload,
        id: formData._id || id,
      });

      toast.success('Mail Provider updated');
    } else {
      response = await api.post('/permits/addmailprovider', payload);

      toast.success('Mail Provider added');
    }

    if (!isEdit && location.state?.returnTo) {
  const savedProvider = buildSavedItem({
    responseData: response.data,
    keys: ['item', 'provider', 'mailprovider', 'mailProvider'],
    payload,
  });

  if (!savedProvider._id) {
    toast.error('Provider was saved, but the API did not return its ID.');
    return;
  }

  returnToCaller(navigate, location, 'mailProvider', savedProvider);
  return;
}

navigate('/permits?tab=mail-providers');
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

//     if (!validate()) return;

//     //setIsSubmitting(true);

//     try {
//     const { mid, ...ownerData } = formData;

// const payload = {
//   ...ownerData,
//   mailerIds: formData.mailerIds.filter(
//     (mid) => mid.trim() !== ''
//   ),
//    ...(!isEdit && { company: user.company?._id }),
//    id:ownerData._id
// };

// console.log(payload);

   
//       if (isEdit) {
//         await api.put(
//           `/permits/updatemailowner`,
//           payload
//         );
//         toast.success('Mail Owner updated');
//       } else {
//         await api.post(
//           `/permits/addmailowner`,
//           payload
//         );
//         toast.success('Mail Owner added');
//       }

//       navigate('/permits?mail-providers');
//     } catch (err) {
//       toast.error(
//         err.response?.data?.message || 'Unable to save Mail Owner'
//       );
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

  

  if (isLoading) {
    return (
      <div className="dashboard">
       <p>Loading Mail Provider...</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h1>{isEdit ? 'Edit Mail Provider' : 'Add Mail Provider'}</h1>
          {/* <p>Manage mail owner.</p> */}
        </div>

        <button
          type="button"
          className="btn-primary"
          onClick={() => goBackToCaller(navigate, location, '/permits?tab=mail-providers')}
        >
          ← Back to Mail Providers
        </button>
      </div>

<form onSubmit={handleSubmit} className="space-y-6">
  {showValidationSummary && (
    <ValidationSummary
      errors={errors}
      apiErrors={apiErrors}
      apiErrorsTitle="Save Errors"
      apiErrorsSubtitle="The Mail Provider could not be saved. Review the messages below."
      title="Please review this Mail Provider"
      message="Correct the following items before saving."
      fieldLabels={FIELD_LABELS}
      fieldTargets={FIELD_TARGETS}
      onDismiss={() => setShowValidationSummary(false)}
    />
  )}

  {/* Company information */}
  <section className="card">
    <div className="card-header">
      <h2>Company Information</h2>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 ">
      <Field
        label="Company"
        name="providerName"
        required
        maxLength={80}
        placeholder="Company name"
        value={formData.providerName}
        onChange={handleChange}
        error={errors.providerName}
      />

</div>

<div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-3">
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
        placeholder="Suite, unit, etc."
        value={formData.address2}
        onChange={handleChange}
        error={errors.address2}
      />
      </div>
<div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-3" >
      <Field
        label="City"
        name="city"
        required
        maxLength={40}
        value={formData.city}
        onChange={handleChange}
        error={errors.city}
      />

      <div className="form-group">
        <label htmlFor="state">State <span className="required">*</span></label>
        <select
          id="state"
          name="state"
          value={formData.state}
          onChange={handleChange}
        >
          <option value="">Select State</option>
          {[
            ['AL', 'Alabama'], ['AK', 'Alaska'],
            ['AZ', 'Arizona'], ['AR', 'Arkansas'],
            ['CA', 'California'], ['CO', 'Colorado'],
            ['CT', 'Connecticut'], ['DE', 'Delaware'],
            ['FL', 'Florida'], ['GA', 'Georgia'],
            ['HI', 'Hawaii'], ['ID', 'Idaho'],
            ['IL', 'Illinois'], ['IN', 'Indiana'],
            ['IA', 'Iowa'], ['KS', 'Kansas'],
            ['KY', 'Kentucky'], ['LA', 'Louisiana'],
            ['ME', 'Maine'], ['MD', 'Maryland'],
            ['MA', 'Massachusetts'], ['MI', 'Michigan'],
            ['MN', 'Minnesota'], ['MS', 'Mississippi'],
            ['MO', 'Missouri'], ['MT', 'Montana'],
            ['NE', 'Nebraska'], ['NV', 'Nevada'],
            ['NH', 'New Hampshire'], ['NJ', 'New Jersey'],
            ['NM', 'New Mexico'], ['NY', 'New York'],
            ['NC', 'North Carolina'], ['ND', 'North Dakota'],
            ['OH', 'Ohio'], ['OK', 'Oklahoma'],
            ['OR', 'Oregon'], ['PA', 'Pennsylvania'],
            ['RI', 'Rhode Island'], ['SC', 'South Carolina'],
            ['SD', 'South Dakota'], ['TN', 'Tennessee'],
            ['TX', 'Texas'], ['UT', 'Utah'],
            ['VT', 'Vermont'], ['VA', 'Virginia'],
            ['WA', 'Washington'], ['WV', 'West Virginia'],
            ['WI', 'Wisconsin'], ['WY', 'Wyoming'],
          ].map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
        {errors.state && <p className="field-error">{errors.state}</p>}
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

  {/* Postal identifiers */}
  <section className="card">
    <div className="card-header">
      <h2>Postal Information</h2>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      <Field
        label="CRID"
        name="crid"
        required
        inputMode="numeric"
        maxLength={9}
        placeholder="USPS CRID"
        value={formData.crid}
        onChange={handleChange}
        error={errors.crid}
      />

      <Field
        label="MID"
        name="mid"
        required
        inputMode="numeric"
        maxLength={9}
        placeholder="6 or 9 digit MID"
        value={formData.mid}
        onChange={handleChange}
        error={errors.mid}
      />
    </div>
  </section>

  {/* Representative */}
  <section className="card">
    <div className="card-header">
      <h2>Representative Information</h2>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      <Field
        label="Representative Name"
        name="repname"
        required
        maxLength={80}
        placeholder="Full name"
        value={formData.repname}
        onChange={handleChange}
        error={errors.repname}
      />

      <Field
        label="Phone"
        name="repphone"
        required
        type="tel"
        placeholder="Phone number"
        value={formData.repphone}
        onChange={handleChange}
        error={errors.repphone}
      />

      <Field
        label="Email"
        name="repemail"
        required
        type="email"
        placeholder="name@company.com"
        value={formData.repemail}
        onChange={handleChange}
        error={errors.repemail}
      />
    </div>
  </section>

  {/* Service options */}
  <section className="card">
    <div className="card-header">
      <h2>Service Options</h2>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      {[
        ['einduction', 'eInduction'],
        ['seamless', 'Seamless Acceptance']
      ].map(([name, label]) => (
        <label
          key={name}
          className="flex items-center gap-3 cursor-pointer"
        >
          <input
            type="checkbox"
            name={name}
            checked={Boolean(formData[name])}
            onChange={(e) => {
              const checked = e.target.checked;
              setFormData(prev => ({
                ...prev,
                [name]: checked,
              }));
            }}
          />
          <span>{label}</span>
        </label>
      ))}
    </div>


      <div className="mt-5">
        <label>Post Office of Entry Location <span className="required">*</span></label>
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
 
  </section>

 <div className="suppression-form-footer">
          <button
            type="button"
            className="suppression-cancel-button"
             onClick={() => goBackToCaller(navigate, location, '/permits?tab=mail-providers')}
        
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
                ? 'Update Mail Providers'
                : 'Save Mail Providers'}
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
          ? 'Update Mail Provider'
          : 'Save Mail Provider'}
    </button>
  </div> */}
</form>
    </div>
  );
};

export default MailProvider;