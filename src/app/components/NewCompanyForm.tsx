import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import TextField from '@mui/material/TextField';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import Grid from '@mui/material/Grid';
import { LoadingButton } from '@mui/lab';
import React, { FormEvent, useEffect } from 'react';
import useDecentralHireContract from '../hooks/useDecentralHireContract';
import { useRouter } from 'next/router';
import { IWeb3Context, useWeb3Context } from '../contexts/web3Context';
import { MuiFileInput } from 'mui-file-input';
import useIPFSFileUploader from '../hooks/useIPFSFileUploader';

// use material UI library importing from "@mui/material", create a centered form that allows the user to input company name and website url.
// use the "useState" hook to create a state variable for the company name and website url.
const NewCompanyForm = () => {
  const router = useRouter();
  const {
    state: { address },
  } = useWeb3Context() as IWeb3Context;
  const { uploadFile } = useIPFSFileUploader();
  const [isFormLoading, setFormLoading] = React.useState(false);
  const [companyName, setCompanyName] = React.useState('');
  const [companyWebsite, setCompanyWebsite] = React.useState('');
  const [companyLogo, setCompanyLogo] = React.useState<File | null>(null);
  const [showSnackbar, setShowSnackbar] = React.useState(false);
  const [snackbarMessage, setSnackbarMessage] = React.useState('');
  const [showSuccessSnackbar, setShowSuccessSnackbar] = React.useState(false);
  const [successSnackbarMessage, setSuccessSnackbarMessage] =
    React.useState('');
  const contract = useDecentralHireContract();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      setFormLoading(true);
      if (!companyName) {
        setSnackbarMessage('Company Name is required');
        setShowSnackbar(true);
        return;
      }
      if (!companyWebsite) {
        setSnackbarMessage('Company Website is required');
        setShowSnackbar(true);
        return;
      }
      if (!contract) {
        return;
      }

      const companyLogoResult = !!companyLogo
        ? await uploadFile(companyLogo)
        : '';
      const companyLogoCid = companyLogoResult ? companyLogoResult.cid : '';

      const tx = await contract.createCompanyProfile(
        companyName,
        companyWebsite,
        companyLogoCid.toString()
      );
      await tx.wait();
      const companyProfileAddress = await contract.getCompanyProfileByOwner(
        address
      );
      setFormLoading(false);
      setSuccessSnackbarMessage('Job posting created successfully');
      setShowSuccessSnackbar(true);
      router.push(`/company/${companyProfileAddress}`);
    } catch (error) {
      console.error(error);
      setFormLoading(false);
    }
  };

  const handleLogoChange = async (file: File | null) => {
    if (file == null) return;
    const filename = file.name;
    const fileExtension = filename.slice(
      ((filename.lastIndexOf('.') - 1) >>> 0) + 2
    );
    if (!['jpg', 'jpeg', 'png'].includes(fileExtension)) {
      setSnackbarMessage('Only image files (jpg, jpeg, png) are allowed');
      setShowSnackbar(true);
      return;
    }
    setCompanyLogo(file);
  };

  const handleClose = () => {
    setShowSnackbar(false);
  };

  const handleSuccessSnackbarClose = () => {
    setShowSuccessSnackbar(false);
  };

  useEffect(() => {
    const setUp = async () => {
      if (contract) {
        const companyProfileAlreadyExists =
          await contract.isCompanyProfileByOwnerAddressExists(address);
        if (companyProfileAlreadyExists) {
          const companyProfileAddress = await contract.getCompanyProfileByOwner(
            address
          );
          router.push(`/company/${companyProfileAddress}`);
        }
      }
    };

    setUp();
  }, [contract, router, address]);

  return (
    <div>
      <Container component="main" maxWidth="xs">
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Typography component="h1" variant="h5">
            Create Company Profile
          </Typography>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  id="companyName"
                  label="Company Name"
                  autoFocus
                  fullWidth
                  disabled={isFormLoading}
                  required
                  type="text"
                  placeholder="Company Name"
                  onChange={(e) => setCompanyName(e.target.value)}
                ></TextField>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  id="companyWebsite"
                  label="Company Website"
                  disabled={isFormLoading}
                  type="url"
                  required
                  fullWidth
                  placeholder="Company website"
                  onChange={(e) => setCompanyWebsite(e.target.value)}
                />
              </Grid>
              <Grid item xs={12}>
                <MuiFileInput
                  id="companyLogo"
                  placeholder="Company Logo"
                  fullWidth
                  label="Company Logo *"
                  value={companyLogo}
                  onChange={handleLogoChange}
                />
              </Grid>
            </Grid>
            <LoadingButton
              type="submit"
              color="primary"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 3 }}
              loading={isFormLoading}
              disabled={isFormLoading}
            >
              Submit
            </LoadingButton>
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

export default NewCompanyForm;
