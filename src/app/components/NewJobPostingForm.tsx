import {
  Alert,
  FormControl,
  Snackbar,
  TextField,
  FormControlLabel,
  Switch,
  Autocomplete,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { IWeb3Context, useWeb3Context } from '../contexts/web3Context';
import useCompanyProfileContract from '../hooks/useCompanyProfileContract';
import { City, Country, ICity, ICountry } from 'country-state-city';
import '@uiw/react-md-editor/markdown-editor.css';
import '@uiw/react-markdown-preview/markdown.css';
import dynamic from 'next/dynamic';
import useIPFSFileUploader from '../hooks/useIPFSFileUploader';
import { ethers } from 'ethers';

type CountryOptionType = ICountry & { label: string; value: string };
type CityOptionType = ICity & { label: string; value: string };

const MDEditor = dynamic(() => import('@uiw/react-md-editor'), { ssr: false });

const NewJobPostingForm = () => {
  const router = useRouter();
  const { uploadFile } = useIPFSFileUploader();
  const {
    state: { address },
  } = useWeb3Context() as IWeb3Context;
  const { id = '' } = router.query;
  const [isFormLoading, setFormLoading] = React.useState(false);
  const [title, setTitle] = React.useState('');
  const [jobDescription, setJobDescription] = React.useState<string>('');
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

  const onSubmit = async () => {
    try {
      setFormLoading(true);
      if (!title) {
        setSnackbarMessage('Title is required');
        setShowSnackbar(true);
        return;
      }
      if (!jobDescription) {
        setSnackbarMessage('Job Description is required');
        setShowSnackbar(true);
        return;
      }
      if (!isRemote && !country) {
        setSnackbarMessage('Country is required for non-remote jobs');
        setShowSnackbar(true);
        return;
      }
      if (totalHiringCount < 1) {
        setSnackbarMessage('Total Hiring Count must be greater than 0');
        setShowSnackbar(true);
        return;
      }
      if (!contract) {
        return;
      }

      const jobDescriptionBlob = new Blob([jobDescription], {
        type: 'text/plain',
      });
      const jobDescriptionFileCid = await uploadFile(jobDescriptionBlob);

      const tx = await contract.createJobPosting(
        title,
        jobDescriptionFileCid,
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
      setSnackbarMessage(
        `Failed to create job posting: ${(error as Error).message}`
      );
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
      <h3>Job Title</h3>
      <FormControl>
        <TextField
          disabled={isFormLoading}
          required
          type="text"
          placeholder="Title"
          onChange={(e) => setTitle(e.target.value)}
        ></TextField>
      </FormControl>
      <h3>Job Description</h3>
      <MDEditor value={jobDescription} onChange={handleJobDescriptionChange} />
      <h3>Job Location</h3>
      <FormControl fullWidth>
        <Autocomplete
          disablePortal
          disabled={isFormLoading}
          options={availableCountries || []}
          onChange={(e, value) => setCountry(value?.value || '')}
          renderInput={(params) => <TextField {...params} label="Country" />}
        />
        <br />
        <Autocomplete
          disablePortal
          disabled={isFormLoading || !country}
          options={availableCities || []}
          onChange={(e, value) => setCity(value?.value || '')}
          renderInput={(params) => <TextField {...params} label="City" />}
        />
      </FormControl>
      <FormControl fullWidth>
        <FormControlLabel
          control={
            <Switch
              checked={isRemote}
              onChange={(e) => setIsRemote(e.target.checked)}
            />
          }
          label="Is Remote"
        />
      </FormControl>
      <h3>Total Hiring Count</h3>
      <FormControl>
        <TextField
          disabled={isFormLoading}
          type="number"
          value={totalHiringCount}
          placeholder="Total Hiring Count"
          onChange={(e) => setTotalHiringCount(parseInt(e.target.value))}
          inputProps={{ min: 1, inputMode: 'numeric' }}
        ></TextField>
      </FormControl>
      <FormControl>
        <LoadingButton
          loading={isFormLoading}
          disabled={isFormLoading}
          onClick={onSubmit}
        >
          Submit
        </LoadingButton>
      </FormControl>
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
