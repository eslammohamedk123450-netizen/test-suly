# ChatGPT Full-Featured Pro - Suly AI 🚀

A comprehensive, production-grade ChatGPT web interface replica built with React 19, TypeScript, Vite 8, Tailwind CSS v4, Express, and Google GenAI streaming. Matches OpenAI's official ChatGPT Plus interface in colors, layouts, controls, and features.

---

## ✨ Features & Capabilities

- 🎨 **Authentic ChatGPT Dark / Light / System Theme**:
  - Exact ChatGPT dark palette (`#212121`, `#171717`, `#2f2f2f`) and crisp light theme.
  - Full Arabic (RTL) and English (LTR) language support with one-click toggling.

- ⚡ **Interactive Code Live Preview (Sandbox / Canvas)**:
  - Run and preview HTML, CSS, JavaScript, and SVG code snippets in real-time inside an isolated sandbox iframe.
  - Responsive viewport switcher: Desktop, Tablet (768px), and Mobile (375px).
  - Code and Preview dual-view modes.

- 🖼️ **DALL·E Image Generation**:
  - Automatically detects image generation prompts (e.g. "ارسم", "صورة", "dall-e", "generate image") and generates high-resolution generative images.
  - Interactive image lightbox zoom modal and direct one-click Download button.

- 🧩 **Explore GPTs Store & Directory**:
  - Full interactive GPTs store showcasing custom specialized assistants:
    - **DALL·E**: Photorealistic and digital art generator.
    - **Code Copilot Pro**: Staff engineer for debugging, architecture, and Clean Code.
    - **Data Analyst & Insights**: Spreadsheet analysis, trends, and charts.
    - **Creative Writing Mentor**: Eloquent essays, storytelling, and copywriting.
    - **Math & STEM Solver**: Calculus, physics, and step-by-step logic.
  - Category filters (Featured, DALL·E, Coding, Writing, Productivity, Education).

- 📊 **Interactive Data Charts & Visualizations**:
  - Automatically parses numerical tables and datasets in responses.
  - Interactive SVG Bar Chart and Line Chart with tooltips, gridlines, and values.

- 📥 **Multi-Format Export & Sharing**:
  - Export conversation as formatted **PDF / Print** with print-optimized styling.
  - Export as **Markdown (.md)** or **Plain Text (.txt)**.
  - Copy public share link with one-click feedback.

- 🗄️ **Archived Chats Manager**:
  - Dedicated Archived Chats tab in Settings.
  - View all archived discussions with ability to **Unarchive (Restore)** or **Delete permanently**.

- ⏱️ **Token Speed & Performance Metrics**:
  - Live statistics below each assistant response showing estimated token count, generation latency (`~180 tokens · 1.2s`), and the specific active model badge.

- 🎙️ **Voice Mode & Speech Synthesis**:
  - ChatGPT Advanced Voice fluid pulsing animated orb with sound-reactive visualizer.
  - Natural assistant voice selector (Juniper, Breeze, Cove, Ember, Sky).
  - Web Speech dictation (Speech-to-Text) and TTS read-aloud audio player.

- ⚙️ **Custom Instructions & Settings**:
  - General: Theme, Language, Clear history.
  - Personalization: "What would you like ChatGPT to know about you?" and "How would you like ChatGPT to respond?".
  - Speech: Voice selection and sound effects.
  - Data Controls: Export chat data as JSON.

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
