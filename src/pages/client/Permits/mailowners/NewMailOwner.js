import React, { useState, useEffect } from 'react';
import { useNavigate, useParams,useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import './MailOwners.css'
import { useAuth } from '../../../../context/AuthContext';
import api, { setAccessToken, setTokenHandlers } from "../../../../Helpers/Api";
import { goBackToCaller } from '../../../../Helpers/returnToCaller';
import ValidationSummary from '../../../../Helpers/Valiodationsummary'; // adjust path

const FIELD_LABELS = {
  companyName: 'Company Name',
  mailOwnerName: 'USPS Registered Name',
  address: 'Address 1',
  city: 'City',
  state: 'State',
  zip: 'ZIP',
  crid: 'CRID',
  mailerIds: 'Mailer IDs (MIDs)',
};

// values are the `name` attribute of the input to focus
const FIELD_TARGETS = {
  companyName: 'companyName',
  mailOwnerName: 'mailOwnerName',
  address: 'address',
  city: 'city',
  state: 'state',
  zip: 'zip',
  crid: 'crid',
  mailerIds: 'mailerIds-0', // your MID inputs are named mailerIds-{index}
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
  permitName: '',
  owner: '',
  company: '',
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
   mailerIds: [''],
    mailOwnerName: '',
  companyName: '',
  crid: '',
  nonprofitnumber: '',
  anywhere: '',
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

const MailOwner = () => {
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
console.log(api)
    const fetchMailOwner = async () => {
      try {
        const { data } = await api.post(`/permits/getmailowner`,{id:param.id});
 console.log(data)
       setFormData({
  ...EMPTY,
  ...data,
  mailOwnerName: data.mailOwnerName ?? '',
  companyName: data.companyName ?? '',
  address: data.address ?? '',
  address2: data.address2 ?? '',
  city: data.city ?? '',
  state: data.state ?? 'FL',
  zip: data.zip ?? '',
  crid: data.crid ?? '',
  mailerIds:
    Array.isArray(data.mailerIds) && data.mailerIds.length
      ? data.mailerIds.map(String)
      : data.mid
        ? [String(data.mid)]
        : [''],
  nonprofitnumber: data.nonprofitnumber ?? '',
  anywhere: data.anywhere ?? '',
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

  const handleMidChange = (index, value) => {
  const nextValue = value.replace(/\D/g, '').slice(0, 9);

  setFormData((prev) => {
    const mailerIds = [...prev.mailerIds];
    mailerIds[index] = nextValue;

    return { ...prev, mailerIds };
  });

  setErrors((prev) => ({
    ...prev,
    mailerIds: '',
  }));
};

const addMid = () => {
  setFormData((prev) => ({
    ...prev,
    mailerIds: [...prev.mailerIds, ''],
  }));
};

const removeMid = (index) => {
  setFormData((prev) => ({
    ...prev,
    mailerIds: prev.mailerIds.filter((_, i) => i !== index),
  }));

  setErrors((prev) => ({
    ...prev,
    mailerIds: '',
  }));
};


  const handleChange = (e) => {
    const { name, value } = e.target;
    let nextValue = value;

    if (name === 'crid') {
      nextValue = value.replace(/\D/g, '').slice(0, 8);
    }

    if (name === 'mid') {
      nextValue = value.replace(/\D/g, '').slice(0, 9);
    }

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

    if (!formData.mailOwnerName.trim()) {
      nextErrors.mailOwnerName = 'Mail Owner Name is required';
    }

    if (!formData.companyName.trim()) {
      nextErrors.companyName = 'Company Name is required';
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

    if (!/^\d{8}$/.test(formData.crid)) {
      nextErrors.crid = 'CRID must be exactly 8 digits';
    }

const enteredMids = (formData.mailerIds || [])
  .map((mid) => mid.trim())
  .filter(Boolean);

 if (
  enteredMids.some((mid) => !/^(\d{6}|\d{9})$/.test(mid))
) {
  nextErrors.mailerIds = 'Each MID must be exactly 6 or 9 digits';
} else if (
  new Set(enteredMids).size !== enteredMids.length
) {
  nextErrors.mailerIds = 'Duplicate MIDs are not allowed';
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

  // Validate using your existing validation function
  if (!validate()) {
    setShowValidationSummary(true);
    showSummary();
    return;
  }

  try {
    setIsSubmitting(true);

    const payload = {
      ...formData,
      mailerIds: (formData.mailerIds || []).filter(
        (id) => id && id.trim() !== ''
      ),
    };

    // Add company ID when creating
    if (!isEdit) {
      payload.company = user.company._id;
    }

    let response;

    // Save Mail Owner
    if (isEdit) {
      response = await api.put('/permits/updatemailowner', payload);
      toast.success('Mail Owner updated successfully!');
    } else {
      response = await api.post('/permits/addmailowner', payload);
      toast.success('Mail Owner created successfully!');
    }

    // Return to the page that opened this form
    if (!isEdit && location.state?.returnTo) {
      const responseData = response.data;

    const returnedOwner =
  responseData?.mailowner ||
  responseData?.mailOwner ||
  responseData?.owner ||
  responseData?.data?.mailowner ||
  responseData?.data?.mailOwner ||
  responseData?.data?.owner ||
  responseData?.data ||
  {};

      const savedMailOwner = {
        ...formData,
        ...payload,
        ...returnedOwner,

        _id:
          returnedOwner?._id ||
          returnedOwner?.id ||
          responseData?._id ||
          responseData?.id ||
          '',

        crid: String(
          returnedOwner?.crid ??
          returnedOwner?.CRID ??
          payload.crid ??
          ''
        ),

        companyName:
          returnedOwner?.companyName ||
          payload.companyName ||
          '',

        mailOwnerName:
          returnedOwner?.mailOwnerName ||
          payload.mailOwnerName ||
          '',
      };

      if (!savedMailOwner._id) {
        toast.error(
          'Mail Owner was saved, but the API did not return its ID.'
        );
        return;
      }

      navigate(location.state.returnTo, {
        replace: true,
        state: {
          returnData: location.state.returnData,
          createdItem: {
            type: location.state.returnType || 'mailOwner',
            item: savedMailOwner,
          },
        },
      });

      return;
    }

    // Normal navigation
    navigate('/permits?tab=mail-owners');

  } catch (error) {
    console.error('Mail Owner save error:', error);

    toast.error(
      error.response?.data?.message ||
      'Unable to save Mail Owner.'
    );

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

//       navigate('/permits?tab=mail-owners');
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
        <p>Loading Mail Owner...</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h1>{isEdit ? 'Edit Mail Owner' : 'Add Mail Owner'}</h1>
          {/* <p>Manage mail owner.</p> */}
        </div>

        <button
          type="button"
          className="btn-primary"
      onClick={() => goBackToCaller(navigate, location, '/permits?tab=mail-owners')}
        >
          ← Back to Mail Owners
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
          {showValidationSummary && (
    <ValidationSummary
      errors={errors}
      apiErrors={apiErrors}
      apiErrorsTitle="Save Errors"
      apiErrorsSubtitle="The Mail Owner could not be saved. Review the messages below."
      title="Please review this Mail Owner"
      message="This Mail Owner hasn't been saved yet. Please correct the following items."
      fieldLabels={FIELD_LABELS}
      fieldTargets={FIELD_TARGETS}
      onDismiss={() => setShowValidationSummary(false)}
    />
  )}
        {/* Mail Owner Information */}
        <section className="card">
          <div className="card-header">
            <h2>Mail Owner Information</h2>
          </div>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
<Field
              label="Company Name"
              name="companyName"
              required
              maxLength={80}
              placeholder="Legal business name"
              value={formData.companyName}
onChange={handleChange}
error={errors.companyName}
            />

         
            <Field
              label="USPS Registered Name"
              name="mailOwnerName"
              required
              maxLength={80}
              placeholder="Enter mail owner name"
              value={formData.mailOwnerName}
onChange={handleChange}
error={errors.mailOwnerName}
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
              >
                <option value="">Select State</option>
                <option value="FL">Florida</option>
                <option value="Alabama">Alabama</option>
                <option value="Alaska">Alaska</option>
                <option value="Arizona">Arizona</option>
                <option value="Arkansas">Arkansas</option>
                <option value="California">California</option>
                <option value="Colorado">Colorado</option>
                <option value="Connecticut">Connecticut</option>
                <option value="Delaware">Delaware</option>
                <option value="Georgia">Georgia</option>
                <option value="Hawaii">Hawaii</option>
                <option value="Idaho">Idaho</option>
                <option value="Illinois">Illinois</option>
                <option value="Indiana">Indiana</option>
                <option value="Iowa">Iowa</option>
                <option value="Kansas">Kansas</option>
                <option value="Kentucky">Kentucky</option>
                <option value="Louisiana">Louisiana</option>
                <option value="Maine">Maine</option>
                <option value="Maryland">Maryland</option>
                <option value="Massachusetts">Massachusetts</option>
                <option value="Michigan">Michigan</option>
                <option value="Minnesota">Minnesota</option>
                <option value="Mississippi">Mississippi</option>
                <option value="Missouri">Missouri</option>
                <option value="Montana">Montana</option>
                <option value="Nebraska">Nebraska</option>
                <option value="Nevada">Nevada</option>
                <option value="New Hampshire">New Hampshire</option>
                <option value="New Jersey">New Jersey</option>
                <option value="New Mexico">New Mexico</option>
                <option value="New York">New York</option>
                <option value="North Carolina">North Carolina</option>
                <option value="North Dakota">North Dakota</option>
                <option value="Ohio">Ohio</option>
                <option value="Oklahoma">Oklahoma</option>
                <option value="Oregon">Oregon</option>
                <option value="Pennsylvania">Pennsylvania</option>
                <option value="Rhode Island">Rhode Island</option>
                <option value="South Carolina">South Carolina</option>
                <option value="South Dakota">South Dakota</option>
                <option value="Tennessee">Tennessee</option>
                <option value="Texas">Texas</option>
                <option value="Utah">Utah</option>
                <option value="Vermont">Vermont</option>
                <option value="Virginia">Virginia</option>
                <option value="Washington">Washington</option>
                <option value="West Virginia">West Virginia</option>
                <option value="Wisconsin">Wisconsin</option>
                <option value="Wyoming">Wyoming</option>
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

        {/* Postal Information */}
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
              placeholder="8-digit CRID"
              value={formData.crid}
onChange={handleChange}
error={errors.crid}
            />

           
<div className="form-group mid-list">
  <div className="mid-list-header">
    <label>Mailer IDs (MIDs)</label>

    <button
      type="button"
      className="btn-secondary"
      onClick={addMid}
    >
      + Add MID
    </button>
  </div>

<div className="mid-list-items">
  {formData.mailerIds?.map((mid, index) => (
    <div className="mid-row" key={index}>
      <input
        type="text"
        name={`mailerIds-${index}`}
        value={mid}
        onChange={(e) => handleMidChange(index, e.target.value)}
        inputMode="numeric"
        maxLength={9}
        placeholder="6 or 9 digit MID"
        aria-label={`Mailer ID ${index + 1}`}
      />

      {formData.mailerIds.length > 1 && (
        <button
          type="button"
          className="btn-remove-mid"
          onClick={() => removeMid(index)}
          aria-label={`Remove Mailer ID ${index + 1}`}
        >
          ×
        </button>
      )}
    </div>
  ))}
</div>
  {errors.mailerIds && (
    <p className="field-error">{errors.mailerIds}</p>
  )}
</div>

            <Field
              label="Nonprofit Authorization #"
              name="nonprofitnumber"
              maxLength={40}
              placeholder="Optional"
              value={formData.nonprofitnumber}
onChange={handleChange}
error={errors.nonprofitnumber}
            />

            <Field
              label="Mail Anywhere Account #"
              name="anywhere"
              maxLength={40}
              placeholder="Optional"
              value={formData.anywhere}
onChange={handleChange}
error={errors.anywhere}
            />
          </div>
        </section>

  <div className="suppression-form-footer">
          <button
            type="button"
            className="suppression-cancel-button"
            onClick={() => goBackToCaller(navigate, location, '/permits?tab=mail-owners')}
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
                ? 'Update Mail Owner'
                : 'Save Mail Owner'}
          </button>
        </div>

      </form>
    </div>
  );
};

export default MailOwner;