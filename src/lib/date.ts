import { format, formatDistanceToNow } from "date-fns";

export function formatDate(
  date: Date | string | number,
  pattern = "MMM d, yyyy",
) {
  return format(new Date(date), pattern);
}

export function formatRelativeTime(date: Date | string | number) {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}
