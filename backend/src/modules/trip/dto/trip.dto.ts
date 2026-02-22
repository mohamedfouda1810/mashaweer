import {
  IsString,
  IsNumber,
  IsDateString,
  IsInt,
  Min,
  IsOptional,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateTripDto {
  @IsString()
  fromCity: string;

  @IsString()
  toCity: string;

  @IsOptional()
  @IsString()
  fromAddress?: string;

  @IsOptional()
  @IsString()
  toAddress?: string;

  @IsString()
  gatheringLocation: string;

  @IsOptional()
  @IsNumber()
  gatheringLatitude?: number;

  @IsOptional()
  @IsNumber()
  gatheringLongitude?: number;

  @IsDateString()
  departureTime: string;

  @IsOptional()
  @IsDateString()
  estimatedArrival?: string;

  @IsNumber()
  @Min(0)
  price: number;

  @IsInt()
  @Min(1)
  @Max(20)
  totalSeats: number;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class FilterTripsDto {
  @IsOptional()
  @IsString()
  fromCity?: string;

  @IsOptional()
  @IsString()
  toCity?: string;

  @IsOptional()
  @IsDateString()
  date?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  minPrice?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  maxPrice?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  limit?: number = 10;
}
