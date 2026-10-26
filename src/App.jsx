import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import {
  CssBaseline, AppBar, Toolbar, Typography, IconButton, Drawer,
  List, ListItem, ListItemIcon, ListItemText, Box, Container,
  Button, Chip, Tooltip, Avatar, Menu, MenuItem, Divider
} from '@mui/material';
import { ThemeProvider, useTheme } from './ThemeContext';
import MenuIcon from '@mui/icons-material/Menu';
import InventoryIcon from '@mui/icons-material/Inventory2Outlined';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenuOutlined';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonthOutlined';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCartOutlined';
import BarChartIcon from '@mui/icons-material/BarChartOutlined';
import LogoutIcon from '@mui/icons-material/LogoutOutlined';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import ThemeToggle from './components/ThemeToggle';
import InventoryPage from './InventoryPage';
import RecipesPage from './RecipesPage';
import MealPlansPage from './MealPlansPage';
import ShoppingListsPage from './ShoppingListsPage';
import AnalyticsPage from './AnalyticsPage';
import Hero from './Hero';
import AuthPage from './AuthPage';
import Footer from './Footer';
import { auth } from './firebase';
import { signOut } from 'firebase/auth';

const App = () => {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </ThemeProvider>
  );
};

export default App;

const navItems = [
  { path: '/', label: 'Inventory', icon: <InventoryIcon fontSize="small" /> },
  { path: '/recipes', label: 'Recipes', icon: <RestaurantMenuIcon fontSize="small" /> },
  { path: '/meal-plans', label: 'Meal Plans', icon: <CalendarMonthIcon fontSize="small" /> },
  { path: '/shopping-lists', label: 'Shopping Lists', icon: <ShoppingCartIcon fontSize="small" /> },
  { path: '/analytics', label: 'Analytics', icon: <BarChartIcon fontSize="small" /> },
];

function PagesWrapper() {
  const location = useLocation();
  const [forceOpenRecipeDialog, setForceOpenRecipeDialog] = useState(false);
  const hasSwitchedTab = useRef(false);

  useEffect(() => {
    if (localStorage.getItem('switchToRecipesTab') === '1' && !hasSwitchedTab.current) {
      window.location.pathname = '/recipes';
      localStorage.removeItem('switchToRecipesTab');
      hasSwitchedTab.current = true;
      return;
    }
    if (location.pathname === '/recipes' && localStorage.getItem('openAddRecipeDialog') === '1') {
      setForceOpenRecipeDialog(true);
      localStorage.removeItem('openAddRecipeDialog');
      hasSwitchedTab.current = false;
    } else {
      setForceOpenRecipeDialog(false);
    }
  }, [location]);

  return (
    <Box className="animate-fade-in-up" key={location.pathname} sx={{ width: '100%' }}>
      {(() => {
        switch (location.pathname) {
          case '/recipes':
            return <RecipesPage forceOpenDialog={forceOpenRecipeDialog} />;
          case '/meal-plans':
            return <MealPlansPage />;
          case '/shopping-lists':
            return <ShoppingListsPage />;
          case '/analytics':
            return <AnalyticsPage />;
          default:
            return <InventoryPage />;
        }
      })()}
    </Box>
  );
}

const AppContent = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [showHero, setShowHero] = useState(true);
  const [user, setUser] = useState(auth.currentUser);
  const [authed, setAuthed] = useState(!!auth.currentUser);
  const [userMenuAnchor, setUserMenuAnchor] = useState(null);
  const { isDarkMode, colors } = useTheme();

  useEffect(() => {
    const unsub = auth.onAuthStateChanged(currentUser => {
      setUser(currentUser);
      setAuthed(!!currentUser);
    });
    return unsub;
  }, []);

  const handleSignOut = async () => {
    setUserMenuAnchor(null);
    await signOut(auth);
    setAuthed(false);
    setShowHero(true);
  };

  // Landing / Hero for unauthenticated users
  if (!authed && showHero) {
    return (
      <Box className="aurora-bg" sx={{ minHeight: '100vh', bgcolor: colors.background, display: 'flex', flexDirection: 'column', position: 'relative' }}>
        <CssBaseline />
        <AppBar
          position="sticky"
          elevation={0}
          sx={{
            bgcolor: colors.glassBg,
            backdropFilter: colors.glassBlur,
            borderBottom: `1px solid ${colors.divider}`,
          }}
        >
          <Container maxWidth="lg">
            <Toolbar disableGutters sx={{ minHeight: 70, display: 'flex', justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, cursor: 'pointer' }} onClick={() => setShowHero(true)}>
                <Box
                  sx={{
                    width: 38,
                    height: 38,
                    borderRadius: '10px',
                    background: colors.gradientPrimary,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                    color: '#fff',
                  }}
                >
                  <RestaurantMenuIcon fontSize="medium" />
                </Box>
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 800,
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    letterSpacing: '-0.02em',
                    color: colors.text,
                  }}
                >
                  GrocyGo
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <ThemeToggle />
                <Button
                  variant="contained"
                  onClick={() => setShowHero(false)}
                  sx={{
                    background: colors.gradientPrimary,
                    borderRadius: '10px',
                    px: 3,
                    fontWeight: 600,
                  }}
                >
                  Sign In
                </Button>
              </Box>
            </Toolbar>
          </Container>
        </AppBar>
        <Box sx={{ flex: 1 }}>
          <Hero onGetStarted={() => setShowHero(false)} />
        </Box>
        <Footer />
      </Box>
    );
  }

  // Auth page for unauthenticated users
  if (!authed) {
    return (
      <Box className="aurora-bg" sx={{ minHeight: '100vh', bgcolor: colors.background, display: 'flex', flexDirection: 'column' }}>
        <CssBaseline />
        <AppBar
          position="sticky"
          elevation={0}
          sx={{
            bgcolor: colors.glassBg,
            backdropFilter: colors.glassBlur,
            borderBottom: `1px solid ${colors.divider}`,
          }}
        >
          <Container maxWidth="lg">
            <Toolbar disableGutters sx={{ minHeight: 70, display: 'flex', justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, cursor: 'pointer' }} onClick={() => setShowHero(true)}>
                <Box
                  sx={{
                    width: 38,
                    height: 38,
                    borderRadius: '10px',
                    background: colors.gradientPrimary,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                    color: '#fff',
                  }}
                >
                  <RestaurantMenuIcon fontSize="medium" />
                </Box>
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 800,
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    letterSpacing: '-0.02em',
                    color: colors.text,
                  }}
                >
                  GrocyGo
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <ThemeToggle />
                <Button variant="text" onClick={() => setShowHero(true)} sx={{ color: colors.textSecondary }}>
                  Back to Home
                </Button>
              </Box>
            </Toolbar>
          </Container>
        </AppBar>
        <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', py: 4 }}>
          <AuthPage onAuth={() => setAuthed(true)} />
        </Box>
        <Footer />
      </Box>
    );
  }

  // Main Authenticated Layout
  return (
    <Box className="aurora-bg" sx={{ minHeight: '100vh', bgcolor: colors.background, display: 'flex', flexDirection: 'column', position: 'relative' }}>
      <CssBaseline />
      
      {/* Floating Frosted Top Navigation Bar */}
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          bgcolor: colors.glassBg,
          backdropFilter: colors.glassBlur,
          borderBottom: `1px solid ${colors.divider}`,
          zIndex: 1100,
        }}
      >
        <Container maxWidth="xl">
          <Toolbar disableGutters sx={{ minHeight: 70 }}>
            {/* Logo */}
            <Box
              sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mr: 4, cursor: 'pointer' }}
              onClick={() => navigate('/')}
            >
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: '10px',
                  background: colors.gradientPrimary,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                  color: '#fff',
                  transition: 'transform 0.2s',
                  '&:hover': { transform: 'scale(1.05)' },
                }}
              >
                <RestaurantMenuIcon fontSize="medium" />
              </Box>
              <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 800,
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    letterSpacing: '-0.02em',
                    lineHeight: 1.1,
                    color: colors.text,
                  }}
                >
                  GrocyGo
                </Typography>
                <Typography variant="caption" sx={{ color: colors.primary, fontWeight: 600, letterSpacing: '0.04em' }}>
                  SMART KITCHEN
                </Typography>
              </Box>
            </Box>

            {/* Desktop Navigation Pill Tabs */}
            <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1, flexGrow: 1 }}>
              {navItems.map(item => {
                const isActive = location.pathname === item.path;
                return (
                  <Button
                    key={item.path}
                    startIcon={item.icon}
                    onClick={() => navigate(item.path)}
                    sx={{
                      px: 2,
                      py: 1,
                      borderRadius: '10px',
                      fontWeight: isActive ? 700 : 500,
                      fontSize: '0.9rem',
                      color: isActive ? colors.primary : colors.textSecondary,
                      bgcolor: isActive ? colors.primaryLight : 'transparent',
                      border: isActive ? `1px solid ${colors.primary}44` : '1px solid transparent',
                      transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                      '&:hover': {
                        bgcolor: isActive ? colors.primaryLight : colors.hover,
                        color: colors.text,
                        transform: 'translateY(-1px)',
                      },
                    }}
                  >
                    {item.label}
                  </Button>
                );
              })}
            </Box>

            {/* Right-side Controls: Theme Toggle, User Avatar, Mobile Menu */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, ml: 'auto' }}>
              <ThemeToggle />

              {/* User Profile Avatar / Sign Out */}
              <Tooltip title={user?.displayName || user?.email || 'Account'}>
                <IconButton
                  onClick={e => setUserMenuAnchor(e.currentTarget)}
                  sx={{
                    p: 0.5,
                    border: `1px solid ${colors.border}`,
                    bgcolor: colors.hover,
                    transition: 'all 0.2s',
                    '&:hover': { borderColor: colors.primary },
                  }}
                >
                  <Avatar
                    sx={{
                      width: 34,
                      height: 34,
                      bgcolor: colors.primary,
                      fontSize: '0.9rem',
                      fontWeight: 700,
                    }}
                  >
                    {(user?.displayName?.[0] || user?.email?.[0] || 'U').toUpperCase()}
                  </Avatar>
                </IconButton>
              </Tooltip>

              <Menu
                anchorEl={userMenuAnchor}
                open={Boolean(userMenuAnchor)}
                onClose={() => setUserMenuAnchor(null)}
                PaperProps={{
                  sx: {
                    mt: 1.5,
                    minWidth: 200,
                    p: 1,
                    bgcolor: colors.paper,
                    border: `1px solid ${colors.border}`,
                    borderRadius: '14px',
                    boxShadow: colors.cardShadow,
                  },
                }}
              >
                <Box sx={{ px: 2, py: 1 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: colors.text }}>
                    {user?.displayName || 'User'}
                  </Typography>
                  <Typography variant="caption" sx={{ color: colors.textSecondary, wordBreak: 'break-all' }}>
                    {user?.email}
                  </Typography>
                </Box>
                <Divider sx={{ my: 1, borderColor: colors.divider }} />
                <MenuItem
                  onClick={handleSignOut}
                  sx={{
                    borderRadius: '8px',
                    color: colors.error,
                    fontWeight: 600,
                    gap: 1.5,
                    '&:hover': { bgcolor: `${colors.error}18` },
                  }}
                >
                  <LogoutIcon fontSize="small" />
                  Sign Out
                </MenuItem>
              </Menu>

              {/* Mobile Drawer Trigger */}
              <IconButton
                sx={{
                  display: { md: 'none' },
                  borderRadius: '10px',
                  border: `1px solid ${colors.border}`,
                  bgcolor: colors.hover,
                  color: colors.text,
                }}
                onClick={() => setDrawerOpen(true)}
              >
                <MenuIcon />
              </IconButton>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Modern Slide-in Mobile Drawer */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{
          sx: {
            width: 280,
            p: 2.5,
            bgcolor: colors.paper,
            backdropFilter: 'blur(20px)',
            borderLeft: `1px solid ${colors.border}`,
          },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: '8px',
              background: colors.gradientPrimary,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
            }}
          >
            <RestaurantMenuIcon fontSize="small" />
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 800, color: colors.text }}>
            GrocyGo
          </Typography>
        </Box>

        <List sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {navItems.map(item => {
            const isActive = location.pathname === item.path;
            return (
              <ListItem
                key={item.path}
                button
                onClick={() => {
                  navigate(item.path);
                  setDrawerOpen(false);
                }}
                sx={{
                  borderRadius: '12px',
                  bgcolor: isActive ? colors.primaryLight : 'transparent',
                  color: isActive ? colors.primary : colors.text,
                  border: isActive ? `1px solid ${colors.primary}44` : '1px solid transparent',
                  '&:hover': { bgcolor: colors.hover },
                }}
              >
                <ListItemIcon sx={{ color: isActive ? colors.primary : colors.textSecondary, minWidth: 40 }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{ fontWeight: isActive ? 700 : 500, fontSize: '0.95rem' }}
                />
              </ListItem>
            );
          })}
        </List>

        <Box sx={{ mt: 'auto', pt: 2, borderTop: `1px solid ${colors.divider}` }}>
          <Button
            fullWidth
            startIcon={<LogoutIcon />}
            onClick={handleSignOut}
            sx={{
              color: colors.error,
              bgcolor: `${colors.error}15`,
              borderRadius: '10px',
              fontWeight: 600,
              py: 1,
              '&:hover': { bgcolor: `${colors.error}25` },
            }}
          >
            Sign Out
          </Button>
        </Box>
      </Drawer>

      {/* Main Content Area */}
      <Box component="main" sx={{ flex: 1, width: '100%', py: { xs: 2, md: 3 } }}>
        <Routes>
          <Route path="/" element={<PagesWrapper />} />
          <Route path="/recipes" element={<PagesWrapper />} />
          <Route path="/meal-plans" element={<PagesWrapper />} />
          <Route path="/shopping-lists" element={<PagesWrapper />} />
          <Route path="/analytics" element={<PagesWrapper />} />
        </Routes>
      </Box>

      {/* Footer */}
      <Footer />
    </Box>
  );
};