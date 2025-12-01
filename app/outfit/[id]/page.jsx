import { OutfitDetails } from "@/components/outfit-details"

export default async function OutfitDetailPage({ params }) {
  const { id } = await params

  return (
    <main className="min-h-screen bg-background pt-20 pb-16">
      <div className="container mx-auto px-4">
        <OutfitDetails id={id} />
      </div>
    </main>
  )
}
