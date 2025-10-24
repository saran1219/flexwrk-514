// src/components/SimpleModal.jsx
import React from 'react';

export default function SimpleModal({
  isOpen,
  onClose,
  onConfirm,
  type = 'info',
  title = '',
  message = '',
  confirmLabel,
  cancelLabel = 'Cancel'
}) {
  if (!isOpen) return null;

  const palette = {
    info: '#3B82F6',
    success: '#16A34A',
    warning: '#F59E0B',
    error: '#EF4444',
    confirm: '#EF4444'
  };
  const color = palette[type] || palette.info;
  const ctaText = confirmLabel || (type === 'confirm' ? 'Delete' : 'OK');

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 4000 }} onClick={onClose}>
      <div style={{ background: '#FFFFFF', borderRadius: 12, width: '100%', maxWidth: 520, padding: '20px 24px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }} onClick={(e) => e.stopPropagation()}>
        {title && (
          <h3 style={{ margin: 0, marginBottom: 8, fontSize: 20, fontWeight: 700, color: '#0F172A' }}>{title}</h3>
        )}
        {message && (
          <p style={{ margin: 0, marginBottom: 16, fontSize: 14, color: '#475569', lineHeight: 1.6 }}>{message}</p>
        )}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <button onClick={onClose} style={{ padding: '10px 14px', borderRadius: 8, border: '1px solid #E2E8F0', background: '#F8FAFC', color: '#0F172A', cursor: 'pointer' }}>{cancelLabel}</button>
          <button onClick={() => { onConfirm?.(); onClose(); }} style={{ padding: '10px 14px', borderRadius: 8, border: '1px solid transparent', background: color, color: '#FFFFFF', cursor: 'pointer' }}>{ctaText}</button>
        </div>
      </div>
    </div>
  );
}
