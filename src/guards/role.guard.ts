import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    console.log('User in RoleGuard:', user);
    
    if (!user || !user.role) {
      throw new ForbiddenException('No user role found');
    }

    const roles = this.reflector.get<string[]>('roles', context.getHandler());
    if (!roles) return true;

    // Kiểm tra xem user có quyền truy cập route này không
    if (!roles.includes(user.role)) {
      throw new ForbiddenException('You do not have permission to access this resource');
    }

    // Kiểm tra đặc biệt cho việc tạo user
    console.log('Request URL:', request.url);
    if (request.url === '/api/v1/users' && request.method === 'POST') {
      console.log("Create user guard")
      const {role: newUserRole} = request.body;
      if (user.role === 'admin') {
        if (newUserRole !== 'teacher' && newUserRole !== 'student') {
          throw new ForbiddenException('Admin can only create teacher or student');
        }
      } else if (user.role === 'teacher') {
        if (newUserRole !== 'student') {
          throw new ForbiddenException('Teacher can only create student');
        }
      } else {
        throw new ForbiddenException('You do not have permission to create users');
      }
    }
    return true;
  }
}
