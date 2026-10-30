import { useState } from 'react';
import { Link } from 'react-router-dom';
import Logo from '../Assets/MiXjX.jpg';
import './Login.css'; // reuse the same styles

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Replace with your actual API call
      // await api.post('/auth/forgot-password', { email });
      
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1200));
      
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        {/* Logo */}
        <div className="login-logo">
          <img src={Logo} alt="Lightning Presort" />
        </div>

        {!success ? (
          <>
            <div className="login-header">
              <h1>Reset your password</h1>
              <p>Enter your email and we’ll send you a reset link</p>
            </div>

            <form onSubmit={handleSubmit} className="login-form" noValidate>
              {error && (
                <div className="login-error" role="alert">
                  {error}
                </div>
              )}

              <div className="form-group">
                <label htmlFor="email">Email address</label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  autoComplete="email"
                  required
                  disabled={loading}
                />
              </div>

              <button type="submit" className="login-btn" disabled={loading}>
                {loading ? <span className="spinner"></span> : 'Send reset link'}
              </button>
            </form>

            <div className="login-footer">
              <p>
                Remember your password?{' '}
                <Link to="/login">Back to sign in</Link>
              </p>
            </div>
          </>
        ) : (
          /* Success State */
          <div className="success-state">
            <div className="success-icon">
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#16a34a"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>

            <h1>Check your email</h1>
            <p>
              We’ve sent a password reset link to<br />
              <strong>{email}</strong>
            </p>

            <p className="success-note">
              Didn’t receive the email? Check your spam folder or{' '}
              <button
                type="button"
                className="resend-link"
                onClick={() => {
                  setSuccess(false);
                  setEmail('');
                }}
              >
                try another email
              </button>
            </p>

            <Link to="/login" className="login-btn" style={{ marginTop: 24, textAlign: 'center', textDecoration: 'none' }}>
              Back to sign in
            </Link>
          </div>
        )}
      </div>

      <div className="login-bg-shape"></div>
    </div>
  );
}