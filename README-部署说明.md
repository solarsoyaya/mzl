# 部署说明

## 问题描述
直接双击 `dist/index.html` 文件时，浏览器会显示 CORS 错误，这是因为现代浏览器出于安全考虑，不允许本地文件直接加载其他本地资源。

## 解决方案

### 方案一：使用本地服务器（推荐）
1. 构建项目：
   ```bash
   pnpm run build
   ```

2. 启动本地服务器：
   ```bash
   pnpm run serve
   ```
   或者直接运行：
   ```bash
   node serve-local.js
   ```

3. 在浏览器中访问：`http://localhost:8080`

### 方案二：使用 Vite 预览服务器
1. 构建项目：
   ```bash
   pnpm run build
   ```

2. 启动预览服务器：
   ```bash
   pnpm run preview
   ```

### 方案三：部署到 Web 服务器
将 `dist` 文件夹中的所有文件上传到任何 Web 服务器（如 Nginx、Apache、或云服务）即可正常访问。

## 配置说明
- `vite.config.js` 中的 `base: './'` 确保所有资源使用相对路径
- 构建配置确保生成的文件可以在任何路径下正常工作
- `serve-local.js` 提供了一个简单的本地 HTTP 服务器

## 注意事项
- 不要直接双击 `dist/index.html` 文件，这会导致 CORS 错误
- 始终通过 HTTP 服务器访问应用
- 如需修改本地服务器端口，请编辑 `serve-local.js` 文件中的 `port` 变量