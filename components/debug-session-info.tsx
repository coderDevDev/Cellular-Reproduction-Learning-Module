'use client';

import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AuthAPI } from '@/lib/api/auth';
import { useState } from 'react';
import { RefreshCw, User, Shield, CheckCircle, XCircle } from 'lucide-react';

export default function DebugSessionInfo() {
  const { user, authState } = useAuth();
  const [sessionInfo, setSessionInfo] = useState<any>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refreshSession = async () => {
    setIsRefreshing(true);
    try {
      const result = await AuthAPI.refreshSession();
      setSessionInfo(result);
    } catch (error) {
      console.error('Session refresh error:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const validateSession = async () => {
    try {
      const result = await AuthAPI.validateSession();
      setSessionInfo(result);
    } catch (error) {
      console.error('Session validation error:', error);
    }
  };

  return (
    <Card className="border-2 border-yellow-200 bg-yellow-50">
      <CardHeader>
        <CardTitle className="text-lg flex items-center space-x-2">
          <Shield className="w-5 h-5 text-yellow-600" />
          <span>Debug Session Info</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Auth State */}
        <div>
          <h4 className="font-semibold text-sm mb-2">Auth State:</h4>
          <div className="space-y-1 text-xs">
            <div className="flex items-center space-x-2">
              <span>Loading:</span>
              <Badge variant={authState.isLoading ? 'default' : 'secondary'}>
                {authState.isLoading ? 'Yes' : 'No'}
              </Badge>
            </div>
            <div className="flex items-center space-x-2">
              <span>Authenticated:</span>
              <Badge
                variant={authState.isAuthenticated ? 'default' : 'destructive'}>
                {authState.isAuthenticated ? 'Yes' : 'No'}
              </Badge>
            </div>
            <div className="flex items-center space-x-2">
              <span>Error:</span>
              <span
                className={authState.error ? 'text-red-600' : 'text-green-600'}>
                {authState.error || 'None'}
              </span>
            </div>
          </div>
        </div>

        {/* User Data */}
        {user && (
          <div>
            <h4 className="font-semibold text-sm mb-2">User Data:</h4>
            <div className="space-y-1 text-xs">
              <div className="flex items-center space-x-2">
                <span>ID:</span>
                <span className="font-mono text-xs">{user.id}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span>Email:</span>
                <span>{user.email}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span>Role:</span>
                <Badge variant="outline">{user.role}</Badge>
              </div>
              <div className="flex items-center space-x-2">
                <span>Onboarding:</span>
                <Badge
                  variant={user.onboardingCompleted ? 'default' : 'destructive'}
                  className="flex items-center space-x-1">
                  {user.onboardingCompleted ? (
                    <>
                      <CheckCircle className="w-3 h-3" />
                      <span>Completed</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-3 h-3" />
                      <span>Not Completed</span>
                    </>
                  )}
                </Badge>
              </div>
              <div className="flex items-center space-x-2">
                <span>Learning Style:</span>
                <span>{user.learningStyle || 'Not Set'}</span>
              </div>
            </div>
          </div>
        )}

        {/* Session Actions */}
        <div className="space-y-2">
          <h4 className="font-semibold text-sm">Session Actions:</h4>
          <div className="flex space-x-2">
            <Button
              size="sm"
              variant="outline"
              onClick={validateSession}
              className="text-xs">
              Validate Session
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={refreshSession}
              disabled={isRefreshing}
              className="text-xs">
              <RefreshCw
                className={`w-3 h-3 mr-1 ${isRefreshing ? 'animate-spin' : ''}`}
              />
              Refresh Session
            </Button>
          </div>
        </div>

        {/* Session Info */}
        {sessionInfo && (
          <div>
            <h4 className="font-semibold text-sm mb-2">Session Info:</h4>
            <div className="bg-gray-100 p-2 rounded text-xs">
              <pre>{JSON.stringify(sessionInfo, null, 2)}</pre>
            </div>
          </div>
        )}

        {/* Raw User Object */}
        {user && (
          <div>
            <h4 className="font-semibold text-sm mb-2">Raw User Object:</h4>
            <div className="bg-gray-100 p-2 rounded text-xs max-h-32 overflow-y-auto">
              <pre>{JSON.stringify(user, null, 2)}</pre>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
