import './App.css'

function App() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">
          Finvanta Implementation Intelligence
        </h1>
        
        {/* Test custom colors */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-primary font-semibold mb-2">Primary Color Test</div>
            <p className="text-gray-600">Custom primary color (blue)</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-warning font-semibold mb-2">Warning Color Test</div>
            <p className="text-gray-600">Custom warning color (amber)</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-critical font-semibold mb-2">Critical Color Test</div>
            <p className="text-gray-600">Custom critical color (red)</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-success font-semibold mb-2">Success Color Test</div>
            <p className="text-gray-600">Custom success color (green)</p>
          </div>
        </div>
        
        {/* Status banner */}
        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-6">
          <div className="flex items-center">
            <span className="text-2xl mr-2">⚠️</span>
            <div>
              <div className="font-bold text-yellow-900">SYNTHETIC DATA</div>
              <div className="text-sm text-yellow-800">For Demonstration Only — Not Actual PhilHealth Performance</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Phase 0 Complete ✅
          </h2>
          <ul className="space-y-2 text-gray-700">
            <li>✅ React 19.3.1 + Vite 8.3.5</li>
            <li>✅ Tailwind CSS 4.3.3 (v4 configuration)</li>
            <li>✅ Custom theme colors working</li>
            <li>✅ Recharts, jsPDF, Vitest installed</li>
            <li>✅ Configuration files ready</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default App
