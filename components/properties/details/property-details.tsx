'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { Property, Tenant } from '@/types/property';
import {
  ArrowLeft,
  Edit,
  MapPin,
  Building,
  Users,
  DollarSign,
  Calendar,
  Phone,
  Mail,
  User
} from 'lucide-react';
import { useState } from 'react';

interface PropertyDetailsProps {
  property: Property;
  tenants: Tenant[];
  onBack: () => void;
  onEdit: () => void;
}

export function PropertyDetails({
  property,
  tenants,
  onBack,
  onEdit
}: PropertyDetailsProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const occupancyRate = (property.occupiedUnits / property.totalUnits) * 100;
  const totalMonthlyIncome = tenants.reduce(
    (sum, tenant) => sum + tenant.monthlyRent,
    0
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-700';
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-700';
      case 'inactive':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'residential':
        return 'bg-blue-100 text-blue-700';
      case 'commercial':
        return 'bg-purple-100 text-purple-700';
      case 'dormitory':
        return 'bg-orange-100 text-orange-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getTenantStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-700';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'terminated':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Hero Banner */}
      <div className="relative w-full h-56 lg:h-80 mb-8">
        <img
          src={property.images[selectedImageIndex] || property.thumbnail}
          alt={property.name}
          className="w-full h-full object-cover object-center rounded-b-2xl"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent rounded-b-2xl" />
        <div className="absolute top-4 left-4 flex gap-2 z-10">
          <Badge className={getStatusColor(property.status) + ' shadow'}>
            {property.status}
          </Badge>
          <Badge className={getTypeColor(property.type) + ' shadow'}>
            {property.type}
          </Badge>
        </div>
        <div className="absolute top-4 right-4 flex gap-2 z-10">
          <Button
            size="icon"
            variant="secondary"
            onClick={onEdit}
            className="bg-white/80 hover:bg-blue-600 hover:text-white text-blue-600 shadow rounded-full"
            aria-label="Edit">
            <Edit className="w-5 h-5" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={onBack}
            className="bg-white/80 hover:bg-gray-200 text-gray-700 shadow rounded-full"
            aria-label="Back">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </div>
        <div className="absolute bottom-4 left-4 z-10">
          <h1 className="text-3xl lg:text-4xl font-extrabold text-white drop-shadow-lg">
            {property.name}
          </h1>
          <div className="flex items-center gap-2 text-white/90 mt-2">
            <MapPin className="w-5 h-5" />
            <span className="text-lg">{property.address}</span>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-2 lg:px-0 space-y-8">
        {/* Gallery Thumbnails */}
        {property.images.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-2">
            {property.images.map((image, index) => (
              <button
                key={index}
                onClick={() => setSelectedImageIndex(index)}
                className={`flex-shrink-0 w-20 h-16 rounded-xl border-2 overflow-hidden ${
                  selectedImageIndex === index
                    ? 'border-blue-500'
                    : 'border-gray-200 hover:border-gray-300'
                }`}>
                <img
                  src={image || '/placeholder.svg'}
                  alt={`Thumbnail ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        )}

        {/* Description & Amenities */}
        <Card className="rounded-2xl shadow-xl border-0 bg-white/90">
          <CardContent className="p-6">
            {property.description && (
              <div className="mb-4">
                <h3 className="text-xl font-bold text-blue-700 mb-2">
                  Description
                </h3>
                <p className="text-gray-700 text-base">
                  {property.description}
                </p>
              </div>
            )}
            {property.amenities.length > 0 && (
              <div>
                <h3 className="text-xl font-bold text-blue-700 mb-2">
                  Amenities
                </h3>
                <div className="flex flex-wrap gap-2">
                  {property.amenities.map((amenity, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="bg-blue-50 text-blue-700">
                      {amenity}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="rounded-2xl shadow-xl border-0 bg-white/90">
            <CardContent className="p-6 text-center">
              <Building className="w-8 h-8 text-blue-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {property.occupiedUnits}/{property.totalUnits}
              </div>
              <p className="text-gray-500 text-xs">Units Occupied</p>
              <div className="mt-2">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full"
                    style={{ width: `${occupancyRate}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {occupancyRate.toFixed(1)}% Occupancy
                </p>
              </div>
            </CardContent>
          </Card>
          <Card className="rounded-2xl shadow-xl border-0 bg-white/90">
            <CardContent className="p-6 text-center">
              <DollarSign className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900 mb-1">
                ₱{totalMonthlyIncome.toLocaleString()}
              </div>
              <p className="text-gray-500 text-xs">Monthly Income</p>
              <p className="text-xs text-gray-500 mt-1">
                Base Rate: ₱{property.monthlyRent.toLocaleString()}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tenants */}
        <Card className="rounded-2xl shadow-xl border-0 bg-white/90">
          <CardHeader>
            <CardTitle className="text-blue-700 flex items-center gap-2">
              <Users className="w-5 h-5" />
              Tenants ({tenants.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {tenants.length > 0 ? (
              <div className="space-y-4">
                {tenants.map(tenant => (
                  <div
                    key={tenant.id}
                    className="flex items-center gap-4 p-3 bg-blue-50 rounded-lg">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src="/placeholder.svg?height=48&width=48" />
                      <AvatarFallback className="bg-blue-500 text-white">
                        {tenant.firstName[0]}
                        {tenant.lastName[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-blue-900 font-medium">
                          {tenant.firstName} {tenant.lastName}
                        </h4>
                        <Badge className={getTenantStatusColor(tenant.status)}>
                          {tenant.status}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <div className="flex items-center gap-2">
                          <Building className="w-3 h-3" />
                          <span>Unit {tenant.unitNumber}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Mail className="w-3 h-3" />
                          <span>{tenant.email}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="w-3 h-3" />
                          <span>{tenant.phone}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3 h-3" />
                          <span>
                            Lease:{' '}
                            {new Date(tenant.leaseStart).toLocaleDateString()} -{' '}
                            {new Date(tenant.leaseEnd).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold text-blue-600">
                        ₱{tenant.monthlyRent.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-500">per month</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <User className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">No tenants registered yet</p>
                <Button className="mt-3 bg-blue-600 hover:bg-blue-700 text-white">
                  Add Tenant
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Property Information */}
        <Card className="rounded-2xl shadow-xl border-0 bg-white/90">
          <CardHeader>
            <CardTitle className="text-blue-700">
              Property Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-500">Created:</span>
              <span className="text-blue-900 font-medium">
                {new Date(property.createdAt).toLocaleDateString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Last Updated:</span>
              <span className="text-blue-900 font-medium">
                {new Date(property.updatedAt).toLocaleDateString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Property ID:</span>
              <span className="text-blue-900 font-medium font-mono">
                {property.id}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
