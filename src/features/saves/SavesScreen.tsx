import { useState } from 'react'
import type { GameState, Result, SaveSummary } from '../../game'
import { deleteGame, listSaves, loadGame, renameSave, setFavorite, setManagerName } from '../../game'
import { formatTimestamp } from '../../shared/utils/format'
import ConfirmModal from '../../shared/components/ConfirmModal'
import TextPromptModal from '../../shared/components/TextPromptModal'

interface SavesScreenProps {
  onBack: () => void
  onSwitchTo: (state: GameState) => void
  activeSaveId?: string
  onActiveDeleted: (id: string) => void
}

/** Favorites first, then most recently updated. */
function sortSaves(saves: SaveSummary[]): SaveSummary[] {
  return [...saves].sort((a, b) => {
    if (a.favorite !== b.favorite) return a.favorite ? -1 : 1
    return b.updatedAt - a.updatedAt
  })
}

function SavesScreen({ onBack, onSwitchTo, activeSaveId, onActiveDeleted }: SavesScreenProps) {
  // listSaves() is a synchronous localStorage read, so the initial load is computed
  // lazily on first render rather than in an effect (no external subscription to sync).
  const [initialSaves] = useState<Result<SaveSummary[]>>(() => listSaves())
  const [saves, setSaves] = useState<SaveSummary[]>(() =>
    initialSaves.ok ? sortSaves(initialSaves.value) : [],
  )
  const [error] = useState<string | null>(() =>
    initialSaves.ok ? null : initialSaves.error.message,
  )
  const [actionError, setActionError] = useState<string | null>(null)
  const [renamingSave, setRenamingSave] = useState<SaveSummary | null>(null)
  const [editingManagerSave, setEditingManagerSave] = useState<SaveSummary | null>(null)
  const [deletingSave, setDeletingSave] = useState<SaveSummary | null>(null)

  const replaceSave = (id: string, patch: Partial<SaveSummary>) => {
    setSaves((current) => sortSaves(current.map((s) => (s.id === id ? { ...s, ...patch } : s))))
  }

  const handleSwitchTo = (id: string) => {
    setActionError(null)
    const result = loadGame(id)
    if (!result.ok) {
      setActionError(result.error.message)
      return
    }
    if (result.value === null) {
      setActionError('This save no longer exists.')
      return
    }
    onSwitchTo(result.value)
  }

  const handleToggleFavorite = (save: SaveSummary) => {
    setActionError(null)
    const result = setFavorite(save.id, !save.favorite)
    if (!result.ok) {
      setActionError(result.error.message)
      return
    }
    if (result.value === null) {
      setSaves((current) => current.filter((s) => s.id !== save.id))
      return
    }
    replaceSave(save.id, { favorite: result.value.favorite })
  }

  const handleRename = (value: string) => {
    if (!renamingSave) return
    const target = renamingSave
    setActionError(null)
    const result = renameSave(target.id, value)
    setRenamingSave(null)
    if (!result.ok) {
      setActionError(result.error.message)
      return
    }
    if (result.value === null) {
      setSaves((current) => current.filter((s) => s.id !== target.id))
      return
    }
    replaceSave(target.id, { label: result.value.label })
  }

  const handleEditManager = (value: string) => {
    if (!editingManagerSave) return
    const target = editingManagerSave
    setActionError(null)
    const result = setManagerName(target.id, value)
    setEditingManagerSave(null)
    if (!result.ok) {
      setActionError(result.error.message)
      return
    }
    if (result.value === null) {
      setSaves((current) => current.filter((s) => s.id !== target.id))
      return
    }
    replaceSave(target.id, { managerName: result.value.managerName })
  }

  const handleDelete = () => {
    if (!deletingSave) return
    const target = deletingSave
    setActionError(null)
    const result = deleteGame(target.id)
    setDeletingSave(null)
    if (!result.ok) {
      setActionError(result.error.message)
      return
    }
    setSaves((current) => current.filter((s) => s.id !== target.id))
    if (target.id === activeSaveId) onActiveDeleted(target.id)
  }

  return (
    <main className="relative flex min-h-screen flex-col items-center bg-slate-950 px-6 py-16 text-slate-100">
      <div className="flex w-full max-w-2xl flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-black tracking-tight">Saved Games</h1>
          <button
            type="button"
            onClick={onBack}
            className="rounded-full border border-slate-700 px-5 py-2 text-sm font-semibold text-slate-300 transition-colors hover:border-slate-500 hover:text-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
          >
            Back
          </button>
        </div>

        {actionError && (
          <p role="alert" className="text-sm text-rose-400">
            {actionError}
          </p>
        )}

        {error && (
          <p role="alert" className="text-sm text-rose-400">
            {error}
          </p>
        )}

        {!error && saves.length === 0 && (
          <p className="rounded-2xl border border-slate-800 bg-slate-900 px-6 py-10 text-center text-slate-400">
            No saves yet. Start a New Game from the title screen to create one.
          </p>
        )}

        <ul className="flex flex-col gap-3">
          {saves.map((save) => {
            const displayName = save.label ?? save.managerName
            return (
              <li
                key={save.id}
                className="flex flex-col gap-3 rounded-2xl border border-slate-800 bg-slate-900 p-5 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-start gap-3">
                  <button
                    type="button"
                    onClick={() => handleToggleFavorite(save)}
                    aria-pressed={save.favorite}
                    aria-label={save.favorite ? 'Unfavorite save' : 'Favorite save'}
                    className={`mt-0.5 text-xl transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 ${
                      save.favorite ? 'text-amber-400' : 'text-slate-600 hover:text-slate-400'
                    }`}
                  >
                    {save.favorite ? '★' : '☆'}
                  </button>
                  <div className="flex flex-col">
                    <span className="text-lg font-semibold text-slate-100">{displayName}</span>
                    {save.label && (
                      <span className="text-sm text-slate-400">{save.managerName}</span>
                    )}
                    <span className="text-xs text-slate-500">
                      Created {formatTimestamp(save.createdAt)} - Updated{' '}
                      {formatTimestamp(save.updatedAt)}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 sm:justify-end">
                  <button
                    type="button"
                    onClick={() => handleSwitchTo(save.id)}
                    className="rounded-full bg-emerald-500 px-4 py-1.5 text-sm font-semibold text-slate-950 transition-colors hover:bg-emerald-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
                  >
                    Switch to
                  </button>
                  <button
                    type="button"
                    onClick={() => setRenamingSave(save)}
                    className="rounded-full border border-slate-700 px-4 py-1.5 text-sm font-semibold text-slate-300 transition-colors hover:border-slate-500 hover:text-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
                  >
                    Rename
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingManagerSave(save)}
                    className="rounded-full border border-slate-700 px-4 py-1.5 text-sm font-semibold text-slate-300 transition-colors hover:border-slate-500 hover:text-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
                  >
                    Edit manager
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeletingSave(save)}
                    className="rounded-full border border-rose-800 px-4 py-1.5 text-sm font-semibold text-rose-400 transition-colors hover:border-rose-600 hover:text-rose-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
                  >
                    Delete
                  </button>
                </div>
              </li>
            )
          })}
        </ul>
      </div>

      {renamingSave && (
        <TextPromptModal
          title="Rename save"
          label="Save title"
          initialValue={renamingSave.label ?? ''}
          submitLabel="Save"
          allowEmpty
          placeholder={renamingSave.managerName}
          onSubmit={handleRename}
          onClose={() => setRenamingSave(null)}
        />
      )}

      {editingManagerSave && (
        <TextPromptModal
          title="Edit manager name"
          label="Manager name"
          initialValue={editingManagerSave.managerName}
          submitLabel="Save"
          onSubmit={handleEditManager}
          onClose={() => setEditingManagerSave(null)}
        />
      )}

      {deletingSave && (
        <ConfirmModal
          title="Delete save"
          message={`Delete "${deletingSave.label ?? deletingSave.managerName}"? This cannot be undone.`}
          confirmLabel="Delete"
          onConfirm={handleDelete}
          onClose={() => setDeletingSave(null)}
        />
      )}
    </main>
  )
}

export default SavesScreen
