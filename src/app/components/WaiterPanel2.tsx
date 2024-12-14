// import { LogOut, AlertCircle, ExternalLink, LineChart } from 'lucide-react';
// import { useState, useEffect } from 'react';
// import { initializeStripeConnect, checkStripeAccountStatus } from '@/app/utils/stripeUtils';
// // import { auth } from '@/app/config/firebase';
// // import { stripe } from '@/app/config/stripe';

// interface WaiterPanelProps {
//   onLogout: () => void;
//   currentUser: {
//     id: string;
//     name: string;
//     email: string;
//   } | null;
// }

// export default function WaiterPanel({ onLogout, currentUser }: WaiterPanelProps) {
//   const [isStripeEnabled, setIsStripeEnabled] = useState(false);
//   const [isLoading, setIsLoading] = useState(true);
//   const [stripeDashboardUrl, setStripeDashboardUrl] = useState('');

//   // Hook sprawdzający status Stripe i pobierający URL do dashboardu
//   useEffect(() => {
//     async function checkStripeEnabled() {
//       if (currentUser?.id) {
//         try {
//           setIsLoading(true);
//           const status = await checkStripeAccountStatus(currentUser.id);
//           setIsStripeEnabled(status);
          
//           if (status) {
//             // Pobierz URL do Stripe Express Dashboard
//             const response = await fetch('/api/stripe', {
//               method: 'POST',
//               headers: { 'Content-Type': 'application/json' },
//               body: JSON.stringify({
//                 action: 'create-login-link',
//                 userId: currentUser.id
//               })
//             });
            
//             if (response.ok) {
//               const { url } = await response.json();
//               setStripeDashboardUrl(url);
//             }
//           }
//         } catch (error) {
//           console.error('Błąd podczas sprawdzania statusu Stripe:', error);
//         } finally {
//           setIsLoading(false);
//         }
//       }
//     }
    
//     checkStripeEnabled();
//   }, [currentUser?.id]);

//   // Handler do konfiguracji Stripe
//   const handleStripeSetup = async () => {
//     if (currentUser?.id) {
//       try {
//         await initializeStripeConnect(currentUser.id);
//       } catch (error) {
//         console.error('Błąd podczas konfiguracji Stripe:', error);
//         alert('Wystąpił błąd podczas konfiguracji płatności');
//       }
//     }
//   };

//   // Handler otwierający dashboard Stripe w nowym oknie
//   const handleOpenStripeDashboard = () => {
//     if (stripeDashboardUrl) {
//       window.open(stripeDashboardUrl, '_blank', 'noopener,noreferrer');
//     }
//   };

//   // Generowanie URL strony do napiwków
//   const getTipPageUrl = () => {
//     if (!currentUser?.id || !currentUser?.name) return '';
//     return `${process.env.NEXT_PUBLIC_BASE_URL}/tip?waiterId=${currentUser.id}&name=${encodeURIComponent(currentUser.name)}`;
//   };

//   return (
//     <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
//       {/* Sekcja główna z nazwą kelnera */}
//       <div className="text-center">
//         <h1 className="text-2xl font-bold text-gray-900">
//           Panel kelnera: {currentUser?.name}
//         </h1>
//       </div>

//       {/* Stripe Connect Section */}
//       {!isLoading && !isStripeEnabled && (
//         <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
//           <div className="flex">
//             <AlertCircle className="h-5 w-5 text-yellow-400" />
//             <div className="ml-3">
//               <h3 className="text-sm font-medium text-yellow-800">
//                 Skonfiguruj odbieranie płatności
//               </h3>
//               <p className="mt-2 text-sm text-yellow-700">
//                 Aby móc otrzymywać napiwki, musisz skonfigurować konto Stripe.
//               </p>
//               <button
//                 onClick={handleStripeSetup}
//                 className="mt-4 bg-yellow-800 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors"
//               >
//                 Skonfiguruj płatności
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Sekcja z linkami (Stripe Dashboard i strona napiwków) */}
//       {isStripeEnabled && !isLoading && (
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//           {/* Link do Stripe Dashboard */}
//           <div className="bg-white p-6 rounded-lg shadow-md">
//             <div className="flex items-center justify-center mb-4">
//               <LineChart className="w-12 h-12 text-blue-600" />
//             </div>
//             <h3 className="text-lg font-semibold text-center mb-4">
//               Panel zarobków i statystyk
//             </h3>
//             <p className="text-sm text-gray-600 text-center mb-4">
//               Zobacz swoje zarobki, historię transakcji i statystyki w panelu Stripe
//             </p>
//             <button
//               onClick={handleOpenStripeDashboard}
//               className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg flex items-center justify-center hover:bg-blue-700 transition-colors"
//             >
//               <ExternalLink className="w-5 h-5 mr-2" />
//               Otwórz panel zarobków
//             </button>
//           </div>

//           {/* Link do strony napiwków */}
//           <div className="bg-white p-6 rounded-lg shadow-md">
//             <div className="flex items-center justify-center mb-4">
//               <ExternalLink className="w-12 h-12 text-green-600" />
//             </div>
//             <h3 className="text-lg font-semibold text-center mb-4">
//               Twoja strona do napiwków
//             </h3>
//             <p className="text-sm text-gray-600 text-center mb-4">
//               Udostępnij ten link klientom, aby mogli zostawić Ci napiwek
//             </p>
//             <button
//               onClick={() => window.open(getTipPageUrl(), '_blank')}
//               className="w-full bg-green-600 text-white py-3 px-4 rounded-lg flex items-center justify-center hover:bg-green-700 transition-colors"
//             >
//               <ExternalLink className="w-5 h-5 mr-2" />
//               Otwórz stronę napiwków
//             </button>
//           </div>
//         </div>
//       )}

//       {/* Przycisk wylogowania */}
//       <div className="pt-6">
//         <button
//           onClick={onLogout}
//           className="w-full bg-gray-200 text-gray-800 py-3 px-4 rounded-lg flex items-center justify-center hover:bg-gray-300 transition-colors"
//         >
//           <LogOut className="w-5 h-5 mr-2" />
//           Wyloguj się
//         </button>
//       </div>
//     </div>
//   );
// }