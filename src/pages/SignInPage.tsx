import { SignIn } from "@clerk/clerk-react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const SignInPage = () => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 relative">
      <Link to="/" className="absolute top-6 left-6 flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm font-medium">Back</span>
      </Link>
      <SignIn
        routing="path"
        path="/sign-in"
        signUpUrl="/sign-up"
        afterSignInUrl="/"
        appearance={{
          elements: {
            rootBox: "mx-auto",
            card: "bg-card border border-border shadow-xl rounded-2xl",
            headerTitle: "text-foreground font-heading",
            headerSubtitle: "text-muted-foreground",
            socialButtonsBlockButton: "border-border bg-muted/50 text-foreground hover:bg-muted",
            formFieldLabel: "text-foreground",
            formFieldInput: "bg-muted/50 border-border text-foreground placeholder:text-muted-foreground",
            footerActionLink: "text-primary hover:text-primary/80",
            formButtonPrimary: "bg-primary text-primary-foreground hover:bg-primary/90",
            footer: "hidden",
            footerAction: "hidden",
            footerPages: "hidden",
            footerPagesLink: "hidden",
          },
        }}
      />
    </div>
  );
};

export default SignInPage;
