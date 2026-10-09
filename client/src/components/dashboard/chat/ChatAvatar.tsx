import { HiOutlinePhoto } from 'react-icons/hi2';
import type { Conversation } from '../../../services/inquiriesServices';
import { avatarColor, initialsOf } from './chatUtils';

type ChatAvatarProps = {
  conversation: Conversation;
  size?: 'md' | 'lg';
};

/** The item's photo, with the other person's initials badged on its corner. */
export default function ChatAvatar({ conversation, size = 'md' }: ChatAvatarProps) {
  const box = size === 'lg' ? 'h-12 w-12' : 'h-11 w-11';
  const image = conversation.item?.image;

  return (
    <div className={`relative shrink-0 ${box}`}>
      {image ? (
        <img src={image} alt="" className={`${box} rounded-xl object-cover ring-1 ring-ink/10`} />
      ) : (
        <div className={`${box} flex items-center justify-center rounded-xl bg-navy/5 text-ink/30 ring-1 ring-ink/10`}>
          <HiOutlinePhoto className="h-5 w-5" />
        </div>
      )}
      <span
        className={`absolute -bottom-1 -left-1 flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br ${avatarColor(conversation)} font-display text-[10px] font-bold text-white ring-2 ring-white`}
      >
        {initialsOf(conversation)}
      </span>
    </div>
  );
}
