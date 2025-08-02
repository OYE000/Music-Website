import { Authenticated, Unauthenticated, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { SignInForm } from "./SignInForm";
import { SignOutButton } from "./SignOutButton";
import { Toaster } from "sonner";
import { MusicDiscovery } from "./components/MusicDiscovery";

export default function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="absolute inset-0 opacity-20 bg-gradient-to-br from-purple-500/5 to-blue-500/5"></div>
      
      <header className="relative z-10 backdrop-blur-xl bg-white/5 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">♪</span>
            </div>
            <h1 className="text-xl font-semibold text-white">Discover</h1>
          </div>
          <SignOutButton />
        </div>
      </header>

      <main className="relative z-10 p-6">
        <Content />
      </main>
      
      <Toaster 
        theme="dark"
        position="bottom-right"
        toastOptions={{
          style: {
            background: 'rgba(15, 23, 42, 0.9)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            color: 'white',
          },
        }}
      />
    </div>
  );
}

function Content() {
  const loggedInUser = useQuery(api.auth.loggedInUser);

  if (loggedInUser === undefined) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-white/20 border-t-white"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <Unauthenticated>
        <div className="flex flex-col items-center justify-center min-h-96 gap-8">
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-r from-green-400 to-blue-500 rounded-2xl flex items-center justify-center mb-6 mx-auto">
              <span className="text-white font-bold text-3xl">♪</span>
            </div>
            <h1 className="text-5xl font-bold text-white mb-4">Discover Music</h1>
            <p className="text-xl text-white/70 mb-2">Explore millions of tracks from Spotify</p>
            <p className="text-lg text-white/50">Sign in to save your favorites</p>
          </div>
          <div className="w-full max-w-md">
            <SignInForm />
          </div>
        </div>
      </Unauthenticated>
      
      <Authenticated>
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Welcome back, {loggedInUser?.email?.split('@')[0]}
          </h1>
          <p className="text-xl text-white/70">Discover your next favorite song</p>
        </div>
        <MusicDiscovery />
      </Authenticated>
    </div>
  );
}
