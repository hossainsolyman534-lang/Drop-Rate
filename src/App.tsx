/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AuthProvider, useAuth } from "./lib/AuthContext";
import { Layout } from "./components/Layout";
import { MetaConnect } from "./components/MetaConnect";
import { FunnelAnalysis } from "./components/FunnelAnalysis";
import { LandingPage } from "./components/LandingPage";
import { Loader2 } from "lucide-react";
import { useState } from "react";

function AppContent() {
  const { loading, userData } = useAuth();
  const [isConnecting, setIsConnecting] = useState(false);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  // If not connected to Meta, show Landing Page
  if (!userData?.metaAccessToken && !isConnecting) {
    return <LandingPage onConnect={() => setIsConnecting(true)} />;
  }

  return (
    <Layout>
      <div className="space-y-8">
        {!userData?.metaAccessToken ? (
          <div className="max-w-2xl mx-auto pt-12">
            <MetaConnect onCancel={() => setIsConnecting(false)} />
          </div>
        ) : (
          <>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Funnel Analysis</h1>
              <p className="text-slate-500 mt-1">Identify and fix drop-off points in your Meta ads funnel.</p>
            </div>
            <FunnelAnalysis />
          </>
        )}
      </div>
    </Layout>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

