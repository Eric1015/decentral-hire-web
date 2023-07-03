import { IWeb3Context, useWeb3Context } from '@/app/contexts/web3Context';
import Grid from '@mui/material/Grid';
import NotAuthorizedLayout from '@/app/components/NotAuthorizedLayout';
import { useCallback, useEffect, useRef, useState } from 'react';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import Link from 'next/link';
import { JobPosting } from '@/app/types/JobPosting';
import { Contract } from 'ethers';
import jobPostingAbi from '@/app/abis/JobPosting.json';
import {
  ApplicationStatus,
  JobApplication,
  toApplicationStatusNumber,
} from '@/app/types/JobApplication';
import { useRouter } from 'next/router';
import useJobApplicationContract from '@/app/hooks/useJobApplicationContract';
import useLitFileProvider from '@/app/hooks/useLitFileProvider';

export default function Application() {
  const router = useRouter();
  const downloadLink = useRef<HTMLAnchorElement>(null);
  const { jobApplicationAddress = '' } = router.query;
  const {
    state: { isAuthenticated, signer, address },
  } = useWeb3Context() as IWeb3Context;
  const jobApplicationContract = useJobApplicationContract(
    Array.isArray(jobApplicationAddress)
      ? jobApplicationAddress[0]
      : jobApplicationAddress
  );
  const { decrypt } = useLitFileProvider();

  const [isDownloadOfferClicked, setIsDownloadOfferClicked] = useState(false);
  const [jobApplication, setJobApplication] = useState<JobApplication>();
  const [jobPosting, setJobPosting] = useState<JobPosting>();
  const [offerFile, setOfferFile] = useState<File | null>();
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [showSuccessSnackbar, setShowSuccessSnackbar] = useState(false);
  const [successSnackbarMessage, setSuccessSnackbarMessage] = useState('');

  const handleClose = () => {
    setShowSnackbar(false);
  };

  const handleSuccessSnackbarClose = () => {
    setShowSuccessSnackbar(false);
  };

  const downloadOffer = useCallback(async () => {
    if (offerFile && downloadLink.current) {
      downloadLink.current.click();
      setIsDownloadOfferClicked(false);
    }
  }, [offerFile, downloadLink]);

  const handleDownloadOfferClick = async () => {
    setIsDownloadOfferClicked(true);
    if (offerFile) {
      downloadOffer();
      return;
    }
    if (jobApplication?.offerCid) {
      const decryptedFile = await decrypt(jobApplication?.offerCid);
      if (decryptedFile) {
        setOfferFile(decryptedFile);
      } else {
        alert('Not authorized to access this file.');
      }
    }
  };

  const handleAcceptOfferClick = async () => {
    if (!jobApplicationContract) {
      return;
    }
    try {
      await jobApplicationContract.acceptOffer();
      setShowSuccessSnackbar(true);
      setSuccessSnackbarMessage('Offer accepted successfully.');
      router.push('/applicant/applications');
    } catch (error) {
      console.log(error);
      setShowSnackbar(true);
      setSnackbarMessage((error as Error).message);
    }
  };

  const handleDeclineOfferClick = async () => {
    if (!jobApplicationContract) {
      return;
    }
    try {
      await jobApplicationContract.declineOffer();
      setShowSuccessSnackbar(true);
      setSuccessSnackbarMessage('Offer declined successfully.');
      router.push('/applicant/applications');
    } catch (error) {
      console.log(error);
      setShowSnackbar(true);
      setSnackbarMessage((error as Error).message);
    }
  };

  useEffect(() => {
    if (offerFile && downloadLink.current && isDownloadOfferClicked) {
      downloadOffer();
    }
  }, [downloadLink, offerFile, isDownloadOfferClicked, downloadOffer]);

  useEffect(() => {
    const getJobApplication = async () => {
      if (jobApplicationContract) {
        const result = await jobApplicationContract.getJobApplicationMetadata();
        const fetchedJobApplication = new JobApplication(
          result.jobApplicationAddress,
          result.applicantAddress,
          result.jobPostingAddress,
          result.companyProfileOwner,
          result.resumeCid,
          result.offerCid,
          toApplicationStatusNumber(result.applicationStatus)
        );
        setJobApplication(fetchedJobApplication);

        const jobPostingContract = new Contract(
          result.jobPostingAddress,
          jobPostingAbi,
          signer
        );
        const fetchedJobPosting: JobPosting =
          await jobPostingContract.getJobPostingMetadata();
        setJobPosting(fetchedJobPosting);
      }
    };

    getJobApplication();
  }, [jobApplicationContract, signer]);

  if (!isAuthenticated) {
    return <NotAuthorizedLayout />;
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <Grid container display="flex" alignItems="center">
        <Grid item sx={{ mt: 10 }}>
          <Typography component="h4" variant="h4">
            Status: {jobApplication?.getDisplayableApplicationStatus()}
          </Typography>
        </Grid>
        <Grid container>
          <Grid item xs={12}>
            {jobApplication?.offerCid && (
              <div>
                <Button
                  color="primary"
                  onClick={handleDownloadOfferClick}
                  variant="contained"
                >
                  Download Offer
                </Button>
                <a
                  ref={downloadLink}
                  download={'offer'}
                  href={offerFile ? URL.createObjectURL(offerFile) : ''}
                ></a>
              </div>
            )}
          </Grid>
          {jobApplication?.currentStatus === ApplicationStatus.OfferSent && (
            <Grid item xs={12} sx={{ mt: 3, mb: 3 }}>
              <Grid container spacing={2}>
                <Grid item>
                  <Button
                    color="primary"
                    variant="contained"
                    onClick={handleAcceptOfferClick}
                  >
                    Accept Offer
                  </Button>
                </Grid>
                <Grid item>
                  <Button
                    color="error"
                    variant="contained"
                    onClick={handleDeclineOfferClick}
                  >
                    Decline Offer
                  </Button>
                </Grid>
              </Grid>
            </Grid>
          )}

          <Grid item xs={12}>
            <Link
              style={{ color: '#42a5f5' }}
              href={`/company/${jobPosting?.companyProfileAddress}/postings/${jobPosting?.jobPostingAddress}`}
            >
              Link to Job Posting
            </Link>
          </Grid>
        </Grid>
        <Snackbar
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
          open={showSnackbar}
          onClose={handleClose}
        >
          <Alert onClose={handleClose} severity="error" sx={{ width: '100%' }}>
            {snackbarMessage}
          </Alert>
        </Snackbar>
        <Snackbar
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
          open={showSuccessSnackbar}
          onClose={handleSuccessSnackbarClose}
        >
          <Alert
            onClose={handleSuccessSnackbarClose}
            severity="success"
            sx={{ width: '100%' }}
          >
            {successSnackbarMessage}
          </Alert>
        </Snackbar>
      </Grid>
    </main>
  );
}
