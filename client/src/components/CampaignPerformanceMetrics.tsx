// client/src/components/CampaignPerformanceMetrics.tsx
import React from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  Divider, 
  LinearProgress,
  useTheme
} from '@mui/material';
import { 
  ArrowUpward, 
  ArrowDownward,
  Equalizer,
  TouchApp,
  MonetizationOn,
  TrendingUp,
  AccountBalance
} from '@mui/icons-material';

interface CampaignPerformanceMetricsProps {
  impressions: number;
  clicks: number;
  conversions: number;
  spend: number;
  ctr: number;
  cpa: number;
}

const MetricCard: React.FC<{
  title: string;
  value: string | number;
  change?: number;
  icon: React.ReactNode;
}> = ({ title, value, change, icon }) => {
  const theme = useTheme();
  const isPositive = change !== undefined ? change >= 0 : null;

  return (
    <Paper sx={{ p: 2, height: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
        <Typography variant="body2" color="text.secondary">{title}</Typography>
        <Box sx={{ color: theme.palette.primary.main }}>{icon}</Box>
      </Box>
      <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
        {typeof value === 'number' ? value.toLocaleString() : value}
      </Typography>
      {change !== undefined && (
        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
          {isPositive ? (
            <ArrowUpward color="success" fontSize="small" />
          ) : (
            <ArrowDownward color="error" fontSize="small" />
          )}
          <Typography 
            variant="body2" 
            color={isPositive ? 'success.main' : 'error.main'}
            sx={{ ml: 0.5 }}
          >
            {Math.abs(change)}%
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

export const CampaignPerformanceMetrics: React.FC<CampaignPerformanceMetricsProps> = ({
  impressions,
  clicks,
  conversions,
  spend,
  ctr,
  cpa,
}) => {
  // Mock change percentages - replace with real data
  const impressionChange = 12.5;
  const clickChange = -3.2;
  const conversionChange = 8.7;
  const spendChange = 5.3;
  const ctrChange = ((ctr - 2.5) / 2.5) * 100; // Mock baseline CTR of 2.5%
  const cpaChange = ((15 - cpa) / 15) * 100; // Mock baseline CPA of $15

  return (
    <Paper sx={{ p: 2, height: '100%' }}>
      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Equalizer color="primary" /> Performance Summary
      </Typography>
      <Divider sx={{ my: 1 }} />
      <Grid container spacing={2}>
        <Grid item xs={6} md={4}>
          <MetricCard
            title="Impressions"
            value={impressions}
            change={impressionChange}
            icon={<TrendingUp />}
          />
        </Grid>
        <Grid item xs={6} md={4}>
          <MetricCard
            title="Clicks"
            value={clicks}
            change={clickChange}
            icon={<TouchApp />}
          />
        </Grid>
        <Grid item xs={6} md={4}>
          <MetricCard
            title="Conversions"
            value={conversions}
            change={conversionChange}
            icon={<MonetizationOn />}
          />
        </Grid>
        <Grid item xs={6} md={4}>
          <MetricCard
            title="Spend"
            value={`$${spend.toFixed(2)}`}
            change={spendChange}
            icon={<AccountBalance />}
          />
        </Grid>
        <Grid item xs={6} md={4}>
          <MetricCard
            title="CTR"
            value={`${ctr.toFixed(2)}%`}
            change={ctrChange}
            icon={<TrendingUp />}
          />
        </Grid>
        <Grid item xs={6} md={4}>
          <MetricCard
            title="CPA"
            value={`$${cpa.toFixed(2)}`}
            change={cpaChange}
            icon={<MonetizationOn />}
          />
        </Grid>
      </Grid>
      <Box sx={{ mt: 2 }}>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Performance vs. benchmark
        </Typography>
        <LinearProgress 
          variant="determinate" 
          value={Math.min(ctr * 10, 100)} // Scale CTR for progress bar
          sx={{ height: 8, borderRadius: 4 }}
          color={ctr > 3 ? 'success' : ctr > 1.5 ? 'warning' : 'error'}
        />
      </Box>
    </Paper>
  );
};