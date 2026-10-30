import React from 'react';
import { confirmable, createConfirmation } from 'react-confirm';

const ConfirmDialog = ({ show, proceed, message, title = 'Confirm' }) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">{title}</h3>
        <p className="text-sm text-gray-700 whitespace-pre-line mb-6">{message}</p>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => proceed(false)}
            className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => proceed(true)}
            className="px-4 py-2 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700"
          >
            Yes, continue
          </button>
        </div>
      </div>
    </div>
  );
};

// Make it confirmable
const ConfirmableDialog = confirmable(ConfirmDialog);

// Create the confirm function
export const confirm = createConfirmation(ConfirmableDialog);