'use client';

import type React from 'react';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, Save } from 'lucide-react';
import type { Property } from '@/types/property';
import { ImageUpload } from '@/components/image-upload';

interface PropertyFormProps {
  onBack: () => void;
  onSubmit: (data: any) => void;
  title: string;
  initialData?: Property;
}

const steps = [
  { label: 'Basic Info' },
  { label: 'Unit Info' },
  { label: 'Description' },
  { label: 'Amenities' },
  { label: 'Images' }
];

export function PropertyForm({
  onBack,
  onSubmit,
  title,
  initialData
}: PropertyFormProps) {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    type: initialData?.type || 'residential',
    address: initialData?.address || '',
    totalUnits: initialData?.totalUnits || 0,
    occupiedUnits: initialData?.occupiedUnits || 0,
    monthlyRent: initialData?.monthlyRent || 0,
    status: initialData?.status || 'active',
    description: initialData?.description || '',
    amenities: initialData?.amenities || [],
    images: initialData?.images || [],
    thumbnail: initialData?.thumbnail || ''
  });

  const [selectedAmenities, setSelectedAmenities] = useState<string[]>(
    initialData?.amenities || []
  );
  const [currentStep, setCurrentStep] = useState(0);

  const availableAmenities = [
    'WiFi',
    'Parking',
    'Security',
    'Elevator',
    'Swimming Pool',
    'Gym',
    'Laundry',
    'Cafeteria',
    'Study Areas',
    'Playground',
    'Conference Rooms',
    '24/7 Security',
    'CCTV',
    'Generator'
  ];

  const isLastStep = currentStep === steps.length - 1;
  const isFirstStep = currentStep === 0;

  const nextStep = () => setCurrentStep(s => Math.min(s + 1, steps.length - 1));
  const prevStep = () => setCurrentStep(s => Math.max(s - 1, 0));

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAmenityChange = (amenity: string, checked: boolean) => {
    if (checked) {
      setSelectedAmenities(prev => [...prev, amenity]);
    } else {
      setSelectedAmenities(prev => prev.filter(a => a !== amenity));
    }
  };

  const handleImagesChange = (images: string[], thumbnail: string) => {
    setFormData(prev => ({
      ...prev,
      images,
      thumbnail
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const defaultThumbnail =
      formData.thumbnail ||
      (formData.type === 'residential'
        ? '/placeholder.svg?height=200&width=300&text=Residential+Property'
        : formData.type === 'commercial'
        ? '/placeholder.svg?height=200&width=300&text=Commercial+Property'
        : formData.type === 'dormitory'
        ? '/placeholder.svg?height=200&width=300&text=Dormitory+Property'
        : '/placeholder.svg?height=200&width=300&text=Property+Image');

    onSubmit({
      ...formData,
      amenities: selectedAmenities,
      totalUnits: Number(formData.totalUnits),
      occupiedUnits: Number(formData.occupiedUnits),
      monthlyRent: Number(formData.monthlyRent),
      images: formData.images.length > 0 ? formData.images : [defaultThumbnail],
      thumbnail: formData.thumbnail || defaultThumbnail
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex flex-col items-center py-8 px-2">
      <Card className="w-full max-w-2xl mx-auto rounded-2xl shadow-2xl border-0 bg-white/90 backdrop-blur-md">
        <CardHeader className="flex flex-col items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-t-2xl shadow">
          <div className="flex items-center w-full">
            <Button
              variant="ghost"
              size="icon"
              onClick={onBack}
              className="text-white hover:bg-white/10 rounded-full">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <CardTitle className="flex-1 text-center text-white text-2xl font-extrabold tracking-tight">
              {title}
            </CardTitle>
            <div className="w-10" /> {/* Spacer for symmetry */}
          </div>
        </CardHeader>
        <CardContent className="p-6 lg:p-10">
          {/* Stepper */}
          <div className="flex items-center justify-center gap-4 mb-8">
            {steps.map((step, idx) => (
              <div key={step.label} className="flex items-center">
                <div
                  className={`w-8 h-8 flex items-center justify-center rounded-full font-bold
                    ${
                      idx === currentStep
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'bg-gray-200 text-gray-500'
                    }
                  `}>
                  {idx + 1}
                </div>
                {idx < steps.length - 1 && (
                  <div
                    className={`w-10 h-1 ${
                      idx < currentStep ? 'bg-blue-500' : 'bg-gray-200'
                    } rounded`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between max-w-xl mx-auto mb-4">
            {steps.map((step, idx) => (
              <span
                key={step.label}
                className={`text-xs font-semibold ${
                  idx === currentStep ? 'text-blue-700' : 'text-gray-400'
                }`}
                style={{
                  width: `${100 / steps.length}%`,
                  textAlign: 'center'
                }}>
                {step.label}
              </span>
            ))}
          </div>
          {/* Progress Bar */}
          <div className="w-full max-w-xl mx-auto mb-8">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${((currentStep + 1) / steps.length) * 100}%`
                }}
              />
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Step 1: Basic Info */}
            {currentStep === 0 && (
              <div>
                <h2 className="text-lg font-bold text-blue-700 mb-4">
                  Basic Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label
                      htmlFor="name"
                      className="font-semibold text-gray-700">
                      Property Name
                    </Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={e => handleInputChange('name', e.target.value)}
                      placeholder="Enter property name"
                      required
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label
                      htmlFor="type"
                      className="font-semibold text-gray-700">
                      Property Type
                    </Label>
                    <Select
                      value={formData.type}
                      onValueChange={value => handleInputChange('type', value)}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select property type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="residential">Residential</SelectItem>
                        <SelectItem value="commercial">Commercial</SelectItem>
                        <SelectItem value="dormitory">Dormitory</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="md:col-span-2">
                    <Label
                      htmlFor="address"
                      className="font-semibold text-gray-700">
                      Address
                    </Label>
                    <Textarea
                      id="address"
                      value={formData.address}
                      onChange={e =>
                        handleInputChange('address', e.target.value)
                      }
                      placeholder="Enter complete address"
                      required
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label
                      htmlFor="status"
                      className="font-semibold text-gray-700">
                      Status
                    </Label>
                    <Select
                      value={formData.status}
                      onValueChange={value =>
                        handleInputChange('status', value)
                      }>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="maintenance">
                          Under Maintenance
                        </SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Unit Info */}
            {currentStep === 1 && (
              <div>
                <h2 className="text-lg font-bold text-blue-700 mb-4">
                  Unit Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label
                      htmlFor="totalUnits"
                      className="font-semibold text-gray-700">
                      Total Units
                    </Label>
                    <Input
                      id="totalUnits"
                      type="number"
                      value={formData.totalUnits}
                      onChange={e =>
                        handleInputChange('totalUnits', e.target.value)
                      }
                      placeholder="0"
                      min="1"
                      required
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label
                      htmlFor="occupiedUnits"
                      className="font-semibold text-gray-700">
                      Occupied Units
                    </Label>
                    <Input
                      id="occupiedUnits"
                      type="number"
                      value={formData.occupiedUnits}
                      onChange={e =>
                        handleInputChange('occupiedUnits', e.target.value)
                      }
                      placeholder="0"
                      min="0"
                      max={formData.totalUnits}
                      className="mt-1"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label
                      htmlFor="monthlyRent"
                      className="font-semibold text-gray-700">
                      Monthly Rent (₱)
                    </Label>
                    <Input
                      id="monthlyRent"
                      type="number"
                      value={formData.monthlyRent}
                      onChange={e =>
                        handleInputChange('monthlyRent', e.target.value)
                      }
                      placeholder="0"
                      min="0"
                      required
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Description */}
            {currentStep === 2 && (
              <div>
                <h2 className="text-lg font-bold text-blue-700 mb-4">
                  Description
                </h2>
                <Textarea
                  value={formData.description}
                  onChange={e =>
                    handleInputChange('description', e.target.value)
                  }
                  placeholder="Describe your property..."
                  rows={4}
                  className="resize-none"
                />
              </div>
            )}

            {/* Step 4: Amenities */}
            {currentStep === 3 && (
              <div>
                <h2 className="text-lg font-bold text-blue-700 mb-4">
                  Amenities
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {availableAmenities.map(amenity => (
                    <div key={amenity} className="flex items-center space-x-2">
                      <Checkbox
                        id={amenity}
                        checked={selectedAmenities.includes(amenity)}
                        onCheckedChange={checked =>
                          handleAmenityChange(amenity, checked as boolean)
                        }
                      />
                      <Label
                        htmlFor={amenity}
                        className="text-sm text-gray-700 cursor-pointer">
                        {amenity}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Step 5: Images */}
            {currentStep === 4 && (
              <div>
                <h2 className="text-lg font-bold text-blue-700 mb-4">
                  Property Images
                </h2>
                <ImageUpload
                  images={formData.images}
                  thumbnail={formData.thumbnail}
                  onImagesChange={handleImagesChange}
                  maxImages={8}
                />
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={isFirstStep ? onBack : prevStep}
                className="flex-1 bg-transparent border-gray-300 text-gray-700 hover:bg-gray-100">
                {isFirstStep ? 'Cancel' : 'Back'}
              </Button>
              {!isLastStep ? (
                <Button
                  type="button"
                  onClick={nextStep}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold shadow-lg rounded-lg">
                  Next
                </Button>
              ) : (
                <Button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold shadow-lg rounded-lg">
                  <Save className="w-4 h-4 mr-2" />
                  {initialData ? 'Update Property' : 'Add Property'}
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
