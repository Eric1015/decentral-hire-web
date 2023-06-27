import { IWeb3Context, useWeb3Context } from '@/app/contexts/web3Context';
import Grid from '@mui/material/Grid';
import NotAuthorizedLayout from '@/app/components/NotAuthorizedLayout';
import { useEffect, useState } from 'react';
import useCompanyProfileContract from '@/app/hooks/useCompanyProfileContract';
import { useRouter } from 'next/router';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Link from 'next/link';
import Image from 'next/image';
import useIPFSFileUploader from '@/app/hooks/useIPFSFileUploader';
import JobPostingListItem from '@/app/components/JobPostingListItem';
import ModeEditIcon from '@mui/icons-material/ModeEdit';

export default function CompanyDetail() {
  const router = useRouter();
  const {
    state: { isAuthenticated },
  } = useWeb3Context() as IWeb3Context;
  const { companyProfileAddress = '' } = router.query;
  const { getFileUrl } = useIPFSFileUploader();

  const contract = useCompanyProfileContract(
    Array.isArray(companyProfileAddress)
      ? companyProfileAddress[0]
      : companyProfileAddress
  );

  const [logoUrl, setLogoUrl] = useState<string>('');
  const [companyName, setCompanyName] = useState<string>('');
  const [companyWebsiteUrl, setCompanyWebsiteUrl] = useState<string>('');
  const [activeJobPostings, setActiveJobPostings] = useState<any[]>([]);

  useEffect(() => {
    const getCompanyProfile = async () => {
      if (!contract) {
        return;
      }
      const logoCid = await contract.getLogoCid();
      const name = await contract.getCompanyName();
      const websiteUrl = await contract.getWebsiteUrl();
      const fetchedActiveJobPostings = await contract.listActiveJobPostings();
      setLogoUrl(getFileUrl(logoCid));
      setCompanyName(name);
      setCompanyWebsiteUrl(websiteUrl);
      setActiveJobPostings(fetchedActiveJobPostings);
    };

    getCompanyProfile();
  }, [contract, getFileUrl]);

  if (!isAuthenticated) {
    return <NotAuthorizedLayout />;
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <Grid container display="flex" alignItems="center">
        <Grid container>
          <Grid item xs={3}>
            <Image width={200} height={200} src={logoUrl} alt="" />
          </Grid>
          <Grid item>
            <Grid container>
              <Grid item xs={12}>
                <Typography component="h3" variant="h3">
                  {companyName}
                  <Link
                    href={`/company/${companyProfileAddress}/edit`}
                    style={{ marginLeft: 30 }}
                  >
                    <ModeEditIcon color="primary" />
                  </Link>
                </Typography>
              </Grid>
              <Grid item xs={12}>
                url:{' '}
                <a href={companyWebsiteUrl} style={{ color: '#42a5f5' }}>
                  {companyWebsiteUrl}
                </a>
              </Grid>
            </Grid>
          </Grid>
        </Grid>

        <Grid item sx={{ mt: 10 }}>
          <Typography component="h4" variant="h4">
            Job Postings
          </Typography>
        </Grid>
        <Grid container>
          {activeJobPostings.map((jobPosting) => (
            <Grid item xs={12} key={jobPosting.jobPostingAddress}>
              <Link
                href={`/company/${companyProfileAddress}/postings/${jobPosting.jobPostingAddress}`}
              >
                <JobPostingListItem jobPosting={jobPosting} />
              </Link>
            </Grid>
          ))}
        </Grid>
        <Grid item>
          <Link href={`/company/${companyProfileAddress}/postings/new`}>
            <Button variant="contained" color="primary">
              Post Job
            </Button>
          </Link>
        </Grid>
      </Grid>
    </main>
  );
}
