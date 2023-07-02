import { IWeb3Context, useWeb3Context } from '@/app/contexts/web3Context';
import Grid from '@mui/material/Grid';
import NotAuthorizedLayout from '@/app/components/NotAuthorizedLayout';
import { useEffect, useState } from 'react';
import LinearProgress from '@mui/material/LinearProgress';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { useRouter } from 'next/router';
import Typography from '@mui/material/Typography';
import useIPFSFileUploader from '@/app/hooks/useIPFSFileUploader';
import useJobPostingContract from '@/app/hooks/useJobPostingContract';
import { JobPosting } from '@/app/types/JobPosting';
import ReactMarkdown from 'react-markdown';
import ConfirmationDialog from '@/app/components/ConfirmationDialog';
import useCompanyProfileContract from '@/app/hooks/useCompanyProfileContract';
import { ConnectedMode } from '@/app/hooks/useWeb3Provider';
import ApplyForJobForm from '@/app/components/ApplyForJobForm';
import useFirestore, {
  SupportedCollectionName,
} from '@/app/hooks/userFirestore';
import { where } from 'firebase/firestore';

export default function JobPostingDetail() {
  const router = useRouter();
  const {
    state: { isAuthenticated, address, connectedMode },
  } = useWeb3Context() as IWeb3Context;
  const { companyProfileAddress = '', jobPostingAddress = '' } = router.query;
  const { getFileContent } = useIPFSFileUploader();
  const [owner, setOwner] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [country, setCountry] = useState<string>('');
  const [city, setCity] = useState<string>('');
  const [isRemote, setIsRemote] = useState<boolean>(false);
  const [currentHiredCount, setCurrentHiredCount] = useState<number>(0);
  const [totalHiringCount, setTotalHiringCount] = useState<number>(0);
  const [isCloseJobPostingDialogOpen, setIsCloseJobPostingDialogOpen] =
    useState(false);
  const [closeJobPostingReason, setCloseJobPostingReason] =
    useState<string>('');
  const [isJobAlreadyApplied, setIsJobAlreadyApplied] =
    useState<boolean>(false);
  const { queryDocs } = useFirestore();

  const companyProfileContract = useCompanyProfileContract(
    Array.isArray(companyProfileAddress)
      ? companyProfileAddress[0]
      : companyProfileAddress
  );
  const contract = useJobPostingContract(
    Array.isArray(jobPostingAddress) ? jobPostingAddress[0] : jobPostingAddress
  );

  const handleJobPostingConfirmOpen = () => {
    setIsCloseJobPostingDialogOpen(true);
  };

  const handleJobPostingConfirmClose = () => {
    setIsCloseJobPostingDialogOpen(false);
  };

  const handleCloseJobPostingConfirm = async () => {
    if (!companyProfileContract) {
      return;
    }
    await companyProfileContract.closePosting(
      jobPostingAddress,
      closeJobPostingReason
    );
    router.push(`/company/${companyProfileAddress}`);
  };

  useEffect(() => {
    const getCompanyProfile = async () => {
      if (!contract) {
        return;
      }
      const jobPosting: JobPosting = await contract.getJobPostingMetadata();
      const jobDescription = await getFileContent(
        jobPosting.jobDescriptionIpfsHash
      );
      setOwner(jobPosting.owner);
      setDescription(jobDescription || '');
      setTitle(jobPosting.title);
      setCountry(jobPosting.country);
      setCity(jobPosting.city);
      setIsRemote(jobPosting.isRemote);
      setCurrentHiredCount(Number(jobPosting.currentHiredCount));
      setTotalHiringCount(Number(jobPosting.totalHiringCount));
    };

    getCompanyProfile();
  }, [contract, getFileContent]);

  useEffect(() => {
    const getApplicationStatus = async () => {
      const data = await queryDocs(
        SupportedCollectionName.JOB_APPLICATIONS,
        undefined,
        where('applicantAddress', '==', address?.toLowerCase()),
        where(
          'jobPostingAddress',
          '==',
          (Array.isArray(jobPostingAddress)
            ? jobPostingAddress[0]
            : jobPostingAddress
          ).toLowerCase()
        )
      );
      if (data.length > 0) {
        setIsJobAlreadyApplied(true);
      } else {
        setIsJobAlreadyApplied(false);
      }
    };

    getApplicationStatus();
  }, [address, jobPostingAddress, queryDocs]);

  if (!isAuthenticated) {
    return <NotAuthorizedLayout />;
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <Grid container display="flex" alignItems="center">
        <Grid item xs={12}>
          <Grid container>
            <Box display="flex" flexGrow={1}>
              <Typography component="h4" variant="h4">
                {title}
              </Typography>
            </Box>
            {connectedMode === ConnectedMode.COMPANY &&
              owner.toLowerCase() === address?.toLowerCase() && (
                <Button
                  color="error"
                  variant="contained"
                  onClick={handleJobPostingConfirmOpen}
                >
                  Close Posting
                </Button>
              )}
          </Grid>
        </Grid>
        <Grid item xs={12}>
          <Typography component="h6" variant="h6">{`${city}, ${country} ${
            isRemote ? '(Remote)' : ''
          }`}</Typography>
        </Grid>
        <Grid item xs={12} sx={{ mt: 3 }}>
          <Grid container>
            <Grid item xs={9}>
              <p>Hiring status</p>
              <LinearProgress
                variant="determinate"
                value={(currentHiredCount * 100) / totalHiringCount}
              />
            </Grid>
            <Grid item xs={3}>
              <p>{`${currentHiredCount}/${totalHiringCount}`}</p>
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={12} sx={{ mt: 5 }}>
          <article className="prose">
            <ReactMarkdown>{description}</ReactMarkdown>
          </article>
        </Grid>
        {connectedMode === ConnectedMode.APPLICANT &&
          address?.toLowerCase() !== owner.toLowerCase() &&
          !isJobAlreadyApplied && (
            <Grid item xs={12} sx={{ mt: 10 }}>
              <ApplyForJobForm
                jobPostingAddress={
                  Array.isArray(jobPostingAddress)
                    ? jobPostingAddress[0]
                    : jobPostingAddress
                }
              />
            </Grid>
          )}
        {isJobAlreadyApplied && (
          <Grid item xs={12} sx={{ mt: 10 }}>
            <Typography component="h6" variant="h6">
              You have already applied for this job
            </Typography>
          </Grid>
        )}
      </Grid>
      <ConfirmationDialog
        isOpen={isCloseJobPostingDialogOpen}
        onClose={handleJobPostingConfirmClose}
        onConfirm={handleCloseJobPostingConfirm}
        title="Are you sure to close job posting?"
        content="Once you close the job posting, you can't reopen it."
        reason={closeJobPostingReason}
        onReasonChange={setCloseJobPostingReason}
      />
    </main>
  );
}
