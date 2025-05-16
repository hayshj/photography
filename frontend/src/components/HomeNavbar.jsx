import React, { useState, useEffect, useRef } from 'react';
import { Menu, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { HashLink } from 'react-router-hash-link';

function HomeNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const menuRef = useRef(null);

  const scrollWithOffset = (el) => {
    const yOffset = -60;
    const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
    window.scrollTo({ top: y, behavior: 'smooth' });
  };

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : 'auto';
  }, [menuOpen]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };

    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuOpen]);

  const toggleMenu = () => setMenuOpen((prev) => !prev);

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 h-[60px] flex items-center justify-between px-8 transition-colors duration-300 ${
          scrolled ? 'bg-white text-black shadow-md' : 'bg-transparent text-white'
        }`}
      >
        <h1 className="text-xl font-semibold">
          <span className="hidden md:inline">Hayden Hays Photography</span>
          <span className="inline md:hidden">HH Photography</span>
        </h1>

        {/* Desktop nav */}
        <div className="hidden md:flex gap-8">
          <Link to="/" onClick={() => window.scrollTo(0, 0)} className="hover:underline">
            Home
          </Link>
          <HashLink to="#portfolio" scroll={scrollWithOffset} className="hover:underline">
            Portfolio
          </HashLink>
          <Link to="/gallery" onClick={() => window.scrollTo(0, 0)} className="hover:underline">
            Galleries
          </Link>
          <Link to="/contact" onClick={() => window.scrollTo(0, 0)} className="hover:underline">
            Contact
          </Link>
        </div>

        {/* Mobile toggle button */}
        <button
          onClick={toggleMenu}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          className="md:hidden"
        >
          {menuOpen ? <X size={28} className="text-black" /> : <Menu size={28} />}
        </button>
      </nav>

      {/* Mobile slide-out menu */}
      <div
        ref={menuRef}
        className={`fixed top-0 right-0 h-full max-w-1/3 min-w-[250px] bg-white text-black z-40 transition-transform duration-300 ease-in-out ${
          menuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col items-start p-6 gap-6 h-[80px] pt-[80px]">
          <button
            onClick={() => {
              window.scrollTo(0, 0);
              toggleMenu();
              navigate('/');
            }}
            className="hover:text-gray-700 capitalize text-left"
          >
            Home
          </button>
          <HashLink
            to="/#portfolio"
            scroll={scrollWithOffset}
            onClick={toggleMenu}
            className="hover:text-gray-700 capitalize"
          >
            Portfolio
          </HashLink>
          <button
            onClick={() => {
              window.scrollTo(0, 0);
              toggleMenu();
              navigate('/gallery');
            }}
            className="hover:text-gray-700 capitalize text-left"
          >
            Galleries
          </button>
          <button
            onClick={() => {
              window.scrollTo(0, 0);
              toggleMenu();
              navigate('/contact');
            }}
            className="hover:text-gray-700 capitalize text-left"
          >
            Contact
          </button>
        </div>
      </div>
    </>
  );
}

export default HomeNavbar;
