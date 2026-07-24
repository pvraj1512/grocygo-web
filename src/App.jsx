import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { ThemeProvider as MuiThemeProvider, createTheme, CssBaseline, AppBar, Toolbar, Typography, IconButton, Drawer, List, ListItem, ListItemIcon, ListItemText, Box, Container, Button } from '@mui/material';
import { ThemeProvider, useTheme } from './ThemeContext';
import MenuIcon from '@mui/icons-material/Menu';
import InventoryIcon from '@mui/icons-material/Inventory';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import BarChartIcon from '@mui/icons-material/BarChart';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import InventoryPage from './InventoryPage';
import RecipesPage from './RecipesPage';
import MealPlansPage from './MealPlansPage';
import ShoppingListsPage from './ShoppingListsPage';
import AnalyticsPage from './AnalyticsPage';
import Hero from './Hero';
import AuthPage from './AuthPage';
import Footer from './Footer';
import { auth } from './firebase';

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

const pages = [
  { name: 'Inventory', icon: <InventoryIcon /> },
  { name: 'Recipes', icon: <RestaurantMenuIcon /> },
  { name: 'Meal Plans', icon: <CalendarMonthIcon /> },
  { name: 'Shopping Lists', icon: <ShoppingCartIcon /> },
  { name: 'Analytics', icon: <BarChartIcon /> },
];

const glassBg = {
  background: 'rgba(30, 34, 45, 0.7)',
  boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
  backdropFilter: 'blur(8px)',
  borderRadius: 16,
  border: '1px solid rgba(255,255,255,0.18)',
};

function PagesWrapper() {
  const location = useLocation();
  const [forceOpenRecipeDialog, setForceOpenRecipeDialog] = React.useState(false);
  // Use a ref to avoid infinite loop when switching tab
  const hasSwitchedTab = React.useRef(false);
  
  React.useEffect(() => {
    // Auto-switch tab if requested
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
}

const AppContent = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [showHero, setShowHero] = useState(true);
  const [authed, setAuthed] = useState(!!auth.currentUser);
  const { isDarkMode, toggleTheme, colors } = useTheme();

  // Listen for auth state changes
  React.useEffect(() => {
    const unsub = auth.onAuthStateChanged(user => setAuthed(!!user));
    return unsub;
  }, []);

  // Show hero if not authenticated and not on auth page
  if (!authed && showHero) {
    return (
      <>
        <CssBaseline />
        <Box sx={{ minHeight: '100vh', background: colors.background }}>
          <AppBar position="sticky" color="transparent" elevation={0} sx={{ backdropFilter: 'blur(12px)', background: 'rgba(30,34,45,0.7)' }}>
            <Toolbar>
              <Typography variant="h5" sx={{ flexGrow: 1, fontWeight: 700, letterSpacing: 1 }}>
                GrocyGo
              </Typography>
              <IconButton sx={{ ml: 1 }} onClick={toggleTheme} color="inherit">
                {isDarkMode ? <Brightness7Icon /> : <Brightness4Icon />}
              </IconButton>
            </Toolbar>
          </AppBar>
          <Hero onGetStarted={() => setShowHero(false)} />
        </Box>
      </>
    );
  }

  // Show auth page if not authenticated
  if (!authed) {
    return (
      <>
        <CssBaseline />
        <Box sx={{ minHeight: '100vh', background: colors.background }}>
          <AppBar position="sticky" color="transparent" elevation={0} sx={{ backdropFilter: 'blur(12px)', background: 'rgba(30,34,45,0.7)' }}>
            <Toolbar>
              <Typography variant="h5" sx={{ flexGrow: 1, fontWeight: 700, letterSpacing: 1 }}>
                GrocyGo
              </Typography>
              <IconButton sx={{ ml: 1 }} onClick={toggleTheme} color="inherit">
                {isDarkMode ? <Brightness7Icon /> : <Brightness4Icon />}
              </IconButton>
            </Toolbar>
          </AppBar>
          <AuthPage onAuth={() => setAuthed(true)} />
        </Box>
      </>
    );
  }

  return (
    <>
      <CssBaseline />
      <Box sx={{ minHeight: '100vh', background: colors.background, display: 'flex', flexDirection: 'column' }}>
        {/* Top Navigation Bar */}
        <AppBar position="static" color="default" elevation={1} sx={{ bgcolor: colors.paper, borderBottom: `1px solid ${colors.divider}` }}>
          <Container maxWidth="lg">
            <Toolbar disableGutters sx={{ minHeight: 64 }}>
              <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center' }}>
                <img
                  src={process.env.PUBLIC_URL + '/logo/tr_logo.png'}
                  alt="GrocyGo Logo"
                  style={{
                    height: 75,
                    width: 200,
                    objectFit: 'cover',
                    objectPosition: 'center',
                    borderRadius: 6,
                    marginRight: 12,
                    background: '#fff'
                  }}
                />
              </Box>
              <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 2 }}>
                <Button color={location.pathname === '/' ? 'primary' : 'inherit'} onClick={() => navigate('/')} sx={{ fontWeight: 600, color: colors.text }}>Inventory</Button>
                <Button color={location.pathname === '/recipes' ? 'primary' : 'inherit'} onClick={() => navigate('/recipes')} sx={{ fontWeight: 600, color: colors.text }}>Recipes</Button>
                <Button color={location.pathname === '/meal-plans' ? 'primary' : 'inherit'} onClick={() => navigate('/meal-plans')} sx={{ fontWeight: 600, color: colors.text }}>Meal Plans</Button>
                <Button color={location.pathname === '/shopping-lists' ? 'primary' : 'inherit'} onClick={() => navigate('/shopping-lists')} sx={{ fontWeight: 600, color: colors.text }}>Shopping Lists</Button>
                <Button color={location.pathname === '/analytics' ? 'primary' : 'inherit'} onClick={() => navigate('/analytics')} sx={{ fontWeight: 600, color: colors.text }}>Analytics</Button>
              </Box>
              <IconButton sx={{ ml: 2 }} onClick={toggleTheme} color="inherit">
                {isDarkMode ? <Brightness7Icon /> : <Brightness4Icon />}
              </IconButton>
              <IconButton sx={{ ml: 1, display: { md: 'none' } }} onClick={() => setDrawerOpen(true)} color="inherit">
                <MenuIcon />
              </IconButton>
            </Toolbar>
          </Container>
        </AppBar>
        {/* Drawer for mobile navigation */}
        <Drawer anchor="left" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
          <Box sx={{ width: 250, pt: 2, background: colors.paper, color: colors.text }}>
            <Typography variant="h6" align="center" sx={{ mb: 2, fontWeight: 700 }}>Menu</Typography>
            <List>
              <ListItem button selected={location.pathname === '/'} onClick={() => { navigate('/'); setDrawerOpen(false); }}>
                <ListItemIcon><InventoryIcon /></ListItemIcon>
                <ListItemText primary="Inventory" />
              </ListItem>
              <ListItem button selected={location.pathname === '/recipes'} onClick={() => { navigate('/recipes'); setDrawerOpen(false); }}>
                <ListItemIcon><RestaurantMenuIcon /></ListItemIcon>
                <ListItemText primary="Recipes" />
              </ListItem>
              <ListItem button selected={location.pathname === '/meal-plans'} onClick={() => { navigate('/meal-plans'); setDrawerOpen(false); }}>
                <ListItemIcon><CalendarMonthIcon /></ListItemIcon>
                <ListItemText primary="Meal Plans" />
              </ListItem>
              <ListItem button selected={location.pathname === '/shopping-lists'} onClick={() => { navigate('/shopping-lists'); setDrawerOpen(false); }}>
                <ListItemIcon><ShoppingCartIcon /></ListItemIcon>
                <ListItemText primary="Shopping Lists" />
              </ListItem>
              <ListItem button selected={location.pathname === '/analytics'} onClick={() => { navigate('/analytics'); setDrawerOpen(false); }}>
                <ListItemIcon><BarChartIcon /></ListItemIcon>
                <ListItemText primary="Analytics" />
              </ListItem>
            </List>
          </Box>
        </Drawer>
        {/* Main Content */}
        <Box sx={{ flex: 1, py: 4, width: '100%' }}>
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
    </>
  );
}