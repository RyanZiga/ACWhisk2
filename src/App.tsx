import React, { useState, useEffect } from 'react'
import { AuthProvider, useAuth } from './components/AuthContext'
import { ThemeProvider } from './components/ThemeContext'
import { NotificationProvider } from './components/ui/notification'
import { ErrorBoundary, AsyncErrorBoundary } from './components/ErrorBoundary'
import { ServiceWorkerManager } from './components/ServiceWorkerManager'
import { Layout } from './components/Layout'
import { Dashboard } from './components/Dashboard'
import { RecipeManager } from './components/RecipeManager'
import { LearningHub } from './components/LearningHub'
import { CommunityForum } from './components/CommunityForum'
import { ChatAssistant } from './components/ChatAssistant'
import { AdminPanel } from './components/AdminPanel'
import { ProfileSettings } from './components/ProfileSettings'
import { DigitalPortfolio } from './components/DigitalPortfolio'
import { DatabaseSetup } from './components/DatabaseSetup'
import { ProfileInitializer } from './components/ProfileInitializer'
import { RealTimeNotifications } from './components/RealTimeNotifications'
import { OfflineIndicator } from './components/OfflineIndicator'
import { Toaster } from './components/ui/sonner'
import { MotionSpinner } from './components/ui/motion'
import { supabase } from './utils/supabase/client'

function AppContent() {
  const { user, loading } = useAuth()
  const [activeTab, setActiveTab] = useState('dashboard')
  const [databaseReady, setDatabaseReady] = useState<boolean | null>(null)

  useEffect(() => {
    checkDatabaseSetup()
  }, [user])

  const checkDatabaseSetup = async () => {
    if (!user) {
      setDatabaseReady(null)
      return
    }

    try {
      // Check if essential tables exist by attempting to query profiles
      const { error } = await supabase
        .from('profiles')
        .select('id', { count: 'exact', head: true })
        .limit(1)

      // If profiles table doesn't exist, database needs full setup
      if (error && (error.code === 'PGRST205' || error.code === '42P01')) {
        setDatabaseReady(false)
        return
      }

      // If profiles exists, basic database is ready
      // Portfolio feature will handle its own table checks
      setDatabaseReady(true)
    } catch (error) {
      // If there's any error, assume database needs setup
      setDatabaseReady(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-glass-gradient flex items-center justify-center">
        <div className="text-center space-y-6">
          <MotionSpinner size={60} color="var(--primary)" />
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-foreground">ACWhisk</h1>
            <p className="text-muted-foreground">Loading your culinary platform...</p>
            <div className="w-2 h-2 bg-primary rounded-full mx-auto pulse-online"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Auth />
  }

  // Show database setup if database is not ready
  if (databaseReady === false) {
    return (
      <div className="min-h-screen bg-glass-gradient relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-aurora-gradient rounded-full opacity-20 blur-3xl floating"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-calm-gradient rounded-full opacity-15 blur-3xl floating" style={{ animationDelay: '-3s' }}></div>
        </div>
        
        <div className="relative z-10 container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold mb-2">Welcome to ACWhisk! 🍳</h1>
              <p className="text-muted-foreground">
                Let's set up your database to get started with your culinary platform.
              </p>
              
              {/* Emergency fix banner for critical auth issues */}
              <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                <h2 className="text-lg font-semibold text-red-400 mb-2">🚨 Getting "Database error saving new user"?</h2>
                <p className="text-red-300 text-sm mb-3">
                  This critical error prevents user registration. Use the <strong>Database Authentication Checker</strong> below for an immediate fix.
                </p>
                <div className="text-xs text-red-300/80">
                  The most common cause is RLS being enabled on the auth.users table, which breaks authentication completely.
                </div>
              </div>
            </div>
            <ErrorBoundary>
              <DatabaseSetup />
            </ErrorBoundary>
          </div>
        </div>
      </div>
    )
  }

  // Show loading while checking database
  if (databaseReady === null) {
    return (
      <div className="min-h-screen bg-glass-gradient flex items-center justify-center">
        <div className="text-center space-y-6">
          <MotionSpinner size={60} color="var(--primary)" />
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-foreground">ACWhisk</h1>
            <p className="text-muted-foreground">Checking database setup...</p>
            <div className="w-2 h-2 bg-primary rounded-full mx-auto pulse-online"></div>
          </div>
        </div>
      </div>
    )
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <ErrorBoundary>
            <Dashboard onTabChange={setActiveTab} />
          </ErrorBoundary>
        )
      case 'recipes':
        return (
          <ErrorBoundary>
            <RecipeManager />
          </ErrorBoundary>
        )
      case 'portfolio':
        return (
          <ErrorBoundary>
            <DigitalPortfolio />
          </ErrorBoundary>
        )
      case 'learning':
        return (
          <ErrorBoundary>
            <LearningHub />
          </ErrorBoundary>
        )
      case 'forum':
        return (
          <ErrorBoundary>
            <CommunityForum />
          </ErrorBoundary>
        )
      case 'chat':
        return (
          <ErrorBoundary>
            <ChatAssistant />
          </ErrorBoundary>
        )
      case 'feedback':
        return (
          <ErrorBoundary>
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold mb-4">Student Feedback</h2>
              <p className="text-muted-foreground mb-6">
                Review and provide feedback on student submissions
              </p>
              <div className="bg-accent/50 rounded-lg p-8 max-w-md mx-auto">
                <p className="text-sm text-muted-foreground">
                  Feedback system is coming soon! Instructors will be able to:
                </p>
                <ul className="text-sm text-muted-foreground mt-4 space-y-1 text-left">
                  <li>• Review student recipes</li>
                  <li>• Provide detailed feedback</li>
                  <li>• Rate submissions</li>
                  <li>• Track student progress</li>
                </ul>
              </div>
            </div>
          </ErrorBoundary>
        )
      case 'resources':
        return (
          <ErrorBoundary>
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold mb-4">Teaching Resources</h2>
              <p className="text-muted-foreground mb-6">
                Upload and manage your educational content and materials
              </p>
              <div className="bg-accent/50 rounded-lg p-8 max-w-md mx-auto">
                <p className="text-sm text-muted-foreground">
                  Resource management is coming soon! Instructors will be able to:
                </p>
                <ul className="text-sm text-muted-foreground mt-4 space-y-1 text-left">
                  <li>• Upload video tutorials</li>
                  <li>• Share lesson plans</li>
                  <li>• Create learning modules</li>
                  <li>• Organize by skill level</li>
                </ul>
              </div>
            </div>
          </ErrorBoundary>
        )
      case 'admin':
        return (
          <ErrorBoundary>
            <AdminPanel />
          </ErrorBoundary>
        )
      case 'database':
        return (
          <ErrorBoundary>
            <DatabaseSetup />
          </ErrorBoundary>
        )
      case 'profile':
        return (
          <ErrorBoundary>
            <ProfileSettings />
          </ErrorBoundary>
        )
      default:
        return (
          <ErrorBoundary>
            <Dashboard onTabChange={setActiveTab} />
          </ErrorBoundary>
        )
    }
  }

  return (
    <ErrorBoundary>
      <ProfileInitializer />
      <Layout activeTab={activeTab} onTabChange={setActiveTab}>
        <ErrorBoundary>
          <RealTimeNotifications onTabChange={setActiveTab} />
        </ErrorBoundary>
        {renderContent()}
      </Layout>
    </ErrorBoundary>
  )
}

export default function App() {
  return (
    <AsyncErrorBoundary>
      <ThemeProvider>
        <NotificationProvider>
          <ServiceWorkerManager>
            <AuthProvider>
              <ErrorBoundary>
                <AppContent />
                <OfflineIndicator />
                <Toaster />
              </ErrorBoundary>
            </AuthProvider>
          </ServiceWorkerManager>
        </NotificationProvider>
      </ThemeProvider>
    </AsyncErrorBoundary>
  )
}
