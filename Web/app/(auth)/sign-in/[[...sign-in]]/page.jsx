// import { SignIn } from "@clerk/nextjs";

// export default function page() {
//     return <SignIn />
// }
import { SignIn } from "@clerk/nextjs";

export default function FullScreenGlassmorphismAuth() {
  return (
    <section className="relative flex min-h-screen w-full items-center justify-center bg-[url('https://images.unsplash.com/photo-1692606674482-effe67e384d9?q=80&w=3560&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')] bg-cover bg-center px-4 py-6">
      {/* Dark Overlay for Better Readability */}
      <div className="absolute inset-0 bg-black/50"></div>

      {/* Centered Authentication Box */}
      <div className="relative z-10 flex w-full max-w-xs sm:max-w-sm md:max-w-md flex-col items-center justify-center rounded-2xl border border-white/30 bg-white/20 px-6 py-8 shadow-lg backdrop-blur-xl sm:px-8 sm:py-10">
        <h1 className="text-xl font-semibold text-white sm:text-2xl md:text-3xl">
          Welcome to <span className="text-amber-400">Neural Docs</span>
        </h1>
        <p className="mt-2 text-center text-sm text-white/80 sm:text-base">
          AI-powered document search at your fingertips.
        </p>

        {/* Clerk Sign-In Box - Fully Responsive & Centered */}
        <div className="mt-6 flex w-full justify-center">
          <SignIn
            appearance={{
              layout: {
                container: "w-full flex justify-center items-center",
              },
              elements: {
                card: "w-full max-w-[100%] sm:max-w-[90%] md:max-w-[100%] lg:max-w-[100%] p-6 sm:p-6 md:p-10 shadow-lg",
              },
            }}
          />
        </div>
      </div>
    </section>
  );
}


