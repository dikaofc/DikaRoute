# 🚀 DikaRoute

<p align="center">
  <b>Unified AI Gateway & Intelligent Model Router</b><br>
  Connect multiple AI providers through one OpenAI-compatible API.
</p>

<p align="center">

![DikaRoute](https://img.shields.io/badge/DikaRoute-AI%20Gateway-red)
![npm version](https://img.shields.io/npm/v/dikaroute)
![npm downloads](https://img.shields.io/npm/dm/dikaroute)
![Node.js](https://img.shields.io/badge/Node.js-Runtime-green)
![OpenAI Compatible](https://img.shields.io/badge/API-OpenAI%20Compatible-blue)
![License](https://img.shields.io/badge/license-MIT-purple)

</p>

---

## 🌐 Overview

**DikaRoute** is a lightweight, high-performance AI routing gateway designed to unify multiple Large Language Model providers into a single API interface.

Instead of managing multiple endpoints, API keys, SDK differences, rate limits, and provider failures separately, DikaRoute provides one centralized gateway that handles:

- Multi-provider AI routing
- Automatic fallback system
- Model selection strategy
- Context optimization
- Response compression
- Provider health monitoring
- Usage analytics
- OpenAI-compatible API access

The goal is simple:

> One endpoint. Multiple AI providers. Maximum reliability.

---

# ✨ Features

## 🔀 Intelligent AI Routing

DikaRoute automatically routes requests between connected providers based on your configuration.

Supported routing strategies:

- Priority routing
- Round robin routing
- Automatic fallback
- Provider health checking
- Model-based routing
- Custom routing rules


Example:

```
Application
     |
     |
     v

DikaRoute Gateway
     |
     +---- OpenAI
     |
     +---- Anthropic
     |
     +---- Google Gemini
     |
     +---- Ollama
     |
     +---- Custom Providers
```

---

# 🛡 Automatic Fallback

AI providers can fail.

Rate limits happen.
Servers go down.
API credits disappear into the void.

DikaRoute automatically switches to another available provider.

Example:

```
Request
 |
 v
Primary Provider
 |
 Failed?
 |
 v
Backup Provider
 |
 v
Response
```

No application changes required.

---

# ⚡ Performance Focused

DikaRoute is designed with low latency and stability in mind.

Optimizations include:

- Minimal proxy overhead
- Efficient request forwarding
- Response compression
- Context optimization
- Provider connection reuse
- Lightweight architecture


---

# 🧠 Context & Response Compression

Long AI conversations consume tokens quickly.

DikaRoute provides intelligent context handling to reduce unnecessary payload size while maintaining useful information.

Benefits:

- Lower token usage
- Faster responses
- Reduced API costs
- Better long-session performance


---

# 🔌 OpenAI Compatible API

DikaRoute provides an OpenAI-style endpoint.

Any application supporting OpenAI API format can connect without major changes.

Example:

```bash
curl http://localhost:20128/v1/chat/completions \
-H "Authorization: Bearer YOUR_KEY" \
-H "Content-Type: application/json" \
-d '{
  "model": "auto",
  "messages": [
    {
      "role": "user",
      "content": "Hello AI"
    }
  ]
}'
```

---

# 📦 Supported Provider Architecture

DikaRoute uses a flexible provider system.

Example providers:

```
providers/
 ├── OpenAI
 ├── Anthropic
 ├── Gemini
 ├── Ollama
 ├── OpenAI Compatible APIs
 └── Custom Providers
```

Adding new providers does not require rewriting the entire system.

---

# 📊 Dashboard & Monitoring

DikaRoute includes management tools for monitoring your AI infrastructure.

Dashboard capabilities:

- Provider status
- Request statistics
- Token usage
- Latency monitoring
- Error tracking
- Configuration management


---

# 🏗 Architecture

```
                 User Applications

        Claude Code
        Cursor
        Custom Apps
        AI Agents

                 |
                 |

          OpenAI Compatible API

                 |

             DikaRoute

        ┌────────┼────────┐
        |        |        |
     Router   Cache   Monitor

        |
        |

 AI Providers

 OpenAI
 Anthropic
 Gemini
 Ollama
 Custom APIs

```

---

# 📦 Releases & Changelog

Current version: **3.8.54**

- 📝 [CHANGELOG.md](./CHANGELOG.md) — detailed release notes (also rendered inside the dashboard)
- 🏷️ [GitHub Releases](https://github.com/dikaofc/DikaRoute/releases)
- 📦 [npm — dikaroute](https://www.npmjs.com/package/dikaroute)

---

# 🚀 Installation

## NPM

```bash
npm install -g dikaroute
```

Install always fetches the latest published version (`dikaroute@3.8.54`).
To update an existing installation:

```bash
dikaroute update
```

Run:

```bash
dikaroute
```

---

## From Source

```bash
git clone https://github.com/dikaofc/DikaRoute.git

cd DikaRoute

npm install

npm run start
```

---

# ⚙ Configuration

Example configuration:

```json
{
  "providers": {
    "openai": {
      "enabled": true,
      "apiKey": "your-key"
    },

    "ollama": {
      "enabled": true,
      "baseUrl": "http://localhost:11434"
    }
  },

  "routing": {
    "strategy": "auto-fallback"
  }
}
```

---

# 🧩 Use Cases

## AI Coding Assistant Gateway

Connect:

- Claude Code
- Cursor
- OpenAI compatible tools
- Local coding agents


## Self-hosted AI Infrastructure

Run your own AI gateway:

```
Your Apps
   |
DikaRoute
   |
Multiple AI Models
```

---

## AI Agent Platform

Perfect for:

- Autonomous agents
- Chatbots
- Internal AI tools
- Development platforms


---

# 🔐 Security

DikaRoute focuses on:

- API key isolation
- Provider separation
- Controlled access
- Local deployment support


---

# 📈 Roadmap

Future improvements:

- [ ] Advanced load balancing
- [ ] More provider adapters
- [ ] Better analytics
- [ ] Distributed routing
- [ ] Plugin system
- [ ] Enterprise deployment mode


---

# 👨‍💻 Developer

Created by **DikaCode**

GitHub:
https://github.com/dikaofc

Telegram:
https://t.me/dikaacode

Website:
https://obitoglory.tech


---

# 📄 License

MIT License

Copyright © DikaCode

---

<p align="center">
Built with ❤️ for developers building the next generation of AI applications.
</p>
