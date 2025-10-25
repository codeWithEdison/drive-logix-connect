@echo off
REM Set JAVA_HOME to the correct JDK installation
set JAVA_HOME=C:\Program Files\Java\jdk-24
set PATH=%JAVA_HOME%\bin;%PATH%

REM Verify Java is working
echo JAVA_HOME is set to: %JAVA_HOME%
java -version

REM Run the Android app
npx cap run android --target="Pixel_6_Pro_API_Baklava"
