# Java 21 Configuration

This project requires Java 21 to build. If you're getting "invalid source release: 21" errors, follow these steps:

## Option 1: Update JAVA_HOME (Recommended)

1. Install Java 21 if you haven't already
2. Set JAVA_HOME to point to Java 21:
   - Windows: Set environment variable `JAVA_HOME` to your Java 21 installation path (e.g., `C:\Program Files\Java\jdk-21`)
   - Or in Android Studio: File → Project Structure → SDK Location → JDK location → Set to Java 21

## Option 2: Let Gradle Auto-Download Java 21

Gradle is configured to automatically download Java 21 if it's not found. The first build might take longer as it downloads Java 21.

Make sure `org.gradle.java.installations.auto-download=true` is set in `gradle.properties` (it already is).

## Verify Java Version

Run this command to check what Java version Gradle is using:
```bash
cd android
./gradlew --version
```

The output should show Java 21.




