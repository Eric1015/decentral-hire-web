export enum ApplicationStatus {
  InProgress,
  OfferSent,
  OfferAccepted,
  OfferDeclined,
  ApplicationDeclined,
  Hired,
}

export const toApplicationStatusNumber = (status: string) => {
  console.log('status', status);
  console.log(ApplicationStatus[ApplicationStatus.OfferSent]);
  switch (status) {
    case ApplicationStatus[ApplicationStatus.InProgress]:
      return ApplicationStatus.InProgress;
    case ApplicationStatus[ApplicationStatus.OfferSent]:
      return ApplicationStatus.OfferSent;
    case ApplicationStatus[ApplicationStatus.OfferAccepted]:
      return ApplicationStatus.OfferAccepted;
    case ApplicationStatus[ApplicationStatus.OfferDeclined]:
      return ApplicationStatus.OfferDeclined;
    case ApplicationStatus[ApplicationStatus.ApplicationDeclined]:
      return ApplicationStatus.ApplicationDeclined;
    case ApplicationStatus[ApplicationStatus.Hired]:
      return ApplicationStatus.Hired;
    default:
      return ApplicationStatus.InProgress;
  }
};

export class JobApplication {
  jobApplicationAddress: string;
  applicantAddress: string;
  jobPostingAddress: string;
  companyProfileOwner: string;
  resumeCid: string;
  offerCid: string;
  currentStatus: ApplicationStatus;

  constructor(
    jobApplicationAddress: string,
    applicantAddress: string,
    jobPostingAddress: string,
    companyProfileOwner: string,
    resumeCid: string,
    offerCid: string,
    currentStatus: ApplicationStatus
  ) {
    this.jobApplicationAddress = jobApplicationAddress;
    this.applicantAddress = applicantAddress;
    this.jobPostingAddress = jobPostingAddress;
    this.companyProfileOwner = companyProfileOwner;
    this.resumeCid = resumeCid;
    this.offerCid = offerCid;
    this.currentStatus = currentStatus;
  }

  getDisplayableApplicationStatus() {
    switch (this.currentStatus) {
      case ApplicationStatus.InProgress:
        return 'In progress';
      case ApplicationStatus.OfferSent:
        return 'Offer sent';
      case ApplicationStatus.OfferAccepted:
        return 'Offer accepted';
      case ApplicationStatus.OfferDeclined:
        return 'Offer declined';
      case ApplicationStatus.ApplicationDeclined:
        return 'Application declined';
      case ApplicationStatus.Hired:
        return 'Hired';
      default:
        return '---';
    }
  }
}
