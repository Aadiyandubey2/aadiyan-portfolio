import { SignUp } from "@clerk/clerk-react";

const SignUpPage = () => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <SignUp
        routing="path"
        path="/sign-up"
        signInUrl="/sign-in"
        afterSignUpUrl="/"
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
          },
        }}
      />
    </div>
  );
};

export default SignUpPage;
