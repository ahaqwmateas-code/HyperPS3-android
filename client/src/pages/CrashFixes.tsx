import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { AlertCircle, Zap, Wrench, CheckCircle, Loader2, Shield } from "lucide-react";
import { useLocation } from "wouter";
import { useState } from "react";
import { toast } from "sonner";

export default function CrashFixes() {
  const [, navigate] = useLocation();
  const [selectedGame, setSelectedGame] = useState("ULUS10565");
  const [deviceType, setDeviceType] = useState<"budget" | "midrange" | "flagship">("midrange");
  const [appliedMods, setAppliedMods] = useState<string[]>([]);

  const { data: crashFixes, isLoading: fixesLoading } = trpc.crashFixes.getCrashFixForGame.useQuery({
    gameSerial: selectedGame,
  });

  const { data: mods, isLoading: modsLoading } = trpc.crashFixes.getSpecialMods.useQuery({
    gameSerial: selectedGame,
  });

  const { data: recommendedMods } = trpc.crashFixes.getRecommendedMods.useQuery({
    gameSerial: selectedGame,
    deviceType,
  });

  const { data: optimalSettings } = trpc.crashFixes.getOptimalSettings.useQuery({
    gameSerial: selectedGame,
    appliedMods,
  });

  const toggleMod = (modId: string) => {
    if (appliedMods.includes(modId)) {
      setAppliedMods(appliedMods.filter(m => m !== modId));
    } else {
      setAppliedMods([...appliedMods, modId]);
    }
    toast.success("Mod configuration updated!");
  };

  const games = [
    { serial: "ULUS10565", name: "God of War: Chains of Olympus" },
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
          <h1 className="text-2xl font-bold">Crash Fixes & Mods</h1>
          <div className="w-20"></div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Game Selection */}
        <Card className="bg-white/5 border-white/10 mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wrench className="w-5 h-5" />
              Select Game & Device
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Game</label>
                <select
                  value={selectedGame}
                  onChange={(e) => setSelectedGame(e.target.value)}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded text-white focus:outline-none focus:border-blue-500"
                >
                  {games.map((game) => (
                    <option key={game.serial} value={game.serial} className="bg-slate-900">
                      {game.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Device Type</label>
                <select
                  value={deviceType}
                  onChange={(e) => setDeviceType(e.target.value as any)}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="budget" className="bg-slate-900">Budget (2-3GB RAM)</option>
                  <option value="midrange" className="bg-slate-900">Mid-Range (4-6GB RAM)</option>
                  <option value="flagship" className="bg-slate-900">Flagship (8GB+ RAM)</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Crash Fixes */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-6 flex items-center gap-2">
            <AlertCircle className="w-7 h-7 text-red-400" />
            Crash Fixes
          </h2>

          {fixesLoading ? (
            <div className="text-center py-12">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-400" />
              <p>Loading crash fixes...</p>
            </div>
          ) : Array.isArray(crashFixes) ? (
            <div className="space-y-4">
              {(crashFixes as any[]).map((fix) => (
                <Card key={fix.id} className="bg-gradient-to-r from-red-500/20 to-orange-500/20 border-red-500/50">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-xl">{fix.fixName}</CardTitle>
                        <CardDescription>{fix.description}</CardDescription>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-400">Success Rate</p>
                        <p className="text-2xl font-bold text-green-400">{fix.successRate}%</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-black/40 rounded p-4 border border-white/10">
                      <p className="text-sm text-gray-400 mb-2">Recommended Settings:</p>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                        {Object.entries(fix.settings).map(([key, value]) => (
                          <div key={key} className="bg-white/5 rounded p-2">
                            <p className="text-gray-400">{key}</p>
                            <p className="text-blue-300 font-semibold">{String(value)}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="bg-white/5 border-white/10">
              <CardContent className="py-8 text-center">
                <p className="text-gray-300">No crash fixes available for this game</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Special Mods */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-6 flex items-center gap-2">
            <Zap className="w-7 h-7 text-yellow-400" />
            Special Mods
          </h2>

          {modsLoading ? (
            <div className="text-center py-12">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-400" />
              <p>Loading mods...</p>
            </div>
          ) : mods && mods.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-4">
              {mods.map((mod) => (
                <Card
                  key={mod.id}
                  className={`cursor-pointer transition-all ${
                    appliedMods.includes(mod.id)
                      ? "bg-green-500/20 border-green-500/50"
                      : "bg-white/5 border-white/10 hover:border-blue-500/50"
                  }`}
                  onClick={() => toggleMod(mod.id)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{mod.name}</CardTitle>
                        <CardDescription>{mod.description}</CardDescription>
                      </div>
                      {appliedMods.includes(mod.id) && (
                        <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0" />
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <span className="inline-block px-3 py-1 bg-blue-500/20 rounded text-xs text-blue-300 capitalize">
                      {mod.category}
                    </span>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="bg-white/5 border-white/10">
              <CardContent className="py-8 text-center">
                <p className="text-gray-300">No mods available for this game</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Recommended Mods */}
        {recommendedMods && recommendedMods.length > 0 && (
          <Card className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 border-blue-500/50 mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Recommended Mods for {deviceType === "budget" ? "Budget" : deviceType === "midrange" ? "Mid-Range" : "Flagship"} Device
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {recommendedMods.map((mod) => (
                  <div key={mod.id} className="flex items-center justify-between bg-white/10 rounded p-3">
                    <span className="font-medium">{mod.name}</span>
                    <Button
                      size="sm"
                      variant={appliedMods.includes(mod.id) ? "default" : "outline"}
                      onClick={() => toggleMod(mod.id)}
                    >
                      {appliedMods.includes(mod.id) ? "✓ Applied" : "Apply"}
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Optimal Settings Preview */}
        {optimalSettings && (
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle>Optimal Settings for This Configuration</CardTitle>
              <CardDescription>These settings will be applied to the emulator</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-black/40 rounded p-4 border border-white/10">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {Object.entries(optimalSettings).map(([key, value]) => (
                    <div key={key} className="bg-white/5 rounded p-3">
                      <p className="text-xs text-gray-400 capitalize">{key.replace(/([A-Z])/g, " $1")}</p>
                      <p className="text-sm font-semibold text-blue-300">{String(value)}</p>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
