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

});
