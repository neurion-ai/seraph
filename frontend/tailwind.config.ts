import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        pixel: ['"Press Start 2P"', "monospace"],
      },
      colors: {
        retro: {
          bg: "#1a1a2e",
          panel: "#16213e",
          border: "#e2b714",
          text: "#e0e0e0",
          accent: "#0f3460",
          user: "#533483",
          agent: "#1a5276",
          step: "#2c3e50",
          error: "#922b21",
          highlight: "#f39c12",
        },
      },
      animation: {
        blink: "blink 1s step-end infinite",
        "bounce-pixel": "bounce-pixel 0.6s infinite",
        "typing-dots": "typing-dots 1.4s infinite",
      },
      keyframes: {
        blink: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0" },
        },
        "bounce-pixel": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-4px)" },
        },
        "typing-dots": {
          "0%": { content: "''" },
          "25%": { content: "'.'" },
          "50%": { content: "'..'" },
          "75%": { content: "'...'" },
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
