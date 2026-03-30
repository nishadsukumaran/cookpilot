"use client";

import { motion } from "framer-motion";
import {
  ChefHat,
  BookOpen,
  Clock,
  Heart,
  Settings,
  ChevronRight,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AppHeader } from "@/components/layout/app-header";

const dietaryPreferences = ["No Peanuts", "Low Sodium"];
const cuisinePreferences = ["Indian", "Middle Eastern", "Mediterranean"];

const stats = [
  { label: "Recipes Cooked", value: "12", icon: BookOpen },
  { label: "Hours Cooking", value: "8.5", icon: Clock },
  { label: "Favorites", value: "3", icon: Heart },
];

const menuItems = [
  { label: "Dietary Preferences", icon: Heart, badge: "2 set" },
  { label: "Cuisine Preferences", icon: ChefHat, badge: "3 cuisines" },
  { label: "Cooking History", icon: Clock },
  { label: "App Settings", icon: Settings },
];

export default function ProfilePage() {
  return (
    <div className="min-h-screen">
      <AppHeader title="Profile" />

      <div className="mx-auto max-w-lg px-4 py-6">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4"
        >
          <Avatar className="h-16 w-16">
            <AvatarFallback className="bg-primary text-primary-foreground text-xl font-heading">
              N
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="font-heading text-xl">Home Chef</h2>
            <p className="text-sm text-muted-foreground">
              Cooking since January 2026
            </p>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="mt-6 grid grid-cols-3 gap-3"
        >
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="flex flex-col items-center rounded-2xl border border-border bg-card p-4"
            >
              <stat.icon className="h-5 w-5 text-primary" />
              <span className="mt-2 text-lg font-bold tabular-nums">
                {stat.value}
              </span>
              <span className="mt-0.5 text-center text-[11px] text-muted-foreground">
                {stat.label}
              </span>
            </div>
          ))}
        </motion.div>

        {/* Preferences */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mt-6"
        >
          <h3 className="text-sm font-semibold text-muted-foreground">
            Dietary Preferences
          </h3>
          <div className="mt-2 flex flex-wrap gap-2">
            {dietaryPreferences.map((pref) => (
              <Badge key={pref} variant="secondary" className="rounded-full">
                {pref}
              </Badge>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mt-4"
        >
          <h3 className="text-sm font-semibold text-muted-foreground">
            Favorite Cuisines
          </h3>
          <div className="mt-2 flex flex-wrap gap-2">
            {cuisinePreferences.map((cuisine) => (
              <Badge key={cuisine} variant="outline" className="rounded-full">
                {cuisine}
              </Badge>
            ))}
          </div>
        </motion.div>

        <Separator className="my-6" />

        {/* Menu */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-1"
        >
          {menuItems.map((item) => (
            <button
              key={item.label}
              className="flex w-full items-center justify-between rounded-xl px-3 py-3.5 transition-colors hover:bg-muted"
            >
              <div className="flex items-center gap-3">
                <item.icon className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm font-medium">{item.label}</span>
              </div>
              <div className="flex items-center gap-2">
                {item.badge && (
                  <span className="text-xs text-muted-foreground">
                    {item.badge}
                  </span>
                )}
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </button>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
