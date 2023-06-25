import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';

const JobPostingListItem = ({ jobPosting }) => {
  return (
    <Container>
      <Grid container>
        <Grid item xs={3}>
          {jobPosting.title}
        </Grid>
        <Grid item xs={3}></Grid>
        <Grid item xs={3}>
          {`${jobPosting.city}, ${jobPosting.country}`}
        </Grid>
      </Grid>
    </Container>
  );
};

export default JobPostingListItem;
