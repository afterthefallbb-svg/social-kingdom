import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ScrollToTop from './components/ScrollToTop';
// Add page imports here
import Layout from '@/components/Layout';
import Home from '@/pages/Home';
import CreateEvent from '@/pages/CreateEvent';
import Profile from '@/pages/Profile';
import ProfileAbout from '@/pages/ProfileAbout';
import EventDetail from '@/pages/EventDetail';
import Clicks from '@/pages/Clicks';
import ClickDetail from '@/pages/ClickDetail';
import CreateClick from '@/pages/CreateClick';
import Messages from '@/pages/Messages';
import SocialHub from '@/pages/SocialHub';
import CategoryBrowse from '@/pages/CategoryBrowse';
import Support from '@/pages/Support';
import ContactUs from '@/pages/ContactUs';
import Notifications from '@/pages/Notifications';
import NotificationsCategory from '@/pages/NotificationsCategory';
import Groups from '@/pages/Groups';
import Music from '@/pages/Music';
import BuySell from '@/pages/BuySell';
import CreateListing from '@/pages/CreateListing';
import ListingDetail from '@/pages/ListingDetail';
import GroupList from '@/pages/GroupList';
import CreateGroup from '@/pages/CreateGroup';
import Projects from '@/pages/Projects';
import Planner from '@/pages/Planner';
import Stream from '@/pages/Stream';
import Feed from '@/pages/Feed';
import Announcements from '@/pages/Announcements';
import Games from '@/pages/Games';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle authentication errors
  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      // Redirect to login automatically
      navigateToLogin();
      return null;
    }
  }

  // Render the main app
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/create" element={<CreateEvent />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/profile/about" element={<ProfileAbout />} />
        <Route path="/profile/:id" element={<Profile />} />
        <Route path="/profile/:id/about" element={<ProfileAbout />} />
        <Route path="/event/:id" element={<EventDetail />} />
        <Route path="/clicks" element={<Clicks />} />
        <Route path="/clicks/create" element={<CreateClick />} />
        <Route path="/clicks/:id" element={<ClickDetail />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/browse" element={<SocialHub />} />
        <Route path="/browse/:category" element={<CategoryBrowse />} />
        <Route path="/support" element={<Support />} />
        <Route path="/contact" element={<ContactUs />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/notifications/:category" element={<NotificationsCategory />} />
        <Route path="/groups" element={<Groups />} />
        <Route path="/groups/:category" element={<GroupList />} />
        <Route path="/create-group" element={<CreateGroup />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/planner" element={<Planner />} />
        <Route path="/stream" element={<Stream />} />
        <Route path="/feed" element={<Feed />} />
        <Route path="/announcements" element={<Announcements />} />
        <Route path="/games" element={<Games />} />
        <Route path="/music" element={<Music />} />
        <Route path="/buy-sell" element={<BuySell />} />
        <Route path="/sell" element={<CreateListing />} />
        <Route path="/listing/:id" element={<ListingDetail />} />
      </Route>
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};


function App() {

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <ScrollToTop />
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App