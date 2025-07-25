import { CreateProjectDialog } from "@/components/create-project-dialog";
import { ProjectCard } from "@/components/project-card";
import { siteConfig } from "@/config/site";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";
import { BarChart3, Globe, Users } from "lucide-react";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      projects: {
        include: {
          _count: {
            select: { pageViews: true },
          },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!user) {
    redirect("/");
  }

  const totalPageViews = user.projects.reduce(
    (sum, project) => sum + project._count.pageViews,
    0
  );

  return (
    <div className="min-h-screen bg-muted/10">
      <div className="p-4 sm:p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2 tracking-wide">
              {siteConfig.name}
            </h1>
            <p className="text-muted-foreground">
              Welcome back, {user.name || user.email}
            </p>
          </div>
          <CreateProjectDialog />
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="flex flex-col rounded border px-3 py-2 bg-muted/20 hover:bg-muted/40 transition-all duration-200">
            <div className="flex flex-row items-center justify-between space-y-0 pb-2">
              <h2 className="text-sm font-medium text-muted-foreground">
                Total Projects
              </h2>
              <Globe className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="text-2xl font-bold text-foreground">
              {user.projects.length}
            </div>
          </div>
          <div className="flex flex-col rounded border px-3 py-2 bg-muted/20 hover:bg-muted/40 transition-all duration-200">
            <div className="flex flex-row items-center justify-between space-y-0 pb-2">
              <h2 className="text-sm font-medium text-muted-foreground">
                Total Page Views
              </h2>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="text-2xl font-bold text-foreground">
              {totalPageViews.toLocaleString()}
            </div>
          </div>

          <div className="flex flex-col rounded border px-3 py-2 bg-muted/20 hover:bg-muted/40 transition-all duration-200">
            <div className="flex flex-row items-center justify-between space-y-0 pb-2">
              <h2 className="text-sm font-medium text-muted-foreground">
                Active Projects
              </h2>
              <Users className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="text-2xl font-bold text-foreground">
              {user.projects.filter((p) => p._count.pageViews > 0).length}
            </div>
          </div>
        </div>

        {/* Projects Section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Your Projects</h2>
          {user.projects.length === 0 ? (
            <div className="border border-dashed bg-muted/20">
              <div className="flex flex-col items-center justify-center py-12">
                <Globe className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">
                  No projects yet
                </h3>
                <p className="text-muted-foreground text-center mb-4">
                  Create your first project to start tracking analytics
                </p>
                <CreateProjectDialog />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {user.projects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  pageViews={project._count.pageViews}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
