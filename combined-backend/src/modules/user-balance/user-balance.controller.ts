import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { UserBalanceService } from './user-balance.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';

@Controller('user-balance')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UserBalanceController {
  constructor(private readonly userBalanceService: UserBalanceService) {}

  @Get(':userId')
  @Roles(Role.ADMIN)
  async getUserBalances(@Param('userId') userId: string) {
    return this.userBalanceService.getUserBalances(userId);
  }

  @Get(':userId/:assetId')
  @Roles(Role.ADMIN)
  async getBalance(
    @Param('userId') userId: string,
    @Param('assetId') assetId: string,
  ) {
    return this.userBalanceService.getBalance(userId, assetId);
  }

  @Post(':userId/:assetId/lock')
  @Roles(Role.ADMIN)
  async lockBalance(
    @Param('userId') userId: string,
    @Param('assetId') assetId: string,
    @Body('amount') amount: string,
  ) {
    return this.userBalanceService.lockBalance(userId, assetId, amount);
  }

  @Post(':userId/:assetId/unlock')
  @Roles(Role.ADMIN)
  async unlockBalance(
    @Param('userId') userId: string,
    @Param('assetId') assetId: string,
    @Body('amount') amount: string,
  ) {
    return this.userBalanceService.unlockBalance(userId, assetId, amount);
  }

  @Post(':userId/:assetId/update')
  @Roles(Role.ADMIN)
  async updateBalance(
    @Param('userId') userId: string,
    @Param('assetId') assetId: string,
    @Body('amount') amount: string,
    @Body('isLocked') isLocked: boolean,
  ) {
    return this.userBalanceService.updateBalance(userId, assetId, amount, isLocked);
  }
}