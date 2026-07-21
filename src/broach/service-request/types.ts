import { Prisma } from '@prisma/client';

export type ServiceRequestListItem = Prisma.ServiceRequestsGetPayload<{
  select: {
    id: true;
    createdAt: true;
    requesterReporterProfile: {
      select: { profilePicture: true; fullName: true };
    };
    serviceDetails: {
      select: {
        description: true;
        serviceType: { select: { name: true } };
      };
    };
  };
}>;
