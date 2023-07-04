import { IWeb3Context, useWeb3Context } from '@/app/contexts/web3Context';
import Grid from '@mui/material/Grid';
import NotAuthorizedLayout from '@/app/components/NotAuthorizedLayout';
import CompanyForm from '@/app/components/CompanyForm';
import { useEffect } from 'react';
import useDecentralHireContract from '@/app/hooks/useDecentralHireContract';
import { useRouter } from 'next/router';
import { ConnectedMode } from '@/app/hooks/useWeb3Provider';

export default function CompanyNew() {
  const router = useRouter();
  const {
    state: { isAuthenticated, address, connectedMode },
  } = useWeb3Context() as IWeb3Context;
  const contract = useDecentralHireContract();

  useEffect(() => {
    const setUp = async () => {
      if (contract) {
        const companyProfileAlreadyExists =
          await contract.isCompanyProfileByOwnerAddressExists(address);
        if (companyProfileAlreadyExists) {
          const companyProfileAddress = await contract.getCompanyProfileByOwner(
            address
          );
          router.push(`/company/${companyProfileAddress}`);
        }
      }
    };

    setUp();
  }, [contract, router, address]);

  if (!isAuthenticated || connectedMode !== ConnectedMode.COMPANY) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-between p-24">
        <NotAuthorizedLayout />
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <Grid container display="flex" alignItems="center">
        <Grid item display="flex" justifyContent="center" xs={12}>
          <CompanyForm />
        </Grid>
      </Grid>
    </main>
  );
}
