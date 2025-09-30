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
  BarChart3,
  Download,
  FileText,
  Calendar,
  Users,
  TrendingUp,
  MapPin,
  Heart,
  Building,
  PieChart,
  Activity,
  Filter,
  Loader2,
  Eye,
  UserPlus,
  UserMinus,
  UserCheck,
  BarChart2,
  LineChart,
  Target,
  Clock,
  ArrowUp,
  ArrowDown,
  Zap
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  LineChart as RechartsLineChart,
  Line,
  Area,
  AreaChart
} from 'recharts';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import html2canvas from 'html2canvas';
import {
  ReportsAPI,
  type ReportFilter,
  type ReportMetrics,
  type DemographicsData,
  type HealthStatusData,
  type BarangayAnalysisData,
  type RegistrationTrendsData,
  type ServicesUtilizationData,
  type GeneratedReport
} from '@/lib/api/reports';

export default function OSCAReportsPage() {
  const [reportMetrics, setReportMetrics] = useState<ReportMetrics | null>(
    null
  );
  const [barangays, setBarangays] = useState<{ id: string; name: string }[]>(
    []
  );
  const [recentReports, setRecentReports] = useState<GeneratedReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<
    'weekly' | 'monthly' | 'quarterly' | 'yearly'
  >('monthly');
  const [selectedBarangay, setSelectedBarangay] = useState('all');

  // Report data states
  const [demographicsData, setDemographicsData] = useState<DemographicsData[]>(
    []
  );
  const [healthStatusData, setHealthStatusData] = useState<HealthStatusData[]>(
    []
  );
  const [barangayAnalysisData, setBarangayAnalysisData] = useState<
    BarangayAnalysisData[]
  >([]);
  const [registrationTrendsData, setRegistrationTrendsData] = useState<
    RegistrationTrendsData[]
  >([]);
  const [servicesUtilizationData, setServicesUtilizationData] = useState<
    ServicesUtilizationData[]
  >([]);

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []);

  // Refresh report data when filters change
  useEffect(() => {
    if (!isLoading) {
      loadReportData();
    }
  }, [selectedPeriod, selectedBarangay]);

  const loadInitialData = async () => {
    try {
      setIsLoading(true);

      const [metrics, barangayList, reports] = await Promise.all([
        ReportsAPI.getReportMetrics(),
        ReportsAPI.getPiliBarangays(),
        ReportsAPI.getRecentReports()
      ]);

      setReportMetrics(metrics);
      setBarangays(barangayList);
      setRecentReports(reports);

      // Load initial report data
      await loadReportData();
    } catch (error) {
      console.error('Error loading initial data:', error);
      toast.error('Failed to load report data', {
        description: 'Please try refreshing the page'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadReportData = async () => {
    try {
      const filters: ReportFilter = {
        period: selectedPeriod,
        barangay: selectedBarangay
      };

      const [demographics, health, barangayData, trends, services] =
        await Promise.all([
          ReportsAPI.getDemographicsData(filters),
          ReportsAPI.getHealthStatusData(filters),
          ReportsAPI.getBarangayAnalysisData(filters),
          ReportsAPI.getRegistrationTrendsData(filters),
          ReportsAPI.getServicesUtilizationData(filters)
        ]);

      setDemographicsData(demographics);
      setHealthStatusData(health);
      setBarangayAnalysisData(barangayData);
      setRegistrationTrendsData(trends);
      setServicesUtilizationData(services);
    } catch (error) {
      console.error('Error loading report data:', error);
      toast.error('Failed to refresh report data');
    }
  };

  const reportTypes = [
    {
      id: 'demographics',
      title: 'Demographics Report',
      description: 'Age groups, gender distribution, and population trends',
      icon: Users,
      color: 'bg-blue-500',
      data: demographicsData
    },
    {
      id: 'health',
      title: 'Health Status Report',
      description: 'Physical health conditions and medical statistics',
      icon: Heart,
      color: 'bg-red-500',
      data: healthStatusData
    },
    {
      id: 'barangay',
      title: 'Barangay Analysis',
      description: 'Per-barangay senior citizen distribution and trends',
      icon: MapPin,
      color: 'bg-green-500',
      data: barangayAnalysisData
    },
    {
      id: 'registration',
      title: 'Registration Trends',
      description: 'Monthly registration patterns and growth analysis',
      icon: TrendingUp,
      color: 'bg-yellow-500',
      data: registrationTrendsData
    },
    {
      id: 'services',
      title: 'Services Utilization',
      description: 'Benefits, appointments, and document requests',
      icon: Activity,
      color: 'bg-purple-500',
      data: servicesUtilizationData
    },
    {
      id: 'comprehensive',
      title: 'Comprehensive Report',
      description: 'Complete system overview with all metrics',
      icon: FileText,
      color: 'bg-gray-600',
      data: []
    }
  ];

  // Enhanced census stats
  const totalActive = barangayAnalysisData.reduce(
    (sum, b) => sum + b.activeCount,
    0
  );
  const totalInactive = barangayAnalysisData.reduce(
    (sum, b) => sum + b.inactiveCount,
    0
  );
  const totalDeceased = barangayAnalysisData.reduce(
    (sum, b) => sum + b.deceasedCount,
    0
  );
  const totalNewRegistrations = barangayAnalysisData.reduce(
    (sum, b) => sum + b.newRegistrations,
    0
  );

  const quickStats = [
    {
      title: 'Active Senior Citizens',
      value: totalActive.toLocaleString(),
      change: `+${totalNewRegistrations} new this month`,
      icon: UserCheck,
      color: 'bg-[#00af8f]',
      trend: totalNewRegistrations > 0 ? 'up' : 'stable'
    },
    {
      title: 'Inactive Citizens',
      value: totalInactive.toLocaleString(),
      change: 'Need attention',
      icon: UserMinus,
      color: 'bg-orange-500',
      trend: 'stable'
    },
    {
      title: 'Deceased Records',
      value: totalDeceased.toLocaleString(),
      change: 'Updated records',
      icon: Clock,
      color: 'bg-gray-500',
      trend: 'stable'
    },
    {
      title: 'Total Population',
      value: (totalActive + totalInactive + totalDeceased).toLocaleString(),
      change: `${reportMetrics?.totalBarangaysCovered || 0} barangays`,
      icon: Users,
      color: 'bg-blue-500',
      trend: 'up'
    }
  ];

  // Enhanced export functions
  const exportToPDF = async (reportType: string, data: any) => {
    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.width;

    // Header
    pdf.setFontSize(20);
    pdf.setTextColor(0, 175, 143); // Brand color
    pdf.text('OSCA Pili, Camarines Sur', pageWidth / 2, 20, {
      align: 'center'
    });

    pdf.setFontSize(16);
    pdf.setTextColor(0, 0, 0);
    pdf.text(
      `${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report`,
      pageWidth / 2,
      35,
      { align: 'center' }
    );

    // Filter info
    pdf.setFontSize(10);
    pdf.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 50);
    pdf.text(`Period: ${selectedPeriod}`, 20, 55);
    pdf.text(
      `Barangay: ${
        selectedBarangay === 'all' ? 'All Barangays' : selectedBarangay
      }`,
      20,
      60
    );

    // Table data
    if (Array.isArray(data) && data.length > 0) {
      let columns: string[] = [];
      let rows: any[][] = [];

      if (reportType === 'demographics') {
        columns = ['Age Group', 'Count', 'Percentage', 'Male', 'Female'];
        rows = data.map((item: DemographicsData) => [
          item.ageGroup,
          item.count.toString(),
          `${item.percentage}%`,
          item.male.toString(),
          item.female.toString()
        ]);
      } else if (reportType === 'barangay') {
        columns = [
          'Barangay',
          'Total',
          'Active',
          'Inactive',
          'Deceased',
          'New'
        ];
        rows = data.map((item: BarangayAnalysisData) => [
          item.barangay,
          item.totalSeniors.toString(),
          item.activeCount.toString(),
          item.inactiveCount.toString(),
          item.deceasedCount.toString(),
          item.newRegistrations.toString()
        ]);
      }

      autoTable(pdf, {
        head: [columns],
        body: rows,
        startY: 70,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [0, 175, 143] }
      });
    }

    return pdf;
  };

  const exportToExcel = (reportType: string, data: any) => {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, reportType);
    return wb;
  };

  const handleExport = async (
    reportType: string,
    format: 'pdf' | 'excel' | 'json'
  ) => {
    try {
      setIsGenerating(reportType);

      const loadingToast = toast.loading(
        `Exporting ${reportType} report to ${format.toUpperCase()}...`,
        {
          description: 'Processing and formatting data'
        }
      );

      // Get data based on report type
      let data: any;
      let filename = `${reportType}-report-${
        new Date().toISOString().split('T')[0]
      }`;

      switch (reportType) {
        case 'demographics':
          data = demographicsData;
          break;
        case 'health':
          data = healthStatusData;
          break;
        case 'barangay':
          data = barangayAnalysisData;
          break;
        case 'registration':
          data = registrationTrendsData;
          break;
        case 'services':
          data = servicesUtilizationData;
          break;
        default:
          data = {
            demographics: demographicsData,
            health: healthStatusData,
            barangay: barangayAnalysisData,
            registration: registrationTrendsData,
            services: servicesUtilizationData
          };
      }

      await new Promise(resolve => setTimeout(resolve, 1000));

      if (format === 'pdf') {
        const pdf = await exportToPDF(reportType, data);
        pdf.save(`${filename}.pdf`);
      } else if (format === 'excel') {
        const wb = exportToExcel(reportType, data);
        XLSX.writeFile(wb, `${filename}.xlsx`);
      } else {
        // JSON export (existing functionality)
        const report = {
          title: `${
            reportType.charAt(0).toUpperCase() + reportType.slice(1)
          } Report`,
          type: reportType,
          filters: { period: selectedPeriod, barangay: selectedBarangay },
          generatedAt: new Date().toISOString(),
          data
        };

        const blob = new Blob([JSON.stringify(report, null, 2)], {
          type: 'application/json'
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${filename}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }

      toast.dismiss(loadingToast);
      toast.success(`📄 ${format.toUpperCase()} export successful!`, {
        description: `${
          reportType.charAt(0).toUpperCase() + reportType.slice(1)
        } report has been downloaded.`,
        duration: 4000
      });
    } catch (error) {
      console.error('Export error:', error);
      toast.error('❌ Export failed', {
        description:
          error instanceof Error ? error.message : 'Please try again later'
      });
    } finally {
      setIsGenerating(null);
    }
  };

  const handleGenerateReport = async (reportType: string) => {
    await handleExport(reportType, 'json');
  };

  const renderDataPreview = (reportType: any) => {
    const data = reportType.data;

    if (!data || data.length === 0) {
      return (
        <div className="text-center py-4 text-gray-500">
          <PieChart className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No preview data available</p>
        </div>
      );
    }

    return (
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-gray-700 mb-2">
          Data Preview:
        </h4>
        {data.slice(0, 3).map((item: any, index: number) => {
          let label = '';
          let value = '';

          // Handle different data types
          if (item.ageGroup) {
            label = item.ageGroup;
            value = `${item.count} (${item.percentage}%)`;
          } else if (item.condition) {
            label = item.condition;
            value = `${item.count} (${item.percentage}%)`;
          } else if (item.barangay) {
            label = item.barangay;
            value = `${item.totalSeniors} seniors`;
          } else if (item.period) {
            label = item.period;
            value = `${item.registrations} registrations`;
          } else if (item.service) {
            label = item.service;
            value = `${item.utilizationRate}% utilization`;
          } else {
            label = item.name || item.title || 'Data';
            value = item.value || item.count || 'N/A';
          }

          return (
            <div key={index} className="flex justify-between text-sm">
              <span
                className="text-gray-600 truncate max-w-[120px]"
                title={label}>
                {label}
              </span>
              <span className="font-medium">{value}</span>
            </div>
          );
        })}
        {data.length > 3 && (
          <p className="text-xs text-gray-500">
            ...and {data.length - 3} more items
          </p>
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[#333333]">
              Reports & Analytics
            </h1>
            <p className="text-[#666666] mt-2">Loading report data...</p>
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
    <div className="space-y-8">
      {/* Enhanced Header */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-[#00af8f]/5 via-[#00af90]/3 to-transparent rounded-3xl"></div>
        <div className="relative p-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 bg-gradient-to-r from-[#00af8f] to-[#00af90] rounded-2xl">
                  <BarChart2 className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-[#333333]">
                    Census & Analytics Dashboard
                  </h1>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-2 h-2 bg-[#00af8f] rounded-full animate-pulse"></div>
                    <span className="text-sm text-[#666666]">
                      Real-time Data
                    </span>
                    <span className="text-xs text-[#888888]">
                      • Last updated {new Date().toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              </div>
              <p className="text-[#666666] text-lg">
                Track demographic trends, manage census records, and generate
                comprehensive reports for senior citizens in Pili, Camarines Sur
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="flex items-center gap-3">
                <Target className="w-5 h-5 text-[#00af8f]" />
                <span className="text-sm font-medium text-[#333333]">
                  Filters:
                </span>
              </div>
              <Select
                value={selectedPeriod}
                onValueChange={value =>
                  setSelectedPeriod(
                    value as 'weekly' | 'monthly' | 'quarterly' | 'yearly'
                  )
                }>
                <SelectTrigger className="w-44 h-12 border-2 border-[#E0DDD8] focus:border-[#00af8f]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">📅 Weekly</SelectItem>
                  <SelectItem value="monthly">📊 Monthly</SelectItem>
                  <SelectItem value="quarterly">📈 Quarterly</SelectItem>
                  <SelectItem value="yearly">🗓️ Yearly</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={selectedBarangay}
                onValueChange={setSelectedBarangay}>
                <SelectTrigger className="w-44 h-12 border-2 border-[#E0DDD8] focus:border-[#00af8f]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">🏘️ All Barangays</SelectItem>
                  {barangays.map(barangay => (
                    <SelectItem key={barangay.id} value={barangay.name}>
                      📍 {barangay.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Census Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {quickStats.map((stat, index) => {
          const Icon = stat.icon;
          const TrendIcon =
            stat.trend === 'up'
              ? ArrowUp
              : stat.trend === 'down'
              ? ArrowDown
              : null;

          return (
            <Card
              key={index}
              className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-white to-gray-50/50 overflow-hidden">
              <CardContent className="p-6 relative">
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-transparent to-gray-100/20 rounded-full transform translate-x-8 -translate-y-8"></div>

                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <p className="text-sm font-semibold text-[#666666] uppercase tracking-wide">
                        {stat.title}
                      </p>
                      {TrendIcon && (
                        <TrendIcon
                          className={`w-3 h-3 ${
                            stat.trend === 'up'
                              ? 'text-green-500'
                              : 'text-red-500'
                          }`}
                        />
                      )}
                    </div>
                    <p className="text-3xl font-bold text-[#333333] mb-1 group-hover:text-[#00af8f] transition-colors">
                      {stat.value}
                    </p>
                    <p className="text-sm text-[#666666] font-medium">
                      {stat.change}
                    </p>
                  </div>

                  <div
                    className={`p-4 rounded-2xl ${stat.color} bg-opacity-10 backdrop-blur-sm group-hover:scale-110 transition-transform`}>
                    <Icon
                      className={`w-7 h-7`}
                      style={{ color: stat.color.replace('bg-', '') }}
                    />
                  </div>
                </div>

                {/* Progress bar for active citizens */}
                {index === 0 && (
                  <div className="mt-4">
                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                      <span>Population Health</span>
                      <span>
                        {Math.round(
                          (totalActive /
                            (totalActive + totalInactive + totalDeceased)) *
                            100
                        )}
                        %
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-[#00af8f] to-[#00af90] h-2 rounded-full transition-all duration-1000"
                        style={{
                          width: `${Math.round(
                            (totalActive /
                              (totalActive + totalInactive + totalDeceased)) *
                              100
                          )}%`
                        }}></div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts and Visual Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Demographics Chart */}
        <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-blue-50/30">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold text-[#333333]">
                    Age Demographics
                  </CardTitle>
                  <p className="text-sm text-[#666666] mt-1">
                    Population distribution by age groups
                  </p>
                </div>
              </div>
              <Badge className="bg-blue-100 text-blue-700">
                {demographicsData.length} Groups
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={demographicsData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="ageGroup"
                    tick={{ fontSize: 12 }}
                    stroke="#666666"
                  />
                  <YAxis tick={{ fontSize: 12 }} stroke="#666666" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e0e0e0',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Legend />
                  <Bar
                    dataKey="male"
                    fill="#3b82f6"
                    name="Male"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="female"
                    fill="#ec4899"
                    name="Female"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Census Status Distribution */}
        <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-green-50/30">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-r from-[#00af8f] to-[#00af90] rounded-2xl">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold text-[#333333]">
                    Census Status
                  </CardTitle>
                  <p className="text-sm text-[#666666] mt-1">
                    Current population status breakdown
                  </p>
                </div>
              </div>
              <Badge className="bg-[#00af8f]/10 text-[#00af8f]">
                Live Data
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={[
                      { name: 'Active', value: totalActive, color: '#00af8f' },
                      {
                        name: 'Inactive',
                        value: totalInactive,
                        color: '#f59e0b'
                      },
                      {
                        name: 'Deceased',
                        value: totalDeceased,
                        color: '#6b7280'
                      }
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={120}
                    paddingAngle={5}
                    dataKey="value">
                    {[
                      { name: 'Active', value: totalActive, color: '#00af8f' },
                      {
                        name: 'Inactive',
                        value: totalInactive,
                        color: '#f59e0b'
                      },
                      {
                        name: 'Deceased',
                        value: totalDeceased,
                        color: '#6b7280'
                      }
                    ].map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e0e0e0',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Registration Trends */}
        <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-yellow-50/30">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-2xl">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold text-[#333333]">
                    Registration Trends
                  </CardTitle>
                  <p className="text-sm text-[#666666] mt-1">
                    New registrations over time
                  </p>
                </div>
              </div>
              <Badge className="bg-yellow-100 text-yellow-700">
                {selectedPeriod.charAt(0).toUpperCase() +
                  selectedPeriod.slice(1)}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={registrationTrendsData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="period"
                    tick={{ fontSize: 12 }}
                    stroke="#666666"
                  />
                  <YAxis tick={{ fontSize: 12 }} stroke="#666666" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e0e0e0',
                      borderRadius: '8px'
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="registrations"
                    stroke="#f59e0b"
                    fill="url(#colorRegistrations)"
                    strokeWidth={3}
                  />
                  <defs>
                    <linearGradient
                      id="colorRegistrations"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Top Barangays */}
        <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-purple-50/30">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl">
                  <MapPin className="w-6 h-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold text-[#333333]">
                    Top Barangays
                  </CardTitle>
                  <p className="text-sm text-[#666666] mt-1">
                    Highest senior citizen populations
                  </p>
                </div>
              </div>
              <Badge className="bg-purple-100 text-purple-700">Top 5</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={barangayAnalysisData.slice(0, 5)}
                  layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    type="number"
                    tick={{ fontSize: 12 }}
                    stroke="#666666"
                  />
                  <YAxis
                    type="category"
                    dataKey="barangay"
                    tick={{ fontSize: 12 }}
                    stroke="#666666"
                    width={100}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e0e0e0',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar
                    dataKey="totalSeniors"
                    fill="#8b5cf6"
                    radius={[0, 4, 4, 0]}
                    name="Total Seniors"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Report Types Grid */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-r from-[#00af8f] to-[#00af90] rounded-2xl">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-[#333333]">
                Export & Generate Reports
              </h2>
              <p className="text-[#666666] mt-1">
                Download detailed reports in multiple formats (PDF, Excel, JSON)
              </p>
            </div>
          </div>
          <Badge className="bg-[#00af8f]/10 text-[#00af8f] px-4 py-2">
            {reportTypes.length} Report Types
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reportTypes.map(reportType => {
            const Icon = reportType.icon;
            return (
              <Card
                key={reportType.id}
                className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-white to-gray-50/50 overflow-hidden">
                <CardHeader className="pb-4">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-transparent to-gray-100/20 rounded-full transform translate-x-10 -translate-y-10"></div>

                  <div className="flex items-start justify-between relative">
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-4 rounded-2xl ${reportType.color} bg-opacity-10 backdrop-blur-sm group-hover:scale-110 transition-transform`}>
                        <Icon
                          className={`w-7 h-7`}
                          style={{ color: reportType.color.replace('bg-', '') }}
                        />
                      </div>
                      <div>
                        <CardTitle className="text-lg font-bold group-hover:text-[#00af8f] transition-colors">
                          {reportType.title}
                        </CardTitle>
                        <p className="text-sm text-[#666666] mt-1 leading-relaxed">
                          {reportType.description}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="pt-0">
                  {renderDataPreview(reportType)}

                  {/* Enhanced Export Options */}
                  <div className="space-y-3 mt-6">
                    <div className="text-xs font-semibold text-[#666666] uppercase tracking-wide">
                      Export Options:
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-10 text-xs border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
                        onClick={() => handleExport(reportType.id, 'pdf')}
                        disabled={isGenerating === reportType.id}>
                        {isGenerating === reportType.id ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <FileText className="w-3 h-3" />
                        )}
                        <span className="ml-1">PDF</span>
                      </Button>

                      <Button
                        size="sm"
                        variant="outline"
                        className="h-10 text-xs border-green-200 text-green-600 hover:bg-green-50 hover:border-green-300"
                        onClick={() => handleExport(reportType.id, 'excel')}
                        disabled={isGenerating === reportType.id}>
                        {isGenerating === reportType.id ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <BarChart3 className="w-3 h-3" />
                        )}
                        <span className="ml-1">Excel</span>
                      </Button>

                      <Button
                        size="sm"
                        variant="outline"
                        className="h-10 text-xs border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300"
                        onClick={() => handleExport(reportType.id, 'json')}
                        disabled={isGenerating === reportType.id}>
                        {isGenerating === reportType.id ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <Download className="w-3 h-3" />
                        )}
                        <span className="ml-1">JSON</span>
                      </Button>
                    </div>

                    <Button
                      className="w-full h-11 bg-[#00af8f] hover:bg-[#00af90] text-white shadow-lg font-semibold"
                      onClick={() => handleExport(reportType.id, 'pdf')}
                      disabled={isGenerating === reportType.id}>
                      {isGenerating === reportType.id ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Zap className="w-4 h-4 mr-2" />
                          Quick Generate PDF
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Recent Reports */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="w-6 h-6 text-[#00af8f]" />
              <div>
                <h3 className="text-xl font-bold text-[#333333]">
                  Recent Reports
                </h3>
                <p className="text-sm text-[#666666] mt-1">
                  Previously generated reports and exports
                </p>
              </div>
            </div>
            <Badge className="bg-[#00af8f]/10 text-[#00af8f]">
              Last 30 days
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentReports.map((report, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-[#00af8f]/10 rounded-lg flex items-center justify-center">
                    <FileText className="w-5 h-5 text-[#00af8f]" />
                  </div>
                  <div>
                    <h4 className="font-medium text-[#333333]">
                      {report.name}
                    </h4>
                    <div className="flex items-center gap-4 text-sm text-[#666666] mt-1">
                      <span>{report.type}</span>
                      <span>•</span>
                      <span>{report.size}</span>
                      <span>•</span>
                      <span>{report.downloadCount} downloads</span>
                      <span>•</span>
                      <span>
                        {new Date(report.generatedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm">
                    <Download className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-600 hover:text-red-700">
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
