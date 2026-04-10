import React, { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Facebook, CheckCircle2, AlertCircle, RefreshCcw, ArrowLeft } from "lucide-react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuth } from "../lib/AuthContext";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "./ui/card";

interface MetaConnectProps {
  onCancel?: () => void;
}

export const MetaConnect: React.FC<MetaConnectProps> = ({ onCancel }) => {
  const { user, userData } = useAuth();
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const handleMessage = async (event: MessageEvent) => {
      // Validate origin is from AI Studio preview or localhost
      const origin = event.origin;
      if (!origin.endsWith('.run.app') && !origin.includes('localhost')) {
        return;
      }

      if (event.data?.type === 'META_AUTH_SUCCESS' && user) {
        const { accessToken } = event.data;
        try {
          await updateDoc(doc(db, "users", user.uid), {
            metaAccessToken: accessToken,
            metaConnectedAt: new Date().toISOString()
          });
          // Refresh page or state to show connected
          window.location.reload();
        } catch (err: any) {
          setError("Failed to save Meta connection: " + err.message);
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [user]);

  const handleConnect = async () => {
    setConnecting(true);
    setError("");
    try {
      const response = await fetch('/api/auth/meta/url');
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to get auth URL from server');
      }
      const { url } = await response.json();

      const width = 600;
      const height = 700;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;

      const authWindow = window.open(
        url,
        'meta_oauth_popup',
        `width=${width},height=${height},left=${left},top=${top}`
      );

      if (!authWindow) {
        setError("Popup blocked. Please enable popups for this site.");
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred while connecting.");
    } finally {
      setConnecting(false);
    }
  };

  if (userData?.metaAccessToken) {
    return (
      <Card className="border-green-100 bg-green-50/30 shadow-sm rounded-2xl">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <div className="bg-green-100 p-2 rounded-full">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="font-bold text-green-900">Meta Ads Connected</p>
              <p className="text-sm text-green-700">Your account is ready for analysis.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {onCancel && (
        <Button variant="ghost" onClick={onCancel} className="text-slate-500 hover:text-slate-900 -ml-2">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Landing Page
        </Button>
      )}
      
      <Card className="border-slate-100 shadow-xl shadow-slate-200/50 rounded-2xl overflow-hidden bg-white">
        <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-8 pt-8">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-blue-200">
            <Facebook className="h-6 w-6 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-slate-900">Connect Meta Ads</CardTitle>
          <CardDescription className="text-slate-500 text-lg">
            Securely connect your Meta Ads Manager to start analyzing your funnel performance.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-8 pb-8 space-y-6">
          {error && (
            <Alert variant="destructive" className="bg-red-50 border-red-100 text-red-900 rounded-xl">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertTitle className="font-bold">Connection Error</AlertTitle>
              <AlertDescription className="text-red-700">
                {error}
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            <div className="flex items-start gap-3 text-sm text-slate-600">
              <CheckCircle2 className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
              <p>We only request <b>read-only</b> access to your ad accounts and insights.</p>
            </div>
            <div className="flex items-start gap-3 text-sm text-slate-600">
              <CheckCircle2 className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
              <p>Your data is processed securely and never shared with third parties.</p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="bg-slate-50/50 border-t border-slate-100 p-6">
          <Button 
            onClick={handleConnect} 
            disabled={connecting}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-14 text-lg font-bold shadow-lg shadow-blue-200 transition-all active:scale-[0.98]"
          >
            {connecting ? (
              <>
                <RefreshCcw className="mr-2 h-5 w-5 animate-spin" />
                Connecting...
              </>
            ) : error ? (
              "Retry Connection"
            ) : (
              "Connect Facebook Account"
            )}
          </Button>
        </CardFooter>
      </Card>

      <p className="text-center text-xs text-slate-400">
        By connecting, you authorize DropLab to access your Meta Ads data as per our Privacy Policy.
      </p>
    </div>
  );
};
