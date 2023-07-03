import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import { ApplicationStatus, JobApplication } from '../types/JobApplication';
import { Typography } from '@mui/material';
import { useCallback, useEffect, useRef, useState } from 'react';
import useLitFileProvider from '../hooks/useLitFileProvider';
import useJobPostingContract from '../hooks/useJobPostingContract';

type Props = {
  jobApplication: JobApplication;
};

const JobApplicationApplicantInfoListeItem = ({ jobApplication }: Props) => {
  const { encrypt, decrypt } = useLitFileProvider();
  const downloadLink = useRef<HTMLAnchorElement>(null);
  const uploadOfferInput = useRef<HTMLInputElement>(null);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [isDownloadResumeClicked, setIsDownloadResumeClicked] =
    useState<boolean>(false);
  const [isSendOfferClicked, setIsSendOfferClicked] = useState<boolean>(false);
  const [offerFile, setOfferFile] = useState<File | null>(null);
  const [isOfferSent, setIsOfferSent] = useState<boolean>(false);
  const [isHired, setIsHired] = useState<boolean>(false);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [showSuccessSnackbar, setShowSuccessSnackbar] = useState(false);
  const [successSnackbarMessage, setSuccessSnackbarMessage] = useState('');
  const contract = useJobPostingContract(jobApplication.jobPostingAddress);

  const handleClose = () => {
    setShowSnackbar(false);
  };

  const handleSuccessSnackbarClose = () => {
    setShowSuccessSnackbar(false);
  };

  const downloadResume = useCallback(async () => {
    if (resumeFile && downloadLink.current) {
      downloadLink.current.click();
      setIsDownloadResumeClicked(false);
    }
  }, [resumeFile, downloadLink]);

  const handleDownloadResumeClick = async () => {
    setIsDownloadResumeClicked(true);
    if (resumeFile) {
      downloadResume();
      return;
    }
    if (jobApplication.resumeCid) {
      const decryptedFile = await decrypt(jobApplication.resumeCid);
      if (decryptedFile) {
        setResumeFile(decryptedFile);
      } else {
        alert('Not authorized to access this file.');
      }
    }
  };

  const handleSendOfferClick = async () => {
    if (uploadOfferInput.current) {
      setIsSendOfferClicked(true);
      uploadOfferInput.current.click();
    }
  };

  const handleSendOffer = useCallback(async () => {
    try {
      if (!contract) {
        throw new Error('Contract not initialized');
      }
      const cid = await encrypt(
        offerFile as File,
        jobApplication.applicantAddress
      );
      await contract.sendOffer(jobApplication.applicantAddress, cid);
      setSuccessSnackbarMessage('Offer sent successfully');
      setShowSuccessSnackbar(true);
      setIsOfferSent(true);
    } catch (error) {
      console.error(error);
      setSnackbarMessage(`Error sending offer: ${(error as Error).message}`);
      setShowSnackbar(true);
    }
  }, [jobApplication, offerFile, contract, encrypt]);

  const handleHireClick = async () => {
    try {
      if (!contract) {
        throw new Error("Couldn't load contract");
      }
      await contract.hire(jobApplication.applicantAddress);
      setSuccessSnackbarMessage('Applicant hired successfully');
      setShowSuccessSnackbar(true);
      setIsHired(true);
    } catch (error) {
      console.error(error);
      setSnackbarMessage(`Error hiring applicant: ${(error as Error).message}`);
      setShowSnackbar(true);
    }
  };

  const handleDeclineClick = async () => {
    try {
      if (!contract) {
        throw new Error("Couldn't load contract");
      }
      await contract.decline(jobApplication.applicantAddress);
      setSuccessSnackbarMessage('Applicant declined successfully');
      setShowSuccessSnackbar(true);
    } catch (error) {
      console.error(error);
      setSnackbarMessage(
        `Error declining applicant: ${(error as Error).message}`
      );
      setShowSnackbar(true);
    }
  };

  const handleOfferUploaded = (e: any) => {
    setOfferFile(e.target.files[0]);
  };

  const getNextActionButton = () => {
    switch (jobApplication.currentStatus) {
      case ApplicationStatus.InProgress:
        return (
          <div>
            <Button
              color="primary"
              variant="contained"
              onClick={handleSendOfferClick}
              disabled={isOfferSent}
            >
              Send Offer
            </Button>
            <input
              ref={uploadOfferInput}
              onChange={handleOfferUploaded}
              type="file"
              style={{ display: 'none' }}
            />
          </div>
        );
      case ApplicationStatus.OfferAccepted:
        return (
          <Button
            color="primary"
            variant="contained"
            onClick={handleHireClick}
            disabled={isHired}
          >
            Hire
          </Button>
        );
      default:
        return <></>;
    }
  };

  useEffect(() => {
    if (resumeFile && downloadLink.current && isDownloadResumeClicked) {
      downloadResume();
    }
  }, [downloadLink, resumeFile, isDownloadResumeClicked, downloadResume]);

  useEffect(() => {
    if (offerFile && isSendOfferClicked) {
      handleSendOffer();
      setIsSendOfferClicked(false);
    }
  }, [offerFile, handleSendOffer, isSendOfferClicked]);

  return (
    <Paper elevation={1}>
      <Container sx={{ pt: 5, pb: 5, mt: 2, mb: 2 }} maxWidth={false}>
        <Grid container alignItems="center" spacing={1}>
          <Grid item xs={6}>
            <p>{jobApplication.applicantAddress}</p>
          </Grid>
          <Grid item xs={2}>
            <Button onClick={handleDownloadResumeClick} variant="contained">
              Download Resume
            </Button>
            {/* link component from next/link didn't work for this purpose */}
            <a
              ref={downloadLink}
              download={`${jobApplication.applicantAddress}-resume.docx`}
              href={resumeFile ? URL.createObjectURL(resumeFile) : ''}
            ></a>
          </Grid>
          <Grid item xs={2}>
            <Typography component="h6" variant="h6">
              {jobApplication.getDisplayableApplicationStatus()}
            </Typography>
          </Grid>
          <Grid item xs={1}>
            {getNextActionButton()}
          </Grid>
          <Grid item xs={1}>
            {jobApplication.currentStatus === ApplicationStatus.InProgress && (
              <Button
                color="error"
                variant="contained"
                onClick={handleDeclineClick}
              >
                Decline
              </Button>
            )}
            {jobApplication.currentStatus ===
              ApplicationStatus.ApplicationDeclined && (
              <Typography component="h6" variant="h6">
                Declined
              </Typography>
            )}
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
      </Container>
    </Paper>
  );
};

export default JobApplicationApplicantInfoListeItem;
