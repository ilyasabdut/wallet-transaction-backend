import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import { UserRepository } from './users.repository';

@Injectable()
export class UsersService {
  constructor(private userRepo: UserRepository) {}

  async create(createUserDto: CreateUserDto) {
    const { username, password, role } = createUserDto;

    const getUser = await this.userRepo.getUserByUsername(username);

    if (getUser) {
      throw new Error('User already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const getRole = await this.userRepo.getRoleByName(role);

    if (!getRole) {
      throw new Error('Role not found');
    }

    const user = await this.userRepo.createUser({
      username: username.toLowerCase(),
      password: hashedPassword,
      role: getRole.id,
    });

    return user;
  }

  async findAll() {
    const users = await this.userRepo.getAllUsers();
    return users;
  }

  async findOne(username: string, withPassword: boolean = false) {
    const user = await this.userRepo.getUserByUsername(username, withPassword);

    if (!user) {
      const error = new Error('User not found');
      console.log(error);
      throw error;      
    }

    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const { username, password, role } = updateUserDto;
    const getUser = await this.findOne(username);

    if (!getUser) {
      throw new Error('User not exists');
    }

    let hashedPassword: string | undefined;
    if (password) {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    let getRole;
    if (role) {
      getRole = await this.userRepo.getRoleByName(role);

      if (!getRole) {
        throw new Error('Role not found');
      }
    }

    const user = await this.userRepo.updateUser(id, {
      username: username,
      password: hashedPassword,
      role: getRole?.id,
    });

    return user;
  }

  async remove(id: number) {
    const user = await this.userRepo.deleteUser(id);

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }
}
