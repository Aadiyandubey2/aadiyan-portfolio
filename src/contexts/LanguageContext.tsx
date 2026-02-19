import { createContext, useContext, useState, useCallback, ReactNode } from "react";

type Language = "en" | "hi";

interface LanguageContextType {
  language: Language;
  toggleLanguage: () => void;
  t: (key: string) => string;
}

// All translations
const translations: Record<string, Record<Language, string>> = {
  // Navbar
  "nav.home": { en: "Home", hi: "होम" },
  "nav.about": { en: "About", hi: "परिचय" },
  "nav.skills": { en: "Skills", hi: "कौशल" },
  "nav.projects": { en: "Projects", hi: "प्रोजेक्ट्स" },
  "nav.certificates": { en: "Certificates", hi: "प्रमाणपत्र" },
  "nav.showcase": { en: "Showcase", hi: "प्रदर्शनी" },
  "nav.contact": { en: "Contact", hi: "संपर्क" },
  "nav.lets_talk": { en: "Let's Talk", hi: "बात करें" },
  "nav.switch_light": { en: "Switch to Light", hi: "लाइट मोड" },
  "nav.switch_dark": { en: "Switch to Dark", hi: "डार्क मोड" },

  // Hero
  "hero.hello": { en: "<Hello World />", hi: "<नमस्ते दुनिया />" },
  "hero.view_work": { en: "View My Work", hi: "मेरा काम देखें" },
  "hero.download_resume": { en: "Download Resume", hi: "रिज़्यूमे डाउनलोड" },
  "hero.lets_connect": { en: "Let's Connect", hi: "जुड़ें" },
  "hero.scroll": { en: "Scroll", hi: "नीचे" },

  // About
  "about.whoami": { en: "whoami", hi: "मैं कौन" },
  "about.title": { en: "About", hi: "मेरे" },
  "about.title_highlight": { en: "Me", hi: "बारे में" },
  "about.journey": { en: "Journey", hi: "सफ़र" },
  "about.current": { en: "Current", hi: "वर्तमान" },

  // Skills
  "skills.tag": { en: "</> Tech Stack", hi: "</> टेक स्टैक" },
  "skills.title": { en: "Skills", hi: "कौशल" },
  "skills.title_highlight": { en: "& Technologies", hi: "और तकनीक" },
  "skills.manual": { en: "Manual", hi: "मैनुअल" },
  "skills.from_projects": { en: "From Projects", hi: "प्रोजेक्ट्स से" },
  "skills.visualization": { en: "Skills Visualization", hi: "कौशल विज़ुअलाइज़ेशन" },
  "skills.currently_building": { en: "Currently building with", hi: "अभी बना रहा हूँ" },

  // Projects
  "projects.tag": { en: "Portfolio", hi: "पोर्टफोलियो" },
  "projects.title": { en: "My", hi: "मेरा" },
  "projects.title_highlight": { en: "Work", hi: "काम" },
  "projects.subtitle": { en: "Hover over the folders to explore my projects", hi: "प्रोजेक्ट्स देखने के लिए फोल्डर पर होवर करें" },
  "projects.quick_access": { en: "Quick access", hi: "क्विक एक्सेस" },

  // Certificates
  "certificates.title_primary": { en: "Certificates & ", hi: "प्रमाणपत्र और " },
  "certificates.title_secondary": { en: "Credentials", hi: "उपलब्धियाँ" },
  "certificates.subtitle": { en: "Professional certifications and achievements that validate my expertise", hi: "मेरी विशेषज्ञता को प्रमाणित करने वाली उपलब्धियाँ" },
  "certificates.hover": { en: "Hover to explore • Click to view details", hi: "देखने के लिए होवर करें • विवरण के लिए क्लिक करें" },
  "certificates.tap": { en: "Tap to spread • Swipe to navigate", hi: "फैलाने के लिए टैप करें • नेविगेट करने के लिए स्वाइप करें" },
  "certificates.quick_access": { en: "Quick Access", hi: "क्विक एक्सेस" },

  // Showcase
  "showcase.title": { en: "Creative", hi: "रचनात्मक" },
  "showcase.title_highlight": { en: "Showcase", hi: "प्रदर्शनी" },
  "showcase.subtitle": { en: "Watch demonstrations of my projects and creative work in action", hi: "मेरे प्रोजेक्ट्स और रचनात्मक कार्यों के प्रदर्शन देखें" },

  // Contact
  "contact.tag": { en: "Get in Touch", hi: "संपर्क करें" },
  "contact.title": { en: "Let's", hi: "आइए" },
  "contact.title_highlight": { en: "Connect", hi: "जुड़ें" },
  "contact.subtitle": { en: "Have a project in mind or just want to chat? Feel free to reach out!", hi: "कोई प्रोजेक्ट है या बस बात करनी है? बेझिझक संपर्क करें!" },
  "contact.name": { en: "Your Name", hi: "आपका नाम" },
  "contact.email": { en: "Your Email", hi: "आपका ईमेल" },
  "contact.subject": { en: "Subject", hi: "विषय" },
  "contact.message": { en: "Your Message", hi: "आपका संदेश" },
  "contact.send": { en: "Send Message", hi: "संदेश भेजें" },
  "contact.sending": { en: "Sending...", hi: "भेज रहे हैं..." },
  "contact.build_title": { en: "Let's Build Something", hi: "कुछ बनाएँ" },
  "contact.build_highlight": { en: "Amazing", hi: "अद्भुत" },
  "contact.build_desc": { en: "I'm always excited to work on innovative projects and collaborate with passionate people. Whether you have a project idea, job opportunity, or just want to say hi, I'd love to hear from you!", hi: "मैं हमेशा नए प्रोजेक्ट्स पर काम करने और लोगों के साथ मिलकर काम करने के लिए उत्साहित रहता हूँ। चाहे कोई प्रोजेक्ट हो, नौकरी का मौका हो, या बस नमस्ते कहना हो!" },
  "contact.connect_with": { en: "Connect with me", hi: "मुझसे जुड़ें" },
  "contact.email_label": { en: "Email", hi: "ईमेल" },
  "contact.phone_label": { en: "Phone", hi: "फ़ोन" },
  "contact.location_label": { en: "Location", hi: "स्थान" },

  // Footer
  "footer.tagline": { en: "Designed, Developed & Powered by", hi: "डिज़ाइन, डेवलप और संचालित" },
  "footer.built_with": { en: "Built with React, Three.js & Framer Motion", hi: "React, Three.js और Framer Motion से बनाया गया" },
  "footer.rights": { en: "All rights reserved.", hi: "सर्वाधिकार सुरक्षित।" },

  // Gallery
  "gallery.title": { en: "Explore My Portfolio", hi: "मेरा पोर्टफोलियो देखें" },
  "gallery.subtitle": { en: "Navigate through different sections", hi: "अलग-अलग सेक्शन देखें" },

  // Clementine
  "clementine.title": { en: "Meet", hi: "मिलिए" },
  "clementine.subtitle_en": { en: "AI assistant with text and voice support", hi: "AI assistant जो text और voice दोनों support करती है" },
};

const LanguageContext = createContext<LanguageContextType | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>("en");

  const toggleLanguage = useCallback(() => {
    setLanguage(prev => prev === "en" ? "hi" : "en");
  }, []);

  const t = useCallback((key: string): string => {
    return translations[key]?.[language] ?? key;
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}
