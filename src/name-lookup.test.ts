import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from '@jest/globals';

import { onNameLookup, onRpcRequest } from '.';
import {
  API_BASE,
  API_PATHS,
  CHAIN_TO_SYMBOL,
  DEFAULT_TEST_CHAIN_ID,
  PROTOCOL_NAME,
  RPC_METHOD_TEST_NAME_LOOKUP,
} from './constants';

type CoinAddressEntry = {
  coinType: number;
  symbol: string;
  address: string | null;
};

const okResponse = (body: unknown): Response =>
  ({
    ok: true,
    status: 200,
    json: async () => body,
  }) as Response;

const errorResponse = (status: number): Response =>
  ({
    ok: false,
    status,
    json: async () => ({}),
  }) as Response;

const nameRecord = (
  name: string,
  addresses: CoinAddressEntry[],
  options: { exists?: boolean; owner?: string | null } = {},
) => ({
  data: {
    name,
    exists: options.exists ?? true,
    owner: options.owner ?? null,
    addresses,
  },
});

const SAMPLE_ADDRESSES: Record<keyof typeof CHAIN_TO_SYMBOL, string> = {
  'eip155:1': '0x0000000000000000000000000000000000000001',
  'eip155:10': '0x0000000000000000000000000000000000000010',
  'eip155:56': '0x0000000000000000000000000000000000000056',
  'eip155:137': '0x0000000000000000000000000000000000000137',
  'eip155:8453': '0x0000000000000000000000000000000000008453',
  'eip155:42161': '0x0000000000000000000000000000000000042161',
  'bip122:000000000019d6689c085ae165831e93':
    'bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq',
  'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp':
    '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
  'tron:728126428': 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t',
};

const PER_CHAIN_CASES = (
  Object.entries(CHAIN_TO_SYMBOL) as [
    keyof typeof CHAIN_TO_SYMBOL,
    (typeof CHAIN_TO_SYMBOL)[keyof typeof CHAIN_TO_SYMBOL],
  ][]
).map(([chainId, symbol]) => ({
  chainId,
  symbol,
  address: SAMPLE_ADDRESSES[chainId],
}));

describe('onNameLookup (direct import)', () => {
  let fetchSpy: jest.SpiedFunction<typeof fetch>;

  beforeEach(() => {
    fetchSpy = jest.spyOn(globalThis, 'fetch');
  });

  afterEach(() => {
    fetchSpy.mockRestore();
  });

  describe('forward lookup - per-chain symbol matching', () => {
    it.each(PER_CHAIN_CASES)(
      'resolves to the $symbol address on $chainId',
      async ({ chainId, symbol, address }) => {
        fetchSpy.mockResolvedValueOnce(
          okResponse(
            nameRecord('test.dex', [{ coinType: 0, symbol, address }]),
          ),
        );

        const response = await onNameLookup({ chainId, domain: 'test.dex' });

        expect(response).toMatchObject({
          resolvedAddresses: [
            {
              resolvedAddress: address,
              protocol: PROTOCOL_NAME,
              domainName: 'test.dex',
            },
          ],
        });
      },
    );
  });

  describe('forward lookup - no cross-chain fallback', () => {
    it('returns null on Polygon when only an ETH record exists', async () => {
      fetchSpy.mockResolvedValueOnce(
        okResponse(
          nameRecord('jay.dex', [
            { coinType: 60, symbol: 'ETH', address: '0xeth' },
          ]),
        ),
      );

      const response = await onNameLookup({
        chainId: 'eip155:137',
        domain: 'jay.dex',
      });

      expect(response).toBeNull();
    });

    it('returns null on Ethereum when only a POL record exists', async () => {
      fetchSpy.mockResolvedValueOnce(
        okResponse(
          nameRecord('jay.dex', [
            { coinType: 2147483785, symbol: 'POL', address: '0xpol' },
          ]),
        ),
      );

      const response = await onNameLookup({
        chainId: 'eip155:1',
        domain: 'jay.dex',
      });

      expect(response).toBeNull();
    });
  });

  describe('forward lookup - no owner fallback', () => {
    it('returns null when the matching symbol is absent even if an owner is present', async () => {
      fetchSpy.mockResolvedValueOnce(
        okResponse(
          nameRecord(
            'jay.dex',
            [{ coinType: 60, symbol: 'ETH', address: '0xeth' }],
            { owner: '0xownerwallet' },
          ),
        ),
      );

      const response = await onNameLookup({
        chainId: 'eip155:137',
        domain: 'jay.dex',
      });

      expect(response).toBeNull();
    });
  });

  describe('forward lookup - error paths', () => {
    it('returns null when the record has no addresses array', async () => {
      fetchSpy.mockResolvedValueOnce(okResponse({ data: { exists: false } }));

      const response = await onNameLookup({
        chainId: 'eip155:1',
        domain: 'doesnotexist.dex',
      });

      expect(response).toBeNull();
    });

    it('returns null when the backend responds with 500', async () => {
      fetchSpy.mockResolvedValueOnce(errorResponse(500));

      const response = await onNameLookup({
        chainId: 'eip155:1',
        domain: 'jay.dex',
      });

      expect(response).toBeNull();
    });

    it('returns null when the fetch promise rejects', async () => {
      fetchSpy.mockRejectedValueOnce(new Error('network down'));

      const response = await onNameLookup({
        chainId: 'eip155:1',
        domain: 'jay.dex',
      });

      expect(response).toBeNull();
    });

    it('builds the forward-lookup URL via API_PATHS.nameByDomain', async () => {
      fetchSpy.mockResolvedValueOnce(
        okResponse(
          nameRecord('jay.dex', [
            { coinType: 60, symbol: 'ETH', address: '0xeth' },
          ]),
        ),
      );

      await onNameLookup({ chainId: 'eip155:1', domain: 'jay.dex' });

      expect(fetchSpy).toHaveBeenCalledWith(
        `${API_BASE}${API_PATHS.nameByDomain('jay.dex')}`,
      );
    });
  });

  describe('reverse lookup', () => {
    it('returns the primary domain when one is set', async () => {
      fetchSpy.mockResolvedValueOnce(
        okResponse({ data: { address: '0xabc', name: 'jay.dex' } }),
      );

      const response = await onNameLookup({
        chainId: 'eip155:137',
        address: '0xabc',
      });

      expect(response).toStrictEqual({
        resolvedDomains: [
          { resolvedDomain: 'jay.dex', protocol: PROTOCOL_NAME },
        ],
      });
      expect(fetchSpy).toHaveBeenCalledWith(
        `${API_BASE}${API_PATHS.primaryByAddress('0xabc')}`,
      );
    });

    it('returns null when no primary domain is configured', async () => {
      fetchSpy.mockResolvedValueOnce(
        okResponse({ data: { address: '0xabc', name: null } }),
      );

      const response = await onNameLookup({
        chainId: 'eip155:137',
        address: '0xabc',
      });

      expect(response).toBeNull();
    });

    it('returns null when the backend errors', async () => {
      fetchSpy.mockResolvedValueOnce(errorResponse(503));

      const response = await onNameLookup({
        chainId: 'eip155:1',
        address: '0xabc',
      });

      expect(response).toBeNull();
    });
  });

  describe('does not fetch on unsupported chains', () => {
    it('skips the network call entirely for a non-mapped chainId', async () => {
      const response = await onNameLookup({
        chainId: 'eip155:43114',
        domain: 'jay.dex',
      });

      expect(response).toBeNull();
      expect(fetchSpy).not.toHaveBeenCalled();
    });
  });
});

describe('onRpcRequest (direct import)', () => {
  let fetchSpy: jest.SpiedFunction<typeof fetch>;

  beforeEach(() => {
    fetchSpy = jest.spyOn(globalThis, 'fetch');
  });

  afterEach(() => {
    fetchSpy.mockRestore();
  });

  it(`defaults chainId to ${DEFAULT_TEST_CHAIN_ID} when none is provided`, async () => {
    fetchSpy.mockResolvedValueOnce(
      okResponse(
        nameRecord('jay.dex', [
          { coinType: 60, symbol: 'ETH', address: '0xeth' },
          { coinType: 2147483785, symbol: 'POL', address: '0xpol' },
        ]),
      ),
    );

    const response = await onRpcRequest({
      origin: 'test',
      request: {
        jsonrpc: '2.0',
        id: 1,
        method: RPC_METHOD_TEST_NAME_LOOKUP,
        params: { domain: 'jay.dex' },
      },
    });

    expect(response).toMatchObject({
      resolvedAddresses: [{ resolvedAddress: '0xpol' }],
    });
  });

  it('honors an explicit chainId override (eip155:1 -> ETH)', async () => {
    fetchSpy.mockResolvedValueOnce(
      okResponse(
        nameRecord('jay.dex', [
          { coinType: 60, symbol: 'ETH', address: '0xeth' },
          { coinType: 2147483785, symbol: 'POL', address: '0xpol' },
        ]),
      ),
    );

    const response = await onRpcRequest({
      origin: 'test',
      request: {
        jsonrpc: '2.0',
        id: 2,
        method: RPC_METHOD_TEST_NAME_LOOKUP,
        params: { chainId: 'eip155:1', domain: 'jay.dex' },
      },
    });

    expect(response).toMatchObject({
      resolvedAddresses: [{ resolvedAddress: '0xeth' }],
    });
  });

  it('throws MethodNotFoundError (-32601) for unknown methods', async () => {
    await expect(
      onRpcRequest({
        origin: 'test',
        request: { jsonrpc: '2.0', id: 3, method: 'unknown-method' },
      }),
    ).rejects.toMatchObject({ code: -32601 });
  });
});
