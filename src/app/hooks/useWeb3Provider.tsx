import { BrowserProvider, ethers, JsonRpcSigner } from 'ethers';
import { useCallback, useEffect, useState } from 'react';

export enum ConnectedMode {
  APPLICANT = 'APPLICANT',
  COMPANY = 'COMPANY',
}

export interface IWeb3State {
  address: string | null;
  currentChain: number | null;
  signer: JsonRpcSigner | null;
  provider: BrowserProvider | null;
  isAuthenticated: boolean;
  connectedMode: ConnectedMode | null;
}

const useWeb3Provider = () => {
  const initialWeb3State = {
    address: null,
    currentChain: null,
    signer: null,
    provider: null,
    isAuthenticated: false,
    connectedMode: null,
  };

  const [state, setState] = useState<IWeb3State>(initialWeb3State);

  const connectWallet = useCallback(
    async (inputConnectedMode: ConnectedMode) => {
      if (state.isAuthenticated) return;

      try {
        const { ethereum } = window;

        const provider = new ethers.BrowserProvider(ethereum);

        const accounts: string[] = await provider.send(
          'eth_requestAccounts',
          []
        );

        if (accounts.length > 0) {
          const signer = await provider.getSigner();
          const chain = Number(await (await provider.getNetwork()).chainId);

          setState({
            ...state,
            address: accounts[0],
            signer,
            currentChain: chain,
            provider,
            isAuthenticated: true,
            connectedMode: inputConnectedMode,
          });

          localStorage.setItem('isAuthenticated', 'true');
          localStorage.setItem('connectedMode', inputConnectedMode);
        }
      } catch {}
    },
    [state]
  );

  const disconnect = () => {
    setState(initialWeb3State);
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('connectedMode');
  };

  useEffect(() => {
    if (window == null) return;

    if (
      localStorage.hasOwnProperty('isAuthenticated') &&
      localStorage.hasOwnProperty('connectedMode')
    ) {
      connectWallet(localStorage.getItem('connectedMode') as ConnectedMode);
    }
  }, [connectWallet, state.isAuthenticated]);

  useEffect(() => {
    if (typeof window.ethereum === 'undefined') return;

    window.ethereum.on('accountsChanged', (accounts: string[]) => {
      setState({ ...state, address: accounts[0] });
    });

    window.ethereum.on('networkChanged', (network: string) => {
      setState({ ...state, currentChain: Number(network) });
    });

    return () => {
      window.ethereum.removeAllListeners();
    };
  }, [state]);

  return {
    connectWallet,
    disconnect,
    state,
  };
};

export default useWeb3Provider;
