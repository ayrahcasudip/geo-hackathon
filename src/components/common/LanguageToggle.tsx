import React from 'react';
import { Globe } from 'lucide-react';

interface LanguageToggleProps {
  currentLanguage: string;
  onLanguageChange: (language: string) => void;
  availableLanguages: { code: string; name: string }[];
}

const LanguageToggle: React.FC<LanguageToggleProps> = ({
  currentLanguage,
  onLanguageChange,
  availableLanguages
}) => {
  const [isOpen, setIsOpen] = React.useState(false);

  const toggleDropdown = () => setIsOpen(!isOpen);
  
  const handleLanguageSelect = (languageCode: string) => {
    onLanguageChange(languageCode);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
        onClick={toggleDropdown}
      >
        <Globe className="h-4 w-4" />
        <span className="text-sm font-medium">
          {availableLanguages.find(lang => lang.code === currentLanguage)?.name || currentLanguage}
        </span>
      </button>
      
      {isOpen && (
        <div className="absolute right-0 mt-1 w-40 bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200 z-10">
          <ul className="py-1">
            {availableLanguages.map(language => (
              <li key={language.code}>
                <button
                  className={`w-full text-left px-4 py-2 text-sm ${
                    language.code === currentLanguage
                      ? 'bg-blue-50 text-blue-700 font-medium'
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => handleLanguageSelect(language.code)}
                >
                  {language.name}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default LanguageToggle;