// ================================
// نظام التقويم الميلادي مع الأرقام الإنجليزية
// ================================

// أسماء الأشهر الميلادية بالإنجليزية
export const ENGLISH_MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December'
];

// أسماء أيام الأسبوع بالإنجليزية
export const ENGLISH_DAYS = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday'
];

// تحويل الأرقام العربية إلى إنجليزية (إذا وُجدت)
export const convertArabicToEnglishNumbers = (str: string): string => {
  const arabicNumbers = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  const englishNumbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
  
  let result = str;
  arabicNumbers.forEach((arabicNum, index) => {
    result = result.replace(new RegExp(arabicNum, 'g'), englishNumbers[index]);
  });
  
  return result;
};

// تنسيق التاريخ بالإنجليزية مع الأرقام الإنجليزية
export const formatDateInArabic = (date: Date | string, includeTime = false): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) {
    return 'Invalid Date';
  }

  const day = dateObj.getDate();
  const month = dateObj.getMonth();
  const year = dateObj.getFullYear();
  const dayName = ENGLISH_DAYS[dateObj.getDay()];
  const monthName = ENGLISH_MONTHS[month];

  let formattedDate = `${dayName}, ${monthName} ${day}, ${year}`;

  if (includeTime) {
    const hours = dateObj.getHours().toString().padStart(2, '0');
    const minutes = dateObj.getMinutes().toString().padStart(2, '0');
    formattedDate += ` at ${hours}:${minutes}`;
  }

  return formattedDate;
};

// تنسيق التاريخ المختصر بالإنجليزية
export const formatShortDateInArabic = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) {
    return 'Invalid Date';
  }

  const day = dateObj.getDate();
  const month = dateObj.getMonth();
  const year = dateObj.getFullYear();
  const monthName = ENGLISH_MONTHS[month];

  return `${monthName} ${day}, ${year}`;
};

// تنسيق الوقت الحالي بالإنجليزية
export const getCurrentTimeInArabic = (): string => {
  return formatDateInArabic(new Date(), true);
};

// الحصول على تاريخ مختصر للوقت الحالي
export const getCurrentShortDateInArabic = (): string => {
  return formatShortDateInArabic(new Date());
};

// تحويل التاريخ من تنسيق ISO إلى التنسيق الإنجليزي
export const formatISODateInArabic = (isoDate: string, includeTime = false): string => {
  return formatDateInArabic(new Date(isoDate), includeTime);
};

// تنسيق التاريخ للملفات والمعرفات (DD-MM-YYYY)
export const formatDateForFiles = (date: Date = new Date()): string => {
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  
  return `${day}-${month}-${year}`;
};

// تنسيق التاريخ والوقت للملفات (DD-MM-YYYY_HH-MM)
export const formatDateTimeForFiles = (date: Date = new Date()): string => {
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  
  return `${day}-${month}-${year}_${hours}-${minutes}`;
};

// التحقق من صحة التاريخ
export const isValidDate = (date: any): boolean => {
  return date instanceof Date && !isNaN(date.getTime());
};

// الحصول على بداية ونهاية اليوم
export const getStartOfDay = (date: Date): Date => {
  const newDate = new Date(date);
  newDate.setHours(0, 0, 0, 0);
  return newDate;
};

export const getEndOfDay = (date: Date): Date => {
  const newDate = new Date(date);
  newDate.setHours(23, 59, 59, 999);
  return newDate;
};

// إضافة أيام لتاريخ معين
export const addDays = (date: Date, days: number): Date => {
  const newDate = new Date(date);
  newDate.setDate(newDate.getDate() + days);
  return newDate;
};

// طرح أيام من تاريخ معين
export const subtractDays = (date: Date, days: number): Date => {
  const newDate = new Date(date);
  newDate.setDate(newDate.getDate() - days);
  return newDate;
};

// مقارنة تاريخين (هل هما في نفس اليوم؟)
export const isSameDay = (date1: Date, date2: Date): boolean => {
  return date1.getFullYear() === date2.getFullYear() &&
         date1.getMonth() === date2.getMonth() &&
         date1.getDate() === date2.getDate();
};

// الحصول على عدد الأيام بين تاريخين
export const getDaysBetween = (startDate: Date, endDate: Date): number => {
  const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};