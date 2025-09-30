import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import type { ReactElement } from "react";
import Home from "./components/Home";
import SignIn from "./components/SignIn";
import SignUp from "./components/SignUp";
import { ThemeProvider } from "./components/theme-provider";
import { Toaster } from "./components/ui/sonner";
import { AuthProvider } from "./components/AuthProvider";
import { PlayerProvider } from "./contexts/PlayerContext";
import PlayerBar from "./components/PlayerBar";
import HomePage from "./components/HomePage";
import PodcastDetails from "./components/PodcastDetails";
import EpisodeDetails from "./components/EpisodeDetails";
import ExplorePage from "./components/ExplorePage";
import LibraryPage from "./components/LibraryPage";
import { useAuth } from "./hooks/useAuth";
import { Helmet, HelmetProvider } from "react-helmet-async";
import { SavedProvider } from "./contexts/SavedContext";
import { FollowedProvider } from "./contexts/FollowedContext";

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <AuthProvider>
        <SavedProvider>
          <FollowedProvider>
            <PlayerProvider>
              <Toaster position="top-center" duration={3000} richColors />
              <HelmetProvider>
                <Helmet>
                  <title>PodBrief</title>
                  <meta
                    name="description"
                    content="Discover and brief podcasts."
                  />
                </Helmet>
                <Router>
                  <Routes>
                    <Route
                      path="/"
                      element={
                        <RedirectIfAuth>
                          <>
                            <Meta
                              title="PodBrief – Discover Podcasts"
                              description="Search, explore, and play the latest podcasts and episodes."
                            />
                            <Home />
                          </>
                        </RedirectIfAuth>
                      }
                    />
                    <Route
                      path="/signin"
                      element={
                        <RedirectIfAuth>
                          <>
                            <Meta
                              title="Sign in • PodBrief"
                              description="Access your personalized podcast library and playback."
                            />
                            <SignIn />
                          </>
                        </RedirectIfAuth>
                      }
                    />
                    <Route
                      path="/signup"
                      element={
                        <RedirectIfAuth>
                          <>
                            <Meta
                              title="Create account • PodBrief"
                              description="Create your PodBrief account to save episodes and follow podcasts."
                            />
                            <SignUp />
                          </>
                        </RedirectIfAuth>
                      }
                    />
                    <Route
                      path="/home"
                      element={
                        <RequireAuth>
                          <>
                            <Meta
                              title="Home • PodBrief"
                              description="Your personalized podcast feed with latest episodes."
                            />
                            <HomePage />
                          </>
                        </RequireAuth>
                      }
                    />
                    <Route
                      path="/podcast/:id"
                      element={
                        <RequireAuth>
                          <>
                            <Meta
                              title="Podcast • PodBrief"
                              description="Podcast details, episodes, and info."
                            />
                            <PodcastDetails />
                          </>
                        </RequireAuth>
                      }
                    />
                    <Route
                      path="/episode/:id"
                      element={
                        <RequireAuth>
                          <>
                            <Meta
                              title="Episode • PodBrief"
                              description="Episode details and playback."
                            />
                            <EpisodeDetails />
                          </>
                        </RequireAuth>
                      }
                    />
                    <Route
                      path="/explore"
                      element={
                        <RequireAuth>
                          <>
                            <Meta
                              title="Explore • PodBrief"
                              description="Browse categories, trending podcasts, and episodes."
                            />
                            <ExplorePage />
                          </>
                        </RequireAuth>
                      }
                    />
                    <Route
                      path="/library"
                      element={
                        <RequireAuth>
                          <>
                            <Meta
                              title="Your Library • PodBrief"
                              description="Saved episodes and followed podcasts."
                            />
                            <LibraryPage />
                          </>
                        </RequireAuth>
                      }
                    />
                  </Routes>
                  <PlayerBar />
                </Router>
              </HelmetProvider>
            </PlayerProvider>
          </FollowedProvider>
        </SavedProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;

function RequireAuth({ children }: { children: ReactElement }) {
  const { token } = useAuth();
  const location = useLocation();
  if (!token) {
    return <Navigate to="/" replace state={{ from: location }} />;
  }
  return children;
}

function RedirectIfAuth({ children }: { children: ReactElement }) {
  const { token } = useAuth();
  if (token) {
    return <Navigate to="/home" replace />;
  }
  return children;
}

function Meta({ title, description }: { title: string; description: string }) {
  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
    </Helmet>
  );
}
