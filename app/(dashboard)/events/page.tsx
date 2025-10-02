export default function EventsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-950 via-red-900 to-black">
      <div className="relative min-h-screen">
        {/* Decorative border elements */}
        <div className="absolute inset-0 border-8 border-red-600 opacity-50">
          <div className="absolute top-4 left-4 w-8 h-8 border-2 border-red-600"></div>
          <div className="absolute top-4 right-4 w-8 h-8 border-2 border-red-600"></div>
          <div className="absolute bottom-4 left-4 w-8 h-8 border-2 border-red-600"></div>
          <div className="absolute bottom-4 right-4 w-8 h-8 border-2 border-red-600"></div>
        </div>

        {/* Main content */}
        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-8">
          {/* Event Title */}
          <div className="text-center mb-8">
            <h1 className="text-5xl md:text-7xl font-black text-transparent bg-gradient-to-b from-yellow-300 via-yellow-500 to-orange-600 bg-clip-text mb-2 transform -skew-y-1">
              INK MANIA
            </h1>
            <h2 className="text-4xl md:text-6xl font-black text-transparent bg-gradient-to-b from-yellow-300 via-yellow-500 to-orange-600 bg-clip-text transform skew-y-1">
              FEST
            </h2>
          </div>

          {/* Central Circle with Oni Mask Placeholder */}
          <div className="relative mb-8">
            <div className="w-48 h-48 md:w-64 md:h-64 bg-gradient-to-br from-red-500 to-red-700 rounded-full flex items-center justify-center border-4 border-yellow-500 shadow-2xl">
              <div className="text-center text-white">
                <div className="text-6xl mb-2">👹</div>
                <div className="text-sm font-bold">ONI MASK</div>
              </div>
            </div>
          </div>

          {/* Date Badge */}
          <div className="bg-gradient-to-r from-orange-500 to-yellow-500 text-black font-black text-2xl md:text-3xl px-6 py-3 rounded-lg transform -rotate-3 shadow-lg mb-6">
            APRIL 24-26<br />
            <span className="text-xl">2026</span>
          </div>

          {/* Location Banner */}
          <div className="bg-red-600 text-white font-bold text-xl md:text-2xl px-8 py-2 rounded-full mb-8 shadow-lg">
            TAMPA, FL
          </div>

          {/* Event Details */}
          <div className="text-center mb-8">
            <div className="text-white text-lg md:text-xl font-bold mb-4">
              150 BOOTHS AVAILABLE<br />
              CUSTOM TATTOO TROPHIES
            </div>
            
            <div className="flex flex-wrap justify-center gap-4 text-yellow-300 font-bold text-base md:text-lg">
              <span>⚡ LIVE TATTOO COMPETITIONS ⚡</span>
              <span>🏆 CUSTOM TROPHIES 🏆</span>
              <span>🥊 MMA FIGHTS 🥊</span>
              <span>🏪 VENDORS & MORE 🏪</span>
            </div>
          </div>

          {/* Venue */}
          <div className="text-white text-lg md:text-xl font-bold mb-8">
            FLORIDA STATE FAIRGROUNDS, TAMPA, FL
          </div>

          {/* Registration QR Code Placeholder */}
          <div className="bg-white p-4 rounded-lg shadow-lg mb-6">
            <div className="w-24 h-24 bg-black flex items-center justify-center text-white text-xs text-center">
              QR CODE<br />TO REGISTER
            </div>
          </div>

          {/* Social Media & Website */}
          <div className="text-center text-white">
            <div className="mb-2">
              <span className="font-bold">📷 @InkManiaevents</span> | <span className="font-bold">🌐 www.inkmaniafest.com</span>
            </div>
            <div className="text-sm opacity-75">
              *Presented by Chino Gonzalez – Ink Mania Fest
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
