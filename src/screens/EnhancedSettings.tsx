/**
 * Enhanced Settings Screen with improved UI/UX
 * Features: Better spacing, typography hierarchy, iOS-style design patterns
 */

import React, { useCallback, useState, useRef } from 'react';
import { ChevronRight, User, Bell, RotateCcw, Info, Settings as SettingsIcon, TestTube, Trash2, FileText, Shield, Edit2, Check, X, Sparkles, Zap, Heart, ShieldCheck, AlertCircle, AlertTriangle, CheckCircle2, History, BarChart3, Plus, Download, Upload, Database, Moon, Sun } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Switch } from '../components/ui/switch';
import { Input } from '../components/ui/input';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { AppBar } from '../components/AppShell';
import { useAppShell } from '../components/AppShell';
import { useHabitsStore } from '../store/HabitsStore';
import { useNotificationsStore } from '../store/NotificationsStore';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { ImportDialog } from '../components/ImportDialog';
import { Capacitor } from '@capacitor/core';
import { exportHabitsToCSV, parseCSV, validateHabitData, downloadCSV, formatFileSize } from '../utils/csvExport';
import { EnhancedThemeSelector } from '../components/ThemeSelector/EnhancedThemeSelector';
import { useToast, ToastContainer } from '../components/Toast';
import { useTheme } from '../contexts/ThemeContext';
import type { CSVImportResult } from '../utils/csvExport';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - vite json import allowed
import packageInfo from '../../package.json';

export function EnhancedSettings() {
  const { userName, setIsOnboarded, navigate, setUserName } = useAppShell();
  const {
    permission,
    enabled,
    hydrate,
    requestPermission,
    setEnabled,
    refreshScheduledCount,
    sendTest,
  } = useNotificationsStore();
  const { factoryReset, habitsById, statsById, habitDaysByKey, addHabit, editHabit } = useHabitsStore();
  const { theme: currentTheme } = useTheme();
  const toast = useToast();

  const [isTestingNotification, setIsTestingNotification] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(userName);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<string>('');
  const [showImportDialog, setShowImportDialog] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const version = packageInfo?.version ?? '1.0.7';

  const openLink = useCallback(async (url: string) => {
    try {
      const anyWin: any = globalThis as any;
      const Browser = anyWin?.Capacitor?.Plugins?.Browser;
      if (Browser) {
        await Browser.open({ url });
        return;
      }
    } catch {}
    window.open(url, '_blank', 'noopener,noreferrer');
  }, []);

  const handleResetOnboarding = () => {
    setShowResetConfirm(true);
  };

  const handleConfirmReset = async () => {
    setShowResetConfirm(false);
    try {
      await factoryReset();
    } catch (error) {
      console.error('Factory reset failed', error);
    }
    setIsOnboarded(false);
    navigate('/onboarding');
  };

  const handleRemoveAllHabits = () => {
    navigate('/confirm-remove-habits');
  };

  const handleRequestNotificationPermission = async () => {
    try {
      await requestPermission();
      await hydrate();
    } catch (error) {
      console.error('Failed to request notification permission:', error);
    }
  };

  const handleTestNotification = async () => {
    setIsTestingNotification(true);
    try {
      await sendTest();
      toast.success('Test notification sent!');
    } catch (error) {
      toast.error('Failed to send test notification');
    } finally {
      setIsTestingNotification(false);
    }
  };

  const handleThemeChange = (themeName: string) => {
    console.log('Theme changed to:', themeName);
  };

  const handleStartEditingName = () => {
    setIsEditingName(true);
    setTempName(userName);
  };

  const handleSaveName = () => {
    setUserName(tempName);
    setIsEditingName(false);
  };

  const handleCancelEditingName = () => {
    setIsEditingName(false);
    setTempName(userName);
  };

  const handleExportData = async () => {
    setIsExporting(true);
    try {
      const csvData = await exportHabitsToCSV();
      downloadCSV(csvData, 'seventh-path-habits.csv');
      toast.success('Data exported successfully!');
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Failed to export data');
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportData = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    try {
      const text = await file.text();
      const result = await parseCSV(text);
      const validation = validateHabitData(result.habits);
      
      if (validation.isValid) {
        setImportResult(`Successfully imported ${result.habits.length} habits`);
        setShowImportDialog(true);
      } else {
        toast.error(`Import failed: ${validation.errors.join(', ')}`);
      }
    } catch (error) {
      console.error('Import failed:', error);
      toast.error('Failed to import data');
    } finally {
      setIsImporting(false);
    }
  };

  // Enhanced Settings Section Component
  const SettingsSection = ({ 
    title, 
    icon, 
    children, 
    className = "" 
  }: { 
    title: string; 
    icon: React.ReactNode; 
    children: React.ReactNode;
    className?: string;
  }) => (
    <div className={`mb-8 ${className}`}>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 bg-primary/10 rounded-xl flex items-center justify-center">
          {icon}
        </div>
        <h2 className="text-lg font-semibold text-foreground">{title}</h2>
      </div>
      <Card className="border-border/50 shadow-sm">
        <CardContent className="p-0">
          {children}
        </CardContent>
      </Card>
    </div>
  );

  // Enhanced Settings Row Component
  const SettingsRow = ({ 
    icon, 
    title, 
    description, 
    action, 
    onClick,
    className = ""
  }: { 
    icon: React.ReactNode; 
    title: string; 
    description?: string; 
    action?: React.ReactNode; 
    onClick?: () => void;
    className?: string;
  }) => (
    <div 
      className={`flex items-center gap-4 p-4 border-b border-border/30 last:border-b-0 transition-colors duration-200 ${
        onClick ? 'cursor-pointer hover:bg-muted/30 active:bg-muted/50' : ''
      } ${className}`}
      onClick={onClick}
    >
      <div className="text-muted-foreground flex-shrink-0">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-foreground">{title}</p>
        {description && (
          <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
        )}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
      {onClick && <ChevronRight size={20} className="text-muted-foreground flex-shrink-0" />}
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <AppBar title="Settings" />
      
      <div className="flex-1 px-6 py-6 pb-safe-area-bottom">
        {/* Profile Section */}
        <SettingsSection title="Profile" icon={<User className="w-4 h-4 text-primary" />}>
          {isEditingName ? (
            <div className="p-4 space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Display Name
                </label>
                <Input
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full"
                  autoFocus
                />
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={handleSaveName} className="flex-1">
                  <Check className="w-4 h-4 mr-1" />
                  Save
                </Button>
                <Button size="sm" variant="outline" onClick={handleCancelEditingName} className="flex-1">
                  <X className="w-4 h-4 mr-1" />
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <SettingsRow
              icon={<User className="w-5 h-5" />}
              title="Display Name"
              description={userName || 'Tap to set your name'}
              action={
                <Button size="sm" variant="outline" onClick={handleStartEditingName} className="hover:scale-105 transition-transform">
                  <Edit2 className="w-4 h-4 mr-1" />
                  Edit
                </Button>
              }
            />
          )}
        </SettingsSection>

        {/* Appearance Section - Enhanced with floating dropdown */}
        <SettingsSection title="Appearance" icon={<Sparkles className="w-4 h-4 text-primary" />}>
          <div className="p-4">
            <div className="space-y-3">
              <div>
                <h3 className="text-sm font-medium text-foreground mb-2">Theme</h3>
                <p className="text-xs text-muted-foreground mb-4">
                  Choose your preferred color scheme
                </p>
              </div>
              <EnhancedThemeSelector onThemeChange={handleThemeChange} />
            </div>
          </div>
        </SettingsSection>

        {/* Enhanced Notifications Section */}
        <SettingsSection title="Notifications" icon={<Bell className="w-4 h-4 text-primary" />}>
          <SettingsRow
            icon={<Bell className="w-5 h-5" />}
            title="Notification Permission"
            description={permission === 'granted' ? 'Notifications are enabled' : 'Enable to receive reminders'}
            action={
              permission === 'granted' ? (
                <Badge variant="secondary" className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  Enabled
                </Badge>
              ) : (
                <Button size="sm" variant="outline" onClick={handleRequestNotificationPermission}>
                  Enable
                </Button>
              )
            }
          />
          
          {permission === 'granted' && (
            <>
              <SettingsRow
                icon={<Bell className="w-5 h-5" />}
                title="Notifications"
                description="Toggle notifications on or off"
                action={
                  <Switch
                    checked={enabled}
                    onCheckedChange={setEnabled}
                  />
                }
              />
              
              <SettingsRow
                icon={<TestTube className="w-5 h-5" />}
                title="Test Notification"
                description="Send a test notification"
                action={
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={handleTestNotification}
                    disabled={isTestingNotification}
                  >
                    {isTestingNotification ? 'Sending...' : 'Test'}
                  </Button>
                }
              />
            </>
          )}
        </SettingsSection>

        {/* Data Management Section */}
        <SettingsSection title="Data" icon={<Database className="w-4 h-4 text-primary" />}>
          <SettingsRow
            icon={<Download className="w-5 h-5" />}
            title="Export Data"
            description="Download your habits as CSV"
            action={
              <Button 
                size="sm" 
                variant="outline" 
                onClick={handleExportData}
                disabled={isExporting}
              >
                {isExporting ? 'Exporting...' : 'Export'}
              </Button>
            }
          />
          
          <SettingsRow
            icon={<Upload className="w-5 h-5" />}
            title="Import Data"
            description="Import habits from CSV file"
            action={
              <Button 
                size="sm" 
                variant="outline" 
                onClick={handleImportData}
                disabled={isImporting}
              >
                {isImporting ? 'Importing...' : 'Import'}
              </Button>
            }
          />
          
          <SettingsRow
            icon={<RotateCcw className="w-5 h-5" />}
            title="Reset Onboarding"
            description="Go through the setup process again"
            onClick={handleResetOnboarding}
          />
          
          <SettingsRow
            icon={<Trash2 className="w-5 h-5" />}
            title="Remove All Habits"
            description="Delete all your habits permanently"
            onClick={handleRemoveAllHabits}
          />
        </SettingsSection>

        {/* About Section */}
        <SettingsSection title="About" icon={<Info className="w-4 h-4 text-primary" />}>
          <SettingsRow
            icon={<Info className="w-5 h-5" />}
            title="About Seventh Path"
            description={`Version ${version}`}
            onClick={() => setAboutOpen(true)}
          />
          
          <SettingsRow
            icon={<Shield className="w-5 h-5" />}
            title="Privacy Policy"
            description="How we protect your data"
            onClick={() => openLink('https://seventhpath.app/privacy')}
          />
          
          <SettingsRow
            icon={<FileText className="w-5 h-5" />}
            title="Terms of Service"
            description="Terms and conditions"
            onClick={() => openLink('https://seventhpath.app/terms')}
          />
        </SettingsSection>

        {/* App Info */}
        <div className="mt-12 text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">🎯</span>
          </div>
          <h3 className="font-semibold text-lg mb-2">Seventh Path</h3>
          <p className="text-sm text-muted-foreground mb-1">
            Building better habits, one day at a time
          </p>
          <p className="text-xs text-muted-foreground">
            Made with ❤️ for your success
          </p>
        </div>
      </div>

      {/* About Dialog */}
      <Dialog open={aboutOpen} onOpenChange={setAboutOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>About Seventh Path</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🎯</span>
              </div>
              <h3 className="font-semibold text-lg mb-2">Seventh Path</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Version {version}
              </p>
            </div>
            <p className="text-sm text-muted-foreground">
              Seventh Path is a mindful habit-tracking app designed to help you build better habits, 
              one day at a time. Track your progress, stay motivated, and achieve your goals.
            </p>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => openLink('https://seventhpath.app')}
                className="flex-1"
              >
                Visit Website
              </Button>
              <Button 
                variant="outline" 
                onClick={() => openLink('mailto:support@seventhpath.app')}
                className="flex-1"
              >
                Contact Support
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Reset Confirmation Dialog */}
      <Dialog open={showResetConfirm} onOpenChange={setShowResetConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset Onboarding</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              This will clear your profile and habits. Are you sure you want to continue?
            </p>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => setShowResetConfirm(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleConfirmReset}
                className="flex-1"
              >
                Reset
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Import Dialog */}
      {showImportDialog && (
        <ImportDialog
          isOpen={showImportDialog}
          onClose={() => setShowImportDialog(false)}
          result={importResult}
        />
      )}

      {/* Toast Container */}
      <ToastContainer />
    </div>
  );
}


