import React, { useState, useEffect } from 'react';

const UNIT_OPTIONS = [
  'pieces', 'kg', 'bag', 'packet', 'box', 'containers', 'Ibs', 'loaf'
];

export default function IngredientUsageDialog({ open, onClose, ingredients = [], onConfirm }) {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    if (open) {
      setRows(
        (ingredients || []).map(name => ({
          name,
          quantity: '',
          unit: 'pieces'
        }))
      );
    }
  }, [open, ingredients]);

  if (!open) return null;

  const handleChange = (idx, field, value) => {
    setRows(rows =>
      rows.map((row, i) =>
        i === idx ? { ...row, [field]: value } : row
      )
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirm(rows);
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
      background: '#0008', zIndex: 1200, display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      <form
        onSubmit={handleSubmit}
        style={{
          background: '#fff',
          borderRadius: 12,
          padding: 32,
          minWidth: 380,
          maxWidth: 520,
          boxShadow: '0 2px 12px #0002'
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ fontWeight: 700, fontSize: 20, marginBottom: 18 }}>Ingredient Usage</div>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 18 }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', padding: 6, fontWeight: 600 }}>Ingredient</th>
              <th style={{ textAlign: 'left', padding: 6, fontWeight: 600 }}>Quantity</th>
              <th style={{ textAlign: 'left', padding: 6, fontWeight: 600 }}>Unit</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => (
              <tr key={row.name}>
                <td style={{ padding: 6 }}>{row.name}</td>
                <td style={{ padding: 6 }}>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={row.quantity}
                    onChange={e => handleChange(idx, 'quantity', e.target.value)}
                    style={{
                      width: 80,
                      padding: '4px 6px',
                      borderRadius: 4,
                      border: '1px solid #bbb'
                    }}
                    required
                  />
                </td>
                <td style={{ padding: 6 }}>
                  <select
                    value={row.unit}
                    onChange={e => handleChange(idx, 'unit', e.target.value)}
                    style={{
                      padding: '4px 8px',
                      borderRadius: 4,
                      border: '1px solid #bbb'
                    }}
                  >
                    {UNIT_OPTIONS.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
          <button
            type="button"
            style={{
              background: '#eee',
              color: '#333',
              border: 'none',
              borderRadius: 6,
              padding: '8px 24px',
              fontSize: 16,
              cursor: 'pointer'
            }}
            onClick={onClose}
          >Cancel</button>
          <button
            type="submit"
            style={{
              background: '#19c37d',
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              padding: '8px 24px',
              fontSize: 16,
              cursor: 'pointer'
            }}
          >Confirm</button>
        </div>
      </form>
    </div>
  );
}