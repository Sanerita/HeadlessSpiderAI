// client/src/components/PerformanceChart.tsx
import React from 'react';
import { LineChart } from '@mui/x-charts';
import { useTheme, Box } from '@mui/material';


interface CampaignData {
  startDate: { seconds: number };
  metrics?: {
    impressions?: number;
    clicks?: number;
    conversions?: number;
    spend?: number;
  };
}

interface PerformanceChartProps {
  campaigns: CampaignData[];
}

export const PerformanceChart: React.FC<PerformanceChartProps> = ({ campaigns }) => {
  const theme = useTheme();

  // Process data for the last 7 days
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    return date;
  }).reverse();

  const chartData = last7Days.map(date => {
    const dateStr = date.toISOString().split('T')[0];
    const dayCampaigns = campaigns.filter(c => {
      const campaignDate = new Date(c.startDate.seconds * 1000).toISOString().split('T')[0];
      return campaignDate === dateStr;
    });

    return {
      date: dateStr,
      impressions: dayCampaigns.reduce((sum, c) => sum + (c.metrics?.impressions || 0), 0),
      clicks: dayCampaigns.reduce((sum, c) => sum + (c.metrics?.clicks || 0), 0),
      conversions: dayCampaigns.reduce((sum, c) => sum + (c.metrics?.conversions || 0), 0),
    };
  });

  return (
    <Box sx={{ height: 400 }}>
      <LineChart
        series={[
          {
            data: chartData.map(d => d.impressions),
            label: 'Impressions',
            color: theme.palette.primary.main,
          },
          {
            data: chartData.map(d => d.clicks),
            label: 'Clicks',
            color: theme.palette.secondary.main,
          },
          {
            data: chartData.map(d => d.conversions),
            label: 'Conversions',
            color: theme.palette.success.main,
          },
        ]}
        xAxis={[{
 data: chartData.map(d => d.date ? d.date.split('-').slice(1).join('/') : ''),
          scaleType: 'band',
        }]}
        margin={{ top: 20, bottom: 60, left: 70, right: 30 }}
        slotProps={{
          legend: {
            direction: 'row' as const,
            position: { vertical: 'bottom', horizontal: 'middle' as const },
 },
        }}
      />
    </Box>
  );
};