import { Box, AppBar, Toolbar, Typography, Button, Grid } from '@mui/material';
import Image from 'next/image';
import logo from '@public/logo.svg';
import Link from 'next/link';
import { IWeb3Context, useWeb3Context } from '../contexts/web3Context';

type Props = {
  children: React.ReactNode;
};

const HeaderWrapper = ({ children }: Props) => {
  const {
    disconnect,
    state: { isAuthenticated },
  } = useWeb3Context() as IWeb3Context;
  return (
    <div>
      <Box sx={{ flexGrow: 1 }}>
        <AppBar position="static" color="primary">
          <Toolbar>
            <Box display="flex" flexGrow={1}>
              <Link href="/">
                <Grid container alignItems="center">
                  <Grid item>
                    <Image src={logo} alt="logo" height={60} />
                  </Grid>
                  <Grid item>
                    <Typography
                      variant="h6"
                      component="div"
                      sx={{ flexGrow: 1 }}
                    >
                      DecentralHire
                    </Typography>
                  </Grid>
                </Grid>
              </Link>
            </Box>
            {isAuthenticated && (
              <Button
                color="secondary"
                onClick={disconnect}
                variant="contained"
                disableElevation
              >
                Disconnect
              </Button>
            )}
          </Toolbar>
        </AppBar>
      </Box>
      {children}
    </div>
  );
};

export default HeaderWrapper;
