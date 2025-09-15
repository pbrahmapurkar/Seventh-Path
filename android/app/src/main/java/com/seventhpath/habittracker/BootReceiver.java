package com.seventhpath.habittracker;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.util.Log;
import org.json.JSONArray;
import org.json.JSONObject;

public class BootReceiver extends BroadcastReceiver {
    @Override
    public void onReceive(Context context, Intent intent) {
        // Reschedule any alarms managed by the legacy AlarmScheduler
        try {
            AlarmScheduler.rescheduleAll(context);
        } catch (Exception e) {
            Log.w("BootReceiver", "AlarmScheduler rescheduleAll failed", e);
        }

        // Best-effort: rebuild reminders for the next occurrences by reading Capacitor Preferences
        // Preferences are stored in SharedPreferences named "CapacitorStorage"
        try {
            SharedPreferences sp = context.getSharedPreferences("CapacitorStorage", Context.MODE_PRIVATE);
            for (String key : sp.getAll().keySet()) {
                if (key == null) continue;
                if (!key.startsWith("habit:")) continue;
                if (key.contains(":day:")) continue; // skip per-day entries
                String json = sp.getString(key, null);
                if (json == null) continue;
                try {
                    JSONObject obj = new JSONObject(json);
                    String habitId = obj.optString("id", null);
                    String name = obj.optString("name", "Habit");
                    String emoji = obj.optString("emoji", "");
                    JSONArray times = obj.optJSONArray("reminderTimes");
                    String title = (emoji != null ? emoji + " " : "") + name;
                    if (habitId != null && times != null) {
                        for (int i = 0; i < times.length(); i++) {
                            String t = times.optString(i, null);
                            if (t == null) continue;
                            String[] hm = t.split(":");
                            if (hm.length != 2) continue;
                            int h = Integer.parseInt(hm[0]);
                            int m = Integer.parseInt(hm[1]);
                            // Use AlarmScheduler to set an exact daily alarm; AlarmReceiver will post the notification
                            AlarmScheduler.scheduleDaily(context, habitId, title, "Time to complete your habit!", h, m);
                        }
                    }
                } catch (Exception ignored) {}
            }
        } catch (Exception e) {
            Log.w("BootReceiver", "CapacitorStorage reschedule failed", e);
        }
    }
}
