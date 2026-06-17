# v0.01bata 安装说明

## macOS pkg

双击 `v0.01bata.pkg` 后，安装器会把当前版本文件安装到：

```text
/Users/Shared/shelemei-v0.01bata
```

这个 pkg 不是 macOS App，只是版本归档包。

## Android APK

安装包内的 Android APK 路径：

```text
/Users/Shared/shelemei-v0.01bata/android/shelemei-v0.01bata-debug.apk
```

把 APK 发送到安卓手机，允许“安装未知来源应用”后安装。

## Web 静态产物

安装包内的 Web 构建产物路径：

```text
/Users/Shared/shelemei-v0.01bata/web-dist
```

它是 Vite build 输出，可以由静态服务器托管。直接双击 `index.html` 在某些浏览器环境下可能无法完整模拟 PWA/Service Worker 行为。
