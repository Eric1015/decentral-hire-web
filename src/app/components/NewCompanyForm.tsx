import { Alert, FormControl, Snackbar, TextField } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import React, { useEffect } from 'react';
import useDecentralHireContract from '../hooks/useDecentralHireContract';
import { useRouter } from 'next/router';
import { IWeb3Context, useWeb3Context } from '../contexts/web3Context';

// use material UI library importing from "@mui/material", create a centered form that allows the user to input company name and website url.
// use the "useState" hook to create a state variable for the company name and website url.
const NewCompanyForm = () => {
  const router = useRouter();
  const {
    state: { address },
  } = useWeb3Context() as IWeb3Context;
  const [isFormLoading, setFormLoading] = React.useState(false);
  const [companyName, setCompanyName] = React.useState('');
  const [companyWebsite, setCompanyWebsite] = React.useState('');
  const [showSnackbar, setShowSnackbar] = React.useState(false);
  const [snackbarMessage, setSnackbarMessage] = React.useState('');
  const contract = useDecentralHireContract();

  const onSubmit = async () => {
    try {
      setFormLoading(true);
      if (!companyName) {
        setSnackbarMessage('Company Name is required');
        setShowSnackbar(true);
        return;
      }
      if (!contract) {
        return;
      }

      const tx = await contract.createCompanyProfile(
        companyName,
        companyWebsite
      );
      await tx.wait();
      const companyProfileAddress = await contract.getCompanyProfileByOwner(
        address
      );
      setFormLoading(false);
      router.push(`/company/${companyProfileAddress}`);
    } catch (error) {
      console.error(error);
      setFormLoading(false);
    }
  };

  const handleClose = () => {
    setShowSnackbar(false);
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
      <h3>Company Name</h3>
      <FormControl>
        <TextField
          disabled={isFormLoading}
          required
          type="text"
          placeholder="Company Name"
          onChange={(e) => setCompanyName(e.target.value)}
        ></TextField>
      </FormControl>
      <h3>Company Website</h3>
      <FormControl>
        <TextField
          disabled={isFormLoading}
          type="url"
          placeholder="http://"
          onChange={(e) => setCompanyWebsite(e.target.value)}
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
    </div>
  );
};

export default NewCompanyForm;
