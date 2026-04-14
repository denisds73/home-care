import { Injectable, Logger } from '@nestjs/common';
import { Subject, Observable, merge, interval, map, finalize } from 'rxjs';
import { NotificationEntity } from '@/database/entities';

interface MessageEvent {
  data: string;
  type?: string;
  id?: string;
}

interface ConnectedClient {
  subject: Subject<MessageEvent>;
  isAdmin: boolean;
}

@Injectable()
export class NotificationSseService {
  private readonly logger = new Logger(NotificationSseService.name);
  private readonly clients = new Map<string, ConnectedClient>();

  /** Register a client and return an Observable that streams SSE events. */
  addClient(userId: string, isAdmin: boolean): Observable<MessageEvent> {
    // If the user already has a connection, complete it first
    this.removeClient(userId);

    const subject = new Subject<MessageEvent>();
    this.clients.set(userId, { subject, isAdmin });

    this.logger.log(`Client connected: ${userId} (admin=${isAdmin})`);

    // Heartbeat every 30s to keep the connection alive through proxies
    const heartbeat$ = interval(30_000).pipe(
      map((): MessageEvent => ({ data: '', type: 'heartbeat' })),
    );

    return merge(subject.asObservable(), heartbeat$).pipe(
      finalize(() => {
        this.clients.delete(userId);
        this.logger.log(`Client disconnected: ${userId}`);
      }),
    );
  }

  /** Remove and complete a client's stream. */
  removeClient(userId: string): void {
    const client = this.clients.get(userId);
    if (client) {
      client.subject.complete();
      this.clients.delete(userId);
    }
  }

  /** Push a notification to a specific user (if connected). */
  pushToUser(userId: string, notification: NotificationEntity): void {
    const client = this.clients.get(userId);
    if (client) {
      client.subject.next({
        data: JSON.stringify(notification),
        type: 'notification',
        id: notification.id,
      });
    }
  }

  /** Push a notification to all connected admin users. */
  pushToAdmins(notification: NotificationEntity): void {
    for (const [, client] of this.clients) {
      if (client.isAdmin) {
        client.subject.next({
          data: JSON.stringify(notification),
          type: 'notification',
          id: notification.id,
        });
      }
    }
  }
}
