# Product Guidelines: Python Smart Execute

## User Experience (UX) Philosophy
- **Predictability and Stability:** The extension must behave consistently with standard VS Code patterns. "Smart" features should feel like an intuitive upgrade to existing workflows, not a replacement that requires learning new paradigms.
- **Minimal Distraction:** User-facing messages should be professional and concise. Avoid unnecessary notifications; the tool should work silently in the background unless a critical error occurs.

## Quality Standards
- **High Reliability:** The core functionality (sending selection to REPL) is mission-critical for the user's workflow. Any "Smart" enhancements must be secondary to ensuring that code is always executed correctly and without regressions.
- **Performance:** Block detection and routing logic must be optimized to ensure execution feels instantaneous. Any latency introduced by analysis should be imperceptible to the user.

## Communication Style
- **Technical & Direct:** Documentation and error messages should use clear, technical language. Provide direct instructions for configuration and troubleshooting without conversational filler.
