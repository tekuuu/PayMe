import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface UserAvatarProfileProps {
  className?: string;
  showInfo?: boolean;
  wallet: {
    address: string;
    network?: string;
    isConnected: boolean;
  } | null;
}

export function UserAvatarProfile({
  className,
  showInfo = false,
  wallet
}: UserAvatarProfileProps) {
  const truncatedAddress = wallet?.address
    ? `${wallet.address.slice(0, 6)}...${wallet.address.slice(-4)}`
    : 'Not Connected';

  const avatarUrl = wallet?.address
    ? `https://api.dicebear.com/9.x/identicon/svg?seed=${wallet.address}`
    : `https://api.dicebear.com/9.x/identicon/svg?seed=placeholder`;

  return (
    <div className='flex items-center gap-3'>
      <div className='relative'>
        <Avatar className={className}>
          <AvatarImage src={avatarUrl} alt="User Avatar" />
          <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground font-bold">
            {wallet?.address ? wallet.address.slice(2, 4).toUpperCase() : '??'}
          </AvatarFallback>
        </Avatar>
        {wallet?.isConnected && (
          <span className='absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background bg-green-500 shadow-sm' />
        )}
      </div>

      {showInfo && (
        <div className='grid flex-1 text-left text-sm leading-tight'>
          <span className='truncate font-semibold'>{truncatedAddress}</span>
          <span className='truncate text-xs text-muted-foreground'>
            {wallet?.network || 'Sepolia Network'}
          </span>
        </div>
      )}
    </div>
  );
}
