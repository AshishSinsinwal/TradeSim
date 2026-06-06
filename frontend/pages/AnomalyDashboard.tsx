import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter } from 'recharts';
import { AlertTriangle, TrendingUp } from 'lucide-react';
import { api } from '../services/api';

interface Trade {
  timestamp: string;
  price: number;
  quantity: number;
  order_type: string;
  side: string;
  user_id: number;
  is_anomaly: number;
  anomaly_score: number;
}

interface AnomalyStats {
  total_trades: number;
  anomaly_count: number;
  anomaly_rate: number;
  most_anomalous: Trade[];
}

const AnomalyDashboard: React.FC = () => {
  const [stats, setStats] = useState<AnomalyStats | null>(null);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAnomalyData();
  }, []);

  const fetchAnomalyData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch anomaly stats
      const statsRes = await fetch('http://localhost:5000/ml/anomaly-stats');
      if (!statsRes.ok) throw new Error('Failed to fetch anomaly stats');
      const statsData = await statsRes.json();
      setStats(statsData.stats);

      // Fetch full anomalies data for chart
      const anomaliesRes = await fetch('http://localhost:5000/ml/anomalies');
      if (!anomaliesRes.ok) throw new Error('Failed to fetch anomalies');
      const anomaliesData = await anomaliesRes.json();
      setTrades(anomaliesData.data.all_trades.slice(0, 500)); // Limit for chart performance
    } catch (err) {
      console.error('Error fetching anomaly data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load anomaly data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-zinc-400">Loading anomaly data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-950/30 border border-red-800 rounded-lg p-6 text-red-200">
          <h3 className="font-semibold mb-2">Error Loading Data</h3>
          <p>{error}</p>
          <button
            onClick={fetchAnomalyData}
            className="mt-4 px-4 py-2 bg-red-700 hover:bg-red-600 rounded transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const chartData = trades.map(trade => ({
    timestamp: new Date(trade.timestamp).toLocaleString(),
    price: trade.price,
    is_anomaly: trade.is_anomaly,
    anomaly_score: trade.anomaly_score,
  }));

  const normalTrades = chartData.filter(d => d.is_anomaly === 0);
  const anomalyTrades = chartData.filter(d => d.is_anomaly === 1);

  const topAnomalies = (stats?.most_anomalous || []).slice(0, 10);

  return (
    <div className="p-8 max-w-7xl mx-auto w-full">
      {/* Header */}
      <header className="mb-10">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
          <AlertTriangle className="text-red-500" size={32} />
          Anomaly Detection
        </h1>
        <p className="text-zinc-500">Real-time trade anomaly monitoring and analysis</p>
      </header>

      {/* Stat Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {/* Total Trades */}
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 hover:border-zinc-700 transition-colors">
            <p className="text-zinc-400 text-sm font-medium mb-2">Total Trades Analyzed</p>
            <h2 className="text-4xl font-bold text-white mb-2">{stats.total_trades.toLocaleString()}</h2>
            <p className="text-zinc-600 text-xs">From 7-day sample</p>
          </div>

          {/* Anomalies Detected */}
          <div className="bg-red-950/20 border border-red-900/50 rounded-xl p-6 hover:border-red-800/50 transition-colors">
            <p className="text-red-300 text-sm font-medium mb-2">Anomalies Detected</p>
            <h2 className="text-4xl font-bold text-red-400 mb-2">{stats.anomaly_count}</h2>
            <p className="text-red-700 text-xs">Suspicious patterns identified</p>
          </div>

          {/* Anomaly Rate */}
          <div className="bg-orange-950/20 border border-orange-900/50 rounded-xl p-6 hover:border-orange-800/50 transition-colors">
            <p className="text-orange-300 text-sm font-medium mb-2">Anomaly Rate</p>
            <h2 className="text-4xl font-bold text-orange-400 mb-2">{stats.anomaly_rate.toFixed(2)}%</h2>
            <p className="text-orange-700 text-xs">Percentage of all trades</p>
          </div>
        </div>
      )}

      {/* Price Chart */}
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 mb-10">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <TrendingUp size={20} className="text-emerald-500" />
          Price Movement with Anomalies
        </h3>
        <ResponsiveContainer width="100%" height={400}>
          <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis
              dataKey="timestamp"
              stroke="#888"
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => value.substring(11, 19)}
            />
            <YAxis stroke="#888" tick={{ fontSize: 12 }} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1a1a1a',
                border: '1px solid #444',
                borderRadius: '8px',
              }}
              formatter={(value) => `$${value.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
              labelFormatter={(label) => `Price: ${label}`}
            />
            
            {/* Normal trades - blue dots */}
            <Scatter
              name="Normal Trades"
              data={normalTrades}
              fill="#3b82f6"
              fillOpacity={0.6}
            />
            
            {/* Anomalous trades - red markers with warning symbol effect */}
            <Scatter
              name="Anomalies"
              data={anomalyTrades}
              fill="#ef4444"
              fillOpacity={0.9}
            />
            <Legend />
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      {/* Top Anomalies Table */}
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-4">Top 10 Most Anomalous Trades</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-700">
                <th className="text-left py-3 px-4 text-zinc-400 font-semibold">Timestamp</th>
                <th className="text-right py-3 px-4 text-zinc-400 font-semibold">Price</th>
                <th className="text-right py-3 px-4 text-zinc-400 font-semibold">Quantity</th>
                <th className="text-center py-3 px-4 text-zinc-400 font-semibold">Type</th>
                <th className="text-right py-3 px-4 text-zinc-400 font-semibold">Anomaly Score</th>
              </tr>
            </thead>
            <tbody>
              {topAnomalies.map((trade, idx) => (
                <tr
                  key={idx}
                  className="border-b border-zinc-800 hover:bg-zinc-800/30 transition-colors bg-red-950/10"
                >
                  <td className="py-3 px-4 text-zinc-300">
                    {new Date(trade.timestamp).toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-right text-emerald-400 font-medium">
                    ₹{trade.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-3 px-4 text-right text-zinc-300">
                    {trade.quantity.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      trade.order_type === 'MARKET'
                        ? 'bg-blue-900/40 text-blue-300'
                        : 'bg-purple-900/40 text-purple-300'
                    }`}>
                      {trade.order_type}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className="bg-red-900/40 text-red-300 px-3 py-1 rounded-full text-xs font-semibold">
                      {trade.anomaly_score.toFixed(4)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AnomalyDashboard;
