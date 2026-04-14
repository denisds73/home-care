import {
  Controller,
  Get,
  Patch,
  Param,
  Query,
  Req,
  Sse,
  UseGuards,
  ParseUUIDPipe,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtService } from '@nestjs/jwt';
import { Observable } from 'rxjs';
import type { Request } from 'express';
import { JwtAuthGuard } from '@/common/guards';
import { CurrentUser, SkipEnvelope } from '@/common/decorators';
import { UserEntity, Role } from '@/database/entities';
import { NotificationsService } from './notifications.service';
import { NotificationSseService } from './notification-sse.service';

interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  vendor_id?: string | null;
  technician_id?: string | null;
}

interface SseMessageEvent {
  data: string;
  type?: string;
  id?: string;
}

@ApiTags('notifications')
@Controller('notifications')
export class NotificationsController {
  private readonly logger = new Logger(NotificationsController.name);

  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly sseService: NotificationSseService,
    private readonly jwtService: JwtService,
  ) {}

  @Sse('stream')
  @SkipEnvelope()
  @ApiOperation({ summary: 'SSE stream of real-time notifications' })
  @ApiQuery({ name: 'token', required: true, description: 'JWT auth token' })
  stream(
    @Query('token') token: string,
    @Req() req: Request,
  ): Observable<SseMessageEvent> {
    if (!token) {
      throw new UnauthorizedException('Missing token');
    }

    let payload: JwtPayload;
    try {
      payload = this.jwtService.verify<JwtPayload>(token);
    } catch {
      throw new UnauthorizedException('Invalid token');
    }

    const userId = payload.sub;
    const isAdmin = payload.role === Role.ADMIN;

    const stream$ = this.sseService.addClient(userId, isAdmin);

    req.on('close', () => {
      this.sseService.removeClient(userId);
    });

    return stream$;
  }

  @Get()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'List notifications for current user' })
  async list(@CurrentUser() user: UserEntity) {
    return this.notificationsService.findByUser(user.id);
  }

  @Patch('read-all')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Mark all notifications as read' })
  async markAllAsRead(@CurrentUser() user: UserEntity) {
    await this.notificationsService.markAllAsRead(user.id);
    return { message: 'All notifications marked as read' };
  }

  @Patch(':id/read')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Mark a single notification as read' })
  async markAsRead(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: UserEntity,
  ) {
    return this.notificationsService.markAsRead(id, user.id);
  }
}
