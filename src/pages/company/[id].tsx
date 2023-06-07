import { IWeb3Context, useWeb3Context } from '@/app/contexts/web3Context';
import Grid from '@mui/material/Grid';
import NotAuthorizedLayout from '@/app/components/NotAuthorizedLayout';
import { useEffect, useState } from 'react';
import useCompanyProfileContract from '@/app/hooks/useCompanyProfileContract';
import { useRouter } from 'next/router';

export default function CompanyDetail() {
  const router = useRouter();
  const {
    state: { isAuthenticated },
  } = useWeb3Context() as IWeb3Context;
  const { id = '' } = router.query;

  console.log(id);
  const contract = useCompanyProfileContract(Array.isArray(id) ? id[0] : id);

  const [companyName, setCompanyName] = useState<string>('');
  const [companyWebsiteUrl, setCompanyWebsiteUrl] = useState<string>('');

  useEffect(() => {
    const getCompanyProfile = async () => {
      if (!contract) {
        return;
      }
      const name = await contract.getCompanyName();
      const websiteUrl = await contract.getWebsiteUrl();
      setCompanyName(name);
      setCompanyWebsiteUrl(websiteUrl);
    };

    getCompanyProfile();
  }, [contract]);

  if (!isAuthenticated) {
    return <NotAuthorizedLayout />;
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <Grid container display="flex" alignItems="center">
        <Grid item display="flex" justifyContent="center" xs={12}>
          <h1>{companyName}</h1>
        </Grid>
        <Grid item display="flex" justifyContent="center" xs={12}>
          {companyWebsiteUrl}
        </Grid>
      </Grid>
    </main>
  );
}
