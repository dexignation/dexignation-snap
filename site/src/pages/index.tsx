import { useState } from 'react';
import styled from 'styled-components';

import {
  ConnectButton,
  InstallFlaskButton,
  ReconnectButton,
  Card,
} from '../components';
import { defaultSnapOrigin } from '../config';
import {
  useMetaMask,
  useMetaMaskContext,
  useRequestSnap,
} from '../hooks';
import { isLocalSnap, shouldDisplayReconnectButton } from '../utils';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  margin-top: 5.6rem;
  margin-bottom: 7.6rem;
  ${({ theme }) => theme.mediaQueries.small} {
    padding-left: 2.4rem;
    padding-right: 2.4rem;
    margin-top: 2rem;
    margin-bottom: 2rem;
    width: auto;
  }
`;

const Heading = styled.h1`
  margin-top: 0;
  margin-bottom: 1.2rem;
  text-align: center;
`;

const Span = styled.span`
  color: ${(props) => props.theme.colors.primary?.default};
`;

const Subtitle = styled.p`
  max-width: 72rem;
  color: ${({ theme }) => theme.colors.text?.alternative};
  font-size: ${({ theme }) => theme.fontSizes.large};
  font-weight: 500;
  line-height: 1.5;
  margin-top: 0;
  margin-bottom: 0;
  text-align: center;
  ${({ theme }) => theme.mediaQueries.small} {
    font-size: ${({ theme }) => theme.fontSizes.text};
  }
`;

const CardContainer = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: space-between;
  max-width: 80rem;
  width: 100%;
  height: 100%;
  margin-top: 1.5rem;
`;

const FeatureList = styled.ul`
  margin: 0;
  padding-left: 2rem;
  color: ${({ theme }) => theme.colors.text?.alternative};
  line-height: 1.6;
`;

const FieldGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.2rem;
  width: 100%;
  ${({ theme }) => theme.mediaQueries.small} {
    grid-template-columns: 1fr;
  }
`;

const Label = styled.label`
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  color: ${({ theme }) => theme.colors.text?.alternative};
  font-size: ${({ theme }) => theme.fontSizes.small};
  font-weight: 700;
`;

const Input = styled.input`
  min-height: 4.2rem;
  border: 1px solid ${({ theme }) => theme.colors.border?.default};
  border-radius: ${({ theme }) => theme.radii.button};
  background: ${({ theme }) => theme.colors.background?.default};
  color: ${({ theme }) => theme.colors.text?.default};
  font: inherit;
  padding: 0 1rem;
`;

const Select = styled.select`
  min-height: 4.2rem;
  border: 1px solid ${({ theme }) => theme.colors.border?.default};
  border-radius: ${({ theme }) => theme.radii.button};
  background: ${({ theme }) => theme.colors.background?.default};
  color: ${({ theme }) => theme.colors.text?.default};
  font: inherit;
  padding: 0 1rem;
`;

const ButtonRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-top: 1.6rem;
`;

const Output = styled.pre`
  width: 100%;
  min-height: 16rem;
  overflow: auto;
  background: ${({ theme }) => theme.colors.background?.alternative};
  border: 1px solid ${({ theme }) => theme.colors.border?.default};
  border-radius: ${({ theme }) => theme.radii.button};
  color: ${({ theme }) => theme.colors.text?.default};
  font-family: ${({ theme }) => theme.fonts.code};
  font-size: ${({ theme }) => theme.fontSizes.small};
  line-height: 1.5;
  margin: 1.6rem 0 0;
  padding: 1.6rem;
  white-space: pre-wrap;
  word-break: break-word;
`;

const ErrorMessage = styled.div`
  background-color: ${({ theme }) => theme.colors.error?.muted};
  border: 1px solid ${({ theme }) => theme.colors.error?.default};
  color: ${({ theme }) => theme.colors.error?.alternative};
  border-radius: ${({ theme }) => theme.radii.default};
  padding: 2.4rem;
  margin-bottom: 2.4rem;
  margin-top: 2.4rem;
  max-width: 80rem;
  width: 100%;
  ${({ theme }) => theme.mediaQueries.small} {
    padding: 1.6rem;
    margin-bottom: 1.2rem;
    margin-top: 1.2rem;
    max-width: 100%;
  }
`;

const API_BASE = 'https://www.dexignation.com/api/v1';

const formatResult = (value: unknown) =>
  typeof value === 'string' ? value : JSON.stringify(value, null, 2);

const Index = () => {
  const { error } = useMetaMaskContext();
  const { isFlask, snapsDetected, installedSnap } = useMetaMask();
  const requestSnap = useRequestSnap();
  const [chainSymbol, setChainSymbol] = useState('POL');
  const [domain, setDomain] = useState('dwjung.dex');
  const [address, setAddress] = useState(
    '0x79eB8Af70d4009f68D6d31d9dB9EDc35dE38525D',
  );
  const [preview, setPreview] = useState('Ready.');

  const isMetaMaskReady = isLocalSnap(defaultSnapOrigin)
    ? isFlask
    : snapsDetected;

  const previewDomain = async () => {
    const response = await fetch(
      `${API_BASE}/names/${encodeURIComponent(domain)}`,
    );
    if (!response.ok) {
      setPreview(`HTTP ${response.status}`);
      return;
    }

    const json = (await response.json()) as {
      data?: { addresses?: { symbol: string; address: string | null }[] };
    };
    const resolvedAddress =
      json.data?.addresses?.find((entry) => entry.symbol === chainSymbol)
        ?.address ?? null;

    setPreview(
      formatResult({
        domain,
        symbol: chainSymbol,
        resolvedAddress,
        raw: json,
      }),
    );
  };

  const previewAddress = async () => {
    const response = await fetch(
      `${API_BASE}/addresses/${encodeURIComponent(address)}/primary`,
    );
    if (!response.ok) {
      setPreview(`HTTP ${response.status}`);
      return;
    }

    setPreview(formatResult(await response.json()));
  };

  return (
    <Container>
      <Heading>
        <Span>DEXignation</Span> Snap
      </Heading>
      <Subtitle>
        Install DEXignation to let MetaMask resolve .dex domains through its
        native name lookup flow.
      </Subtitle>
      <CardContainer>
        {error && (
          <ErrorMessage>
            <b>An error happened:</b> {error.message}
          </ErrorMessage>
        )}
        {!isMetaMaskReady && (
          <Card
            content={{
              title: 'Install MetaMask Flask',
              description:
                'Local Snaps require MetaMask Flask. Use a separate browser profile if regular MetaMask is also installed.',
              button: <InstallFlaskButton />,
            }}
            fullWidth
          />
        )}
        {!installedSnap && (
          <Card
            content={{
              title: 'Connect',
              description: `Install and connect ${defaultSnapOrigin}.`,
              button: (
                <ConnectButton
                  onClick={requestSnap}
                  disabled={!isMetaMaskReady}
                />
              ),
            }}
            disabled={!isMetaMaskReady}
          />
        )}
        {shouldDisplayReconnectButton(installedSnap) && (
          <Card
            content={{
              title: 'Reconnect',
              description:
                'Reinstall the local Snap after rebuilding the bundle.',
              button: (
                <ReconnectButton
                  onClick={requestSnap}
                  disabled={!installedSnap}
                />
              ),
            }}
            disabled={!installedSnap}
          />
        )}
        <Card
          content={{
            title: 'What this Snap enables',
            description: (
              <FeatureList>
                <li>.dex forward resolution to chain-specific addresses.</li>
                <li>Reverse resolution from addresses to primary .dex names.</li>
                <li>Read-only API access with no keys or transaction signing.</li>
              </FeatureList>
            ),
          }}
          fullWidth
        />
        <Card
          content={{
            title: 'API Preview',
            description: (
              <>
                <FieldGrid>
                  <Label>
                    Chain symbol
                    <Select
                      value={chainSymbol}
                      onChange={(event) => setChainSymbol(event.target.value)}
                    >
                      <option value="POL">Polygon - POL</option>
                      <option value="ETH">Ethereum - ETH</option>
                      <option value="OP">Optimism - OP</option>
                      <option value="BNB">BNB Chain - BNB</option>
                      <option value="BASE">Base - BASE</option>
                      <option value="ARB">Arbitrum - ARB</option>
                      <option value="BTC">Bitcoin - BTC</option>
                      <option value="SOL">Solana - SOL</option>
                      <option value="TRX">Tron - TRX</option>
                    </Select>
                  </Label>
                  <Label>
                    Domain
                    <Input
                      value={domain}
                      onChange={(event) => setDomain(event.target.value)}
                    />
                  </Label>
                  <Label>
                    Address
                    <Input
                      value={address}
                      onChange={(event) => setAddress(event.target.value)}
                    />
                  </Label>
                </FieldGrid>
                <ButtonRow>
                  <button type="button" onClick={previewDomain}>
                    Preview Domain
                  </button>
                  <button type="button" onClick={previewAddress}>
                    Preview Address
                  </button>
                </ButtonRow>
                <Output>{preview}</Output>
              </>
            ),
          }}
          fullWidth
        />
      </CardContainer>
    </Container>
  );
};

export default Index;
