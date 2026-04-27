import { Injectable } from '@nestjs/common';

export type UserRole = 'ADMIN' | 'MANAGER' | 'MEMBER';

export type User = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
};

@Injectable()
export class UsersService {
  private readonly users: User[] = [
    {
      id: 'user_1',
      name: 'Admin Demo',
      email: 'admin@smattracker.dev',
      role: 'ADMIN',
    },
  ];

  findAll() {
    return this.users;
  }

  findById(id: string) {
    return this.users.find((user) => user.id === id);
  }
}
