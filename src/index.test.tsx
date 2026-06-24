import { describe, expect, it } from '@jest/globals';
import { installSnap } from '@metamask/snaps-jest';

describe('Dexignation Snap', () => {
  describe('onNameLookup - chain guard', () => {
    it('returns null for an unsupported EVM chain (Avalanche)', async () => {
      const { onNameLookup } = await installSnap();
      const response = await onNameLookup({
        chainId: 'eip155:43114',
        domain: 'jay.dex',
      });
      expect(response).toRespondWith(null);
    });

    it('returns null for an unsupported EVM chain (Gnosis Chain)', async () => {
      const { onNameLookup } = await installSnap();
      const response = await onNameLookup({
        chainId: 'eip155:100',
        domain: 'jay.dex',
      });
      expect(response).toRespondWith(null);
    });

    it('returns null for reverse lookup on an unsupported chain', async () => {
      const { onNameLookup } = await installSnap();
      const response = await onNameLookup({
        chainId: 'eip155:43114',
        address: '0x1111111111111111111111111111111111111111',
      });
      expect(response).toRespondWith(null);
    });
  });

  describe('onRpcRequest - method dispatch', () => {
    it('rejects unknown methods with JSON-RPC code -32601 (Method not found)', async () => {
      const { request } = await installSnap();
      const response = await request({ method: 'foo' });
      expect(response).toRespondWithError({
        code: -32601,
        message: expect.any(String),
        data: expect.objectContaining({ method: 'foo' }),
        stack: expect.any(String),
      });
    });

    it('returns null from test-name-lookup when no params are provided', async () => {
      const { request } = await installSnap();
      const response = await request({ method: 'test-name-lookup' });
      expect(response).toRespondWith(null);
    });

    it('returns null from test-name-lookup when params is an empty object', async () => {
      const { request } = await installSnap();
      const response = await request({
        method: 'test-name-lookup',
        params: {},
      });
      expect(response).toRespondWith(null);
    });

    it('returns null from test-name-lookup for an unsupported chain', async () => {
      const { request } = await installSnap();
      const response = await request({
        method: 'test-name-lookup',
        params: { chainId: 'eip155:43114', domain: 'jay.dex' },
      });
      expect(response).toRespondWith(null);
    });
  });
});
