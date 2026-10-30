
import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Logo from '../Assets/image1_5a7hECYB (1).jpg';
import './CreateAccount.css';
import axios from 'axios';
import api from '../Helpers/Api';

const packages = [
  { id: 'basic', name: 'Basic' },
  { id: 'pro', name: 'Pro' },
  { id: 'enterprise', name: 'Enterprise' },
];

const initialForm = {
  businessName: '',
  contactName: '',
  contactEmail: '',
  contactPhone: '',
  packageId: '',
  password: '',
  confirmPassword: '',
};

export default function CreateAccount({ onSubmit }) {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const fieldRefs = useRef({});

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: '',
    }));

    setError('');
  };

  const validateForm = () => {
    const newErrors = {};

    if (!form.businessName.trim()) {
      newErrors.businessName = 'Legal business name is required.';
    }

    if (!form.password) {
  newErrors.password = 'Password is required.';
} else if (form.password.length < 8) {
  newErrors.password = 'Password must be at least 8 characters.';
}

if (!form.confirmPassword) {
  newErrors.confirmPassword = 'Please confirm your password.';
} else if (form.password !== form.confirmPassword) {
  newErrors.confirmPassword = 'Passwords do not match.';
}

    if (!form.contactName.trim()) {
      newErrors.contactName = 'Administrator name is required.';
    }

    if (!form.contactEmail.trim()) {
      newErrors.contactEmail = 'Administrator email is required.';
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.contactEmail.trim())
    ) {
      newErrors.contactEmail = 'Enter a valid email address.';
    }

    if (!form.contactPhone.trim()) {
      newErrors.contactPhone = 'Administrator phone number is required.';
    } else if (
      form.contactPhone.trim().replace(/\D/g, '').length < 7
    ) {
      newErrors.contactPhone = 'Enter a valid phone number.';
    }

    if (!form.packageId) {
      newErrors.packageId = 'Please select one package.';
    }

    setErrors(newErrors);

 const firstInvalidField = [
  'businessName',
  'contactName',
  'contactEmail',
  'contactPhone',
  'password',
  'confirmPassword',
  'packageId',
].find((name) => newErrors[name]);

    if (firstInvalidField) {
      fieldRefs.current[firstInvalidField]?.focus();
      return false;
    }

    return true;
  };




const handleSubmit = async (e) => {
  e.preventDefault();
  setError("");

  if (!validateForm()) return;

  setLoading(true);

  try {
 const payload = {
  company: form.businessName.trim(),
  name: form.contactName.trim(),
  email: form.contactEmail.trim().toLowerCase(),
  phone: form.contactPhone.trim(),
  password: form.password,
  plan: form.packageId,
  terms: true,
};

    const response = await api.post(
      `/verify/create`,
      payload
    );

    // Registration succeeded; backend should have sent the email.
    console.log(
      response.data.message ||
      "Account created! Check your email for the verification link."
    );
  } catch (err) {
    setError(
      err.response?.data?.message ||
      "Unable to create the client account. Please try again."
    );
  } finally {
    setLoading(false);
  }
};


  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  //   setError('');

  //   if (!validateForm()) {
  //     return;
  //   }

  //   setLoading(true);

  //   try {
  //     const payload = {
  //       businessName: form.businessName.trim(),
  //       contactName: form.contactName.trim(),
  //       contactEmail: form.contactEmail.trim(),
  //       contactPhone: form.contactPhone.trim(),
  //       packageId: form.packageId,
  //       accountRole: 'admin',
  //     };

  //     if (onSubmit) {
  //       await onSubmit(payload);
  //     } else {
  //       console.log('Create client account:', payload);
  //     }
  //   } catch (err) {
  //     setError(
  //       err.response?.data?.message ||
  //       'Unable to create the client account. Please try again.'
  //     );
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  return (
    <div className="create-account-page">
      <div className="create-account-card">

        <div className="create-account-logo">
          <img src={Logo} alt="Lightning Presort" />
        </div>

        <div className="create-account-header">
          <h1>Create an account</h1>
          <p>
            Set up your business account with Lightning Presort
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="create-account-form"
          noValidate
        >
          {error && (
            <div className="create-account-error" role="alert">
              {error}
            </div>
          )}

          <div className="create-form-group">
            <label htmlFor="businessName">
              Legal Business Name With USPS <span className="required-star">*</span>
            </label>

            <input
              ref={(el) => {
                fieldRefs.current.businessName = el;
              }}
              id="businessName"
              name="businessName"
              type="text"
              value={form.businessName}
              onChange={handleChange}
              placeholder="Your legal business name"
              autoComplete="organization"
              maxLength={150}
              required
              disabled={loading}
              aria-invalid={!!errors.businessName}
              aria-describedby={
                errors.businessName ? 'businessName-error' : undefined
              }
              className={errors.businessName ? 'input-error' : ''}
            />

            {errors.businessName && (
              <span id="businessName-error" className="field-error">
                {errors.businessName}
              </span>
            )}
          </div>

          <div className="admin-section">
            <div className="admin-section-heading">
              <div className="admin-icon" aria-hidden="true">
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="8" r="4" />
                  <path d="M5 21v-2a7 7 0 0 1 14 0v2" />
                </svg>
              </div>

              <div>
                <h2>Primary Account Administrator</h2>
                <p>
                  This contact will be the main administrator
                  for the business account.
                </p>
              </div>
            </div>

            <div className="admin-badge">
              <span className="admin-badge-dot" />
              ACCOUNT ADMIN
            </div>

            <div className="create-form-group">
              <label htmlFor="contactName">
                Administrator Full Name{' '}
                <span className="required-star">*</span>
              </label>

              <input
                ref={(el) => {
                  fieldRefs.current.contactName = el;
                }}
                id="contactName"
                name="contactName"
                type="text"
                value={form.contactName}
                onChange={handleChange}
                placeholder="First and last name"
                autoComplete="name"
                maxLength={150}
                required
                disabled={loading}
                aria-invalid={!!errors.contactName}
                aria-describedby={
                  errors.contactName ? 'contactName-error' : undefined
                }
                className={errors.contactName ? 'input-error' : ''}
              />

              {errors.contactName && (
                <span id="contactName-error" className="field-error">
                  {errors.contactName}
                </span>
              )}
            </div>

            <div className="create-form-group">
              <label htmlFor="contactEmail">
                Administrator Email Address{' '}
                <span className="required-star">*</span>
              </label>

              <input
                ref={(el) => {
                  fieldRefs.current.contactEmail = el;
                }}
                id="contactEmail"
                name="contactEmail"
                type="email"
                value={form.contactEmail}
                onChange={handleChange}
                placeholder="you@company.com"
                autoComplete="email"
                maxLength={254}
                required
                disabled={loading}
                aria-invalid={!!errors.contactEmail}
                aria-describedby={
                  errors.contactEmail ? 'contactEmail-error' : undefined
                }
                className={errors.contactEmail ? 'input-error' : ''}
              />

              {errors.contactEmail && (
                <span id="contactEmail-error" className="field-error">
                  {errors.contactEmail}
                </span>
              )}
            </div>



<div className="create-form-group">
  <label htmlFor="password">
    Password <span className="required-star">*</span>
  </label>

  <input
    ref={(el) => {
      fieldRefs.current.password = el;
    }}
    id="password"
    name="password"
    type="password"
    value={form.password}
    onChange={handleChange}
    placeholder="Create a password (minimum 8 characters)"
    autoComplete="new-password"
    minLength={8}
    required
    disabled={loading}
    aria-invalid={!!errors.password}
    aria-describedby={errors.password ? 'password-error' : undefined}
    className={errors.password ? 'input-error' : ''}
  />

  {errors.password && (
    <span id="password-error" className="field-error">
      {errors.password}
    </span>
  )}
</div>

<div className="create-form-group">
  <label htmlFor="confirmPassword">
    Confirm Password <span className="required-star">*</span>
  </label>

  <input
    ref={(el) => {
      fieldRefs.current.confirmPassword = el;
    }}
    id="confirmPassword"
    name="confirmPassword"
    type="password"
    value={form.confirmPassword}
    onChange={handleChange}
    placeholder="Re-enter your password"
    autoComplete="new-password"
    required
    disabled={loading}
    aria-invalid={!!errors.confirmPassword}
    aria-describedby={
      errors.confirmPassword ? 'confirmPassword-error' : undefined
    }
    className={errors.confirmPassword ? 'input-error' : ''}
  />

  {errors.confirmPassword && (
    <span id="confirmPassword-error" className="field-error">
      {errors.confirmPassword}
    </span>
  )}
</div>
            <div className="create-form-group">
              <label htmlFor="contactPhone">
                Administrator Phone Number{' '}
                <span className="required-star">*</span>
              </label>

              <input
                ref={(el) => {
                  fieldRefs.current.contactPhone = el;
                }}
                id="contactPhone"
                name="contactPhone"
                type="tel"
                value={form.contactPhone}
                onChange={handleChange}
                placeholder="Business phone number"
                autoComplete="tel"
                maxLength={30}
                required
                disabled={loading}
                aria-invalid={!!errors.contactPhone}
                aria-describedby={
                  errors.contactPhone ? 'contactPhone-error' : undefined
                }
                className={errors.contactPhone ? 'input-error' : ''}
              />

              {errors.contactPhone && (
                <span id="contactPhone-error" className="field-error">
                  {errors.contactPhone}
                </span>
              )}
            </div>
          </div>

          <div className="create-package-section">
            <div className="create-package-heading">
              <h2>
                Choose Your Package{' '}
                <span className="required-star">*</span>
              </h2>
              <p>Select one package for your business account.</p>
            </div>

            <div
              className={`create-package-options ${
                errors.packageId ? 'packages-error' : ''
              }`}
              ref={(el) => {
                fieldRefs.current.packageId = el;
              }}
              tabIndex={-1}
              aria-describedby={
                errors.packageId ? 'packageId-error' : undefined
              }
            >
              {packages.map((pkg) => (
                <label
                  key={pkg.id}
                  className={`create-package-option ${
                    form.packageId === pkg.id ? 'selected' : ''
                  }`}
                >
                  <input
                    type="radio"
                    name="packageId"
                    value={pkg.id}
                    checked={form.packageId === pkg.id}
                    onChange={handleChange}
                    disabled={loading}
                    required
                  />

                  <span className="create-package-name">
                    {pkg.name}
                  </span>

                  <span className="create-package-description">
                    Details coming soon
                  </span>
                </label>
              ))}
            </div>

            {errors.packageId && (
              <span id="packageId-error" className="field-error">
                {errors.packageId}
              </span>
            )}
          </div>

          <div className="create-account-note">
            <strong>What happens next?</strong>
            <br />
            The primary contact will be designated as the account
            administrator. Additional business information, addresses,
            and billing details can be added later.
          </div>

          <button
            type="submit"
            className="create-account-btn"
            disabled={loading}
          >
            {loading ? (
              <span className="create-account-spinner" />
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        <div className="create-account-footer">
          <p>
            Already have an account?{' '}
            <Link to="/login">Sign in</Link>
          </p>
        </div>
      </div>

      <div className="create-account-bg-shape" />
    </div>
  );
}
