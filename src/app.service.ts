import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class AppService {
  static async auth(token: string): Promise<boolean> {
    const publicRoutes = [];
    const query = `{
      gettest(token: "${token}")
    }`;
    try {
      const res = await axios.post(process.env.ACADEMY_GQL_ADDRESS, {
        query,
      }, {
        headers: {
          authorization: `Bearer ${token}`
        }
      });
      if (res.data.errors?.length > 0) {
        return false;
      }
      return true;
    } catch (e) {
      return false;
    }
  }
}
