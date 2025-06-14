// client/src/components/PlatformDistribution.tsx
import React from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  useTheme,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText
} from '@mui/material';
import Grid from '@mui/material/Grid';

import { PieChart } from '@mui/x-charts/PieChart';
import { 
  Facebook, 
  Google, 
  LinkedIn,
  Twitter,
  Instagram
} from '@mui/icons-material';

const platformIcons: Record<string, React.ReactNode> = {
  'Facebook': <Facebook color="primary" />,
  'Google': <Google color="error" />,
  'LinkedIn': <LinkedIn color="info" />,
  'Twitter': <Twitter color="info" />,
  'Instagram': <Instagram color="secondary" />,
  'Meta': <Facebook color="primary" />,
};

interface PlatformData {
  platform: string;
  metrics?: {
    impressions?: number;
    clicks?: number;
    conversions?: number;
    spend?: number;
  };
}

interface PlatformDistributionProps {
  data: PlatformData[];
}

export const PlatformDistribution: React.FC<PlatformDistributionProps> = ({ 
  data,
  timeRange 
}) => {
  const theme = useTheme();
  
  // Aggregate data by platform
  const platformData = data.reduce((acc, item) => {
    const platform = item.platform || 'Unknown';
    const impressions = item.metrics?.impressions || 0;
    acc[platform] = (acc[platform] || 0) + impressions;
    return acc;
  }, {} as Record<string, number>);

  // Convert to array and sort
  const sortedPlatforms = Object.entries(platformData)
    .map(([platform, impressions]) => ({ platform, impressions }))
    .sort((a, b) => b.impressions - a.impressions);

  // Prepare data for pie chart
  const pieData = sortedPlatforms.map((item, index) => ({
    id: item.platform,
    value: item.impressions,
    label: item.platform,
    color: [
      theme.palette.primary.main,
      theme.palette.secondary.main,
      theme.palette.error.main,
      theme.palette.warning.main,
      theme.palette.info.main,
      theme.palette.success.main,
    ][index % 6]
  }));

  const totalImpressions = sortedPlatforms.reduce((sum, item) => sum + item.impressions, 0);

  return (
    <Grid container spacing={3}> {/* This is the parent container */}
      <Grid item xs={12} md={6}> {/* This is an item */}
        <Paper sx={{ p: 2, height: '100%' }}>
          <Typography variant="h6" gutterBottom>
            Impressions by Platform
          </Typography>
          <Box sx={{ height: 300 }}>
            <PieChart
              series={[
                {
                  data: pieData,
                  innerRadius: 40,
                  outerRadius: 100,
                  paddingAngle: 5,
                  cornerRadius: 5,
                  highlightScope: { faded: 'global', highlighted: 'item' },
                  fade: { innerRadius: 30, additionalRadius: -30, color: 'gray' },
                },
              ]}
              // Legend is hidden by default if not explicitly added to `slotProps`
            />
          </Box>
        </Paper>
      </Grid>
      <Grid item xs={12} md={6}> {/* This is another item */}
        <Paper sx={{ p: 2, height: '100%' }}>
          <Typography variant="h6" gutterBottom>
            Platform Breakdown
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Total impressions: {totalImpressions.toLocaleString()}
          </Typography>
          <List>
            {sortedPlatforms.map((item) => (
              <ListItem key={item.platform} divider>
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: 'transparent' }}>
                    {platformIcons[item.platform] || <Google />}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={item.platform}
                  secondary={`${item.impressions.toLocaleString()} impressions`}
                />
                <Typography variant="body1" fontWeight="bold">
                  {totalImpressions > 0 ? ((item.impressions / totalImpressions) * 100).toFixed(1) : 0}%
                </Typography>
              </ListItem>
            ))}
          </List>
        </Paper>
      </Grid>
    </Grid>
  );
};