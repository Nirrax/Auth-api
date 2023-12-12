import { Injectable } from '@nestjs/common';

@Injectable({})
export class AuthService {
  signUp() {
    return { msg: 'SignUp' };
  }

  signIn() {
    return { msg: 'SignIn' };
  }
}
