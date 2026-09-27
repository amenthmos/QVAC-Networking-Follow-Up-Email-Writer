# QVAC Networking Follow-Up Email Writer

Enter who you met and what you talked about, and an on-device AI drafts a follow-up email that references the actual conversation. No cloud call, no API key.

## Run

```bash
npm install
npm start
```

Then open http://localhost:32015

## QVAC SDK version

`@qvac/sdk` ^0.19.0 (see `package.json`).

## How it works

Built on [Tether's QVAC SDK](https://www.npmjs.com/package/@qvac/sdk) — all inference runs on-device, no cloud call, no API key. The app loads `LLAMA_3_2_1B_INST_Q4_0` locally with `loadModel()`, generates with `completion()` (streamed via `tokenStream`), and releases the model with `unloadModel()` on shutdown.

## Example

Input: `{"person":"Marcus, at a startup mixer","topic":"his experience raising a seed round and hiring the first engineer"}`

Output (from a real run):
```json
{"email":"Subject: Exciting startup story to share!\n\nHi Marcus,\n\nI hope you're doing well. I wanted to reach out and hear about your experience raising a seed round and hiring the first engineer - something I've been wanting to discuss with you. I'd love to hear more about your approach and lessons learned.\n\nLooking forward to catching up soon.\n\nBest,\n[Your name]"}
```

## License

MIT
