import React from 'react';

const ConfirmModal = ({ isOpen, title, message, onConfirm, onCancel, confirmText = 'Confirm', cancelText = 'Cancel', isDangerous = false }) => {
    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.8)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backdropFilter: 'blur(5px)'
        }} onClick={onCancel}>
            <div
                className="card"
                style={{
                    maxWidth: '400px',
                    width: '90%',
                    padding: '30px',
                    border: `1px solid ${isDangerous ? '#ff4444' : 'var(--primary-color)'}`,
                    boxShadow: `0 0 30px rgba(${isDangerous ? '255, 68, 68' : '0, 224, 255'}, 0.2)`
                }}
                onClick={e => e.stopPropagation()}
            >
                <h3 style={{
                    marginBottom: '15px',
                    color: isDangerous ? '#ff4444' : 'var(--text-main)',
                    fontSize: '1.5rem'
                }}>
                    {title}
                </h3>
                <p style={{ marginBottom: '25px', color: '#ccc', lineHeight: '1.5' }}>
                    {message}
                </p>
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                    <button
                        className="btn btn-secondary"
                        onClick={onCancel}
                        style={{ padding: '10px 20px' }}
                    >
                        {cancelText}
                    </button>
                    <button
                        className="btn"
                        onClick={onConfirm}
                        style={{
                            padding: '10px 20px',
                            background: isDangerous ? '#ff4444' : 'var(--primary-color)',
                            color: isDangerous ? 'white' : 'black',
                            fontWeight: 'bold'
                        }}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;
