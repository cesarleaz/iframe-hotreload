<div align="center"><a name="readme-top"></a>

# 🚀 Iframe Hot-Reload System  
### Lightweight, sandbox-free dev preview environment — powered by [Hono](https://hono.dev/)

![License: MIT](https://img.shields.io/badge/license-MIT-green.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18-blue)
![Deploy on Render](https://img.shields.io/badge/deploy-Render.com-purple)

</div>

> **A minimal and self-contained system for local preview environments.**  
> Each app gets a unique subdomain URL, automatic hot reload, and live console capture — all without containers or sandboxes.

---

## ✨ Why This Exists

Modern online IDEs (like Sandpack, Lovable.dev, or Replit) are powerful but **complex and heavy**.  
This system offers a **lightweight alternative** — built on Hono and standard Node.js — ideal for:
- Local development previews  
- Multi-app testing  
- AI coding agents that need ephemeral preview URLs  

It’s not a sandbox. It’s a **controlled iframe + proxy system** for dev previews.

> \[!IMPORTANT]
>
> **Star Us**, You will receive all release notifications from GitHub without any delay \~ ⭐️

---

## 🧩 Features

- 🌀 **Subdomain-based routing** → `my-app.localhost:9100`
- 🔥 **Instant hot reload** → Detects app reloads and updates iframes automatically
- 🪄 **Console capture** → See your app’s `console.log()` output in the parent frame
- 🔗 **WebSocket proxying** → Works seamlessly with Vite HMR
- 🧱 **Multi-app management** → Run multiple isolated apps at once
- 🧰 **100% standalone** → No Docker, no VMs, no external dependencies

> [!IMPORTANT]  
> This is **not** a sandbox. It’s meant for controlled dev previews (safe environments, trusted code).

---

## ⚡ Quick Start

```bash
# Install dependencies
npm install

# Start the server
npm run dev
````

Server starts at `http://localhost:9100`

---

### 🏗️ Creating an App

```bash
mkdir apps/my-first-app
cd apps/my-first-app
npm init -y
```

Add an app (HTML or Vite):

```bash
# Simple HTML
echo '<h1>Hello World</h1>' > index.html
npx serve -p 9200

# or Vite app
npm create vite@latest . -- --template vanilla
npm install
npm run dev -- --port 9200
```

Now open:
➡️ `http://my-first-app.localhost:9100`

---

## 🧠 Architecture Overview

```
┌────────────────────────────────────────────┐
│ Hono Main Server (Port 9100)               │
│  - Subdomain routing                       │
│  - Proxy to app runtimes                   │
│  - Shim injection + console bridge         │
└──────────────────┬─────────────────────────┘
                   │
         ┌─────────┴──────────┐
         │                    │
┌────────▼────────┐   ┌───────▼────────┐
│ App Runtime     │   │ App Runtime    │
│ Port 9200       │   │ Port 9201      │
│ my-first-app    │   │ another-app    │
└─────────────────┘   └────────────────┘
```

---

## 🪞 Shim Script

Automatically injected into every HTML response:

* Captures console logs
* Sends them to the parent window (`postMessage`)
* Detects reloads and signals iframe refresh
* Manages iframe navigation (back/forward/reload)

---

## 🔁 Hot Reload Lifecycle

1. App triggers reload (e.g. Vite HMR)
2. Shim detects `beforeunload`
3. Sends `"will-reload"` message to parent
4. Parent clears console logs + reloads iframe

---

## ⚙️ Configuration

`.env` example:

```env
PORT=9100
RUNTIME_BASE_PORT=9200
NODE_ENV=development
```

`src/server/constants.js` (custom domains):

```js
export const DOMAINS = ['yourdomain.com', 'localhost']
```

---

## ☁️ Deployment on Render.com

Simple and free-tier friendly.

1. Push your repo to GitHub
2. Create a **Web Service** on Render
3. Build Command → `npm install`
4. Start Command → `npm start`
5. Add environment variables
6. Deploy 🎉

> Detailed steps in [`docs/render-deployment.md`](./docs/render-deployment.md)

---

## 🧪 Testing

```bash
npm test
```

Covers:

* Subdomain URL generation
* Proxy routing
* Shim injection
* Console message flow

---

## 🤝 Contributing

Contributions are very welcome!

If you want to:

* Improve stability or add tests
* Enhance iframe–proxy communication
* Add integrations (e.g. R2, Cloudflare Workers)

Then feel free to:

1. Fork this repository
2. Create a new branch (`feat/your-feature`)
3. Open a pull request

> Before submitting a PR, make sure all tests pass:
> `npm test`

---

## 📜 License

[MIT](./LICENSE) © 2025 [César G. Leañez](https://github.com/cesarleaz)

---

**Iframe Hot-Reload System** —
*A minimal preview layer built with [Hono](https://hono.dev/) for the next generation of AI coding agents.*
