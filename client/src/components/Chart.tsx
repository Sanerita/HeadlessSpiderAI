// client/src/components/Charts.tsx
import React from 'react';
import {
  LineChart,
  BarChart,
  PieChart,
  ScatterChart,
} from '@mui/x-charts';
import { useTheme, Box, Typography, Paper, useMediaQuery } from '@mui/material';
import { useFirestoreCollectionData } from 'reactfire';
import { collection, query, where, getFirestore, orderBy, limit } from 'firebase/firestore';
import { format } from 'date-fns';

interface ChartProps {
  campaignId?: string;
  timeRange?: '24h' | '7d' | '30d';
}

interface ProcessedDataItem {
  date: Date;
  impressions: number;
  clicks: number;
  conversions: number;
  spend: number;
  ctr: number;
  platform: string;
  campaignName: string;
}

interface PieDataItem {
  id: string;
  value: number;
  label: string;
  color?: string;
}

export const Charts: React.FC<ChartProps> = ({
  campaignId,
  timeRange = '7d',
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const db = getFirestore();

  // Build Firestore query based on props
  const campaignsQuery = campaignId
    ? query(
        collection(db, 'campaigns'),
        where('campaignId', '==', campaignId),
        orderBy('timestamp', 'desc'),
        limit(timeRange === '24h' ? 24 : timeRange === '7d' ? 7 : 30)
      )
    : query(
        collection(db, 'campaigns'),
        orderBy('timestamp', 'desc'),
        limit(timeRange === '24h' ? 24 : timeRange === '7d' ? 7 : 30)
      );

  const { status, data: campaignData } = useFirestoreCollectionData(campaignsQuery, {
    idField: 'id',
  });

  if (status === 'loading') {
    return <LoadingSkeleton />;
  }

  if (!campaignData || campaignData.length === 0) {
    return (
      <Paper elevation={3} sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6">No campaign data available</Typography>
        <Typography variant="body1">
          {campaignId
            ? `No data found for campaign ${campaignId}`
            : 'No campaigns have been executed yet'}
        </Typography>
      </Paper>
    );
  }

  // Process data for charts
  const processedData: ProcessedDataItem[] = campaignData
    .map((item: any) => ({
      date: item.timestamp?.toDate() || new Date(),
      impressions: item.metrics?.impressions || 0,
      clicks: item.metrics?.clicks || 0,
      conversions: item.metrics?.conversions || 0,
      spend: item.metrics?.spend || 0,
      ctr: item.metrics?.clicks && item.metrics?.impressions 
           ? (item.metrics.clicks / item.metrics.impressions) * 100 
           : 0,
      platform: item.platform || 'Unknown',
      campaignName: item.campaignName || `Campaign ${item.campaignId?.slice(0, 6)}`,
    }))
    .reverse(); // Reverse to show chronological order

  // Data for line/bar charts
  const xAxisData = processedData.map((item) => format(item.date, 'MMM dd'));
  const impressionsData = processedData.map((item) => item.impressions);
  const clicksData = processedData.map((item) => item.clicks);
  const conversionsData = processedData.map((item) => item.conversions);
  const spendData = processedData.map((item) => item.spend);
  const ctrData = processedData.map((item) => item.ctr);

  // Data for pie chart (platform distribution)
  const platformDistribution = processedData.reduce((acc, item) => {
    const platform = item.platform;
    acc[platform] = (acc[platform] || 0) + item.impressions;
    return acc;
  }, {} as Record<string, number>);

  const pieData: PieDataItem[] = Object.entries(platformDistribution).map(([platform, value]) => ({
    id: platform,
    value,
    label: platform,
  }));

  // Common chart settings
  const chartHeight = isMobile ? 300 : 400;
  const margin = { top: 20, bottom: 60, left: 70, right: 30 };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {/* Performance Overview Chart */}
      <Paper elevation={3} sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Campaign Performance Overview
        </Typography>
        <Box sx={{ height: chartHeight }}>
          <LineChart
            series={[
              {
                data: impressionsData,
                label: 'Impressions',
                color: theme.palette.primary.main,
                area: true,
                showMark: true,
              },
              {
                data: clicksData,
                label: 'Clicks',
                color: theme.palette.secondary.main,
                showMark: true,
              },
              {
                data: conversionsData,
                label: 'Conversions',
                color: theme.palette.success.main,
                showMark: true,
              },
            ]}
            xAxis={[{ data: xAxisData, scaleType: 'band' }]}
            yAxis={[{ min: 0 }]}
            margin={margin}
            slotProps={{
              legend: {
                direction: 'row',
                position: { vertical: 'bottom', horizontal: 'center' },
                padding: 0,
              },
            }}
          />
        </Box>
      </Paper>

      {/* CTR and Spend Chart */}
      <Paper elevation={3} sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          CTR vs. Spend
        </Typography>
        <Box sx={{ height: chartHeight }}>
          <BarChart
            series={[
              {
                data: ctrData,
                label: 'CTR (%)',
                color: theme.palette.info.main,
                valueFormatter: (value: number | null) => `${(value ?? 0).toFixed(2)}%`,
              },
              {
                data: spendData,
                label: 'Spend ($)',
                color: theme.palette.warning.main,
                valueFormatter: (value: number | null) => `$${(value ?? 0).toFixed(2)}`,
              },
            ]}
            xAxis={[{ data: xAxisData, scaleType: 'band' }]}
            yAxis={[
              { id: 'leftAxis', min: 0, max: Math.max(...ctrData) * 1.2 },
              { id: 'rightAxis', min: 0, max: Math.max(...spendData) * 1.2 },
            ]}
            margin={margin}
            slotProps={{
              legend: {
                direction: 'row',
                position: { vertical: 'bottom', horizontal: 'center' },
                padding: 0,
              },
            }}
            leftAxis="leftAxis"
            rightAxis="rightAxis"
          />
        </Box>
      </Paper>

      {/* Platform Distribution */}
      <Paper elevation={3} sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Platform Distribution
        </Typography>
        <Box sx={{ height: chartHeight }}>
          <PieChart
            series={[
              {
                data: pieData,
                innerRadius: 30,
                outerRadius: 100,
                paddingAngle: 5,
                cornerRadius: 5,
                highlightScope: { fade: 'global', highlight: 'item' },
              },
            ]}
            margin={margin}
            slotProps={{
              legend: {
                direction: 'row',
                position: { vertical: 'bottom', horizontal: 'center' },
                padding: 0,
              },
            }}
          />
        </Box>
      </Paper>

      {/* Performance Scatter Plot */}
      <Paper elevation={3} sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Efficiency Analysis
        </Typography>
        <Box sx={{ height: chartHeight }}>
          <ScatterChart
            series={[
              {
                data: processedData.map((item) => ({
                  x: item.spend,
                  y: item.conversions,
                  id: item.campaignName,
                })),
                label: 'Spend vs. Conversions',
                color: theme.palette.primary.main,
              },
            ]}
            xAxis={[{ label: 'Spend ($)', min: 0 }]}
            yAxis={[{ label: 'Conversions', min: 0 }]}
            margin={margin}
          />
        </Box>
      </Paper>
    </Box>
  );
};

const LoadingSkeleton: React.FC = () => (
  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
    {[...Array(4)].map((_, index) => (
      <Paper key={index} elevation={3} sx={{ p: 3, height: 400 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box sx={{ width: '60%', height: 32, bgcolor: 'grey.300', borderRadius: 1 }} />
          <Box sx={{ width: '100%', height: 300, bgcolor: 'grey.200', borderRadius: 1 }} />
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
            {[...Array(3)].map((_, i) => (
              <Box key={i} sx={{ width: 80, height: 20, bgcolor: 'grey.300', borderRadius: 1 }} />
            ))}
          </Box>
        </Box>
      </Paper>
    ))}
  </Box>
);