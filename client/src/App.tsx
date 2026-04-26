import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Cars from "./pages/Cars";
import TuningApp from "./pages/TuningApp";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/cars"} component={Cars} />
      <Route path={"/tuning"} component={TuningApp} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

/**
 * GT7 Cars Database — Dark Industrial / Motorsport HUD Theme
 * Default theme: dark (near-black background with electric red accents)
 */
function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
