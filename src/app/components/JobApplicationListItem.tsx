import LinearProgress from '@mui/material/LinearProgress';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Image from 'next/image';
import { JobPosting } from '../types/JobPosting';
import { CompanyProfile } from '../types/CompanyProfile';
import { JobApplication } from '../types/JobApplication';
import { Typography } from '@mui/material';
import useIPFSFileUploader from '../hooks/useIPFSFileUploader';

type Props = {
  jobPosting: JobPosting;
  companyProfile: CompanyProfile;
  jobApplication: JobApplication;
};

const JobApplicationListItem = ({
  jobPosting,
  companyProfile,
  jobApplication,
}: Props) => {
  const currentHiredCount = Number(jobPosting.currentHiredCount);
  const totalHiringCount = Number(jobPosting.totalHiringCount);
  const { getFileUrl } = useIPFSFileUploader();

  return (
    <Paper elevation={1}>
      <Container sx={{ pt: 5, pb: 5, mt: 2, mb: 2 }} maxWidth={false}>
        <Grid container alignItems="center">
          <Grid item xs={3}>
            <Grid container alignItems="center">
              <Grid item xs={4}>
                <Image
                  src={getFileUrl(companyProfile.logoCid)}
                  alt=""
                  width={60}
                  height={60}
                />
              </Grid>
              <Grid item xs={8}>
                <Typography component="h6" variant="h6">
                  {companyProfile.companyName}
                </Typography>
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={2}>
            {jobPosting.title}
          </Grid>
          <Grid item xs={3}>
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
          <Grid item xs={2}>
            {`${jobPosting.city}, ${jobPosting.country} ${
              jobPosting.isRemote ? '(Remote)' : ''
            }`}
          </Grid>
          <Grid item xs={2}>
            <Typography component="h6" variant="h6">
              {jobApplication.getDisplayableApplicationStatus()}
            </Typography>
          </Grid>
        </Grid>
      </Container>
    </Paper>
  );
};

export default JobApplicationListItem;
