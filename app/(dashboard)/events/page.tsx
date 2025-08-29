export default function EventsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-300 via-blue-400 to-blue-500 flex flex-col">
      {/* Header with Tatlist logo */}
      <div className="pt-8 pb-4">
        <h1 className="text-center text-4xl font-black text-orange-400 tracking-wide">TATLIST</h1>
      </div>

      {/* Content Container */}
      <div className="flex-1 bg-blue-600/80 backdrop-blur-sm mx-4 rounded-t-3xl mt-4 p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">EVENTS</h2>
          <p className="text-white">
            Stay tuned for upcoming tattoo industry events and conventions!
          </p>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="flex justify-between items-center px-8 py-4 bg-blue-600">
        <div className="text-center">
          <div className="text-white text-xs">CONTACT</div>
          <div className="text-white text-xs font-bold">TATLIST</div>
        </div>
        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
          <div className="w-6 h-6 bg-blue-600 rounded-full"></div>
        </div>
        <div className="text-center">
          <div className="text-white text-xs">FAVORITE</div>
          <div className="text-white text-xs font-bold">ITEMS</div>
        </div>
      </div>
    </div>
  )
}
