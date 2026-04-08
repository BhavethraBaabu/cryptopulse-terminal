import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 bg-dark-700">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-white mb-2">Welcome back</h1>
        <p className="text-gray-400">Sign in to access your portfolio, watchlist &amp; paper trading</p>
      </div>
      <SignIn
        appearance={{
          elements: {
            rootBox: 'w-full max-w-md',
            card: 'bg-dark-500 border border-white/10 shadow-2xl rounded-2xl',
            headerTitle: 'text-white',
            headerSubtitle: 'text-gray-400',
            socialButtonsBlockButton: 'bg-dark-400 border border-white/10 text-white hover:bg-dark-400/80',
            socialButtonsBlockButtonText: 'text-white font-medium',
            dividerLine: 'bg-white/10',
            dividerText: 'text-gray-500',
            formFieldLabel: 'text-gray-300',
            formFieldInput: 'bg-dark-400 border-white/10 text-white placeholder:text-gray-500 focus:border-[#adef37]/50',
            formButtonPrimary: 'bg-[#adef37] text-black font-semibold hover:bg-[#adef37]/90',
            footerActionLink: 'text-[#adef37] hover:text-[#adef37]/80',
            identityPreviewText: 'text-white',
            identityPreviewEditButton: 'text-[#adef37]',
            formFieldInputShowPasswordButton: 'text-gray-400',
            alertText: 'text-red-400',
            formResendCodeLink: 'text-[#adef37]',
          },
        }}
      />
    </main>
  );
}
