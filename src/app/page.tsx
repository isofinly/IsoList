"use client";
import { CardGlass } from "@/components/ui/card";
import {
  Film,
  BookText,
  Camera,
  Terminal,
  Shield,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

const apps = [
  {
    id: "tracker",
    name: "Movie & Place Tracker",
    description: "Track your entertainment journey and favorite locations.",
    icon: <Film className="w-8 h-8 text-accent-primary" />,
    href: "/tracker",
    color: "accent-primary",
  },
];

export default function IsoSpacePage() {
  return (
    <div className="min-h-screen bg-bg-base relative overflow-hidden">
      {/* Dynamic Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-accent-primary/5 rounded-full blur-[120px] animate-pulse" />
        <div
          className="absolute top-1/4 -left-20 w-[400px] h-[400px] bg-success/5 rounded-full blur-[100px] animate-pulse"
          style={{ animationDelay: "2s" }}
        />
        <div
          className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-info/5 rounded-full blur-[80px] animate-pulse"
          style={{ animationDelay: "4s" }}
        />
      </div>

      <div className="relative z-10 container mx-auto px-4 pt-32 pb-20">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">
              Welcome to <span className="text-gradient-primary">IsoSpace</span>
            </h1>
            <p className="text-xl text-text-secondary leading-relaxed">
              One home for all of isofinly&apos;s creative tools. Seamlessly
              switch between media tracking.
            </p>
          </motion.div>
        </div>

        {/* App Switcher Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {apps.map((app, index) => (
            <motion.div
              key={app.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Link href={app.href}>
                <CardGlass className="group p-8 h-full hover:scale-[1.02] transition-all duration-medium cursor-pointer border-white/5 hover:border-white/10">
                  <div
                    className={`w-16 h-16 rounded-2xl bg-${app.color}/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-medium`}
                  >
                    {app.icon}
                  </div>
                  <h2 className="text-2xl font-bold mb-3 text-text-primary group-hover:text-accent-primary transition-colors">
                    {app.name}
                  </h2>
                  <p className="text-text-secondary mb-8 leading-relaxed">
                    {app.description}
                  </p>
                  <div className="flex items-center text-sm font-semibold text-accent-primary opacity-0 group-hover:opacity-100 transition-opacity">
                    Launch App <ArrowRight className="ml-2 w-4 h-4" />
                  </div>
                </CardGlass>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Footer Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-32 flex flex-wrap justify-center gap-12 text-text-muted"
        >
          <div className="flex items-center gap-2">
            <Terminal className="w-5 h-5" />
            <span>Built with Bun & Next.js</span>
          </div>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            <span>Fluent Design System</span>
          </div>
          <div className="flex items-center gap-2">
            <Film className="w-5 h-5" />
            <span>Version 0.2.0-isospace</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
