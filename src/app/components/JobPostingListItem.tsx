import LinearProgress from '@mui/material/LinearProgress';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import { JobPosting } from '../types/JobPosting';

type Props = {
  jobPosting: JobPosting;
};

const JobPostingListItem = ({ jobPosting }: Props) => {
  const currentHiredCount = Number(jobPosting.currentHiredCount);
  const totalHiringCount = Number(jobPosting.totalHiringCount);

  return (
    <Paper elevation={1}>
      <Container sx={{ pt: 5, pb: 5, mt: 2, mb: 2 }}>
        <Grid container>
          <Grid item xs={4}>
            {jobPosting.title}
          </Grid>
          <Grid item xs={4}>
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
          <Grid item xs={4}>
            {`${jobPosting.city}, ${jobPosting.country} ${
              jobPosting.isRemote ? '(Remote)' : ''
            }`}
          </Grid>
        </Grid>
      </Container>
    </Paper>
  );
};

export default JobPostingListItem;