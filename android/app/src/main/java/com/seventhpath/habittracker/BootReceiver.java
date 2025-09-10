package com.seventhpath.habittracker;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;

public class BootReceiver extends BroadcastReceiver {
    @Override
    public void onReceive(Context context, Intent intent) {
        // Reschedule alarms after device reboot or app update
        AlarmScheduler.rescheduleAll(context);
    }
}

