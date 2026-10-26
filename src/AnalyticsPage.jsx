import React, { useEffect, useState } from 'react';
import { auth } from './firebase';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer,
  Area, AreaChart
} from 'recharts';
import { useTheme } from './ThemeContext';
import CategoryListDialog from './CategoryListDialog';
import {
  Box, Paper, Typography, Avatar, Grid, Button,
  Chip, Stack, CircularProgress, Alert
} from '@mui/material';
import BarChartIcon from '@mui/icons-material/BarChartOutlined';
import TimelineIcon from '@mui/icons-material/TimelineOutlined';
import PieChartIcon from '@mui/icons-material/PieChartOutlined';
import WarningAmberIcon from '@mui/icons-material/WarningAmberOutlined';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCartOutlined';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import RefreshIcon from '@mui/icons-material/Refresh';

const API_BASE = `${process.env.REACT_APP_API_BASE || 'https://grocygo.onrender.com/api'}/analytics`;

async function fetchAnalytics(endpoint) {
  let user = auth.currentUser;
  if (!user) {
    user = await new Promise(resolve => {
      const unsub = auth.onAuthStateChanged(u => {
        if (u) {
          unsub();
          resolve(u);
        }
      });
    });
  }
  if (!user) return [];
  const token = await user.getIdToken();
  try {
    const res = await fetch(`${API_BASE}/${endpoint}`, {
      credentials: 'include',
      headers: {
        Authorization: `Bearer ${token}`,
        'x-api-key': process.env.REACT_APP_API_KEY || ''
      }
    });

    if (!res.ok) {
      return [];
    }

    const data = await res.json();
    if (data.error) return [];
    const responseData = data.data || data;
    return Array.isArray(responseData) ? responseData : [];
  } catch (error) {
    return [];
  }
}

const PIE_COLORS = ['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EC4899', '#06B6D4', '#6366F1', '#14B8A6'];

export default function AnalyticsPage() {
  const [user, setUser] = useState(auth.currentUser);
  const [inventoryUsage, setInventoryUsage] = useState([]);
  const [expiryStats, setExpiryStats] = useState([]);
  const [shoppingTrends, setShoppingTrends] = useState([]);
  const [categoryStats, setCategoryStats] = useState([]);
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [categoryDialogItems, setCategoryDialogItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { colors, isDarkMode } = useTheme();

  useEffect(() => {
    const unsub = auth.onAuthStateChanged(setUser);
    return unsub;
  }, []);

  const loadAllAnalytics = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const [
        inventoryData,
        expiryData,
        shoppingData,
        categoryData
      ] = await Promise.all([
        fetchAnalytics('inventory-usage'),
        fetchAnalytics('expiry-stats'),
        fetchAnalytics('shopping-trends'),
        fetchAnalytics('category-stats')
      ]);

      setInventoryUsage(inventoryData);
      setExpiryStats(expiryData);
      setShoppingTrends(shoppingData);
      setCategoryStats(categoryData);
    } catch (err) {
      setError(err.message || 'Failed to load kitchen insights.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllAnalytics();
  }, [user]);

  const handleCategoryClick = async (cat) => {
    setSelectedCategory(cat);
    setCategoryDialogOpen(true);
    const items = await fetchAnalytics(`category/${encodeURIComponent(cat)}/items`);
    setCategoryDialogItems(items);
  };

  const CustomChartTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <Paper
          elevation={4}
          sx={{
            p: 1.5,
            bgcolor: colors.paper,
            border: `1px solid ${colors.border}`,
            borderRadius: '12px',
            boxShadow: colors.cardShadow,
          }}
        >
          <Typography variant="caption" sx={{ fontWeight: 700, color: colors.text, display: 'block', mb: 0.5 }}>
            {label}
          </Typography>
          {payload.map((entry, index) => (
            <Typography key={`item-${index}`} variant="body2" sx={{ color: entry.color || colors.primary, fontWeight: 600 }}>
              {entry.name}: {entry.value}
            </Typography>
          ))}
        </Paper>
      );
    }
    return null;
  };

  return (
    <Box sx={{ maxWidth: 1440, mx: 'auto', px: { xs: 2, md: 4 }, py: 2 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'center' }, gap: 2, mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: colors.text, letterSpacing: '-0.02em' }}>
            Kitchen Analytics & Insights
          </Typography>
          <Typography variant="body2" sx={{ color: colors.textSecondary, mt: 0.5 }}>
            Visual reports on consumption trends, expiry mitigation, and shopping behaviors
          </Typography>
        </Box>

        <Button
          variant="outlined"
          startIcon={<RefreshIcon sx={{ animation: loading ? 'spin 1s infinite' : 'none' }} />}
          onClick={loadAllAnalytics}
          disabled={loading}
          sx={{ borderColor: colors.border, color: colors.text, borderRadius: '10px', fontWeight: 600 }}
        >
          Refresh Data
        </Button>
      </Box>

      {error && (
        <Alert severity="warning" sx={{ mb: 3, borderRadius: '14px' }}>
          {error}
        </Alert>
      )}

      {/* KPI Overview Cards Row */}
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3} sx={{ display: 'flex' }}>
          <Paper
            className="hover-lift glow-card-hover"
            elevation={0}
            sx={{
              width: '100%',
              minHeight: 112,
              p: 2.5,
              borderRadius: '20px',
              bgcolor: colors.cardBg,
              border: `1px solid ${colors.border}`,
              boxShadow: colors.cardShadow,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Box>
              <Typography variant="caption" sx={{ color: colors.textSecondary, fontWeight: 700, letterSpacing: '0.04em' }}>CATEGORIES</Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, color: colors.text, mt: 0.5 }}>
                {categoryStats.length}
              </Typography>
            </Box>
            <Box sx={{ width: 48, height: 48, borderRadius: '14px', bgcolor: colors.primaryLight, display: 'flex', alignItems: 'center', justifyContent: 'center', color: colors.primary }}>
              <PieChartIcon />
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3} sx={{ display: 'flex' }}>
          <Paper
            className="hover-lift glow-card-hover"
            elevation={0}
            sx={{
              width: '100%',
              minHeight: 112,
              p: 2.5,
              borderRadius: '20px',
              bgcolor: colors.cardBg,
              border: `1px solid ${colors.border}`,
              boxShadow: colors.cardShadow,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Box>
              <Typography variant="caption" sx={{ color: colors.textSecondary, fontWeight: 700, letterSpacing: '0.04em' }}>USAGE EVENTS</Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, color: colors.accent, mt: 0.5 }}>
                {inventoryUsage.length}
              </Typography>
            </Box>
            <Box sx={{ width: 48, height: 48, borderRadius: '14px', bgcolor: colors.accentLight, display: 'flex', alignItems: 'center', justifyContent: 'center', color: colors.accent }}>
              <TimelineIcon />
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3} sx={{ display: 'flex' }}>
          <Paper
            className="hover-lift glow-card-hover"
            elevation={0}
            sx={{
              width: '100%',
              minHeight: 112,
              p: 2.5,
              borderRadius: '20px',
              bgcolor: colors.cardBg,
              border: `1px solid ${colors.border}`,
              boxShadow: colors.cardShadow,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Box>
              <Typography variant="caption" sx={{ color: colors.textSecondary, fontWeight: 700, letterSpacing: '0.04em' }}>EXPIRY LOGS</Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, color: colors.warning, mt: 0.5 }}>
                {expiryStats.reduce((sum, e) => sum + (Number(e.expiringCount) || 0), 0)}
              </Typography>
            </Box>
            <Box sx={{ width: 48, height: 48, borderRadius: '14px', bgcolor: `${colors.warning}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: colors.warning }}>
              <WarningAmberIcon />
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={3} sx={{ display: 'flex' }}>
          <Paper
            className="hover-lift glow-card-hover"
            elevation={0}
            sx={{
              width: '100%',
              minHeight: 112,
              p: 2.5,
              borderRadius: '20px',
              bgcolor: colors.cardBg,
              border: `1px solid ${colors.border}`,
              boxShadow: colors.cardShadow,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Box>
              <Typography variant="caption" sx={{ color: colors.textSecondary, fontWeight: 700, letterSpacing: '0.04em' }}>SHOPPING LOGS</Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, color: colors.secondary, mt: 0.5 }}>
                {shoppingTrends.reduce((sum, e) => sum + (Number(e.shoppingCount) || 0), 0)}
              </Typography>
            </Box>
            <Box sx={{ width: 48, height: 48, borderRadius: '14px', bgcolor: colors.secondaryLight, display: 'flex', alignItems: 'center', justifyContent: 'center', color: colors.secondary }}>
              <ShoppingCartIcon />
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Main Charts Grid */}
      <Grid container spacing={3.5}>
        {/* Category Breakdown Pie Chart */}
        <Grid item xs={12} lg={4}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: '24px',
              bgcolor: colors.cardBg,
              border: `1px solid ${colors.border}`,
              boxShadow: colors.cardShadow,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
              <PieChartIcon sx={{ color: colors.primary }} />
              <Typography variant="h6" sx={{ fontWeight: 800, color: colors.text }}>
                Stock by Category
              </Typography>
            </Box>
            <Typography variant="caption" sx={{ color: colors.textSecondary, mb: 2 }}>
              Click any section to inspect specific groceries
            </Typography>

            {loading ? (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <CircularProgress size={30} sx={{ color: colors.primary }} />
              </Box>
            ) : categoryStats.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 8, my: 'auto', bgcolor: colors.hover, borderRadius: '16px' }}>
                <Typography variant="body2" sx={{ color: colors.textSecondary }}>No category distribution data.</Typography>
              </Box>
            ) : (
              <Box sx={{ width: '100%', height: 280, my: 'auto' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryStats}
                      dataKey="count"
                      nameKey="category"
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={95}
                      paddingAngle={4}
                      onClick={(_, idx) => handleCategoryClick(categoryStats[idx].category)}
                      style={{ cursor: 'pointer' }}
                    >
                      {categoryStats.map((_, idx) => (
                        <Cell key={`cell-${idx}`} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomChartTooltip />} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Inventory Usage Over Time (Line / Area Chart) */}
        <Grid item xs={12} lg={8}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: '24px',
              bgcolor: colors.cardBg,
              border: `1px solid ${colors.border}`,
              boxShadow: colors.cardShadow,
              mb: 3.5,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
              <TimelineIcon sx={{ color: colors.accent }} />
              <Typography variant="h6" sx={{ fontWeight: 800, color: colors.text }}>
                Kitchen Consumption vs Restock Activity
              </Typography>
            </Box>
            <Typography variant="caption" sx={{ color: colors.textSecondary, mb: 2, display: 'block' }}>
              Tracking consumed groceries vs new items added
            </Typography>

            {loading ? (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <CircularProgress size={30} sx={{ color: colors.accent }} />
              </Box>
            ) : inventoryUsage.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 6, bgcolor: colors.hover, borderRadius: '16px' }}>
                <Typography variant="body2" sx={{ color: colors.textSecondary }}>No usage trends recorded yet.</Typography>
              </Box>
            ) : (
              <Box sx={{ width: '100%', height: 230 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={inventoryUsage}>
                    <defs>
                      <linearGradient id="usedGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={colors.accent} stopOpacity={0.4} />
                        <stop offset="95%" stopColor={colors.accent} stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="addedGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={colors.primary} stopOpacity={0.4} />
                        <stop offset="95%" stopColor={colors.primary} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={colors.divider} />
                    <XAxis dataKey="date" stroke={colors.textSecondary} tick={{ fontSize: 12 }} />
                    <YAxis allowDecimals={false} stroke={colors.textSecondary} tick={{ fontSize: 12 }} />
                    <Tooltip content={<CustomChartTooltip />} />
                    <Legend />
                    <Area type="monotone" dataKey="used" stroke={colors.accent} strokeWidth={2.5} fill="url(#usedGrad)" name="Used Items" />
                    <Area type="monotone" dataKey="added" stroke={colors.primary} strokeWidth={2.5} fill="url(#addedGrad)" name="Added Items" />
                  </AreaChart>
                </ResponsiveContainer>
              </Box>
            )}
          </Paper>

          {/* Bottom Dual Bar Charts */}
          <Grid container spacing={3}>
            {/* Expiry Bar Chart */}
            <Grid item xs={12} sm={6}>
              <Paper
                elevation={0}
                sx={{
                  p: 2.5,
                  borderRadius: '20px',
                  bgcolor: colors.cardBg,
                  border: `1px solid ${colors.border}`,
                  boxShadow: colors.cardShadow,
                }}
              >
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: colors.text, mb: 1 }}>
                  Expiring Items Per Month
                </Typography>
                {expiryStats.length === 0 ? (
                  <Box sx={{ py: 4, textAlign: 'center' }}>
                    <Typography variant="caption" sx={{ color: colors.textSecondary }}>No expiry data logged</Typography>
                  </Box>
                ) : (
                  <Box sx={{ width: '100%', height: 160 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={expiryStats}>
                        <CartesianGrid strokeDasharray="3 3" stroke={colors.divider} />
                        <XAxis dataKey="month" stroke={colors.textSecondary} tick={{ fontSize: 11 }} />
                        <YAxis allowDecimals={false} stroke={colors.textSecondary} tick={{ fontSize: 11 }} />
                        <Tooltip content={<CustomChartTooltip />} />
                        <Bar dataKey="expiringCount" fill={colors.warning} radius={[6, 6, 0, 0]} name="Expiring Count" />
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                )}
              </Paper>
            </Grid>

            {/* Shopping Frequency Bar Chart */}
            <Grid item xs={12} sm={6}>
              <Paper
                elevation={0}
                sx={{
                  p: 2.5,
                  borderRadius: '20px',
                  bgcolor: colors.cardBg,
                  border: `1px solid ${colors.border}`,
                  boxShadow: colors.cardShadow,
                }}
              >
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: colors.text, mb: 1 }}>
                  Shopping Frequency
                </Typography>
                {shoppingTrends.length === 0 ? (
                  <Box sx={{ py: 4, textAlign: 'center' }}>
                    <Typography variant="caption" sx={{ color: colors.textSecondary }}>No shopping logs</Typography>
                  </Box>
                ) : (
                  <Box sx={{ width: '100%', height: 160 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={shoppingTrends}>
                        <CartesianGrid strokeDasharray="3 3" stroke={colors.divider} />
                        <XAxis dataKey="month" stroke={colors.textSecondary} tick={{ fontSize: 11 }} />
                        <YAxis allowDecimals={false} stroke={colors.textSecondary} tick={{ fontSize: 11 }} />
                        <Tooltip content={<CustomChartTooltip />} />
                        <Bar dataKey="shoppingCount" fill={colors.secondary} radius={[6, 6, 0, 0]} name="Trips" />
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                )}
              </Paper>
            </Grid>
          </Grid>
        </Grid>
      </Grid>

      {/* Category List Dialog */}
      <CategoryListDialog
        open={categoryDialogOpen}
        onClose={() => setCategoryDialogOpen(false)}
        items={categoryDialogItems}
        category={selectedCategory}
      />
    </Box>
  );
}