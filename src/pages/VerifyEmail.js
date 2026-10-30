
import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import axios from "axios";
import "./VerifyEmail.css";
import api from "../Helpers/Api";



export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("Verifying your email address...");
  const requestStarted = useRef(false);

  useEffect(() => {
    // Prevent duplicate requests during React Strict Mode development.
    if (requestStarted.current) return;
    requestStarted.current = true;

    const verify = async () => {
      const email = searchParams.get("email");
      const otp = searchParams.get("otp");
      const user = searchParams.get("user");

      if (!email || !otp || !user) {
        setStatus("error");
        setMessage(
          "This verification link is incomplete. Please use the link in your registration email."
        );
        return;
      }

      try {
        const response = await api.post(
          `/verify/verify-email`,
          { email, otp, user }
        );

        setStatus("success");
        setMessage(
          response.data?.message || "Your email has been verified successfully."
        );
      } catch (error) {
        setStatus("error");
        setMessage(
          error.response?.data?.message ||
            "We couldn't verify your email. The link may have expired."
        );
      }
    };

    verify();
  }, [searchParams]);

  return (
    <main className="verify-page">
      <section className="verify-card">
        <div className={`verify-icon ${status}`}>
          {status === "loading" && (
            <span className="verify-spinner" />
          )}

          {status === "success" && "✓"}
          {status === "error" && "!"}
        </div>

        <h1>
          {status === "loading" && "Verifying Your Email"}
          {status === "success" && "Email Verified!"}
          {status === "error" && "Verification Unsuccessful"}
        </h1>

        <p className="verify-message">{message}</p>

        {status === "success" && (
          <Link to="/login" className="verify-button">
            Continue to Login
          </Link>
        )}

        {status === "error" && (
          <div className="verify-actions">
            <Link to="/login" className="verify-button">
              Go to Login
            </Link>
            <p className="verify-help">
              If your link expired, you may need to request a new verification
              email.
            </p>
          </div>
        )}

        {status === "loading" && (
          <p className="verify-help">
            Please wait while we confirm your account.
          </p>
        )}

        <div className="verify-brand">
          Lightning Presort Services
        </div>
      </section>
    </main>
  );
}
