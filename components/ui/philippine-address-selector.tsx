'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Loader2, MapPin, Building, Home, Navigation } from 'lucide-react';
import {
  regions,
  provinces,
  cities,
  barangays
} from 'select-philippines-address';

export interface AddressData {
  region?: {
    region_code: string;
    region_name: string;
  };
  province?: {
    province_code: string;
    province_name: string;
  };
  city?: {
    city_code: string;
    city_name: string;
  };
  barangay?: {
    brgy_code: string;
    brgy_name: string;
  };
}

interface PhilippineAddressSelectorProps {
  value?: AddressData;
  onChange: (address: AddressData) => void;
  disabled?: boolean;
  className?: string;
  showLabels?: boolean;
  required?: boolean;
}

export function PhilippineAddressSelector({
  value,
  onChange,
  disabled = false,
  className = '',
  showLabels = false,
  required = false
}: PhilippineAddressSelectorProps) {
  // Safety check for onChange
  if (typeof onChange !== 'function') {
    console.error('PhilippineAddressSelector: onChange must be a function');
    return null;
  }

  // Ensure value is always an object
  const safeValue = value || {};

  const [regionsList, setRegionsList] = useState<any[]>([]);
  const [provincesList, setProvincesList] = useState<any[]>([]);
  const [citiesList, setCitiesList] = useState<any[]>([]);
  const [barangaysList, setBarangaysList] = useState<any[]>([]);

  const [loadingRegions, setLoadingRegions] = useState(false);
  const [loadingProvinces, setLoadingProvinces] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);
  const [loadingBarangays, setLoadingBarangays] = useState(false);

  console.log({ citiesList });
  console.log({ barangaysList });
  // Load regions on component mount
  useEffect(() => {
    loadRegions();
  }, []);

  // Load provinces when region changes
  useEffect(() => {
    if (safeValue?.region?.region_code) {
      loadProvinces(safeValue.region.region_code);
    } else {
      setProvincesList([]);
      setCitiesList([]);
      setBarangaysList([]);
    }
  }, [safeValue?.region?.region_code]);

  // Load cities when province changes
  useEffect(() => {
    if (safeValue?.province?.province_code) {
      loadCities(safeValue.province.province_code);
    } else {
      setCitiesList([]);
      setBarangaysList([]);
    }
  }, [safeValue?.province?.province_code]);

  // Load barangays when city changes
  useEffect(() => {
    if (safeValue?.city?.city_code) {
      loadBarangays(safeValue.city.city_code);
    } else {
      setBarangaysList([]);
    }
  }, [safeValue?.city?.city_code]);

  const loadRegions = async () => {
    setLoadingRegions(true);
    try {
      const regionsData = await regions();
      if (Array.isArray(regionsData)) {
        setRegionsList(regionsData);
      }
    } catch (error) {
      console.error('Error loading regions:', error);
    } finally {
      setLoadingRegions(false);
    }
  };

  const loadProvinces = async (regionCode: string) => {
    setLoadingProvinces(true);
    try {
      const provincesData = await provinces(regionCode);
      if (Array.isArray(provincesData)) {
        setProvincesList(provincesData);
      }
    } catch (error) {
      console.error('Error loading provinces:', error);
    } finally {
      setLoadingProvinces(false);
    }
  };

  const loadCities = async (provinceCode: string) => {
    setLoadingCities(true);
    try {
      const citiesData = await cities(provinceCode);
      if (Array.isArray(citiesData)) {
        setCitiesList(citiesData);
      }
    } catch (error) {
      console.error('Error loading cities:', error);
    } finally {
      setLoadingCities(false);
    }
  };

  const loadBarangays = async (cityCode: string) => {
    setLoadingBarangays(true);
    try {
      const barangaysData = await barangays(cityCode);
      if (Array.isArray(barangaysData)) {
        setBarangaysList(barangaysData);
      }
    } catch (error) {
      console.error('Error loading barangays:', error);
    } finally {
      setLoadingBarangays(false);
    }
  };

  const handleRegionChange = (regionCode: string) => {
    const selectedRegion = regionsList.find(r => r.region_code === regionCode);
    onChange({
      region: selectedRegion,
      province: undefined,
      city: undefined,
      barangay: undefined
    });
  };

  const handleProvinceChange = (provinceCode: string) => {
    const selectedProvince = provincesList.find(
      p => p.province_code === provinceCode
    );
    onChange({
      ...safeValue,
      province: selectedProvince,
      city: undefined,
      barangay: undefined
    });
  };

  const handleCityChange = (cityCode: string) => {
    const selectedCity = citiesList.find(c => c.city_code === cityCode);
    onChange({
      ...safeValue,
      city: selectedCity,
      barangay: undefined
    });
  };

  const handleBarangayChange = (barangayCode: string) => {
    const selectedBarangay = barangaysList.find(
      b => b.brgy_code === barangayCode
    );
    onChange({
      ...safeValue,
      barangay: selectedBarangay
    });
  };

  const getDisplayValue = (
    type: 'region' | 'province' | 'city' | 'barangay'
  ) => {
    const data = safeValue?.[type];
    if (!data) return '';

    switch (type) {
      case 'region':
        return 'region_name' in data ? data.region_name : '';
      case 'province':
        return 'province_name' in data ? data.province_name : '';
      case 'city':
        return 'city_name' in data ? data.city_name : '';
      case 'barangay':
        return 'brgy_name' in data ? data.brgy_name : '';
      default:
        return '';
    }
  };

  const isComplete =
    safeValue?.region &&
    safeValue?.province &&
    safeValue?.city &&
    safeValue?.barangay;

  return (
    <div className={`space-y-4 ${className}`}>
      {showLabels && (
        <div className="flex items-center space-x-2">
          <MapPin className="w-4 h-4 text-[#00af8f]" />
          <Label className="text-sm font-medium">Philippine Address</Label>
          {required && <span className="text-red-500">*</span>}
        </div>
      )}

      <Card className="border border-gray-200">
        <CardContent className="p-4 space-y-4">
          {/* Region Selection */}
          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center space-x-2">
              <Navigation className="w-4 h-4 text-[#00af8f]" />
              <span>Region</span>
              {required && <span className="text-red-500">*</span>}
            </Label>
            <Select
              value={safeValue?.region?.region_code || ''}
              onValueChange={handleRegionChange}
              disabled={disabled || loadingRegions}>
              <SelectTrigger className="w-full">
                <SelectValue
                  placeholder={
                    loadingRegions ? 'Loading regions...' : 'Select region'
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {regionsList.map(region => (
                  <SelectItem
                    key={region.region_code}
                    value={region.region_code}>
                    {region.region_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {loadingRegions && (
              <div className="flex items-center space-x-2 text-xs text-gray-500">
                <Loader2 className="w-3 h-3 animate-spin" />
                <span>Loading regions...</span>
              </div>
            )}
          </div>

          {/* Province Selection */}
          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center space-x-2">
              <Building className="w-4 h-4 text-[#00af8f]" />
              <span>Province</span>
              {required && <span className="text-red-500">*</span>}
            </Label>
            <Select
              value={safeValue?.province?.province_code || ''}
              onValueChange={handleProvinceChange}
              disabled={disabled || loadingProvinces || !safeValue?.region}>
              <SelectTrigger className="w-full">
                <SelectValue
                  placeholder={
                    !safeValue?.region
                      ? 'Select region first'
                      : loadingProvinces
                      ? 'Loading provinces...'
                      : 'Select province'
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {provincesList.map(province => (
                  <SelectItem
                    key={province.province_code}
                    value={province.province_code}>
                    {province.province_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {loadingProvinces && (
              <div className="flex items-center space-x-2 text-xs text-gray-500">
                <Loader2 className="w-3 h-3 animate-spin" />
                <span>Loading provinces...</span>
              </div>
            )}
          </div>

          {/* City Selection */}
          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center space-x-2">
              <Building className="w-4 h-4 text-[#00af8f]" />
              <span>City/Municipality</span>
              {required && <span className="text-red-500">*</span>}
            </Label>
            <Select
              value={safeValue?.city?.city_code || ''}
              onValueChange={handleCityChange}
              disabled={disabled || loadingCities || !safeValue?.province}>
              <SelectTrigger className="w-full">
                <SelectValue
                  placeholder={
                    !safeValue?.province
                      ? 'Select province first'
                      : loadingCities
                      ? 'Loading cities...'
                      : 'Select city/municipality'
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {citiesList.map(city => (
                  <SelectItem key={city.city_code} value={city.city_code}>
                    {city.city_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {loadingCities && (
              <div className="flex items-center space-x-2 text-xs text-gray-500">
                <Loader2 className="w-3 h-3 animate-spin" />
                <span>Loading cities...</span>
              </div>
            )}
          </div>

          {/* Barangay Selection */}
          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center space-x-2">
              <Home className="w-4 h-4 text-[#00af8f]" />
              <span>Barangay</span>
              {required && <span className="text-red-500">*</span>}
            </Label>
            <Select
              value={safeValue?.barangay?.brgy_code || ''}
              onValueChange={handleBarangayChange}
              disabled={disabled || loadingBarangays || !safeValue?.city}>
              <SelectTrigger className="w-full">
                <SelectValue
                  placeholder={
                    !safeValue?.city
                      ? 'Select city first'
                      : loadingBarangays
                      ? 'Loading barangays...'
                      : 'Select barangay'
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {barangaysList.map(barangay => (
                  <SelectItem
                    key={barangay.brgy_code}
                    value={barangay.brgy_code}>
                    {barangay.brgy_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {loadingBarangays && (
              <div className="flex items-center space-x-2 text-xs text-gray-500">
                <Loader2 className="w-3 h-3 animate-spin" />
                <span>Loading barangays...</span>
              </div>
            )}
          </div>

          {/* Address Summary */}
          {/* {isComplete && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <MapPin className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-800">
                  Complete Address
                </span>
                <Badge variant="secondary" className="text-xs">
                  Complete
                </Badge>
              </div>
              <div className="text-sm text-green-700 space-y-1">
                <div>{value.barangay?.brgy_name}</div>
                <div>{value.city?.city_name}</div>
                <div>{value.province?.province_name}</div>
                <div>{value.region?.region_name}</div>
              </div>
            </div>
          )} */}
        </CardContent>
      </Card>
    </div>
  );
}
