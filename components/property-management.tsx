'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { PropertyForm } from '@/components/property-form';
import { PropertyDetails } from '@/components/property-details';
import { usePropertyData } from '@/hooks/usePropertyData';
import {
  ArrowLeft,
  Plus,
  Search,
  Building,
  Users,
  MapPin,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Filter,
  Grid3X3,
  List,
  TrendingUp,
  DollarSign,
  Calendar,
  Star
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';

interface PropertyManagementProps {
  onBack: () => void;
}

type ViewMode = 'list' | 'add' | 'edit' | 'details';

export function PropertyManagement({ onBack }: PropertyManagementProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(
    null
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [viewType, setViewType] = useState<'grid' | 'list'>('grid');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const {
    properties,
    loading,
    addProperty,
    updateProperty,
    deleteProperty,
    getPropertyTenants
  } = usePropertyData();

  const filteredProperties = properties.filter(property => {
    const matchesSearch =
      property.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.address.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter =
      filterStatus === 'all' || property.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const handleAddProperty = (propertyData: any) => {
    addProperty(propertyData);
    setViewMode('list');
  };

  const handleEditProperty = (propertyData: any) => {
    if (selectedPropertyId) {
      updateProperty(selectedPropertyId, propertyData);
      setViewMode('list');
      setSelectedPropertyId(null);
    }
  };

  const handleDeleteProperty = (propertyId: string) => {
    deleteProperty(propertyId);
  };

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

  // Calculate summary statistics
  const totalProperties = properties.length;
  const activeProperties = properties.filter(p => p.status === 'active').length;
  const totalUnits = properties.reduce((sum, p) => sum + p.totalUnits, 0);
  const occupiedUnits = properties.reduce((sum, p) => sum + p.occupiedUnits, 0);
  const totalRent = properties.reduce((sum, p) => sum + p.monthlyRent, 0);
  const occupancyRate = totalUnits > 0 ? (occupiedUnits / totalUnits) * 100 : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        {/* Desktop decorations */}
        <div className="hidden lg:block absolute top-20 right-20 w-64 h-64 bg-purple-200/20 rounded-full blur-3xl" />
        <div className="hidden lg:block absolute bottom-20 left-20 w-48 h-48 bg-blue-200/20 rounded-full blur-3xl" />

        <div className="relative z-10 flex items-center justify-center min-h-screen px-4">
          <div className="w-full max-w-md">
            <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
              <CardContent className="p-8 lg:p-12 text-center">
                <div className="animate-spin rounded-full h-16 w-16 lg:h-20 lg:w-20 border-4 border-blue-200 border-t-blue-600 mx-auto mb-6 lg:mb-8"></div>
                <h2 className="text-xl lg:text-2xl font-semibold text-gray-900 mb-2">
                  Loading Properties
                </h2>
                <p className="text-gray-600 text-base lg:text-lg">
                  Please wait while we load your property data...
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (viewMode === 'add') {
    return (
      <PropertyForm
        onBack={() => setViewMode('list')}
        onSubmit={handleAddProperty}
        title="Add New Property"
      />
    );
  }

  if (viewMode === 'edit' && selectedPropertyId) {
    const property = properties.find(p => p.id === selectedPropertyId);
    return (
      <PropertyForm
        onBack={() => setViewMode('list')}
        onSubmit={handleEditProperty}
        title="Edit Property"
        initialData={property}
      />
    );
  }

  if (viewMode === 'details' && selectedPropertyId) {
    const property = properties.find(p => p.id === selectedPropertyId);
    if (property) {
      return (
        <PropertyDetails
          property={property}
          tenants={getPropertyTenants(selectedPropertyId)}
          onBack={() => setViewMode('list')}
          onEdit={() => setViewMode('edit')}
        />
      );
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Desktop decorations */}
      <div className="hidden lg:block absolute top-20 right-20 w-64 h-64 bg-purple-200/20 rounded-full blur-3xl" />
      <div className="hidden lg:block absolute bottom-20 left-20 w-48 h-48 bg-blue-200/20 rounded-full blur-3xl" />

      {/* Mobile Header */}
      <div className="lg:hidden bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 shadow-xl">
        <div className="flex items-center justify-between p-4 pt-12">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="text-white hover:bg-white/10 p-2">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-white text-lg font-semibold">
              Property Management
            </h1>
          </div>
          <Button
            onClick={() => setViewMode('add')}
            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
            size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Add Property
          </Button>
        </div>
      </div>

      {/* Desktop Header */}
      <div className="hidden lg:block bg-white shadow-sm border-b border-gray-200">
        <div className="px-8 py-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={onBack}
                className="p-2 rounded-xl hover:bg-gray-100">
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Property Management
                </h1>
                <p className="text-gray-600">
                  Manage your properties and view analytics
                </p>
              </div>
            </div>
            <Button
              onClick={() => setViewMode('add')}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-2">
              <Plus className="w-4 h-4 mr-2" />
              Add Property
            </Button>
          </div>

          {/* Desktop Stats Grid */}
          <div className="grid grid-cols-4 gap-6">
            <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm mb-1">
                      Total Properties
                    </p>
                    <p className="text-3xl font-bold">{totalProperties}</p>
                  </div>
                  <Building className="w-8 h-8 opacity-80" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm mb-1">
                      Active Properties
                    </p>
                    <p className="text-3xl font-bold">{activeProperties}</p>
                  </div>
                  <TrendingUp className="w-8 h-8 opacity-80" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-sm mb-1">
                      Occupancy Rate
                    </p>
                    <p className="text-3xl font-bold">
                      {occupancyRate.toFixed(1)}%
                    </p>
                  </div>
                  <Users className="w-8 h-8 opacity-80" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-100 text-sm mb-1">
                      Monthly Revenue
                    </p>
                    <p className="text-3xl font-bold">
                      ₱{totalRent.toLocaleString()}
                    </p>
                  </div>
                  <DollarSign className="w-8 h-8 opacity-80" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 lg:p-8">
        {/* Search and Filters */}
        <div className="mb-6 lg:mb-8">
          <div className="flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search properties..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-10 bg-white border-gray-200 shadow-sm"
              />
            </div>

            {/* Desktop Controls */}
            <div className="hidden lg:flex items-center gap-4">
              {/* Filter */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="border-gray-200 text-gray-700 hover:bg-gray-50">
                    <Filter className="w-4 h-4 mr-2" />
                    {filterStatus === 'all' ? 'All Status' : filterStatus}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setFilterStatus('all')}>
                    All Status
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterStatus('active')}>
                    Active
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setFilterStatus('maintenance')}>
                    Maintenance
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterStatus('inactive')}>
                    Inactive
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* View Toggle */}
              <div className="flex items-center border border-gray-200 rounded-lg">
                <Button
                  variant={viewType === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewType('grid')}
                  className="rounded-r-none">
                  <Grid3X3 className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewType === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewType('list')}
                  className="rounded-l-none">
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Mobile Add Button */}
            <div className="lg:hidden">
              <Button
                onClick={() => setViewMode('add')}
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white">
                <Plus className="w-4 h-4 mr-2" />
                Add Property
              </Button>
            </div>
          </div>
        </div>

        {/* Properties Grid/List */}
        <div
          className={
            viewType === 'grid'
              ? 'grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6'
              : 'space-y-4'
          }>
          {filteredProperties.map(property => {
            const tenants = getPropertyTenants(property.id);
            const occupancyRate =
              (property.occupiedUnits / property.totalUnits) * 100;

            return (
              <Card
                key={property.id}
                className="bg-white shadow-lg hover:shadow-xl transition-shadow border-0 overflow-hidden">
                <CardContent className="p-0">
                  {/* Property Image */}
                  <div className="relative">
                    <img
                      src={
                        property.thumbnail ||
                        `/placeholder.svg?height=200&width=300&text=${property.type}+Property`
                      }
                      alt={property.name}
                      className="w-full h-32 lg:h-40 object-cover"
                    />
                    <div className="absolute top-2 right-2 flex gap-1">
                      <Badge className={getStatusColor(property.status)}>
                        {property.status}
                      </Badge>
                      <Badge className={getTypeColor(property.type)}>
                        {property.type}
                      </Badge>
                    </div>
                    <div className="absolute top-2 left-2">
                      <Badge className="bg-white/90 text-gray-700 border-0">
                        <Star className="w-3 h-3 mr-1 fill-yellow-400 text-yellow-400" />
                        New
                      </Badge>
                    </div>
                  </div>

                  {/* Property Info */}
                  <div className="p-4 lg:p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="text-gray-900 font-semibold text-lg lg:text-xl mb-2">
                          {property.name}
                        </h3>
                        <div className="flex items-center gap-1 text-gray-600 text-sm mb-2">
                          <MapPin className="w-4 h-4" />
                          <span className="truncate">{property.address}</span>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedPropertyId(property.id);
                              setViewMode('details');
                            }}>
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedPropertyId(property.id);
                              setViewMode('edit');
                            }}>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDeleteProperty(property.id)}
                            className="text-red-600">
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <Building className="w-4 h-4 text-gray-500" />
                          <span className="text-sm text-gray-500">Units</span>
                        </div>
                        <div className="text-lg font-semibold text-gray-900">
                          {property.occupiedUnits}/{property.totalUnits}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <Users className="w-4 h-4 text-gray-500" />
                          <span className="text-sm text-gray-500">Tenants</span>
                        </div>
                        <div className="text-lg font-semibold text-gray-900">
                          {tenants.length}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm text-gray-500 mb-1">Rent</div>
                        <div className="text-lg font-semibold text-blue-600">
                          ₱{property.monthlyRent.toLocaleString()}
                        </div>
                      </div>
                    </div>

                    {/* Occupancy Rate Bar */}
                    <div className="mb-4">
                      <div className="flex justify-between text-sm text-gray-500 mb-1">
                        <span>Occupancy Rate</span>
                        <span>{occupancyRate.toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${occupancyRate}%` }}
                        />
                      </div>
                    </div>

                    <Button
                      onClick={() => {
                        setSelectedPropertyId(property.id);
                        setViewMode('details');
                      }}
                      variant="outline"
                      className="w-full border-blue-200 text-blue-700 hover:bg-blue-50">
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filteredProperties.length === 0 && (
          <div className="text-center py-12 lg:py-16">
            <Building className="w-16 h-16 lg:w-20 lg:h-20 text-gray-400 mx-auto mb-4 lg:mb-6" />
            <h3 className="text-gray-900 text-lg lg:text-xl font-semibold mb-2">
              No properties found
            </h3>
            <p className="text-gray-600 mb-6 lg:mb-8 max-w-md mx-auto">
              {searchTerm
                ? 'Try adjusting your search terms'
                : 'Start by adding your first property'}
            </p>
            <Button
              onClick={() => setViewMode('add')}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-2">
              <Plus className="w-4 h-4 mr-2" />
              Add Property
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
