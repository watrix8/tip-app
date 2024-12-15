import Link from 'next/link'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export default function LandingPage() {
  return (
    <div className={`min-h-screen bg-white font-sans ${inter.className}`}>
      <header className="border-b border-gray-200">
        <div className="container mx-auto px-4 py-6 flex justify-between items-center">
          <div className="text-2xl font-bold text-black">TipEase</div>
          <nav className="flex items-center">
            <ul className="flex space-x-4 mr-8">
              <li><Link href="#features" className="text-gray-600 hover:text-black">Funkcje</Link></li>
              <li><Link href="#pricing" className="text-gray-600 hover:text-black">Cennik</Link></li>
              <li><Link href="#contact" className="text-gray-600 hover:text-black">Kontakt</Link></li>
            </ul>
            <div className="flex space-x-4">
              <Link href="/login" 
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
                Zaloguj się
              </Link>
              <Link href="/register" 
                className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800">
                Załóż konto
              </Link>
            </div>
          </nav>
        </div>
      </header>
      <main>
        <section className="py-20">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-5xl font-bold mb-6 text-black tracking-tight">Odbieraj napiwki cyfrowo</h1>
            <p className="text-xl mb-8 max-w-2xl mx-auto text-gray-600">
              TipEase to prosta i elegancka aplikacja dla kelnerów, która umożliwia łatwe odbieranie napiwków w formie elektronicznej.
            </p>
            <Link href="/register" 
              className="inline-block px-8 py-3 bg-black text-white rounded-md hover:bg-gray-800 text-lg">
              Rozpocznij za darmo
            </Link>
          </div>
        </section>
        <section id="features" className="py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-12 text-center text-black tracking-tight">Główne funkcje</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <FeatureCard 
                title="Szybkie płatności" 
                description="Odbieraj napiwki błyskawicznie za pomocą kodów QR lub linków."
              />
              <FeatureCard 
                title="Śledzenie zarobków" 
                description="Monitoruj swoje napiwki i analizuj trendy w czasie."
              />
              <FeatureCard 
                title="Bezpieczne wypłaty" 
                description="Wypłacaj zarobione napiwki bezpośrednio na swoje konto bankowe."
              />
            </div>
          </div>
        </section>
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-6 text-black tracking-tight">Gotowy, aby zwiększyć swoje napiwki?</h2>
            <p className="text-xl mb-8 text-gray-600">
              Dołącz do tysięcy zadowolonych kelnerów korzystających z TipEase.
            </p>
            <Link href="/register" 
              className="inline-block px-8 py-3 bg-black text-white rounded-md hover:bg-gray-800 text-lg">
              Zarejestruj się teraz
            </Link>
          </div>
        </section>
      </main>
      <footer className="border-t border-gray-200 py-8 bg-white">
        <div className="container mx-auto px-4 text-center text-sm text-gray-600">
          &copy; 2024 TipEase. Wszelkie prawa zastrzeżone.
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({ title, description }: { title: string, description: string }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h3 className="text-xl font-semibold mb-2 text-black tracking-tight">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  )
}