import type { ReactNode } from 'react';
import { formatTimeAgo, formatDateTime } from '@/utils/formatters';

interface TimeAgoProps {
  dateTime: string;
  showTooltip?: boolean;
}

export function TimeAgo({
  dateTime,
  showTooltip = true,
}: TimeAgoProps): ReactNode {
  const timeAgo = formatTimeAgo(dateTime);
  const fullDate = formatDateTime(dateTime);

  if (showTooltip) {
    return (
      <span title={fullDate} className="text-muted">
        {timeAgo}
      </span>
    );
  }

  return <span className="text-muted">{timeAgo}</span>;
}
