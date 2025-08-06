import AmexNavbar from "@/components/layout/AmexNavbar";
import TriggerDashboard from "@/components/trigger/TriggerDashboard";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-subtle">
      <AmexNavbar />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            TRG Trigger Management
          </h1>
          <p className="text-lg text-muted-foreground">
            Manage refresh triggers with secure API integration
          </p>
        </div>
        <TriggerDashboard />
      </main>
    </div>
  );
};

export default Index;
