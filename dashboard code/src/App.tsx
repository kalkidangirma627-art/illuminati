import { useState, useEffect } from 'react';
import { Search, Users, LayoutGrid, Menu, Lock, Globe, ChevronDown, Asterisk, Moon, Sun, DollarSign, FileCheck, Fingerprint, Banknote, Building2, CreditCard } from 'lucide-react';

interface CardItem {
  id: string;
  title: string;
  category: string;
  isPublic: boolean;
  cardText: string;
  progress: number;
  icon: any;
}

const INITIAL_CARDS: CardItem[] = [
  { id: 'card-1', title: 'Group Logo', category: 'iframe', isPublic: false, cardText: 'Document Processing', progress: 85, icon: FileCheck },
  { id: 'card-2', title: 'Group Logo', category: 'iframe', isPublic: true, cardText: 'Biometrics Legitimacy', progress: 40, icon: Fingerprint },
  { id: 'card-3', title: 'Group Logo', category: 'iframe', isPublic: false, cardText: 'First Income Received', progress: 100, icon: Banknote },
  { id: 'card-4', title: 'Group Logo', category: 'iframe', isPublic: false, cardText: 'Document Transaction to HQ', progress: 15, icon: Building2 },
  { id: 'card-5', title: 'Group Logo', category: 'iframe', isPublic: true, cardText: 'Payment', progress: 60, icon: CreditCard },
];

export default function App() {
  const [cards, setCards] = useState<CardItem[]>(INITIAL_CARDS);
  const [searchTerm, setSearchTerm] = useState('');
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const togglePublicStatus = (id: string) => {
    setCards(cards.map(card => 
      card.id === id ? { ...card, isPublic: !card.isPublic } : card
    ));
  };

  const filteredCards = cards.filter(card => 
    card.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    card.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    card.cardText.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#F7F6F2] dark:bg-[#121212] font-sans pb-20 transition-colors duration-300">
      {/* Navigation */}
      <nav className="flex flex-col md:flex-row md:justify-between items-center py-4 md:py-6 px-4 md:px-8 max-w-[1400px] mx-auto gap-4 md:gap-0">
        <div className="flex items-center gap-1 text-xl md:text-2xl font-semibold tracking-tight text-gray-900 dark:text-white w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center gap-1">
            <Asterisk className="w-6 h-6 md:w-7 md:h-7" strokeWidth={2.5} />
            Sinqlo
          </div>
          <div className="md:hidden flex items-center">
            {/* Dark mode toggle on mobile up top */}
            <button 
              onClick={() => setDarkMode(!darkMode)}
              className="p-1.5 rounded-full border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center justify-center gap-3 md:gap-6 w-full md:w-auto">
          <div className="flex items-center gap-1.5 md:gap-2 bg-gradient-to-r from-[#AEEFB5]/60 to-[#9BE3A3]/60 dark:from-[#376b3a]/40 dark:to-[#4a8a4d]/40 text-green-900 dark:text-[#AEEFB5] px-3.5 md:px-4 py-1.5 md:py-2 rounded-full font-semibold shadow-sm border border-[#AEEFB5]/50 dark:border-[#5db465]/40 text-sm md:text-base">
            <DollarSign className="w-3.5 h-3.5 md:w-4 md:h-4" />
            <span>24,500.00</span>
          </div>

          {/* Dark mode toggle on desktop */}
          <button 
            onClick={() => setDarkMode(!darkMode)}
            className="hidden md:flex p-2 rounded-full border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            aria-label="Toggle dark mode"
          >
            {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          <button className="px-4 py-1.5 md:px-5 md:py-2 rounded-full border border-gray-300 dark:border-gray-700 text-xs md:text-sm font-medium text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            Add Logo
          </button>

          <div className="flex items-center gap-2 md:gap-3 pl-2 border-l border-gray-300 dark:border-gray-700">
            <span className="text-xs md:text-sm font-medium text-gray-800 dark:text-gray-200 hidden sm:inline">Username</span>
            <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-[#FF7E33] shadow-sm cursor-pointer"></div>
          </div>
        </div>
      </nav>

      <main className="max-w-[1200px] mx-auto px-4 md:px-6 mt-6 md:mt-8">
        {/* Hero Section */}
        <div className="text-center space-y-3 md:space-y-4">
          <h1 className="text-3xl md:text-[44px] font-semibold text-gray-900 dark:text-white tracking-tight">
            Welcome to your Dashboard
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm md:text-lg max-w-lg mx-auto leading-relaxed">
            Collaborate, upload, and deliver, every logo, every version, always up to date.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative max-w-[640px] mx-auto mt-6 md:mt-10">
          <input
            type="text"
            placeholder="Search for a logo or client"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-5 md:pl-6 pr-12 md:pr-14 py-3 md:py-4 rounded-full bg-white dark:bg-[#1A1C1E] shadow-sm border border-gray-100 dark:border-gray-800 text-base md:text-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#AEEFB5] focus:border-transparent transition-all outline-none placeholder:text-gray-400 dark:placeholder:text-gray-500"
          />
          <button className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 md:w-11 md:h-11 bg-[#AEEFB5] hover:bg-[#9BE3A3] text-green-900 rounded-full flex items-center justify-center transition-colors">
            <Search className="w-4 h-4 md:w-5 md:h-5" />
          </button>
        </div>

        {/* Banner */}
        <div className="mt-8 md:mt-14 bg-white/60 dark:bg-[#1A1C1E]/60 backdrop-blur-sm border border-gray-200/60 dark:border-gray-800/60 rounded-3xl md:rounded-full px-5 md:px-6 py-4 flex flex-col md:flex-row items-start md:items-center justify-between shadow-sm gap-4 md:gap-0">
          <div className="flex items-center gap-3 md:gap-4 w-full">
            <div className="hidden sm:flex -space-x-2">
              <Users className="w-5 h-5 md:w-6 md:h-6 text-[#FF7E33]" />
              <Users className="w-5 h-5 md:w-6 md:h-6 text-[#FF7E33] opacity-50" />
            </div>
            <p className="text-sm md:text-[15px] text-gray-800 dark:text-gray-200 leading-snug">
              <span className="font-semibold block sm:inline">Team mode on.</span>{" "}
              <span className="text-gray-600 dark:text-gray-400">Same updates. Total sync. *Available for Studio & Agency.</span>
            </p>
          </div>
          <button className="w-full md:w-auto px-4 md:px-5 py-2 border border-gray-300 dark:border-gray-700 rounded-full text-xs md:text-sm font-medium text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800 bg-white dark:bg-[transparent] transition-colors whitespace-nowrap">
            View Plans
          </button>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col-reverse sm:flex-row items-start sm:items-center justify-between mt-8 md:mt-12 mb-6 gap-4 sm:gap-0">
          <button className="flex items-center gap-2 bg-white dark:bg-[#1A1C1E] border border-gray-200 dark:border-gray-800 rounded-lg px-3 py-1.5 md:px-4 md:py-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors shadow-sm w-full sm:w-auto justify-center">
            <span className="text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300">Recent</span>
            <ChevronDown className="w-3.5 h-3.5 md:w-4 md:h-4 text-gray-500 dark:text-gray-400" />
          </button>

          <div className="flex items-center justify-between w-full sm:w-auto gap-4 md:gap-6">
            <span className="text-xs md:text-sm text-gray-500 dark:text-gray-400 font-medium">
              1-{filteredCards.length} of {cards.length} Logos
            </span>
            <div className="flex items-center bg-white dark:bg-[#1A1C1E] border border-gray-200 dark:border-gray-800 rounded-lg p-1 shadow-sm">
              <button className="p-1 md:p-1.5 rounded-md bg-gray-100/80 dark:bg-gray-800 text-gray-700 dark:text-gray-300 shadow-sm">
                <LayoutGrid className="w-4 h-4 md:w-5 md:h-5" />
              </button>
              <button className="p-1 md:p-1.5 rounded-md text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <Menu className="w-4 h-4 md:w-5 md:h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Card Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
          {filteredCards.map((card) => {
            const IconComponent = card.icon;
            return (
            <div key={card.id} className="bg-white dark:bg-[#1A1C1E] rounded-2xl md:rounded-[24px] overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-gray-100 dark:border-gray-800 flex flex-col group hover:shadow-[0_4px_20px_rgba(0,0,0,0.06)] dark:hover:shadow-[0_4px_20px_rgba(0,0,0,0.3)] transition-all">
              {/* Asset Preview Area */}
              <div className="h-[140px] sm:h-[180px] md:h-[220px] bg-[#FAFAFA] dark:bg-[#111213] flex items-center justify-center p-4 md:p-8 group-hover:bg-[#F3F4F6] dark:group-hover:bg-[#16181A] transition-colors">
                <div className="flex flex-col items-center gap-2 md:gap-3 text-center opacity-80">
                  <IconComponent className="w-6 h-6 md:w-10 md:h-10 text-gray-900 dark:text-white" strokeWidth={1.5} />
                  <span className="text-sm md:text-xl font-medium tracking-tight text-gray-900 dark:text-white px-1 md:px-4 leading-snug">
                    {card.cardText}
                  </span>
                </div>
              </div>
              
              {/* Card Meta Area */}
              <div className="p-3 md:p-5 flex flex-col gap-3 md:gap-4">
                <div className="flex flex-col gap-1.5 md:gap-3">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white text-[13px] md:text-md truncate">{card.title}</h3>
                    <p className="text-gray-400 dark:text-gray-500 text-[11px] md:text-sm mt-0.5">{card.category}</p>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-1.5 md:h-2 mt-1 md:mt-0">
                    <div 
                      className="bg-[#AEEFB5] dark:bg-[#5db465] h-1.5 md:h-2 rounded-full transition-all duration-1000 ease-out" 
                      style={{ width: `${card.progress}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-end text-[10px] md:text-xs font-medium text-gray-500 dark:text-gray-400 -mt-1 md:-mt-1.5">
                    {card.progress}%
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-1 pt-3 md:pt-4 border-t border-gray-50 dark:border-gray-800/80 gap-2 sm:gap-0">
                  <div className="flex items-center self-start sm:self-auto gap-1.5 px-2 py-1 md:px-3 md:py-1.5 border border-gray-200 dark:border-gray-700 rounded-full text-[10px] md:text-xs font-medium text-gray-600 dark:text-gray-300 bg-white dark:bg-[#1A1C1E] shadow-sm">
                    {card.isPublic ? (
                      <>
                        <Globe className="w-3 h-3 md:w-3.5 md:h-3.5" />
                        <span className="hidden sm:inline">Public</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-3 h-3 md:w-3.5 md:h-3.5" />
                        <span className="hidden sm:inline">Private</span>
                      </>
                    )}
                  </div>
                  
                  {/* Custom Toggle Switch */}
                  <button 
                    onClick={() => togglePublicStatus(card.id)}
                    className={`self-end sm:self-auto relative inline-flex h-4 w-7 md:h-6 md:w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#AEEFB5] focus:ring-offset-2 dark:focus:ring-offset-[#1A1C1E] ${card.isPublic ? 'bg-[#AEEFB5] dark:bg-[#5db465]' : 'bg-gray-300 dark:bg-gray-700'}`}
                  >
                    <span 
                      className={`inline-block h-3 w-3 md:h-5 md:w-5 transform rounded-full bg-white transition-transform shadow-sm ${card.isPublic ? 'translate-x-3.5 md:translate-x-5' : 'translate-x-0.5 md:translate-x-1'}`} 
                    />
                  </button>
                </div>
              </div>
            </div>
            );
          })}
          
          {filteredCards.length === 0 && (
            <div className="col-span-full py-12 md:py-16 text-center text-sm md:text-base text-gray-500 dark:text-gray-400">
              No content found matching "{searchTerm}"
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

