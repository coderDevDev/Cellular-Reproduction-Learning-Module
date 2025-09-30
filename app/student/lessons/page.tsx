export default function StudentLessonsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 pb-20">
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            My Lessons
          </h1>
          <p className="text-gray-600 mt-1">Continue your learning journey</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">
            Lessons Coming Soon
          </h2>
          <p className="text-gray-500">
            Your personalized lessons will appear here based on your learning
            style.
          </p>
        </div>
      </div>
    </div>
  );
}

