import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import TextField from '@mui/material/TextField';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import { LoadingButton } from '@mui/lab';
import React, { FormEvent, useEffect } from 'react';
import { useRouter } from 'next/router';
import { IWeb3Context, useWeb3Context } from '../contexts/web3Context';
import { MuiFileInput } from 'mui-file-input';
import useIPFSFileUploader from '../hooks/useIPFSFileUploader';
import useCompanyProfileContract from '../hooks/useCompanyProfileContract';
import Image from 'next/image';
import useDecentralHireContract from '../hooks/useDecentralHireContract';

type Props = {
  isEdit?: boolean;
};

// use material UI library importing from "@mui/material", create a centered form that allows the user to input company name and website url.
// use the "useState" hook to create a state variable for the company name and website url.
const CompanyForm = ({ isEdit = false }: Props) => {
  const router = useRouter();
  const { companyProfileAddress = '' } = router.query;
  const {
    state: { address },
  } = useWeb3Context() as IWeb3Context;
  const { uploadFile } = useIPFSFileUploader();
  const [isFormLoading, setFormLoading] = React.useState(false);
  const [companyName, setCompanyName] = React.useState('');
  const [companyWebsite, setCompanyWebsite] = React.useState('');
  const [companyLogo, setCompanyLogo] = React.useState<File | null>(null);
  const [companyLogoCid, setCompanyLogoCid] = React.useState<string>('');
  const [showSnackbar, setShowSnackbar] = React.useState(false);
  const [snackbarMessage, setSnackbarMessage] = React.useState('');
  const [showSuccessSnackbar, setShowSuccessSnackbar] = React.useState(false);
  const [successSnackbarMessage, setSuccessSnackbarMessage] =
    React.useState('');
  const decentralHireContract = useDecentralHireContract();
  const companyProfileContract = useCompanyProfileContract(
    Array.isArray(companyProfileAddress)
      ? companyProfileAddress[0]
      : companyProfileAddress
  );
  const { getFile, getFileUrl } = useIPFSFileUploader();
  const [logoPreview, setLogoPreview] = React.useState<string>('');

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
      if (isEdit && !companyProfileContract) {
        return;
      }
      if (!isEdit && !decentralHireContract) {
        return;
      }

      let newCompanyLogoCid = '';

      if (!companyLogoCid) {
        const companyLogoResult = !!companyLogo
          ? await uploadFile(companyLogo)
          : '';
        newCompanyLogoCid = companyLogoResult
          ? companyLogoResult.cid.toString()
          : '';
      } else {
        newCompanyLogoCid = companyLogoCid;
      }

      const tx = isEdit
        ? await companyProfileContract?.updateCompanyProfile(
            companyName,
            companyWebsite,
            newCompanyLogoCid
          )
        : await decentralHireContract?.createCompanyProfile(
            companyName,
            companyWebsite,
            newCompanyLogoCid
          );
      await tx.wait();
      if (isEdit && companyProfileAddress) {
        setFormLoading(false);
        setSuccessSnackbarMessage('Company profile updated successfully');
        setShowSuccessSnackbar(true);
        router.push(`/company/${companyProfileAddress}`);
        return;
      }
      const newCompanyProfileAddress =
        await decentralHireContract?.getCompanyProfileByOwner(address);
      setFormLoading(false);
      setSuccessSnackbarMessage('Company profile created successfully');
      setShowSuccessSnackbar(true);
      router.push(`/company/${newCompanyProfileAddress}`);
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
    // reset it to empty string so that the previous logo cid is not used
    setCompanyLogoCid('');
    setCompanyLogo(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const handleClose = () => {
    setShowSnackbar(false);
  };

  const handleSuccessSnackbarClose = () => {
    setShowSuccessSnackbar(false);
  };

  useEffect(() => {
    const setUp = async () => {
      if (isEdit) {
        if (!companyProfileContract) {
          return;
        }
        const logoCid = await companyProfileContract.getLogoCid();
        const name = await companyProfileContract.getCompanyName();
        const websiteUrl = await companyProfileContract.getWebsiteUrl();
        const asyncItr = await getFile(logoCid);
        if (!asyncItr) return;
        for await (const content of asyncItr) {
          const logoBlob = new Blob([content]);
          setCompanyLogo(
            Object.assign(logoBlob, {
              lastModified: new Date().getTime(),
              name: 'logo.png',
              webkitRelativePath: '',
            }) as File
          );
        }
        setCompanyName(name);
        setCompanyWebsite(websiteUrl);
        setLogoPreview(getFileUrl(logoCid));
        setCompanyLogoCid(logoCid);
      }
    };

    setUp();
  }, [companyProfileContract, isEdit, getFile, getFileUrl]);

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
            {isEdit ? 'Edit Company Profile' : 'Create Company Profile'}
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
                  value={companyName}
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
                  value={companyWebsite}
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
              {logoPreview && (
                <Grid item xs={12}>
                  <Image src={logoPreview} alt="" width={100} height={100} />
                </Grid>
              )}
              <Grid item xs={12}>
                <Grid container>
                  <Grid item xs={6}>
                    <Button
                      color="secondary"
                      fullWidth
                      variant="contained"
                      sx={{ mt: 3, mr: 3, mb: 3 }}
                      disabled={isFormLoading}
                      onClick={() =>
                        router.push(`/company/${companyProfileAddress}`)
                      }
                    >
                      Cancel
                    </Button>
                  </Grid>
                  <Grid item xs={6}>
                    <LoadingButton
                      type="submit"
                      color="primary"
                      fullWidth
                      variant="contained"
                      sx={{ mt: 3, ml: 3, mb: 3 }}
                      loading={isFormLoading}
                      disabled={isFormLoading}
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

export default CompanyForm;
