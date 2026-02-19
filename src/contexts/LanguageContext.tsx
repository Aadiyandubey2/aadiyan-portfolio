import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";

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
  "nav.admin": { en: "Admin", hi: "एडमिन" },

  // Breadcrumb
  "breadcrumb.home": { en: "Home", hi: "होम" },

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
  "about.loading": { en: "Loading...", hi: "लोड हो रहा है..." },

  // About - Default timeline items
  "about.timeline.web_dev_intern": { en: "Web Developer Intern", hi: "वेब डेवलपर इंटर्न" },
  "about.timeline.web_dev_desc": { en: "Part-time Web Developer - UI/UX design, frontend development, and performance optimization.", hi: "पार्ट-टाइम वेब डेवलपर - UI/UX डिज़ाइन, फ्रंटएंड डेवलपमेंट, और परफ़ॉर्मेंस ऑप्टिमाइज़ेशन।" },
  "about.timeline.club_secretary": { en: "Literary & Arts Club Asst. Secretary", hi: "साहित्य एवं कला क्लब सहायक सचिव" },
  "about.timeline.club_desc": { en: "Coordinating cultural, literary, and artistic events. Event planning and promotions.", hi: "सांस्कृतिक, साहित्यिक और कला कार्यक्रमों का समन्वय। इवेंट प्लानिंग और प्रचार।" },
  "about.timeline.btech": { en: "B.Tech CSE (CGPA: 8.06)", hi: "बी.टेक CSE (CGPA: 8.06)" },
  "about.timeline.btech_desc": { en: "JEE Mains AIR 41,149. Last Semester CGPA: 8.34.", hi: "JEE Mains AIR 41,149। पिछले सेमेस्टर CGPA: 8.34।" },
  "about.timeline.higher_secondary": { en: "Higher Secondary (12th)", hi: "उच्चतर माध्यमिक (12वीं)" },
  "about.timeline.higher_secondary_desc": { en: "Strong foundation in Mathematics and Computer Science.", hi: "गणित और कंप्यूटर साइंस में मज़बूत नींव।" },
  "about.timeline.codesa": { en: "CodeSA", hi: "CodeSA" },
  "about.timeline.nit_nagaland": { en: "NIT Nagaland", hi: "NIT नागालैंड" },
  "about.timeline.model_school": { en: "Model High School, Jabalpur", hi: "मॉडल हाई स्कूल, जबलपुर" },

  // About - Default stats
  "about.stat.jee_air": { en: "JEE AIR", hi: "JEE रैंक" },
  "about.stat.cgpa": { en: "CGPA", hi: "CGPA" },
  "about.stat.last_sem": { en: "Last Sem", hi: "पिछला सेम" },
  "about.stat.projects": { en: "Projects", hi: "प्रोजेक्ट्स" },

  // About - Bio
  "about.default_bio": { en: "Creator of VishwaGuru.site — a numerology predictions platform in English & Hindi.", hi: "VishwaGuru.site के निर्माता — अंग्रेज़ी और हिंदी में अंकज्योतिष भविष्यवाणी प्लेटफ़ॉर्म।" },

  // Skills
  "skills.tag": { en: "</> Tech Stack", hi: "</> टेक स्टैक" },
  "skills.title": { en: "Skills", hi: "कौशल" },
  "skills.title_highlight": { en: "& Technologies", hi: "और तकनीक" },
  "skills.manual": { en: "Manual", hi: "मैनुअल" },
  "skills.from_projects": { en: "From Projects", hi: "प्रोजेक्ट्स से" },
  "skills.visualization": { en: "Skills Visualization", hi: "कौशल विज़ुअलाइज़ेशन" },
  "skills.currently_building": { en: "Currently building with", hi: "अभी बना रहा हूँ" },
  "skills.loading_viz": { en: "Loading visualization...", hi: "विज़ुअलाइज़ेशन लोड हो रहा है..." },

  // Projects
  "projects.tag": { en: "Portfolio", hi: "पोर्टफोलियो" },
  "projects.title": { en: "My", hi: "मेरा" },
  "projects.title_highlight": { en: "Work", hi: "काम" },
  "projects.subtitle": { en: "Hover over the folders to explore my projects", hi: "प्रोजेक्ट्स देखने के लिए फोल्डर पर होवर करें" },
  "projects.quick_access": { en: "Quick access", hi: "क्विक एक्सेस" },
  "projects.featured": { en: "Featured", hi: "विशेष" },
  "projects.all_projects": { en: "All Projects", hi: "सभी प्रोजेक्ट्स" },

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
  "showcase.no_video": { en: "No video uploaded", hi: "कोई वीडियो नहीं" },

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
  "contact.success": { en: "Message sent successfully! I'll get back to you soon.", hi: "संदेश सफलतापूर्वक भेजा गया! जल्द ही उत्तर दूँगा।" },
  "contact.error": { en: "Failed to send message. Please try again.", hi: "संदेश भेजने में विफल। कृपया पुनः प्रयास करें।" },

  // Footer
  "footer.tagline": { en: "Designed, Developed & Powered by", hi: "डिज़ाइन, डेवलप और संचालित" },
  "footer.built_with": { en: "Built with React, Three.js & Framer Motion", hi: "React, Three.js और Framer Motion से बनाया गया" },
  "footer.rights": { en: "All rights reserved.", hi: "सर्वाधिकार सुरक्षित।" },

  // Gallery
  "gallery.title": { en: "Explore My Portfolio", hi: "मेरा पोर्टफोलियो देखें" },
  "gallery.subtitle": { en: "Navigate through different sections", hi: "अलग-अलग सेक्शन देखें" },

  // Gallery - fallback items
  "gallery.about_me": { en: "About Me", hi: "मेरे बारे में" },
  "gallery.about_subtitle": { en: "My journey & background", hi: "मेरा सफ़र और पृष्ठभूमि" },
  "gallery.skills_subtitle": { en: "Tech stack & expertise", hi: "टेक स्टैक और विशेषज्ञता" },
  "gallery.projects_subtitle": { en: "Featured applications", hi: "मुख्य एप्लिकेशन" },
  "gallery.certificates_subtitle": { en: "Achievements & awards", hi: "उपलब्धियाँ और पुरस्कार" },
  "gallery.showcase_subtitle": { en: "Visual portfolio", hi: "विज़ुअल पोर्टफोलियो" },
  "gallery.contact_subtitle": { en: "Get in touch", hi: "संपर्क करें" },

  // Clementine
  "clementine.title": { en: "Meet", hi: "मिलिए" },
  "clementine.subtitle_en": { en: "AI assistant with text and voice support", hi: "AI assistant जो text और voice दोनों support करती है" },

  // Clementine Chat Header
  "chat.ai_assistant": { en: "AI Assistant", hi: "AI सहायक" },
  "chat.clear": { en: "Clear chat", hi: "चैट साफ़ करें" },
  "chat.export": { en: "Export", hi: "एक्सपोर्ट" },
  "chat.no_messages": { en: "No messages", hi: "कोई संदेश नहीं" },
  "chat.language": { en: "Language", hi: "भाषा" },
  "chat.voice_on": { en: "Voice on", hi: "आवाज़ चालू" },
  "chat.voice_off": { en: "Voice off", hi: "आवाज़ बंद" },
  "chat.cleared": { en: "Chat cleared", hi: "चैट साफ़ हो गई" },
  "chat.exported": { en: "Chat exported", hi: "चैट एक्सपोर्ट हो गई" },
  "chat.voice_enabled": { en: "Voice replies enabled", hi: "वॉइस रिप्लाई चालू" },
  "chat.voice_disabled": { en: "Voice replies disabled", hi: "वॉइस रिप्लाई बंद" },
  "chat.error_response": { en: "Oops! I encountered an error. Please try again!", hi: "उफ़! कोई त्रुटि हुई। कृपया पुनः प्रयास करें!" },

  // Clementine Empty State
  "chat.greeting": { en: "Hi! I'm Clementine", hi: "नमस्ते! मैं Clementine हूं" },
  "chat.greeting_desc": { en: "Aadiyan's AI assistant. Ask me anything!", hi: "Aadiyan की AI assistant। कुछ भी पूछो!" },
  "chat.suggestions": { en: "Suggestions", hi: "सुझाव" },
};

const LanguageContext = createContext<LanguageContextType | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>("en");

  const toggleLanguage = useCallback(() => {
    setLanguage(prev => prev === "en" ? "hi" : "en");
  }, []);

  // Update document lang attribute and heading font when language changes
  useEffect(() => {
    document.documentElement.lang = language === "hi" ? "hi" : "en";
    document.documentElement.classList.toggle("lang-hi", language === "hi");
  }, [language]);

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
