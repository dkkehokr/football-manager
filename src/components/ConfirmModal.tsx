import { useId } from 'react'
import Modal from './Modal'

interface ConfirmModalProps {
  title: string
  message: string
  confirmLabel?: string
  onConfirm: () => void
  onClose: () => void
}

/** Reusable confirm dialog for destructive actions, built on Modal. */
function ConfirmModal({
  title,
  message,
  confirmLabel = 'Confirm',
  onConfirm,
  onClose,
}: ConfirmModalProps) {
  const titleId = useId()

  return (
    <Modal titleId={titleId} onClose={onClose}>
      <div className="flex flex-col gap-4">
        <h2 id={titleId} className="text-xl font-bold text-slate-100">
          {title}
        </h2>

        <p className="text-sm text-slate-300">{message}</p>

        <div className="mt-2 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full px-5 py-2 text-sm font-semibold text-slate-300 transition-colors hover:text-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="rounded-full bg-rose-500 px-6 py-2 text-sm font-semibold text-slate-950 transition-colors hover:bg-rose-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  )
}

export default ConfirmModal
