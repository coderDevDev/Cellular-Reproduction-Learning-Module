'use client';

import { useState, useEffect, useCallback } from 'react';
import { Capacitor } from '@capacitor/core';
import { Network } from '@capacitor/network';
import { App } from '@capacitor/app';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';
import { Device } from '@capacitor/device';
import { Preferences } from '@capacitor/preferences';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';

export interface CapacitorState {
  isNative: boolean;
  platform: 'web' | 'ios' | 'android';
  isOnline: boolean;
  deviceInfo: any;
  appState: 'active' | 'background';
}

export interface CapacitorActions {
  takePicture: (options?: any) => Promise<string | null>;
  saveFile: (
    data: string,
    fileName: string,
    directory?: Directory
  ) => Promise<string | null>;
  readFile: (fileName: string, directory?: Directory) => Promise<string | null>;
  setPreference: (key: string, value: string) => Promise<void>;
  getPreference: (key: string) => Promise<string | null>;
  hideStatusBar: () => Promise<void>;
  showStatusBar: () => Promise<void>;
  setStatusBarStyle: (style: Style) => Promise<void>;
  hideSplashScreen: () => Promise<void>;
}

export function useCapacitor(): CapacitorState & CapacitorActions {
  const [state, setState] = useState<CapacitorState>({
    isNative: false,
    platform: 'web',
    isOnline: true,
    deviceInfo: null,
    appState: 'active'
  });

  // Initialize Capacitor
  useEffect(() => {
    const initCapacitor = async () => {
      const isNative = Capacitor.isNativePlatform();
      const platform = Capacitor.getPlatform() as 'web' | 'ios' | 'android';

      setState(prev => ({
        ...prev,
        isNative,
        platform
      }));

      if (isNative) {
        try {
          // Get device info
          const deviceInfo = await Device.getInfo();
          setState(prev => ({ ...prev, deviceInfo }));

          // Set up network monitoring
          const networkStatus = await Network.getStatus();
          setState(prev => ({ ...prev, isOnline: networkStatus.connected }));

          Network.addListener('networkStatusChange', status => {
            setState(prev => ({ ...prev, isOnline: status.connected }));
          });

          // Set up app state monitoring
          App.addListener('appStateChange', ({ isActive }) => {
            setState(prev => ({
              ...prev,
              appState: isActive ? 'active' : 'background'
            }));
          });

          // Configure status bar
          await StatusBar.setStyle({ style: Style.Dark });
          await StatusBar.setBackgroundColor({ color: '#00af8f' });

          // Hide splash screen after a delay
          setTimeout(async () => {
            await SplashScreen.hide();
          }, 2000);
        } catch (error) {
          console.error('Capacitor initialization error:', error);
        }
      }
    };

    initCapacitor();

    // Cleanup listeners on unmount
    return () => {
      if (Capacitor.isNativePlatform()) {
        Network.removeAllListeners();
        App.removeAllListeners();
      }
    };
  }, []);

  // Take picture function
  const takePicture = useCallback(async (options = {}) => {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera,
        ...options
      });

      return image.dataUrl || null;
    } catch (error) {
      console.error('Camera error:', error);
      return null;
    }
  }, []);

  // Save file function
  const saveFile = useCallback(
    async (
      data: string,
      fileName: string,
      directory: Directory = Directory.Data
    ) => {
      try {
        const result = await Filesystem.writeFile({
          path: fileName,
          data: data,
          directory: directory,
          encoding: Encoding.UTF8
        });

        return result.uri;
      } catch (error) {
        console.error('File save error:', error);
        return null;
      }
    },
    []
  );

  // Read file function
  const readFile = useCallback(
    async (fileName: string, directory: Directory = Directory.Data) => {
      try {
        const result = await Filesystem.readFile({
          path: fileName,
          directory: directory,
          encoding: Encoding.UTF8
        });

        return result.data as string;
      } catch (error) {
        console.error('File read error:', error);
        return null;
      }
    },
    []
  );

  // Preferences functions
  const setPreference = useCallback(async (key: string, value: string) => {
    try {
      await Preferences.set({ key, value });
    } catch (error) {
      console.error('Preference set error:', error);
    }
  }, []);

  const getPreference = useCallback(async (key: string) => {
    try {
      const result = await Preferences.get({ key });
      return result.value;
    } catch (error) {
      console.error('Preference get error:', error);
      return null;
    }
  }, []);

  // Status bar functions
  const hideStatusBar = useCallback(async () => {
    if (Capacitor.isNativePlatform()) {
      try {
        await StatusBar.hide();
      } catch (error) {
        console.error('Status bar hide error:', error);
      }
    }
  }, []);

  const showStatusBar = useCallback(async () => {
    if (Capacitor.isNativePlatform()) {
      try {
        await StatusBar.show();
      } catch (error) {
        console.error('Status bar show error:', error);
      }
    }
  }, []);

  const setStatusBarStyle = useCallback(async (style: Style) => {
    if (Capacitor.isNativePlatform()) {
      try {
        await StatusBar.setStyle({ style });
      } catch (error) {
        console.error('Status bar style error:', error);
      }
    }
  }, []);

  const hideSplashScreen = useCallback(async () => {
    if (Capacitor.isNativePlatform()) {
      try {
        await SplashScreen.hide();
      } catch (error) {
        console.error('Splash screen hide error:', error);
      }
    }
  }, []);

  return {
    ...state,
    takePicture,
    saveFile,
    readFile,
    setPreference,
    getPreference,
    hideStatusBar,
    showStatusBar,
    setStatusBarStyle,
    hideSplashScreen
  };
}

// Utility function to check if running in Capacitor
export const isCapacitor = () => Capacitor.isNativePlatform();

// Utility function to get platform
export const getPlatform = () => Capacitor.getPlatform();

// Enhanced file system utilities for offline storage
export class CapacitorStorage {
  static async saveJSON(
    key: string,
    data: any,
    directory: Directory = Directory.Data
  ): Promise<boolean> {
    try {
      const jsonString = JSON.stringify(data);
      await Filesystem.writeFile({
        path: `${key}.json`,
        data: jsonString,
        directory,
        encoding: Encoding.UTF8
      });
      return true;
    } catch (error) {
      console.error('JSON save error:', error);
      return false;
    }
  }

  static async loadJSON(
    key: string,
    directory: Directory = Directory.Data
  ): Promise<any | null> {
    try {
      const result = await Filesystem.readFile({
        path: `${key}.json`,
        directory,
        encoding: Encoding.UTF8
      });
      return JSON.parse(result.data as string);
    } catch (error) {
      console.error('JSON load error:', error);
      return null;
    }
  }

  static async deleteFile(
    fileName: string,
    directory: Directory = Directory.Data
  ): Promise<boolean> {
    try {
      await Filesystem.deleteFile({
        path: fileName,
        directory
      });
      return true;
    } catch (error) {
      console.error('File delete error:', error);
      return false;
    }
  }

  static async listFiles(
    directory: Directory = Directory.Data
  ): Promise<string[]> {
    try {
      const result = await Filesystem.readdir({
        path: '',
        directory
      });
      return result.files.map(file => file.name);
    } catch (error) {
      console.error('List files error:', error);
      return [];
    }
  }
}
