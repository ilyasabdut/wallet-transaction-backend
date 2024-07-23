import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { userSelect } from 'src/prisma/prisma.selects';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

 async create(createUserDto: CreateUserDto) {
    const { username, password, role } = createUserDto;

    const getUser = await this.prisma.user.findUnique({
      where: {
        username: username,
      },
    });

    if (getUser) {
      throw new Error('User already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const getRole = await this.prisma.role.findUnique({
      where: {
        name: role,
      },
    });

    if (!getRole) {
      throw new Error('Role not found');
    }
    const user = await this.prisma.user.create({
      data: {
        username: username,
        password: hashedPassword,
        created_at: new Date(),
        updated_at: new Date(),
        roles: {
          create: {
            role: {
              connect: { id: getRole.id },
            },
          },
        },
      },
      ...userSelect,
    });
    return user;
  }

  findAll() {
    const user =  this.prisma.user.findMany({
      where: {
        deleted_at: null,
      },
      ...userSelect,
    });
    return user;
  }

  async findOne(id: number) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: id,
        deleted_at: null,
      },
      ...userSelect,
    });

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const { username, password, role } = updateUserDto;

    let hashedPassword: string | undefined;
    if (password) {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    let getRole;
    if (role) {
      getRole = await this.prisma.role.findUnique({
        where: { name: role },
      });

      if (!getRole) {
        throw new Error('Role not found');
      }
    }

    const user = await this.prisma.user.update({
      where: { id },
      data: {
        username,
        password: hashedPassword,
        updated_at: new Date(),
        roles: getRole
          ? {
              deleteMany: {}, // Clear existing roles
              create: {
                role: {
                  connect: { id: getRole.id },
                },
              },
            }
          : undefined,
      },
      ...userSelect,
    });

    return  user;
  }

   remove(id: number) {
    const user = this.prisma.user.update({
      where: { id: id, deleted_at: null },
      data: {
        deleted_at: new Date(),
      },
      ...userSelect,
    });

    if (!user) {
      throw new Error('User not found');
    }

    return user;

  }
}
