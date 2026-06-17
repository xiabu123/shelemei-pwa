# 安卓手机试玩指南

## 局域网开发预览

适合先在自己的安卓手机上玩起来。

1. 确保电脑和安卓手机连在同一个 Wi-Fi。
2. 在电脑上进入项目目录：

   ```bash
   cd /Users/xiabu/Documents/小测试/shelemei-pwa
   npm run dev:lan -- --port 5173
   ```

3. 在安卓手机 Chrome 打开：

   ```text
   http://10.105.208.20:5173/
   ```

如果手机打不开：

- 确认手机和电脑在同一个网络。
- 关闭或放行 macOS 防火墙对 Node/Vite 的拦截。
- 如果电脑 IP 变化，重新运行 `ifconfig`，找到 `en0` 下的 `inet` 地址。
- 公司/校园 Wi-Fi 可能隔离设备，可以改用手机热点让电脑连接手机热点。

## 更接近正式体验的本地预览

先构建，再用静态预览服务：

```bash
npm run build
npm run preview:lan -- --port 4173
```

手机打开：

```text
http://10.105.208.20:4173/
```

## 关于安装到桌面

安卓 Chrome 的完整 PWA 安装和离线缓存通常需要 HTTPS。局域网 `http://10.x.x.x` 可以先试玩，但不一定能获得完整安装体验。

后续如果想像真正 App 一样安装到桌面，建议部署到 HTTPS 平台，例如 Vercel、Netlify、Cloudflare Pages，或自己的 HTTPS 域名。
