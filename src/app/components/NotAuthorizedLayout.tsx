import Link from 'next/link';
import React from 'react';
import Grid from '@mui/material/Grid';

// "NotAuthorizedLayout" component using the Material UI Library which will center everything on the page.

const NotAuthorizedLayout = () => {
  return (
    <Grid container alignItems="center">
      <Grid item xs={12}>
        <h1>Not Authorized</h1>
        <p>You are not authorized to view this page.</p>
        <Link href="/">Home</Link>
      </Grid>
    </Grid>
  );
};

export default NotAuthorizedLayout;
