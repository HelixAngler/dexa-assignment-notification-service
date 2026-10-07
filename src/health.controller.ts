import { Controller, Get } from '@nestjs/common';

/** Body returned by the liveness endpoint. */
export interface HealthPayload {
  status: 'ok';
  service: 'notification-service';
}

@Controller('health')
export class HealthController {
  @Get()
  getHealth(): HealthPayload {
    return { status: 'ok', service: 'notification-service' };
  }
}
