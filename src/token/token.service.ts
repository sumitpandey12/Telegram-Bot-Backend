import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class TokenService {
  private token: string = '';
  constructor(private readonly eventEmitter: EventEmitter2) {
    this.token = process.env.TELEGRAM_API_KEY;
  }

  getToken(): string {
    return this.token;
  }

  setToken(token: string) {
    this.token = token;
    this.eventEmitter.emit('apiKeyUpdated', token);
    return this.token;
  }
}
