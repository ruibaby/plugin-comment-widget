import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
import timezone from 'dayjs/plugin/timezone';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(timezone);
dayjs.extend(relativeTime);

dayjs.locale('zh-cn');

export function formatDate(date: string | Date | undefined | null): string {
  if (!date) {
    return '';
  }
  return dayjs(date).format('YYYY-MM-DD HH:mm');
}

export function timeAgo(date: string | Date | undefined | null): string {
  if (!date) {
    return '';
  }

  const currentDate = new Date();

  if (currentDate.getFullYear() - new Date(date).getFullYear() > 0) {
    return formatDate(new Date(date));
  }

  return dayjs().to(dayjs(date));
}
