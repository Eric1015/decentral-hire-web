import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import TextField from '@mui/material/TextField';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import Autocomplete from '@mui/material/Autocomplete';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import { LoadingButton } from '@mui/lab';
import React, { FormEvent, useEffect } from 'react';
import { useRouter } from 'next/router';
import useCompanyProfileContract from '../hooks/useCompanyProfileContract';
import { City, Country, ICity, ICountry } from 'country-state-city';
import '@uiw/react-md-editor/markdown-editor.css';
import '@uiw/react-markdown-preview/markdown.css';
import useIPFSFileUploader from '../hooks/useIPFSFileUploader';
import { ethers } from 'ethers';
import { ValidationError } from '../types/validationError';
import dynamic from 'next/dynamic';

const jobDescriptionPlaceholderTemplate = `
# Job Description

# Responsibilities

# Requirements

# Nice to have

# Benefits

# About the company
`;

type CountryOptionType = ICountry & { label: string; value: string };
type CityOptionType = ICity & { label: string; value: string };

// loading the following with React Lazy to avoid the SSR import error. Followed the following guide
// https://github.com/uiwjs/react-md-editor/issues/52#issuecomment-1272350203
const MDEditor = dynamic(() => import('@uiw/react-md-editor'), { ssr: false });
const EditorMarkdown = dynamic(
  () =>
    import('@uiw/react-md-editor').then((mod) => {
      return mod.default.Markdown;
    }),
  { ssr: false }
);

const NewJobPostingForm = () => {
  const router = useRouter();
  const { uploadFile } = useIPFSFileUploader();
  const { id = '' } = router.query;
  const [isFormLoading, setFormLoading] = React.useState(false);
  const [title, setTitle] = React.useState('');
  const [jobDescription, setJobDescription] = React.useState<string>(
    jobDescriptionPlaceholderTemplate
  );
  const [country, setCountry] = React.useState('');
  const [city, setCity] = React.useState('');
  const [isRemote, setIsRemote] = React.useState(false);
  const [totalHiringCount, setTotalHiringCount] = React.useState(1);
  const [showSnackbar, setShowSnackbar] = React.useState(false);
  const [showSuccessSnackbar, setShowSuccessSnackbar] = React.useState(false);
  const [snackbarMessage, setSnackbarMessage] = React.useState('');
  const [successSnackbarMessage, setSuccessSnackbarMessage] =
    React.useState('');
  const contract = useCompanyProfileContract(Array.isArray(id) ? id[0] : id);
  const [availableCountries, setAvailableCountries] =
    React.useState<CountryOptionType[]>();
  const [availableCities, setAvailableCities] =
    React.useState<CityOptionType[]>();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      setFormLoading(true);
      if (!title) {
        throw new ValidationError('Title is required');
      }
      if (!jobDescription) {
        throw new ValidationError('Job Description is required');
      }
      if (!isRemote && !country) {
        throw new ValidationError('Country is required for non-remote jobs');
      }
      if (totalHiringCount < 1) {
        throw new ValidationError('Total Hiring Count must be greater than 0');
      }
      if (!contract) {
        throw new Error("Couldn't load contract");
      }

      const jobDescriptionBlob = new Blob([jobDescription], {
        type: 'text/plain',
      });
      const jobDescriptionFileResult = await uploadFile(jobDescriptionBlob);
      const jobDescriptionFileCid = jobDescriptionFileResult.cid;

      const tx = await contract.createJobPosting(
        title,
        jobDescriptionFileCid.toString(),
        country,
        city,
        isRemote,
        totalHiringCount,
        // The fee for creating a job posting is 0.01 ETH
        { value: ethers.parseUnits('0.01', 'ether') }
      );
      await tx.wait();
      setFormLoading(false);
      setSuccessSnackbarMessage('Job posting created successfully');
      setShowSuccessSnackbar(true);
      router.push(`/company/${id}`);
    } catch (error) {
      console.error(error);
      if (error instanceof ValidationError) {
        setSnackbarMessage(error.message);
      } else {
        setSnackbarMessage(
          `Failed to create job posting: ${(error as Error).message}`
        );
      }
      setShowSnackbar(true);
      setFormLoading(false);
    }
  };

  const handleClose = () => {
    setShowSnackbar(false);
  };

  const handleSuccessSnackbarClose = () => {
    setShowSuccessSnackbar(false);
  };

  const handleJobDescriptionChange = (value?: string) => {
    setJobDescription(value || '');
  };

  useEffect(() => {
    const countries = Country.getAllCountries();
    const countriesOptions: CountryOptionType[] = countries.map((country) => ({
      ...country,
      label: country.name,
      value: country.isoCode,
    }));
    setAvailableCountries(countriesOptions);
  }, []);

  useEffect(() => {
    if (!country) {
      setCity('');
      setAvailableCities([]);
      return;
    }
    const cities = City.getCitiesOfCountry(country) || [];
    const citiesOptions: CityOptionType[] = cities.map((city) => ({
      ...city,
      label: `${city.name}, ${city.stateCode}`,
      value: `${city.name}, ${city.stateCode}`,
    }));
    setAvailableCities(citiesOptions);
  }, [country]);

  return (
    <div>
      <Container component="main" maxWidth="lg">
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Typography component="h1" variant="h5">
            Create Job Posting
          </Typography>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      id="jobTitle"
                      label="Job Title"
                      autoFocus
                      fullWidth
                      disabled={isFormLoading}
                      required
                      type="text"
                      placeholder="Job Title"
                      onChange={(e) => setTitle(e.target.value)}
                    ></TextField>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography component="p">Job Description</Typography>
                    <MDEditor
                      aria-disabled={isFormLoading}
                      value={jobDescription}
                      preview="edit"
                      onChange={handleJobDescriptionChange}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Typography component="p">Location</Typography>
                    <Autocomplete
                      disablePortal
                      disabled={isFormLoading}
                      options={availableCountries || []}
                      onChange={(e, value) => setCountry(value?.value || '')}
                      renderInput={(params) => (
                        <TextField {...params} label="Country" />
                      )}
                    />
                    <br />
                    <Autocomplete
                      disablePortal
                      disabled={isFormLoading || !country}
                      options={availableCities || []}
                      onChange={(e, value) => setCity(value?.value || '')}
                      renderInput={(params) => (
                        <TextField {...params} label="City" />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={isRemote}
                          onChange={(e) => setIsRemote(e.target.checked)}
                        />
                      }
                      label="Is Remote"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      id="totalHiringCount"
                      label="Total Hiring Count"
                      required
                      disabled={isFormLoading}
                      type="number"
                      value={totalHiringCount}
                      placeholder="Total Hiring Count"
                      onChange={(e) =>
                        setTotalHiringCount(parseInt(e.target.value))
                      }
                      inputProps={{ min: 1, inputMode: 'numeric' }}
                    />
                  </Grid>
                  <Grid item xs={12}>
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
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={6}>
                <EditorMarkdown
                  source={jobDescription}
                  style={{ whiteSpace: 'pre-wrap', padding: '16px' }}
                />
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

export default NewJobPostingForm;
