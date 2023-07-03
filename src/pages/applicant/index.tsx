import { IWeb3Context, useWeb3Context } from '@/app/contexts/web3Context';
import Grid from '@mui/material/Grid';
import NotAuthorizedLayout from '@/app/components/NotAuthorizedLayout';
import { useEffect, useState, MouseEvent } from 'react';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Link from 'next/link';
import JobPostingListItem from '@/app/components/JobPostingListItem';
import { JobPosting } from '@/app/types/JobPosting';
import useFirestore, {
  SupportedCollectionName,
} from '@/app/hooks/userFirestore';
import { where } from 'firebase/firestore';
import { Contract } from 'ethers';
import companyProfileAbi from '@/app/abis/CompanyProfile.json';
import jobPostingAbi from '@/app/abis/JobPosting.json';
import { CompanyProfile } from '@/app/types/CompanyProfile';

type CompanyProfileAndJobPosting = {
  companyProfile: CompanyProfile;
  jobPosting: JobPosting;
};

export default function Applicant() {
  const {
    state: { isAuthenticated, signer },
  } = useWeb3Context() as IWeb3Context;

  const [
    activeJobPostingsWithCompanyProfile,
    setActiveJobPostingsWithCompanyProfile,
  ] = useState<CompanyProfileAndJobPosting[]>([]);
  const { queryDocs } = useFirestore();

  // needs to do this in order to prevent the default behavior of the button so the link behavior can be used
  const handleApplicationsClick = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  useEffect(() => {
    const getJobPostings = async () => {
      const data = await queryDocs(
        SupportedCollectionName.JOB_POSTINGS,
        undefined,
        where('isActive', '==', true)
      );
      const jobPostingsPromises = data.map(async (doc) => {
        const contract = new Contract(
          doc.contractAddress,
          jobPostingAbi,
          signer
        );
        const jobPosting: JobPosting = await contract.getJobPostingMetadata();
        return jobPosting;
      });
      const jobPostings = await Promise.all(jobPostingsPromises);
      const companyProfileAndJobPostingPromises = jobPostings.map(
        async (jobPosting) => {
          const contract = new Contract(
            jobPosting.companyProfileAddress,
            companyProfileAbi,
            signer
          );
          const companyName = await contract.getCompanyName();
          const websiteUrl = await contract.getWebsiteUrl();
          const logoCid = await contract.getLogoCid();
          return {
            jobPosting,
            companyProfile: {
              companyName,
              websiteUrl,
              logoCid,
            },
          };
        }
      );
      const companyProfileAndJobPostings = await Promise.all(
        companyProfileAndJobPostingPromises
      );
      setActiveJobPostingsWithCompanyProfile(companyProfileAndJobPostings);
    };

    getJobPostings();
  }, [queryDocs, signer]);

  if (!isAuthenticated) {
    return <NotAuthorizedLayout />;
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <Grid container display="flex" alignItems="center">
        <Grid item sx={{ mt: 5, mb: 5 }} xs={12}>
          <Link href="/applicant/applications">
            <Button
              color="primary"
              onClick={handleApplicationsClick}
              variant="contained"
            >
              Your Applications
            </Button>
          </Link>
        </Grid>
        <Grid item sx={{ mt: 5 }} xs={12}>
          <Typography component="h4" variant="h4">
            Job Postings
          </Typography>
        </Grid>
        <Grid container>
          {activeJobPostingsWithCompanyProfile.map(
            (jobPostingWithCompanyProfile) => (
              <Grid
                item
                xs={12}
                key={jobPostingWithCompanyProfile.jobPosting.jobPostingAddress}
              >
                <Link
                  href={`/company/${jobPostingWithCompanyProfile.jobPosting.companyProfileAddress}/postings/${jobPostingWithCompanyProfile.jobPosting.jobPostingAddress}`}
                >
                  <JobPostingListItem
                    jobPosting={jobPostingWithCompanyProfile.jobPosting}
                    companyProfile={jobPostingWithCompanyProfile.companyProfile}
                  />
                </Link>
              </Grid>
            )
          )}
        </Grid>
      </Grid>
    </main>
  );
}
