"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { tokenManager } from "@/lib/auth";
import { FolderOpen, Users, Target, Building, ArrowRight, CheckCircle } from "lucide-react";

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = () => {
      const authenticated = tokenManager.isAuthenticated();
      setIsAuthenticated(authenticated);
      setIsLoading(false);
      
      // If user is already authenticated, redirect to dashboard
      if (authenticated) {
        router.push("/dashboard");
      }
    };

    checkAuth();
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // Don't render anything if user is authenticated (they'll be redirected)
  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Building className="h-4 w-4 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-bold text-foreground">ProjectHub</h1>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/auth/login">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/auth/register">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-12 lg:py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl lg:text-6xl font-bold tracking-tight text-foreground">
                Manage Projects
                <span className="text-primary block">Effortlessly</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-lg">
                Streamline your project management with powerful collaboration tools, 
                intuitive workflows, and real-time team coordination.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/auth/register">
                <Button size="lg" className="w-full sm:w-auto text-lg px-8 py-6">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/auth/login">
                <Button variant="outline" size="lg" className="w-full sm:w-auto text-lg px-8 py-6">
                  Sign In
                </Button>
              </Link>
            </div>

            <div className="space-y-3 pt-4">
              <div className="flex items-center space-x-3 text-muted-foreground">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span>Free 30-day trial</span>
              </div>
              <div className="flex items-center space-x-3 text-muted-foreground">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center space-x-3 text-muted-foreground">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span>Cancel anytime</span>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="grid grid-cols-1 gap-6">
              <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-blue-500">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <FolderOpen className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Project Organization</CardTitle>
                      <CardDescription>
                        Keep your projects organized and accessible
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>

              <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-green-500">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <Users className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Team Collaboration</CardTitle>
                      <CardDescription>
                        Work together seamlessly with your team
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>

              <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-purple-500">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Target className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Goal Tracking</CardTitle>
                      <CardDescription>
                        Track progress and achieve your objectives
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            </div>
          </div>
        </div>
      </main>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16 border-t bg-muted/30">
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-3xl font-bold text-foreground">
            Everything you need to succeed
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            ProjectHub provides all the tools your team needs to collaborate effectively 
            and deliver projects on time.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto">
              <FolderOpen className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-foreground">Project Management</h3>
            <p className="text-muted-foreground">
              Create, organize, and manage projects with intuitive tools and workflows.
            </p>
          </div>

          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto">
              <Users className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-foreground">Team Collaboration</h3>
            <p className="text-muted-foreground">
              Invite team members, assign roles, and collaborate in real-time.
            </p>
          </div>

          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto">
              <Target className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-foreground">Progress Tracking</h3>
            <p className="text-muted-foreground">
              Monitor project progress with detailed analytics and reporting.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16">
        <Card className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground border-0">
          <CardContent className="text-center py-12">
            <h2 className="text-3xl font-bold mb-4">
              Ready to transform your project management?
            </h2>
            <p className="text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
              Join thousands of teams who trust ProjectHub to deliver their projects 
              successfully. Start your free trial today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/register">
                <Button size="lg" variant="secondary" className="w-full sm:w-auto text-lg px-8 py-6">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/auth/login">
                <Button size="lg" variant="outline" className="w-full sm:w-auto text-lg px-8 py-6 border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10">
                  Sign In
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 border-t">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-primary rounded-lg flex items-center justify-center">
              <Building className="h-3 w-3 text-primary-foreground" />
            </div>
            <span className="text-sm text-muted-foreground">
              © 2024 ProjectHub. All rights reserved.
            </span>
          </div>
          <div className="flex items-center space-x-6 text-sm text-muted-foreground">
            <Link href="/privacy" className="hover:text-foreground transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-foreground transition-colors">
              Terms of Service
            </Link>
            <Link href="/support" className="hover:text-foreground transition-colors">
              Support
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
