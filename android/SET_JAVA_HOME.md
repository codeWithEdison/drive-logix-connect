# How to Set JAVA_HOME to Java 21 on Windows

## Method 1: Using Windows GUI (Recommended)

1. **Open System Properties:**
   - Press `Win + R` to open Run dialog
   - Type `sysdm.cpl` and press Enter
   - OR: Right-click "This PC" → Properties → Advanced system settings

2. **Open Environment Variables:**
   - Click "Environment Variables" button

3. **Edit JAVA_HOME:**
   - Under "User variables" or "System variables", find `JAVA_HOME`
   - If it exists, select it and click "Edit"
   - If it doesn't exist, click "New"
   - Set the Variable name: `JAVA_HOME`
   - Set the Variable value: `C:\Program Files\Eclipse Adoptium\jdk-21.0.9.10-hotspot`
   - Click "OK"

4. **Update PATH (if needed):**
   - Find `Path` variable in the same list
   - Make sure it includes: `%JAVA_HOME%\bin`
   - If not, add it

5. **Apply Changes:**
   - Click "OK" on all dialogs
   - **Restart Android Studio** and any terminal windows

## Method 2: Using Command Line (Temporary - Current Session Only)

```cmd
set JAVA_HOME=C:\Program Files\Eclipse Adoptium\jdk-21.0.9.10-hotspot
set PATH=%JAVA_HOME%\bin;%PATH%
```

## Method 3: Using PowerShell (Permanent - Current User)

Run PowerShell as Administrator and execute:

```powershell
[System.Environment]::SetEnvironmentVariable('JAVA_HOME', 'C:\Program Files\Eclipse Adoptium\jdk-21.0.9.10-hotspot', 'User')
```

Then restart your terminal/Android Studio.

## Verify the Change

After setting JAVA_HOME, verify it's correct:

```cmd
echo %JAVA_HOME%
java -version
```

You should see:
- JAVA_HOME pointing to Java 21
- Java version showing 21.x.x

## For Android Studio

After setting JAVA_HOME:
1. Close Android Studio completely
2. Reopen Android Studio
3. Go to: File → Project Structure → SDK Location
4. Verify "JDK location" points to Java 21
5. If not, click the folder icon and browse to: `C:\Program Files\Eclipse Adoptium\jdk-21.0.9.10-hotspot`

## Quick Fix Script

Save this as `set-java21.bat` and run it as Administrator:

```batch
@echo off
setx JAVA_HOME "C:\Program Files\Eclipse Adoptium\jdk-21.0.9.10-hotspot" /M
echo JAVA_HOME set to Java 21
echo Please restart Android Studio and terminal windows
pause
```






