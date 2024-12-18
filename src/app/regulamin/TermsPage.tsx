import React from 'react';
import Link from 'next/link';
import { HandCoins, ArrowLeft } from 'lucide-react';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export default function TermsPage() {
  return (
    <div className={`min-h-screen bg-white ${inter.className}`}>
      {/* Header */}
      <header className="border-b border-gray-200 sticky top-0 bg-white z-50">
        <div className="container mx-auto px-4 py-4 md:py-6 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
            <HandCoins className="w-6 h-6 md:w-7 md:h-7 text-blue-600" />
            <div className="text-xl md:text-2xl font-bold text-black">tippin&apos;</div>
          </Link>
          
          <Link 
            href="/" 
            className="flex items-center text-gray-600 hover:text-black"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Powrót
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold text-black mb-8">
            Regulamin serwisu tippin&apos;
          </h1>

          {/* Section I */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-black mb-6">I. Postanowienia ogólne</h2>
            <div className="space-y-4 text-gray-600">
              <p>
                1. Niniejszy Regulamin określa zasady świadczenia usług drogą elektroniczną przez serwis tippin&apos; (dalej: &ldquo;Serwis&rdquo; lub &ldquo;tippin&apos;&rdquo;).
              </p>
              <p>
                2. Właścicielem i operatorem Serwisu jest [NAZWA SPÓŁKI] z siedzibą w [MIASTO], przy ul. [ADRES], wpisana do rejestru przedsiębiorców Krajowego Rejestru Sądowego pod numerem KRS [NUMER], NIP [NUMER], REGON [NUMER] (dalej: &ldquo;Operator&rdquo;).
              </p>
              <p>
                3. Serwis tippin&apos; jest platformą technologiczną umożliwiającą przekazywanie napiwków w formie elektronicznej kelnerom za pośrednictwem systemu Stripe Connect.
              </p>
              <div>
                <p>4. Definicje:</p>
                <ul className="list-disc pl-8 mt-2 space-y-2">
                  <li>Użytkownik - osoba fizyczna prowadząca działalność gospodarczą, która korzysta z Serwisu w charakterze odbiorcy napiwków (kelner)</li>
                  <li>Klient - osoba przekazująca napiwek za pośrednictwem Serwisu</li>
                  <li>Stripe Connect - zewnętrzny system płatności umożliwiający bezpośrednie przekazywanie środków pomiędzy Klientami a Użytkownikami</li>
                  <li>Kod QR - unikalny kod przypisany do Użytkownika, umożliwiający przekierowanie do strony płatności</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section II */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-black mb-6">II. Warunki korzystania z serwisu</h2>
            <div className="space-y-4 text-gray-600">
              <div>
                <p>1. Z Serwisu w charakterze Użytkownika mogą korzystać wyłącznie osoby fizyczne, które:</p>
                <ul className="list-disc pl-8 mt-2 space-y-2">
                  <li>Ukończyły 18 rok życia</li>
                  <li>Posiadają pełną zdolność do czynności prawnych</li>
                  <li>Prowadzą działalność gospodarczą na terenie Rzeczypospolitej Polskiej</li>
                  <li>Zaakceptowały niniejszy Regulamin</li>
                  <li>Przeszły pozytywnie proces weryfikacji w systemie Stripe Connect</li>
                </ul>
              </div>
              <p>
                2. Korzystanie z Serwisu w charakterze Klienta nie wymaga rejestracji ani weryfikacji wieku.
              </p>
              <p>
                3. Serwis świadczy usługi wyłącznie na terenie Rzeczypospolitej Polskiej.
              </p>
            </div>
          </section>

          {/* Section III */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-black mb-6">III. Rejestracja i weryfikacja</h2>
            <div className="space-y-4 text-gray-600">
              <div>
                <p>1. Proces rejestracji Użytkownika obejmuje:</p>
                <ul className="list-disc pl-8 mt-2 space-y-2">
                  <li>Utworzenie konta w Serwisie poprzez podanie adresu email oraz imienia i nazwiska</li>
                  <li>Przejście procesu weryfikacji w systemie Stripe Connect</li>
                  <li>Podanie dodatkowych danych wymaganych przez Stripe Connect, w tym:
                    <ul className="list-disc pl-8 mt-2 space-y-2">
                      <li>numeru telefonu</li>
                      <li>adresu zamieszkania</li>
                      <li>numeru rachunku bankowego</li>
                      <li>informacji o wykonywanej profesji</li>
                    </ul>
                  </li>
                </ul>
              </div>
              <div>
                <p>2. Weryfikacja w systemie Stripe Connect:</p>
                <ul className="list-disc pl-8 mt-2 space-y-2">
                  <li>Jest przeprowadzana zgodnie z procedurami i wymogami Stripe</li>
                  <li>Może wymagać dodatkowych dokumentów potwierdzających tożsamość</li>
                  <li>Jest warunkiem koniecznym do rozpoczęcia przyjmowania płatności</li>
                  <li>Może zostać zaktualizowana lub ponownie przeprowadzona na żądanie Stripe</li>
                </ul>
              </div>
              <div>
                <p>3. Użytkownik zobowiązuje się do:</p>
                <ul className="list-disc pl-8 mt-2 space-y-2">
                  <li>Podawania prawdziwych i aktualnych danych</li>
                  <li>Niezwłocznego aktualizowania danych w przypadku ich zmiany</li>
                  <li>Nieudostępniania swojego konta osobom trzecim</li>
                  <li>Zabezpieczenia danych logowania przed dostępem osób nieuprawnionych</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section IV */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-black mb-6">IV. Zasady przekazywania napiwków</h2>
            <div className="space-y-4 text-gray-600">
              <div>
                <p>1. Proces przekazywania napiwków:</p>
                <ul className="list-disc pl-8 mt-2 space-y-2">
                  <li>Klient skanuje kod QR Użytkownika lub korzysta z udostępnionego linku</li>
                  <li>Wybiera kwotę napiwku</li>
                  <li>Dokonuje płatności za pomocą dostępnych metod (karta płatnicza lub BLIK)</li>
                </ul>
              </div>
              <div>
                <p>2. Limity transakcji:</p>
                <ul className="list-disc pl-8 mt-2 space-y-2">
                  <li>Minimalny napiwek: 5 PLN</li>
                  <li>Maksymalny napiwek: 500 PLN</li>
                </ul>
              </div>
              <div>
                <p>3. Prowizje i opłaty:</p>
                <ul className="list-disc pl-8 mt-2 space-y-2">
                  <li>Od każdej transakcji pobierana jest prowizja w wysokości 1 PLN + 4,5%</li>
                  <li>Prowizja zawiera wszystkie opłaty, w tym opłaty Stripe</li>
                  <li>Prowizja jest potrącana automatycznie od kwoty transakcji</li>
                </ul>
              </div>
              <div>
                <p>4. Wypłaty środków:</p>
                <ul className="list-disc pl-8 mt-2 space-y-2">
                  <li>Są realizowane automatycznie</li>
                  <li>Odbywają się codziennie</li>
                  <li>Są przekazywane bezpośrednio na rachunek bankowy Użytkownika podany w systemie Stripe Connect</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section V */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-black mb-6">V. Prawa i obowiązki stron</h2>
            <div className="space-y-4 text-gray-600">
              <div>
                <p>1. Operator zobowiązuje się do:</p>
                <ul className="list-disc pl-8 mt-2 space-y-2">
                  <li>Zapewnienia dostępności Serwisu</li>
                  <li>Zabezpieczenia danych Użytkowników</li>
                  <li>Wsparcia technicznego w zakresie działania Serwisu</li>
                  <li>Informowania o planowanych przerwach technicznych</li>
                </ul>
              </div>
              <div>
                <p>2. Użytkownik zobowiązuje się do:</p>
                <ul className="list-disc pl-8 mt-2 space-y-2">
                  <li>Przestrzegania zasad niniejszego Regulaminu</li>
                  <li>Niepodejmowania działań na szkodę Serwisu i innych Użytkowników</li>
                  <li>Niezwłocznego zgłaszania wszelkich nieprawidłowości w działaniu Serwisu</li>
                  <li>Przestrzegania zasad marketingu i promocji określonych w Regulaminie</li>
                </ul>
              </div>
              <div>
                <p>3. Operator zastrzega sobie prawo do:</p>
                <ul className="list-disc pl-8 mt-2 space-y-2">
                  <li>Czasowego ograniczenia dostępu do Serwisu w celu przeprowadzenia prac technicznych</li>
                  <li>Zawieszenia lub usunięcia konta Użytkownika w przypadku naruszenia Regulaminu</li>
                  <li>Wprowadzania zmian w funkcjonowaniu Serwisu</li>
                  <li>Odmowy świadczenia usług bez podania przyczyny</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section VI */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-black mb-6">VI. Marketing i promocja</h2>
            <div className="space-y-4 text-gray-600">
              <div>
                <p>1. Użytkownik może promować swój profil i kod QR z zachowaniem następujących zasad:</p>
                <ul className="list-disc pl-8 mt-2 space-y-2">
                  <li>Zakaz wprowadzających w błąd informacji o prowizjach i opłatach</li>
                  <li>Zakaz sugerowania oficjalnego powiązania z restauracją bez jej zgody</li>
                  <li>Zakaz agresywnego marketingu i spamu</li>
                  <li>Zakaz wykorzystywania wizerunku innych osób bez ich zgody</li>
                  <li>Zakaz działań naruszających dobre obyczaje</li>
                </ul>
              </div>
              <div>
                <p>2. Operator zastrzega sobie prawo do:</p>
                <ul className="list-disc pl-8 mt-2 space-y-2">
                  <li>Weryfikacji działań marketingowych Użytkowników</li>
                  <li>Żądania zaprzestania niedozwolonych działań promocyjnych</li>
                  <li>Zawieszenia konta w przypadku naruszeń zasad marketingu</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section VII */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-black mb-6">VII. Własność intelektualna</h2>
            <div className="space-y-4 text-gray-600">
              <div>
                <p>1. Wszelkie prawa własności intelektualnej do Serwisu, w tym:</p>
                <ul className="list-disc pl-8 mt-2 space-y-2">
                  <li>Nazwa i logo tippin&apos;</li>
                  <li>Elementy graficzne interfejsu</li>
                  <li>Kod źródłowy</li>
                  <li>Treści i materiały marketingowe</li>
                </ul>
                <p className="mt-2">należą do Operatora lub są wykorzystywane na podstawie odpowiednich licencji.</p>
              </div>
            </div>
          </section>

          {/* Section VIII */}
<section className="mb-12">
  <h2 className="text-2xl font-bold text-black mb-6">VIII. Ochrona danych osobowych</h2>
  <div className="space-y-4 text-gray-600">
    <div>
      <p>1. Administrator danych:</p>
      <ul className="list-disc pl-8 mt-2 space-y-2">
        <li>Administratorem danych osobowych Użytkowników jest Operator</li>
        <li>W zakresie danych przetwarzanych w systemie Stripe Connect administratorem jest Stripe</li>
      </ul>
    </div>
    <div>
      <p>2. Zakres przetwarzanych danych:</p>
      <ul className="list-disc pl-8 mt-2 space-y-2">
        <li>Dane identyfikacyjne (imię, nazwisko, email)</li>
        <li>Dane kontaktowe (numer telefonu, adres)</li>
        <li>Dane do rozliczeń (numer rachunku bankowego)</li>
        <li>Dane o transakcjach (przechowywane w systemie Stripe)</li>
      </ul>
    </div>
    <div>
      <p>3. Cele przetwarzania:</p>
      <ul className="list-disc pl-8 mt-2 space-y-2">
        <li>Świadczenie usług Serwisu</li>
        <li>Weryfikacja Użytkowników</li>
        <li>Rozliczenia finansowe</li>
        <li>Bezpieczeństwo transakcji</li>
        <li>Marketing bezpośredni własnych usług</li>
      </ul>
    </div>
    <div>
      <p>4. Prawa osób, których dane dotyczą:</p>
      <ul className="list-disc pl-8 mt-2 space-y-2">
        <li>Dostęp do danych</li>
        <li>Sprostowanie danych</li>
        <li>Usunięcie danych</li>
        <li>Ograniczenie przetwarzania</li>
        <li>Przenoszenie danych</li>
        <li>Sprzeciw wobec przetwarzania</li>
      </ul>
    </div>
    <div>
      <p>5. Okres przechowywania danych:</p>
      <ul className="list-disc pl-8 mt-2 space-y-2">
        <li>Dane konta: przez okres posiadania konta i do 5 lat po jego usunięciu</li>
        <li>Dane transakcji: zgodnie z polityką Stripe</li>
        <li>Dane rozliczeniowe: zgodnie z wymogami prawa (5 lat)</li>
      </ul>
    </div>
  </div>
</section>

{/* Section IX */}
<section className="mb-12">
  <h2 className="text-2xl font-bold text-black mb-6">IX. Reklamacje i rozwiązywanie sporów</h2>
  <div className="space-y-4 text-gray-600">
    <div>
      <p>1. Zgłaszanie reklamacji:</p>
      <ul className="list-disc pl-8 mt-2 space-y-2">
        <li>Termin: 14 dni od zdarzenia</li>
        <li>Forma: pisemna lub elektroniczna</li>
        <li>Wymagane informacje: opis zdarzenia, dane kontaktowe, oczekiwany sposób rozwiązania</li>
      </ul>
    </div>
    <div>
      <p>2. Rozpatrywanie reklamacji:</p>
      <ul className="list-disc pl-8 mt-2 space-y-2">
        <li>Termin: do 30 dni od zgłoszenia</li>
        <li>Forma odpowiedzi: taka sama jak forma zgłoszenia</li>
        <li>W przypadku spraw skomplikowanych termin może zostać wydłużony</li>
      </ul>
    </div>
    <div>
      <p>3. Spory dotyczące płatności:</p>
      <ul className="list-disc pl-8 mt-2 space-y-2">
        <li>Są rozpatrywane zgodnie z procedurami Stripe</li>
        <li>Operator nie jest stroną transakcji</li>
        <li>Operator może pośredniczyć w komunikacji ze Stripe</li>
      </ul>
    </div>
    <div>
      <p>4. Sąd właściwy:</p>
      <ul className="list-disc pl-8 mt-2 space-y-2">
        <li>Sąd właściwy dla siedziby Operatora</li>
        <li>W przypadku konsumentów - sąd właściwy według przepisów ogólnych</li>
      </ul>
    </div>
  </div>
</section>

{/* Section X */}
<section className="mb-12">
  <h2 className="text-2xl font-bold text-black mb-6">X. Siła wyższa</h2>
  <div className="space-y-4 text-gray-600">
    <p>1. Strony nie ponoszą odpowiedzialności za niewykonanie lub nienależyte wykonanie zobowiązań wynikających z Regulaminu w przypadku, gdy jest to spowodowane działaniem siły wyższej.</p>
    <div>
      <p>2. Za siłę wyższą uznaje się zdarzenia:</p>
      <ul className="list-disc pl-8 mt-2 space-y-2">
        <li>Zewnętrzne</li>
        <li>Niemożliwe do przewidzenia</li>
        <li>Których skutkom nie można zapobiec</li>
        <li>W szczególności: klęski żywiołowe, wojny, strajki, awarie systemów teleinformatycznych niezależne od Operatora</li>
      </ul>
    </div>
    <p>3. Strona powołująca się na siłę wyższą zobowiązana jest poinformować drugą stronę o jej wystąpieniu i ustaniu.</p>
  </div>
</section>

          
          {/* Section XI */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-black mb-6">XI. Zmiany regulaminu</h2>
            <div className="space-y-4 text-gray-600">
              <div>
                <p>1. Operator ma prawo do zmiany Regulaminu w przypadku:</p>
                <ul className="list-disc pl-8 mt-2 space-y-2">
                  <li>Zmian prawnych lub regulacyjnych</li>
                  <li>Wprowadzenia nowych funkcjonalności</li>
                  <li>Modyfikacji systemu płatności</li>
                  <li>Zmian technologicznych</li>
                  <li>Zmian w zakresie świadczonych usług</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section XII */}
          <section>
            <h2 className="text-2xl font-bold text-black mb-6">XII. Postanowienia końcowe</h2>
            <div className="space-y-4 text-gray-600">
              <p>
                1. Regulamin wchodzi w życie z dniem [DATA].
              </p>
              <p>
                2. W sprawach nieuregulowanych stosuje się przepisy prawa polskiego.
              </p>
              <p>
                3. Nieważność pojedynczych postanowień nie wpływa na ważność całego Regulaminu.
              </p>
              <p>
                4. Regulamin jest dostępny w Serwisie oraz może zostać pobrany w formacie PDF.
              </p>
              <div>
                <p>5. Kontakt z Operatorem:</p>
                <ul className="list-disc pl-8 mt-2 space-y-2">
                  <li>Email: [ADRES]</li>
                  <li>Adres: [ADRES SIEDZIBY]</li>
                  <li>Telefon: [NUMER]</li>
                </ul>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-6 md:py-8 bg-white">
        <div className="container mx-auto px-4 text-center text-sm text-gray-600">
          &copy; {new Date().getFullYear()} tippin&apos;. Wszelkie prawa zastrzeżone.
        </div>
      </footer>
    </div>
  );
}