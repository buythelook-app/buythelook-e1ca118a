import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export const metadata = {
  title: "Privacy Policy | BuyTheLook",
  description: "Privacy Policy for BuyTheLook - Your AI Fashion Curator",
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-6 py-32 max-w-4xl">
        <h1 className="text-4xl md:text-5xl font-serif mb-8">Privacy Policy</h1>
        <p className="text-sm text-muted-foreground mb-12">Last updated: January 2025</p>

        <div className="prose prose-neutral max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-serif mb-4">1. Information We Collect</h2>
            <p className="text-muted-foreground leading-relaxed">
              We collect information you provide directly to us, including your name, email address, style preferences,
              body measurements (if provided), and payment information when you make purchases. We also collect photos
              you upload for style analysis.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-serif mb-4">2. How We Use Your Information</h2>
            <p className="text-muted-foreground leading-relaxed">
              We use the information we collect to provide personalized outfit recommendations, process transactions,
              send you updates about your orders, and improve our AI styling algorithms. Your style preferences help us
              curate better looks for you over time.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-serif mb-4">3. Information Sharing</h2>
            <p className="text-muted-foreground leading-relaxed">
              We do not sell your personal information. We may share your information with third-party service providers
              who assist us in operating our platform, processing payments, or analyzing data. These providers are bound
              by confidentiality obligations.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-serif mb-4">4. Data Security</h2>
            <p className="text-muted-foreground leading-relaxed">
              We implement appropriate security measures to protect your personal information against unauthorized
              access, alteration, disclosure, or destruction. All payment transactions are processed through secure,
              encrypted connections.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-serif mb-4">5. Your Rights</h2>
            <p className="text-muted-foreground leading-relaxed">
              You have the right to access, update, or delete your personal information at any time through your account
              settings. You may also contact us to request a copy of your data or to exercise any other privacy rights.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-serif mb-4">6. Cookies</h2>
            <p className="text-muted-foreground leading-relaxed">
              We use cookies and similar technologies to enhance your experience, analyze site traffic, and personalize
              content. You can control cookie preferences through your browser settings.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-serif mb-4">7. Contact Us</h2>
            <p className="text-muted-foreground leading-relaxed">
              If you have any questions about this Privacy Policy, please contact us at{" "}
              <a href="mailto:privacy@buythelook.com" className="underline hover:no-underline">
                privacy@buythelook.com
              </a>
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  )
}
