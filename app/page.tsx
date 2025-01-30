import { HomePageContent } from "@/components/home-page-content";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-start pt-24">
      <div className="container max-w-7xl mx-auto px-4">
        <HomePageContent />
      </div>
    </main>
  );
}
