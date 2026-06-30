import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'

export default function Layout() {
  return (
    <div className="min-h-screen bg-paper">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-8">
        <Outlet />
      </main>
      <footer className="border-t border-slate-200 bg-civic-900 py-8 text-center text-sm text-civic-200">
        <p className="font-serif text-base text-white">RoadWatch</p>
        <p className="mt-1 text-civic-300">Civic road monitoring for Bengaluru</p>
      </footer>
    </div>
  )
}