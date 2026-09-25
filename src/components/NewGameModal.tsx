import { useEffect, useId, useRef, useState } from 'react'
import type { GameState } from '../game'
import { startNewGame } from '../game'
import Modal from './Modal'

interface NewGameModalProps {
  onClose: () => void
  onCreated: (state: GameState) => void
}

function NewGameModal({ onClose, onCreated }: NewGameModalProps) {
  const [managerName, setManagerName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const titleId = useId()

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const canSubmit = managerName.trim().length > 0

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    if (!canSubmit) return

    const result = startNewGame({ managerName })
    if (result.ok) {
      onCreated(result.value)
      return
    }
    setError(result.error.message)
  }

  return (
    <Modal titleId={titleId} onClose={onClose}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <h2 id={titleId} className="text-xl font-bold text-slate-100">
          New Game
        </h2>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="manager-name"
            className="text-sm font-medium text-slate-300"
          >
            Manager name
          </label>
          <input
            ref={inputRef}
            id="manager-name"
            type="text"
            value={managerName}
            onChange={(event) => {
              setManagerName(event.target.value)
              if (error) setError(null)
            }}
            placeholder="e.g. Alex Ferguson"
            className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-slate-100 placeholder:text-slate-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300"
          />
        </div>

        {error && (
          <p role="alert" className="text-sm text-rose-400">
            {error}
          </p>
        )}

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
            Start
          </button>
        </div>
      </form>
    </Modal>
  )
}

export default NewGameModal
