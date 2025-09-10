package com.seventhpath.habittracker;

import android.app.AlarmManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Build;

import java.util.ArrayList;
import java.util.Calendar;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

public class AlarmScheduler {
    private static final String PREFS = "habit_alarms";

    private static PendingIntent buildPendingIntent(Context context, String habitId, String title, String body, int requestCode) {
        Intent intent = new Intent(context, AlarmReceiver.class);
        intent.putExtra("habitId", habitId);
        intent.putExtra("title", title);
        intent.putExtra("body", body);
        return PendingIntent.getBroadcast(
                context,
                requestCode,
                intent,
                PendingIntent.FLAG_UPDATE_CURRENT | (Build.VERSION.SDK_INT >= 23 ? PendingIntent.FLAG_IMMUTABLE : 0)
        );
    }

    private static void setExact(AlarmManager am, long triggerAtMillis, PendingIntent pi) {
        if (Build.VERSION.SDK_INT >= 23) {
            am.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, triggerAtMillis, pi);
        } else {
            am.setExact(AlarmManager.RTC_WAKEUP, triggerAtMillis, pi);
        }
    }

    public static List<Integer> scheduleDaily(Context context, String habitId, String title, String body, int hour, int minute) {
        AlarmManager am = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
        Calendar cal = Calendar.getInstance();
        cal.set(Calendar.SECOND, 0);
        cal.set(Calendar.MILLISECOND, 0);
        cal.set(Calendar.HOUR_OF_DAY, hour);
        cal.set(Calendar.MINUTE, minute);
        if (cal.getTimeInMillis() <= System.currentTimeMillis()) {
            cal.add(Calendar.DATE, 1);
        }
        int req = (habitId + "_daily").hashCode();
        PendingIntent pi = buildPendingIntent(context, habitId, title, body, req);
        // Add recurrence extras
        Intent i = new Intent(context, AlarmReceiver.class);
        i.putExtra("habitId", habitId);
        i.putExtra("title", title);
        i.putExtra("body", body);
        i.putExtra("mode", "daily");
        i.putExtra("hour", hour);
        i.putExtra("minute", minute);
        pi = PendingIntent.getBroadcast(context, req, i, PendingIntent.FLAG_UPDATE_CURRENT | (Build.VERSION.SDK_INT >= 23 ? PendingIntent.FLAG_IMMUTABLE : 0));
        setExact(am, cal.getTimeInMillis(), pi);
        saveRequests(context, habitId, new int[]{req}, "daily:" + hour + ":" + minute);
        return List.of(req);
    }

    public static List<Integer> scheduleWeekly(Context context, String habitId, String title, String body, int hour, int minute, int[] weekdays) {
        AlarmManager am = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
        List<Integer> reqs = new ArrayList<>();
        for (int dow : weekdays) {
            Calendar cal = Calendar.getInstance();
            cal.set(Calendar.SECOND, 0);
            cal.set(Calendar.MILLISECOND, 0);
            cal.set(Calendar.HOUR_OF_DAY, hour);
            cal.set(Calendar.MINUTE, minute);
            int today = cal.get(Calendar.DAY_OF_WEEK) - 1; // 0-6
            int add = (dow - today + 7) % 7;
            cal.add(Calendar.DATE, add);
            if (cal.getTimeInMillis() <= System.currentTimeMillis()) {
                cal.add(Calendar.DATE, 7);
            }
            int req = (habitId + "_weekly_" + dow).hashCode();
            PendingIntent pi = buildPendingIntent(context, habitId, title, body, req);
            Intent i = new Intent(context, AlarmReceiver.class);
            i.putExtra("habitId", habitId);
            i.putExtra("title", title);
            i.putExtra("body", body);
            i.putExtra("mode", "weekly");
            i.putExtra("hour", hour);
            i.putExtra("minute", minute);
            i.putExtra("dow", dow);
            pi = PendingIntent.getBroadcast(context, req, i, PendingIntent.FLAG_UPDATE_CURRENT | (Build.VERSION.SDK_INT >= 23 ? PendingIntent.FLAG_IMMUTABLE : 0));
            setExact(am, cal.getTimeInMillis(), pi);
            reqs.add(req);
        }
        // store weekdays list in meta
        StringBuilder sb = new StringBuilder();
        sb.append("weekly:").append(hour).append(":").append(minute).append(":");
        for (int i = 0; i < weekdays.length; i++) {
            sb.append(weekdays[i]);
            if (i < weekdays.length - 1) sb.append(",");
        }
        saveRequests(context, habitId, reqs.stream().mapToInt(i->i).toArray(), sb.toString());
        return reqs;
    }

    public static void cancelHabit(Context context, String habitId) {
        AlarmManager am = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
        SharedPreferences sp = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE);
        Set<String> set = sp.getStringSet(habitId, null);
        if (set == null) return;
        for (String s : set) {
            try {
                int req = Integer.parseInt(s);
                PendingIntent pi = buildPendingIntent(context, habitId, "", "", req);
                am.cancel(pi);
            } catch (Exception ignored) {}
        }
        sp.edit().remove(habitId).apply();
        sp.edit().remove(habitId + "_meta").apply();
    }

    public static void cancelAll(Context context) {
        SharedPreferences sp = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE);
        Set<String> keys = sp.getAll().keySet();
        List<String> habitKeys = new ArrayList<>();
        for (String k : keys) {
            if (!k.endsWith("_meta")) habitKeys.add(k);
        }
        for (String habitId : habitKeys) {
            cancelHabit(context, habitId);
        }
    }

    public static void rescheduleAll(Context context) {
        SharedPreferences sp = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE);
        Set<String> keys = sp.getAll().keySet();
        for (String habitId : keys) {
            if (habitId.endsWith("_meta")) continue;
            String meta = sp.getString(habitId + "_meta", null);
            if (meta == null) continue;
            String[] parts = meta.split(":");
            if (parts.length < 3) continue;
            String mode = parts[0];
            int hour = Integer.parseInt(parts[1]);
            int minute = Integer.parseInt(parts[2]);
            if ("daily".equals(mode)) {
                scheduleDaily(context, habitId, "Habit Reminder", "Time to complete your habit!", hour, minute);
            } else if ("weekly".equals(mode)) {
                int[] dowsParsed = new int[]{0,1,2,3,4,5,6};
                if (parts.length >= 4) {
                    String[] ds = parts[3].split(",");
                    dowsParsed = new int[ds.length];
                    for (int i = 0; i < ds.length; i++) {
                        try { dowsParsed[i] = Integer.parseInt(ds[i]); } catch (Exception ignored) {}
                    }
                }
                scheduleWeekly(context, habitId, "Habit Reminder", "Time to complete your habit!", hour, minute, dowsParsed);
            }
        }
    }

    private static void saveRequests(Context context, String habitId, int[] reqs, String meta) {
        SharedPreferences sp = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE);
        Set<String> set = new HashSet<>();
        for (int r : reqs) set.add(Integer.toString(r));
        sp.edit().putStringSet(habitId, set).apply();
        sp.edit().putString(habitId + "_meta", meta).apply();
    }
}
