import '../app/globals.css';
import type { AppProps } from 'next/app';
import Web3ContextProvider from '../app/contexts/web3Context';
import HeaderWrapper from '@/app/layout/HeaderWrapper';
import { ThemeProvider, createTheme } from '@mui/material';

const theme = createTheme({
  palette: {
    primary: {
      main: '#4f4f4f',
    },
    secondary: {
      main: '#fff',
      contrastText: '#4f4f4f',
      light: '#fff',
      dark: '#ddd',
    },
  },
});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider theme={theme}>
      <Web3ContextProvider>
        <HeaderWrapper>
          <Component {...pageProps} />
        </HeaderWrapper>
      </Web3ContextProvider>
    </ThemeProvider>
  );
}
