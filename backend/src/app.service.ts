import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      message: 'MSME Vendor Payment Tracking System API is running',
    };
  }
}

;
export default AppService;
