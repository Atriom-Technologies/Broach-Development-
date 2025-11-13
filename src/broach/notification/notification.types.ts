interface NotificationPayload {
  id: string; // notification row id
  type: 'CASE_REPORT' | 'SERVICE_REQUEST';
  status: 'pending' | 'in_discussion' | 'closed';
  createdAt: string;
  updatedAt: string;

  report: {
    id: string;
    title: string;
    description: string;
    caseType?: string;
    serviceType?: string;
    reporter: { id: string; fullName: string; profilePicture?: string };
  };

  ctas: { primary: string; secondary?: string };
}
