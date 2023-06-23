import { IWeb3Context, useWeb3Context } from '@/app/contexts/web3Context';
import Grid from '@mui/material/Grid';
import NotAuthorizedLayout from '@/app/components/NotAuthorizedLayout';
import { useEffect, useState } from 'react';
import useCompanyProfileContract from '@/app/hooks/useCompanyProfileContract';
import { useRouter } from 'next/router';
import { Button } from '@mui/material';
import Link from 'next/link';

export default function CompanyDetail() {
  const router = useRouter();
  const {
    state: { isAuthenticated },
  } = useWeb3Context() as IWeb3Context;
  const { id = '' } = router.query;

  const contract = useCompanyProfileContract(Array.isArray(id) ? id[0] : id);

  const [companyName, setCompanyName] = useState<string>('');
  const [companyWebsiteUrl, setCompanyWebsiteUrl] = useState<string>('');
  const [activeJobPostings, setActiveJobPostings] = useState<any[]>([]);

  useEffect(() => {
    const getCompanyProfile = async () => {
      if (!contract) {
        return;
      }
      const name = await contract.getCompanyName();
      const websiteUrl = await contract.getWebsiteUrl();
      const fetchedActiveJobPostings = await contract.listActiveJobPostings();
      console.log(fetchedActiveJobPostings);
      setCompanyName(name);
      setCompanyWebsiteUrl(websiteUrl);
      setActiveJobPostings(fetchedActiveJobPostings);
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
        <Grid item>
          <h2>Job Postings</h2>
        </Grid>
        <Grid container>
          {activeJobPostings.map((jobPosting) => (
            <Grid item xs={12} key={jobPosting.address}>
              <Link href={`/company/${id}/postings/${jobPosting.address}`}>
                {jobPosting}
              </Link>
            </Grid>
          ))}
        </Grid>
        <Grid item>
          <Link href={`/company/${id}/postings/new`}>
            <Button variant="contained" color="primary">
              Post Job
            </Button>
          </Link>
        </Grid>
      </Grid>
    </main>
  );
}
