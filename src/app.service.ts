import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class AppService {
  static async auth(token: string): Promise<boolean> {
    console.log(`checking token : ${token}`);
    const query = `{
      gettest(token: "${token}")
    }`;
    const res = await axios.post(process.env.ACADEMY_GQL_ADDRESS, {
      query,
    });
    return Boolean(res.data.data.gettest);
  }
}
