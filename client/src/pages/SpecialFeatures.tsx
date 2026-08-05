import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Zap, Gamepad2, Volume2, Cpu, Shield, Sparkles, Loader2, CheckCircle } from "lucide-react";
import { useLocation } from "wouter";
import { useState } from "react";

const FEATURE_ICONS: Record<string, React.ReactNode> = {
  performance: <Zap className="w-6 h-6" />,
  graphics: <Sparkles className="w-6 h-6" />,
  audio: <Volume2 className="w-6 h-6" />,
  advanced: <Cpu className="w-6 h-6" />,
  compatibility: <Shield className="w-6 h-6" />,
};

export default function SpecialFeatures() {
  const [, navigate] = useLocation();
  const [selectedGame, setSelectedGame] = useState("BCES00510");
  const [deviceType, setDeviceType] = useState<"budget" | "midrange" | "flagship">("midrange");
  const [deviceRam, setDeviceRam] = useState(4096);
  const [appliedFeatures, setAppliedFeatures] = useState<string[]>([]);

  const { data: features, isLoading: featuresLoading } = trpc.smartEngine.getSpecialFeatures.useQuery({});
  
  const { data: recommendation, isLoading: recommendationLoading } = trpc.smartEngine.analyzeGame.useQuery({
    gameSerial: selectedGame,
    deviceType,
    deviceRam,
  });

  const applyFeatureMutation = trpc.smartEngine.applyFeature.useMutation({
    onSuccess: (data, variables) => {
      setAppliedFeatures([...appliedFeatures, variables.featureId]);
    },
  });

  const gameSerials = [
    { serial: "BCES00510", name: "Demon's Souls" },
    { serial: "BLUS30182", name: "God of War III" },
    { serial: "BLUS30284", name: "Persona 5" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 text-white">
      {/* Navigation */}
      <nav className="border-b border-white/10 bg-black/40 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Button variant="ghost" onClick={() => navigate("/")} className="text-white hover:bg-white/10">
            ← Back to Home
          </Button>
          <h1 className="text-2xl font-bold">Special Features & Mods</h1>
          <div className="w-20"></div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Device Configuration */}
        <Card className="bg-white/5 border-white/10 mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cpu className="w-5 h-5" />
              Device Configuration
            </CardTitle>
            <CardDescription>Configure your device specs for optimal recommendations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Game Selection */}
              <div>
                <label className="block text-sm font-medium mb-2">Game</label>
                <select
                  value={selectedGame}
                  onChange={(e) => setSelectedGame(e.target.value)}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded text-white focus:outline-none focus:border-blue-500"
                >
                  {gameSerials.map((game) => (
                    <option key={game.serial} value={game.serial} className="bg-slate-900">
                      {game.name} ({game.serial})
                    </option>
                  ))}
                </select>
              </div>

              {/* Device Type */}
              <div>
                <label className="block text-sm font-medium mb-2">Device Type</label>
                <select
                  value={deviceType}
                  onChange={(e) => setDeviceType(e.target.value as any)}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="budget" className="bg-slate-900">Budget (2GB-3GB RAM)</option>
                  <option value="midrange" className="bg-slate-900">Mid-Range (4GB-6GB RAM)</option>
                  <option value="flagship" className="bg-slate-900">Flagship (8GB+ RAM)</option>
                </select>
              </div>

              {/* RAM */}
              <div>
                <label className="block text-sm font-medium mb-2">Device RAM (MB)</label>
                <input
                  type="number"
                  value={deviceRam}
                  onChange={(e) => setDeviceRam(parseInt(e.target.value))}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Smart Recommendation */}
        {recommendationLoading ? (
          <Card className="bg-white/5 border-white/10 mb-8">
            <CardContent className="py-12 text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-400" />
              <p>Analyzing game performance...</p>
            </CardContent>
          </Card>
        ) : recommendation ? (
          <Card className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 border-blue-500/50 mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                Smartest Engine Recommendation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white/10 rounded p-4">
                  <p className="text-gray-400 text-sm">Optimization Level</p>
                  <p className="text-xl font-bold text-blue-400 capitalize">
                    {recommendation.optimizationProfile.optimizationLevel}
                  </p>
                </div>
                <div className="bg-white/10 rounded p-4">
                  <p className="text-gray-400 text-sm">Success Rate</p>
                  <p className="text-xl font-bold text-green-400">
                    {recommendation.optimizationProfile.successRate}%
                  </p>
                </div>
                <div className="bg-white/10 rounded p-4">
                  <p className="text-gray-400 text-sm">Recommended Features</p>
                  <p className="text-xl font-bold text-purple-400">
                    {recommendation.recommendedFeatures.length}
                  </p>
                </div>
              </div>

              {recommendation.recommendedFeatures.length > 0 && (
                <div className="bg-white/5 rounded p-4 border border-white/10">
                  <p className="font-semibold mb-3">Top Recommended Features:</p>
                  <ul className="space-y-2">
                    {recommendation.recommendedFeatures.slice(0, 3).map((feature) => (
                      <li key={feature.id} className="flex items-center gap-2 text-sm text-gray-300">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        {feature.name}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        ) : null}

        {/* Special Features Grid */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-6">Available Special Features</h2>

          {featuresLoading ? (
            <div className="text-center py-12">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-400" />
              <p>Loading features...</p>
            </div>
          ) : features && features.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature) => (
                <Card
                  key={feature.id}
                  className={`bg-white/5 border-white/10 hover:border-blue-500/50 transition-colors ${
                    appliedFeatures.includes(feature.id) ? "border-green-500/50 bg-green-500/10" : ""
                  }`}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center text-blue-400">
                        {FEATURE_ICONS[feature.category] || <Zap className="w-6 h-6" />}
                      </div>
                      {appliedFeatures.includes(feature.id) && (
                        <CheckCircle className="w-5 h-5 text-green-400" />
                      )}
                    </div>
                    <CardTitle className="text-lg">{feature.name}</CardTitle>
                    <CardDescription className="text-xs">
                      <span className="inline-block px-2 py-1 bg-blue-500/20 rounded mr-2">
                        {feature.category}
                      </span>
                      {feature.gameSerials.length} games
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-gray-300">{feature.description}</p>
                    <p className="text-xs text-gray-400">
                      <strong>Best for:</strong> {feature.recommendedFor}
                    </p>
                    <Button
                      size="sm"
                      className={`w-full ${
                        appliedFeatures.includes(feature.id)
                          ? "bg-green-500/20 text-green-400 hover:bg-green-500/30"
                          : "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                      }`}
                      onClick={() =>
                        applyFeatureMutation.mutate({
                          gameSerial: selectedGame,
                          featureId: feature.id,
                        })
                      }
                      disabled={applyFeatureMutation.isPending || appliedFeatures.includes(feature.id)}
                    >
                      {appliedFeatures.includes(feature.id) ? "✓ Applied" : "Apply Feature"}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="bg-white/5 border-white/10">
              <CardContent className="py-12 text-center">
                <p className="text-gray-300">No special features available</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Feature Categories Info */}
        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle>Feature Categories</CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Zap className="w-4 h-4" /> Performance
              </h3>
              <p className="text-sm text-gray-400">Optimize for speed and FPS</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Sparkles className="w-4 h-4" /> Graphics
              </h3>
              <p className="text-sm text-gray-400">Enhanced visual quality</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Volume2 className="w-4 h-4" /> Audio
              </h3>
              <p className="text-sm text-gray-400">Improved sound quality</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Shield className="w-4 h-4" /> Compatibility
              </h3>
              <p className="text-sm text-gray-400">Stability and compatibility</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
