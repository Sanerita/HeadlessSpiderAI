// client/src/components/ContentPreview.tsx
import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper,  
 Tabs, Tab,
 Card,
  CardContent,
  CardMedia,
  Chip,
  Avatar,
  IconButton,
  Tooltip,
  useTheme
} from '@mui/material';
import Grid from '@mui/material/Grid';

import { 
  Image, 
  TextFields, 
  Code,
  Facebook,
  Google,
  LinkedIn,
  SwapHoriz
} from '@mui/icons-material';

interface ContentVariant {
  id: string;
  type: 'text' | 'image';
  platform: string;
  content: string;
  previewUrl?: string;
  performance?: number;
  created?: Date;
}

interface ContentPreviewProps {
  campaignId: string;
  variants: ContentVariant[];
}

export const ContentPreview: React.FC<ContentPreviewProps> = ({ 
  campaignId,
  variants = []
}) => {
  const [value, setValue] = useState(0);
  const [activePlatform, setActivePlatform] = useState('all');

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  const handlePlatformChange = (platform: string) => {
    setActivePlatform(platform);
  };

  const filteredVariants = activePlatform === 'all'
    ? variants 
    : variants.filter(v => v.platform === activePlatform);

  const textVariants = filteredVariants.filter(v => v.type === 'text');
  const imageVariants = filteredVariants.filter(v => v.type === 'image');

  const platforms = Array.from(new Set(variants.map(v => v.platform)));

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Tabs
 value={value}
 onChange={handleChange}
          aria-label="content tabs"
        >
          <Tab label="Text Ads" icon={<TextFields />} />
          <Tab label="Image Ads" icon={<Image />} /> {/* Corrected Tab component */}
          <Tab label="Generated Code" icon={<Code />} />
        </Tabs>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Chip
            label="All Platforms"
            variant={activePlatform === 'all' ? 'filled' : 'outlined'}
            onClick={() => handlePlatformChange('all')}
            avatar={<Avatar sx={{ bgcolor: 'transparent' }}><SwapHoriz /></Avatar>}
          />
          {platforms.map(platform => (
            <Chip
              key={platform}
              label={platform}
              variant={activePlatform === platform ? 'filled' : 'outlined'}
              onClick={() => handlePlatformChange(platform)}
              avatar={<Avatar sx={{ bgcolor: 'transparent' }}>
                {platform === 'Facebook' ? <Facebook /> :
                 platform === 'Google' ? <Google /> :
                 platform === 'LinkedIn' ? <LinkedIn /> : <Google />}
              </Avatar>}
            />
          ))}
        </Box>
      </Box>

      <TabPanel value={value} index={0}>
        {textVariants.length > 0 ? (
          <Grid container spacing={3}>
            {textVariants.map((variant) => (
              <Grid item xs={12} md={6} key={variant.id}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
 <Chip label={variant.platform} size="small" />
                      {variant.performance && (
                        <Chip 
                          label={`${variant.performance}% CTR`} 
                          size="small"
                          color={
                            variant.performance > 5 ? 'success' : 
                            variant.performance > 2 ? 'warning' : 'error'
                          }
                        />
                      )}
                    </Box>
                    <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                      {variant.content}
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                      <Tooltip title="Copy to clipboard">
                        <IconButton size="small">
                          <TextFields fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="body1" color="text.secondary">
              No text ads generated for this platform
            </Typography>
          </Paper>
        )}
      </TabPanel>

      <TabPanel value={value} index={1}>
        {imageVariants.length > 0 ? (
          <Grid container spacing={3} container>
            {imageVariants.map((variant) => (
              <Grid item xs={12} sm={6} md={4} key={variant.id}>
                <Card>
                  {variant.previewUrl ? (
                    <CardMedia
                      component="img"
                      height="200"
                      image={variant.previewUrl}
                      alt="Generated ad content"
                    />
 ) : (
                    <Box sx={{ 
                      height: 200, 
                      bgcolor: theme.palette.grey[200],
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Typography color="text.secondary">No preview available</Typography>
                    </Box>
                  )}
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
 <Chip label={variant.platform} size="small" />
                      {variant.performance && (
                        <Chip 
                          label={`${variant.performance}% CTR`} 
                          size="small"
                          color={
                            variant.performance > 5 ? 'success' : 
                            variant.performance > 2 ? 'warning' : 'error'
                          }
                        />
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="body1" color="text.secondary">
              No image ads generated for this platform
            </Typography>
          </Paper>
        )}
      </TabPanel>

      <TabPanel value={value} index={2}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            API Response Codes
          </Typography>
          <Typography variant="body2" component="pre" sx={{ 
 bgcolor: theme.palette.grey[100],
            p: 2, 
            borderRadius: 1,
            overflowX: 'auto'
          }}>
            {JSON.stringify({
              campaignId,
              variants: variants.map(v => ({
                id: v.id,
                type: v.type,
                platform: v.platform
              })),
              generatedAt: new Date().toISOString()
            }, null, 2)}
          </Typography>
        </Paper>
      </TabPanel>
    </Box>
  );
};

// Reuse the TabPanel component from campaign.tsx
function TabPanel(props: {
  children?: React.ReactNode;
  index: number;
  value: number;
}) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`content-tabpanel-${index}`}
      aria-labelledby={`content-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 1 }}>
          {children}
        </Box>
      )}
    </div>
  );
}