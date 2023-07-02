import { IWeb3Context, useWeb3Context } from '@/app/contexts/web3Context';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import useDecentralHireContract from '@/app/hooks/useDecentralHireContract';
import { useRouter } from 'next/router';
import { useEffect, useState, useCallback } from 'react';
import { ConnectedMode } from '@/app/hooks/useWeb3Provider';

export default function Home() {
  const router = useRouter();
  const {
    connectWallet,
    disconnect,
    state: { isAuthenticated, address, connectedMode },
  } = useWeb3Context() as IWeb3Context;
  const [isLoading, setLoading] = useState(false);

  const decentralHireContract = useDecentralHireContract();

  const onConnectWalletAsApplicantClicked = async () => {
    setLoading(true);
    await connectWallet(ConnectedMode.APPLICANT);
    if (isAuthenticated) {
      router.push('/applicant');
    }
    setLoading(false);
  };

  const onConnectWalletAsCompanyClicked = async () => {
    setLoading(true);
    await connectWallet(ConnectedMode.COMPANY);
    setLoading(false);
  };

  const directUserForApplicantMode = useCallback(() => {
    router.push('/applicant');
  }, [router]);

  const directUserForCompanyMode = useCallback(async () => {
    if (!decentralHireContract) {
      await disconnect();
      return;
    }
    const companyProfileAlreadyExists =
      await decentralHireContract.isCompanyProfileByOwnerAddressExists(address);
    if (!companyProfileAlreadyExists) {
      router.push('/company/new');
    } else {
      const companyProfileAddress =
        await decentralHireContract.getCompanyProfileByOwner(address);
      router.push(`/company/${companyProfileAddress}`);
    }
  }, [decentralHireContract, address, router, disconnect]);

  useEffect(() => {
    const directUserToProperPageAfterAuthenticated = async () => {
      if (isAuthenticated && address) {
        if (connectedMode === ConnectedMode.COMPANY) {
          await directUserForCompanyMode();
          directUserForApplicantMode();
        } else {
          directUserForApplicantMode();
        }
      }
    };

    directUserToProperPageAfterAuthenticated();
  }, [
    isAuthenticated,
    decentralHireContract,
    address,
    router,
    disconnect,
    connectedMode,
    directUserForApplicantMode,
    directUserForCompanyMode,
  ]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <Box sx={{ flexGrow: 1 }}>
        <Grid container alignItems="center" justifyContent="center">
          <Grid item justifyContent="center" alignItems="center" xs={12}>
            <Grid
              container
              justifyContent="center"
              alignItems="center"
              spacing={5}
            >
              <Grid item xs={6}>
                <Button
                  color="primary"
                  variant="contained"
                  disableElevation
                  onClick={onConnectWalletAsApplicantClicked}
                  disabled={isLoading}
                  size="large"
                  sx={{ whiteSpace: 'nowrap' }}
                >
                  Connect as Applicant
                </Button>
              </Grid>
              <Grid item xs={6}>
                <Button
                  color="primary"
                  variant="contained"
                  disableElevation
                  onClick={onConnectWalletAsCompanyClicked}
                  disabled={isLoading}
                  size="large"
                  sx={{ whiteSpace: 'nowrap' }}
                >
                  Connect as Company
                </Button>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Box>
    </main>
  );
}
