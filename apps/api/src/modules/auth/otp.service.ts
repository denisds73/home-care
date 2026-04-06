import { Injectable, BadRequestException, TooManyRequestsException } from '@nestjs/common';

interface OtpRecord {
  otp: string;
  expiresAt: number;
  attempts: number;
}

@Injectable()
export class OtpService {
  private readonly store = new Map<string, OtpRecord>();
  private readonly OTP_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes
  private readonly MAX_ATTEMPTS = 5;
  private readonly RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000; // 10 minutes

  // Rate limit tracking: phone -> timestamps of send requests
  private readonly sendLog = new Map<string, number[]>();

  generate(phone: string): string {
    this.checkRateLimit(phone);

    const otp = String(Math.floor(100000 + Math.random() * 900000));
    this.store.set(phone, {
      otp,
      expiresAt: Date.now() + this.OTP_EXPIRY_MS,
      attempts: 0,
    });

    // In production, send via SMS provider (Twilio, MSG91, etc.)
    // For now, log to console for development
    console.log(`[OTP] Phone: ${phone}, Code: ${otp}`);

    return otp;
  }

  verify(phone: string, otp: string): boolean {
    const record = this.store.get(phone);

    if (!record) {
      throw new BadRequestException('No OTP was sent to this number. Please request a new one.');
    }

    if (Date.now() > record.expiresAt) {
      this.store.delete(phone);
      throw new BadRequestException('OTP has expired. Please request a new one.');
    }

    record.attempts += 1;
    if (record.attempts > this.MAX_ATTEMPTS) {
      this.store.delete(phone);
      throw new BadRequestException('Too many incorrect attempts. Please request a new OTP.');
    }

    if (record.otp !== otp) {
      throw new BadRequestException(`Invalid OTP. ${this.MAX_ATTEMPTS - record.attempts} attempts remaining.`);
    }

    // Success — clean up
    this.store.delete(phone);
    return true;
  }

  private checkRateLimit(phone: string): void {
    const now = Date.now();
    const windowStart = now - this.RATE_LIMIT_WINDOW_MS;
    const timestamps = (this.sendLog.get(phone) ?? []).filter(t => t > windowStart);

    if (timestamps.length >= 5) {
      throw new TooManyRequestsException('Too many OTP requests. Please try again later.');
    }

    timestamps.push(now);
    this.sendLog.set(phone, timestamps);
  }
}
