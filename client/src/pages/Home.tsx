import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Zap, Gamepad2, Settings, BarChart3, MessageSquare, Download } from "lucide-react";
import { useLocation } from "wouter";

export default function Home() {
  const { user, isAuthenticated, loading } = useAuth();
  const [, navigate] = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 flex items-center justify-center">
        <div className="animate-pulse text-white text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 text-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-black/40 backdrop-blur-md border-b border-blue-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-600 rounded-lg flex items-center justify-center font-bold text-lg">
              H
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              HyperPS3
            </span>
          </div>
          <div className="flex gap-3">
            {isAuthenticated ? (
              <>
                <Button variant="ghost" onClick={() => navigate("/dashboard")}>
                  Dashboard
                </Button>
                <Button variant="outline" onClick={() => navigate("/profile")}>
                  Profile
                </Button>
              </>
            ) : (
              <Button 
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                onClick={() => startLogin()}
              >
                Sign In
              </Button>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto text-center">
          <div className="mb-8 inline-block">
            <div className="px-4 py-2 bg-blue-500/20 border border-blue-500/50 rounded-full text-blue-300 text-sm font-medium">
              ✨ The Ultimate PS3 Emulator Hub
            </div>
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
            Experience PS3 Gaming
            <br />
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Reimagined
            </span>
          </h1>

          <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto leading-relaxed">
            HyperPS3 is your complete companion for PS3 emulation. Get intelligent fixes, discover game-specific optimizations, and join a thriving community of emulator enthusiasts.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Button
              size="lg"
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-lg px-8"
              onClick={() => navigate("/compatibility")}
            >
              Explore Games <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-blue-500/50 text-white hover:bg-blue-500/10 text-lg px-8"
              onClick={() => navigate("/smart-fix")}
            >
              <Zap className="w-5 h-5 mr-2" /> Smart Fix Bot
            </Button>
          </div>

          {/* Hero Stats */}
          <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto mb-20">
            <div className="bg-white/5 border border-white/10 rounded-lg p-4">
              <div className="text-2xl font-bold text-blue-400">1000+</div>
              <div className="text-sm text-gray-400">Games Optimized</div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-lg p-4">
              <div className="text-2xl font-bold text-purple-400">50K+</div>
              <div className="text-sm text-gray-400">Active Users</div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-lg p-4">
              <div className="text-2xl font-bold text-pink-400">99%</div>
              <div className="text-sm text-gray-400">Success Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white/5 border-y border-white/10">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16">
            Everything You Need
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Smart Fix Bot */}
            <Card className="bg-white/5 border-white/10 hover:border-blue-500/50 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-4">
                  <MessageSquare className="w-6 h-6 text-blue-400" />
                </div>
                <CardTitle>Smart Fix Bot</CardTitle>
                <CardDescription>AI-powered diagnostics</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300">
                  Describe your issue and get instant, tailored config recommendations powered by intelligent analysis.
                </p>
              </CardContent>
            </Card>

            {/* Game Compatibility */}
            <Card className="bg-white/5 border-white/10 hover:border-purple-500/50 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mb-4">
                  <Gamepad2 className="w-6 h-6 text-purple-400" />
                </div>
                <CardTitle>Game Database</CardTitle>
                <CardDescription>1000+ games optimized</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300">
                  Search by title or serial number to find perfectly tuned settings for your favorite games.
                </p>
              </CardContent>
            </Card>

            {/* Performance Profiles */}
            <Card className="bg-white/5 border-white/10 hover:border-pink-500/50 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 bg-pink-500/20 rounded-lg flex items-center justify-center mb-4">
                  <Zap className="w-6 h-6 text-pink-400" />
                </div>
                <CardTitle>Performance Profiles</CardTitle>
                <CardDescription>Turbo, Balanced, Compatibility</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300">
                  Download pre-built config profiles optimized for different device types and gaming styles.
                </p>
              </CardContent>
            </Card>

            {/* Settings Guide */}
            <Card className="bg-white/5 border-white/10 hover:border-blue-500/50 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-4">
                  <Settings className="w-6 h-6 text-blue-400" />
                </div>
                <CardTitle>Settings Guide</CardTitle>
                <CardDescription>Master every option</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300">
                  Comprehensive documentation of Core, Video, and Audio settings with plain-English explanations.
                </p>
              </CardContent>
            </Card>

            {/* Version Tracker */}
            <Card className="bg-white/5 border-white/10 hover:border-purple-500/50 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mb-4">
                  <Download className="w-6 h-6 text-purple-400" />
                </div>
                <CardTitle>Update Tracker</CardTitle>
                <CardDescription>Latest releases & changelog</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300">
                  Stay informed about new HyperPS3 versions and critical fixes with one-click downloads.
                </p>
              </CardContent>
            </Card>

            {/* Community */}
            <Card className="bg-white/5 border-white/10 hover:border-pink-500/50 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 bg-pink-500/20 rounded-lg flex items-center justify-center mb-4">
                  <BarChart3 className="w-6 h-6 text-pink-400" />
                </div>
                <CardTitle>Community Reports</CardTitle>
                <CardDescription>Share & solve together</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300">
                  Submit bug reports, view community issues, and help admins improve emulator compatibility.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Level Up?</h2>
          <p className="text-xl text-gray-300 mb-8">
            Join thousands of PS3 emulator enthusiasts and unlock the full potential of your gaming experience.
          </p>
          <Button
            size="lg"
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-lg px-12"
            onClick={() => navigate("/dashboard")}
          >
            Get Started Now <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-black/40 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="font-bold text-lg mb-4">HyperPS3</div>
              <p className="text-gray-400 text-sm">The ultimate PS3 emulator companion.</p>
            </div>
            <div>
              <div className="font-semibold mb-4">Product</div>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition">Features</a></li>
                <li><a href="#" className="hover:text-white transition">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition">Docs</a></li>
              </ul>
            </div>
            <div>
              <div className="font-semibold mb-4">Community</div>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition">Discord</a></li>
                <li><a href="#" className="hover:text-white transition">GitHub</a></li>
                <li><a href="#" className="hover:text-white transition">Forum</a></li>
              </ul>
            </div>
            <div>
              <div className="font-semibold mb-4">Legal</div>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition">Privacy</a></li>
                <li><a href="#" className="hover:text-white transition">Terms</a></li>
                <li><a href="#" className="hover:text-white transition">Contact</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10 pt-8 text-center text-gray-400 text-sm">
            <p>&copy; 2026 HyperPS3. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
