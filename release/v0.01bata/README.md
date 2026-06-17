# 射了没 v0.01bata Release

这是“射了没”的 v0.01bata 打包版本。

## 包名

```text
v0.01bata.pkg
```

## 包用途

这个 `.pkg` 是 macOS 安装包，用于归档当前版本的可试玩产物和文档。安装后会把文件放到：

```text
/Users/Shared/shelemei-v0.01bata
```

包内包含：

- `product-doc.md`：v0.01bata 产品文档。
- `web-dist/`：当前 PWA 静态构建产物。
- `android/shelemei-v0.01bata-debug.apk`：当前 Android debug APK。
- `install-notes.md`：安装和使用说明。
- `manifest.json`：版本元数据。

## 手机试玩

把 `android/shelemei-v0.01bata-debug.apk` 发到安卓手机安装即可。第一次安装需要允许“安装未知来源应用”。

## 注意

- 当前 APK 是 debug 包，不是正式签名 release。
- 当前数据默认本地保存，不做云同步。
- 真实 AI API 尚未接入，当前 AI 为本地 mock provider。
