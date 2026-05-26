<div align="center">

# dexignation-snap

**MetaMask Snap that resolves `.dex` names inside MetaMask.**

MetaMask 내에서 `.dex` 이름을 해결하는 MetaMask Snap.

[![Website](https://img.shields.io/badge/Website-dexignation.com-00DC82.svg)](https://dexignation.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](./LICENSE)
[![MetaMask Snap](https://img.shields.io/badge/MetaMask-Snap-F6851B.svg)](https://docs.metamask.io/snaps/)

</div>

---

## What is a Snap? / Snap이란?

A **MetaMask Snap** is a sandboxed JavaScript program that extends
MetaMask's capabilities. Snaps can expose new RPC methods, render UI
inside the MetaMask popup, and run scheduled background tasks — all
without modifying MetaMask itself.

**MetaMask Snap**은 MetaMask 기능을 확장하는 샌드박스 JavaScript 프로그램입니다.
새로운 RPC 메서드 노출, MetaMask 팝업 내 UI 렌더링, 백그라운드 작업을 모두
MetaMask 본체 수정 없이 수행할 수 있습니다.

This Snap lets dApps and end-users resolve DEXignation `.dex` names
directly from MetaMask — no separate library, no API server dependency.

본 Snap은 dApp과 사용자가 DEXignation `.dex` 이름을 MetaMask에서 바로
해결할 수 있게 합니다 — 별도 라이브러리도, API 서버 의존도 없습니다.

---

## What it does / 무엇을 하는가

Three RPC methods exposed via `wallet_invokeSnap`:

`wallet_invokeSnap`을 통해 노출되는 RPC 메서드 3개:

### 1. `resolve` — name → addresses

```javascript
const result = await window.ethereum.request({
  method: "wallet_invokeSnap",
  params: {
    snapId: "npm:@dexignation/snap",
    request: {
      method: "resolve",
      params: { name: "alice.dex" },
    },
  },
});
// {
//   name: "alice.dex",
//   node: "0x...",
//   owner: "0x71C7656EC7ab88b098defB751B7401B5f6d8976F",
//   expired: false,
//   addresses: { polygon: "0x71C7...", ethereum: "0xA1B2..." }
// }
```

### 2. `reverseResolve` — address → name

```javascript
const { name } = await window.ethereum.request({
  method: "wallet_invokeSnap",
  params: {
    snapId: "npm:@dexignation/snap",
    request: {
      method: "reverseResolve",
      params: { address: "0x71C7656EC7ab88b098defB751B7401B5f6d8976F" },
    },
  },
});
// "alice.dex"
```

### 3. `info` — Snap & network metadata

```javascript
const info = await window.ethereum.request({
  method: "wallet_invokeSnap",
  params: {
    snapId: "npm:@dexignation/snap",
    request: { method: "info" },
  },
});
// { version: "0.1.0", network: {...}, supportedNetworks: [...] }
```

---

## Development / 개발

### Prerequisites / 사전 요구사항

- Node.js v22+
- [MetaMask Flask](https://metamask.io/flask/) (the developer build of
  MetaMask that supports custom Snaps)

### Quick start / 빠른 시작

```bash
git clone https://github.com/DEXignation/dexignation-snap
cd dexignation-snap
npm install
npm run build
npm run serve     # serves the bundle at http://localhost:8080
```

Then in MetaMask Flask, install the local Snap from
`http://localhost:8080`.

이후 MetaMask Flask에서 `http://localhost:8080`의 로컬 Snap을 설치하세요.

### Watch mode / 워치 모드

```bash
npm run watch
```

Re-bundles on file change. Re-install in Flask to pick up the new
bundle.

파일 변경 시 자동 재번들. Flask에서 재설치하여 새 번들 적용.

### Tests / 테스트

```bash
npm test
```

---

## Configuration / 설정

Contract addresses are bundled at build time. To point the Snap at a
different deployment:

컨트랙트 주소는 빌드 시점에 번들됩니다. 다른 배포본을 가리키려면:

1. Edit `src/config.ts` — fill in `registryAddress` and `resolverAddress`
   for the target network.
2. `npm run build`.
3. Re-publish to npm (or re-install locally for development).

---

## Publishing / 배포

The Snap is distributed via npm under `@dexignation/snap`. To publish:

Snap은 `@dexignation/snap` 이름으로 npm에 배포됩니다.

```bash
npm run build
npm run manifest    # auto-fixes the manifest shasum
npm publish --access public
```

The `snap.manifest.json` `shasum` field must match the built bundle.
`mm-snap manifest --fix` regenerates it.

`snap.manifest.json`의 `shasum` 필드는 빌드된 번들과 일치해야 합니다.
`mm-snap manifest --fix`로 자동 갱신됩니다.

---

## Security / 보안

- The Snap holds **no keys** and signs **no transactions**.
- It performs **read-only** chain calls via a public RPC endpoint.
- All input is validated before being sent to the chain.
- See [`SECURITY.md`](./SECURITY.md).

키 보관 없음, 트랜잭션 서명 없음. 공용 RPC를 통한 **읽기 전용** 호출만
수행. 모든 입력은 체인 전송 전에 검증.

---

## Related repositories / 관련 저장소

| Repo | Purpose |
|---|---|
| [`dexignation-contracts`](https://github.com/DEXignation/dexignation-contracts) | Smart contracts |
| [`dexignation-api`](https://github.com/DEXignation/dexignation-api) | Backend services |
| [`dexignation-snap`](https://github.com/DEXignation/dexignation-snap) | This repo |
| [`dexignation-docs`](https://github.com/DEXignation/dexignation-docs) | Official docs |

---

## License / 라이선스

MIT. See [`LICENSE`](./LICENSE).
