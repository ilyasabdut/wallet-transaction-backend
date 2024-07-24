import { PrismaService } from 'src/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { userSelect } from 'src/prisma/prisma.selects';

@Injectable()
export class UserRepository {
  constructor(private prisma: PrismaService) {}

 async getAllUsers() {
    return this.prisma.user.findMany({
    where: {
        deleted_at: null,
    },
    ...userSelect,
    });
 }
    
 async getUserByUsername(username: string) {
  return this.prisma.user.findUnique({
    where: {
      username: username,
        },
    ...userSelect,
    });
 }

 async getRoleByName(role: string) {
  return this.prisma.role.findUnique({
    where: {
      name: role,
        },
    });
 }

 async createUser(data: {
  username: string;
  password: string;
  role: number;
    }) {
    const { username, password, role } = data;
        return this.prisma.user.create({
            data: {
            username: username,
            password: password,
            created_at: new Date(),
            updated_at: new Date(),
            roles: {
                create: {
                role: {
                    connect: { id: role },
                },
                },
            },
            },
            ...userSelect,
        });
    }

 async updateUser(id: number, data: {
  username: string;
  password: string;
  role: number;
    }) {
    const { username, password, role } = data;
        return this.prisma.user.update({
            where: { id },
            data: {
            username: username,
            password: password,
            updated_at: new Date(),
            roles: {
                deleteMany: {}, // Clear existing roles
                create: {
                role: {
                    connect: { id: role },
                },
                },
            },
            },
            ...userSelect,
        });
        
    }

    async deleteUser(id: number) {
        return this.prisma.user.update({
            where: { id },
            data: {
            deleted_at: new Date(),
            },
            ...userSelect,
        });
    }

}



