import { PrismaService } from "src/prisma/prisma.service";
import { UserType } from "@prisma/client";
import { Injectable } from "@nestjs/common";

@Injectable()
export class ProfileStatusProvider{
    constructor ( private readonly prisma: PrismaService){}


    async isProfileDetailsSubmitted(userId: string, userType: UserType): Promise<boolean> {
        if(userType === 'requester_reporter'){
            const profile = await this.prisma.requesterReporterProfile.findUnique({
                where: {userId},
            });
            return !!profile;
        }

        if (userType === 'support_organization') {
            const profile = await this.prisma.supportOrgProfile.findUnique({
                where: {userId},
            });
            return !!profile;
        }

        return false;
    }






}
