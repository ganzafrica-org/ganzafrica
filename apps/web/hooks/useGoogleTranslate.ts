import { useEffect } from 'react';

/**
 * Hook to initialize Google Translate widget scoped to footer
 * Loads the Google Translate API and initializes the translation widget for footer content only
 */
export function useGoogleTranslate(pageLanguage?: string) {
  useEffect(() => {
    const lang = pageLanguage || 'en';

    // Load the Google Translate script
    const loadGoogleTranslate = () => {
      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      script.async = true;
      document.head.appendChild(script);
    };

    // Initialize the Google Translate element scoped to footer
    (window as any).googleTranslateElementInit = function () {
      try {
        new (window as any).google.translate.TranslateElement(
          { pageLanguage: lang, includedLanguages: 'en,fr', layout: (window as any).google.translate.TranslateElement.InlineLayout.SIMPLE },
          'footer-translate-widget'
        );
        // Hide the native combo box to use our own language switcher
        setTimeout(() => {
          const comboBox = document.querySelector('.goog-te-combo') as HTMLElement | null;
          if (comboBox) comboBox.style.display = 'none';
        }, 300);
      } catch (error) {
        console.error('Error initializing Google Translate:', error);
      }
    };

    // Only load if Google Translate is not already loaded
    if (!(window as any).google?.translate?.TranslateElement) {
      loadGoogleTranslate();
    } else {
      // Re-initialize if already loaded
      (window as any).googleTranslateElementInit();
    }

    return () => {
      // Cleanup if needed in future
    };
  }, [pageLanguage]);
}

export default useGoogleTranslate;
