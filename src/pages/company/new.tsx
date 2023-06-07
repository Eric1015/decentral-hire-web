import { IWeb3Context, useWeb3Context } from '@/app/contexts/web3Context';
import Grid from '@mui/material/Grid';
import NotAuthorizedLayout from '@/app/components/NotAuthorizedLayout';
import NewCompanyForm from '@/app/components/NewCompanyForm';

export default function CompanyNew() {
  const {
    connectWallet,
    disconnect,
    state: { isAuthenticated, address, currentChain },
  } = useWeb3Context() as IWeb3Context;

  if (!isAuthenticated) {
    return <NotAuthorizedLayout />;
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <Grid container display="flex" alignItems="center">
        <Grid item display="flex" justifyContent="center" xs={12}>
          <h1>Create new Company Profile</h1>
        </Grid>
        <Grid item display="flex" justifyContent="center" xs={12}>
          <NewCompanyForm />
        </Grid>
      </Grid>
    </main>
  );
}
