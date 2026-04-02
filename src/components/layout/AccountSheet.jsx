import useStore from '../../store/useStore'

export default function AccountSheet() {
  const accountSheetOpen = useStore(s => s.accountSheetOpen)
  const user = useStore(s => s.user)
  const { logout, setView, showToast } = useStore()

  if (!accountSheetOpen) return null

  const close = () => useStore.setState({ accountSheetOpen: false })

  return (
    <>
      <div className="fixed inset-0 z-[54] bg-black/40" onClick={close} role="button" aria-label="Close account menu" tabIndex={-1} />
      <div className="fixed bottom-0 left-0 right-0 z-[56] bg-white rounded-t-2xl shadow-[0_-8px_40px_rgba(0,0,0,.15)] slide-up">
        <div className="w-10 h-1 rounded-full bg-gray-300 mx-auto mt-3 mb-2" />
        <div className="px-5 pb-6">
          <div className="flex items-center gap-3 mb-5 mt-2">
            <div className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold text-white bg-brand">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div>
              <p className="font-bold text-sm text-primary">{user?.name || 'User'}</p>
              <p className="text-xs text-muted">{user?.email || ''}</p>
            </div>
          </div>
          <div className="space-y-1">
            <button onClick={() => { close(); const s = useStore.getState(); s.adminUnlocked ? setView('admin') : useStore.setState({ adminAuthOpen: true }) }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-left text-primary hover:bg-gray-50 transition">
              <svg className="w-5 h-5 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
              Admin Panel
            </button>
            <button onClick={() => { close(); logout(); showToast('Logged out', 'info') }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-left text-red-500 hover:bg-red-50 transition">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
              Log Out
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
