@echo off
REM Set JAVA_HOME to Java 24 (your installed version)
set JAVA_HOME=C:\Program Files\Java\jdk-24
set PATH=%JAVA_HOME%\bin;%PATH%

REM Verify Java is working
echo JAVA_HOME is set to: %JAVA_HOME%
java -version

REM Run the Android app on Pixel 8a API 35 with Java compatibility flags
set GRADLE_OPTS=--add-opens=java.base/java.lang=ALL-UNNAMED --add-opens=java.base/java.util=ALL-UNNAMED --add-opens=java.base/java.lang.reflect=ALL-UNNAMED --add-opens=java.base/java.text=ALL-UNNAMED --add-opens=java.desktop/java.awt.font=ALL-UNNAMED
npx cap run android --target="Pixel_8a_API_35"
