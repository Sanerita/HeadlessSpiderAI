// client/src/pages/campaign.tsx
import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  Divider, 
  Chip, 
  Tabs, 
  Tab, 
  IconButton,
  Tooltip,
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import { 
  ArrowBack, 
  Refresh, 
  Info, 
  BarChart, 
  PieChart, 
  ShowChart,
  ScatterPlot,
  Timeline 
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  getFirestore, 
  doc,
  collection, 
  query, 
  where, 
  orderBy,
  limit
} from 'firebase/firestore';
import { useFirestoreDocData, useFirestoreCollectionData } from 'reactfire';
import { format } from 'date-fns';
import { Charts } from '../components/Charts';
import { CampaignPerformanceMetrics } from '../components/CampaignPerformanceMetrics';
import { PlatformDistribution } from '../components/PlatformDistribution';
import { ContentPreview } from '../components/ContentPreview';
import { LoadingSkeleton } from '../components/LoadingSkeleton';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

interface CampaignData {
  id?: string;
  campaignName?: string;
  status?: string;
  objective?: string;
  platforms?: string[];
  timestamp?: { toDate: () => Date };
  strategySummary?: string;
  contentVariants?: any[];
}

interface PerformanceData {
  id?: string;
  campaignId?: string;
  metrics?: {
    impressions?: number;
    clicks?: number;
    conversions?: number;
    spend?: number;
  };
  timestamp?: { toDate: () => Date };
  platform?: string;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`campaign-tabpanel-${index}`}
      aria-labelledby={`campaign-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `campaign-tab-${index}`,
    'aria-controls': `campaign-tabpanel-${index}`,
  };
}

export const CampaignPage: React.FC = () => {
  const { campaignId = '' } = useParams<{ campaignId: string }>();
  const navigate = useNavigate();
  const [value, setValue] = useState(0);
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d'>('7d');
  const [activeMetric, setActiveMetric] = useState<'all' | 'impressions' | 'clicks' | 'conversions'>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const db = getFirestore();

  // Fetch campaign details
  const campaignRef = doc(db, 'campaigns', campaignId);
  const { status: campaignStatus, data: campaignData } = useFirestoreDocData<CampaignData>(campaignRef, {
    idField: 'id'
  });

  // Fetch campaign performance data
  const performanceQuery = query(
    collection(db, 'campaignPerformance'),
    where('campaignId', '==', campaignId),
    orderBy('timestamp', 'desc'),
    limit(timeRange === '24h' ? 24 : timeRange === '7d' ? 7 : 30)
  );
  
  const { status: performanceStatus, data: performanceData = [] } = useFirestoreCollectionData<PerformanceData>(performanceQuery, {
    idField: 'id'
  });

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const handleTimeRangeChange = (event: { target: { value: string } }) => {
    setTimeRange(event.target.value as '24h' | '7d' | '30d');
  };

  const handleMetricChange = (event: { target: { value: string } }) => {
    setActiveMetric(event.target.value as 'all' | 'impressions' | 'clicks' | 'conversions');
  };

  if (campaignStatus === 'loading' || performanceStatus === 'loading') {
    return <LoadingSkeleton />;
  }

  if (!campaignData) {
    return (
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h5" gutterBottom>
          Campaign not found
        </Typography>
        <Typography>
          The campaign with ID {campaignId} does not exist or you don't have permission to view it.
        </Typography>
      </Paper>
    );
  }

  // Calculate totals
  const totals = performanceData.reduce((acc, item) => ({
    impressions: acc.impressions + (item.metrics?.impressions || 0),
    clicks: acc.clicks + (item.metrics?.clicks || 0),
    conversions: acc.conversions + (item.metrics?.conversions || 0),
    spend: acc.spend + (item.metrics?.spend || 0),
  }), { impressions: 0, clicks: 0, conversions: 0, spend: 0 });

  // Calculate CTR and CPA
  const ctr = totals.impressions > 0 
    ? (totals.clicks / totals.impressions) * 100 
    : 0;
  const cpa = totals.conversions > 0 
    ? totals.spend / totals.conversions 
    : 0;

  // Format dates
  const startDate = campaignData.timestamp?.toDate 
    ? format(campaignData.timestamp.toDate(), 'PPpp') 
    : 'N/A';
  const lastUpdated = performanceData.length > 0 && performanceData[0].timestamp?.toDate
    ? format(performanceData[0].timestamp.toDate(), 'PPpp')
    : 'N/A';

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      {/* Header Section */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Tooltip title="Back to campaigns">
            <IconButton onClick={() => navigate('/')}>
              <ArrowBack />
            </IconButton>
          </Tooltip>
          <Typography variant="h4" component="h1">
            {campaignData.campaignName || `Campaign ${campaignId.slice(0, 6)}`}
          </Typography>
          <Chip 
            label={campaignData.status || 'Active'} 
            color={
              campaignData.status === 'Active' ? 'success' : 
              campaignData.status === 'Paused' ? 'warning' : 'error'
            } 
            size="small"
          />
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Time Range</InputLabel>
            <Select
              value={timeRange}
              label="Time Range"
              onChange={handleTimeRangeChange}
            >
              <MenuItem value="24h">Last 24 Hours</MenuItem>
              <MenuItem value="7d">Last 7 Days</MenuItem>
              <MenuItem value="30d">Last 30 Days</MenuItem>
            </Select>
          </FormControl>
          <Tooltip title="Refresh data">
            <IconButton onClick={handleRefresh} disabled={isRefreshing}>
              {isRefreshing ? <CircularProgress size={24} /> : <Refresh />}
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Campaign Summary */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Info color="primary" /> Campaign Details
            </Typography>
            <Divider sx={{ my: 1 }} />
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">Objective</Typography>
                <Typography>{campaignData.objective || 'N/A'}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">Platforms</Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {campaignData.platforms?.map((platform) => (
                    <Chip key={platform} label={platform} size="small" />
                  )) || <Typography>N/A</Typography>}
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">Start Date</Typography>
                <Typography>{startDate}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">Last Updated</Typography>
                <Typography>{lastUpdated}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary">Strategy</Typography>
                <Typography>
                  {campaignData.strategySummary || 'No strategy description available'}
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <CampaignPerformanceMetrics
            impressions={totals.impressions}
            clicks={totals.clicks}
            conversions={totals.conversions}
            spend={totals.spend}
            ctr={ctr}
            cpa={cpa}
          />
        </Grid>
      </Grid>

      {/* Tabs Section */}
      <Box sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={value} 
            onChange={handleChange} 
            aria-label="campaign tabs"
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab label="Performance" icon={<BarChart />} {...a11yProps(0)} />
            <Tab label="Platforms" icon={<PieChart />} {...a11yProps(1)} />
            <Tab label="Trends" icon={<ShowChart />} {...a11yProps(2)} />
            <Tab label="Efficiency" icon={<ScatterPlot />} {...a11yProps(3)} />
            <Tab label="Content" icon={<Timeline />} {...a11yProps(4)} />
          </Tabs>
        </Box>
        <TabPanel value={value} index={0}>
          <Box sx={{ mb: 3 }}>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Metric</InputLabel>
              <Select
                value={activeMetric}
                label="Metric"
                onChange={handleMetricChange}
              >
                <MenuItem value="all">All Metrics</MenuItem>
                <MenuItem value="impressions">Impressions</MenuItem>
                <MenuItem value="clicks">Clicks</MenuItem>
                <MenuItem value="conversions">Conversions</MenuItem>
              </Select>
            </FormControl>
          </Box>
          <Charts 
            campaignId={campaignId}
            timeRange={timeRange}
            metricType={activeMetric}
          />
        </TabPanel>
        <TabPanel value={value} index={1}>
          <PlatformDistribution 
            data={performanceData}
            timeRange={timeRange}
          />
        </TabPanel>
        <TabPanel value={value} index={2}>
          <Box sx={{ height: '500px' }}>
            <Charts 
              campaignId={campaignId}
              timeRange={timeRange}
              metricType="all"
            />
          </Box>
        </TabPanel>
        <TabPanel value={value} index={3}>
          <Box sx={{ height: '500px' }}>
            <Charts 
              campaignId={campaignId}
              timeRange={timeRange}
              metricType="all"
            />
          </Box>
        </TabPanel>
        <TabPanel value={value} index={4}>
          <ContentPreview 
            campaignId={campaignId}
            variants={campaignData.contentVariants || []}
          />
        </TabPanel>
      </Box>
    </Box>
  );
};