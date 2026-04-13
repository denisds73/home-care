import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import {
  PartnerEntity,
  JobEntity,
  JobStatus,
  UserEntity,
} from '@/database/entities';
import { UpdatePartnerDto } from './dto/update-partner.dto';

interface PartnerProfile {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  avatar: string | null;
  skills: string[];
  rating: number;
  completedJobs: number;
  status: string;
  serviceArea: string;
  isOnline: boolean;
  joinedAt: string;
  earnings: number;
}

interface JobResponse {
  id: string;
  bookingId: string;
  partnerId: string;
  customerName: string;
  phone: string;
  address: string;
  category: string;
  serviceName: string;
  price: number;
  preferredDate: string;
  status: string;
  createdAt: string;
}

interface EarningsSummary {
  totalEarnings: number;
  completedJobs: number;
  averagePerJob: number;
}

const VALID_TRANSITIONS: Record<JobStatus, JobStatus[]> = {
  [JobStatus.NEW]: [JobStatus.ACCEPTED, JobStatus.DECLINED],
  [JobStatus.ACCEPTED]: [JobStatus.IN_PROGRESS],
  [JobStatus.IN_PROGRESS]: [JobStatus.COMPLETED],
  [JobStatus.COMPLETED]: [],
  [JobStatus.DECLINED]: [],
};

@Injectable()
export class PartnersService {
  constructor(
    @InjectRepository(PartnerEntity)
    private readonly partnerRepo: Repository<PartnerEntity>,
    @InjectRepository(JobEntity)
    private readonly jobRepo: Repository<JobEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
  ) {}

  async getProfile(userId: string): Promise<PartnerProfile> {
    const partner = await this.partnerRepo.findOne({
      where: { user_id: userId },
      relations: ['user'],
    });

    if (!partner) {
      throw new NotFoundException('Partner profile not found');
    }

    const user = partner.user;
    if (!user) {
      throw new NotFoundException('Associated user not found');
    }

    return this.mapPartnerToResponse(partner, user);
  }

  async updateProfile(
    userId: string,
    dto: UpdatePartnerDto,
  ): Promise<PartnerProfile> {
    const partner = await this.partnerRepo.findOne({
      where: { user_id: userId },
    });

    if (!partner) {
      throw new NotFoundException('Partner profile not found');
    }

    if (dto.skills !== undefined) {
      partner.skills = dto.skills;
    }
    if (dto.service_area !== undefined) {
      partner.service_area = dto.service_area;
    }

    await this.partnerRepo.save(partner);

    const user = await this.userRepo.findOneByOrFail({ id: userId });
    return this.mapPartnerToResponse(partner, user);
  }

  async toggleAvailability(
    userId: string,
    isOnline: boolean,
  ): Promise<PartnerProfile> {
    const partner = await this.partnerRepo.findOne({
      where: { user_id: userId },
    });

    if (!partner) {
      throw new NotFoundException('Partner profile not found');
    }

    partner.is_online = isOnline;
    await this.partnerRepo.save(partner);

    const user = await this.userRepo.findOneByOrFail({ id: userId });
    return this.mapPartnerToResponse(partner, user);
  }

  async getJobs(userId: string): Promise<JobResponse[]> {
    const partner = await this.partnerRepo.findOne({
      where: { user_id: userId },
    });

    if (!partner) {
      throw new NotFoundException('Partner profile not found');
    }

    const jobs = await this.jobRepo.find({
      where: { partner_id: partner.id },
      order: { created_at: 'DESC' },
    });

    return jobs.map((job) => this.mapJobToResponse(job));
  }

  async updateJobStatus(
    userId: string,
    jobId: string,
    newStatus: JobStatus,
  ): Promise<JobResponse> {
    const partner = await this.partnerRepo.findOne({
      where: { user_id: userId },
    });

    if (!partner) {
      throw new NotFoundException('Partner profile not found');
    }

    const job = await this.jobRepo.findOne({
      where: { id: jobId, partner_id: partner.id },
    });

    if (!job) {
      throw new NotFoundException('Job not found');
    }

    const allowedTransitions = VALID_TRANSITIONS[job.status];
    if (!allowedTransitions.includes(newStatus)) {
      throw new BadRequestException(
        `Cannot transition job from "${job.status}" to "${newStatus}"`,
      );
    }

    job.status = newStatus;
    await this.jobRepo.save(job);

    // Update completed_jobs count and earnings when a job is completed
    if (newStatus === JobStatus.COMPLETED) {
      await this.partnerRepo.increment(
        { id: partner.id },
        'completed_jobs',
        1,
      );
      await this.partnerRepo.increment(
        { id: partner.id },
        'earnings',
        Number(job.price),
      );
    }

    return this.mapJobToResponse(job);
  }

  async getEarnings(userId: string): Promise<EarningsSummary> {
    const partner = await this.partnerRepo.findOne({
      where: { user_id: userId },
    });

    if (!partner) {
      throw new NotFoundException('Partner profile not found');
    }

    const totalEarnings = Number(partner.earnings);
    const completedJobs = partner.completed_jobs;
    const averagePerJob =
      completedJobs > 0 ? totalEarnings / completedJobs : 0;

    return {
      totalEarnings,
      completedJobs,
      averagePerJob: Math.round(averagePerJob * 100) / 100,
    };
  }

  async getSchedule(userId: string): Promise<JobResponse[]> {
    const partner = await this.partnerRepo.findOne({
      where: { user_id: userId },
    });

    if (!partner) {
      throw new NotFoundException('Partner profile not found');
    }

    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    const startStr = startOfWeek.toISOString().split('T')[0];
    const endStr = endOfWeek.toISOString().split('T')[0];

    const jobs = await this.jobRepo.find({
      where: {
        partner_id: partner.id,
        preferred_date: Between(startStr, endStr),
        status: JobStatus.ACCEPTED,
      },
      order: { preferred_date: 'ASC' },
    });

    return jobs.map((job) => this.mapJobToResponse(job));
  }

  private mapPartnerToResponse(
    partner: PartnerEntity,
    user: UserEntity,
  ): PartnerProfile {
    return {
      id: partner.id,
      name: user.name,
      email: user.email,
      phone: user.phone ?? null,
      avatar: user.avatar ?? null,
      skills: partner.skills,
      rating: Number(partner.rating),
      completedJobs: partner.completed_jobs,
      status: partner.status,
      serviceArea: partner.service_area,
      isOnline: partner.is_online,
      joinedAt: partner.joined_at.toISOString(),
      earnings: Number(partner.earnings),
    };
  }

  private mapJobToResponse(job: JobEntity): JobResponse {
    return {
      id: job.id,
      bookingId: job.booking_id,
      partnerId: job.partner_id,
      customerName: job.customer_name,
      phone: job.phone,
      address: job.address,
      category: job.category,
      serviceName: job.service_name,
      price: Number(job.price),
      preferredDate: job.preferred_date,
      status: job.status,
      createdAt: job.created_at.toISOString(),
    };
  }
}
