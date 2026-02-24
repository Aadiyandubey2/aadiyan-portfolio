import { SignIn } from "@clerk/clerk-react";

const SignInPage = () => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
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
            formFieldInput: "bg-background border-border text-foreground",
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

export default SignInPage;
