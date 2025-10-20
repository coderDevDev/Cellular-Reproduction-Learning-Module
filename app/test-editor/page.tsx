'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { OutputData } from '@editorjs/editorjs';

const EditorJSContentEditor = dynamic(
  () => import('@/components/vark-modules/editorjs-content-editor'),
  { ssr: false }
);

export default function TestEditorPage() {
  const [editorData, setEditorData] = useState<OutputData>({
    blocks: [
      {
        type: 'paragraph',
        data: {
          text: 'Click the + button to test Image and Embed tools!'
        }
      }
    ]
  });

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🧪 Editor.js Test Page
          </h1>
          <p className="text-gray-600 mb-4">
            Test if Image and Embed tools are working
          </p>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-blue-900 mb-2">✅ Expected Tools:</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex items-center space-x-2">
                <span className="text-green-600">✓</span>
                <span>Paragraph</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-green-600">✓</span>
                <span>Header</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-green-600">✓</span>
                <span>List</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-green-600">✓</span>
                <span>Quote</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-green-600">✓</span>
                <span>Table</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-green-600">✓</span>
                <span>Code</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-blue-600 font-bold">⭐</span>
                <span className="font-bold text-blue-600">Image</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-blue-600 font-bold">⭐</span>
                <span className="font-bold text-blue-600">Embed</span>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-yellow-900 mb-2">📝 How to Test:</h3>
            <ol className="list-decimal list-inside space-y-1 text-sm text-yellow-800">
              <li>Click the <strong>+</strong> button on the left margin</li>
              <li>Look for <strong>"Image"</strong> and <strong>"Embed"</strong> in the menu</li>
              <li>Try adding an image (upload or URL)</li>
              <li>Try embedding a YouTube video</li>
            </ol>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <EditorJSContentEditor
            data={editorData}
            onChange={(data) => {
              setEditorData(data);
              console.log('✅ Editor data updated:', data);
            }}
            placeholder="Click + to see all available tools..."
          />
        </div>

        <div className="mt-6 bg-white rounded-lg shadow-lg p-6">
          <h3 className="font-semibold text-gray-900 mb-3">🔍 Debug Info:</h3>
          <div className="bg-gray-100 rounded p-4 overflow-x-auto">
            <pre className="text-xs text-gray-800">
              {JSON.stringify(editorData, null, 2)}
            </pre>
          </div>
        </div>

        <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="font-semibold text-red-900 mb-2">❌ If Image/Embed Don't Show:</h3>
          <ol className="list-decimal list-inside space-y-2 text-sm text-red-800">
            <li>
              <strong>Stop the dev server</strong> (Ctrl + C in terminal)
            </li>
            <li>
              <strong>Restart:</strong> <code className="bg-red-100 px-2 py-1 rounded">npm run dev</code>
            </li>
            <li>
              <strong>Clear browser cache</strong> (Ctrl + Shift + Delete)
            </li>
            <li>
              <strong>Hard refresh</strong> (Ctrl + F5)
            </li>
            <li>
              Check browser console (F12) for errors
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
}
