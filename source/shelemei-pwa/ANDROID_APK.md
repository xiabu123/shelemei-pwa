# 安卓 APK 打包说明

当前项目已经用 Capacitor 封装为 Android 工程，包名：

```text
com.xiabu.shelemei
```

## 当前 APK

已经生成 debug APK：

```text
/Users/xiabu/Documents/小测试/shelemei-pwa/android/app/build/outputs/apk/debug/app-debug.apk
```

把这个 APK 发到安卓手机上安装即可。第一次安装需要在手机里允许“安装未知来源应用”。

## 本机打包前置条件

这台 Mac 已安装：

- OpenJDK via Homebrew。
- Android command line tools。
- Android SDK Platform、Build Tools、Platform Tools。

## 重新打包

```bash
cd /Users/xiabu/Documents/小测试/shelemei-pwa
npm run android:build:debug
```

## 分步命令

同步 Web 资源到 Android：

```bash
npm run android:sync
```

生成 debug APK：

```bash
cd /Users/xiabu/Documents/小测试/shelemei-pwa/android
JAVA_HOME=/opt/homebrew/opt/openjdk/libexec/openjdk.jdk/Contents/Home ANDROID_HOME=$HOME/Library/Android/sdk ./gradlew assembleDebug
```
