
import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Package, Ruler, Scale, Save, Calculator, AlertTriangle } from 'lucide-react';
import axios from 'axios';
import getUSPSSortation from '../../../../util/Sortation';
import './product.css';
import { useAuth } from '../../../../context/AuthContext';
import api from '../../../../Helpers/Api';


import ValidationSummary from '../../../../Helpers/Valiodationsummary';



const FIELD_LABELS = {
  name: 'Product Name',
  sku: 'SKU',
  mailClass: 'Mail Class',
  height: 'Height',
  length: 'Length',
  thickness: 'Thickness',
  weight: 'Weight',
  weightUnit: 'Weight Unit',
  usps: 'USPS Specifications',
};

const FIELD_TARGETS = {
  name: 'name',
  sku: 'sku',
  mailClass: 'mailClass',
  height: 'height',
  length: 'length',
  thickness: 'thickness',
  weight: 'weight',
  weightUnit: 'weightUnit',
};

const parseApiErrors = (error) => {
  const data = error.response?.data;

  let list =
    data?.errors ||
    data?.details?.error?.errors ||
    data?.error?.errors ||
    data?.data?.errors ||
    data?.validationErrors ||
    [];

  if (list && !Array.isArray(list)) {
    list = [list];
  }

  if (list.length > 0) {
    return list.map((item) => ({
      title:
        item?.title ||
        item?.code ||
        item?.error ||
        'Validation Error',
      detail:
        item?.detail ||
        item?.message ||
        item?.description ||
        'This field was rejected.',
    }));
  }

  return [{
    title:
      data?.error ||
      data?.message ||
      'Unable to Save Product',
    detail:
      data?.details?.error?.message ||
      data?.details?.message ||
      (typeof data?.details === 'string' ? data.details : null) ||
      data?.message ||
      error.message ||
      'An unexpected error occurred.',
  }];
};



const Product = ({
  onClose,
  editItemId,
  setReset,
  reset,
  product,
  setProduct,
  setCalcOpen,
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();

  const productId = id || editItemId || product?._id;
  const isEditing = Boolean(productId);

  const [saving, setSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(Boolean(id || editItemId));
  const [errors, setErrors] = useState({});
  const [apiErrors, setApiErrors] = useState([]);
  const [showValidationSummary, setShowValidationSummary] = useState(false);

  const [formData, setFormData] = useState({
    name: product?.name || '',
    sku: product?.sku || '',
    mailShape: product?.mailShape || '',
    aspectRatio: product?.aspectRatio || 0,
    weight: product?.weight ?? '',
    weightUnit: String(product?.weightUnit || 'oz').toLowerCase(),
    thickness: product?.thickness ?? '',
    height: product?.height ?? product?.height ?? '',
    length: product?.length ?? '',
    paperType: product?.paperType || '',
    company: user?.company?._id || null,
    user: user?._id,
    isNonFlexible: product?.isNonFlexible || false,
    isPolybagged: product?.isPolybagged || false,
    isUnevenThickness: product?.isUnevenThickness || false,
    hasLooseItems: product?.hasLooseItems || false,
    mailClass: product?.mailClass || 'First-Class Mail',
    sortation: product?.sortation || '',
  });

  const [sortationResult, setSortationResult] = useState({
    mailShape: '',
    aspectRatio: '',
    parcelWarning: '',
    sortation: '',
  });

  const inputFields = useMemo(() => [
    { name: 'name', label: 'Product Name', required: true },
    { name: 'sku', label: 'SKU', required: false },
  ], []);

  // Load existing product when editing.
  useEffect(() => {
    if (!productId) {
      setIsLoading(false);
      return;
    }

    // Use an already supplied product when available.
    if (
      product &&
      String(product._id) === String(productId)
    ) {
      setFormData((prev) => ({
        ...prev,
        ...product,
        height: product.height ?? product.height ?? '',
        weightUnit: String(product.weightUnit || 'oz').toLowerCase(),
        company: product.company?._id || product.company || user?.company?._id,
        user: product.user?._id || product.user || user?._id,
      }));

      setIsLoading(false);
      return;
    }

    let cancelled = false;

    const fetchProduct = async () => {
      setIsLoading(true);

      try {
        const { data } = await api.post('/products/getproduct', {
          id: productId,
        });

        const p = data.product || data;

        if (cancelled) return;

        setFormData((prev) => ({
          ...prev,
          ...p,
          name: p.name ?? '',
          sku: p.sku ?? '',
          mailShape: p.mailShape ?? '',
          aspectRatio: p.aspectRatio ?? 0,
          weight: p.weight ?? '',
          weightUnit: String(p.weightUnit || 'oz').toLowerCase(),
          thickness: p.thickness ?? '',
          height: p.height ?? p.height ?? '',
          length: p.length ?? '',
          paperType: p.paperType ?? '',
          company: p.company?._id || p.company || user?.company?._id,
          user: p.user?._id || p.user || user?._id,
          isNonFlexible: p.isNonFlexible ?? false,
          isPolybagged: p.isPolybagged ?? false,
          isUnevenThickness: p.isUnevenThickness ?? false,
          hasLooseItems: p.hasLooseItems ?? false,
          mailClass: p.mailClass || 'First-Class Mail',
          sortation: p.sortation || '',
        }));
      } catch (err) {
        console.error('Error loading product:', err);

        toast.error(
          err.response?.data?.message ||
          'Unable to load product.'
        );
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    fetchProduct();

    return () => {
      cancelled = true;
    };
  }, [productId, product, user]);

  const showSummary = () => {
    setShowValidationSummary(true);

    setTimeout(() => {
      document.getElementById('validation-summary')?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }, 100);
  };



  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: '',
    }));
  };

  // ---------------------------------------
  // Validation
  // ---------------------------------------

  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Product name is required.';
    }

    if (!formData.mailClass) {
      newErrors.mailClass = 'Please select a mail class.';
    }

    const dimensions = [
      ['height', 'Height'],
      ['length', 'Length'],
      ['thickness', 'Thickness'],
      ['weight', 'Weight'],
    ];

    dimensions.forEach(([field, label]) => {
      const value = Number(formData[field]);

      if (
        formData[field] === '' ||
        formData[field] === null ||
        !Number.isFinite(value) ||
        value <= 0
      ) {
        newErrors[field] = `${label} must be greater than zero.`;
      }
    });

    
const hasDimensionErrors = [
  'height',
  'length',
  'thickness',
  'weight'
].some(field => newErrors[field]);

if (!hasDimensionErrors && formData.mailClass) {
  const result = calculateSortation();

  if (result.parcelWarning) {
    newErrors.usps = result.parcelWarning;
  }

  if (result.mailShape === 'Parcels') {
    newErrors.usps =
      result.parcelWarning ||
      'Parcels are not handled by this service.';
  }

  if (!result.valid && !newErrors.usps) {
    newErrors.usps =
      'No supported sortation is available for these specifications.';
  }
}


    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  // ---------------------------------------
  // USPS Sortation calculation
  // ---------------------------------------


const calculateSortation = (values = formData) => {
  const height = Number(values.height);
  const length = Number(values.length);
  const thickness = Number(values.thickness);
  const weight = Number(values.weight);

  if (
    !height || height <= 0 ||
    !length || length <= 0 ||
    !thickness || thickness <= 0 ||
    !weight || weight <= 0
  ) {
    return {
      valid: false,
      mailShape: '',
      aspectRatio: '',
      parcelWarning: 'Enter valid dimensions and weight.',
      sortation: ''
    };
  }

  // Convert pounds to ounces before calling the USPS rules.
  const weightOz =
    values.weightUnit.toLowerCase() === 'lbs'
      ? weight * 16
      : weight;

const sortationInput = {
  productHeight: height,
  productLength: length,
  productThickness: thickness,
  productWeight:
    values.weightUnit.toLowerCase() === 'lbs'
      ? weight * 16
      : weight,
  weightUnit: 'oz',
  imBarcode: true,

  // Pass the individual checkbox values
  isPolybagged: values.isPolybagged,
  hasLooseItems: values.hasLooseItems,
  isFlexible: !values.isNonFlexible,
  isUniformThickness: !values.isUnevenThickness,

  presortOnly: false,
  mailClass: values.mailClass,
  quantity: 200,
};
  const result = getUSPSSortation(sortationInput);

  return {
    valid:
      !result.error &&
      !result.sortation?.startsWith('NO AVAILABLE'),

    mailShape: result.selectedCategory || 'N/A',
    aspectRatio: result.aspectRatio || 'N/A',
    parcelWarning: result.error || result.note || '',
    sortation: result.sortation || 'N/A'
  };
};


  // Update the sortation display when relevant fields change.
  useEffect(() => {
    const result = calculateSortation();

    setSortationResult({
      mailShape: result.mailShape,
      aspectRatio: result.aspectRatio,
      parcelWarning: result.parcelWarning,
      sortation: result.sortation,
    });
  }, [formData]);

  // ---------------------------------------
  // Submit
  // ---------------------------------------

const handleSubmit = async (e) => {
  e.preventDefault();

  if (saving) return;

  setApiErrors([]);

  if (!validate()) {
    toast.error('Please correct the errors shown below.');
    showSummary();
    return;
  }

  const result = calculateSortation();

  setSortationResult({
    mailShape: result.mailShape,
    aspectRatio: result.aspectRatio,
    parcelWarning: result.parcelWarning,
    sortation: result.sortation,
  });

  if (!result.valid || result.mailShape === 'Parcels') {
    const message =
      result.parcelWarning ||
      (result.mailShape === 'Parcels'
        ? 'Parcels are not handled in this service.'
        : 'Unable to calculate USPS sortation.');

    setErrors((prev) => ({
      ...prev,
      usps: message,
    }));

    toast.error(message);
    showSummary();
    return;
  }

  const updatedFormData = {
    ...formData,
    name: formData.name.trim(),
    weight: Number(formData.weight),
    height: Number(formData.height),
    height: Number(formData.height),
    length: Number(formData.length),
    thickness: Number(formData.thickness),
    mailShape: result.mailShape,
    aspectRatio: result.aspectRatio,
    sortation: result.sortation,
  };

  const payload = {
    ...updatedFormData,
    ...(productId && { id: productId }),
  };

  setSaving(true);
  setShowValidationSummary(false);

  try {
    const res = await api.post('/products/add', payload);

    toast.success(
      res.data.message ||
      `Product ${isEditing ? 'updated' : 'added'} successfully.`
    );

    setProduct?.(null);
    setReset?.(!reset);

   navigate('/permits?tab=products'); 
  

  } catch (err) {
    console.error('Error submitting product:', err);

    setApiErrors(parseApiErrors(err));

    toast.error('Unable to save. Review the errors below.');

    showSummary();

  } finally {
    setSaving(false);
  }
};


  const opennewcalc = () => {
    onClose?.();
    setCalcOpen?.(true);
  };

  const handleCancel = () => {
    if (onClose) {
      onClose();
    } else {
      navigate('/products');
    }
  };

  // ---------------------------------------
  // Render
  // ---------------------------------------
if (isLoading) {
  return (
    <main className="product-form-page">
      <div className="product-form-container">
        <p>Loading product...</p>
      </div>
    </main>
  );
}
  return (
    <main className="product-form-page">

      <div className="product-form-container">

        {/* Page Header */}

        <div className="product-form-heading">
          <div>
             <h1>{isEditing ? 'Edit Product' : 'Add Product'}</h1>
          </div>
           <button
              type="button"
                      className="btn-primary"

              onClick={  () =>   navigate('/permits?tab=products')
}
            >
              <ArrowLeft size={16} />
              Back to Products
            </button>

        </div>

        <form onSubmit={handleSubmit} noValidate>
{showValidationSummary && (
  <ValidationSummary
    errors={errors}
    apiErrors={apiErrors}
    apiErrorsTitle="Save Errors"
    apiErrorsSubtitle="The Product could not be saved. Review the messages below."
    title="Please review this Product"
    message="This Product hasn't been saved yet. Please correct the following items."
    fieldLabels={FIELD_LABELS}
    fieldTargets={FIELD_TARGETS}
    onDismiss={() => setShowValidationSummary(false)}
  />
)}
          {/* Product Information */}

          <section className="product-form-card">

            <div className="product-form-card-header">
              <div className="product-form-section-icon">
                <Package size={19} />
              </div>

              <div>
                <h2>Product Information</h2>
                <p>Basic information about your product.</p>
              </div>
            </div>

            <div className="product-form-grid">

              {inputFields.map((field) => (
                <div className="product-field" key={field.name}>
                  <label>
                    {field.label}
                    {field.required && (
                      <span className="product-required">*</span>
                    )}
                  </label>

                  <input
                    type="text"
                    name={field.name}
                    value={formData[field.name]}
                    onChange={handleChange}
                    placeholder={`Enter ${field.label.toLowerCase()}`}
                    aria-invalid={Boolean(errors[field.name])}
                    className={errors[field.name] ? 'has-error' : ''}
                    required={field.required}
                  />

                  {errors[field.name] && (
                    <span className="product-field-error">
                      {errors[field.name]}
                    </span>
                  )}
                </div>
              ))}

              <div className="product-field">
                <label>
                  Mail Class <span className="product-required">*</span>
                </label>

                <select
                  name="mailClass"
                  value={formData.mailClass}
                  onChange={handleChange}
                  className={errors.mailClass ? 'has-error' : ''}
                >
                  <option value="First-Class Mail">
                    First-Class Mail
                  </option>
                  <option value="USPS Marketing Mail">
                    USPS Marketing Mail
                  </option>
                </select>

                {errors.mailClass && (
                  <span className="product-field-error">
                    {errors.mailClass}
                  </span>
                )}
              </div>

            </div>
          </section>

          {/* Physical Specifications */}

          <section className="product-form-card">

            <div className="product-form-card-header">
              <div className="product-form-section-icon">
                <Ruler size={19} />
              </div>

              <div>
                <h2>Physical Specifications</h2>
                <p>Enter the dimensions, thickness, and weight.</p>
              </div>
            </div>

            <div className="product-form-grid product-form-grid-four">

              <div className="product-field">
                <label>
                  Height (in) <span className="product-required">*</span>
                </label>

                <input
                  type="number"
                  step="0.01"
                  min="0"
                  name="height"
                  value={formData.height}
                  onChange={handleChange}
                  placeholder="0.00"
                  className={errors.height ? 'has-error' : ''}
                />

                {errors.height && (
                  <span className="product-field-error">{errors.height}</span>
                )}
              </div>

              <div className="product-field">
                <label>
                  Length (in) <span className="product-required">*</span>
                </label>

                <input
                  type="number"
                  step="0.01"
                  min="0"
                  name="length"
                  value={formData.length}
                  onChange={handleChange}
                  placeholder="0.00"
                  className={errors.length ? 'has-error' : ''}
                />

                {errors.length && (
                  <span className="product-field-error">{errors.length}</span>
                )}
              </div>

              <div className="product-field">
                <label>
                  Thickness (in) <span className="product-required">*</span>
                </label>

                <input
                  type="number"
                  step="0.001"
                  min="0"
                  name="thickness"
                  value={formData.thickness}
                  onChange={handleChange}
                  placeholder="0.000"
                  className={errors.thickness ? 'has-error' : ''}
                />

                {errors.thickness && (
                  <span className="product-field-error">
                    {errors.thickness}
                  </span>
                )}
              </div>

              <div className="product-field">
                <label>
                  Weight <span className="product-required">*</span>
                </label>

                <div className="product-weight-input">
                  <input
                    type="number"
                    step="0.001"
                    min="0"
                    name="weight"
                    value={formData.weight}
                    onChange={handleChange}
                    placeholder="0.000"
                    className={errors.weight ? 'has-error' : ''}
                  />

                  <select
                    name="weightUnit"
                    value={formData.weightUnit}
                    onChange={handleChange}
                  >
                    <option value="oz">oz</option>
                    <option value="lbs">lbs</option>
                  </select>
                </div>

                {errors.weight && (
                  <span className="product-field-error">{errors.weight}</span>
                )}
              </div>

            </div>
            

            
            <div className="product-checkbox-grid mt-6">

              {[
                ['isNonFlexible', 'Non-Flexible'],
                ['isPolybagged', 'Polybagged'],
                ['isUnevenThickness', 'Uneven Thickness'],
                ['hasLooseItems', 'Loose Items (Cards, Keys, Other)'],
              ].map(([name, label]) => (
                <label className="product-checkbox-option" key={name}>
                  <input
                    type="checkbox"
                    name={name}
                    checked={formData[name]}
                    onChange={handleChange}
                  />

                  <span>{label}</span>
                </label>
              ))}

            </div>


            <div className="product-sortation-grid mt-6">

              <div className="product-sortation-item">
                <span>Mail Shape</span>
                <strong>{sortationResult.mailShape || '—'}</strong>
              </div>

              <div className="product-sortation-item">
                <span>Aspect Ratio</span>
                <strong>{sortationResult.aspectRatio || '—'}</strong>
              </div>

              <div className="product-sortation-item">
                <span>Sortation</span>
                <strong>{sortationResult.sortation || '—'}</strong>
              </div>

            </div>
          </section>

          {/* Mailing Characteristics */}

       

          {/* USPS Sortation Results */}

          <section className="product-form-card">
            {sortationResult.parcelWarning &&
              sortationResult.parcelWarning !== 'None' && (
                <div className="product-sortation-warning">
                  <AlertTriangle size={19} />

                  <div>
                    <strong>Sortation Notice</strong>
                    <p>{sortationResult.parcelWarning}</p>
                  </div>
                </div>
              )}

            {sortationResult.mailShape === 'Parcels' && (
              <div className="product-sortation-warning">
                <AlertTriangle size={19} />
                <div>
                  <strong>Parcel Warning</strong>
                  <p>Parcels are not handled in this service.</p>
                </div>
              </div>
            )}

{errors.usps && (
  <div className="product-sortation-warning">
    <AlertTriangle size={19} />
    <div>
      <strong>USPS Validation Error</strong>
      <p>{errors.usps}</p>
    </div>
  </div>
)}

          </section>

          {/* Form Actions */}

          <div className="product-form-actions">

            {/* <button
              type="button"
              className="product-cancel-button"
              onClick={handleCancel}
              disabled={saving}
            >
              Cancel
            </button> */}

            <button
              type="submit"
              className="product-save-button "
              disabled={saving}
            >
              {saving ? (
                <>
                  <span className="product-button-spinner" />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={17} />
                  {isEditing ? 'Update Product' : 'Save Product'}
                </>
              )}
            </button>

          </div>

        </form>
      </div>
    </main>
  );
};

export default Product;
