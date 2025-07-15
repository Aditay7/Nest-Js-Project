import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/lib/db/entities/user.entity';

@Module({
    imports: [TypeOrmModule.forFeature([User])],
    controllers: [],
    providers: [],
})
export class UserModule {}
