export default function TestLayoutPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Layout Test Page</h1>
      <p className="mb-4">
        This page is to test if the banner and navigation are properly positioned.
      </p>
      <div className="bg-gray-100 p-4 rounded">
        <p>The announcement banner should be at the very top.</p>
        <p>The navigation bar should be positioned below the banner.</p>
        <p>This content should not be hidden behind either element.</p>
      </div>
    </div>
  )
}
