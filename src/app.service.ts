import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class AppService {
  static async auth(token: string): Promise<boolean> {
    const publicRoutes = [];
    const query = `{
      testHeader(simpleparameter: "${token}")
    }`;
    try {
      const res = await axios({
        method: 'POST',
        url: process.env.ACADEMY_GQL_ADDRESS,
        data: {
          query,
        },
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
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
