'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Database,
  Users,
  TrendingUp,
  TrendingDown,
  MapPin,
  Calendar,
  BarChart3,
  PieChart,
  Activity,
  Plus,
  FileText,
  Download,
  RefreshCw
} from 'lucide-react';
import { DashboardAPI, type DashboardStats } from '@/lib/api/dashboard';

interface CensusRecord {
  id: string;
  barangay: string;
  barangayCode: string;
  year: number;
  month: number;
  totalSeniors: number;
  activeSeniors: number;
  deceasedSeniors: number;
  newRegistrations: number;
  maleCount: number;
  femaleCount: number;
  createdAt: string;
  updatedAt: string;
}

export default function OSCACensusPage() {
  const [dashboardData, setDashboardData] = useState<DashboardStats | null>(
    null
  );
  const [censusRecords, setCensusRecords] = useState<CensusRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(
    new Date().getFullYear().toString()
  );
  const [selectedBarangay, setSelectedBarangay] = useState('all');
  const [selectedView, setSelectedView] = useState('overview');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const data = await DashboardAPI.getOSCADashboardStats();
        setDashboardData(data);

        // Generate mock census records
        const mockRecords = generateMockCensusRecords(data);
        setCensusRecords(mockRecords);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const generateMockCensusRecords = (
    data: DashboardStats | null
  ): CensusRecord[] => {
    if (!data) return [];

    const records: CensusRecord[] = [];
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;

    // Generate records for each barangay for the last 12 months
    data.barangayStats.forEach(barangay => {
      for (let i = 11; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const year = date.getFullYear();
        const month = date.getMonth() + 1;

        // Simulate some variation in numbers
        const baseTotal = barangay.totalSeniors;
        const variation = Math.floor(Math.random() * 10) - 5; // -5 to +5
        const totalSeniors = Math.max(0, baseTotal + variation);
        const activeSeniors = Math.floor(totalSeniors * 0.92);
        const deceasedSeniors = totalSeniors - activeSeniors;
        const newRegistrations =
          i === 0 ? barangay.newThisMonth : Math.floor(Math.random() * 8);
        const maleCount = Math.floor(totalSeniors * 0.45);
        const femaleCount = totalSeniors - maleCount;

        records.push({
          id: `${barangay.barangay}-${year}-${month}`,
          barangay: barangay.barangay,
          barangayCode: barangay.barangay.replace(' ', '').toUpperCase(),
          year,
          month,
          totalSeniors,
          activeSeniors,
          deceasedSeniors,
          newRegistrations,
          maleCount,
          femaleCount,
          createdAt: new Date(year, month - 1, 1).toISOString(),
          updatedAt: new Date().toISOString()
        });
      }
    });

    return records.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  };

  const filteredRecords = censusRecords.filter(record => {
    const matchesYear =
      selectedYear === 'all' || record.year.toString() === selectedYear;
    const matchesBarangay =
      selectedBarangay === 'all' || record.barangay === selectedBarangay;
    return matchesYear && matchesBarangay;
  });

  const getMonthlyTotals = () => {
    const monthlyData: { [key: string]: CensusRecord } = {};

    filteredRecords.forEach(record => {
      const key = `${record.year}-${record.month.toString().padStart(2, '0')}`;
      if (!monthlyData[key]) {
        monthlyData[key] = {
          ...record,
          totalSeniors: 0,
          activeSeniors: 0,
          deceasedSeniors: 0,
          newRegistrations: 0,
          maleCount: 0,
          femaleCount: 0
        };
      }

      monthlyData[key].totalSeniors += record.totalSeniors;
      monthlyData[key].activeSeniors += record.activeSeniors;
      monthlyData[key].deceasedSeniors += record.deceasedSeniors;
      monthlyData[key].newRegistrations += record.newRegistrations;
      monthlyData[key].maleCount += record.maleCount;
      monthlyData[key].femaleCount += record.femaleCount;
    });

    return Object.values(monthlyData).sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  };

  const monthlyTotals = getMonthlyTotals();
  const currentMonthData = monthlyTotals[0];
  const previousMonthData = monthlyTotals[1];

  const calculateChange = (current: number, previous: number) => {
    if (!previous) return 0;
    return Math.round(((current - previous) / previous) * 100);
  };

  const overviewStats = [
    {
      title: 'Total Population',
      value: currentMonthData?.totalSeniors?.toLocaleString() || '0',
      change: previousMonthData
        ? calculateChange(
            currentMonthData?.totalSeniors || 0,
            previousMonthData.totalSeniors
          )
        : 0,
      icon: Users,
      color: 'bg-[#00af8f]'
    },
    {
      title: 'Active Seniors',
      value: currentMonthData?.activeSeniors?.toLocaleString() || '0',
      change: previousMonthData
        ? calculateChange(
            currentMonthData?.activeSeniors || 0,
            previousMonthData.activeSeniors
          )
        : 0,
      icon: Activity,
      color: 'bg-green-500'
    },
    {
      title: 'New Registrations',
      value: currentMonthData?.newRegistrations?.toLocaleString() || '0',
      change: previousMonthData
        ? calculateChange(
            currentMonthData?.newRegistrations || 0,
            previousMonthData.newRegistrations
          )
        : 0,
      icon: TrendingUp,
      color: 'bg-blue-500'
    },
    {
      title: 'Coverage Areas',
      value: dashboardData?.totalBarangays?.toString() || '0',
      change: 0,
      icon: MapPin,
      color: 'bg-purple-500'
    }
  ];

  const handleGenerateCensusReport = () => {
    // Mock census report generation
    const reportData = {
      type: 'census',
      period: selectedYear,
      barangay: selectedBarangay,
      data: filteredRecords,
      summary: {
        totalPopulation: currentMonthData?.totalSeniors || 0,
        activePopulation: currentMonthData?.activeSeniors || 0,
        newRegistrations: currentMonthData?.newRegistrations || 0,
        genderDistribution: {
          male: currentMonthData?.maleCount || 0,
          female: currentMonthData?.femaleCount || 0
        }
      },
      generatedAt: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `census-report-${selectedYear}-${
      new Date().toISOString().split('T')[0]
    }.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[#333333]">
              Census Management
            </h1>
            <p className="text-[#666666] mt-2">Loading census data...</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="w-full h-20 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#333333]">
            Census Management
          </h1>
          <p className="text-[#666666] mt-2">
            Monitor demographic trends and population statistics
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={selectedView} onValueChange={setSelectedView}>
            <SelectTrigger className="w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="overview">Overview</SelectItem>
              <SelectItem value="barangay">By Barangay</SelectItem>
              <SelectItem value="trends">Trends Analysis</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Years</SelectItem>
              <SelectItem value="2024">2024</SelectItem>
              <SelectItem value="2023">2023</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedBarangay} onValueChange={setSelectedBarangay}>
            <SelectTrigger className="w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Barangays</SelectItem>
              {dashboardData?.barangayStats.map(barangay => (
                <SelectItem key={barangay.barangay} value={barangay.barangay}>
                  {barangay.barangay}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            onClick={handleGenerateCensusReport}
            className="bg-[#00af8f] hover:bg-[#00af90] text-white">
            <Download className="w-4 h-4 mr-2" />
            Export Census
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {overviewStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-[#666666]">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold text-[#333333] mt-1">
                      {stat.value}
                    </p>
                    <p
                      className={`text-sm font-medium mt-1 ${
                        stat.change > 0
                          ? 'text-green-600'
                          : stat.change < 0
                          ? 'text-red-600'
                          : 'text-gray-600'
                      }`}>
                      {stat.change !== 0 && (
                        <>
                          {stat.change > 0 ? '+' : ''}
                          {stat.change}% from last month
                        </>
                      )}
                      {stat.change === 0 && 'Barangays monitored'}
                    </p>
                  </div>
                  <div className={`p-3 rounded-xl ${stat.color} bg-opacity-10`}>
                    <Icon
                      className={`w-6 h-6`}
                      style={{ color: stat.color.replace('bg-', '') }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Main Content based on selected view */}
      {selectedView === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Monthly Trends */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-[#00af8f]" />
                Population Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {monthlyTotals.slice(0, 6).map((record, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">
                        {new Date(
                          record.year,
                          record.month - 1
                        ).toLocaleDateString('en-US', {
                          month: 'long',
                          year: 'numeric'
                        })}
                      </p>
                      <p className="text-sm text-gray-600">
                        {record.newRegistrations} new registrations
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-[#333333]">
                        {record.totalSeniors.toLocaleString()}
                      </p>
                      <p className="text-sm text-[#666666]">Total</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Gender Distribution */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="w-5 h-5 text-[#00af8f]" />
                Demographics Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Gender Distribution */}
                <div>
                  <h4 className="font-medium mb-3">Gender Distribution</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Male</span>
                      <span className="font-medium">
                        {currentMonthData?.maleCount || 0} (
                        {Math.round(
                          ((currentMonthData?.maleCount || 0) /
                            Math.max(currentMonthData?.totalSeniors || 1, 1)) *
                            100
                        )}
                        %)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{
                          width: `${
                            ((currentMonthData?.maleCount || 0) /
                              Math.max(
                                currentMonthData?.totalSeniors || 1,
                                1
                              )) *
                            100
                          }%`
                        }}></div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Female</span>
                      <span className="font-medium">
                        {currentMonthData?.femaleCount || 0} (
                        {Math.round(
                          ((currentMonthData?.femaleCount || 0) /
                            Math.max(currentMonthData?.totalSeniors || 1, 1)) *
                            100
                        )}
                        %)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-pink-500 h-2 rounded-full"
                        style={{
                          width: `${
                            ((currentMonthData?.femaleCount || 0) /
                              Math.max(
                                currentMonthData?.totalSeniors || 1,
                                1
                              )) *
                            100
                          }%`
                        }}></div>
                    </div>
                  </div>
                </div>

                {/* Age Groups - Using dashboard data */}
                <div>
                  <h4 className="font-medium mb-3">Age Groups</h4>
                  <div className="space-y-2">
                    {dashboardData?.ageGroupStats
                      .slice(0, 4)
                      .map((ageGroup, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between">
                          <span className="text-sm">{ageGroup.ageGroup}</span>
                          <span className="font-medium">
                            {ageGroup.count} ({ageGroup.percentage}%)
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {selectedView === 'barangay' && (
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-[#00af8f]" />
              Barangay-wise Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {dashboardData?.barangayStats.map((barangay, index) => (
                <div
                  key={index}
                  className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{barangay.barangay}</h4>
                    <Badge variant="outline">
                      {barangay.totalSeniors} seniors
                    </Badge>
                  </div>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex justify-between">
                      <span>Active:</span>
                      <span className="font-medium">
                        {barangay.activeSeniors}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>New this month:</span>
                      <span className="font-medium text-green-600">
                        +{barangay.newThisMonth}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div
                        className="bg-[#00af8f] h-2 rounded-full"
                        style={{
                          width: `${
                            (barangay.activeSeniors /
                              Math.max(barangay.totalSeniors, 1)) *
                            100
                          }%`
                        }}></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {selectedView === 'trends' && (
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-[#00af8f]" />
              Historical Trends Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">
                    {dashboardData?.monthlyRegistrations.reduce(
                      (sum, month) => sum + month.count,
                      0
                    ) || 0}
                  </p>
                  <p className="text-sm text-gray-600">
                    Total Registrations (6 months)
                  </p>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">
                    {Math.round(
                      ((dashboardData?.activeSeniors || 0) /
                        Math.max(dashboardData?.totalSeniors || 1, 1)) *
                        100
                    )}
                    %
                  </p>
                  <p className="text-sm text-gray-600">
                    Active Population Rate
                  </p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <p className="text-2xl font-bold text-purple-600">
                    {Math.round(
                      ((dashboardData?.newThisMonth || 0) /
                        Math.max(dashboardData?.totalSeniors || 1, 1)) *
                        100 *
                        12
                    )}
                    %
                  </p>
                  <p className="text-sm text-gray-600">
                    Projected Annual Growth
                  </p>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-4">
                  Monthly Registration Trends
                </h4>
                <div className="space-y-3">
                  {dashboardData?.monthlyRegistrations.map((month, index) => (
                    <div key={index} className="flex items-center gap-4">
                      <span className="w-16 text-sm font-medium">
                        {month.month}
                      </span>
                      <div className="flex-1 bg-gray-200 rounded-full h-4 relative">
                        <div
                          className="bg-[#00af8f] h-4 rounded-full"
                          style={{
                            width: `${
                              (month.count /
                                Math.max(
                                  ...dashboardData.monthlyRegistrations.map(
                                    m => m.count
                                  )
                                )) *
                              100
                            }%`
                          }}></div>
                        <span className="absolute inset-0 flex items-center justify-center text-xs font-medium text-white">
                          {month.count}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
