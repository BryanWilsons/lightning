import React, { useEffect, useRef, useState } from 'react';
//import { Input } from '../css/Shared';

const FacilitySearchSelect = ({
  facilities = [],
  value,
  onChange,
  placeholder = 'Search facility, city, ZIP…'
}) => {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Update displayed text when value changes from parent (e.g. provider auto-fill)
  useEffect(() => {
    if (value && value.dropname) {
      setQuery(`${value.dropname} – ${value.dropdelcty}, ${value.dropdelst}`);
    } else {
      setQuery('');
    }
  }, [value]);

  // Improved filtering - show ALL facilities if query is empty or is the display text
  const filtered = facilities
    .filter(f => {
      const q = (query || '').toLowerCase().trim();

      // If query is empty OR it's the currently selected full text → show everything
      if (!q || (value && query === `${value.dropname} – ${value.dropdelcty}, ${value.dropdelst}`)) {
        return true;
      }

      return (
        (f.dropname || '').toLowerCase().includes(q) ||
        (f.dropdelcty || '').toLowerCase().includes(q) ||
        (f.dropdelst || '').toLowerCase().includes(q) ||
        String(f.dropdelzpp || '').includes(q)
      );
    })
    .slice(0, 100);   // show more results

  const handleInputClick = () => {
    setOpen(true);
  };

  const handleSelect = (facility) => {
    onChange(facility);
    setQuery(`${facility.dropname} – ${facility.dropdelcty}, ${facility.dropdelst}`);
    setOpen(false);
  };

  return (
    <div ref={wrapperRef} className="facility-search-wrapper"   style={{ position: 'relative', zIndex: open ? 9999 : 1 }}>
      <input
        type="text"
        value={query}
        placeholder={placeholder}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onClick={handleInputClick}        // ← Important: Click to open
        onFocus={() => setOpen(true)}
        className="w-full h-9 px-3 border rounded-md text-sm cursor-pointer"
        style={{
          border: "1px solid rgb(0,0,0,.3)",
          outline: 'none',
          fontSize: "12px",
          fontWeight: '600',
          borderLeft: "10px solid rgba(122, 187, 67, .5)",
          color: 'black',
          backgroundColor: 'white',
        }}
      />

      {open && (
        <div className="facility-search-dropdown"  style={{
      position: 'absolute',
      top: '100%',
      left: 0,
      right: 0,
      zIndex: 99999,
      backgroundColor: '#fff',
      color: '#1e293b',
      border: '1px solid #cbd5e1',
      borderRadius: '8px',
      boxShadow: '0 12px 28px rgba(15, 23, 42, 0.2)',
      maxHeight: '320px',
      overflowY: 'auto',
    }}>
          {filtered.length === 0 ? (
            <div className="px-3 py-3 text-xs text-gray-500">
              No matching facilities
            </div>
          ) : (
            filtered.map(f => (
              <div
                key={f.fdbId}
                onClick={() => handleSelect(f)}
                className="px-3 py-2.5 cursor-pointer hover:bg-gray-100 border-b border-gray-100 last:border-b-0"
              >
                <div className="text-sm font-medium">{f.dropname}</div>
                <div className="text-xs text-gray-600">
                  {f.dropdeladd} • {f.dropdelcty}, {f.dropdelst} • {String(f.dropdelzpp || '').slice(0, 5)}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default FacilitySearchSelect;