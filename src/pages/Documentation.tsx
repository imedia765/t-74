import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

const Documentation = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Sidebar */}
          <aside className="md:col-span-3">
            <ScrollArea className="h-[calc(100vh-8rem)] pr-4 sticky top-24">
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium">Getting Started</h4>
                  <div className="mt-2 space-y-2">
                    <a href="#introduction" className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                      Introduction
                    </a>
                    <a href="#installation" className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                      Installation
                    </a>
                    <a href="#quickstart" className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                      Quick Start
                    </a>
                  </div>
                </div>
                <Separator />
                <div>
                  <h4 className="text-sm font-medium">Core Concepts</h4>
                  <div className="mt-2 space-y-2">
                    <a href="#architecture" className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                      Architecture
                    </a>
                    <a href="#components" className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                      Components
                    </a>
                    <a href="#styling" className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                      Styling
                    </a>
                  </div>
                </div>
              </div>
            </ScrollArea>
          </aside>

          {/* Main Content */}
          <main className="md:col-span-9">
            <div className="prose prose-gray dark:prose-invert max-w-none">
              <h1 className="text-4xl font-bold mb-8">Documentation</h1>
              
              <section id="introduction" className="mb-16">
                <h2 className="text-3xl font-semibold mb-4">Introduction</h2>
                <p className="text-muted-foreground mb-4">
                  Welcome to our comprehensive documentation. This guide will help you understand
                  our platform and get started with development quickly and efficiently.
                </p>
                <p className="text-muted-foreground">
                  Our platform provides a modern, scalable solution for building web applications
                  with React, TypeScript, and other cutting-edge technologies.
                </p>
              </section>

              <section id="installation" className="mb-16">
                <h2 className="text-3xl font-semibold mb-4">Installation</h2>
                <p className="text-muted-foreground mb-4">
                  Getting started is easy. Just follow these simple steps to install and set up your development environment.
                </p>
                <div className="bg-muted p-4 rounded-lg">
                  <code className="text-sm">npm install @your-package/core</code>
                </div>
              </section>

              <section id="quickstart" className="mb-16">
                <h2 className="text-3xl font-semibold mb-4">Quick Start</h2>
                <p className="text-muted-foreground mb-4">
                  Let's create your first application. Follow this quick start guide to get up and running in minutes.
                </p>
                <div className="space-y-4">
                  <div className="bg-muted p-4 rounded-lg">
                    <code className="text-sm">
                      import &#123; Component &#125; from '@your-package/core';<br />
                      <br />
                      function App() &#123;<br />
                      &nbsp;&nbsp;return &lt;Component /&gt;;<br />
                      &#125;
                    </code>
                  </div>
                </div>
              </section>

              <section id="architecture" className="mb-16">
                <h2 className="text-3xl font-semibold mb-4">Architecture</h2>
                <p className="text-muted-foreground">
                  Our architecture is designed to be modular and scalable. We follow industry best practices
                  and patterns to ensure your application remains maintainable as it grows.
                </p>
              </section>

              <section id="components" className="mb-16">
                <h2 className="text-3xl font-semibold mb-4">Components</h2>
                <p className="text-muted-foreground">
                  Explore our extensive library of pre-built components. Each component is designed
                  to be flexible, accessible, and easy to customize.
                </p>
              </section>

              <section id="styling" className="mb-16">
                <h2 className="text-3xl font-semibold mb-4">Styling</h2>
                <p className="text-muted-foreground">
                  Learn how to customize the look and feel of your application using our powerful
                  styling system based on Tailwind CSS.
                </p>
              </section>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Documentation;