export default function Schulungen() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h1 className="text-3xl font-bold text-gray-900">Schulungen</h1>
        <p className="mt-2 text-gray-600">
          Verwalten Sie Ihre Schulungen und Weiterbildungen
        </p>
      </div>

      {/* Upcoming Trainings */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Anstehende Schulungen</h2>
        </div>
        <div className="divide-y divide-gray-200">
          <div className="p-6 hover:bg-gray-50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <span className="text-red-600 text-xl">🚨</span>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Erste Hilfe - Auffrischung</h3>
                  <p className="text-sm text-gray-600">Auffrischung der Erste-Hilfe-Kenntnisse für alle Mitarbeiter</p>
                  <div className="flex items-center space-x-4 mt-2">
                    <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">Verpflichtend</span>
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">15. Dezember 2024</span>
                    <span className="text-xs text-gray-500">09:00 - 17:00 Uhr</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                  Anmelden
                </button>
                <button className="p-2 text-gray-400 hover:text-gray-600">
                  📅
                </button>
              </div>
            </div>
          </div>

          <div className="p-6 hover:bg-gray-50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-blue-600 text-xl">🔒</span>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Datenschutz und DSGVO</h3>
                  <p className="text-sm text-gray-600">Schulung zu Datenschutzrichtlinien und DSGVO-Compliance</p>
                  <div className="flex items-center space-x-4 mt-2">
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">Verpflichtend</span>
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">20. Dezember 2024</span>
                    <span className="text-xs text-gray-500">14:00 - 16:00 Uhr</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  Anmelden
                </button>
                <button className="p-2 text-gray-400 hover:text-gray-600">
                  📅
                </button>
              </div>
            </div>
          </div>

          <div className="p-6 hover:bg-gray-50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <span className="text-green-600 text-xl">🏊‍♂️</span>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Neue Pooltechnologien</h3>
                  <p className="text-sm text-gray-600">Einführung in neue Pooltechnologien und Wartungsverfahren</p>
                  <div className="flex items-center space-x-4 mt-2">
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Freiwillig</span>
                    <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full">10. Januar 2025</span>
                    <span className="text-xs text-gray-500">10:00 - 15:00 Uhr</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                  Anmelden
                </button>
                <button className="p-2 text-gray-400 hover:text-gray-600">
                  📅
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Training Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="text-center">
            <span className="text-4xl">🚨</span>
            <h3 className="mt-4 text-lg font-semibold text-gray-900">Sicherheit</h3>
            <p className="mt-2 text-sm text-gray-600">3 verfügbare Schulungen</p>
            <button className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
              Anzeigen
            </button>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="text-center">
            <span className="text-4xl">🔒</span>
            <h3 className="mt-4 text-lg font-semibold text-gray-900">Compliance</h3>
            <p className="mt-2 text-sm text-gray-600">2 verfügbare Schulungen</p>
            <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Anzeigen
            </button>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="text-center">
            <span className="text-4xl">🏊‍♂️</span>
            <h3 className="mt-4 text-lg font-semibold text-gray-900">Fachwissen</h3>
            <p className="mt-2 text-sm text-gray-600">5 verfügbare Schulungen</p>
            <button className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
              Anzeigen
            </button>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="text-center">
            <span className="text-4xl">👥</span>
            <h3 className="mt-4 text-lg font-semibold text-gray-900">Soft Skills</h3>
            <p className="mt-2 text-sm text-gray-600">2 verfügbare Schulungen</p>
            <button className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
              Anzeigen
            </button>
          </div>
        </div>
      </div>

      {/* Completed Trainings */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Abgeschlossene Schulungen</h2>
        </div>
        <div className="divide-y divide-gray-200">
          <div className="p-6 hover:bg-gray-50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-12 bg-green-100 rounded flex items-center justify-center">
                  <span className="text-green-600 text-lg">✅</span>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Brandschutzschulung</h3>
                  <p className="text-sm text-gray-600">Grundlagen des Brandschutzes und Evakuierungsverfahren</p>
                  <div className="flex items-center space-x-4 mt-2">
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Abgeschlossen</span>
                    <span className="text-xs text-gray-500">15. November 2024</span>
                    <span className="text-xs text-gray-500">Zertifikat verfügbar</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button className="p-2 text-gray-400 hover:text-gray-600">
                  📄
                </button>
                <button className="p-2 text-gray-400 hover:text-gray-600">
                  🏆
                </button>
              </div>
            </div>
          </div>

          <div className="p-6 hover:bg-gray-50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-12 bg-green-100 rounded flex items-center justify-center">
                  <span className="text-green-600 text-lg">✅</span>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Arbeitssicherheit</h3>
                  <p className="text-sm text-gray-600">Grundlagen der Arbeitssicherheit im Schwimmbad</p>
                  <div className="flex items-center space-x-4 mt-2">
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Abgeschlossen</span>
                    <span className="text-xs text-gray-500">1. November 2024</span>
                    <span className="text-xs text-gray-500">Zertifikat verfügbar</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button className="p-2 text-gray-400 hover:text-gray-600">
                  📄
                </button>
                <button className="p-2 text-gray-400 hover:text-gray-600">
                  🏆
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
