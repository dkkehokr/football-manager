import { useState } from 'react'
import NewGameModal from './components/NewGameModal'
import type { GameState } from './game'

function App() {
  const [isNewGameOpen, setIsNewGameOpen] = useState(false)
  const [activeSave, setActiveSave] = useState<GameState | null>(null)

  const handleNewGame = () => {
    setIsNewGameOpen(true)
  }

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center bg-slate-950 px-6 text-slate-100">
      <div className="flex flex-col items-center gap-3 text-center">
        <span className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-400">
          Football Management Sim
        </span>
        <h1 className="text-6xl font-black tracking-tight sm:text-7xl">
          MATCHDAY
        </h1>
        <p className="max-w-md text-base text-slate-400 sm:text-lg">
          Every legend needs a dugout. Build your squad, call the shots, and
          chase the title.
        </p>
      </div>

      <button
        type="button"
        onClick={handleNewGame}
        className="mt-10 rounded-full bg-emerald-500 px-10 py-3 text-lg font-semibold text-slate-950 transition-colors hover:bg-emerald-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
      >
        New Game
      </button>

      {activeSave && (
        <p className="mt-4 text-sm text-emerald-300">
          Welcome, {activeSave.managerName}. Save created.
        </p>
      )}

      {isNewGameOpen && (
        <NewGameModal
          onClose={() => setIsNewGameOpen(false)}
          onCreated={(state) => {
            setActiveSave(state)
            setIsNewGameOpen(false)
          }}
        />
      )}

      <footer className="absolute bottom-6 text-xs text-slate-600">
        Pre-alpha - walking skeleton
      </footer>
    </main>
  )
}

export default App
