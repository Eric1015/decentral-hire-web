import '../app/globals.css';
import type { AppProps } from 'next/app';
import Web3ContextProvider from '../app/contexts/web3Context';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <Web3ContextProvider>
      <Component {...pageProps} />
    </Web3ContextProvider>
  );
}
