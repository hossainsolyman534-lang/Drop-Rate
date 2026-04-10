import React from "react";
import { useAuth } from "../lib/AuthContext";
import { Button } from "./ui/button";
import { auth } from "../lib/firebase";
import { LayoutDashboard, LogOut, BarChart3, Settings, User } from "lucide-react";

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();

  const handleLogout = () => auth.signOut();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-6 sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <div className="bg-blue-600 p-1.5 rounded-lg">
            <BarChart3 className="h-5 w-5 text-white" />
          </div>
          <span className="font-bold text-xl text-slate-900 tracking-tight">DropLab</span>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-full">
            <User className="h-4 w-4 text-slate-500" />
            <span className="text-sm font-medium text-slate-700">
              {user?.isAnonymous ? "Guest User" : user?.email}
            </span>
          </div>
          {!user?.isAnonymous && (
            <Button variant="ghost" size="icon" onClick={handleLogout} className="text-slate-500 hover:text-red-600">
              <LogOut className="h-5 w-5" />
            </Button>
          )}
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="hidden lg:flex w-64 bg-white border-r border-slate-200 flex-col p-4 space-y-2">
          <Button variant="ghost" className="justify-start gap-3 bg-blue-50 text-blue-600 rounded-xl h-11">
            <LayoutDashboard className="h-5 w-5" />
            <span className="font-bold">Dashboard</span>
          </Button>
          <Button variant="ghost" className="justify-start gap-3 text-slate-600 hover:bg-slate-50 rounded-xl h-11">
            <BarChart3 className="h-5 w-5" />
            <span className="font-medium">Saved Reports</span>
          </Button>
          <Button variant="ghost" className="justify-start gap-3 text-slate-600 hover:bg-slate-50 rounded-xl h-11">
            <Settings className="h-5 w-5" />
            <span className="font-medium">Settings</span>
          </Button>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 md:p-8 overflow-auto">
          <div className="max-w-7xl mx-auto space-y-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
