"use client"

import * as React from "react"
import {
  Activity,
  BarChart3,
  FolderKanban,
  Settings,
  FileText,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const data = {
  user: {
    name: "AgentOps User",
    email: "user@agentops.dev",
    avatar: "/avatars/user.jpg",
  },
  navMain: [
    {
      title: "Traces",
      url: "/dashboard",
      icon: Activity,
      isActive: true,
      iconColor: "text-blue-500",
      items: [],
    },
    {
      title: "Analytics",
      url: "/dashboard/analytics",
      icon: BarChart3,
      iconColor: "text-green-500",
      items: [],
    },
    {
      title: "Projects",
      url: "/projects",
      icon: FolderKanban,
      iconColor: "text-purple-500",
      items: [],
    },
  ],
  navSecondary: [
    {
      title: "Documentation",
      url: "#",
      icon: FileText,
      iconColor: "text-orange-500",
    },
    {
      title: "Settings",
      url: "#",
      icon: Settings,
      iconColor: "text-gray-500",
    },
  ],
  projects: [],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="/dashboard">
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <Activity className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">AgentOps Monitor</span>
                  <span className="truncate text-xs">LLM Observability</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}
