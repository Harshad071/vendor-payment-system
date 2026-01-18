"use client"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">MSME Vendor Payment System</h1>
        <p className="text-lg text-gray-600 mb-8">
          Frontend application for vendor and payment management
        </p>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 max-w-md mx-auto text-left">
          <h2 className="text-xl font-semibold mb-4">Important Note</h2>
          <p className="text-sm text-gray-700 mb-4">
            This is the frontend application. The backend NestJS API should be deployed separately.
          </p>
          <p className="text-sm text-gray-700">
            <strong>Backend Location:</strong> See the <code className="bg-gray-100 px-2 py-1 rounded">/backend</code> directory for deployment instructions.
          </p>
        </div>
      </div>
    </main>
  )
}
