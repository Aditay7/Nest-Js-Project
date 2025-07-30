// Re-export enums for easier importing
export {
  DayOfWeek,
  SessionType,
} from '../db/entities/doctor-availability.entity';

// Import the enums for use in this file
import {
  DayOfWeek,
  SessionType,
} from '../db/entities/doctor-availability.entity';

// Helper functions for working with enums
export const getDayName = (day: DayOfWeek): string => {
  const dayNames = {
    [DayOfWeek.SUNDAY]: 'Sunday',
    [DayOfWeek.MONDAY]: 'Monday',
    [DayOfWeek.TUESDAY]: 'Tuesday',
    [DayOfWeek.WEDNESDAY]: 'Wednesday',
    [DayOfWeek.THURSDAY]: 'Thursday',
    [DayOfWeek.FRIDAY]: 'Friday',
    [DayOfWeek.SATURDAY]: 'Saturday',
  };
  return dayNames[day];
};

export const getSessionTypeName = (sessionType: SessionType): string => {
  const sessionNames = {
    [SessionType.MORNING]: 'Morning',
    [SessionType.AFTERNOON]: 'Afternoon',
    [SessionType.EVENING]: 'Evening',
    [SessionType.CUSTOM]: 'Custom',
  };
  return sessionNames[sessionType];
};

export const getAllDaysOfWeek = (): DayOfWeek[] => {
  return [
    DayOfWeek.SUNDAY,
    DayOfWeek.MONDAY,
    DayOfWeek.TUESDAY,
    DayOfWeek.WEDNESDAY,
    DayOfWeek.THURSDAY,
    DayOfWeek.FRIDAY,
    DayOfWeek.SATURDAY,
  ];
};

export const getAllSessionTypes = (): SessionType[] => {
  return [
    SessionType.MORNING,
    SessionType.AFTERNOON,
    SessionType.EVENING,
    SessionType.CUSTOM,
  ];
};

// Validation helpers
export const isValidDayOfWeek = (day: any): day is DayOfWeek => {
  return Object.values(DayOfWeek).includes(day);
};

export const isValidSessionType = (
  sessionType: any,
): sessionType is SessionType => {
  return Object.values(SessionType).includes(sessionType);
};
