import { IWeb3Context, useWeb3Context } from '@/app/contexts/web3Context';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import useDecentralHireContract from '@/app/hooks/useDecentralHireContract';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { ConnectedMode } from '@/app/hooks/useWeb3Provider';

export default function Home() {
  const router = useRouter();
  const {
    connectWallet,
    disconnect,
    state: { isAuthenticated, address },
  } = useWeb3Context() as IWeb3Context;
  const [isLoading, setLoading] = useState(false);

  const decentralHireContract = useDecentralHireContract();

  const onConnectWalletAsCompanyClicked = async () => {
    setLoading(true);
    await connectWallet(ConnectedMode.COMPANY);
    if (isAuthenticated) {
      if (!decentralHireContract) {
        await disconnect();
        setLoading(false);
        return;
      }
      const companyProfileAlreadyExists =
        await decentralHireContract.isCompanyProfileByOwnerAddressExists(
          address
        );
      if (!companyProfileAlreadyExists) {
        router.push('/company/new');
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    const directUserToProperPageAfterAuthenticated = async () => {
      if (isAuthenticated && address) {
        if (!decentralHireContract) {
          await disconnect();
          return;
        }
        const companyProfileAlreadyExists =
          await decentralHireContract.isCompanyProfileByOwnerAddressExists(
            address
          );
        if (!companyProfileAlreadyExists) {
          router.push('/company/new');
        } else {
          const companyProfileAddress =
            await decentralHireContract.getCompanyProfileByOwner(address);
          router.push(`/company/${companyProfileAddress}`);
        }
      }
    };

    directUserToProperPageAfterAuthenticated();
  }, [isAuthenticated, decentralHireContract, address, router, disconnect]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <Box sx={{ flexGrow: 1 }}>
        <Grid container alignItems="center" justifyContent="center">
          <Grid item justifyContent="center" alignItems="center" xs={12}>
            <Button
              color="primary"
              variant="contained"
              disableElevation
              onClick={onConnectWalletAsCompanyClicked}
              disabled={isLoading}
            >
              Connect as Company
            </Button>
          </Grid>
        </Grid>
      </Box>
    </main>
  );
}
