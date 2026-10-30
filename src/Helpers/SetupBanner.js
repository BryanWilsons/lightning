import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './SetupBanner.css';

export default function SetupBanner() {
  const { user } = useAuth();
  const [dismissed, setDismissed] = useState(false);

  // Decide what is still missing
  // Adjust these checks to match your real company / user fields
  const missingItems = [];

  if (!user?.company?.crid) {
    missingItems.push({
      label: 'Company profile',
      description: 'Add your company name and business details',
      path: '/company/settings',
    });
  }

//   if (!user?.isAccountVerified) {
//     missingItems.push({
//       label: 'Verify email',
//       description: 'Confirm your email address',
//       path: 'account',
//     });
//   }

  // Example extra checks you can enable later:
  // if (!user?.phone) missingItems.push({ label: 'Phone number', ... });
  // if (!user?.address) missingItems.push({ label: 'Business address', ... });

  // Nothing missing or user dismissed it
  if (missingItems.length === 0 || dismissed) {
    return null;
  }

  const primaryAction = missingItems[0];

  return (
    <div className="setup-banner">
      <div className="setup-banner-content">
        <div className="setup-banner-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
        </div>

        <div className="setup-banner-text">
          <div className="setup-banner-title">
            Finish setting up your account
          </div>
          <div className="setup-banner-desc">
            {missingItems.length === 1
              ? missingItems[0].description
              : `${missingItems.length} items remaining to fully activate your account`}
          </div>
        </div>

        <div className="setup-banner-actions">
          <Link to={primaryAction.path} className="setup-banner-btn">
            {missingItems.length === 1 ? 'Complete now' : 'Continue setup'}
          </Link>

          <button
            type="button"
            className="setup-banner-dismiss"
            onClick={() => setDismissed(true)}
            aria-label="Dismiss"
          >
            ×
          </button>
        </div>
      </div>

      {/* Optional progress dots when multiple items */}
      {missingItems.length > 1 && (
        <div className="setup-banner-steps">
          {missingItems.map((item, index) => (
            <Link
              key={item.label}
              to={item.path}
              className={`setup-step ${index === 0 ? 'current' : ''}`}
            >
              <span className="step-number">{index + 1}</span>
              <span className="step-label">{item.label}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}