# WebSocket Testing Tool

A simple WebSocket testing tool built with Vue.js and DaisyUI.

## Features

- Connect to multiple WebSocket endpoints simultaneously
- View real-time messages in a clean, organized table
- Send custom messages to WebSocket servers
- Track connection status
- Session history with timestamps
- JSON message formatting for better readability
- Responsive design that works on desktop and mobile

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- pnpm (v6 or later)

### Installation

1. Clone the repository
2. Install dependencies:

```bash
pnpm install
```

3. Start the development server:

```bash
pnpm dev
```

4. Open your browser and navigate to `http://localhost:5173`

## Usage

1. Enter a WebSocket URL (e.g., `ws://localhost:8080`) in the connection input field
2. Click "Connect" to establish a WebSocket connection
3. Once connected, you can send messages using the "Send Message" input field
4. All sent and received messages will appear in the messages table
5. You can manage multiple connections using the sidebar
6. Click on a session in the sidebar to view its messages

## Building for Production

To build the application for production, run:

```bash
pnpm build
```

The built files will be in the `dist` directory.

## Technologies Used

- [Vue.js](https://vuejs.org/) - Frontend framework
- [Vite](https://vitejs.dev/) - Build tool
- [TypeScript](https://www.typescriptlang.org/) - Type-safe JavaScript
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [DaisyUI](https://daisyui.com/) - Tailwind CSS component library

## License

MIT
