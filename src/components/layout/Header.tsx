import React from 'react';
import { Shield, Bell, Menu, X } from 'lucide-react';
import { useLocation, Link } from 'react-router-dom';
import ConnectionStatusIndicator from '../common/ConnectionStatusIndicator';
import LanguageToggle from '../common/LanguageToggle';
import { ConnectionStatus } from '../../types';

interface HeaderProps {
  connectionStatus: ConnectionStatus;
  notifications?: number;
  onLanguageChange: (language: string) => void;
  currentLanguage: string;
}

const Header: React.FC<HeaderProps> = ({
  connectionStatus,
  notifications = 0,
  onLanguageChange,
  currentLanguage
}) => {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  
  const availableLanguages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Spanish' }
  ];
  
  const navLinks = [
    { path: '/', label: 'Map' },
    { path: '/hazards', label: 'Hazards' },
    { path: '/shelters', label: 'Shelters' },
    { path: '/admin', label: 'Admin' }
  ];
  
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo and Title */}
          <Link to="/" className="flex items-center gap-2">
            <Shield className="h-7 w-7 text-blue-600" />
            <h1 className="text-xl font-bold">SafeRoute</h1>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map(link => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-sm font-medium transition-colors ${
                  location.pathname === link.path 
                    ? 'text-blue-600' 
                    : 'text-gray-600 hover:text-blue-500'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          
          {/* Right side tools */}
          <div className="flex items-center gap-4">
            <ConnectionStatusIndicator status={connectionStatus} />
            
            <LanguageToggle 
              currentLanguage={currentLanguage}
              onLanguageChange={onLanguageChange}
              availableLanguages={availableLanguages}
            />
            
            <div className="relative">
              <button className="p-1.5 rounded-full hover:bg-gray-100">
                <Bell className="h-5 w-5" />
                {notifications > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full text-xs w-4 h-4 flex items-center justify-center">
                    {notifications > 9 ? '9+' : notifications}
                  </span>
                )}
              </button>
            </div>
            
            {/* Mobile Menu Button */}
            <button 
              className="p-1.5 rounded-full hover:bg-gray-100 md:hidden"
              onClick={toggleMenu}
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
        
        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="mt-4 py-2 border-t border-gray-100 md:hidden">
            <ul className="space-y-2">
              {navLinks.map(link => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className={`block py-2 px-4 rounded-lg ${
                      location.pathname === link.path 
                        ? 'bg-blue-50 text-blue-600' 
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;