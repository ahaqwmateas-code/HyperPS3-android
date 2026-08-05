import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import GameCompatibility from "./pages/GameCompatibility";
import PerformanceProfiles from "./pages/PerformanceProfiles";
import BugReport from "./pages/BugReport";
import SmartFixBot from "./pages/SmartFixBot";
import AdminDashboard from "./pages/AdminDashboard";
import SettingsGuide from "./pages/SettingsGuide";
import VersionTracker from "./pages/VersionTracker";
import UserDashboard from "./pages/UserDashboard";
import CrashMonitor from "./pages/CrashMonitor";
import SpecialFeatures from "./pages/SpecialFeatures";

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/compatibility" component={GameCompatibility} />
      <Route path="/profiles" component={PerformanceProfiles} />
      <Route path="/bug-report" component={BugReport} />
      <Route path="/smart-fix" component={SmartFixBot} />
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/settings-guide" component={SettingsGuide} />
      <Route path="/versions" component={VersionTracker} />
      <Route path="/dashboard" component={UserDashboard} />
      <Route path="/crash-monitor" component={CrashMonitor} />
      <Route path="/special-features" component={SpecialFeatures} />
      <Route path="/404" component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="dark"
        // switchable
      >
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
