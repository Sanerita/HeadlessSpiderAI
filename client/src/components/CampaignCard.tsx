// client/src/components/CampaignCard.tsx
import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Chip,
  Box,
  Divider,
  LinearProgress,
  Avatar,
  IconButton
} from '@mui/material';
import {
  BarChart,
  MoreVert,
  PlayCircle,
  PauseCircle,
  CheckCircle
} from '@mui/icons-material';
import { format } from 'date-fns';

interface CampaignCardProps {
  id: string;
  name: string;
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
  onClick?: () => void;
}

const statusIcons = {
  active: <PlayCircle color="success" />,
  paused: <PauseCircle color="warning" />,
  completed: <CheckCircle color="info" />
};

const platformColors = {
  'Google': '#4285F4',
  'Facebook': '#1877F2',
  'Instagram': '#E4405F',
  'LinkedIn': '#0A66C2',
  'Twitter': '#1DA1F2'
};

export const CampaignCard: React.FC<CampaignCardProps> = ({
  id,
  name,
  status,
  objective,
  platforms,
  budget,
  startDate,
  metrics,
  onClick
}) => {
  const ctr = metrics && metrics.impressions > 0 
    ? (metrics.clicks / metrics.impressions) * 100 
    : 0;

  return (
    <Card 
      onClick={onClick}
      sx={{ 
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        cursor: 'pointer',
        transition: 'transform 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 6
        }
      }}
    >
      <CardContent sx={{ flexGrow: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="h6" component="h2" noWrap>
            {name}
          </Typography>
          <IconButton size="small" sx={{ ml: 1 }}>
            <MoreVert />
          </IconButton>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, mb: 2 }}>
          {statusIcons[status]}
          <Chip
            label={status}
            size="small"
            sx={{ 
              ml: 1,
              textTransform: 'capitalize',
              backgroundColor: 
                status === 'active' ? 'success.light' :
                status === 'paused' ? 'warning.light' : 'info.light'
            }}
          />
        </Box>

        <Typography variant="body2" color="text.secondary" noWrap>
          {objective}
        </Typography>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
          {platforms.map((platform) => (
            <Chip
              key={platform}
              label={platform}
              size="small"
              avatar={
                <Avatar sx={{ 
                  bgcolor: platformColors[platform as keyof typeof platformColors] || '#666',
                  width: 24,
                  height: 24
                }}>
                  {platform.charAt(0)}
                </Avatar>
              }
            />
          ))}
        </Box>

        {metrics && (
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2">CTR</Typography>
              <Typography variant="body2" fontWeight="bold">
                {ctr.toFixed(2)}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={Math.min(ctr, 100)}
              sx={{ 
                height: 6,
                borderRadius: 3,
                mt: 0.5,
                backgroundColor: 'divider',
                '& .MuiLinearProgress-bar': {
                  backgroundColor: ctr > 5 ? 'success.main' : ctr > 2 ? 'warning.main' : 'error.main'
                }
              }}
            />
          </Box>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="body2" color="text.secondary">
            Budget
          </Typography>
          <Typography variant="body2" fontWeight="bold">
            ${budget.toLocaleString()}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Started
          </Typography>
          <Typography variant="body2">
            {format(new Date(startDate.seconds * 1000), 'MMM d, yyyy')}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};