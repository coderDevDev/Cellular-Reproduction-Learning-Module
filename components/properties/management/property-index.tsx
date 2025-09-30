'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Building,
  Plus,
  TrendingUp,
  Users,
  DollarSign,
  ArrowRight
} from 'lucide-react';

export function PropertyIndex({
  onAddProperty
}: {
  onAddProperty: () => void;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex flex-col items-center justify-center px-4 py-8">
      {/* Hero Section */}
      <div className="w-full max-w-3xl text-center mb-10">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg mb-2">
            <Building className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl lg:text-4xl font-extrabold text-gray-900 mb-2">
            Welcome to{' '}
            <span className="bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
              Property Management
            </span>
          </h1>
          <p className="text-gray-600 text-base lg:text-lg max-w-xl mx-auto">
            Effortlessly manage your properties, tenants, and finances. Get
            insights, track occupancy, and grow your portfolio—all in one place.
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-5xl mb-10">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg border-0">
          <CardContent className="p-6 flex flex-col items-center">
            <Building className="w-8 h-8 mb-2 opacity-90" />
            <div className="text-2xl font-bold">3</div>
            <div className="text-blue-100 text-sm">Properties</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg border-0">
          <CardContent className="p-6 flex flex-col items-center">
            <Users className="w-8 h-8 mb-2 opacity-90" />
            <div className="text-2xl font-bold">73</div>
            <div className="text-green-100 text-sm">Tenants</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg border-0">
          <CardContent className="p-6 flex flex-col items-center">
            <TrendingUp className="w-8 h-8 mb-2 opacity-90" />
            <div className="text-2xl font-bold">98%</div>
            <div className="text-purple-100 text-sm">Occupancy</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg border-0">
          <CardContent className="p-6 flex flex-col items-center">
            <DollarSign className="w-8 h-8 mb-2 opacity-90" />
            <div className="text-2xl font-bold">₱847K</div>
            <div className="text-orange-100 text-sm">Monthly Revenue</div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="w-full max-w-2xl flex flex-col sm:flex-row gap-4 justify-center mb-8">
        <Button
          onClick={onAddProperty}
          className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white h-14 text-lg font-semibold shadow-lg hover:from-blue-600 hover:to-blue-700 transition-all">
          <Plus className="w-5 h-5 mr-2" />
          Add New Property
        </Button>
        <Button
          variant="outline"
          className="flex-1 border-blue-200 text-blue-700 h-14 text-lg font-semibold hover:bg-blue-50 transition-all">
          View All Properties
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
      </div>

      {/* Decorative background blobs for desktop */}
      <div className="hidden lg:block absolute top-20 right-20 w-64 h-64 bg-purple-200/20 rounded-full blur-3xl pointer-events-none" />
      <div className="hidden lg:block absolute bottom-20 left-20 w-48 h-48 bg-blue-200/20 rounded-full blur-3xl pointer-events-none" />
    </div>
  );
}
