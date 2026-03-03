
"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { UserPlus, UsersRound, Home, LayoutDashboard, ChevronRight, History, Lightbulb } from "lucide-react";

export function AppSidebar() {
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-2 px-1">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-lg">
            <LayoutDashboard className="size-5" />
          </div>
          <div className="flex flex-col gap-0.5 leading-none group-data-[collapsible=icon]:hidden">
            <span className="font-bold text-sm tracking-tight uppercase">Door Greeter</span>
            <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">Sekbid 1</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Home">
                  <a href="#">
                    <Home className="w-4 h-4" />
                    <span>Home</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Shortcuts</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Suggestions">
                  <a href="#suggestions" className="flex items-center justify-between group/item">
                    <div className="flex items-center gap-2">
                      <Lightbulb className="w-4 h-4 text-yellow-400" />
                      <span>Suggestions</span>
                    </div>
                    <ChevronRight className="w-3 h-3 opacity-0 group-hover/item:opacity-50 transition-opacity" />
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="History">
                  <a href="#history" className="flex items-center justify-between group/item">
                    <div className="flex items-center gap-2">
                      <History className="w-4 h-4 text-muted-foreground" />
                      <span>History</span>
                    </div>
                    <ChevronRight className="w-3 h-3 opacity-0 group-hover/item:opacity-50 transition-opacity" />
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="INTI Category">
                  <a href="#inti" className="flex items-center justify-between group/item">
                    <div className="flex items-center gap-2">
                      <UserPlus className="w-4 h-4 text-primary" />
                      <span>INTI</span>
                    </div>
                    <ChevronRight className="w-3 h-3 opacity-0 group-hover/item:opacity-50 transition-opacity" />
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="ANGGOTA Category">
                  <a href="#anggota" className="flex items-center justify-between group/item">
                    <div className="flex items-center gap-2">
                      <UserPlus className="w-4 h-4 text-accent" />
                      <span>ANGGOTA</span>
                    </div>
                    <ChevronRight className="w-3 h-3 opacity-0 group-hover/item:opacity-50 transition-opacity" />
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="TERBATAS Category">
                  <a href="#terbatas" className="flex items-center justify-between group/item">
                    <div className="flex items-center gap-2">
                      <UsersRound className="w-4 h-4 text-priority" />
                      <span>TERBATAS</span>
                    </div>
                    <ChevronRight className="w-3 h-3 opacity-0 group-hover/item:opacity-50 transition-opacity" />
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
