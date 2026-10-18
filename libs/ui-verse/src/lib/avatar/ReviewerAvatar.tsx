import { Avatar } from '@mantine/core';

export interface Reviewer {
  name: string;
  /** Image URL. When missing or broken, initials are shown. */
  src?: string;
}

const initialsOf = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');

export interface ReviewerAvatarProps extends Reviewer {
  size?: number;
  /** When set, the avatar becomes a button, e.g. to open the reviewer's profile. */
  onClick?: (name: string) => void;
}

export function ReviewerAvatar({ name, src, size = 40, onClick }: ReviewerAvatarProps) {
  return (
    <Avatar
      src={src}
      alt={name}
      title={name}
      size={size}
      color="blue"
      aria-label={name}
      {...(onClick
        ? {
            component: 'button' as const,
            type: 'button' as const,
            onClick: () => onClick(name),
            style: { cursor: 'pointer' },
          }
        : { role: 'img' })}
    >
      {initialsOf(name)}
    </Avatar>
  );
}

export interface ReviewerStackProps {
  reviewers: Reviewer[];
  /** Avatars beyond this number collapse into a "+N" avatar. */
  max?: number;
  size?: number;
  /** Called with the reviewer's name when one of the avatars is clicked. */
  onReviewerClick?: (name: string) => void;
}

export function ReviewerStack({
  reviewers,
  max = 4,
  size = 40,
  onReviewerClick,
}: ReviewerStackProps) {
  const shown = reviewers.slice(0, max);
  const hidden = reviewers.length - shown.length;
  const hiddenNames = reviewers
    .slice(max)
    .map((r) => r.name)
    .join(', ');
  return (
    <Avatar.Group aria-label={`${reviewers.length} reviewers`}>
      {shown.map((r) => (
        <ReviewerAvatar key={r.name} {...r} size={size} onClick={onReviewerClick} />
      ))}
      {hidden > 0 && (
        <Avatar
          size={size}
          role="img"
          aria-label={`${hidden} more: ${hiddenNames}`}
          title={hiddenNames}
        >
          +{hidden}
        </Avatar>
      )}
    </Avatar.Group>
  );
}
