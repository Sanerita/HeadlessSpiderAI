import { Skeleton } from '@mui/material';

export default function LoadingSkeleton() {
  return (
    <div>
      <Skeleton variant="rectangular" width={210} height={118} />
      <Skeleton width="60%" />
    </div>
  );
}