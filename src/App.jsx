import { lazy, Suspense } from 'react';
import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { ThemeProvider } from 'next-themes';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import { TabHistoryProvider } from '@/context/TabHistoryContext';
import { BackdropProvider } from '@/context/BackdropContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ScrollToTop from './components/ScrollToTop';
// Add page imports here
import Layout from '@/components/Layout';
import PageLoader from '@/components/PageLoader';

// Pages are code-split so the WebView paints its shell before any screen's
// JS is downloaded; Suspense below shows the spinner while a chunk loads.
const Home = lazy(() => import('@/pages/Home'));
const CreateEvent = lazy(() => import('@/pages/CreateEvent'));
const Profile = lazy(() => import('@/pages/Profile'));
const ProfileAbout = lazy(() => import('@/pages/ProfileAbout'));
const EventDetail = lazy(() => import('@/pages/EventDetail'));
const Clicks = lazy(() => import('@/pages/Clicks'));
const ClickDetail = lazy(() => import('@/pages/ClickDetail'));
const CreateClick = lazy(() => import('@/pages/CreateClick'));
const Messages = lazy(() => import('@/pages/Messages'));
const SocialHub = lazy(() => import('@/pages/SocialHub'));
const CategoryBrowse = lazy(() => import('@/pages/CategoryBrowse'));
const Support = lazy(() => import('@/pages/Support'));
const Privacy = lazy(() => import('@/pages/Privacy'));
const ContactUs = lazy(() => import('@/pages/ContactUs'));
const Notifications = lazy(() => import('@/pages/Notifications'));
const NotificationsCategory = lazy(() => import('@/pages/NotificationsCategory'));
const Groups = lazy(() => import('@/pages/Groups'));
const Music = lazy(() => import('@/pages/Music'));
const BuySell = lazy(() => import('@/pages/BuySell'));
const CreateListing = lazy(() => import('@/pages/CreateListing'));
const ListingDetail = lazy(() => import('@/pages/ListingDetail'));
const GroupList = lazy(() => import('@/pages/GroupList'));
const CreateGroup = lazy(() => import('@/pages/CreateGroup'));
const Projects = lazy(() => import('@/pages/Projects'));
const Planner = lazy(() => import('@/pages/Planner'));
const Stream = lazy(() => import('@/pages/Stream'));
const StreamCategory = lazy(() => import('@/pages/StreamCategory'));
const Feed = lazy(() => import('@/pages/Feed'));
const Announcements = lazy(() => import('@/pages/Announcements'));
const Games = lazy(() => import('@/pages/Games'));
const Viewers = lazy(() => import('@/pages/Viewers'));
const Login = lazy(() => import('@/pages/Login'));
const Register = lazy(() => import('@/pages/Register'));
const ForgotPassword = lazy(() => import('@/pages/ForgotPassword'));
const ResetPassword = lazy(() => import('@/pages/ResetPassword'));

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
    <Suspense fallback={<PageLoader />}>
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/map" element={<Home />} />
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
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/contact" element={<ContactUs />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/notifications/:category" element={<NotificationsCategory />} />
        <Route path="/groups" element={<Groups />} />
        <Route path="/groups/:category" element={<GroupList />} />
        <Route path="/create-group" element={<CreateGroup />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/planner" element={<Planner />} />
        <Route path="/stream" element={<Stream />} />
        <Route path="/stream/category" element={<StreamCategory />} />
        <Route path="/feed" element={<Feed />} />
        <Route path="/announcements" element={<Announcements />} />
        <Route path="/games" element={<Games />} />
        <Route path="/viewers" element={<Viewers />} />
        <Route path="/music" element={<Music />} />
        <Route path="/buy-sell" element={<BuySell />} />
        <Route path="/sell" element={<CreateListing />} />
        <Route path="/listing/:id" element={<ListingDetail />} />
      </Route>
      <Route path="*" element={<PageNotFound />} />
    </Routes>
    </Suspense>
  );
};


function App() {

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <AuthProvider>
        <QueryClientProvider client={queryClientInstance}>
          <Router>
            <TabHistoryProvider>
              <BackdropProvider>
                <ScrollToTop />
                <AuthenticatedApp />
              </BackdropProvider>
            </TabHistoryProvider>
          </Router>
          <Toaster />
        </QueryClientProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App