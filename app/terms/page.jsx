import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export const metadata = {
  title: "Terms of Service | BuyTheLook",
  description: "Terms of Service for BuyTheLook - Your AI Fashion Curator",
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-6 py-32 max-w-4xl">
        <h1 className="text-4xl md:text-5xl font-serif mb-8">Terms of Service</h1>
        <p className="text-sm text-muted-foreground mb-12">Last updated: January 2025</p>

        <div className="prose prose-neutral max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-serif mb-4">1. Acceptance of Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              By accessing or using BuyTheLook, you agree to be bound by these Terms of Service. If you do not agree to
              these terms, please do not use our services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-serif mb-4">2. Description of Service</h2>
            <p className="text-muted-foreground leading-relaxed">
              BuyTheLook provides AI-powered personal styling recommendations. We curate outfit suggestions based on
              your preferences, body type, and occasion. We provide links to purchase items from third-party retailers.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-serif mb-4">3. Credits and Payments</h2>
            <p className="text-muted-foreground leading-relaxed">
              Our service uses a credit-based system. Credits can be purchased and used to unlock outfit recommendations
              and shopping links. Credits are non-refundable and have no cash value. Prices are subject to change with
              notice.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-serif mb-4">4. Third-Party Purchases</h2>
            <p className="text-muted-foreground leading-relaxed">
              When you click shopping links, you will be redirected to third-party retailer websites. BuyTheLook is not
              responsible for the products, pricing, availability, or fulfillment from these retailers. All purchases
              are subject to the retailer's terms and policies.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-serif mb-4">5. User Accounts</h2>
            <p className="text-muted-foreground leading-relaxed">
              You are responsible for maintaining the confidentiality of your account credentials and for all activities
              that occur under your account. You must provide accurate information when creating an account.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-serif mb-4">6. Intellectual Property</h2>
            <p className="text-muted-foreground leading-relaxed">
              All content on BuyTheLook, including text, graphics, logos, and AI-generated recommendations, is owned by
              or licensed to us. You may not reproduce, distribute, or create derivative works without our permission.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-serif mb-4">7. Limitation of Liability</h2>
            <p className="text-muted-foreground leading-relaxed">
              BuyTheLook provides styling recommendations for informational purposes. We are not liable for any
              decisions you make based on our recommendations or for any issues with third-party products or services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-serif mb-4">8. Changes to Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              We reserve the right to modify these terms at any time. Continued use of the service after changes
              constitutes acceptance of the new terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-serif mb-4">9. Contact</h2>
            <p className="text-muted-foreground leading-relaxed">
              For questions about these Terms of Service, contact us at{" "}
              <a href="mailto:legal@buythelook.com" className="underline hover:no-underline">
                legal@buythelook.com
              </a>
            </p>
          </section>
        </div>
      </main>
    </div>
  )
}
