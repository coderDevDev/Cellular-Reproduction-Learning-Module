"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/hooks/useAuth"
import {
  Home,
  Menu,
  MessageSquare,
  Bell,
  Building,
  User,
  CreditCard,
  FileText,
  Wrench,
  Calendar,
  DollarSign,
  AlertCircle,
  LogOut,
  Settings,
  Clock,
  MapPin,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function TenantDashboard() {
  const { authState, logout } = useAuth()
  const [currentTime] = useState(
    new Date().toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }),
  )

  const quickActions = [
    { icon: CreditCard, label: "Pay Rent", color: "from-green-500 to-green-600", urgent: true },
    { icon: Wrench, label: "Maintenance", color: "from-orange-500 to-orange-600", count: "2" },
    { icon: FileText, label: "Documents", color: "from-blue-500 to-blue-600" },
    { icon: MessageSquare, label: "Messages", color: "from-purple-500 to-purple-600", count: "3" },
    { icon: Calendar, label: "Announcements", color: "from-indigo-500 to-indigo-600", count: "1" },
    { icon: User, label: "Profile", color: "from-gray-500 to-gray-600" },
  ]

  const handleLogout = () => {
    logout()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-100">
      {/* Mobile-First Header */}
      <div className="bg-gradient-to-r from-slate-900 via-purple-900 to-pink-900 shadow-xl">
        <div className="px-4 pt-12 pb-4">
          {/* Top Row */}
          <div className="flex items-center justify-between mb-4">
            <div className="text-white/70 text-sm font-medium">{currentTime}</div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Button variant="ghost" size="sm" className="text-white hover:bg-white/10 p-2 rounded-xl relative">
                  <Bell className="w-5 h-5" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full" />
                </Button>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-white hover:bg-white/10 p-2 rounded-xl">
                    <Menu className="w-5 h-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem>
                    <User className="w-4 h-4 mr-2" />
                    Profile Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="w-4 h-4 mr-2" />
                    Account Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* User Info Row */}
          <div className="flex items-center gap-3">
            <Avatar className="w-12 h-12 border-2 border-white/30 shadow-lg">
              <AvatarImage src="/placeholder.svg?height=48&width=48" />
              <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-600 text-white font-semibold">
                {authState.user?.firstName?.[0]}
                {authState.user?.lastName?.[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-white font-semibold text-lg">
                {authState.user?.firstName} {authState.user?.lastName}
              </p>
              <div className="flex items-center gap-1 text-white/70 text-sm">
                <MapPin className="w-3 h-3" />
                <span>Room 204 - Slitz Dormitory</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Main Content */}
      <div className="px-4 py-6 pb-24">
        {/* Mobile Welcome Message */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-1">
            Welcome back!
          </h1>
          <p className="text-gray-600 text-sm">Your rental dashboard</p>
        </div>

        {/* Mobile Rent Status Card */}
        <Card className="bg-white/90 backdrop-blur-sm shadow-lg mb-6 border border-red-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Rent Due</h3>
                  <p className="text-red-600 text-sm">Payment overdue</p>
                </div>
              </div>
              <Clock className="w-5 h-5 text-red-500" />
            </div>
            <div className="text-center mb-4">
              <div className="text-3xl font-bold mb-2 text-gray-900">₱8,500.00</div>
              <p className="text-gray-600 text-sm mb-4">Due: January 31, 2025</p>
              <Button className="bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-3 rounded-xl shadow-lg w-full">
                <DollarSign className="w-4 h-4 mr-2" />
                Pay Now
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Mobile Quick Actions Grid */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {quickActions.map((action, index) => (
            <Card
              key={index}
              className="bg-white/80 backdrop-blur-sm hover:bg-white hover:shadow-lg transition-all duration-200 active:scale-95 cursor-pointer border-0 shadow-md"
            >
              <CardContent className="p-4 text-center">
                <div className="relative mb-3">
                  <div
                    className={`w-10 h-10 bg-gradient-to-r ${action.color} rounded-xl flex items-center justify-center mx-auto shadow-md`}
                  >
                    <action.icon className="w-5 h-5 text-white" />
                  </div>
                  {action.count && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">{action.count}</span>
                    </div>
                  )}
                  {action.urgent && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center animate-pulse">
                      <span className="text-white text-xs font-bold">!</span>
                    </div>
                  )}
                </div>
                <p className="text-gray-800 text-xs font-semibold leading-tight">{action.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Mobile Recent Updates */}
        <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0 mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-gray-900 flex items-center gap-2 text-lg">
              <Bell className="w-4 h-4 text-purple-500" />
              Recent Updates
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                {
                  icon: Bell,
                  title: "Maintenance Scheduled",
                  description: "Water system maintenance on Jan 30",
                  time: "2h ago",
                  color: "bg-blue-500",
                },
                {
                  icon: Wrench,
                  title: "Request Completed",
                  description: "Your AC repair request completed",
                  time: "1d ago",
                  color: "bg-green-500",
                  badge: "Done",
                },
              ].map((update, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-3 rounded-xl bg-gray-50/50 hover:bg-gray-100/50 transition-colors"
                >
                  <div
                    className={`w-8 h-8 ${update.color} rounded-lg flex items-center justify-center shadow-md mt-0.5 flex-shrink-0`}
                  >
                    <update.icon className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-900 font-semibold text-sm">{update.title}</p>
                    <p className="text-gray-600 text-xs">{update.description}</p>
                    <p className="text-gray-500 text-xs mt-1">{update.time}</p>
                  </div>
                  {update.badge && (
                    <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-0 text-xs">
                      {update.badge}
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Mobile Quick Stats */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg border-0">
            <CardContent className="p-4 text-center">
              <Wrench className="w-6 h-6 mx-auto mb-2 opacity-80" />
              <div className="text-2xl font-bold mb-1">3</div>
              <p className="text-blue-100 text-xs">Active Requests</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg border-0">
            <CardContent className="p-4 text-center">
              <Calendar className="w-6 h-6 mx-auto mb-2 opacity-80" />
              <div className="text-2xl font-bold mb-1">12</div>
              <p className="text-purple-100 text-xs">Months Here</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-gray-200/50 px-4 py-2 shadow-2xl">
        <div className="flex justify-around items-center max-w-md mx-auto">
          {[
            { icon: MessageSquare, label: "Messages", count: "3" },
            { icon: Bell, label: "Alerts", count: "2" },
            { icon: Home, label: "Home", active: true },
            { icon: Building, label: "Property" },
            { icon: User, label: "Profile" },
          ].map((item, index) => (
            <Button
              key={index}
              variant="ghost"
              size="sm"
              className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-200 relative ${
                item.active ? "text-purple-600 bg-purple-50" : "text-gray-600 hover:text-purple-600 hover:bg-purple-50"
              }`}
            >
              <div className="relative">
                <item.icon className="w-5 h-5" />
                {item.count && (
                  <div className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">{item.count}</span>
                  </div>
                )}
              </div>
              <span className="text-xs font-medium">{item.label}</span>
            </Button>
          ))}
        </div>
      </div>
    </div>
  )
}
