import { IWeb3Context, useWeb3Context } from '@/app/contexts/web3Context';
import Grid from '@mui/material/Grid';
import NotAuthorizedLayout from '@/app/components/NotAuthorizedLayout';
import { useEffect, useState } from 'react';
import Typography from '@mui/material/Typography';
import Link from 'next/link';
import { JobPosting } from '@/app/types/JobPosting';
import useFirestore, {
  SupportedCollectionName,
} from '@/app/hooks/userFirestore';
import { orderBy, where } from 'firebase/firestore';
import { Contract } from 'ethers';
import companyProfileAbi from '@/app/abis/CompanyProfile.json';
import jobApplicationAbi from '@/app/abis/JobApplication.json';
import jobPostingAbi from '@/app/abis/JobPosting.json';
import { CompanyProfile } from '@/app/types/CompanyProfile';
import {
  ApplicationStatus,
  JobApplication,
  toApplicationStatusNumber,
} from '@/app/types/JobApplication';
import JobApplicationListItem from '@/app/components/JobApplicationListItem';

type CompanyProfileAndJobPostingAndJobApplication = {
  companyProfile: CompanyProfile;
  jobPosting: JobPosting;
  jobApplication: JobApplication;
};

export default function Applications() {
  const {
    state: { isAuthenticated, signer, address },
  } = useWeb3Context() as IWeb3Context;

  const [
    jobApplicationsWithJobPostingsWithCompanyProfile,
    setJobApplicationsWithJobPostingsWithCompanyProfile,
  ] = useState<CompanyProfileAndJobPostingAndJobApplication[]>([]);
  const { queryDocs } = useFirestore();

  useEffect(() => {
    const getJobApplications = async () => {
      if (!address) {
        return;
      }
      const data = await queryDocs(
        SupportedCollectionName.JOB_APPLICATIONS,
        undefined,
        where('applicantAddress', '==', address.toLowerCase()),
        orderBy('status', 'asc')
      );
      const jobApplicationsPromises = data.map(async (doc) => {
        const jobApplicationContract = new Contract(
          doc.contractAddress,
          jobApplicationAbi,
          signer
        );
        const fetchedJobApplication =
          await jobApplicationContract.getJobApplicationMetadata();
        const jobPostingContract = new Contract(
          doc.jobPostingAddress,
          jobPostingAbi,
          signer
        );
        const jobPosting = await jobPostingContract.getJobPostingMetadata();
        const companyProfileContract = new Contract(
          jobPosting.companyProfileAddress,
          companyProfileAbi,
          signer
        );
        const companyName = await companyProfileContract.getCompanyName();
        const websiteUrl = await companyProfileContract.getWebsiteUrl();
        const logoCid = await companyProfileContract.getLogoCid();
        return {
          jobApplication: new JobApplication(
            fetchedJobApplication.jobApplicationAddress,
            fetchedJobApplication.applicantAddress,
            fetchedJobApplication.jobPostingAddress,
            fetchedJobApplication.companyProfileOwner,
            fetchedJobApplication.resumeCid,
            fetchedJobApplication.offerCid,
            toApplicationStatusNumber(fetchedJobApplication.applicationStatus)
          ),
          jobPosting,
          companyProfile: {
            companyName,
            websiteUrl,
            logoCid,
          },
        };
      });
      const jobApplications = await Promise.all(jobApplicationsPromises);
      setJobApplicationsWithJobPostingsWithCompanyProfile(jobApplications);
    };

    getJobApplications();
  }, [queryDocs, signer, address]);

  if (!isAuthenticated) {
    return <NotAuthorizedLayout />;
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <Grid container display="flex" alignItems="center">
        <Grid item sx={{ mt: 10 }}>
          <Typography component="h4" variant="h4">
            Job Applications
          </Typography>
        </Grid>
        <Grid container>
          {jobApplicationsWithJobPostingsWithCompanyProfile.map((obj) => (
            <Grid item xs={12} key={obj.jobApplication.jobApplicationAddress}>
              <Link
                href={`/applicant/applications/${obj.jobApplication.jobApplicationAddress}`}
              >
                <JobApplicationListItem
                  jobApplication={obj.jobApplication}
                  jobPosting={obj.jobPosting}
                  companyProfile={obj.companyProfile}
                />
              </Link>
            </Grid>
          ))}
        </Grid>
      </Grid>
    </main>
  );
}
