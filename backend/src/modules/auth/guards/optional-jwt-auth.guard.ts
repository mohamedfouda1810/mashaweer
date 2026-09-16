import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Lets public routes enrich a request with the current user when a valid
 * bearer token is supplied, without making a token mandatory.
 */
@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    return request.headers?.authorization ? super.canActivate(context) : true;
  }

  handleRequest<TUser = any>(_error: any, user: TUser): TUser {
    // Passport uses the returned value to attach req.user. `null` is valid for
    // this optional guard, so public callers simply remain anonymous.
    return (user || null) as TUser;
  }
}
