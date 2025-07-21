import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { ParseObjectIdPipe } from '@/core/parse-id.pipe';

export const UserId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const id = request.user?._id;
    return new ParseObjectIdPipe().transform(id);
  },
);
