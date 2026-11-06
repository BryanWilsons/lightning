
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useOutlet } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Search } from 'lucide-react';
import { useAuth } from '../../../../context/AuthContext';
import api from '../../../../Helpers/Api';
import './../mailowners/MailOwners.css';

const ProductsDashboard = () => {
  const navigate = useNavigate();
  const outlet = useOutlet();
  const formOpen = Boolean(outlet);
  const { user } = useAuth();

  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  const companyId = user?.company?._id;

  const fetchProducts = useCallback(async () => {
    if (!companyId) {
      setProducts([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      let payload = { id: companyId };
      const response = await api.post('/products/', payload);

      const data = response.data;
      const list = Array.isArray(data)
        ? data
        : data.products || [];

      setProducts(list);
    } catch (error) {
      console.error('Error loading products:', error);
      toast.error(
        error.response?.data?.message || 'Unable to load products.'
      );
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    if (!formOpen) {
      fetchProducts();
    }
  }, [fetchProducts, formOpen]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();

    return products.filter((product) => {
      if (!q) return true;

      return [
        product.name,
        product.mailShape,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(q));
    });
  }, [products, search]);


const handleDelete = (product) => {
  const toastId = toast(
    <div className="delete-owner-toast">
      <div className="delete-owner-toast-header">
        <div className="delete-owner-toast-icon">
          <svg
            viewBox="0 0 24 24"
            width="23"
            height="23"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M12 9v4" />
            <path d="M12 17h.01" />
            <path d="M10.3 3.9 2.6 17.2a2 2 0 0 0 1.7 2.8h15.4a2 2 0 0 0 1.7-2.8L13.7 3.9a2 2 0 0 0-3.4 0Z" />
          </svg>
        </div>

        <div>
          <h3>Delete Product</h3>
          <span className="delete-owner-subtitle">
            Confirm deletion before continuing
          </span>
        </div>
      </div>

      <div className="delete-owner-toast-content">
        <p>
          You are about to delete{' '}
          <strong>{product.name}</strong> from your products.
        </p>

        <div className="delete-owner-crid">
          <span>Mail Type</span>
          <strong>{product.mailShape || '—'}</strong>
        </div>

        <div className="delete-owner-warning">
          <span className="delete-owner-warning-dot" />
          <span>
            This action cannot be undone. Verify the product before proceeding.
          </span>
        </div>
      </div>

      <div className="delete-owner-toast-actions">
        <button
          type="button"
          className="delete-owner-cancel"
          onClick={() => toast.dismiss(toastId)}
        >
          Cancel
        </button>

        <button
          type="button"
          className="delete-owner-confirm"
          onClick={() => {
            toast.dismiss(toastId);
            deleteProduct(product);
          }}
        >
          Delete Product
        </button>
      </div>
    </div>,
    {
      position: 'top-center',
      autoClose: false,
      closeOnClick: false,
      closeButton: true,
      draggable: false,
      className: 'delete-owner-toast-container',
      style: {
        width: '460px',
        maxWidth: 'calc(100vw - 32px)',
        padding: 0,
      },
    }
  );
};

const deleteProduct = async (product) => {
  setDeletingId(product._id);

  try {
    let payload = {id: product._id}
    console.log(payload)
    await api.delete(`products`, {
  data: payload
});

    toast.success('Product deleted successfully.');

    setProducts((prev) =>
      prev.filter((item) => item._id !== product._id)
    );
  } catch (error) {
    toast.error(
      error.response?.data?.message || 'Unable to delete product.'
    );
  } finally {
    setDeletingId(null);
  }
};


  const formatNumber = (value) => {
    if (value === null || value === undefined || value === '') return '—';
    return String(value);
  };

  if (formOpen) return outlet;

  return (
    <main className="mail-dashboard">
      <section className="mail-table-card">

        <div className="mail-table-heading">
          <div className="mail-table-title">
            <h2>Products</h2>
            <p>View and manage your company products.</p>
          </div>

          <button
            type="button"
            className="mail-add-button"
            onClick={() => navigate('product?tab=products')}
          >
            <span className="mail-add-icon">+</span>
            Add Product
          </button>
        </div>

        <div className="mail-toolbar">
          <div className="mail-search">
            <Search
              size={19}
            />

            <input
              type="search"
              aria-label="Search products"
              placeholder="Search product name or type..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="mail-table-viewport">

          {loading ? (
            <div className="mail-state">
              <span className="mail-spinner" />
              <p>Loading products...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="mail-state">
              <div className="mail-empty-icon">⌕</div>

              <h3>
                {products.length === 0
                  ? 'No products yet'
                  : 'No matching products'}
              </h3>

              <p>
                {products.length === 0
                  ? 'Add a product to get started.'
                  : 'Try changing your search.'}
              </p>

              {/* {products.length === 0 && (
                <button
                  type="button"
                  className="mail-add-button mail-empty-button"
                  onClick={() => navigate('/products/new')}
                >
                  + Add Product
                </button>
              )} */}
            </div>
          ) : (
            <div className="mail-table-scroll" style={{ height: '35vh' }}>
              <table className="mail-owners-table">

                <thead>
                  <tr>
                    <th>Product Name</th>
                    <th>Mail Type</th>
                    <th>Dimensions </th>
                    <th>Thickness</th>
                    <th>Weight</th>
                    <th>Packaging</th>
                    <th className="mail-actions-heading"></th>
                  </tr>
                </thead>

                <tbody>
                  {filtered.map((product) => (
                    <tr
                      key={product._id}
                      className="list-hover"
                      onClick={() =>
                      navigate(`product/${product._id}?tab=products`)
                      }
                    >
                      <td>
                        <div className="mail-company-name">
                          {product.name || '—'}
                        </div>
                      </td>

                      <td>{product.mailShape || ''}</td>

                      <td>
                       {formatNumber(product.height)} × {formatNumber(product.length)}
                      </td>

                      <td>{formatNumber(product.thickness)}</td>

                      <td>
                        {formatNumber(product.weight)} {product.weightUnit || ''}
                      </td>

                      <td>
                        <div className="products-tags">
                          {product.isPolybagged && (
                            <span className="products-tag">Polybagged</span>
                          )}

                          {product.hasLooseItems && (
                            <span className="products-tag">Loose items</span>
                          )}

                          {product.isNonFlexible && (
                            <span className="products-tag">Non-flexible</span>
                          )}

                          {product.isUnevenThickness && (
                            <span className="products-tag">Uneven thickness</span>
                          )}

                          {!product.isPolybagged &&
                            !product.hasLooseItems &&
                            !product.isNonFlexible &&
                            !product.isUnevenThickness && '—'}
                        </div>
                      </td>

                      <td>
                        <div className="mail-row-actions">
                          <button
                            type="button"
                            className="mail-delete-button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(product);
                            }}
                            title={`Delete ${product.name || 'product'}`}
                            aria-label={`Delete ${product.name || 'product'}`}
                            disabled={deletingId === product._id}
                            style={{ zIndex: 100 }}
                          >
                            ×
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>

              </table>
            </div>
          )}
        </div>

        {!loading && filtered.length > 0 && (
          <footer className="mail-table-footer">
            Showing {filtered.length} of {products.length} products
          </footer>
        )}

      </section>
    </main>
  );
};

export default ProductsDashboard;
