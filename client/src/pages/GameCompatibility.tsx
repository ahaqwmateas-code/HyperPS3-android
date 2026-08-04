import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { Gamepad2, Search, Loader2, AlertCircle, CheckCircle } from "lucide-react";
import { useLocation } from "wouter";

export default function GameCompatibility() {
  const [, navigate] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [hasSearched, setHasSearched] = useState(false);

  const { data: results, isLoading } = trpc.gameCompatibility.search.useQuery(
    { query: searchQuery },
    { enabled: hasSearched && searchQuery.length > 0 }
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setHasSearched(true);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 text-white">
      {/* Navigation */}
      <nav className="border-b border-white/10 bg-black/40 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Button variant="ghost" onClick={() => navigate("/")} className="text-white hover:bg-white/10">
            ← Back to Home
          </Button>
          <h1 className="text-2xl font-bold">Game Compatibility</h1>
          <div className="w-20"></div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Search Section */}
        <div className="mb-12">
          <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded-lg p-8">
            <h2 className="text-3xl font-bold mb-4">Find Your Game</h2>
            <p className="text-gray-300 mb-6">
              Search by game title or serial number (e.g., BLUS12345) to discover optimized settings.
            </p>

            <form onSubmit={handleSearch} className="flex gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <Input
                  placeholder="Enter game title or serial..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-white/5 border-white/20 text-white placeholder:text-gray-500"
                />
              </div>
              <Button
                type="submit"
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
              >
                Search
              </Button>
            </form>
          </div>
        </div>

        {/* Results Section */}
        {!hasSearched ? (
          <div className="text-center py-12">
            <Gamepad2 className="w-16 h-16 text-gray-500 mx-auto mb-4 opacity-50" />
            <p className="text-gray-400 text-lg">Enter a game title or serial to get started</p>
          </div>
        ) : isLoading ? (
          <div className="text-center py-12">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-400" />
            <p className="text-gray-300">Searching database...</p>
          </div>
        ) : results && results.length > 0 ? (
          <div className="grid gap-6">
            {results.map((game) => (
              <Card key={game.id} className="bg-white/5 border-white/10 hover:border-blue-500/50 transition-colors">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-2xl">{game.gameTitle}</CardTitle>
                      <CardDescription className="text-base">Serial: {game.gameSerial}</CardDescription>
                    </div>
                    <div className="flex items-center gap-2 bg-green-500/20 px-3 py-1 rounded-full">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span className="text-sm font-medium text-green-300">Optimized</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-blue-300 mb-3">Recommended Settings</h4>
                      <div className="space-y-2 text-sm">
                        {game.ppuDecoder && (
                          <div>
                            <span className="text-gray-400">PPU Decoder:</span>
                            <span className="ml-2 text-white font-medium">{game.ppuDecoder}</span>
                          </div>
                        )}
                        {game.spuMode && (
                          <div>
                            <span className="text-gray-400">SPU Mode:</span>
                            <span className="ml-2 text-white font-medium">{game.spuMode}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-purple-300 mb-3">Notes</h4>
                      <p className="text-sm text-gray-300">
                        {game.compatibilityNotes || "No additional notes available."}
                      </p>
                    </div>
                  </div>
                  {game.recommendedSettings && (
                    <div className="mt-4 p-3 bg-white/5 border border-white/10 rounded text-sm">
                      <p className="text-gray-400 mb-2">Full Configuration:</p>
                      <pre className="text-xs text-gray-300 overflow-x-auto">
                        {JSON.stringify(JSON.parse(game.recommendedSettings), null, 2)}
                      </pre>
                    </div>
                  )}
                  <Button
                    className="mt-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 w-full"
                    onClick={() => navigate("/profiles")}
                  >
                    View Performance Profiles
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <AlertCircle className="w-12 h-12 text-gray-500 mx-auto mb-4" />
            <p className="text-gray-300 text-lg">No games found matching "{searchQuery}"</p>
            <p className="text-gray-400 mt-2">Try searching by a different title or serial number.</p>
          </div>
        )}
      </div>
    </div>
  );
}
