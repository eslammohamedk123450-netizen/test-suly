# ChatGPT Clone - Suly AI 🚀

A modern, pixel-perfect ChatGPT web interface replica built with React, Vite, Tailwind CSS, Express, and Google GenAI SDK. Matches OpenAI's ChatGPT web application layout, signature dark/light palette, controls, and features.

---

## ✨ Features

- **ChatGPT Visual Identity & Themes**:
  - Exact ChatGPT dark theme (`#212121`, `#171717`, `#2f2f2f`) and light mode.
  - Seamless Light/Dark/System theme switcher.
  - Full Arabic (RTL) & English (LTR) language support with instant direction switching.

- **Sidebar & Conversation Management**:
  - Collapsible sidebar (`Ctrl+Shift+S`) and New Chat shortcut (`Ctrl+Shift+O`).
  - Chat history categorized by **Pinned**, **Today**, **Yesterday**, **Previous 7 Days**, **Previous 30 Days**, and **Older**.
  - Three-dot action menu for each conversation: **Share**, **Rename**, **Pin/Unpin**, **Archive**, and **Delete**.
  - User profile drawer with Custom Instructions, Settings, and Account controls.

- **Model Switcher & Reasoning Controls**:
  - Support for **GPT-4o** (Flagship intelligence & tools), **o1** (Reasoning & STEM), **GPT-4o mini** (High-speed daily tasks), and **o3-mini**.
  - Step-by-step thinking/reasoning accordion preview ("Thought for a few seconds").
  - Temporary Chat toggle with incognito ghost badge.

- **Signature Input Capsule & Tooling**:
  - Multiline auto-expanding textarea.
  - Attachment tray for files, documents, and images with removal badges.
  - Web Search toggle (🌐).
  - Deep Reasoning toggle (💡).
  - Voice Dictation (🎙️ Speech-to-Text).
  - Send button morphing to a Stop square button during active streaming generation.

- **Rich Response Display**:
  - Full Markdown rendering with tables, lists, and quotes.
  - Code blocks with language identifiers and interactive **Copy Code** button.
  - Action toolbar: **Read Aloud (TTS)**, **Copy**, **Thumbs Up/Down feedback**, and **Regenerate response**.
  - User prompt inline editing with conversation re-branching.

- **Voice Mode**:
  - ChatGPT Advanced Voice fluid pulsing animated orb.
  - Natural voice selector (Juniper, Breeze, Cove, Ember, Sky) with live interaction simulation.

- **Settings & Search Modals**:
  - Settings Modal: General (Theme, Language, Clear history), Personalization (Custom instructions), Speech, and Data Controls (Export JSON).
  - Search Modal: Real-time search across past chat titles and message bodies.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Vite 8, Tailwind CSS v4, Lucide Icons, React Markdown, Remark GFM, Motion.
- **Backend**: Express, Node.js, TSX, `@google/genai` (Server-Side SSE Streaming).

---

## 🚀 Quick Start

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure environment**:
   ```bash
   cp .env.example .env
   # Add your GEMINI_API_KEY in .env
   ```

3. **Run development server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

4. **Build for production**:
   ```bash
   npm run build
   ```
