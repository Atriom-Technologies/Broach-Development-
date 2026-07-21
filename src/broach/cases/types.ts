import { Prisma } from '@prisma/client';

export type CaseListItem = Prisma.CaseDetailsGetPayload<{
  select: {
    id: true;
    description: true;
    createdAt: true;
    requesterReporterProfile: {
      select: {
        id: true;
        profilePicture: true;
        fullName: true;
      };
    };
    caseType: {
      select: { name: true };
    };
  };
}>;
