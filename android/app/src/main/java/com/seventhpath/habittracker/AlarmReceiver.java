package com.seventhpath.habittracker;

import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.graphics.Color;
import android.os.Build;

import androidx.core.app.NotificationCompat;

public class AlarmReceiver extends BroadcastReceiver {
    public static final String CHANNEL_ID = "habits";

    @Override
    public void onReceive(Context context, Intent intent) {
        String title = intent.getStringExtra("title");
        String body = intent.getStringExtra("body");
        String habitId = intent.getStringExtra("habitId");
        String mode = intent.getStringExtra("mode");
        int hour = intent.getIntExtra("hour", -1);
        int minute = intent.getIntExtra("minute", -1);
        int dow = intent.getIntExtra("dow", -1);

        NotificationManager nm = (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel channel = new NotificationChannel(CHANNEL_ID, "Habit Reminders", NotificationManager.IMPORTANCE_HIGH);
            channel.enableLights(true);
            channel.setLightColor(Color.BLUE);
            channel.enableVibration(true);
            nm.createNotificationChannel(channel);
        }

        NotificationCompat.Builder builder = new NotificationCompat.Builder(context, CHANNEL_ID)
                .setContentTitle(title)
                .setContentText(body)
                .setSmallIcon(android.R.drawable.ic_lock_idle_alarm)
                .setPriority(NotificationCompat.PRIORITY_HIGH)
                .setAutoCancel(true);

        int notificationId = (habitId != null ? habitId.hashCode() : (int) System.currentTimeMillis());
        nm.notify(notificationId, builder.build());

        // Reschedule next occurrence for exact behavior
        if (mode != null && hour >= 0 && minute >= 0) {
            if ("daily".equals(mode)) {
                AlarmScheduler.scheduleDaily(context, habitId, title, body, hour, minute);
            } else if ("weekly".equals(mode) && dow >= 0) {
                AlarmScheduler.scheduleWeekly(context, habitId, title, body, hour, minute, new int[]{dow});
            }
        }
    }
}
