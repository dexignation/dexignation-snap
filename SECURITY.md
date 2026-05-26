# Security Policy — dexignation-snap / 보안 정책

## Reporting / 제보

**Do not open public GitHub issues for security vulnerabilities.**

**보안 취약점은 공개 GitHub 이슈로 올리지 마세요.**

- **Email**: `security@dexignation.io`
- **Website**: https://dexignation.com

48시간 내 수신 확인, 5영업일 내 1차 분석.

---

## Trust boundaries / 신뢰 경계

This Snap is **read-only** with respect to user funds. It:

- Holds **no private keys** (MetaMask does).
- Initiates **no transactions** (it only returns data to the caller).
- Has **no access** to seed phrases, private keys, or other MetaMask
  internals beyond what the Snap permissions declare in
  `snap.manifest.json`.

본 Snap은 사용자 자금에 대해 **읽기 전용**입니다. 키 보관 없음, 트랜잭션
시작 없음. `snap.manifest.json`에 선언된 권한 범위를 넘어 MetaMask 내부에
접근하지 않습니다.

The permissions we request:

요청하는 권한:

- `endowment:rpc` — Lets dApps call our exposed RPC methods.
- `endowment:network-access` — Required to call the Polygon RPC endpoint.
- `snap_dialog` — Used to surface confirmations if/when needed (currently unused).
- `snap_notify` — Reserved for future notification features.

---

## In scope / 범위 내

- RPC method input validation
- ABI / bytes decoding correctness
- Network request handling (timeouts, malformed responses)
- Manifest permission scope
- Bundle integrity (shasum)

---

## Out of scope / 범위 외

- MetaMask itself (report to [MetaMask security](https://github.com/MetaMask/metamask-extension/blob/main/SECURITY.md))
- Public Polygon RPC outages
- Theoretical attacks without a feasible exploit path
- Smart contract issues — those belong in
  [`dexignation-contracts`](https://github.com/DEXignation/dexignation-contracts/security)

---

## Disclosure / 공개

We follow coordinated disclosure. After agreeing on a fix and a public
date, we publish a post-mortem with credit to the reporter (anonymous
on request).
