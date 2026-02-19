import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import Background3D from "./Background3D";
import { useSiteContent } from "@/hooks/useSiteContent";

// 3D styled contact icons
const ContactIcon = ({
  type,
  color
}: {
  type: string;
  color: string;
}) => {
  const icons: Record<string, JSX.Element> = {
    email: <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
        <path d="M3 6h18v12H3z" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M3 7l9 6 9-6" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>,
    phone: <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
        <path d="M22 16.92v3
         a2 2 0 0 1-2.18 2
         A19.86 19.86 0 0 1 3.1 5.18
         2 2 0 0 1 5.1 3h3
         a2 2 0 0 1 2 1.72
         l.5 3
         a2 2 0 0 1-1.09 2.11
         l-1.5.75
         a16 16 0 0 0 6 6
         l.75-1.5
         a2 2 0 0 1 2.11-1.09
         l3 .5
         a2 2 0 0 1 1.72 2z" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>,
    location: <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
        <path d="M12 21
         s-7-6.16-7-11
         a7 7 0 1 1 14 0
         c0 4.84-7 11-7 11z" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="12" cy="10" r="3" stroke={color} strokeWidth="1.8" />
      </svg>
  };
  return <div className="w-5 h-5 sm:w-6 sm:h-6" style={{
    color
  }}>
      {icons[type]}
    </div>;
};
const Contact = () => {
  const {
    content
  } = useSiteContent();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const profile = content?.profile;
  const email = profile?.email || "aadiyandubey@gmail.com";
  const phone = profile?.phone || "+91 7477257790";
  const location = profile?.location || "NIT Nagaland, India";
  const socialLinks = [{
    name: "LinkedIn",
    url: "https://www.linkedin.com/in/aadiyan-dubey-234ab5274",
    color: "#0077b5",
    icon: <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
        </svg>
  }, {
    name: "Email",
    url: `mailto:${email}`,
    color: "#ea4335",
    icon: <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
  }, {
    name: "Phone",
    url: `tel:${phone.replace(/\s/g, "")}`,
    color: "#25d366",
    icon: <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
        </svg>
  }, {
    name: "VishwaGuru",
    url: "https://vishwaguru.site",
    color: "#8b5cf6",
    icon: <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
        </svg>
  }];
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await supabase.functions.invoke("contact-submit", {
        body: {
          name: formData.name,
          email: formData.email,
          subject: formData.subject,
          message: formData.message
        }
      });
      if (response.error) {
        throw new Error(response.error.message || "Failed to send message");
      }
      toast.success("Message sent successfully! I'll get back to you soon.");
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: ""
      });
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error(error instanceof Error ? error.message : "Failed to send message. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };
  return <section id="contact" className="relative py-16 sm:py-24 md:py-32 overflow-hidden" aria-labelledby="contact-heading">
      {/* 3D Background */}
      <Background3D variant="section" color="#10b981" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <header className="text-center mb-10 sm:mb-16">
          <span className="inline-block px-3 sm:px-4 py-1.5 sm:py-2 rounded-full glass-card text-xs sm:text-sm font-mono text-primary border border-primary/30 mb-3 sm:mb-4">
            Get in Touch
          </span>
          <h1 id="contact-heading" className="text-3xl sm:text-4xl mb-3 sm:mb-4 font-serif font-thin md:text-6xl">
            Let's <span className="text-blue-700">Connect</span>
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto font-body text-sm sm:text-base">
            Have a project in mind or just want to chat? Feel free to reach out!
          </p>
        </header>

        <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-20">
          {/* Contact Form */}
          <div>
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
                <div className="relative">
                  <label htmlFor="name" className={`absolute left-4 transition-all duration-300 pointer-events-none text-sm ${focusedField === "name" || formData.name ? "-top-2 text-xs text-primary bg-background px-2" : "top-3.5 sm:top-4 text-muted-foreground"}`}>
                    Your Name
                  </label>
                  <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} onFocus={() => setFocusedField("name")} onBlur={() => setFocusedField(null)} required maxLength={100} className="w-full px-4 py-3.5 sm:py-4 rounded-xl bg-muted/50 border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-300 font-body text-sm sm:text-base" />
                </div>
                <div className="relative">
                  <label htmlFor="email" className={`absolute left-4 transition-all duration-300 pointer-events-none text-sm ${focusedField === "email" || formData.email ? "-top-2 text-xs text-primary bg-background px-2" : "top-3.5 sm:top-4 text-muted-foreground"}`}>
                    Your Email
                  </label>
                  <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} onFocus={() => setFocusedField("email")} onBlur={() => setFocusedField(null)} required maxLength={255} className="w-full px-4 py-3.5 sm:py-4 rounded-xl bg-muted/50 border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-300 font-body text-sm sm:text-base" />
                </div>
              </div>
              <div className="relative">
                <label htmlFor="subject" className={`absolute left-4 transition-all duration-300 pointer-events-none text-sm ${focusedField === "subject" || formData.subject ? "-top-2 text-xs text-primary bg-background px-2" : "top-3.5 sm:top-4 text-muted-foreground"}`}>
                  Subject
                </label>
                <input type="text" id="subject" name="subject" value={formData.subject} onChange={handleChange} onFocus={() => setFocusedField("subject")} onBlur={() => setFocusedField(null)} required maxLength={200} className="w-full px-4 py-3.5 sm:py-4 rounded-xl bg-muted/50 border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-300 font-body text-sm sm:text-base" />
              </div>
              <div className="relative">
                <label htmlFor="message" className={`absolute left-4 transition-all duration-300 pointer-events-none text-sm ${focusedField === "message" || formData.message ? "-top-2 text-xs text-primary bg-background px-2" : "top-3.5 sm:top-4 text-muted-foreground"}`}>
                  Your Message
                </label>
                <textarea id="message" name="message" value={formData.message} onChange={handleChange} onFocus={() => setFocusedField("message")} onBlur={() => setFocusedField(null)} required maxLength={2000} rows={4} className="w-full px-4 py-3.5 sm:py-4 rounded-xl bg-muted/50 border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-300 font-body resize-none text-sm sm:text-base" />
              </div>
              <button type="submit" disabled={isSubmitting} className="w-full py-3.5 sm:py-4 rounded-xl font-heading font-semibold text-primary-foreground hover:from-primary/90 hover:to-secondary/90 hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm sm:text-base bg-white hover:scale-[1.02] active:scale-[0.98]">
                {isSubmitting ? <>
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Sending...
                  </> : <>
                    Send Message
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </>}
              </button>
            </form>
          </div>

          {/* Contact Info */}
          <div className="flex flex-col justify-center">
            <div className="glass-card p-6 sm:p-8 rounded-3xl">
              <h3 className="text-xl sm:text-2xl font-heading font-bold mb-4 sm:mb-6">
                Let's Build Something <span className=" text-blue-700 font-serif text-6xl font-thin">Amazing</span>
              </h3>
              <p className="text-muted-foreground font-body mb-6 sm:mb-8 leading-relaxed text-sm sm:text-base">
                I'm always excited to work on innovative projects and collaborate with passionate people. Whether you
                have a project idea, job opportunity, or just want to say hi, I'd love to hear from you!
              </p>

              <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <ContactIcon type="email" color="#00d4ff" />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-muted-foreground">Email</p>
                    <a href={`mailto:${email}`} className="font-body font-medium hover:text-primary transition-colors text-sm sm:text-base">
                      {email}
                    </a>
                  </div>
                </div>
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-secondary/10 flex items-center justify-center">
                    <ContactIcon type="phone" color="#8b5cf6" />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-muted-foreground">Phone</p>
                    <a href={`tel:${phone.replace(/\s/g, "")}`} className="font-body font-medium hover:text-primary transition-colors text-sm sm:text-base">
                      {phone}
                    </a>
                  </div>
                </div>
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                    <ContactIcon type="location" color="#3b82f6" />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-muted-foreground">Location</p>
                    <p className="font-body font-medium text-sm sm:text-base">{location}</p>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">Connect with me</p>
                <div className="flex gap-3 sm:gap-4">
                  {socialLinks.map((social) => <a key={social.name} href={social.url} target="_blank" rel="noopener noreferrer" className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center text-muted-foreground hover:text-primary hover:scale-110 hover:-translate-y-0.5 transition-all duration-200" aria-label={social.name}>
                      {social.icon}
                    </a>)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>;
};
export default Contact;