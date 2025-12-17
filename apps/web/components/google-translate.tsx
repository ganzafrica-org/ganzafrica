'use client';

import { useEffect, useRef } from 'react';
import Script from 'next/script';
import { Globe } from 'lucide-react';

declare global {
  interface Window {
    google: any;
    googleTranslateElementInit: () => void;
  }
}

export default function GoogleTranslate() {
  const initialized = useRef(false);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Define the callback function immediately
    window.googleTranslateElementInit = () => {
      if (!initialized.current && window.google?.translate?.TranslateElement && elementRef.current) {
        try {
          new window.google.translate.TranslateElement(
            {
              pageLanguage: 'en',
              includedLanguages: 'en,es,fr,de,pt,ar,zh-CN,hi,ru,ja',
              layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
              autoDisplay: false,
            },
            'google_translate_element'
          );
          initialized.current = true;
          console.log('Google Translate initialized successfully');

          // Add event listeners to close dropdown after language selection and toggle functionality
          setTimeout(() => {
            const comboBox = document.querySelector('.goog-te-combo') as HTMLSelectElement;
            const menuValue = document.querySelector('.goog-te-menu-value') as HTMLElement;
            
            if (comboBox && menuValue) {
              // Toggle dropdown when clicking the button again
              menuValue.addEventListener('click', (e) => {
                setTimeout(() => {
                  const menuFrame = document.querySelector('.goog-te-menu-frame') as HTMLElement;
                  if (menuFrame) {
                    // Check if dropdown is already open
                    const isOpen = menuFrame.style.display !== 'none' && 
                                   menuFrame.offsetParent !== null &&
                                   window.getComputedStyle(menuFrame).display !== 'none';
                    
                    if (isOpen) {
                      // If open, close it
                      menuFrame.style.display = 'none';
                      e.stopPropagation();
                    }
                  }
                }, 50);
              });

              // Close dropdown when language is selected
              comboBox.addEventListener('change', () => {
                setTimeout(() => {
                  const menuFrame = document.querySelector('.goog-te-menu-frame') as HTMLElement;
                  if (menuFrame) {
                    menuFrame.style.display = 'none';
                  }
                  comboBox.blur();
                }, 200);
              });

              // Close dropdown when clicking on language items
              const closeDropdown = () => {
                setTimeout(() => {
                  const menuFrame = document.querySelector('.goog-te-menu-frame') as HTMLElement;
                  if (menuFrame) {
                    menuFrame.style.display = 'none';
                  }
                }, 100);
              };

              // Listen for clicks on language items
              document.addEventListener('click', (e) => {
                const target = e.target as HTMLElement;
                if (target.closest('.goog-te-menu-frame') && (target.closest('a') || target.closest('td'))) {
                  closeDropdown();
                }
              });

              // Close dropdown when clicking outside
              document.addEventListener('click', (e) => {
                const target = e.target as HTMLElement;
                const menuFrame = document.querySelector('.goog-te-menu-frame') as HTMLElement;
                const translateElement = document.querySelector('#google_translate_element') as HTMLElement;
                
                if (menuFrame && menuFrame.style.display !== 'none') {
                  if (!target.closest('.goog-te-menu-frame') && !target.closest('#google_translate_element')) {
                    menuFrame.style.display = 'none';
                  }
                }
              });
            }
          }, 1000);
        } catch (error) {
          console.error('Error initializing Google Translate:', error);
        }
      }
    };

    // If script already loaded, initialize immediately
    if (window.google?.translate?.TranslateElement && elementRef.current && !initialized.current) {
      window.googleTranslateElementInit();
    }

    return () => {
      // Cleanup on unmount
      initialized.current = false;
    };
  }, []);

  return (
    <>
      <Script
        src="https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
        strategy="afterInteractive"
        onLoad={() => {
          console.log('Google Translate script loaded');
          // Try to initialize if script loaded but callback wasn't called
          if (window.google?.translate?.TranslateElement && elementRef.current && !initialized.current) {
            window.googleTranslateElementInit();
          }
        }}
        onError={(e) => {
          console.error('Failed to load Google Translate script:', e);
        }}
      />
      
      <div className="flex items-center space-x-2 border border-gray-200 rounded-lg px-2 bg-white relative z-[100] h-10">
        <Globe className="w-4 h-4 text-gray-500 flex-shrink-0" />
        <div 
          id="google_translate_element" 
          ref={elementRef}
          className="google-translate-container"
        ></div>
      </div>

      <style jsx global>{`
        /* Essential for Single Page Apps: prevents the 'white bar' push down */
        body { 
          top: 0 !important; 
          position: static !important; 
        }
        .skiptranslate { 
          display: inline-block !important; 
        }
        .goog-te-banner-frame { 
          display: none !important; 
        }
        
        /* Ensure dropdown appears above everything */
        .goog-te-menu-frame {
          z-index: 99999 !important;
          position: fixed !important;
        }
        
        /* Cleanup the Google UI to look modern */
        .goog-te-gadget { 
          font-size: 0 !important; 
          color: transparent !important; 
        }
        .goog-te-gadget-simple {
          background-color: transparent !important;
          border: none !important;
          cursor: pointer !important;
          display: flex !important;
          align-items: center !important;
          padding: 0 !important;
        }
        .goog-te-menu-value {
          cursor: pointer !important;
        }
        /* Hide the "Sélectionner une langue" text */
        .goog-te-menu-value span:first-child {
          display: none !important;
        }
        .goog-te-menu-value span {
          color: #374151 !important;
          font-size: 14px !important;
          text-decoration: none !important;
        }
        .goog-te-menu-value img, 
        .goog-te-menu-value span:nth-child(3), 
        .goog-te-gadget-icon {
          display: none !important;
        }
        .goog-te-combo {
          margin: 0 !important;
          padding: 0 !important;
          border: none !important;
          background: transparent !important;
          color: transparent !important;
          font-size: 0 !important;
          cursor: pointer !important;
          width: 20px !important;
          height: 20px !important;
          opacity: 0 !important;
          position: absolute !important;
        }
        /* Hide the "Sélectionner une langue" text in the button */
        .goog-te-gadget-simple .goog-te-menu-value span:first-child {
          display: none !important;
        }
        /* Make the menu value clickable but hide text - keep it visible for clicking */
        .goog-te-gadget-simple .goog-te-menu-value {
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          min-width: 20px !important;
          min-height: 20px !important;
        }
        /* Hide all text spans in menu value */
        .goog-te-gadget-simple .goog-te-menu-value span {
          display: none !important;
        }
        /* Hide the dropdown header text */
        .goog-te-menu-frame .goog-te-menu-value span:first-child {
          display: none !important;
        }
        /* Hide the header section of the dropdown */
        .goog-te-menu-frame > div:first-child > div:first-child {
          display: none !important;
        }
      `}</style>
    </>
  );
}