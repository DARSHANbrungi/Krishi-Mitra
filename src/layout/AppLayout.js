// src/layout/AppLayout.js
import React, { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../App';
import { Box, Drawer, AppBar, Toolbar, List, Typography, Divider, IconButton, ListItem, ListItemButton, ListItemIcon, ListItemText, Avatar, Menu, MenuItem, Fab, Tooltip, useTheme } from '@mui/material';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';

// Icons
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import GrassIcon from '@mui/icons-material/Grass';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

const fullDrawerWidth = 240;
const collapsedDrawerWidth = 80;

const AppLayout = () => {
  const { user } = useAuth();
  const theme = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const accountMenuOpen = Boolean(anchorEl);

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);
  const handleAccountMenu = (event) => setAnchorEl(event.currentTarget);
  const handleAccountMenuClose = () => setAnchorEl(null);
  const handleLogout = () => { signOut(auth); handleAccountMenuClose(); };
  const handleCollapseToggle = () => setIsCollapsed(!isCollapsed);

  const navItems = [
    { text: 'My Fields', path: '/app/my-fields', icon: <DashboardIcon /> },
    { text: 'Weather Forecast', path: '/app/weather', icon: <WbSunnyIcon /> },
    { text: 'Crop Recommender', path: '/app/recommend', icon: <GrassIcon /> },
  ];

  const drawerContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Toolbar>
        <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 'bold' }}>
          🌿{' '}
          {!isCollapsed && (
            <>
              <span style={{ color: theme.palette.primary.dark }}>Krishi</span>
              <span style={{ color: theme.palette.secondary.main }}>Mitra</span>
            </>
          )}
        </Typography>
      </Toolbar>
      <Divider />
      <List sx={{ flexGrow: 1 }}>
        {navItems.map((item) => (
          <ListItem key={item.text} disablePadding sx={{ display: 'block' }}>
            <Tooltip title={isCollapsed ? item.text : ''} placement="right">
              <ListItemButton
                component={NavLink} to={item.path} onClick={() => mobileOpen && handleDrawerToggle()}
                sx={{ minHeight: 48, justifyContent: isCollapsed ? 'center' : 'initial', px: 2.5, '&.active': { backgroundColor: 'primary.main', color: 'white', '& .MuiListItemIcon-root': { color: 'white' } } }}
              >
                <ListItemIcon sx={{ minWidth: 0, mr: isCollapsed ? 'auto' : 3, justifyContent: 'center' }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.text} sx={{ opacity: isCollapsed ? 0 : 1 }} />
              </ListItemButton>
            </Tooltip>
          </ListItem>
        ))}
      </List>
      <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
        <Divider />
        <ListItemButton onClick={handleCollapseToggle} sx={{ justifyContent: 'center', py: 2 }}>
          <ListItemIcon sx={{ minWidth: 0, justifyContent: 'center' }}>
            {isCollapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
          </ListItemIcon>
        </ListItemButton>
      </Box>
    </Box>
  );
  
  const currentDrawerWidth = isCollapsed ? collapsedDrawerWidth : fullDrawerWidth;

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${currentDrawerWidth}px)` },
          ml: { sm: `${currentDrawerWidth}px` },
          transition: theme.transitions.create(['width', 'margin'], { easing: theme.transitions.easing.sharp, duration: theme.transitions.duration.enteringScreen }),
        }}
      >
        <Toolbar>
          <IconButton color="inherit" aria-label="open drawer" edge="start" onClick={handleDrawerToggle} sx={{ mr: 2, display: { sm: 'none' } }}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>Farmer's Dashboard</Typography>
          <Tooltip title="Account settings"><IconButton onClick={handleAccountMenu} sx={{ p: 0 }}><Avatar alt={user?.displayName || 'User'} src={user?.photoURL} /></IconButton></Tooltip>
          <Menu anchorEl={anchorEl} open={accountMenuOpen} onClose={handleAccountMenuClose}>
            <MenuItem onClick={handleAccountMenuClose}>Profile</MenuItem>
            <MenuItem onClick={handleLogout}>Logout</MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { sm: currentDrawerWidth }, flexShrink: { sm: 0 }, transition: theme.transitions.create('width', { easing: theme.transitions.easing.sharp, duration: theme.transitions.duration.enteringScreen }) }}
      >
        <Drawer variant="temporary" open={mobileOpen} onClose={handleDrawerToggle} ModalProps={{ keepMounted: true }} sx={{ display: { xs: 'block', sm: 'none' }, '& .MuiDrawer-paper': { boxSizing: 'border-box', width: fullDrawerWidth }}}>{drawerContent}</Drawer>
        <Drawer variant="permanent" sx={{ display: { xs: 'none', sm: 'block' }, '& .MuiDrawer-paper': { boxSizing: 'border-box', width: currentDrawerWidth, overflowX: 'hidden' }}} open>{drawerContent}</Drawer>
      </Box>
      
      {/* UPDATED: Main content area with the new gradient and pattern background */}
      <Box
          component="main"
          sx={{
              flexGrow: 1,
              p: 3,
              width: { sm: `calc(100% - ${currentDrawerWidth}px)` },
              minHeight: '100vh',
              transition: theme.transitions.create('width', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
              }),
              // --- NEW BACKGROUND STYLES ---
              backgroundColor: '#E8F5E9', // The fallback and bottom color of the gradient
              backgroundImage: `
                url('data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%239C92AC" fill-opacity="0.07"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E'),
                linear-gradient(to bottom, #FBF8F0, #E8F5E9)
              `,
          }}
      >
          <Toolbar /> {/* Spacer for AppBar */}
          <Outlet />
      </Box>

      <Tooltip title="Ask our AI Assistant"><Fab color="secondary" aria-label="chatbot" sx={{ position: 'fixed', bottom: 24, right: 24 }}><SmartToyIcon /></Fab></Tooltip>
    </Box>
  );
};

export default AppLayout;