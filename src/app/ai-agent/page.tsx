export default function AiAgentPage() {
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden h-[calc(100vh-140px)]">
      <iframe
        src="/ai-agent/index.html"
        title="AI Agent"
        className="w-full h-full border-0"
      />
    </div>
  )
}
