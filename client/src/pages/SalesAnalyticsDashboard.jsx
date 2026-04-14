import React, { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import { generateSalesReportPDF } from '../utils/reportGenerator';
import api from '../utils/api';
import { Link } from 'wouter';
import {
  Bar,
  Line,
  Doughnut,
  Pie
} from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import {
  ArrowLeft,
  FileText,
  Loader2,
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  Calendar,
  Filter,
  Download,
  RefreshCw,
  BarChart3,
  PieChart,
  Activity,
  Eye,
  EyeOff
} from 'lucide-react';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler
);

const SalesAnalyticsDashboard = () => {
  const { user } = useAuth();
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [chartType, setChartType] = useState('bar');
  const [timeRange, setTimeRange] = useState('month');
  const [visibleCharts, setVisibleCharts] = useState({
    productSales: true,
    retailerOrders: true,
    productDistribution: true,
    salesTrend: true
  });

  // Fetch sales report data
  const { data: reportData, isLoading, refetch } = useQuery({
    queryKey: ['sales-report', selectedMonth, selectedYear],
    queryFn: () => api.getSalesReport(selectedMonth, selectedYear),
    enabled: !!user?.id,
    refetchOnWindowFocus: false
  });

  // Generate PDF report mutation
  const generateReportMutation = useMutation({
    mutationFn: () => api.getSalesReport(selectedMonth, selectedYear),
    onSuccess: (data) => {
      const monthName = new Date(0, selectedMonth - 1).toLocaleString('default', { month: 'long' });
      generateSalesReportPDF(data, monthName, selectedYear);
    },
    onError: (error) => {
      alert(`Failed to generate report: ${error.message}`);
    }
  });

  const handleGenerateReport = () => {
    generateReportMutation.mutate();
  };

  const toggleChartVisibility = (chartName) => {
    setVisibleCharts(prev => ({
      ...prev,
      [chartName]: !prev[chartName]
    }));
  };

  // Chart configurations
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          label: function(context) {
            const label = context.dataset.label || '';
            const value = context.parsed.y || context.parsed;
            if (label.includes('Revenue') || label.includes('Amount')) {
              return `${label}: ₹${value.toLocaleString()}`;
            }
            return `${label}: ${value}`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          maxRotation: 45,
          minRotation: 0
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        },
        ticks: {
          callback: function(value) {
            if (this.chart.canvas.parentNode.dataset.type === 'revenue') {
              return '₹' + value.toLocaleString();
            }
            return value;
          }
        }
      }
    }
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          usePointStyle: true,
          padding: 15,
          font: {
            size: 11
          },
          generateLabels: function(chart) {
            const data = chart.data;
            if (data.labels.length && data.datasets.length) {
              const total = data.datasets[0].data.reduce((acc, value) => acc + value, 0);
              return data.labels.map((label, i) => {
                const value = data.datasets[0].data[i];
                const percentage = Math.round((value / total) * 100);
                return {
                  text: `${label} (${percentage}%)`,
                  fillStyle: data.datasets[0].backgroundColor[i],
                  hidden: isNaN(data.datasets[0].data[i]),
                  index: i
                };
              });
            }
            return [];
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        cornerRadius: 8,
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.parsed;
            const total = context.dataset.data.reduce((acc, val) => acc + val, 0);
            const percentage = Math.round((value / total) * 100);
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      }
    }
  };

  // Generate chart data
  const getProductSalesData = () => {
    if (!reportData?.productSales) return null;
    
    const labels = Object.keys(reportData.productSales);
    const data = Object.values(reportData.productSales);
    
    return {
      labels,
      datasets: [{
        label: 'Quantity Sold',
        data,
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(139, 92, 246, 0.8)',
          'rgba(236, 72, 153, 0.8)'
        ],
        borderColor: [
          'rgb(59, 130, 246)',
          'rgb(16, 185, 129)',
          'rgb(245, 158, 11)',
          'rgb(239, 68, 68)',
          'rgb(139, 92, 246)',
          'rgb(236, 72, 153)'
        ],
        borderWidth: 2,
        borderRadius: 4,
        borderSkipped: false,
      }]
    };
  };

  const getRetailerOrdersData = () => {
    if (!reportData?.retailerOrders) return null;
    
    const labels = Object.keys(reportData.retailerOrders);
    const data = Object.values(reportData.retailerOrders);
    
    return {
      labels,
      datasets: [{
        label: 'Number of Orders',
        data,
        backgroundColor: 'rgba(16, 185, 129, 0.8)',
        borderColor: 'rgb(16, 185, 129)',
        borderWidth: 2,
        borderRadius: 4,
        borderSkipped: false,
      }]
    };
  };

  const getProductDistributionData = () => {
    if (!reportData?.productDistribution) return null;
    
    const labels = Object.keys(reportData.productDistribution);
    const data = Object.values(reportData.productDistribution);
    
    return {
      labels,
      datasets: [{
        data,
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(139, 92, 246, 0.8)',
          'rgba(236, 72, 153, 0.8)',
          'rgba(20, 184, 166, 0.8)',
          'rgba(251, 146, 60, 0.8)'
        ],
        borderColor: [
          'rgb(59, 130, 246)',
          'rgb(16, 185, 129)',
          'rgb(245, 158, 11)',
          'rgb(239, 68, 68)',
          'rgb(139, 92, 246)',
          'rgb(236, 72, 153)',
          'rgb(20, 184, 166)',
          'rgb(251, 146, 60)'
        ],
        borderWidth: 2,
      }]
    };
  };

  // Generate mock trend data (you can replace this with real API data)
  const getSalesTrendData = () => {
    if (!reportData?.orders) return null;
    
    // Group orders by day for trend analysis
    const dailySales = {};
    reportData.orders.forEach(order => {
      const date = new Date(order.DateofOrder).getDate();
      dailySales[date] = (dailySales[date] || 0) + order.Amount;
    });
    
    const labels = Object.keys(dailySales).sort((a, b) => a - b);
    const data = labels.map(day => dailySales[day]);
    
    return {
      labels: labels.map(day => `Day ${day}`),
      datasets: [{
        label: 'Daily Revenue',
        data,
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: 'rgb(59, 130, 246)',
        pointBorderColor: 'white',
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8,
      }]
    };
  };

  // Calculate summary statistics
  const getSummaryStats = () => {
    if (!reportData) return null;
    
    const totalRevenue = reportData.totalAmount || 0;
    const totalOrders = reportData.orders?.length || 0;
    const totalProducts = Object.keys(reportData.productSales || {}).length;
    const totalRetailers = Object.keys(reportData.retailerOrders || {}).length;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    
    return {
      totalRevenue,
      totalOrders,
      totalProducts,
      totalRetailers,
      avgOrderValue
    };
  };

  const stats = getSummaryStats();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary-500 mx-auto mb-4" />
          <p className="text-text-secondary">Loading analytics data...</p>
        </div>
      </div>
    );
  }

  if (!reportData || !reportData.orders || reportData.orders.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center">
              <Link href="/seller/dashboard" className="mr-4 p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <ArrowLeft className="w-5 h-5 text-text-secondary" />
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-text-primary">Sales Analytics Dashboard</h1>
                <p className="text-text-secondary">Comprehensive sales analysis and insights</p>
              </div>
            </div>
          </div>

          <div className="text-center py-16">
            <BarChart3 className="w-24 h-24 text-gray-400 mx-auto mb-6" />
            <h3 className="text-xl font-semibold text-text-primary mb-2">No Data Available</h3>
            <p className="text-text-secondary mb-6">
              No sales data found for {new Date(0, selectedMonth - 1).toLocaleString('default', { month: 'long' })} {selectedYear}
            </p>
            <div className="flex items-center justify-center space-x-4">
              <select 
                value={selectedMonth} 
                onChange={(e) => setSelectedMonth(parseInt(e.target.value))} 
                className="form-select rounded-lg shadow-sm"
              >
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {new Date(0, i).toLocaleString('default', { month: 'long' })}
                  </option>
                ))}
              </select>
              <select 
                value={selectedYear} 
                onChange={(e) => setSelectedYear(parseInt(e.target.value))} 
                className="form-select rounded-lg shadow-sm"
              >
                {Array.from({ length: 5 }, (_, i) => (
                  <option key={i} value={new Date().getFullYear() - i}>
                    {new Date().getFullYear() - i}
                  </option>
                ))}
              </select>
              <button 
                onClick={() => refetch()} 
                className="btn-primary flex items-center"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8 space-y-4 lg:space-y-0">
          <div className="flex items-center">
            <Link href="/seller/dashboard" className="mr-4 p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <ArrowLeft className="w-5 h-5 text-text-secondary" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-text-primary">Sales Analytics Dashboard</h1>
              <p className="text-text-secondary">
                Comprehensive analysis for {new Date(0, selectedMonth - 1).toLocaleString('default', { month: 'long' })} {selectedYear}
              </p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-text-secondary" />
              <select 
                value={selectedMonth} 
                onChange={(e) => setSelectedMonth(parseInt(e.target.value))} 
                className="form-select rounded-lg shadow-sm text-sm"
              >
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {new Date(0, i).toLocaleString('default', { month: 'long' })}
                  </option>
                ))}
              </select>
              <select 
                value={selectedYear} 
                onChange={(e) => setSelectedYear(parseInt(e.target.value))} 
                className="form-select rounded-lg shadow-sm text-sm"
              >
                {Array.from({ length: 5 }, (_, i) => (
                  <option key={i} value={new Date().getFullYear() - i}>
                    {new Date().getFullYear() - i}
                  </option>
                ))}
              </select>
            </div>

            <button 
              onClick={() => refetch()} 
              className="btn-secondary flex items-center text-sm px-3 py-2"
              disabled={isLoading}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </button>

            <button 
              onClick={handleGenerateReport} 
              className="btn-primary flex items-center text-sm px-4 py-2" 
              disabled={generateReportMutation.isPending}
            >
              {generateReportMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Generate PDF Report
                </>
              )}
            </button>
          </div>
        </div>

        {/* Summary Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            <div className="card p-6 bg-gradient-to-r from-blue-500 to-blue-600 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Total Revenue</p>
                  <p className="text-2xl font-bold">₹{stats.totalRevenue.toLocaleString()}</p>
                </div>
                <DollarSign className="w-8 h-8 text-blue-200" />
              </div>
            </div>

            <div className="card p-6 bg-gradient-to-r from-green-500 to-green-600 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">Total Orders</p>
                  <p className="text-2xl font-bold">{stats.totalOrders}</p>
                </div>
                <ShoppingCart className="w-8 h-8 text-green-200" />
              </div>
            </div>

            <div className="card p-6 bg-gradient-to-r from-purple-500 to-purple-600 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">Products Sold</p>
                  <p className="text-2xl font-bold">{stats.totalProducts}</p>
                </div>
                <Package className="w-8 h-8 text-purple-200" />
              </div>
            </div>

            <div className="card p-6 bg-gradient-to-r from-orange-500 to-orange-600 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm font-medium">Active Retailers</p>
                  <p className="text-2xl font-bold">{stats.totalRetailers}</p>
                </div>
                <Users className="w-8 h-8 text-orange-200" />
              </div>
            </div>

            <div className="card p-6 bg-gradient-to-r from-teal-500 to-teal-600 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-teal-100 text-sm font-medium">Avg Order Value</p>
                  <p className="text-2xl font-bold">₹{stats.avgOrderValue.toLocaleString()}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-teal-200" />
              </div>
            </div>
          </div>
        )}

        {/* Chart Visibility Controls */}
        <div className="card p-4 mb-8">
          <div className="flex flex-wrap items-center gap-4">
            <span className="text-sm font-medium text-text-secondary">Show/Hide Charts:</span>
            {Object.entries(visibleCharts).map(([key, visible]) => (
              <button
                key={key}
                onClick={() => toggleChartVisibility(key)}
                className={`flex items-center space-x-2 px-3 py-1 rounded-lg text-sm transition-colors ${
                  visible 
                    ? 'bg-primary-100 text-primary-700 border border-primary-200' 
                    : 'bg-gray-100 text-gray-600 border border-gray-200'
                }`}
              >
                {visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Charts Grid */}
        <div className="space-y-8">
          {/* Sales Trend Chart */}
          {visibleCharts.salesTrend && getSalesTrendData() && (
            <div className="card p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-text-primary flex items-center">
                  <Activity className="w-5 h-5 mr-2 text-blue-500" />
                  Sales Trend Analysis
                </h3>
              </div>
              <div className="h-80" data-type="revenue">
                <Line data={getSalesTrendData()} options={chartOptions} />
              </div>
            </div>
          )}

          {/* Product Sales and Retailer Orders */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {visibleCharts.productSales && getProductSalesData() && (
              <div className="card p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-text-primary flex items-center">
                    <BarChart3 className="w-5 h-5 mr-2 text-blue-500" />
                    Product Sales Performance
                  </h3>
                </div>
                <div className="h-80">
                  <Bar data={getProductSalesData()} options={chartOptions} />
                </div>
              </div>
            )}

            {visibleCharts.retailerOrders && getRetailerOrdersData() && (
              <div className="card p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-text-primary flex items-center">
                    <Users className="w-5 h-5 mr-2 text-green-500" />
                    Top Retailers by Orders
                  </h3>
                </div>
                <div className="h-80">
                  <Bar data={getRetailerOrdersData()} options={chartOptions} />
                </div>
              </div>
            )}
          </div>

          {/* Product Distribution */}
          {visibleCharts.productDistribution && getProductDistributionData() && (
            <div className="card p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-text-primary flex items-center">
                  <PieChart className="w-5 h-5 mr-2 text-purple-500" />
                  Revenue Distribution by Product
                </h3>
              </div>
              <div className="h-96">
                <Doughnut data={getProductDistributionData()} options={doughnutOptions} />
              </div>
            </div>
          )}

        </div>

        {/* Data Table */}
        <div className="card p-6 mt-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-text-primary">Detailed Order Data</h3>
            <span className="text-sm text-text-secondary">
              {reportData.orders.length} orders found
            </span>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-text-secondary">Order ID</th>
                  <th className="text-left py-3 px-4 font-medium text-text-secondary">Retailer</th>
                  <th className="text-left py-3 px-4 font-medium text-text-secondary">Product</th>
                  <th className="text-left py-3 px-4 font-medium text-text-secondary">Quantity</th>
                  <th className="text-left py-3 px-4 font-medium text-text-secondary">Amount</th>
                  <th className="text-left py-3 px-4 font-medium text-text-secondary">Date</th>
                </tr>
              </thead>
              <tbody>
                {reportData.orders.map((order, index) => (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4 text-sm font-mono">#{order.OrderID}</td>
                    <td className="py-3 px-4 text-sm font-medium">{order.RetailerName}</td>
                    <td className="py-3 px-4 text-sm">{order.ProductName}</td>
                    <td className="py-3 px-4 text-sm">{order.Quantity}</td>
                    <td className="py-3 px-4 text-sm font-medium text-green-600">₹{order.Amount.toLocaleString()}</td>
                    <td className="py-3 px-4 text-sm text-text-secondary">{order.DateofOrder}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesAnalyticsDashboard;
