# Sparkfall

An original, minimal 5v5 browser MOBA. Two teams fight across three lanes to destroy the opposing core. Includes an authoritative Node server, lobby codes, ten human seats, optional bots, minion waves, three hero abilities, XP/levels, respawns and session reconnection.

## Play

Requires Node.js 22 or newer. No packages, account or install needed.

```sh
cd sparkfall
node server.mjs
```

Open http://localhost:3000. Enter a name, choose Dawn or Dusk, and leave the code blank to create a lobby. Share its six-character code with other players. The host can fill remaining seats with AI and start once both teams have five connected players. Each human player must use a separate browser tab and join before bots fill the seats.

On macOS you can also double-click `Launch Sparkfall.command`. If macOS asks, allow the script to open in Terminal. Close the Terminal process with Control-C to stop the server.

WASD or arrow keys move; Space attacks the nearest enemy in range or the enemy core; Q pulses nearby enemies; E heals; R dashes. Your core heals you when nearby. Destroy the opposing core to win. Use New lobby to replay.

## Friends on the same network

```sh
HOST=0.0.0.0 node server.mjs
```

Friends visit `http://YOUR_LAN_IP:3000` and enter the same lobby code. Internet multiplayer requires hosting this same Node process behind HTTPS; there is no paid hosting account or public deployment included. The default listens only on your computer.

## Reconnection

Sessions are saved in sessionStorage per tab. Reload the same tab to reconnect. After five seconds without requests the server marks the player offline and stops hero input. Their hero remains vulnerable and retains its team seat. When a request resumes it reconnects to the same hero. Server restart loses all matches; thirty minutes of human inactivity expires a lobby and its sessions. Offline seats cannot be reassigned in this prototype.

## Verify

```sh
node --check game.mjs
node --check server.mjs
node --check public/client.js
node --test
```

Equivalent npm scripts are `npm run lint` and `npm test` where npm is installed. Six tests cover the gameplay cases and a real ten-session HTTP lobby. A browser smoke test separately verified joining, AI fill, starting, moving, casting and reload recovery.

## Prototype limits

One hero kit, no towers, shop, fog of war, sound, ranked matchmaking, persistence or production account system. Supports keyboard desktop browsers. All visual content is programmatic and original. Credentials are opaque per-tab session tokens; no external service credentials are used. This local prototype has a 100-lobby cap and is not hardened for untrusted public traffic. The server runs at 10 Hz and clients poll at 10 Hz.

See DESIGN.md for game rules.
