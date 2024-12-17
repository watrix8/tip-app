'use client'

import Link from 'next/link'
import { Inter } from 'next/font/google'
import { HandCoins, CreditCard, Clock, ShieldCheck, PiggyBank, AlertCircle, Menu, X, ChevronDown } from 'lucide-react'
import { useState } from 'react'

const inter = Inter({ subsets: ['latin'] })

export default function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <div className={`min-h-screen bg-white font-sans ${inter.className}`}>
      {/* Mobile-optimized header */}
      <header className="border-b border-gray-200 sticky top-0 bg-white z-50">
        <div className="container mx-auto px-4 py-4 md:py-6 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <HandCoins className="w-6 h-6 md:w-7 md:h-7 text-blue-600" />
            <div className="text-xl md:text-2xl font-bold text-black">tippin&apos;</div>
          </div>
          
          {/* Mobile menu button */}
          <button 
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className="w-6 h-6 text-gray-900" />
            ) : (
              <Menu className="w-6 h-6 text-gray-900" />
            )}
          </button>

          {/* Desktop navigation */}
          <nav className="hidden md:flex items-center">
            <ul className="flex space-x-6 mr-8">
              <li><Link href="#features" className="text-gray-600 hover:text-black">Funkcje</Link></li>
              <li><Link href="#pricing" className="text-gray-600 hover:text-black">Cennik</Link></li>
              <li><Link href="#faq" className="text-gray-600 hover:text-black">FAQ</Link></li>
              <li><Link href="/login" className="text-gray-600 hover:text-black">Logowanie</Link></li>
            </ul>
          </nav>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-100">
            <nav className="py-2">
              <ul className="flex flex-col space-y-2">
                <li>
                  <Link 
                    href="#features" 
                    className="block px-4 py-2 text-gray-600 hover:bg-gray-50"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Funkcje
                  </Link>
                </li>
                <li>
                  <Link 
                    href="#pricing" 
                    className="block px-4 py-2 text-gray-600 hover:bg-gray-50"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Cennik
                  </Link>
                </li>
                <li>
                  <Link 
                    href="#faq" 
                    className="block px-4 py-2 text-gray-600 hover:bg-gray-50"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    FAQ
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/login" 
                    className="block px-4 py-2 text-gray-600 hover:bg-gray-50"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Logowanie
                  </Link>
                </li>
              </ul>
            </nav>
          </div>
        )}
      </header>

      <main className="pt-4 md:pt-0">
        {/* Hero Section */}
        <section className="py-12 md:py-20">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 md:mb-6 text-black tracking-tight">
              Nie strać już żadnego napiwku
            </h1>
            <p className="text-lg md:text-xl mb-6 md:mb-8 max-w-2xl mx-auto text-gray-600 px-4">
              Przyjmuj je kartą lub BLIK-iem
            </p>
            <Link href="/login" 
              className="inline-block px-6 md:px-8 py-3 bg-black text-white rounded-md hover:bg-gray-800 text-lg">
              Dołącz za darmo
            </Link>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-12 md:py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold mb-8 md:mb-12 text-center text-black">
              Dlaczego tippin&apos;?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-5xl mx-auto">
              <FeatureCard 
                icon={<CreditCard className="w-8 h-8 text-blue-600" />}
                title="Wygodne metody płatności" 
                description="Przyjmuj napiwki kartą i BLIK-iem. Twoi klienci mogą płacić tak, jak lubią."
              />
              <FeatureCard 
                icon={<Clock className="w-8 h-8 text-blue-600" />}
                title="Szybkie wypłaty" 
                description="Środki trafiają bezpośrednio na Twoje konto. Bez pośredników i zbędnego oczekiwania."
              />
              <FeatureCard 
                icon={<ShieldCheck className="w-8 h-8 text-blue-600" />}
                title="Bezpieczeństwo" 
                description="Używamy Stripe Connect - tego samego systemu co największe platformy na świecie."
              />
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-12 md:py-20 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold mb-8 md:mb-12 text-center text-black">
              Przejrzyste zasady
            </h2>
            <div className="max-w-2xl mx-auto bg-gray-50 rounded-lg p-6 md:p-8 shadow-sm">
              <div className="text-center mb-6 md:mb-8">
                <p className="text-3xl md:text-4xl font-bold text-blue-600">1 PLN + 4.5%</p>
                <p className="text-gray-600 mt-2">prowizji od każdej transakcji</p>
              </div>
              <div className="space-y-4">
                <div className="flex items-start">
                  <PiggyBank className="w-5 h-5 text-green-500 mt-1 mr-3 flex-shrink-0" />
                  <p className="text-gray-600">
                    Niższa prowizja niż przy napiwkach z terminala płatniczego
                  </p>
                </div>
                <div className="flex items-start">
                  <AlertCircle className="w-5 h-5 text-blue-500 mt-1 mr-3 flex-shrink-0" />
                  <p className="text-gray-600">
                    Brak ukrytych opłat czy miesięcznych subskrypcji
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="py-12 md:py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold mb-8 md:mb-12 text-center text-black">
              Często zadawane pytania
            </h2>
            <div className="max-w-3xl mx-auto space-y-4 md:space-y-8">
              <FAQItem 
                question="Jak działa proces wypłat?"
                answer="Środki z napiwków trafiają bezpośrednio na Twoje konto w Stripe Connect, a stamtąd automatycznie na Twoje konto bankowe. Nie przetrzymujemy ani nie zarządzamy Twoimi pieniędzmi."
              />
              <FAQItem 
                question="Jak długo trwa rejestracja?"
                answer="Rejestracja jest prosta i zajmuje kilka minut. Po utworzeniu konta przechodzisz przez prosty proces weryfikacji w Stripe Connect. Gdy tylko zostanie zakończony, możesz zacząć przyjmować napiwki."
              />
              <FAQItem 
                question="Jakie są limity napiwków?"
                answer="Minimalna kwota napiwku wynosi 5 PLN, a maksymalna 500 PLN. Limity te zostały ustalone, aby zapewnić wygodę użytkowania i bezpieczeństwo transakcji."
              />
              <FAQItem 
                question="Czy muszę mieć terminal płatniczy?"
                answer="Nie! Wystarczy smartfon - generujesz unikalny kod QR lub link do płatności, który możesz pokazać klientowi. Nie potrzebujesz żadnego dodatkowego sprzętu."
              />
              <FAQItem 
                question="Czy mogę śledzić swoje napiwki?"
                answer="Tak, masz dostęp do szczegółowej historii wszystkich transakcji w panelu Stripe. Możesz sprawdzać statystyki i generować raporty."
              />
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-12 md:py-20 bg-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6 text-black">
              Gotowy na więcej napiwków?
            </h2>
            <p className="text-lg md:text-xl mb-6 md:mb-8 text-gray-600">
              Dołącz do tippin&apos; i zacznij przyjmować płatności jeszcze dziś
            </p>
            <Link href="/login" 
              className="inline-block px-6 md:px-8 py-3 bg-black text-white rounded-md hover:bg-gray-800 text-lg">
              Rozpocznij za darmo
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-gray-200 py-6 md:py-8 bg-white">
        <div className="container mx-auto px-4 text-center text-sm text-gray-600">
          &copy; {new Date().getFullYear()} tippin&apos;. Wszelkie prawa zastrzeżone.
          <div className="mt-2">
            <Link href="/regulamin" className="text-gray-500 hover:text-gray-700 hover:underline">
              Regulamin usługi
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({ icon, title, description }: { 
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm text-center">
      <div className="flex justify-center mb-4">
        {icon}
      </div>
      <h3 className="text-lg md:text-xl font-semibold mb-2 text-black">{title}</h3>
      <p className="text-sm md:text-base text-gray-600">{description}</p>
    </div>
  )
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm">
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="w-full text-left flex justify-between items-center"
      >
        <h3 className="text-base md:text-lg font-semibold text-black">{question}</h3>
        <span className={`transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
          <ChevronDown className="w-5 h-5 text-gray-500" />
        </span>
      </button>
      {isOpen && (
        <p className="text-sm md:text-base text-gray-600 mt-4">{answer}</p>
      )}
    </div>
  )
}