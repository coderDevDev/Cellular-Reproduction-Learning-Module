'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  PhilippineAddressSelector,
  AddressData
} from '@/components/ui/philippine-address-selector';
import { Badge } from '@/components/ui/badge';
import { MapPin, Info } from 'lucide-react';

export default function TestAddressSelectorPage() {
  const [addressData, setAddressData] = useState<AddressData>({});

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold text-[#333333] flex items-center justify-center gap-2">
            <MapPin className="w-8 h-8 text-[#00af8f]" />
            Philippine Address Selector Test
          </h1>
          <p className="text-[#666666] text-lg">
            Test the hierarchical address selection functionality using the
            select-philippines-address package
          </p>
        </div>

        {/* Information Card */}
        <Card className="border-2 border-[#00af8f]/20 bg-[#00af8f]/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[#00af8f]">
              <Info className="w-5 h-5" />
              How it works
            </CardTitle>
            <CardDescription className="text-[#666666]">
              The Philippine Address Selector provides hierarchical dropdowns
              that populate based on previous selections:
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <h4 className="font-semibold text-[#333333]">
                  Selection Flow:
                </h4>
                <ol className="list-decimal list-inside space-y-1 text-[#666666]">
                  <li>Select a Region</li>
                  <li>Choose a Province from that region</li>
                  <li>Pick a City/Municipality from that province</li>
                  <li>Select a Barangay from that city</li>
                </ol>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-[#333333]">Features:</h4>
                <ul className="list-disc list-inside space-y-1 text-[#666666]">
                  <li>Real-time data loading</li>
                  <li>Progress indicators</li>
                  <li>Complete address summary</li>
                  <li>Form integration</li>
                  <li>Error handling</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Address Selector */}
        <Card className="border-2 border-gray-200">
          <CardHeader>
            <CardTitle className="text-[#333333]">Address Selection</CardTitle>
            <CardDescription>
              Select your complete Philippine address using the dropdowns below
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PhilippineAddressSelector
              value={addressData}
              onChange={setAddressData}
              required={true}
              className="w-full"
            />
          </CardContent>
        </Card>

        {/* Results Display */}
        {addressData.region && (
          <Card className="border-2 border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="text-green-800 flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Selected Address
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {addressData.region && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-green-700">
                      Region
                    </Label>
                    <div className="p-3 bg-white rounded-lg border border-green-200">
                      <div className="font-medium text-[#333333]">
                        {addressData.region.region_name}
                      </div>
                      <div className="text-sm text-[#666666]">
                        Code: {addressData.region.region_code}
                      </div>
                    </div>
                  </div>
                )}

                {addressData.province && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-green-700">
                      Province
                    </Label>
                    <div className="p-3 bg-white rounded-lg border border-green-200">
                      <div className="font-medium text-[#333333]">
                        {addressData.province.province_name}
                      </div>
                      <div className="text-sm text-[#666666]">
                        Code: {addressData.province.province_code}
                      </div>
                    </div>
                  </div>
                )}

                {addressData.city && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-green-700">
                      City/Municipality
                    </Label>
                    <div className="p-3 bg-white rounded-lg border border-green-200">
                      <div className="font-medium text-[#333333]">
                        {addressData.city.city_name}
                      </div>
                      <div className="text-sm text-[#666666]">
                        Code: {addressData.city.city_code}
                      </div>
                    </div>
                  </div>
                )}

                {addressData.barangay && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-green-700">
                      Barangay
                    </Label>
                    <div className="p-3 bg-white rounded-lg border border-green-200">
                      <div className="font-medium text-[#333333]">
                        {addressData.barangay.brgy_name}
                      </div>
                      <div className="text-sm text-[#666666]">
                        Code: {addressData.barangay.brgy_code}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {addressData.region &&
                addressData.province &&
                addressData.city &&
                addressData.barangay && (
                  <div className="mt-4 p-4 bg-white rounded-lg border border-green-300">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge
                        variant="secondary"
                        className="bg-green-100 text-green-800">
                        Complete Address
                      </Badge>
                    </div>
                    <div className="text-lg font-medium text-[#333333]">
                      {addressData.barangay.brgy_name},{' '}
                      {addressData.city.city_name},{' '}
                      {addressData.province.province_name},{' '}
                      {addressData.region.region_name}
                    </div>
                  </div>
                )}
            </CardContent>
          </Card>
        )}

        {/* JSON Output */}
        <Card className="border-2 border-gray-200">
          <CardHeader>
            <CardTitle className="text-[#333333]">Raw Data</CardTitle>
            <CardDescription>
              JSON representation of the selected address data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
              {JSON.stringify(addressData, null, 2)}
            </pre>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Helper component for labels
function Label({
  children,
  className = ''
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={`text-sm font-medium ${className}`}>{children}</div>;
}
