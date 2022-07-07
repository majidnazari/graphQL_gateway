import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { Token } from './entity/token.entity';

@Injectable()
export class AppService {
  static tokens: Token[];
  static findToken(token: string): Token {
    const find = AppService.tokens.find(t => t.token === token);
    if (find && !find.isExpired()) {
      return find;
    } else if (find) {
      AppService.tokens = AppService.tokens.filter(t => t.token !== token);
    }
    return null;
  }
  static addToken(token: string) {
    const find = AppService.findToken(token);
    if (find) {
      find.expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7);
    }
    if (!find) {
      const newToken = new Token();
      newToken.token = token;
      newToken.expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7);
      AppService.tokens.push(newToken);
    }
  }
  static async auth(token: string): Promise<boolean> {
    if (AppService.findToken(token)) {
      return true;
    }
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
      AppService.addToken(token);
      return true;
    } catch (e) {
      return false;
    }
  }
}
