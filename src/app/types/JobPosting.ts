export type JobPosting = {
  companyProfileAddress: string;
  jobPostingAddress: string;
  owner: string;
  title: string;
  jobDescriptionIpfsHash: string;
  country: string;
  city: string;
  isRemote: boolean;
  totalHiringCount: BigInt;
  currentHiredCount: BigInt;
  isActive: boolean;
};
