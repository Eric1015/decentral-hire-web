import { IWeb3Context, useWeb3Context } from '@/app/contexts/web3Context';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import useDecentralHireContract from '@/app/hooks/useDecentralHireContract';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

export default function Home() {
  const router = useRouter();
  const {
    connectWallet,
    disconnect,
    state: { isAuthenticated, address, currentChain },
  } = useWeb3Context() as IWeb3Context;

  const decentralHireContract = useDecentralHireContract();

  const onConnectWalletClicked = async () => {
    await connectWallet();
    if (isAuthenticated) {
      if (!decentralHireContract) {
        await disconnect();
        return;
      }
      const companyProfileAlreadyExists =
        await decentralHireContract.isCompanyProfileByOwnerAddressExists(
          address
        );
      console.log(companyProfileAlreadyExists);
      if (!companyProfileAlreadyExists) {
        router.push('/company/new');
      }
    }
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
        console.log(companyProfileAlreadyExists);
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
      <Grid container display="flex" alignItems="center">
        <Grid item display="flex" justifyContent="center" xs={12}>
          <h1>Welcome to DecentralHire for Company</h1>
        </Grid>
        <Grid item display="flex" justifyContent="center" xs={12}>
          {isAuthenticated ? (
            <Button onClick={disconnect}>Disconnect Wallet</Button>
          ) : (
            <Button onClick={onConnectWalletClicked}>Connect Wallet</Button>
          )}
        </Grid>
      </Grid>
    </main>
  );
}
