import React, { useCallback, useState, useRef } from 'react';
import { ChevronRight, User, Bell, RotateCcw, Info, Settings as SettingsIcon, TestTube, Trash2, FileText, Shield, Edit2, Check, X, Sparkles, Zap, Heart, ShieldCheck, AlertCircle, CheckCircle2, History, BarChart3, Plus, Download, Upload, Database, Moon, Sun } from 'lucide-react';
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
import { ThemeSelector } from '../components/ThemeSelector';
import { useToast, ToastContainer } from '../components/Toast';
import { useTheme } from '../contexts/ThemeContext';
import type { CSVImportResult } from '../utils/csvExport';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - vite json import allowed
import packageInfo from '../../package.json';

export function Settings() {
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
  const { 
    factoryReset, 
    habitsById, 
    statsById, 
    habitDaysByKey, 
    addHabit, 
    editHabit,
    clearAllHabits,
    hydrate: hydrateHabits 
  } = useHabitsStore();
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
  
  // Enhanced import state
  const [pendingImportFile, setPendingImportFile] = useState<File | null>(null);
  const [pendingHabits, setPendingHabits] = useState<any[]>([]);
  const [showEnhancedImportDialog, setShowEnhancedImportDialog] = useState(false);
  
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
    } catch (error) {
      console.error('Error requesting notification permission:', error);
    }
  };

  const handleTestNotification = async () => {
    try {
      setIsTestingNotification(true);
      await sendTest();
      await refreshScheduledCount();
      try {
        if (Capacitor.getPlatform() !== 'web') {
          const toastMod = await import('@capacitor/toast');
          await toastMod?.Toast?.show?.({ text: 'You will receive the notification within 2 minutes.' });
        } else if (typeof window !== 'undefined' && typeof window.alert === 'function') {
          window.alert('You will receive the notification within 2 minutes.');
        }
      } catch (toastErr) {
        console.warn('Failed to show toast', toastErr);
      }
    } catch (error) {
      console.error('Error sending test notification:', error);
    } finally {
      setIsTestingNotification(false);
    }
  };

  const handleStartEditingName = () => {
    setTempName(userName);
    setIsEditingName(true);
  };

  const handleSaveName = () => {
    if (tempName.trim()) {
      setUserName(tempName.trim());
    }
    setIsEditingName(false);
  };

  const handleCancelEditingName = () => {
    setTempName(userName);
    setIsEditingName(false);
  };

  const handleThemeChange = (themeName: string) => {
    toast.theme(`Theme changed to ${themeName.charAt(0).toUpperCase() + themeName.slice(1)}`, 2000);
  };

  const handleExportData = async () => {
    try {
      setIsExporting(true);
      const result = exportHabitsToCSV(habitsById, statsById, habitDaysByKey);
      
      if (result.success && result.csv && result.filename) {
        downloadCSV(result.csv, result.filename);
        
        // Calculate file size
        const fileSize = formatFileSize(new Blob([result.csv]).size);
        
        // Show success toast with details
        toast.success(
          `Exported ${result.habitCount} habit${result.habitCount !== 1 ? 's' : ''} (${fileSize}) successfully!`,
          3000
        );
        
        console.log('[Export] Success:', {
          habitCount: result.habitCount,
          filename: result.filename,
          fileSize,
          timestamp: new Date().toISOString()
        });
      } else {
        throw new Error(result.error || 'Export failed');
      }
    } catch (error) {
      console.error('[Export] Error:', error);
      toast.error('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportFilePick = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsImporting(true);
      
      // Validate file type
      if (!file.name.endsWith('.csv')) {
        throw new Error('Please select a CSV file');
      }

      // Read and parse file
      const text = await file.text();
      const { habits, schemaVersion } = parseCSV(text);
      
      if (habits.length === 0) {
        throw new Error('CSV file contains no valid habits');
      }

      console.log('[Import] File parsed:', {
        fileName: file.name,
        habitCount: habits.length,
        schemaVersion,
        fileSize: formatFileSize(file.size)
      });
      
      // Store for import dialog
      setPendingImportFile(file);
      setPendingHabits(habits);
      setShowEnhancedImportDialog(true);
      
    } catch (error) {
      console.error('[Import] Parse error:', error);
      toast.error(
        `Invalid CSV file: ${error instanceof Error ? error.message : 'Unknown error'}`,
        4000
      );
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } finally {
      setIsImporting(false);
    }
  };

  const handleImportExecution = async (mode: 'merge' | 'replace'): Promise<CSVImportResult> => {
    if (!pendingImportFile || pendingHabits.length === 0) {
      return { 
        success: false, 
        errors: ['No file selected or no valid habits found'] 
      };
    }

    console.log('[Import] Starting import:', { mode, habitCount: pendingHabits.length });

    try {
      let imported = 0;
      let updated = 0;
      let skipped = 0;
      const errors: string[] = [];
      const warnings: string[] = [];

      // Replace mode: clear all existing habits
      if (mode === 'replace') {
        console.log('[Import] Clearing all existing habits (replace mode)');
        await clearAllHabits();
      }

      // Import each habit
      for (const habitData of pendingHabits) {
        const validation = validateHabitData(habitData);
        
        // Collect warnings
        if (validation.warnings && validation.warnings.length > 0) {
          warnings.push(...validation.warnings.map(w => `${habitData.name}: ${w}`));
        }
        
        // Skip invalid habits
        if (!validation.valid) {
          errors.push(`${habitData.name}: ${validation.errors.join(', ')}`);
          skipped++;
          console.warn('[Import] Skipping invalid habit:', habitData.name, validation.errors);
          continue;
        }

        try {
          const existingHabit = habitsById[habitData.id];
          
          // Build timer config if available
          const timerConfig = habitData.timerEnabled ? {
            enabled: true,
            mode: (habitData.timerMode as 'countdown' | 'stopwatch') || 'countdown',
            defaultDuration: habitData.timerDefaultDuration || 1800,
            autoCompleteHabit: habitData.timerAutoComplete ?? true
          } : undefined;
          
          if (existingHabit && mode === 'merge') {
            // Update existing habit
            await editHabit({
              id: habitData.id,
              name: habitData.name,
              emoji: habitData.emoji,
              frequency: habitData.frequency,
              weeklyDays: habitData.weeklyDays,
              reminderTimes: habitData.reminderTimes,
              timerConfig,
            });
            updated++;
            console.log('[Import] Updated habit:', habitData.name);
          } else {
            // Create new habit
            await addHabit({
              id: habitData.id,
              name: habitData.name,
              emoji: habitData.emoji,
              frequency: habitData.frequency,
              weeklyDays: habitData.weeklyDays || [],
              reminderTimes: habitData.reminderTimes || [],
              createdAt: habitData.createdAt || new Date().toISOString(),
              timerConfig,
            });
            imported++;
            console.log('[Import] Imported new habit:', habitData.name);
          }
        } catch (error) {
          console.error(`[Import] Error importing habit ${habitData.name}:`, error);
          errors.push(`${habitData.name}: Import failed - ${error instanceof Error ? error.message : 'Unknown error'}`);
          skipped++;
        }
      }

      console.log('[Import] Batch complete:', { imported, updated, skipped, errors: errors.length, warnings: warnings.length });

      // ✅ CRITICAL: Refresh all state immediately
      console.log('[Import] Refreshing app state...');
      await hydrateHabits();
      await hydrate(); // Notifications store
      await refreshScheduledCount();
      
      console.log('[Import] State refresh complete');

      // Clear pending state
      setPendingImportFile(null);
      setPendingHabits([]);
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      // Show success toast
      if (imported + updated > 0) {
        toast.success(
          `Import complete! ${imported} imported, ${updated} updated`,
          3000
        );
      }

      return {
        success: errors.length === 0 || imported + updated > 0,
        imported,
        updated,
        skipped,
        errors,
        warnings
      };
    } catch (error) {
      console.error('[Import] Fatal error:', error);
      return {
        success: false,
        errors: [error instanceof Error ? error.message : 'Unknown error during import']
      };
    }
  };

  React.useEffect(() => {
    hydrate();
  }, [hydrate]);

  // Sync tempName with userName when userName changes
  React.useEffect(() => {
    setTempName(userName);
  }, [userName]);

  const SettingsSection = ({ title, children, icon }: { title: string; children: React.ReactNode; icon?: React.ReactNode }) => (
    <div className="mb-8 w-full">
      <div className="flex items-center gap-4 mb-6 px-2">
        {icon && (
          <div className="w-10 h-10 bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl flex items-center justify-center">
            {icon}
          </div>
        )}
        <h3 className="text-xl font-bold text-foreground">{title}</h3>
      </div>
      <Card className="bg-gradient-to-br from-card to-card/50 border border-border shadow-sm rounded-2xl">
        <CardContent className="p-0">
          {children}
        </CardContent>
      </Card>
    </div>
  );

  const SettingsRow = ({ 
    icon, 
    title, 
    description, 
    action, 
    onClick,
    variant = 'default'
  }: { 
    icon: React.ReactNode; 
    title: string; 
    description?: string; 
    action?: React.ReactNode; 
    onClick?: () => void;
    variant?: 'default' | 'danger' | 'success';
  }) => {
    const getVariantStyles = () => {
      switch (variant) {
        case 'danger':
          return 'hover:bg-red-50 dark:hover:bg-red-950/20 border-red-200 dark:border-red-800';
        case 'success':
          return 'hover:bg-green-50 dark:hover:bg-green-950/20 border-green-200 dark:border-green-800';
        default:
          return 'hover:bg-muted/50 border-border';
      }
    };

    return (
      <div 
        className={`flex items-center gap-4 p-6 border-b border-border last:border-b-0 transition-all duration-300 ${
          onClick ? `cursor-pointer active:scale-[0.98] ${getVariantStyles()}` : ''
        }`}
        onClick={onClick}
      >
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
          variant === 'danger' ? 'bg-red-100 dark:bg-red-900/30' :
          variant === 'success' ? 'bg-green-100 dark:bg-green-900/30' :
          'bg-muted/50'
        }`}>
          <div className={`${
            variant === 'danger' ? 'text-red-600 dark:text-red-400' :
            variant === 'success' ? 'text-green-600 dark:text-green-400' :
            'text-muted-foreground'
          }`}>
            {icon}
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <p className={`font-bold text-lg ${
            variant === 'danger' ? 'text-red-700 dark:text-red-300' :
            variant === 'success' ? 'text-green-700 dark:text-green-300' :
            'text-foreground'
          }`}>{title}</p>
          {description && (
            <p className={`text-sm mt-1 font-medium ${
              variant === 'danger' ? 'text-red-600 dark:text-red-400' :
              variant === 'success' ? 'text-green-600 dark:text-green-400' :
              'text-muted-foreground'
            }`}>{description}</p>
          )}
        </div>
        {action && <div className="flex-shrink-0">{action}</div>}
        {onClick && (
          <div className="flex-shrink-0">
            <ChevronRight size={20} className="text-muted-foreground" />
          </div>
        )}
      </div>
    );
  };

  return (
    <div 
      className="flex flex-col min-h-screen bg-background w-full"
      style={{
        paddingTop: 'env(safe-area-inset-top)',
        paddingBottom: 'env(safe-area-inset-bottom)',
        paddingLeft: 'env(safe-area-inset-left)',
        paddingRight: 'env(safe-area-inset-right)',
      }}
    >
      <AppBar title="Settings" />

      <div className="flex-1 px-6 py-6 pt-20 pb-24 w-full overflow-x-hidden overflow-y-auto">
        {/* Enhanced Profile Header */}
        <div className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-primary/3 to-transparent border border-primary/20 rounded-3xl mb-8 p-8 w-full">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primary/5" />
          <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-primary/10 to-transparent rounded-full -translate-y-20 translate-x-20" />
          
          <div className="relative">
            <div className="flex items-center gap-6 mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-primary/10 rounded-3xl flex items-center justify-center shadow-lg">
                <User className="w-10 h-10 text-primary" />
              </div>
              <div className="flex-1">
                <h2 className="text-3xl font-bold text-foreground mb-2">
                  {userName ? `Hello, ${userName}!` : 'Welcome!'}
                </h2>
                <p className="text-muted-foreground font-medium text-base">
                  {userName ? 'Manage your account and preferences' : 'Set up your profile to get started'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <Badge variant="secondary" className="px-4 py-2 rounded-full font-semibold">
                <Sparkles className="w-4 h-4 mr-2" />
                Seventh Path
              </Badge>
              <Badge variant="outline" className="px-4 py-2 rounded-full font-semibold">
                <ShieldCheck className="w-4 h-4 mr-2" />
                Privacy First
              </Badge>
            </div>
          </div>
        </div>

        {/* Enhanced Profile Section */}
        <SettingsSection title="Profile" icon={<User className="w-4 h-4 text-primary" />}>
          {isEditingName ? (
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl flex items-center justify-center">
                  <Edit2 className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-lg">Edit Name</h4>
                  <p className="text-sm text-muted-foreground">Update your display name</p>
                </div>
              </div>
              <div className="space-y-2">
                <Input
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  placeholder="Enter your name"
                  className="h-12 text-lg"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleSaveName();
                    } else if (e.key === 'Escape') {
                      handleCancelEditingName();
                    }
                  }}
                />
                <div className="flex items-center gap-3">
                  <Button 
                    onClick={handleSaveName} 
                    disabled={!tempName.trim()}
                    className="flex-1 h-11 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Save Changes
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={handleCancelEditingName}
                    className="h-11"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                </div>
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

        {/* Appearance Section - Updated with Theme Selector */}
        <SettingsSection title="Appearance" icon={<Sparkles className="w-4 h-4 text-primary" />}>
          <div className="p-6">
            <ThemeSelector onThemeChange={handleThemeChange} />
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
                  Granted
                </Badge>
              ) : (
                <Button size="sm" variant="outline" onClick={handleRequestNotificationPermission} className="hover:scale-105 transition-transform">
                  <Bell className="w-4 h-4 mr-1" />
                  Enable
                </Button>
              )
            }
          />

          <SettingsRow
            icon={<SettingsIcon className="w-5 h-5" />}
            title="App Notifications"
            description={permission === 'granted' ? 'Toggle app notifications on/off' : 'Grant permission first'}
            action={
              <Switch
                checked={enabled}
                onCheckedChange={async (on) => {
                  try { await setEnabled(on); } catch (e) { console.error(e); }
                }}
                disabled={permission !== 'granted'}
              />
            }
          />

          <SettingsRow
            icon={<TestTube className="w-5 h-5" />}
            title="Test Notification"
            description={permission === 'granted' ? "Send a test notification" : 'Grant permission first'}
            action={
              <Button
                size="sm"
                variant="outline"
                onClick={handleTestNotification}
                disabled={isTestingNotification || permission !== 'granted' || !enabled}
                className="hover:scale-105 transition-transform"
              >
                {isTestingNotification ? (
                  <>
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 mr-1" />
                    Test
                  </>
                )}
              </Button>
            }
          />
        </SettingsSection>


        {/* Data Management Section - NEW */}
        <SettingsSection title="Data Management" icon={<Database className="w-4 h-4 text-primary" />}>
          <SettingsRow
            icon={<Download className="w-5 h-5" />}
            title="Export Data"
            description="Download all your habits and history as CSV"
            action={
              <Button
                size="sm"
                variant="outline"
                onClick={handleExportData}
                disabled={isExporting || Object.keys(habitsById).length === 0}
                className="hover:scale-105 transition-transform"
              >
                {isExporting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-1" />
                    Export
                  </>
                )}
              </Button>
            }
          />

          <SettingsRow
            icon={<Upload className="w-5 h-5" />}
            title="Import Data"
            description="Import habits from a CSV file"
            action={
              <>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleImportData}
                  style={{ display: 'none' }}
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isImporting}
                  className="hover:scale-105 transition-transform"
                >
                  {isImporting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                      Importing...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-1" />
                      Import
                    </>
                  )}
                </Button>
              </>
            }
          />
        </SettingsSection>


        {/* Enhanced Data Section */}
        <SettingsSection title="Reset Options" icon={<RotateCcw className="w-4 h-4 text-primary" />}>
          <SettingsRow
            icon={<RotateCcw className="w-5 h-5" />}
            title="Reset Onboarding"
            description="Erase all habits, stats, and start fresh"
            variant="danger"
            onClick={handleResetOnboarding}
          />
        </SettingsSection>

        {/* Enhanced About Section */}
        <SettingsSection title="About" icon={<Info className="w-4 h-4 text-primary" />}>
          <SettingsRow
            icon={<Info className="w-5 h-5" />}
            title="About Seventh Path"
            description={`Version ${version} • Learn more about the app`}
            onClick={() => setAboutOpen(true)}
          />
        </SettingsSection>

        {/* Enhanced Legal Section */}
        <SettingsSection title="Legal" icon={<Shield className="w-4 h-4 text-primary" />}>
          <SettingsRow
            icon={<FileText className="w-5 h-5" />}
            title="Terms of Use"
            description="Read our terms and conditions"
            onClick={() => navigate('/terms')}
          />
          <SettingsRow
            icon={<Shield className="w-5 h-5" />}
            title="Privacy Policy"
            description="How we protect your data"
            onClick={() => navigate('/privacy')}
          />
        </SettingsSection>

        {/* Enhanced Danger Zone */}
        <SettingsSection title="Danger Zone" icon={<AlertTriangle className="w-4 h-4 text-red-500" />}>
          <div className="p-6">
            <div className="bg-gradient-to-r from-red-50 to-red-100 dark:from-red-950/20 dark:to-red-900/10 border border-red-200 dark:border-red-800 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center">
                  <Trash2 className="w-5 h-5 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <h4 className="font-semibold text-red-700 dark:text-red-300">Remove All Habits</h4>
                  <p className="text-sm text-red-600 dark:text-red-400">This action cannot be undone</p>
                </div>
              </div>
              <Button 
                variant="destructive" 
                className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
                onClick={handleRemoveAllHabits}
              >
                <Trash2 className="w-5 h-5 mr-2" />
                Remove All Habits
              </Button>
              <p className="text-xs text-red-600 dark:text-red-400 mt-3 text-center">
                This will permanently delete all habits, completions, and reminders from your device.
              </p>
            </div>
          </div>
        </SettingsSection>

        {/* Enhanced App Info */}
        <div className="mt-12 mb-8 text-center">
          <div className="relative overflow-hidden bg-gradient-to-br from-card to-card/50 border border-border rounded-2xl p-8">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10" />
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-primary/10 to-transparent rounded-full -translate-y-12 translate-x-12" />
            
            <div className="relative">
              <div className="w-20 h-20 flex items-center justify-center mx-auto mb-6 bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl shadow-lg">
                <img src="/icon-192.png" alt="Seventh Path Logo" className="w-16 h-16 object-contain" />
              </div>
              <h3 className="font-bold text-2xl mb-2 text-foreground">Seventh Path</h3>
              <p className="text-muted-foreground mb-4 text-lg">
                Journey of mindful habits
              </p>
              <div className="flex items-center justify-center gap-4 mb-6">
                <Badge variant="secondary" className="px-3 py-1">
                  <Heart className="w-3 h-3 mr-1" />
                  Made with Love
                </Badge>
                <Badge variant="outline" className="px-3 py-1">
                  <ShieldCheck className="w-3 h-3 mr-1" />
                  Privacy First
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Version {version} • Built for mindful living
              </p>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={showResetConfirm} onOpenChange={setShowResetConfirm}>
        <DialogContent className="max-w-md rounded-3xl border border-red-200 dark:border-red-900/40">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-red-600 dark:text-red-400">
              Are you sure?
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 text-sm text-muted-foreground">
            <p>This action will permanently delete all of your habits, progress, and statistics. This cannot be undone.</p>
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/40 rounded-2xl p-4 text-red-700 dark:text-red-300 text-xs">
              You’ll be returned to onboarding and must set everything up again.
            </div>
          </div>
          <div className="flex flex-col sm:flex-row sm:justify-end sm:gap-3 gap-2 pt-6">
            <Button variant="outline" onClick={() => setShowResetConfirm(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleConfirmReset} className="bg-red-600 hover:bg-red-700">
              Confirm Reset
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Import Result Dialog */}
      <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
        <DialogContent className="max-w-md rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              Import Results
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 text-sm">
            <pre className="whitespace-pre-wrap text-sm bg-muted/30 p-4 rounded-lg">
              {importResult}
            </pre>
          </div>
          <div className="flex justify-end pt-4">
            <Button onClick={() => setShowImportDialog(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* About Modal */}
      <Dialog open={aboutOpen} onOpenChange={setAboutOpen}>
        <DialogContent className="p-0 max-w-md w-[92vw] overflow-hidden">
          <div className="flex flex-col max-h-[85vh] bg-background">
            {/* Sticky Header */}
            <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-b border-border">
              <div className="px-5 pt-5 pb-3 text-center">
                <div className="mx-auto mb-4" style={{ width: 'min(100px, 28vw)' }}>
                  <img src="/icon-192.png" alt="Seventh Path Logo" className="w-full h-auto mx-auto" />
                </div>
                <DialogHeader>
                  <DialogTitle className="text-xl font-bold text-foreground">About Seventh Path</DialogTitle>
                </DialogHeader>
                <p className="text-lg text-muted-foreground font-medium mt-2">Mindful habits. Meaningful change.</p>
                <p className="text-sm text-muted-foreground mt-2">Version {version}</p>
              </div>
            </div>

            {/* Scrollable Body */}
            <div className="px-5 py-4 overflow-auto">
              <section className="mb-6">
                <h4 className="text-lg font-bold text-foreground mb-3">What is Seventh Path?</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Seventh Path is a mindful habit tracker that transforms small, consistent actions into lasting growth.
                  With clear reminders, streak tracking, and simple progress insights, it helps you focus—without clutter or distractions.
                </p>
              </section>

              <section className="mb-6">
                <h4 className="text-lg font-bold text-foreground mb-3">Key Features</h4>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold">→</span>
                    <span><strong>Track Progress</strong> → Daily & weekly habits with a clean completion flow.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold">→</span>
                    <span><strong>Smart Reminders</strong> → Set multiple custom times per habit (e.g., 08:00, 14:00, 21:00).</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold">→</span>
                    <span><strong>Streaks & Motivation</strong> → Build current streaks and celebrate your all-time best.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold">→</span>
                    <span><strong>Weekly Insights</strong> → At-a-glance view of 7-day progress & completion rates.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold">→</span>
                    <span><strong>Offline-First</strong> → Works without internet; your data stays on your device.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary font-bold">→</span>
                    <span><strong>Privacy-Friendly</strong> → No account required. No data selling.</span>
                  </li>
                </ul>
              </section>

              <section className="mb-6">
                <h4 className="text-lg font-bold text-foreground mb-3">How Reminders Work</h4>
                <div className="text-sm text-muted-foreground space-y-2">
                  <p>Set one or more times for each habit.</p>
                  <p>If you mark it done → That day's notification is cleared.</p>
                  <p>If not → The reminder still fires at its scheduled time, so you never miss it.</p>
                </div>
              </section>

              <section className="mb-6">
                <h4 className="text-lg font-bold text-foreground mb-3">Streaks & Completion</h4>
                <div className="text-sm text-muted-foreground space-y-2">
                  <p>A day counts as complete when all reminders for a habit are done.</p>
                  <p><strong>Current Streak</strong> → increases with each consecutive day.</p>
                  <p><strong>Best Streak</strong> → your longest run ever.</p>
                </div>
              </section>

              <section className="mb-6">
                <h4 className="text-lg font-bold text-foreground mb-3">Data & Privacy</h4>
                <div className="text-sm text-muted-foreground space-y-2">
                  <p>Habits stored locally with @capacitor/preferences.</p>
                  <p>Notifications via @capacitor/local-notifications (requires permission).</p>
                  <p>No accounts, no tracking, no sharing.</p>
                  <p>Resetting or uninstalling clears all local data.</p>
                </div>
              </section>

              <section className="mb-6">
                <h4 className="text-lg font-bold text-foreground mb-3">Permissions Used</h4>
                <div className="text-sm text-muted-foreground">
                  <p><strong>Notifications</strong> → To send habit reminders at your chosen times.</p>
                </div>
              </section>

              <section className="mb-6">
                <h4 className="text-lg font-bold text-foreground mb-3">Credits</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Seventh Path is designed and built by Pratik Prakash Brahmapurkar, blending mindful living with minimal, distraction-free design.
                </p>
              </section>

              <section className="mb-6">
                <h4 className="text-lg font-bold text-foreground mb-3">About the Author</h4>
                <div className="text-sm text-muted-foreground space-y-2">
                  <p>Pratik is a product strategist, developer, and yoga teacher passionate about creating calm, useful software.</p>
                  <p>Creator of Seventh Path.</p>
                  <p>
                    Connect: <button
                      onClick={() => openLink('https://misterpb.in')}
                      className="underline underline-offset-2 decoration-primary text-primary hover:opacity-90 font-medium"
                      aria-label="Open website misterpb.in"
                      role="link"
                    >
                      misterpb.in
                    </button> | Instagram{' '}
                    <button
                      onClick={() => openLink('https://instagram.com/mister.pb')}
                      className="underline underline-offset-2 decoration-primary text-primary hover:opacity-90 font-medium"
                      aria-label="Open Instagram profile @mister.pb"
                      role="link"
                    >
                      @mister.pb
                    </button>
                  </p>
                </div>
              </section>

              <section className="mb-6">
                <h4 className="text-lg font-bold text-foreground mb-3">Support & Feedback</h4>
                <div className="text-sm text-muted-foreground space-y-2">
                  <p>Questions or suggestions?</p>
                  <p>
                    📧 Email: <button
                      onClick={() => openLink('mailto:pbrahmapurkar@gmail.com')}
                      className="underline underline-offset-2 decoration-primary text-primary hover:opacity-90 font-medium"
                      aria-label="Email support at pbrahmapurkar@gmail.com"
                      role="link"
                    >
                      pbrahmapurkar@gmail.com
                    </button>
                  </p>
                  <p>
                    🌐 Website: <button
                      onClick={() => openLink('https://misterpb.in')}
                      className="underline underline-offset-2 decoration-primary text-primary hover:opacity-90 font-medium"
                      aria-label="Open misterpb.in website"
                      role="link"
                    >
                      misterpb.in
                    </button>
                  </p>
                </div>
              </section>

              
            </div>

            {/* Sticky Footer */}
            <div className="sticky bottom-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-t border-border px-4 py-3 flex items-center justify-between">
              <Button variant="ghost" onClick={() => {/* placeholder for Licenses route */}} aria-label="Open licenses">
                Licenses
              </Button>
              <Button onClick={() => setAboutOpen(false)} aria-label="Close About">
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Toast Notifications */}
      <ToastContainer toasts={toast.toasts} onClose={toast.closeToast} />
    </div>
  );
}
