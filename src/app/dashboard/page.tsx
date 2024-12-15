// 'use client';

// import { useEffect, useState } from 'react';
// import { useRouter } from 'next/navigation';
// import { useAuth } from '@/lib/contexts/auth';
// import LandingPage from '@/app/components/LandingPage';

// export default function HomePage() {
//   const router = useRouter();
//   const { user, loading } = useAuth();
//   const [isLoading, setIsLoading] = useState(true);

//   useEffect(() => {
//     if (!loading) {
//       if (user) {
//         router.push('/dashboard/waiter');
//       } else {
//         setIsLoading(false);
//       }
//     }
//   }, [user, loading, router]);

//   if (isLoading || loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
//       </div>
//     );
//   }

//   return <LandingPage />;
// }