# Add project specific ProGuard rules here.
# You can control the set of applied configuration files using the
# proguardFiles setting in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# Capacitor specific rules
-keep class com.capacitorjs.** { *; }
-keep class com.getcapacitor.** { *; }
-keep class com.getcapacitorjs.** { *; }

# Keep native methods
-keepclasseswithmembernames class * {
    native <methods>;
}

# Keep JavaScript interface methods
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}

# Keep WebView related classes
-keep class android.webkit.** { *; }

# Keep Capacitor plugins
-keep class com.capacitorjs.plugins.** { *; }

# Keep notification related classes
-keep class androidx.core.app.NotificationCompat { *; }
-keep class androidx.core.app.NotificationManagerCompat { *; }

# Keep Capacitor core classes
-keep class com.getcapacitor.Bridge { *; }
-keep class com.getcapacitor.Plugin { *; }
-keep class com.getcapacitor.PluginCall { *; }
-keep class com.getcapacitor.PluginResult { *; }

# Obfuscation settings
-optimizations !code/simplification/arithmetic,!code/simplification/cast,!field/*,!class/merging/*
-optimizationpasses 5
-allowaccessmodification
-dontpreverify

# Rename source file attribute
-renamesourcefileattribute SourceFile

# Keep line numbers for debugging (optional)
-keepattributes SourceFile,LineNumberTable

# Remove logging
-assumenosideeffects class android.util.Log {
    public static boolean isLoggable(java.lang.String, int);
    public static int v(...);
    public static int i(...);
    public static int w(...);
    public static int d(...);
    public static int e(...);
}
