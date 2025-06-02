// client/src/pages/index.tsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Chip,
  Divider,
  Tabs,
  Tab,
  IconButton,
  Tooltip,
  CircularProgress,
  TextField,
  InputAdornment
} from '@mui/material';
import Grid from '@mui/material/Grid';

import {
  Refresh,
  Add,
  Search,
  FilterList,
  Campaign as CampaignIcon,
  Insights,
  Timeline
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { 
  getFirestore, 
  collection, 
  query, 
  orderBy, 
  limit,
  where,
  onSnapshot
} from 'firebase/firestore';
import { format } from 'date-fns';
import { CampaignCard } from '../components/CampaignCard';
import { PerformanceChart } from '../components/PerformanceChart';
import { PlatformDistribution } from '../components/PlatformDistribution';
import LoadingSkeleton from '../components/LoadingSkeleton';

interface Campaign {
  id: string;
  campaignName: string;
  status: 'active' | 'paused' | 'completed';
  objective: string;
  platforms: string[];
  budget: number;
  startDate: { seconds: number };
  metrics?: {
    impressions: number;
    clicks: number;
    conversions: number;
    spend: number;
  };
}

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const db = getFirestore();
  const [activeTab, setActiveTab] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    let q = query(
      collection(db, 'campaigns'),
      orderBy('startDate', 'desc'),
      limit(50)
    );

    if (filterStatus) {
      q = query(q, where('status', '==', filterStatus));
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Campaign[];
      setCampaigns(data);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [db, filterStatus]);

  const filteredCampaigns = campaigns.filter(campaign =>
    campaign.campaignName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    campaign.objective.toLowerCase().includes(searchQuery.toLowerCase()) ||
    campaign.platforms.some(p => p.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const activeCampaigns = campaigns.filter(c => c.status === 'active');
  const pausedCampaigns = campaigns.filter(c => c.status === 'paused');
  const completedCampaigns = campaigns.filter(c => c.status === 'completed');

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue); // Keep event parameter as it's part of the expected function signature
  };

  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 1000);
  };

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      {/* Header Section */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Campaign Dashboard
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => navigate('/campaigns/new')}
          >
            New Campaign
          </Button>
          <Tooltip title="Refresh data">
            <IconButton onClick={handleRefresh} disabled={isLoading}>
              {isLoading ? <CircularProgress size={24} /> : <Refresh />}
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Stats Overview */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid component="div" item xs={12} md={4}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" color="text.secondary">
              Active Campaigns
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
              <Typography variant="h3" sx={{ mr: 2 }}>
                {activeCampaigns.length}
              </Typography>
              <Chip
                label="View All"
                color="primary"
                variant="outlined"
                size="small"
                onClick={() => setFilterStatus('active')}
              />
            </Box>
          </Paper>
        </Grid>
        <Grid component="div" item xs={12} md={4}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" color="text.secondary">
              Paused Campaigns
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
              <Typography variant="h3" sx={{ mr: 2 }}>
                {pausedCampaigns.length}
              </Typography>
              <Chip
                label="View All"
                color="warning"
                variant="outlined"
                size="small"
                onClick={() => setFilterStatus('paused')}
              />
            </Box>
          </Paper>
        </Grid>
        <Grid component="div" item xs={12} md={4}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" color="text.secondary">
              Completed Campaigns
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
              <Typography variant="h3" sx={{ mr: 2 }}>
                {completedCampaigns.length}
              </Typography>
              <Chip
                label="View All"
                color="success"
                variant="outlined"
                size="small"
                onClick={() => setFilterStatus('completed')}
              />
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Search and Filter */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <TextField
          placeholder="Search campaigns..."
          variant="outlined"
          size="small"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
          sx={{ width: 400 }}
        />
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<FilterList />}
            onClick={() => setFilterStatus(filterStatus ? null : 'active')}
            color={filterStatus ? 'primary' : 'inherit'}
          >
            Filter
          </Button>
          {filterStatus && (
            <Chip
              label={`Status: ${filterStatus}`}
              onDelete={() => setFilterStatus(null)}
            />
          )}
        </Box>
      </Box>

      {/* Tabs Section */}
      <Tabs
        value={activeTab}
        onChange={handleTabChange}
        aria-label="dashboard tabs"
        sx={{ mb: 3 }}
      >
        <Tab label="Campaigns" icon={<CampaignIcon />} />
        <Tab label="Analytics" icon={<Insights />} />
        <Tab label="Timeline" icon={<Timeline />} />
      </Tabs>

      <Divider sx={{ mb: 3 }} />

      {/* Tab Content */}
      {activeTab === 0 && ( // No changes needed here, container is already present from previous edits.
        <Grid container spacing={3} container>
          {isLoading ? (
            <LoadingSkeleton count={6} />
          ) : filteredCampaigns.length > 0 ? (
            filteredCampaigns.map((campaign) => (
              <Grid component="div" item xs={12} sm={6} md={4} key={campaign.id}>
                <CampaignCard
                  id={campaign.id}
                  name={campaign.campaignName}
                  status={campaign.status}
                  objective={campaign.objective}
                  platforms={campaign.platforms}
                  budget={campaign.budget}
                  startDate={campaign.startDate}
                  metrics={campaign.metrics}
                  onClick={() => navigate(`/campaigns/${campaign.id}`)}
                />
              </Grid>
            ))
          ) : (
            <Grid component="div" item xs={12}>
              <Paper sx={{ p: 4, textAlign: 'center' }}>
                <Typography variant="h6" gutterBottom>
                  No campaigns found
                </Typography>
                <Typography color="text.secondary">
                  {searchQuery
                    ? 'No matching campaigns for your search'
                    : filterStatus
                    ? `No ${filterStatus} campaigns`
                    : 'No campaigns have been created yet'}
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  sx={{ mt: 2 }}
                  onClick={() => navigate('/campaigns/new')}
                >
                  Create Campaign
                </Button>
              </Paper>
            </Grid>
          )}
        </Grid>
      )}

      {activeTab === 1 && (
        <Grid container spacing={3}>
          <Grid component="div" item xs={12} md={8}>
            <Paper sx={{ p: 2, height: '100%' }}>
              <Typography variant="h6" gutterBottom>
                Performance Overview
              </Typography>
              <PerformanceChart campaigns={campaigns} />
            </Paper>
          </Grid>
          <Grid component="div" item xs={12} md={4}>
            <Paper sx={{ p: 2, height: '100%' }}>
              <Typography variant="h6" gutterBottom>
                Platform Distribution
              </Typography>
              <PlatformDistribution 
                data={campaigns.flatMap(c => 
                  c.platforms.map(platform => ({
                    platform,
                    metrics: c.metrics || { impressions: 0, clicks: 0, conversions: 0, spend: 0 }
                  }))
                )} 
                timeRange="7d" 
              />
            </Paper>
          </Grid>
        </Grid>
      )}

      {activeTab === 2 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Recent Activity Timeline
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {campaigns.slice(0, 5).map((campaign) => (
              <Paper key={campaign.id} sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography fontWeight="bold">
                    {campaign.campaignName}
                  </Typography>
                  <Typography color="text.secondary">
                    {format(new Date(campaign.startDate.seconds * 1000), 'MMM d, yyyy')}
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  {campaign.objective}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                  {campaign.platforms.map((platform) => (
                    <Chip key={platform} label={platform} size="small" />
                  ))}
                </Box>
              </Paper>
            ))}
          </Box>
        </Paper>
      )}
    </Box>
  );
};