
import React, { useMemo, useState } from 'react';
import Papa from 'papaparse';
import { toast } from 'react-toastify';
import { Upload, FileSpreadsheet, X, CheckCircle } from 'lucide-react';

const SEED_FIELDS = [
  { value: 'prefix', label: 'Prefix' },
  { value: 'firstName', label: 'First Name', required: true },
  { value: 'middleName', label: 'Middle Name' },
  { value: 'lastName', label: 'Last Name', required: true },
  { value: 'suffix', label: 'Suffix' },
  { value: 'company', label: 'Company' },
  { value: 'address1', label: 'Address 1', required: true },
  { value: 'address2', label: 'Address 2' },
  { value: 'address3', label: 'Address 3' },
  { value: 'city', label: 'City', required: true },
  { value: 'state', label: 'State', required: true },
  { value: 'zip', label: 'ZIP Code', required: true },
  { value: 'email', label: 'Email' }
];

const HEADER_ALIASES = {
  prefix: ['prefix', 'pre', 'title'],
  firstName: ['first name', 'firstname', 'first_name', 'fname', 'given name', 'givenname','first'],
  middleName: ['middle name', 'middlename', 'middle_name', 'mname','middle;'],
  lastName: ['last name', 'lastname', 'last_name', 'lname', 'surname', 'family name','last'],
  suffix: ['suffix', 'sfx'],
  company: ['company', 'business', 'organization', 'organisation', 'company name'],
  address1: [
    'address',
    'address1',
    'address 1',
    'address line 1',
    'street',
    'street1',
    'street address',
    'mailing address'
  ],
  address2: ['address2', 'address 2', 'address line 2', 'street2', 'apt', 'apartment', 'suite'],
  address3: ['address3', 'address 3', 'address line 3', 'street3'],
  city: ['city', 'town', 'municipality'],
  state: ['state', 'st', 'province', 'region'],
  zip: ['zip', 'zipcode', 'zip code', 'postal code', 'postalcode', 'postcode'],
  email: ['email', 'email address', 'e-mail', 'e-mail address']
};

const normalizeHeader = (value) =>
  String(value ?? '')
    .toLowerCase()
    .replace(/[_-]/g, ' ')
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

const emptyMapping = (headers) => headers.map(() => '');

const autoMapHeaders = (headers) => {
  const usedTargets = new Set();

  return headers.map((header) => {
    const normalizedHeader = normalizeHeader(header);

    const match = SEED_FIELDS.find((field) => {
      if (usedTargets.has(field.value)) return false;

      const aliases = HEADER_ALIASES[field.value] || [];
      return aliases.some(
        (alias) => normalizeHeader(alias) === normalizedHeader
      );
    });

    if (!match) return '';

    usedTargets.add(match.value);
    return match.value;
  });
};

export default function CsvSeedMapper({ onImport, isEdit = false }) {
  const [fileName, setFileName] = useState('');
  const [headers, setHeaders] = useState([]);
  const [rows, setRows] = useState([]);
  const [mapping, setMapping] = useState([]);
  const [previewIndex, setPreviewIndex] = useState(0);
  const [loading, setLoading] = useState(false);

  const requiredFields = SEED_FIELDS.filter((field) => field.required);

  const mappedRequiredFields = useMemo(
    () => mapping.filter((value) => requiredFields.some((field) => field.value === value)),
    [mapping]
  );

  const missingMappings = requiredFields.filter(
    (field) => !mapping.includes(field.value)
  );

  const mappedRows = useMemo(() => {
    return rows
      .map((row) => {
        const seed = {};

        SEED_FIELDS.forEach((field) => {
          seed[field.value] = '';
        });

        mapping.forEach((targetField, columnIndex) => {
          if (!targetField) return;
          seed[targetField] = String(row[columnIndex] ?? '').trim();
        });

        return seed;
      })
      .filter((seed) =>
        Object.values(seed).some((value) => String(value).trim() !== '')
      );
  }, [rows, mapping]);

  const previewRow = mappedRows[previewIndex] || mappedRows[0] || {};

  const handleFile = (file) => {
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.csv')) {
      toast.error('Please select a CSV file.');
      return;
    }

    setLoading(true);

    Papa.parse(file, {
      header: false,
      skipEmptyLines: 'greedy',
      dynamicTyping: false,
      complete: (result) => {
        setLoading(false);

        const parsedRows = result.data || [];

        if (parsedRows.length < 2) {
          toast.error('The CSV must contain a header row and at least one data row.');
          return;
        }

        const csvHeaders = parsedRows[0].map((header, index) => {
          const value = String(header ?? '').trim();
          return value || `Column ${index + 1}`;
        });

        const dataRows = parsedRows.slice(1);

        setFileName(file.name);
        setHeaders(csvHeaders);
        setRows(dataRows);
        setMapping(autoMapHeaders(csvHeaders));
        setPreviewIndex(0);

        toast.success(`${dataRows.length} CSV rows loaded. Review the header mappings.`);
      },
      error: (error) => {
        setLoading(false);
        toast.error(error.message || 'Unable to read CSV file.');
      }
    });
  };

  const handleMappingChange = (columnIndex, targetField) => {
    setMapping((current) => {
      const updated = [...current];

      // Do not allow two CSV columns to populate the same destination field.
      if (targetField) {
        updated.forEach((value, index) => {
          if (index !== columnIndex && value === targetField) {
            updated[index] = '';
          }
        });
      }

      updated[columnIndex] = targetField;
      return updated;
    });
  };

  const handleImport = () => {
    if (missingMappings.length) {
      toast.error(
        `Map these required fields first: ${missingMappings.map((field) => field.label).join(', ')}`
      );
      return;
    }

    const requiredKeys = requiredFields.map((field) => field.value);

    const invalidRows = mappedRows
      .map((seed, index) => ({
        rowNumber: index + 2,
        missing: requiredKeys.filter(
          (key) => !String(seed[key] ?? '').trim()
        )
      }))
      .filter((item) => item.missing.length);

    if (invalidRows.length) {
      const firstErrors = invalidRows
        .slice(0, 5)
        .map((item) => `Row ${item.rowNumber}: ${item.missing.join(', ')}`)
        .join('; ');

      toast.error(
        `${invalidRows.length} row(s) are missing required values. ${firstErrors}`,
        { autoClose: 7000 }
      );
      return;
    }

    if (!mappedRows.length) {
      toast.error('There are no addresses to import.');
      return;
    }

 onImport(mappedRows);
clearFile();
  };



  const clearFile = () => {
    setFileName('');
    setHeaders([]);
    setRows([]);
    setMapping([]);
    setPreviewIndex(0);
  };

  const usedFields = (currentColumn) =>
    mapping.filter((value, index) => value && index !== currentColumn);

  return (
    <div className="csv-mapper">
      {!headers.length ? (
        <label className="csv-upload-area">
          <input
            type="file"
            accept=".csv,text/csv"
            hidden
            onChange={(event) => handleFile(event.target.files?.[0])}
          />

          <div className="csv-upload-icon">
            <Upload size={25} />
          </div>

          <strong>{loading ? 'Reading CSV...' : 'Upload a CSV file'}</strong>
          <span>Choose a CSV file to map its columns to your address fields.</span>
          <small>CSV files only</small>
        </label>
      ) : (
        <>
          <div className="csv-file-heading">
            <div className="csv-file-info">
              <FileSpreadsheet size={22} />
              <div>
                <strong>{fileName}</strong>
                <span>{mappedRows.length} records found</span>
              </div>
            </div>

            <button
              type="button"
              className="csv-clear-button"
              onClick={clearFile}
              title="Remove CSV"
            >
              <X size={18} />
              Remove
            </button>
          </div>

          <div className="csv-mapping-heading">
            <div>
              <h3>Match Your CSV Headers</h3>
              <p>
                Match each column in your file to the corresponding suppression
                list field. We have automatically matched headers where possible.
              </p>
            </div>

            <span className="csv-count">
              {mapping.filter(Boolean).length} of {headers.length} mapped
            </span>
          </div>

          <div className="csv-mapping-table-wrap">
            <table className="csv-mapping-table">
              <thead>
                <tr>
                  <th>CSV Header</th>
                  <th>Sample Value</th>
                  <th>Your Field</th>
                </tr>
              </thead>

              <tbody>
                {headers.map((header, columnIndex) => {
                  const sampleValue =
                    rows.find((row) => String(row[columnIndex] ?? '').trim())?.[
                      columnIndex
                    ] ?? '';

                  return (
                    <tr key={columnIndex}>
                      <td>
                        <strong>{header}</strong>
                      </td>

                      <td className="csv-sample-value">
                        {String(sampleValue) || <span>Empty</span>}
                      </td>

                      <td>
                        <select
                          value={mapping[columnIndex] || ''}
                          onChange={(event) =>
                            handleMappingChange(columnIndex, event.target.value)
                          }
                        >
                          <option value="">Ignore this column</option>

                          {SEED_FIELDS.map((field) => {
                            const alreadyUsed = usedFields(columnIndex).includes(
                              field.value
                            );

                            return (
                              <option
                                key={field.value}
                                value={field.value}
                                disabled={alreadyUsed}
                              >
                                {field.label}
                                {field.required ? ' *' : ''}
                              </option>
                            );
                          })}
                        </select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="csv-required-status">
            {missingMappings.length === 0 ? (
              <span className="csv-valid">
                <CheckCircle size={17} />
                All required fields are mapped.
              </span>
            ) : (
              <span className="csv-warning">
                Required fields still need mapping:{' '}
                {missingMappings.map((field) => field.label).join(', ')}
              </span>
            )}
          </div>

          {mappedRows.length > 0 && (
            <div className="csv-preview">
              <div className="csv-preview-heading">
                <div>
                  <h3>Address Preview</h3>
                  <p>Review how the first records will be imported.</p>
                </div>

                <div className="csv-preview-controls">
                  <button
                    type="button"
                    disabled={previewIndex === 0}
                    onClick={() => setPreviewIndex((current) => current - 1)}
                  >
                    Previous
                  </button>

                  <span>
                    {previewIndex + 1} / {mappedRows.length}
                  </span>

                  <button
                    type="button"
                    disabled={previewIndex >= mappedRows.length - 1}
                    onClick={() => setPreviewIndex((current) => current + 1)}
                  >
                    Next
                  </button>
                </div>
              </div>

              <div className="csv-preview-grid">
                {SEED_FIELDS.map((field) => (
                  <div className="csv-preview-field" key={field.value}>
                    <span>{field.label}</span>
                    <strong>{previewRow[field.value] || '—'}</strong>
                  </div>
                ))}
              </div>
            </div>
          )}

       <div className="csv-import-actions">
  <button
    type="button"
    className="csv-cancel-button"
    onClick={clearFile}
  >
    Cancel
  </button>

  {isEdit ? (
    <>
      <button
        type="button"
        className="csv-import-button"
        onClick={() => {
          onImport(mappedRows, 'add');
          clearFile();
        }}
        disabled={!mappedRows.length || missingMappings.length > 0}
      >
        <CheckCircle size={17} />
        Add {mappedRows.length} Addresses
      </button>

      <button
        type="button"
        className="csv-import-button"
        onClick={() => {
          onImport(mappedRows, 'replace');
          clearFile();
        }}
        disabled={!mappedRows.length || missingMappings.length > 0}
      >
        <CheckCircle size={17} />
        Replace Existing
      </button>
    </>
  ) : (
    <button
      type="button"
      className="csv-import-button"
      onClick={() => {
        onImport(mappedRows, 'add');
        clearFile();
      }}
      disabled={!mappedRows.length || missingMappings.length > 0}
    >
      <CheckCircle size={17} />
      Import {mappedRows.length} Addresses
    </button>
  )}
</div>
        </>
      )}
    </div>
  );
}
