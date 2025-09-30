'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { PropertyForm } from '../forms';
import { PropertyDetails } from '../details';
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
  Star,
  Briefcase,
  LucideBuilding,
  Link
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';

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
    // Animated loading skeletons
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="hidden lg:block absolute top-20 right-20 w-64 h-64 bg-purple-200/20 rounded-full blur-3xl" />
        <div className="hidden lg:block absolute bottom-20 left-20 w-48 h-48 bg-blue-200/20 rounded-full blur-3xl" />
        <div className="relative z-10 flex items-center justify-center min-h-screen px-4">
          <div className="w-full max-w-5xl">
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-64 rounded-2xl" />
              ))}
            </div>
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
    <div className="flex flex-col h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Decorative background blobs for desktop */}
      <div className="hidden lg:block absolute top-20 right-20 w-64 h-64 bg-purple-200/20 rounded-full blur-3xl pointer-events-none z-0" />
      <div className="hidden lg:block absolute bottom-20 left-20 w-48 h-48 bg-blue-200/20 rounded-full blur-3xl pointer-events-none z-0" />

      {/* Sticky Add Property Button (Desktop) */}
      <div className="hidden lg:block fixed right-8 bottom-8 z-40">
        <Button
          onClick={() => setViewMode('add')}
          aria-label="Add Property"
          className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold px-8 py-4 rounded-full shadow-2xl text-lg">
          <Plus className="w-5 h-5 mr-2" />
          Add Property
        </Button>
      </div>

      {/* Modern Hero/Header Section */}
      {/* <div className="relative z-10 px-4 pt-8 pb-4 lg:px-0 lg:pt-16 lg:pb-8 flex flex-col items-center">
        <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg mb-4">
          <Building className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl lg:text-4xl font-extrabold text-gray-900 mb-2 text-center">
          Property Management
        </h1>
        <p className="text-gray-600 text-base lg:text-lg max-w-2xl text-center mb-4">
          Effortlessly manage your properties, tenants, and finances. Get
          insights, track occupancy, and grow your portfolio—all in one place.
        </p>
        <Button
          onClick={() => setViewMode('add')}
          className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold px-8 py-3 rounded-xl shadow-lg text-lg mt-2">
          <Plus className="w-5 h-5 mr-2" />
          Add New Property
        </Button>
      </div> */}

      {/* Desktop Header (keep stats grid) */}
      <div className="hidden lg:block bg-white shadow-sm border-b border-gray-200">
        <header className="bg-white border-b border-gray-200 shadow-sm">
          <div className="container flex h-20 items-center justify-between px-6">
            <div className="flex items-center gap-3">
              <LucideBuilding className="h-8 w-8 text-brand-blue" />
              <h1 className="text-3xl font-bold text-gray-900">
                Property Management
              </h1>
            </div>
            {/* <Button asChild>
              <Link href="/dashboard/admin/jobs/create">
                <Plus className="mr-2 h-4 w-4" /> Create Job Posting
              </Link>
            </Button> */}
          </div>
        </header>
      </div>

      {/* Content */}
      <main className="flex-1 overflow-auto">
        <div className="relative z-10 p-4 lg:p-8">
          {/* Search and Filters */}
          <div className="mb-8">
            <div className="flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400 w-5 h-5" />
                <Input
                  placeholder="Search properties..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="pl-12 bg-white border-0 shadow-md rounded-xl focus:ring-2 focus:ring-blue-200 transition"
                />
              </div>
              {/* Desktop Controls */}
              <div className="hidden lg:flex items-center gap-4">
                {/* Filter */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="border-0 bg-white shadow-md rounded-xl text-gray-700 hover:bg-blue-50 transition">
                      <Filter className="w-5 h-5 mr-2 text-blue-500" />
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
                    <DropdownMenuItem
                      onClick={() => setFilterStatus('inactive')}>
                      Inactive
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                {/* View Toggle */}
                <div className="flex items-center bg-white shadow-md rounded-xl overflow-hidden border-0">
                  <Button
                    variant={viewType === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewType('grid')}
                    className={`rounded-none ${
                      viewType === 'grid' ? 'bg-blue-100 text-blue-700' : ''
                    }`}>
                    <Grid3X3 className="w-5 h-5" />
                  </Button>
                  <Button
                    variant={viewType === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewType('list')}
                    className={`rounded-none ${
                      viewType === 'list' ? 'bg-blue-100 text-blue-700' : ''
                    }`}>
                    <List className="w-5 h-5" />
                  </Button>
                </div>
              </div>
              {/* Mobile Add Button */}
              <div className="lg:hidden">
                <Button
                  onClick={() => setViewMode('add')}
                  className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold rounded-xl shadow-lg">
                  <Plus className="w-5 h-5 mr-2" />
                  Add Property
                </Button>
              </div>
            </div>
          </div>

          {/* Properties Grid/List */}
          <div
            className={
              viewType === 'grid'
                ? 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8'
                : 'flex flex-col gap-6'
            }>
            {filteredProperties.map(property => {
              const tenants = getPropertyTenants(property.id);
              const occupancyRate =
                (property.occupiedUnits / property.totalUnits) * 100;

              // --- LIST VIEW ---
              if (viewType === 'list') {
                return (
                  <Card
                    key={property.id}
                    className="group flex flex-col sm:flex-row items-stretch bg-white/90 shadow-xl border-0 rounded-2xl overflow-hidden hover:shadow-2xl hover:-translate-y-1 hover:scale-[1.02] transition-all duration-300 relative ring-1 ring-blue-100">
                    {/* Image */}
                    <div className="relative w-full sm:w-56 flex-shrink-0">
                      <img
                        src={
                          property.thumbnail ||
                          `/placeholder.svg?height=240&width=400&text=${property.type}+Property`
                        }
                        alt={property.name}
                        className="w-full h-40 sm:h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      {/* Overlay gradient */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
                      {/* Badges */}
                      <div className="absolute top-3 left-3 flex gap-2 z-10">
                        <Badge
                          className={
                            getStatusColor(property.status) + ' shadow'
                          }>
                          {property.status}
                        </Badge>
                        <Badge
                          className={getTypeColor(property.type) + ' shadow'}>
                          {property.type}
                        </Badge>
                      </div>
                      <div className="absolute bottom-3 left-3 z-10">
                        <Badge className="bg-white/90 text-gray-700 border-0 shadow">
                          <Star className="w-4 h-4 mr-1 fill-yellow-400 text-yellow-400" />
                          New
                        </Badge>
                      </div>
                    </div>
                    {/* Info & Stats */}
                    <div className="flex-1 flex flex-col justify-between p-6">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-gray-900 font-extrabold text-xl truncate tracking-tight">
                            {property.name}
                          </h3>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-9 w-9 p-0 rounded-full hover:bg-blue-50">
                                <MoreVertical className="w-5 h-5" />
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
                                onClick={() =>
                                  handleDeleteProperty(property.id)
                                }
                                className="text-red-600">
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        <div className="flex items-center gap-2 text-gray-500 text-sm mb-4">
                          <MapPin className="w-4 h-4" />
                          <span className="truncate">{property.address}</span>
                        </div>
                        {/* Stats Row */}
                        <div className="flex flex-wrap gap-6 mb-4">
                          <div className="flex items-center gap-2">
                            <Building className="w-4 h-4 text-blue-400" />
                            <span className="text-xs text-gray-500">Units</span>
                            <span className="font-bold text-gray-900 ml-1">
                              {property.occupiedUnits}/{property.totalUnits}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-green-400" />
                            <span className="text-xs text-gray-500">
                              Tenants
                            </span>
                            <span className="font-bold text-gray-900 ml-1">
                              {tenants.length}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <DollarSign className="w-4 h-4 text-orange-400" />
                            <span className="text-xs text-gray-500">Rent</span>
                            <span className="font-bold text-blue-600 ml-1">
                              ₱{property.monthlyRent.toLocaleString()}
                            </span>
                          </div>
                        </div>
                        {/* Occupancy Bar */}
                        <div className="mb-4">
                          <div className="flex justify-between text-xs text-gray-500 mb-1">
                            <span>Occupancy Rate</span>
                            <span>{occupancyRate.toFixed(1)}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                            <div
                              className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${occupancyRate}%` }}
                            />
                          </div>
                        </div>
                      </div>
                      {/* Action Button */}
                      <div className="flex gap-2 mt-4">
                        <Button
                          onClick={() => {
                            setSelectedPropertyId(property.id);
                            setViewMode('details');
                          }}
                          className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-lg shadow hover:from-blue-600 hover:to-blue-700 transition-all">
                          View Details
                        </Button>
                        <Button
                          onClick={() => {
                            setSelectedPropertyId(property.id);
                            setViewMode('edit');
                          }}
                          variant="outline"
                          className="flex-1 border-blue-200 text-blue-700 hover:bg-blue-50 font-semibold rounded-lg">
                          Edit
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              }

              // --- GRID VIEW ---
              return (
                <Card
                  key={property.id}
                  className="group bg-white/90 shadow-xl border-0 rounded-2xl overflow-hidden hover:shadow-2xl hover:-translate-y-1 hover:scale-[1.02] transition-all duration-300 relative ring-1 ring-blue-100">
                  {/* Property Image with overlay gradient and floating action */}
                  <div className="relative">
                    <img
                      src={
                        property.thumbnail ||
                        `/placeholder.svg?height=240&width=400&text=${property.type}+Property`
                      }
                      alt={property.name}
                      className="w-full h-44 object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    {/* Overlay gradient for text readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none rounded-t-2xl" />
                    {/* Floating quick action button */}
                    <Button
                      size="icon"
                      variant="secondary"
                      onClick={() => {
                        setSelectedPropertyId(property.id);
                        setViewMode('details');
                      }}
                      className="absolute bottom-3 right-3 z-10 bg-white/80 hover:bg-blue-600 hover:text-white text-blue-600 shadow-lg rounded-full transition-all"
                      aria-label="View Details">
                      <Eye className="w-5 h-5" />
                    </Button>
                    {/* Badges */}
                    <div className="absolute top-3 right-3 flex gap-2 z-10">
                      <Badge
                        className={getStatusColor(property.status) + ' shadow'}>
                        {property.status}
                      </Badge>
                      <Badge
                        className={getTypeColor(property.type) + ' shadow'}>
                        {property.type}
                      </Badge>
                    </div>
                    <div className="absolute top-3 left-3 z-10">
                      <Badge className="bg-white/90 text-gray-700 border-0 shadow">
                        <Star className="w-4 h-4 mr-1 fill-yellow-400 text-yellow-400" />
                        New
                      </Badge>
                    </div>
                  </div>

                  {/* Property Info */}
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="text-gray-900 font-extrabold text-xl mb-1 truncate tracking-tight">
                          {property.name}
                        </h3>
                        <div className="flex items-center gap-1 text-gray-500 text-sm mb-2">
                          <MapPin className="w-4 h-4" />
                          <span className="truncate">{property.address}</span>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 p-0 rounded-full hover:bg-blue-50">
                            <MoreVertical className="w-5 h-5" />
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

                    {/* Modern stats row */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex flex-col items-center flex-1">
                        <div className="flex items-center gap-1 mb-1">
                          <Building className="w-4 h-4 text-blue-400" />
                          <span className="text-xs text-gray-500">Units</span>
                        </div>
                        <div className="text-lg font-bold text-gray-900">
                          {property.occupiedUnits}/{property.totalUnits}
                        </div>
                      </div>
                      <div className="flex flex-col items-center flex-1">
                        <div className="flex items-center gap-1 mb-1">
                          <Users className="w-4 h-4 text-green-400" />
                          <span className="text-xs text-gray-500">Tenants</span>
                        </div>
                        <div className="text-lg font-bold text-gray-900">
                          {tenants.length}
                        </div>
                      </div>
                      <div className="flex flex-col items-center flex-1">
                        <div className="text-xs text-gray-500 mb-1">Rent</div>
                        <div className="text-lg font-bold text-blue-600">
                          ₱{property.monthlyRent.toLocaleString()}
                        </div>
                      </div>
                    </div>

                    {/* Occupancy Rate Bar with label */}
                    {/* <div className="mb-4">
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>Occupancy Rate</span>
                        <span>{occupancyRate.toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${occupancyRate}%` }}
                        />
                      </div>
                    </div> */}

                    {/* Modern action button */}
                    {/* <Button
                      onClick={() => {
                        setSelectedPropertyId(property.id);
                        setViewMode('details');
                      }}
                      className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-lg shadow hover:from-blue-600 hover:to-blue-700 transition-all">
                      View Details
                    </Button> */}
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Empty State with Illustration */}
          {filteredProperties.length === 0 && (
            <div className="text-center py-16">
              <img
                src="/placeholder.svg"
                alt="No properties"
                className="mx-auto mb-6 w-32 h-32 opacity-60"
              />
              <h3 className="text-gray-900 text-xl font-bold mb-2">
                No properties found
              </h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                {searchTerm
                  ? 'Try adjusting your search terms'
                  : 'Start by adding your first property'}
              </p>
              <Button
                onClick={() => setViewMode('add')}
                aria-label="Add Property"
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-8 py-3 rounded-xl font-semibold shadow-lg">
                <Plus className="w-5 h-5 mr-2" />
                Add Property
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
