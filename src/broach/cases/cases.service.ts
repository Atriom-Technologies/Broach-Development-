import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { SafeExecutor } from 'src/utils/safe-execute';
import { CreateCaseDto } from './dto/create-case.dto';
import { Prisma, UserType } from '@prisma/client';
import { CaseRepository } from './repository/case.repository';
import { PaginationDto } from './dto/pagination.dto';
import { UpdateCaseDto } from './dto/update-case.dto';
import { NotificationService } from '../notification/notification.service';
@Injectable()
export class CasesService {
  constructor(
    private readonly repo: CaseRepository,
    private readonly safeExecutor: SafeExecutor,
    private readonly notificationService: NotificationService,
  ) {}

  // Submit a case
  async createCase(dto: CreateCaseDto, userId: string) {
    // Fetch user and check if user is of type requester_reporter
    const user = await this.safeExecutor.run(
      () => this.repo.findUserById(userId),
      `Failed to fetch user details: ${userId}`,
    );

    if (!user || user.userType !== UserType.requester_reporter) {
      throw new ForbiddenException('Not authorized to submit cases');
    }

    // Fetch requester profile
    const profile = await this.safeExecutor.run(
      () => this.repo.findRequesterProfileByUserId(userId),
      `Failed to fetch Requester id: ${userId}`,
    );

    // If profile not found, return an error message
    if (!profile)
      throw new BadRequestException(
        'Please complete your profile before submitting a case.',
      );

    // Check if case type ID from front end is valid. Case type id is expected to be sent from client
    // Note: Type of assault labeled in UI form is regarded as caseType in the database
    const caseType = await this.safeExecutor.run(
      () => this.repo.findCaseTypeById(dto.typeOfAssaultId),
      `Failed to fetch Case Id: ${dto.typeOfAssaultId}`,
    );
    if (!caseType)
      throw new BadRequestException(`Please select a valid case type`);

    // Validate vulnerabilityStatus (only if victimDetails is provided)
    // Check if vulnerable status ID from front end is valid. vulnerable status id is expected to be sent

    const vulnerabilityStatusId = dto.victimDetails?.vulnerabilityStatusId;
    if (vulnerabilityStatusId) {
      await this.safeExecutor.run(
        () => this.repo.findVulnerabilityStatusById(vulnerabilityStatusId),
        `Failed to fetch Case Id: ${vulnerabilityStatusId}`,
      );

      if (!vulnerabilityStatusId)
        throw new BadRequestException(
          `Invalid type. Please select a valid vulenerable status`,
        );
    }

    /**
     * Run case and report submission and notification of organization as a transaction
     * The custom safe executor helper function wraps try catch function, takes two arguments.
     * Takes the function to be executed in the try block and error message for the catch block
     */
    return this.safeExecutor.run(async () => {
      // Build the data to be created
      const data: Prisma.CaseDetailsCreateInput = {
        requesterReporterProfile: { connect: { id: profile.id } },
        caseType: { connect: { id: caseType.id } },
        whoIsReporting: dto.whoIsReporting,
        location: dto.location,
        description: dto.description,
        infoConfirmed: dto.infoConfirmed,

        ...(dto.victimDetails && {
          victimDetails: {
            create: {
              ageRange: dto.victimDetails.ageRange,
              employmentStatus: dto.victimDetails.employmentStatus,
              gender: dto.victimDetails.gender,
              vulnerabilityStatusId: dto.victimDetails.vulnerabilityStatusId,
            },
          },
        }),

        ...(dto.assailantDetails && {
          assailantDetails: {
            create: {
              noOfAssailants: dto.assailantDetails.noOfAssailants,
              gender: dto.assailantDetails.gender,
              ageRange: dto.assailantDetails.ageRange,
            },
          },
        }),
      };

      // Create case via repo
      const caseDetails = await this.repo.createCase({
        data,
        include: {
          requesterReporterProfile: { include: { user: true } },
          caseType: true,
          victimDetails: true,
          assailantDetails: true,
        },
      });

      // Call the notification service immediately after case creation
      await this.notificationService.notifyNewCase(caseDetails, user.id);
    }, `Report Submission Failed`);
  }

  async getCaseById(id: string) {
    // get the case by id and check if deleted is null
    // if so, throw not found exception
    const caseDetail = await this.safeExecutor.run(
      () => this.repo.getCaseById(id),
      `Failed to get case by id: ${id}`,
    );

    if (!caseDetail) throw new NotFoundException(`Case not found`);

    return caseDetail;
  }

  async getAllCases(pagination: PaginationDto) {
    const skip = (pagination.page - 1) * pagination.limit;

    return this.safeExecutor.run(
      () => this.repo.getAllCases(skip, pagination.limit),
      `Failed to get all cases`,
    );
  }

  async updateCase(id: string, userId: string, dto: UpdateCaseDto) {
    const data: Prisma.CaseDetailsUpdateInput = {
      // Top level fields
      whoIsReporting: dto.whoIsReporting,
      caseType: dto.typeOfAssaultId
        ? { connect: { id: dto.typeOfAssaultId } }
        : undefined,
      location: dto.location,
      description: dto.description,
      infoConfirmed: dto.infoConfirmed,

      // Nested victimDetails update
      ...(dto.victimDetails && {
        victimDetails: {
          update: {
            ageRange: dto.victimDetails.ageRange,
            employmentStatus: dto.victimDetails.employmentStatus,
            gender: dto.victimDetails.gender,
            vulnerabilityStatus: dto.victimDetails.vulnerabilityStatusId
              ? { connect: { id: dto.victimDetails.vulnerabilityStatusId } }
              : undefined,
          },
        },
      }),
      // Nested assailantDetails update
      ...(dto.assailantDetails && {
        assailantDetails: {
          update: {
            noOfAssailants: dto.assailantDetails.noOfAssailants,
            gender: dto.assailantDetails.gender,
            ageRange: dto.assailantDetails.ageRange,
          },
        },
      }),
    };
    return this.safeExecutor.run(
      () => this.repo.updateCase(id, userId, data),
      `Failed to update case with ID: ${id}`,
    );
  }

  async softDeleteCase(id: string, userId: string) {
    const [report, reporter] = await Promise.all([
      this.repo.getCaseById(id),
      this.repo.findRequesterProfileByUserId(userId),
    ]);

    // If case doesn't exist or already deleted
    if (!report) {
      throw new NotFoundException(`Case not found or already deleted`);
    }

    // If the user making request doesn't exist (shouldn't happen normally)
    if (!reporter)
      throw new ForbiddenException(
        `Invalid user trying to delete this resource`,
      );

    // Ownership
    if (report?.requesterReporterProfile?.id !== reporter?.userId)
      throw new ForbiddenException(`You cannot delete this resource`);

    return this.safeExecutor.run(
      () => this.repo.softDeleteCase(id, userId),
      `Failed to delete case: ${id}`,
    );
  }
}
/*  delete this resource`)

        return this.safeExecutor.run(
            () => this.repo.softDeleteCase(id, userId),
            `Failed to delete case: ${id}`
        )
    }
} delete this resource`)

        return this.safeExecutor.run(
            () => this.repo.softDeleteCase(id, userId),
            `Failed to delete case: ${id}`
        )
    } */
