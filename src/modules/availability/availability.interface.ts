import { WeekDay } from "../../../generated/prisma/enums";

export interface ICreateAvailability {
  day: WeekDay;
  startTime: Date;
  endTime: Date;
}

export interface IUpdateAvailability {
  day?: WeekDay;
  startTime?: Date;
  endTime?: Date;
}