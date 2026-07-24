import React, { useEffect, useState } from 'react';
import { auth } from './firebase';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer
} from 'recharts';
import { useTheme } from './ThemeContext';
import ThemeToggle from './components/ThemeToggle';
import CategoryListDialog from './CategoryListDialog';
import { Box, Paper, Typography, IconButton, Avatar, Grid, Button, Divider } from '@mui/material';
import BarChartIcon from '@mui/icons-material/BarChart';
import LogoutIcon from '@mui/icons-material/Logout';

const API_BASE = 'https://grocygo.onrender.com/api/analytics';

async function fetchAnalytics(endpoint) {
  // Wait for user to be available before making the request
  let user = auth.currentUser;
  if (!user) {
    // Wait for onAuthStateChanged if not ready
    user = await new Promise(resolve => {
      const unsub = auth.onAuthStateChanged(u => {
        if (u) {
          unsub();
          resolve(u);
        }
      });
    });
  }
  const token = await user.getIdToken();
  try {
    const res = await fetch(`${API_BASE}/${endpoint}`, {
      credentials: 'include',
      headers: { 
        Authorization: `Bearer ${token}`,
        'x-api-key': process.env.REACT_APP_API_KEY || '' // Add API key if required
      }
    });
    
    if (!res.ok) {
      console.error(`API Error (${endpoint}):`, res.status, res.statusText);
      return [];
    }

    const data = await res.json();
    console.log(`API Response (${endpoint}):`, data); // Log the response data
    
    if (data.error) {
      console.error(`API Error (${endpoint}):`, data.error);
      return [];
    }
    
    // Check if data.data exists (common API response structure)
    const responseData = data.data || data;
    return Array.isArray(responseData) ? responseData : [];
  } catch (error) {
    console.error(`Error fetching ${endpoint}:`, error);
    return [];
  }
}


const COLORS = ['#4caf50', '#ff9800', '#2196f3', '#f44336', '#9c27b0', '#ffeb3b', '#00bcd4', '#e91e63', '#8bc34a', '#ffc107'];

export default function AnalyticsPage() {
  const [user, setUser] = useState(null);
  const [inventoryUsage, setInventoryUsage] = useState([]);
  const [expiryStats, setExpiryStats] = useState([]);
  const [shoppingTrends, setShoppingTrends] = useState([]);
  const [categoryStats, setCategoryStats] = useState([]);
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [categoryDialogItems, setCategoryDialogItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const theme = useTheme();

  useEffect(() => {
    const unsub = auth.onAuthStateChanged(setUser);
    return unsub;
  }, []);

  useEffect(() => {
    async function fetchAllAnalytics() {
      if (!user) return;
      
      setLoading(true);
      setError(null);
      
      try {
        // Fetch all data in parallel
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

        console.log('Fetched all analytics data:', {
          inventoryData,
          expiryData,
          shoppingData,
          categoryData
        });

        setInventoryUsage(inventoryData);
        setExpiryStats(expiryData);
        setShoppingTrends(shoppingData);
        setCategoryStats(categoryData);
      } catch (err) {
        console.error('Error fetching analytics:', err);
        setError(err.message || 'Failed to load analytics data');
        // Set empty arrays for all data
        setInventoryUsage([]);
        setExpiryStats([]);
        setShoppingTrends([]);
        setCategoryStats([]);
      } finally {
        setLoading(false);
      }
    }

    fetchAllAnalytics();
  }, [user]);

  const handleCategoryClick = async (cat) => {
    setSelectedCategory(cat);
    setCategoryDialogOpen(true);
    const items = await fetchAnalytics(`category/${encodeURIComponent(cat)}/items`);
    setCategoryDialogItems(items);
  };

  if (!user) {
    let email, password;
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#0a192f' }}>
        <Paper elevation={6} sx={{ p: 4, borderRadius: 3, minWidth: 340, bgcolor: '#162447' }}>
          <Typography variant="h5" sx={{ color: '#fff', mb: 2, fontWeight: 700 }}>GrocyGo Analytics Login</Typography>
          <form onSubmit={async e => {
            e.preventDefault();
            await signInWithEmailAndPassword(auth, email.value, password.value);
          }}>
            <input placeholder="Email" ref={el => email = el} style={{ width: '100%', marginBottom: 12, padding: 10, borderRadius: 6, border: 'none', fontSize: 16 }} />
            <input placeholder="Password" type="password" ref={el => password = el} style={{ width: '100%', marginBottom: 18, padding: 10, borderRadius: 6, border: 'none', fontSize: 16 }} />
            <Button type="submit" variant="contained" color="primary" fullWidth sx={{ fontWeight: 700, bgcolor: '#1f4068' }}>Login</Button>
          </form>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: theme.colors.background, py: 4, px: { xs: 1, md: 4 } }}>
      <Box sx={{ width: '100%', maxWidth: '100%', mx: 'auto', p: 0, bgcolor: 'transparent', boxShadow: 'none', borderRadius: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4, justifyContent: 'space-between', px: { xs: 1, md: 4 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ bgcolor: theme.colors.primary, width: 56, height: 56, fontWeight: 700, fontSize: 28 }}>G</Avatar>
            <Box>
              <Typography variant="h4" sx={{ color: theme.colors.text, fontWeight: 700, letterSpacing: 1 }}>GrocyGo Analytics</Typography>
              <Typography variant="subtitle2" sx={{ color: theme.colors.textSecondary, fontWeight: 400 }}>Futuristic Kitchen Insights</Typography>
            </Box>
          </Box>
          <ThemeToggle />
        </Box>
        <Grid container spacing={4} sx={{ px: { xs: 1, md: 4 } }}>
          {error && (
            <Grid item xs={12}>
              <Paper elevation={4} sx={{ p: 3, borderRadius: 4, bgcolor: '#232b3e', mb: 4 }}>
                <Typography sx={{ color: '#ff4444', textAlign: 'center' }}>
                  Error loading analytics: {error}
                </Typography>
              </Paper>
            </Grid>
          )}
          <Grid item xs={12} md={4}>
            <Paper elevation={4} sx={{ p: 3, borderRadius: 4, bgcolor: '#232b3e', minHeight: 420, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <Typography variant="h6" sx={{ color: '#fff', mb: 2, fontWeight: 600 }}>Groceries by Category</Typography>
              {loading ? (
                <Typography sx={{ color: '#bfc9d1', textAlign: 'center', mt: 4 }}>Loading category data...</Typography>
              ) : Array.isArray(categoryStats) && categoryStats.length > 0 ? (
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie
                      data={categoryStats}
                      dataKey="count"
                      nameKey="category"
                      cx="50%"
                      cy="50%"
                      outerRadius={90}
                      label={({ category }) => category}
                      onClick={(_, idx) => handleCategoryClick(categoryStats[idx].category)}
                      style={{ cursor: 'pointer' }}
                    >
                      {categoryStats.map((entry, idx) => (
                        <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <Typography sx={{ color: '#bfc9d1', textAlign: 'center', mt: 4 }}>No category data available.</Typography>
              )}
              <CategoryListDialog
                open={categoryDialogOpen}
                onClose={() => setCategoryDialogOpen(false)}
                items={categoryDialogItems}
                category={selectedCategory}
              />
            </Paper>
          </Grid>
          <Grid item xs={12} md={8}>
            <Paper elevation={4} sx={{ p: 3, borderRadius: 4, bgcolor: '#232b3e', mb: 4 }}>
              <Typography variant="h6" sx={{ color: '#fff', mb: 2, fontWeight: 600 }}>Inventory Usage Over Time</Typography>
              {inventoryUsage.length === 0 ? (
                <Typography sx={{ color: '#bfc9d1', textAlign: 'center', mt: 4 }}>No inventory usage data available.</Typography>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={inventoryUsage}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#233554" />
                    <XAxis dataKey="date" stroke="#bfc9d1" />
                    <YAxis allowDecimals={false} stroke="#bfc9d1" />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="used" stroke="#8884d8" name="Used" strokeWidth={2} />
                    <Line type="monotone" dataKey="added" stroke="#82ca9d" name="Added" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </Paper>
            <Grid container spacing={4}>
              <Grid item xs={12} md={6}>
                <Paper elevation={4} sx={{ p: 3, borderRadius: 4, bgcolor: '#232b3e' }}>
                  <Typography variant="h6" sx={{ color: '#fff', mb: 2, fontWeight: 600 }}>Expiring Items Per Month</Typography>
                  {expiryStats.length === 0 ? (
                    <Typography sx={{ color: '#bfc9d1', textAlign: 'center', mt: 4 }}>No expiry stats data available.</Typography>
                  ) : (
                    <ResponsiveContainer width="100%" height={180}>
                      <BarChart data={expiryStats}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#233554" />
                        <XAxis dataKey="month" stroke="#bfc9d1" />
                        <YAxis allowDecimals={false} stroke="#bfc9d1" />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="expiringCount" fill="#ff9800" name="Expiring Items" />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </Paper>
              </Grid>
              <Grid item xs={12} md={6}>
                <Paper elevation={4} sx={{ p: 3, borderRadius: 4, bgcolor: '#232b3e' }}>
                  <Typography variant="h6" sx={{ color: '#fff', mb: 2, fontWeight: 600 }}>Shopping Frequency Per Month</Typography>
                  {shoppingTrends.length === 0 ? (
                    <Typography sx={{ color: '#bfc9d1', textAlign: 'center', mt: 4 }}>No shopping trends data available.</Typography>
                  ) : (
                    <ResponsiveContainer width="100%" height={180}>
                      <BarChart data={shoppingTrends}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#233554" />
                        <XAxis dataKey="month" stroke="#bfc9d1" />
                        <YAxis allowDecimals={false} stroke="#bfc9d1" />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="shoppingCount" fill="#2196f3" name="Shopping Trips" />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </Paper>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}