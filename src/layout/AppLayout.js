// src/layout/AppLayout.js
import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useApp } from '../App';
import { Box, Drawer, AppBar, Toolbar, List, Typography, Divider, IconButton, ListItem, ListItemButton, ListItemIcon, ListItemText, Avatar, Menu, MenuItem, Fab, Tooltip, useTheme, Snackbar, Alert } from '@mui/material';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import ChatbotDrawer from '../components/ChatbotDrawer';
import { useTranslation } from 'react-i18next';

// Icons
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import GrassIcon from '@mui/icons-material/Grass';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import LanguageIcon from '@mui/icons-material/Language';

const fullDrawerWidth = 240;
const collapsedDrawerWidth = 80;

const AppLayout = () => {
  const { t, i18n } = useTranslation();
  const { user, colorMode } = useApp();
  const theme = useTheme();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [showChatNudge, setShowChatNudge] = useState(false);
  const [langMenuAnchor, setLangMenuAnchor] = useState(null);
  const accountMenuOpen = Boolean(anchorEl);

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);
  const handleAccountMenu = (event) => setAnchorEl(event.currentTarget);
  const handleAccountMenuClose = () => setAnchorEl(null);
  const handleLogout = () => { signOut(auth); handleAccountMenuClose(); };
  const handleCollapseToggle = () => setIsCollapsed(!isCollapsed);
  const handleProfileClick = () => { navigate('/app/profile'); handleAccountMenuClose(); };
  
  const handleLangMenuOpen = (event) => setLangMenuAnchor(event.currentTarget);
  const handleLangMenuClose = () => setLangMenuAnchor(null);
  const changeLanguage = (langCode) => {
    i18n.changeLanguage(langCode);
    handleLangMenuClose();
  };

  useEffect(() => {
    const hasSeenNudge = sessionStorage.getItem('krishimitra_chat_nudge_seen');
    if (!hasSeenNudge) {
      const timer = setTimeout(() => {
        setShowChatNudge(true);
        sessionStorage.setItem('krishimitra_chat_nudge_seen', 'true');
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const navItems = [
    { text: t('myFields'), path: '/app/my-fields', icon: <DashboardIcon /> },
    { text: t('weatherForecast'), path: '/app/weather', icon: <WbSunnyIcon /> },
    { text: t('cropRecommender'), path: '/app/recommend', icon: <GrassIcon /> },
  ];

  const drawerContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Toolbar>
        <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 'bold' }}>
          🌿{' '}
          {!isCollapsed && (
            <>
              <span style={{ color: theme.palette.mode === 'light' ? theme.palette.primary.dark : theme.palette.primary.light }}>Krishi</span>
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
              <ListItemButton component={NavLink} to={item.path} onClick={() => mobileOpen && handleDrawerToggle()} sx={{ minHeight: 48, justifyContent: isCollapsed ? 'center' : 'initial', px: 2.5, '&.active': { backgroundColor: 'primary.main', color: 'primary.contrastText', '& .MuiListItemIcon-root': { color: 'primary.contrastText' } } }}>
                <ListItemIcon sx={{ minWidth: 0, mr: isCollapsed ? 'auto' : 3, justifyContent: 'center' }}>{item.icon}</ListItemIcon>
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
      <AppBar position="fixed" sx={{ width: { sm: `calc(100% - ${currentDrawerWidth}px)` }, ml: { sm: `${currentDrawerWidth}px` }, transition: theme.transitions.create(['width', 'margin'], { easing: theme.transitions.easing.sharp, duration: theme.transitions.duration.enteringScreen }) }}>
        <Toolbar>
          <IconButton color="inherit" aria-label="open drawer" edge="start" onClick={handleDrawerToggle} sx={{ mr: 2, display: { sm: 'none' } }}><MenuIcon /></IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>{t('farmersDashboard')}</Typography>
          
          <Tooltip title={t('changeLanguage')}>
            <IconButton onClick={handleLangMenuOpen} color="inherit"><LanguageIcon /></IconButton>
          </Tooltip>
          <Menu anchorEl={langMenuAnchor} open={Boolean(langMenuAnchor)} onClose={handleLangMenuClose}>
            <MenuItem onClick={() => changeLanguage('en')}>English</MenuItem>
            <MenuItem onClick={() => changeLanguage('hi')}>हिन्दी</MenuItem>
            <MenuItem onClick={() => changeLanguage('kn')}>ಕನ್ನಡ</MenuItem>
          </Menu>

          <IconButton sx={{ ml: 1 }} onClick={colorMode.toggleColorMode} color="inherit">{theme.palette.mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}</IconButton>
          
          <Tooltip title="Account settings">
            <IconButton onClick={handleAccountMenu} sx={{ p: 0 }}><Avatar alt={user?.displayName || 'User'} src={user?.photoURL} /></IconButton>
          </Tooltip>
          <Menu anchorEl={anchorEl} open={accountMenuOpen} onClose={handleAccountMenuClose}>
            <MenuItem onClick={handleProfileClick}>{t('profile')}</MenuItem>
            <MenuItem onClick={handleLogout}>{t('logout')}</MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>
      <Box component="nav" sx={{ width: { sm: currentDrawerWidth }, flexShrink: { sm: 0 }, transition: theme.transitions.create('width', { easing: theme.transitions.easing.sharp, duration: theme.transitions.duration.enteringScreen }) }}>
        <Drawer variant="temporary" open={mobileOpen} onClose={handleDrawerToggle} ModalProps={{ keepMounted: true }} sx={{ display: { xs: 'block', sm: 'none' }, '& .MuiDrawer-paper': { boxSizing: 'border-box', width: fullDrawerWidth }}}>{drawerContent}</Drawer>
        <Drawer variant="permanent" sx={{ display: { xs: 'none', sm: 'block' }, '& .MuiDrawer-paper': { boxSizing: 'border-box', width: currentDrawerWidth, overflowX: 'hidden' }}} open>{drawerContent}</Drawer>
      </Box>
      <Box component="main" sx={{ flexGrow: 1, p: 3, width: { sm: `calc(100% - ${currentDrawerWidth}px)` }, minHeight: '100vh', transition: theme.transitions.create('width', { easing: theme.transitions.easing.sharp, duration: theme.transitions.duration.enteringScreen }), backgroundColor: theme.palette.background.farm, backgroundImage: theme.palette.mode === 'light' ? `url('data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%239C92AC" fill-opacity="0.07"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E'), linear-gradient(to bottom, #FBF8F0, #E8F5E9)` : 'none' }}>
          <Toolbar />
          <Outlet />
      </Box>
      <Tooltip title="Ask our AI Assistant">
        <Fab color="secondary" aria-label="chatbot" sx={{ position: 'fixed', bottom: 24, right: 24 }} onClick={() => setChatOpen(true)}>
          <AutoAwesomeIcon />
        </Fab>
      </Tooltip>
      <Snackbar open={showChatNudge} autoHideDuration={3000} onClose={() => setShowChatNudge(false)} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} sx={{ bottom: { xs: 24, sm: 90 }, right: { xs: 24, sm: 24 } }}>
        <Alert onClose={() => setShowChatNudge(false)} severity="info" sx={{ width: '100%', boxShadow: 6 }}>Chat with KrishiMitra AI!</Alert>
      </Snackbar>
      <ChatbotDrawer open={chatOpen} onClose={() => setChatOpen(false)} user={user} />
    </Box>
  );
};

export default AppLayout;