import { supabase } from '@/lib/supabase';

export interface ReportFilter {
  period: 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  barangay?: string;
  startDate?: string;
  endDate?: string;
}

export interface DemographicsData {
  ageGroup: string;
  count: number;
  percentage: number;
  male: number;
  female: number;
}

export interface HealthStatusData {
  condition: string;
  count: number;
  percentage: number;
  averageAge: number;
}

export interface BarangayAnalysisData {
  barangay: string;
  totalSeniors: number;
  activeCount: number;
  inactiveCount: number;
  deceasedCount: number;
  newRegistrations: number;
  percentage: number;
}

export interface RegistrationTrendsData {
  period: string;
  registrations: number;
  cumulative: number;
  growthRate: number;
}

export interface ServicesUtilizationData {
  service: string;
  totalRequests: number;
  completedRequests: number;
  pendingRequests: number;
  utilizationRate: number;
}

export interface ReportMetrics {
  totalReportsGenerated: number;
  totalDataPoints: number;
  totalBarangaysCovered: number;
  totalDownloads: number;
  lastGeneratedAt: string;
}

export interface GeneratedReport {
  id: string;
  name: string;
  type: string;
  size: string;
  downloadCount: number;
  generatedAt: string;
  generatedBy: string;
  filters: ReportFilter;
}

export class ReportsAPI {
  // Get report metrics for quick stats
  static async getReportMetrics(): Promise<ReportMetrics> {
    try {
      // Get total senior citizens
      const { count: totalSeniors } = await supabase
        .from('senior_citizens')
        .select('*', { count: 'exact', head: true });

      // Get total barangays with seniors
      const { data: barangayData } = await supabase
        .from('senior_citizens')
        .select('barangay')
        .not('barangay', 'is', null);

      const uniqueBarangays = new Set(
        barangayData?.map(item => item.barangay) || []
      );

      // Mock data for reports (in real implementation, this would come from a reports table)
      return {
        totalReportsGenerated: 127,
        totalDataPoints: totalSeniors || 0,
        totalBarangaysCovered: uniqueBarangays.size,
        totalDownloads: 89,
        lastGeneratedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error fetching report metrics:', error);
      throw new Error('Failed to fetch report metrics');
    }
  }

  // Get demographics data
  static async getDemographicsData(
    filters: ReportFilter
  ): Promise<DemographicsData[]> {
    try {
      let query = supabase
        .from('senior_citizens')
        .select('date_of_birth, gender, barangay, created_at')
        .eq('status', 'active');

      // Apply barangay filter
      if (filters.barangay && filters.barangay !== 'all') {
        query = query.eq('barangay', filters.barangay);
      }

      // Apply date filters based on period
      if (filters.startDate && filters.endDate) {
        query = query
          .gte('created_at', filters.startDate)
          .lte('created_at', filters.endDate);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Process data into age groups
      const ageGroups = {
        '60-64': { count: 0, male: 0, female: 0 },
        '65-69': { count: 0, male: 0, female: 0 },
        '70-74': { count: 0, male: 0, female: 0 },
        '75-79': { count: 0, male: 0, female: 0 },
        '80-84': { count: 0, male: 0, female: 0 },
        '85+': { count: 0, male: 0, female: 0 }
      };

      const total = data?.length || 0;

      data?.forEach(senior => {
        const age =
          new Date().getFullYear() -
          new Date(senior.date_of_birth).getFullYear();
        let ageGroup: string;

        if (age >= 60 && age <= 64) ageGroup = '60-64';
        else if (age >= 65 && age <= 69) ageGroup = '65-69';
        else if (age >= 70 && age <= 74) ageGroup = '70-74';
        else if (age >= 75 && age <= 79) ageGroup = '75-79';
        else if (age >= 80 && age <= 84) ageGroup = '80-84';
        else ageGroup = '85+';

        ageGroups[ageGroup as keyof typeof ageGroups].count++;
        if (senior.gender === 'male') {
          ageGroups[ageGroup as keyof typeof ageGroups].male++;
        } else {
          ageGroups[ageGroup as keyof typeof ageGroups].female++;
        }
      });

      return Object.entries(ageGroups).map(([ageGroup, data]) => ({
        ageGroup,
        count: data.count,
        percentage: total > 0 ? Math.round((data.count / total) * 100) : 0,
        male: data.male,
        female: data.female
      }));
    } catch (error) {
      console.error('Error fetching demographics data:', error);
      throw new Error('Failed to fetch demographics data');
    }
  }

  // Get health status data
  static async getHealthStatusData(
    filters: ReportFilter
  ): Promise<HealthStatusData[]> {
    try {
      let query = supabase
        .from('senior_citizens')
        .select(
          'physical_health_condition, date_of_birth, barangay, created_at'
        )
        .eq('status', 'active');

      // Apply filters
      if (filters.barangay && filters.barangay !== 'all') {
        query = query.eq('barangay', filters.barangay);
      }

      if (filters.startDate && filters.endDate) {
        query = query
          .gte('created_at', filters.startDate)
          .lte('created_at', filters.endDate);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Process health conditions
      const healthStats: {
        [key: string]: { count: number; totalAge: number };
      } = {};
      const total = data?.length || 0;

      data?.forEach(senior => {
        const condition = senior.physical_health_condition || 'unknown';
        const age =
          new Date().getFullYear() -
          new Date(senior.date_of_birth).getFullYear();

        if (!healthStats[condition]) {
          healthStats[condition] = { count: 0, totalAge: 0 };
        }
        healthStats[condition].count++;
        healthStats[condition].totalAge += age;
      });

      return Object.entries(healthStats).map(([condition, data]) => ({
        condition: condition.charAt(0).toUpperCase() + condition.slice(1),
        count: data.count,
        percentage: total > 0 ? Math.round((data.count / total) * 100) : 0,
        averageAge: data.count > 0 ? Math.round(data.totalAge / data.count) : 0
      }));
    } catch (error) {
      console.error('Error fetching health status data:', error);
      throw new Error('Failed to fetch health status data');
    }
  }

  // Get barangay analysis data
  static async getBarangayAnalysisData(
    filters: ReportFilter
  ): Promise<BarangayAnalysisData[]> {
    try {
      let query = supabase
        .from('senior_citizens')
        .select('barangay, status, created_at');

      // Apply date filters
      if (filters.startDate && filters.endDate) {
        query = query
          .gte('created_at', filters.startDate)
          .lte('created_at', filters.endDate);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Process barangay data
      const barangayStats: {
        [key: string]: {
          active: number;
          inactive: number;
          deceased: number;
          newRegistrations: number;
        };
      } = {};

      const total = data?.length || 0;
      const currentYear = new Date().getFullYear();
      const currentMonth = new Date().getMonth();

      data?.forEach(senior => {
        const barangay = senior.barangay || 'Unknown';

        if (!barangayStats[barangay]) {
          barangayStats[barangay] = {
            active: 0,
            inactive: 0,
            deceased: 0,
            newRegistrations: 0
          };
        }

        // Count by status
        if (senior.status === 'active') barangayStats[barangay].active++;
        else if (senior.status === 'inactive')
          barangayStats[barangay].inactive++;
        else if (senior.status === 'deceased')
          barangayStats[barangay].deceased++;

        // Count new registrations (this month)
        const registrationDate = new Date(senior.created_at);
        if (
          registrationDate.getFullYear() === currentYear &&
          registrationDate.getMonth() === currentMonth
        ) {
          barangayStats[barangay].newRegistrations++;
        }
      });

      return Object.entries(barangayStats)
        .map(([barangay, stats]) => {
          const totalSeniors = stats.active + stats.inactive + stats.deceased;
          return {
            barangay,
            totalSeniors,
            activeCount: stats.active,
            inactiveCount: stats.inactive,
            deceasedCount: stats.deceased,
            newRegistrations: stats.newRegistrations,
            percentage: total > 0 ? Math.round((totalSeniors / total) * 100) : 0
          };
        })
        .sort((a, b) => b.totalSeniors - a.totalSeniors);
    } catch (error) {
      console.error('Error fetching barangay analysis data:', error);
      throw new Error('Failed to fetch barangay analysis data');
    }
  }

  // Get registration trends data
  static async getRegistrationTrendsData(
    filters: ReportFilter
  ): Promise<RegistrationTrendsData[]> {
    try {
      let query = supabase
        .from('senior_citizens')
        .select('created_at, barangay');

      // Apply barangay filter
      if (filters.barangay && filters.barangay !== 'all') {
        query = query.eq('barangay', filters.barangay);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Process registration trends based on period
      const trends: { [key: string]: number } = {};
      let cumulative = 0;

      data?.forEach(senior => {
        const date = new Date(senior.created_at);
        let period: string;

        switch (filters.period) {
          case 'weekly':
            // Get week of year
            const weekStart = new Date(date);
            weekStart.setDate(date.getDate() - date.getDay());
            period = `${weekStart.getFullYear()}-W${Math.ceil(
              (weekStart.getTime() -
                new Date(weekStart.getFullYear(), 0, 1).getTime()) /
                (7 * 24 * 60 * 60 * 1000)
            )}`;
            break;
          case 'monthly':
            period = `${date.getFullYear()}-${String(
              date.getMonth() + 1
            ).padStart(2, '0')}`;
            break;
          case 'quarterly':
            const quarter = Math.ceil((date.getMonth() + 1) / 3);
            period = `${date.getFullYear()}-Q${quarter}`;
            break;
          case 'yearly':
            period = date.getFullYear().toString();
            break;
          default:
            period = `${date.getFullYear()}-${String(
              date.getMonth() + 1
            ).padStart(2, '0')}`;
        }

        trends[period] = (trends[period] || 0) + 1;
      });

      // Convert to array and calculate growth rates
      const sortedPeriods = Object.keys(trends).sort();
      let previousValue = 0;

      return sortedPeriods.map(period => {
        const registrations = trends[period];
        cumulative += registrations;
        const growthRate =
          previousValue > 0
            ? Math.round(
                ((registrations - previousValue) / previousValue) * 100
              )
            : 0;

        previousValue = registrations;

        return {
          period,
          registrations,
          cumulative,
          growthRate
        };
      });
    } catch (error) {
      console.error('Error fetching registration trends data:', error);
      throw new Error('Failed to fetch registration trends data');
    }
  }

  // Get services utilization data
  static async getServicesUtilizationData(
    filters: ReportFilter
  ): Promise<ServicesUtilizationData[]> {
    try {
      const [appointmentsResult, documentsResult, benefitsResult] =
        await Promise.all([
          // Get appointments data
          supabase
            .from('appointments')
            .select('status, created_at')
            .then(result => ({ type: 'appointments', ...result })),

          // Get document requests data
          supabase
            .from('document_requests')
            .select('status, requested_at')
            .then(result => ({ type: 'documents', ...result })),

          // Get benefits data
          supabase
            .from('benefits')
            .select('status, created_at')
            .then(result => ({ type: 'benefits', ...result }))
        ]);

      const services = [
        {
          service: 'Appointments',
          data: appointmentsResult.data || [],
          dateField: 'created_at'
        },
        {
          service: 'Document Requests',
          data: documentsResult.data || [],
          dateField: 'requested_at'
        },
        {
          service: 'Benefits',
          data: benefitsResult.data || [],
          dateField: 'created_at'
        }
      ];

      return services.map(({ service, data }) => {
        const totalRequests = data.length;
        const completedRequests = data.filter(
          (item: any) =>
            item.status === 'completed' || item.status === 'approved'
        ).length;
        const pendingRequests = data.filter(
          (item: any) => item.status === 'pending'
        ).length;

        return {
          service,
          totalRequests,
          completedRequests,
          pendingRequests,
          utilizationRate:
            totalRequests > 0
              ? Math.round((completedRequests / totalRequests) * 100)
              : 0
        };
      });
    } catch (error) {
      console.error('Error fetching services utilization data:', error);
      throw new Error('Failed to fetch services utilization data');
    }
  }

  // Get Pili, Camarines Sur barangays
  static async getPiliBarangays(): Promise<{ id: string; name: string }[]> {
    // Real Pili, Camarines Sur barangays
    return [
      { id: 'bagong-sirang', name: 'Bagong Sirang' },
      { id: 'barangay-1', name: 'Barangay 1 (Poblacion)' },
      { id: 'barangay-2', name: 'Barangay 2 (Poblacion)' },
      { id: 'barangay-3', name: 'Barangay 3 (Poblacion)' },
      { id: 'barangay-4', name: 'Barangay 4 (Poblacion)' },
      { id: 'barangay-5', name: 'Barangay 5 (Poblacion)' },
      { id: 'barangay-6', name: 'Barangay 6 (Poblacion)' },
      { id: 'barangay-7', name: 'Barangay 7 (Poblacion)' },
      { id: 'barangay-8', name: 'Barangay 8 (Poblacion)' },
      { id: 'anayan', name: 'Anayan' },
      { id: 'bagacay', name: 'Bagacay' },
      { id: 'banga', name: 'Banga' },
      { id: 'binanuahan', name: 'Binanuahan' },
      { id: 'bolo', name: 'Bolo' },
      { id: 'buenavista', name: 'Buenavista' },
      { id: 'cadlan', name: 'Cadlan' },
      { id: 'caima-gimaga', name: 'Caima Gimaga' },
      { id: 'cale', name: 'Cale' },
      { id: 'curry', name: 'Curry' },
      { id: 'dita', name: 'Dita' },
      { id: 'kyamko', name: 'Kyamko' },
      { id: 'moises-r-espinosa', name: 'Moises R. Espinosa (Pinit)' },
      { id: 'palestina', name: 'Palestina' },
      { id: 'pawili', name: 'Pawili' },
      { id: 'sagrada-familia', name: 'Sagrada Familia' },
      { id: 'san-antonio', name: 'San Antonio' },
      { id: 'san-isidro', name: 'San Isidro' },
      { id: 'san-jose', name: 'San Jose' },
      { id: 'san-juan', name: 'San Juan' },
      { id: 'san-rafael-a', name: 'San Rafael A' },
      { id: 'san-rafael-b', name: 'San Rafael B' },
      { id: 'san-roque', name: 'San Roque' },
      { id: 'san-vicente', name: 'San Vicente' },
      { id: 'santa-cruz-norte', name: 'Santa Cruz Norte' },
      { id: 'santa-cruz-sur', name: 'Santa Cruz Sur' },
      { id: 'santo-niño', name: 'Santo Niño' },
      { id: 'himaao', name: 'Himaao' }
    ];
  }

  // Get recent reports (mock data - in real implementation, this would be from database)
  static async getRecentReports(): Promise<GeneratedReport[]> {
    return [
      {
        id: '1',
        name: 'Demographics Report - January 2024',
        type: 'Demographics',
        size: '2.4 MB',
        downloadCount: 15,
        generatedAt: new Date(2024, 0, 10, 10, 30).toISOString(),
        generatedBy: 'OSCA Admin',
        filters: { period: 'monthly', barangay: 'all' }
      },
      {
        id: '2',
        name: 'Barangay Analysis - Q4 2023',
        type: 'Barangay Analysis',
        size: '1.8 MB',
        downloadCount: 8,
        generatedAt: new Date(2024, 0, 8, 14, 15).toISOString(),
        generatedBy: 'OSCA Admin',
        filters: { period: 'quarterly', barangay: 'all' }
      },
      {
        id: '3',
        name: 'Health Status Comprehensive',
        type: 'Health Status',
        size: '3.1 MB',
        downloadCount: 23,
        generatedAt: new Date(2024, 0, 5, 9, 45).toISOString(),
        generatedBy: 'OSCA Admin',
        filters: { period: 'yearly', barangay: 'all' }
      }
    ];
  }
}
