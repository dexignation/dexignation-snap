<div align="center">

# dexignation-snap

**MetaMask Snap for resolving DEXignation `.dex` names inside MetaMask.**

MetaMask 내에서 DEXignation `.dex` 이름을 해석하는 MetaMask Snap입니다.

[![Website](https://img.shields.io/badge/Website-www.dexignation.com-00DC82.svg)](https://www.dexignation.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](./LICENSE)
[![MetaMask Snap](https://img.shields.io/badge/MetaMask-Snap-F6851B.svg)](https://docs.metamask.io/snaps/)

</div>

---

## Overview / 개요

This Snap integrates DEXignation name resolution with MetaMask's Snaps
name lookup flow. When MetaMask asks the Snap to resolve a `.dex` domain
or reverse-resolve an address, the Snap calls the public DEXignation API
and returns the chain-specific result.

이 Snap은 DEXignation 이름 해석을 MetaMask Snaps의 name lookup 흐름에
연결합니다. MetaMask가 `.dex` 도메인 해석 또는 주소 역방향 해석을 요청하면,
Snap은 공개 DEXignation API를 호출하고 현재 체인에 맞는 결과를 반환합니다.

The Snap is read-only. It does not hold keys, sign transactions, submit
transactions, or display transaction prompts.

Snap은 읽기 전용입니다. 키를 보관하지 않고, 트랜잭션에 서명하지 않으며,
트랜잭션을 전송하거나 트랜잭션 승인 화면을 표시하지 않습니다.

---

## What It Does / 기능

- Resolves `.dex` domains through MetaMask's `onNameLookup` handler.
- Returns only the address registered for the requested chain symbol.
- Reverse-resolves an address to its primary `.dex` domain when configured.
- Ignores unsupported chains and unavailable records by returning `null`.
- Uses `https://www.dexignation.com/api/v1`.

- MetaMask의 `onNameLookup` handler를 통해 `.dex` 도메인을 해석합니다.
- 요청된 체인 심볼에 등록된 주소만 반환합니다.
- 설정된 경우 주소를 primary `.dex` 도메인으로 역방향 해석합니다.
- 지원하지 않는 체인이나 없는 레코드는 `null`을 반환합니다.
- `https://www.dexignation.com/api/v1`을 사용합니다.

Supported chains / 지원 체인:

| CAIP-2 Chain ID | Symbol |
|---|---|
| `eip155:1` | `ETH` |
| `eip155:10` | `OP` |
| `eip155:56` | `BNB` |
| `eip155:137` | `POL` |
| `eip155:8453` | `BASE` |
| `eip155:42161` | `ARB` |
| `bip122:000000000019d6689c085ae165831e93` | `BTC` |
| `solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp` | `SOL` |
| `tron:728126428` | `TRX` |

---

## Repository Layout / 저장소 구조

```text
src/                 Snap source
site/                Gatsby install/test page for MetaMask Flask
snap.manifest.json   Snap manifest
snap.config.ts       MetaMask Snaps CLI config
images/              Snap icon assets
```

```text
src/                 Snap 소스
site/                MetaMask Flask 설치/테스트용 Gatsby 페이지
snap.manifest.json   Snap manifest
snap.config.ts       MetaMask Snaps CLI 설정
images/              Snap 아이콘 자산
```

---

## Development / 개발

### Prerequisites / 사전 요구사항

- Node.js v22+
- npm
- [MetaMask Flask](https://metamask.io/flask/) for local Snap testing

- Node.js v22+
- npm
- 로컬 Snap 테스트용 [MetaMask Flask](https://metamask.io/flask/)

### Install / 설치

```bash
npm install
npm --prefix site install
```

### Run Locally / 로컬 실행

Use two terminals.

터미널 2개를 사용합니다.

Terminal 1: serve the Snap manifest and bundle.

터미널 1: Snap manifest와 bundle을 제공합니다.

```bash
npm run build
npm run serve
```

This serves Snap files from `http://localhost:8080`.
The root URL may return `404`; that is expected. MetaMask reads
`/snap.manifest.json` and `/dist/bundle.js`.

이 명령은 `http://localhost:8080`에서 Snap 파일을 제공합니다.
루트 URL이 `404`를 반환해도 정상입니다. MetaMask는
`/snap.manifest.json`과 `/dist/bundle.js`를 읽습니다.

Terminal 2: run the Gatsby install/test site.

터미널 2: Gatsby 설치/테스트 사이트를 실행합니다.

```bash
npm run site
```

Open:

브라우저에서 엽니다.

```text
http://localhost:8081/
```

The local Snap ID is:

로컬 Snap ID는 다음과 같습니다.

```text
local:http://localhost:8080
```

From the Gatsby page, install the Snap with MetaMask Flask, then use
the lookup controls to test domain and address resolution.

Gatsby 페이지에서 MetaMask Flask로 Snap을 설치한 뒤, lookup 컨트롤로
도메인/주소 해석을 테스트합니다.

---

## Testing / 테스트

```bash
npm run lint
npm test
npm run build
npm --prefix site run lint
npm --prefix site run build
```

`npm test` uses Jest and `@metamask/snaps-jest` to verify the Snap
handler behavior and bundled Snap behavior.

`npm test`는 Jest와 `@metamask/snaps-jest`를 사용해 Snap handler 동작과
번들된 Snap 동작을 검증합니다.

---

## Developer RPC / 개발용 RPC

Production name resolution is handled by MetaMask through `onNameLookup`.
For local development, the Snap also exposes a test RPC method:

운영 name resolution은 MetaMask가 `onNameLookup`을 통해 호출합니다.
로컬 개발 편의를 위해 Snap은 테스트용 RPC method도 제공합니다.

```javascript
await window.ethereum.request({
  method: 'wallet_invokeSnap',
  params: {
    snapId: 'local:http://localhost:8080',
    request: {
      method: 'test-name-lookup',
      params: {
        chainId: 'eip155:137',
        domain: 'jay.dex',
      },
    },
  },
});
```

Reverse lookup:

역방향 해석:

```javascript
await window.ethereum.request({
  method: 'wallet_invokeSnap',
  params: {
    snapId: 'local:http://localhost:8080',
    request: {
      method: 'test-name-lookup',
      params: {
        chainId: 'eip155:137',
        address: '0x1111111111111111111111111111111111111111',
      },
    },
  },
});
```

This RPC is intended for development and the local test site.

이 RPC는 개발 및 로컬 테스트 사이트용입니다.

---

## Publishing / 배포

The production Snap is distributed through npm as:

운영 Snap은 npm을 통해 다음 ID로 배포됩니다.

```text
npm:@dexignation/snap
```

Before publishing:

배포 전:

```bash
npm run build
npm run manifest
npm test
npm publish --access public
```

The `snap.manifest.json` `source.shasum` must match the built
`dist/bundle.js`. `npm run build` and `npm run manifest` keep it in sync.

`snap.manifest.json`의 `source.shasum`은 빌드된 `dist/bundle.js`와
일치해야 합니다. `npm run build`와 `npm run manifest`로 동기화합니다.

Because this Snap uses MetaMask name lookup permissions, production
installation in regular MetaMask requires MetaMask allowlist approval.
Before allowlist approval, local testing should be done with MetaMask
Flask and `local:http://localhost:8080`.

이 Snap은 MetaMask name lookup 권한을 사용하므로, 일반 MetaMask에서
운영 설치가 가능하려면 MetaMask allowlist 승인이 필요합니다. 승인 전
로컬 테스트는 MetaMask Flask와 `local:http://localhost:8080`으로 진행합니다.

For a production install page, configure the site Snap origin as:

운영 설치 페이지에서는 site의 Snap origin을 다음과 같이 설정합니다.

```text
npm:@dexignation/snap
```

In development, the default is:

개발 기본값은 다음과 같습니다.

```text
local:http://localhost:8080
```

---

## Security / 보안

- The Snap holds no private keys.
- The Snap does not sign or submit transactions.
- The Snap performs read-only HTTPS requests to the public DEXignation API.
- The Snap returns `null` for unsupported chains, unavailable records, or
  API failures.

- Snap은 private key를 보관하지 않습니다.
- Snap은 트랜잭션에 서명하거나 트랜잭션을 전송하지 않습니다.
- Snap은 공개 DEXignation API에 읽기 전용 HTTPS 요청만 수행합니다.
- 지원하지 않는 체인, 없는 레코드, API 실패 시 `null`을 반환합니다.

See [`SECURITY.md`](./SECURITY.md).

---

## Related Repositories / 관련 저장소

| Repo | Purpose |
|---|---|
| [`dexignation-contracts`](https://github.com/DEXignation/dexignation-contracts) | Smart contracts |
| [`dexignation-api`](https://github.com/DEXignation/dexignation-api) | Backend services |
| [`dexignation-snap`](https://github.com/DEXignation/dexignation-snap) | This repo |
| [`dexignation-docs`](https://github.com/DEXignation/dexignation-docs) | Official docs |

---

## License / 라이선스

MIT. See [`LICENSE`](./LICENSE).
