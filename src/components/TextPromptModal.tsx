import { useEffect, useId, useRef, useState } from 'react'
import Modal from './Modal'

interface TextPromptModalProps {
  title: string
  label: string
  initialValue?: string
  submitLabel?: string
  /** When false, an empty/blank input disables submit. Rename allows empty (clears the label). */
  allowEmpty?: boolean
  placeholder?: string
  onSubmit: (value: string) => void
  onClose: () => void
}

/** Single-text-input dialog built on Modal. Used for both Rename and Edit manager. */
function TextPromptModal({
  title,
  label,
  initialValue = '',
  submitLabel = 'Save',
  allowEmpty = false,
  placeholder,
  onSubmit,
  onClose,
}: TextPromptModalProps) {
  const [value, setValue] = useState(initialValue)
  const inputRef = useRef<HTMLInputElement>(null)
  const titleId = useId()
  const inputId = useId()

  useEffect(() => {
    inputRef.current?.focus()
    inputRef.current?.select()
  }, [])

  const canSubmit = allowEmpty || value.trim().length > 0

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    if (!canSubmit) return
    onSubmit(value)
  }

  return (
    <Modal titleId={titleId} onClose={onClose}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <h2 id={titleId} className="text-xl font-bold text-slate-100">
          {title}
        </h2>

        <div className="flex flex-col gap-1.5">
          <label htmlFor={inputId} className="text-sm font-medium text-slate-300">
            {label}
          </label>
          <input
            ref={inputRef}
            id={inputId}
            type="text"
            value={value}
            onChange={(event) => setValue(event.target.value)}
            placeholder={placeholder}
            className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-slate-100 placeholder:text-slate-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300"
          />
        </div>

        <div className="mt-2 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full px-5 py-2 text-sm font-semibold text-slate-300 transition-colors hover:text-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!canSubmit}
            className="rounded-full bg-emerald-500 px-6 py-2 text-sm font-semibold text-slate-950 transition-colors hover:bg-emerald-400 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
          >
            {submitLabel}
          </button>
        </div>
      </form>
    </Modal>
  )
}

export default TextPromptModal
