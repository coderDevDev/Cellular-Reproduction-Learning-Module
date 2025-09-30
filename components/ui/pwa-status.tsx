'use client';

import { useState } from 'react';
import { usePWA } from '@/hooks/usePWA';
import { useCapacitor } from '@/hooks/useCapacitor';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import {
  Wifi,
  WifiOff,
  Download,
  RefreshCw,
  RotateCcw as Sync,
  Database,
  Settings,
  CheckCircle,
  AlertTriangle,
  Info,
  Cloud,
  CloudOff
} from 'lucide-react';

export function PWAStatus() {
  const {
    isOnline,
    isInstallable,
    isInstalled,
    isUpdateAvailable,
    syncInProgress,
    offlineQueue,
    installPWA,
    updatePWA,
    syncOfflineData,
    clearOfflineData
  } = usePWA();

  const { isNative, platform, deviceInfo, appState } = useCapacitor();

  const [showDetails, setShowDetails] = useState(false);

  // return (
  //   <TooltipProvider>
  //     <div className="fixed bottom-4 right-4 z-50">
  //       <Card className="bg-white/95 backdrop-blur-sm border-2 shadow-xl">
  //         <CardContent className="p-3">
  //           <div className="flex items-center gap-3">
  //             {/* Connection Status */}
  //             <Tooltip>
  //               <TooltipTrigger>
  //                 <div
  //                   className={`p-2 rounded-full ${
  //                     isOnline
  //                       ? 'bg-green-100 text-green-600'
  //                       : 'bg-red-100 text-red-600'
  //                   }`}>
  //                   {isOnline ? (
  //                     <Wifi className="w-4 h-4" />
  //                   ) : (
  //                     <WifiOff className="w-4 h-4" />
  //                   )}
  //                 </div>
  //               </TooltipTrigger>
  //               <TooltipContent>
  //                 {isOnline ? 'Online' : 'Offline'}
  //               </TooltipContent>
  //             </Tooltip>

  //             {/* Sync Status */}
  //             {syncInProgress && (
  //               <Tooltip>
  //                 <TooltipTrigger>
  //                   <div className="p-2 rounded-full bg-blue-100 text-blue-600">
  //                     <RefreshCw className="w-4 h-4 animate-spin" />
  //                   </div>
  //                 </TooltipTrigger>
  //                 <TooltipContent>Syncing data...</TooltipContent>
  //               </Tooltip>
  //             )}

  //             {/* Offline Queue */}
  //             {offlineQueue > 0 && (
  //               <Tooltip>
  //                 <TooltipTrigger>
  //                   <div className="relative">
  //                     <div className="p-2 rounded-full bg-orange-100 text-orange-600">
  //                       <Database className="w-4 h-4" />
  //                     </div>
  //                     <Badge
  //                       variant="destructive"
  //                       className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs flex items-center justify-center">
  //                       {offlineQueue}
  //                     </Badge>
  //                   </div>
  //                 </TooltipTrigger>
  //                 <TooltipContent>
  //                   {offlineQueue} items pending sync
  //                 </TooltipContent>
  //               </Tooltip>
  //             )}

  //             {/* PWA Install */}
  //             {isInstallable && (
  //               <Tooltip>
  //                 <TooltipTrigger>
  //                   <Button
  //                     size="sm"
  //                     variant="outline"
  //                     onClick={installPWA}
  //                     className="p-2 h-auto border-[#00af8f] text-[#00af8f] hover:bg-[#00af8f]/5">
  //                     <Download className="w-4 h-4" />
  //                   </Button>
  //                 </TooltipTrigger>
  //                 <TooltipContent>Install App</TooltipContent>
  //               </Tooltip>
  //             )}

  //             {/* PWA Update */}
  //             {isUpdateAvailable && (
  //               <Tooltip>
  //                 <TooltipTrigger>
  //                   <Button
  //                     size="sm"
  //                     variant="outline"
  //                     onClick={updatePWA}
  //                     className="p-2 h-auto border-green-500 text-green-600 hover:bg-green-50">
  //                     <RefreshCw className="w-4 h-4" />
  //                   </Button>
  //                 </TooltipTrigger>
  //                 <TooltipContent>Update Available</TooltipContent>
  //               </Tooltip>
  //             )}

  //             {/* Details Dialog */}
  //             <Dialog open={showDetails} onOpenChange={setShowDetails}>
  //               <DialogTrigger asChild>
  //                 <Button size="sm" variant="outline" className="p-2 h-auto">
  //                   <Settings className="w-4 h-4" />
  //                 </Button>
  //               </DialogTrigger>
  //               <DialogContent className="max-w-md">
  //                 <DialogHeader>
  //                   <DialogTitle className="flex items-center gap-2">
  //                     <Database className="w-5 h-5 text-[#00af8f]" />
  //                     PWA Status
  //                   </DialogTitle>
  //                   <DialogDescription>
  //                     Progressive Web App and offline functionality status
  //                   </DialogDescription>
  //                 </DialogHeader>

  //                 <div className="space-y-4">
  //                   {/* Connection Status */}
  //                   <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
  //                     <div className="flex items-center gap-2">
  //                       {isOnline ? (
  //                         <Cloud className="w-4 h-4 text-green-600" />
  //                       ) : (
  //                         <CloudOff className="w-4 h-4 text-red-600" />
  //                       )}
  //                       <span className="font-medium">Connection</span>
  //                     </div>
  //                     <Badge variant={isOnline ? 'default' : 'destructive'}>
  //                       {isOnline ? 'Online' : 'Offline'}
  //                     </Badge>
  //                   </div>

  //                   {/* Installation Status */}
  //                   <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
  //                     <div className="flex items-center gap-2">
  //                       <Download className="w-4 h-4 text-blue-600" />
  //                       <span className="font-medium">App Status</span>
  //                     </div>
  //                     <Badge
  //                       variant={
  //                         isNative
  //                           ? 'default'
  //                           : isInstalled
  //                           ? 'default'
  //                           : 'secondary'
  //                       }>
  //                       {isNative
  //                         ? `Native ${platform}`
  //                         : isInstalled
  //                         ? 'Installed'
  //                         : 'Browser'}
  //                     </Badge>
  //                   </div>

  //                   {/* Platform Info (Capacitor) */}
  //                   {isNative && (
  //                     <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
  //                       <div className="flex items-center gap-2">
  //                         <CheckCircle className="w-4 h-4 text-green-600" />
  //                         <span className="font-medium">Platform</span>
  //                       </div>
  //                       <Badge variant="default">
  //                         {platform.toUpperCase()} {deviceInfo?.osVersion}
  //                       </Badge>
  //                     </div>
  //                   )}

  //                   {/* Sync Status */}
  //                   <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
  //                     <div className="flex items-center gap-2">
  //                       <Sync className="w-4 h-4 text-orange-600" />
  //                       <span className="font-medium">Pending Sync</span>
  //                     </div>
  //                     <Badge
  //                       variant={offlineQueue > 0 ? 'destructive' : 'default'}>
  //                       {offlineQueue} items
  //                     </Badge>
  //                   </div>

  //                   {/* Actions */}
  //                   <div className="space-y-2">
  //                     {isInstallable && (
  //                       <Button
  //                         onClick={installPWA}
  //                         className="w-full bg-[#00af8f] hover:bg-[#00af90] text-white">
  //                         <Download className="w-4 h-4 mr-2" />
  //                         Install App
  //                       </Button>
  //                     )}

  //                     {isUpdateAvailable && (
  //                       <Button
  //                         onClick={updatePWA}
  //                         variant="outline"
  //                         className="w-full border-green-500 text-green-600 hover:bg-green-50">
  //                         <RefreshCw className="w-4 h-4 mr-2" />
  //                         Update App
  //                       </Button>
  //                     )}

  //                     {isOnline && offlineQueue > 0 && (
  //                       <Button
  //                         onClick={syncOfflineData}
  //                         variant="outline"
  //                         className="w-full"
  //                         disabled={syncInProgress}>
  //                         {syncInProgress ? (
  //                           <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
  //                         ) : (
  //                           <Sync className="w-4 h-4 mr-2" />
  //                         )}
  //                         Sync Data ({offlineQueue})
  //                       </Button>
  //                     )}

  //                     <Button
  //                       onClick={clearOfflineData}
  //                       variant="outline"
  //                       className="w-full text-red-600 border-red-300 hover:bg-red-50">
  //                       <Database className="w-4 h-4 mr-2" />
  //                       Clear Offline Data
  //                     </Button>
  //                   </div>

  //                   {/* Info */}
  //                   <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
  //                     <div className="flex items-start gap-2">
  //                       <Info className="w-4 h-4 text-blue-600 mt-0.5" />
  //                       <div className="text-sm text-blue-700">
  //                         <p className="font-medium mb-1">Offline Mode</p>
  //                         <p>
  //                           You can add and edit senior citizen records even
  //                           without internet. Data will sync automatically when
  //                           connection returns.
  //                         </p>
  //                       </div>
  //                     </div>
  //                   </div>
  //                 </div>
  //               </DialogContent>
  //             </Dialog>
  //           </div>
  //         </CardContent>
  //       </Card>
  //     </div>
  //   </TooltipProvider>
  // );

  return null;
}

// Mini PWA Status for use in headers/navbars
export function MiniPWAStatus() {
  const { isOnline, offlineQueue, syncInProgress } = usePWA();

  return (
    <TooltipProvider>
      <div className="flex items-center gap-2">
        <Tooltip>
          <TooltipTrigger>
            <div
              className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                isOnline
                  ? 'bg-green-100 text-green-700'
                  : 'bg-red-100 text-red-700'
              }`}>
              {isOnline ? (
                <Wifi className="w-3 h-3" />
              ) : (
                <WifiOff className="w-3 h-3" />
              )}
              {isOnline ? 'Online' : 'Offline'}
            </div>
          </TooltipTrigger>
          <TooltipContent>
            {isOnline ? 'Connected to internet' : 'Working offline'}
          </TooltipContent>
        </Tooltip>

        {(offlineQueue > 0 || syncInProgress) && (
          <Tooltip>
            <TooltipTrigger>
              <div className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
                {syncInProgress ? (
                  <RefreshCw className="w-3 h-3 animate-spin" />
                ) : (
                  <Database className="w-3 h-3" />
                )}
                {syncInProgress ? 'Syncing' : `${offlineQueue} pending`}
              </div>
            </TooltipTrigger>
            <TooltipContent>
              {syncInProgress
                ? 'Syncing offline data...'
                : `${offlineQueue} items waiting to sync`}
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </TooltipProvider>
  );
}
