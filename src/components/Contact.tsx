import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import Background3D from "./Background3D";
import { useSiteContent } from "@/hooks/useSiteContent";

/* ===============================
   CLEAN CONTACT ICONS (NO ARTIFACTS)
================================ */
const ContactIcon = ({ type }: { type: "email" | "phone" | "location" }) => {
  const icons = {
    email: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-5 h-5 sm:w-6 sm:h-6"
      >
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="M3 7l9 6 9-6" />
      </svg>
    ),

    phone: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-5 h-5 sm:w-6 sm:h-6"
      >
        <path d="M22 16.9v3a2 2 0 0 1-2.18 2A19.8 19.8 0 0 1 3.1 5.18 2 2 0 0 1 5.1 3h3a2 2 0 0 1 2 1.72l.5 3a2 2 0 0 1-.55 1.73l-1.4 1.4a16 16 0 0 0 6.7 6.7l1.4-1.4a2 2 0 0 1 1.73-.55l3 .5A2 2 0 0 1 22 16.9z" />
      </svg>
    ),

    location: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-5 h-5 sm:w-6 sm:h-6"
      >
        <path d="M12 21s7-7 7-12a7 7 0 1 0-14 0c0 5 7 12 7 12z" />
        <circle cx="12" cy="9" r="2.5" />
      </svg>
    ),
  };

  return icons[type];
};

/* ===============================
   CONTACT COMPONENT
================================ */
const Contact = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const { content } = useSiteContent();

  const profile = content?.profile;
  const email = profile?.email || "aadiyandubey@gmail.com";
  const phone = profile?.phone || "+91 7477257790";
  const location = profile?.location || "NIT Nagaland, India";

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { error } = await supabase.functions.invoke("contact-submit", {
        body: formData,
      });

      if (error) throw error;

      toast.success("Message sent successfully!");
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch (err: any) {
      toast.error(err.message || "Failed to send message");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="relative py-20 md:py-28 overflow-hidden">
      <Background3D variant="section" color="#10b981" />
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background/90 to-background" />

      <div ref={ref} className="relative max-w-7xl mx-auto px-4 sm:px-6">
        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-2 rounded-full glass-card text-sm font-mono text-primary border border-primary/30 mb-4">
            Get in Touch
          </span>
          <h2 className="text-4xl md:text-5xl font-heading font-bold mb-4">
            Let’s <span className="neon-text">Connect</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Have a project or idea? Drop a message — I’ll reply soon.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-14">
          {/* FORM */}
          <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity: 0, x: -40 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            {["name", "email", "subject"].map((field) => (
              <div key={field} className="relative">
                <label
                  className={`absolute left-4 transition-all text-sm ${
                    focusedField === field || formData[field as keyof typeof formData]
                      ? "-top-2 text-xs bg-background px-2 text-primary"
                      : "top-4 text-muted-foreground"
                  }`}
                >
                  {field.charAt(0).toUpperCase() + field.slice(1)}
                </label>
                <input
                  name={field}
                  value={formData[field as keyof typeof formData]}
                  onChange={handleChange}
                  onFocus={() => setFocusedField(field)}
                  onBlur={() => setFocusedField(null)}
                  required
                  className="w-full px-4 py-4 rounded-xl bg-muted/50 border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                />
              </div>
            ))}

            <div className="relative">
              <label
                className={`absolute left-4 transition-all text-sm ${
                  focusedField === "message" || formData.message
                    ? "-top-2 text-xs bg-background px-2 text-primary"
                    : "top-4 text-muted-foreground"
                }`}
              >
                Message
              </label>
              <textarea
                name="message"
                rows={4}
                value={formData.message}
                onChange={handleChange}
                onFocus={() => setFocusedField("message")}
                onBlur={() => setFocusedField(null)}
                required
                className="w-full px-4 py-4 rounded-xl bg-muted/50 border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none resize-none"
              />
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              disabled={isSubmitting}
              className="w-full py-4 rounded-xl font-semibold bg-gradient-to-r from-primary to-secondary text-primary-foreground"
            >
              {isSubmitting ? "Sending…" : "Send Message"}
            </motion.button>
          </motion.form>

          {/* INFO */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.4 }}
            className="glass-card p-8 rounded-3xl flex flex-col justify-center"
          >
            <h3 className="text-2xl font-bold mb-6">
              Let’s Build Something <span className="neon-text">Amazing</span>
            </h3>

            <div className="space-y-5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <ContactIcon type="email" />
                </div>
                <a href={`mailto:${email}`} className="font-medium">
                  {email}
                </a>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center">
                  <ContactIcon type="phone" />
                </div>
                <a href={`tel:${phone.replace(/\s/g, "")}`} className="font-medium">
                  {phone}
                </a>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-accent/10 text-accent flex items-center justify-center">
                  <ContactIcon type="location" />
                </div>
                <span className="font-medium">{location}</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
