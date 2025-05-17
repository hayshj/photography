import React from 'react';
import { Instagram, Twitter, Mail } from 'lucide-react';

function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col md:flex-row justify-between items-center gap-6 text-sm text-gray-500">
        <p className="text-center md:text-left">
          © {new Date().getFullYear()}{' '}
          <span className="font-semibold text-gray-800">Hayden Hays Photography</span>. All rights reserved.
        </p>
        <div className="flex gap-6 text-gray-500">
          <a
            href="https://instagram.com/hays.hayden"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-blue-600 transition-colors duration-200"
            aria-label="Instagram"
          >
            <Instagram size={20} />
          </a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
