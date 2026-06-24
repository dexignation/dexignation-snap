# DEXignation Snap Site

Gatsby install and test page for the DEXignation MetaMask Snap.

DEXignation MetaMask Snap 설치 및 테스트를 위한 Gatsby 페이지입니다.

## Development / 개발

Run the Snap server and the Gatsby site in separate terminals.

Snap 서버와 Gatsby site를 각각 별도 터미널에서 실행합니다.

```bash
npm run build
npm run serve
```

```bash
npm run site
```

Open:

브라우저에서 엽니다.

```text
http://localhost:8081/
```

The local Snap origin defaults to:

로컬 Snap origin 기본값:

```text
local:http://localhost:8080
```

## Production Origin / 운영 Origin

For a production install page, set `SNAP_ORIGIN` to the npm Snap ID.

운영 설치 페이지에서는 `SNAP_ORIGIN`을 npm Snap ID로 설정합니다.

```text
SNAP_ORIGIN=npm:@dexignation/snap
```

The Snap must be published to npm and allowlisted by MetaMask before
regular MetaMask users can install it in production.

일반 MetaMask 사용자가 운영 환경에서 설치하려면 Snap이 npm에 배포되어 있고
MetaMask allowlist 승인을 받아야 합니다.

## Scripts / 스크립트

```bash
npm --prefix site run start
npm --prefix site run build
npm --prefix site run lint
```
