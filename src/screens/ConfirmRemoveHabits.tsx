import React, { useEffect, useState } from 'react';
import { useAppShell } from '../components/AppShell';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../components/ui/alert-dialog';
import { useNotifications } from '../providers/notificationProvider';
import { useHabitsStore } from '../store/HabitsStore';

export function ConfirmRemoveHabits() {
  const { navigate } = useAppShell();
  const { clearAllHabits } = useHabitsStore();
  const { cancelAllReminders } = useNotifications();
  const [open, setOpen] = useState(true);

  useEffect(() => {
    if (!open) {
      // If dialog is dismissed via outside click or Esc, go back to settings
      navigate('/settings');
    }
  }, [open, navigate]);

  const handleConfirm = async () => {
    try {
      await clearAllHabits();
      await cancelAllReminders();
      try { alert('All habits removed successfully ✅'); } catch {}
      navigate('/home');
    } catch (e) {
      // Fallback: navigate back to settings on error
      navigate('/settings');
    }
  };

  const handleCancel = () => {
    navigate('/settings');
  };

  return (
    <div className="min-h-screen bg-background">
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove All Habits</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to permanently delete all habits, completions, and reminders?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancel}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
