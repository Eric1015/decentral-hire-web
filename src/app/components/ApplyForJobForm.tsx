import { useState, FormEvent } from 'react';
import { ethers } from 'ethers';
import { MuiFileInput } from 'mui-file-input';
import useLitFileProvider from '../hooks/useLitFileProvider';
import useJobPostingContract from '../hooks/useJobPostingContract';
import { JobPosting } from '../types/JobPosting';
import { useRouter } from 'next/router';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import LoadingButton from '@mui/lab/LoadingButton';

type Props = {
  jobPostingAddress: string;
};

const ApplyForJobForm = ({ jobPostingAddress }: Props) => {
  const router = useRouter();
  const [resume, setResume] = useState<File | null>(null);
  const [isFormLoading, setFormLoading] = useState(false);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [showSuccessSnackbar, setShowSuccessSnackbar] = useState(false);
  const [successSnackbarMessage, setSuccessSnackbarMessage] = useState('');
  const jobPostingContract = useJobPostingContract(jobPostingAddress);
  const { encrypt } = useLitFileProvider();

  const handleClose = () => {
    setShowSnackbar(false);
  };

  const handleSuccessSnackbarClose = () => {
    setShowSuccessSnackbar(false);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      if (!resume || !jobPostingContract) {
        return;
      }
      const jobPosting: JobPosting =
        await jobPostingContract.getJobPostingMetadata();
      const encryptedResumeCid = await encrypt(resume, jobPosting.owner);
      await jobPostingContract.applyForJob(
        encryptedResumeCid,
        // The fee for creating a job posting is 0.001 ETH
        { value: ethers.parseUnits('0.001', 'ether') }
      );
      setFormLoading(false);
      setSuccessSnackbarMessage('Job application submitted successfully');
      setShowSuccessSnackbar(true);
      router.push('/applicant');
    } catch (error) {
      console.error(error);
      setSnackbarMessage('Error submitting job application');
      setShowSnackbar(true);
      setFormLoading(false);
    }
  };

  return (
    <div>
      <Container component="main">
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'start',
          }}
        >
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography component="h6" variant="h6">
                  Please upload your resume here
                </Typography>
                <MuiFileInput
                  value={resume}
                  onChange={(value) => setResume(value)}
                />
              </Grid>
              <Grid item xs={12}>
                <Grid container>
                  <Grid item xs={3}>
                    <LoadingButton
                      type="submit"
                      color="primary"
                      fullWidth
                      variant="contained"
                      loading={isFormLoading}
                      disabled={isFormLoading || !resume}
                    >
                      Submit
                    </LoadingButton>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Box>
        </Box>
      </Container>
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
    </div>
  );
};

export default ApplyForJobForm;
