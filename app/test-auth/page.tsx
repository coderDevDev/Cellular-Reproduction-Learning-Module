'use client';

import { useState } from 'react';
import { AuthAPI } from '@/lib/api/auth';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';

export default function TestAuthPage() {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const addResult = (
    title: string,
    success: boolean,
    message: string,
    data?: any
  ) => {
    setResults(prev => [
      ...prev,
      {
        id: Date.now(),
        title,
        success,
        message,
        data,
        timestamp: new Date().toISOString()
      }
    ]);
  };

  const testDatabaseConnection = async () => {
    setLoading(true);
    try {
      const result = await AuthAPI.testDatabaseConnection();
      addResult(
        'Database Connection',
        true,
        'Database connection successful',
        result
      );
    } catch (error) {
      addResult(
        'Database Connection',
        false,
        error instanceof Error ? error.message : 'Unknown error',
        error
      );
    }
    setLoading(false);
  };

  const testRoleRegistration = async (role: 'osca' | 'basca' | 'senior') => {
    setLoading(true);
    try {
      const result = await AuthAPI.testRoleRegistration(role);
      addResult(
        `${role.toUpperCase()} Registration`,
        true,
        `${role} registration test successful`,
        result
      );
    } catch (error) {
      addResult(
        `${role.toUpperCase()} Registration`,
        false,
        error instanceof Error ? error.message : 'Unknown error',
        error
      );
    }
    setLoading(false);
  };

  const clearResults = () => {
    setResults([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8F5F0] to-[#F0EDE8] p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-[#333333] mb-2">
            Authentication Test Page
          </h1>
          <p className="text-lg text-[#666666]">
            Test database connection and user registration
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Button
            onClick={testDatabaseConnection}
            disabled={loading}
            className="bg-[#00B5AD] hover:bg-[#009B94] text-white">
            Test Database Connection
          </Button>

          <Button
            onClick={() => testRoleRegistration('osca')}
            disabled={loading}
            className="bg-[#00B5AD] hover:bg-[#009B94] text-white">
            Test OSCA Registration
          </Button>

          <Button
            onClick={() => testRoleRegistration('basca')}
            disabled={loading}
            className="bg-[#E6B800] hover:bg-[#D4A600] text-white">
            Test BASCA Registration
          </Button>

          <Button
            onClick={() => testRoleRegistration('senior')}
            disabled={loading}
            className="bg-[#00B5AD] hover:bg-[#009B94] text-white">
            Test Senior Registration
          </Button>
        </div>

        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold text-[#333333]">
            Test Results
          </h2>
          <Button
            onClick={clearResults}
            variant="outline"
            className="border-[#00B5AD] text-[#00B5AD] hover:bg-[#00B5AD] hover:text-white">
            Clear Results
          </Button>
        </div>

        <div className="space-y-4">
          {results.map(result => (
            <Card key={result.id} className="border-[#E6B800]">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-[#333333]">
                    {result.title}
                  </CardTitle>
                  <Badge
                    variant={result.success ? 'default' : 'destructive'}
                    className={result.success ? 'bg-[#00B5AD]' : 'bg-red-500'}>
                    {result.success ? 'SUCCESS' : 'FAILED'}
                  </Badge>
                </div>
                <CardDescription className="text-[#666666]">
                  {new Date(result.timestamp).toLocaleString()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Alert
                  className={
                    result.success
                      ? 'border-[#00B5AD] bg-[#F0F8F8]'
                      : 'border-red-500 bg-red-50'
                  }>
                  <AlertDescription className="text-[#333333]">
                    {result.message}
                  </AlertDescription>
                </Alert>
                {result.data && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-semibold text-[#333333] mb-2">Data:</h4>
                    <pre className="text-sm text-[#666666] overflow-x-auto">
                      {JSON.stringify(result.data, null, 2)}
                    </pre>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {results.length === 0 && (
          <Card className="border-dashed border-[#E6B800]">
            <CardContent className="text-center py-12">
              <p className="text-[#666666]">
                No test results yet. Run a test to see results here.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
