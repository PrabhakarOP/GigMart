import React from 'react';
import Modal from './Modal';
import Spinner from './Spinner';

export default function ConfirmDialog({
  isOpen,
  title = 'Are you sure?',
  message = 'This action cannot be undone.',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  loading = false,
  danger = false,
  className = '',
  id = 'confirm-dialog',
}) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={loading ? () => {} : onCancel}
      title={title}
      maxWidth="max-w-md"
      className={className}
      id={id}
    >
      <div className="space-y-6">
        <p className="text-sm text-neutral-600 leading-relaxed">{message}</p>
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            id={`${id}-cancel-btn`}
            onClick={onCancel}
            disabled={loading}
            className="btn btn-secondary text-sm"
          >
            {cancelText}
          </button>
          <button
            type="button"
            id={`${id}-confirm-btn`}
            onClick={onConfirm}
            disabled={loading}
            className={`btn ${danger ? 'btn-danger' : 'btn-primary'} text-sm`}
          >
            {loading && <Spinner size="sm" id={`${id}-spinner`} />}
            {confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
}

