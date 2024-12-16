# Workout App

## Get started

1. Install dependencies
```bash
npm install
```

2. Start the app
```bash
npx expo start
```

## Make a Preview build
1. Make sure Java 17 is being used
```bash
sudo update-alternatives --config java
```

2. Set JAVA_HOME PATH and build
```bash
export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-17.0.13.0.11-3.fc41.x86_64
eas build --local -p android --profile preview
```

3. Send the apk file to the device plugged in via USB
```bash
adb install /home/juanix/Dev/Personal/workout-app/{apk file}
```

## Rebuild the app
```bash
eas build --local -p android --profile preview
adb install -r /path/to/your/{new apk file}
```
The -r flag will replace the existing app while preserving data.

One important note: The app will keep the same version number unless it is updated in `app.json`. If you want to be
able to install the new version over the old one, increment either:
- `version` - for major updates (e.g., "1.0.0" to "1.1.0")
- `android.versionCode` - for minor updates
