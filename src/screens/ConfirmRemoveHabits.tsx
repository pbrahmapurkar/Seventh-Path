import { useState } from 'react';
import { useAppShell } from '../components/AppShell';
import { useNotifications } from '../providers/notificationProvider';
import { useHabitsStore } from '../store/HabitsStore';
import { Modal } from '../components/ui/Modal';

export function ConfirmRemoveHabits() {
  const { navigate } = useAppShell();
  const { clearAllHabits } = useHabitsStore();
  const { cancelAllReminders } = useNotifications();
  const [open, setOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const handleClose = () => {
    setOpen(false);
    // Wait for animation
    setTimeout(() => navigate('/settings'), 300);
  };

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      await clearAllHabits();
      await cancelAllReminders();
      try { alert('All habits removed successfully ✅'); } catch { }
      navigate('/home');
    } catch (e) {
      // Fallback: navigate back to settings on error
      navigate('/settings');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Modal
        isOpen={open}
        onClose={handleClose}
        title="Delete All Habits"
        description="This will permanently delete all your habits, completion history, and reminders. This action cannot be undone."
        type="destructive"
        primaryAction={{
          label: 'Delete Everything',
          onClick: handleConfirm,
          isLoading
        }}
        secondaryAction={{
          label: 'Cancel',
          onClick: handleClose
        }}
      />
    </div>
  );
}
