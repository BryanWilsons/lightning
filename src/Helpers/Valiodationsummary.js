import React from 'react';
import { AlertCircle, ArrowRight, X } from 'lucide-react';

/**
 * Reusable validation / API error summary.
 *
 * Props
 * - errors:           { fieldName: 'message' }  client-side validation errors
 * - apiErrors:        [{ title, detail }]       server/USPS errors
 * - apiErrorsTitle:   heading for the API error block
 * - apiErrorsSubtitle subtext for the API error block
 * - fieldLabels:      { fieldName: 'Human label' }
 * - fieldTargets:     { fieldName: 'input name attr' }  fields that can be focused
 * - fallbackTargetId: element id to scroll to when a field has no target
 * - onDismiss:        called when the X is clicked
 * - title / message:  header copy
 */
const ValidationSummary = ({
  errors = {},
  apiErrors = [],
  apiErrorsTitle = 'Submission Errors',
  apiErrorsSubtitle = 'The server could not accept this submission. Review the messages below.',
  fieldLabels = {},
  fieldTargets = {},
  fallbackTargetId,
  onDismiss,
  title = 'Please review your submission',
  message = "Your form hasn't been submitted yet. Please correct the following items.",
  id = 'validation-summary',
}) => {
  // Ignore keys that were cleared by setErrors(prev => ({ ...prev, x: undefined }))
  const fieldErrors = Object.entries(errors).filter(([, msg]) => Boolean(msg));
  const total = fieldErrors.length + apiErrors.length;

  if (total === 0) return null;

  const jumpTo = (field) => {
    const targetName = fieldTargets[field];

    if (targetName) {
      const el = document.querySelector(`[name="${targetName}"]`);
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el?.focus?.({ preventScroll: true });
    } else if (fallbackTargetId) {
      document
        .getElementById(fallbackTargetId)
        ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <div
      id={id}
      role="alert"
      aria-live="assertive"
      className="relative overflow-hidden rounded-xl border border-red-200 bg-gradient-to-br from-red-50 via-white to-rose-50 shadow-md"
    >
      <div className="h-1.5 bg-gradient-to-r from-red-500 to-rose-400" />

      <div className="p-5 sm:p-6">
        {/* Header */}
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600 ring-1 ring-red-200">
            <AlertCircle className="h-6 w-6" aria-hidden="true" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-lg font-bold text-red-900">{title}</h3>
              <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-1 text-xs font-bold text-red-700">
                {total} {total === 1 ? 'issue' : 'issues'}
              </span>
            </div>
            <p className="mt-1 text-sm text-red-800">{message}</p>
          </div>

          {onDismiss && (
            <button
              type="button"
              onClick={onDismiss}
              className="rounded-lg p-1.5 text-red-400 transition hover:bg-red-100 hover:text-red-700"
              aria-label="Dismiss validation summary"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          )}
        </div>

        {/* Field errors */}
        {fieldErrors.length > 0 && (
          <div className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-2">
            {fieldErrors.map(([field, msg]) => (
              <button
                key={field}
                type="button"
                onClick={() => jumpTo(field)}
                className="group flex items-center gap-3 rounded-lg border border-red-100 bg-white/90 px-3.5 py-3 text-left shadow-sm transition-all duration-200 hover:border-red-300 hover:bg-red-50 hover:shadow"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-600 group-hover:bg-red-100">
                  <AlertCircle className="h-4 w-4" aria-hidden="true" />
                </span>

                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold text-slate-800">
                    {fieldLabels[field] || field}
                  </span>
                  <span className="mt-0.5 block text-xs text-red-600">{msg}</span>
                </span>

                <ArrowRight
                  className="h-4 w-4 shrink-0 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-red-600"
                  aria-hidden="true"
                />
              </button>
            ))}
          </div>
        )}

        {/* API errors */}
        {apiErrors.length > 0 && (
          <div className="mt-5 border-t border-red-200 pt-5">
            <div className="mb-3 flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-100 text-red-700">
                <AlertCircle size={18} />
              </span>
              <div>
                <h4 className="font-bold text-red-900">{apiErrorsTitle}</h4>
                <p className="text-sm text-red-700">{apiErrorsSubtitle}</p>
              </div>
            </div>

            <div className="space-y-3">
              {apiErrors.map((item, index) => (
                <div
                  key={`${item.title}-${index}`}
                  className="flex items-start gap-3 rounded-lg border border-red-200 bg-white p-4 shadow-sm"
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-red-100 text-sm font-bold text-red-700">
                    !
                  </span>
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-800">{item.title}</p>
                    <p className="mt-1 text-sm leading-5 text-slate-600">{item.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {fieldErrors.length > 0 && (
          <div className="mt-4 flex items-center gap-2 border-t border-red-100 pt-4 text-xs text-slate-500">
            <span className="h-2 w-2 rounded-full bg-red-500" />
            Select any issue above to jump to the relevant field.
          </div>
        )}
      </div>
    </div>
  );
};

export default ValidationSummary;