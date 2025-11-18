import React, { useState, useEffect, useMemo } from "react";
// FIX: Import useNavigate from react-router-dom
import { useNavigate } from "react-router-dom";
// Assuming these are imports from your component library
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import {
  Users,
  Calendar as CalendarIcon,
  Clock,
  LogOut,
  CheckCircle,
  UserCheck,
  Trophy,
  Target,
  BookOpen,
} from "lucide-react";
import { fetchCoachAssignedPlayers } from "../../../api"; // Adjusted path to root api file

const CoachDashboard = () => {
  // 🔑 HOOKS MUST BE CALLED UNCONDITIONALLY AT THE TOP
  const [selectedDate, setSelectedDate] = useState(new Date());
  const { user, session, isLoading: isAuthLoading, logout } = useAuth();
  const [assignedPlayers, setAssignedPlayers] = useState([]);
  const [isLoadingPlayers, setIsLoadingPlayers] = useState(false);
  
  const { toast } = useToast();
  const [localAttendance, setLocalAttendance] = useState({});
  // FIX: Initialize useNavigate
  const navigate = useNavigate();

  // Extract token safely
  const token = session?.accessToken;

  const handleAttendanceChange = (playerId, status) => {
    setLocalAttendance(prev => ({
      ...prev,
      [playerId]: status,
    }));
  };

  const averageAttendance = useMemo(() => {
    if (!assignedPlayers || assignedPlayers.length === 0) return 0;
    const total = assignedPlayers.reduce((sum, p) => {
      // Guard attendance field, ensuring it's a number
      const att =
        typeof p.attendance === "number"
          ? p.attendance
          : parseFloat(p.attendance) || 0;
      return sum + att;
    }, 0);
    return Math.round(total / assignedPlayers.length);
  }, [assignedPlayers]);

  useEffect(() => {
    // Conditional logic starts inside useEffect
    if (isAuthLoading) {
      setAssignedPlayers([]);
      setIsLoadingPlayers(false);
      return;
    }

    // Check for user and token
    if (!user || !user.id || !token) {
      setAssignedPlayers([]);
      setIsLoadingPlayers(false);
      return;
    }

    let isMounted = true;

    const fetchPlayers = async () => {
      setIsLoadingPlayers(true);
      try {
        // Use the fetchCoachAssignedPlayers function with user.id and token
        const players = await fetchCoachAssignedPlayers(user.id, token);
        if (!isMounted) return;
        setAssignedPlayers(players || []);
      } catch (error) {
        console.error("Dashboard failed to load players:", error);
        if (isMounted) setAssignedPlayers([]);
      } finally {
        if (isMounted) setIsLoadingPlayers(false);
      }
    };

    fetchPlayers();

    return () => {
      isMounted = false;
    };
  }, [isAuthLoading, user, token]);
  // ----------------------------------------

  // Static UI data (kept for dashboard structure)
  const todaysSchedule = [
    {
      time: "4:00 PM - 5:30 PM",
      group: "U12 Beginners",
      location: "Field A",
      status: "Completed",
    },
    {
      time: "5:30 PM - 7:00 PM",
      group: "U13 Intermediate",
      location: "Field A",
      status: "Completed",
    },
    {
      time: "7:00 PM - 8:30 PM",
      group: "U14 Advanced",
      location: "Field B",
      status: "Upcoming",
    },
  ];

  const weeklySchedule = [
    { day: "Monday", sessions: ["4:00 PM - U12", "6:00 PM - U13"] },
    { day: "Tuesday", sessions: ["4:00 PM - U11", "5:30 PM - U14"] },
    { day: "Wednesday", sessions: ["4:00 PM - U12", "6:00 PM - U13"] },
    { day: "Thursday", sessions: ["4:00 PM - U11", "5:30 PM - U14"] },
    { day: "Friday", sessions: ["4:00 PM - U12", "6:00 PM - U13"] },
    { day: "Saturday", sessions: ["10:00 AM - Match Day"] },
    { day: "Sunday", sessions: ["Rest Day"] },
  ];

  const markAttendance = (playerId) => {
    console.log(`Marking attendance for player ${playerId}`);
    // TODO: implement attendance API call
  };

  // Conditional return must be AFTER all hook calls
  if (isAuthLoading) {
    return (
      <div className="p-10 text-center">
        Authenticating user... Please wait.
      </div>
    );
  }

  // If not logged in after loading, return null (AppRouter handles redirect)
  if (!user) {
    return null;
  }

  const handleSignOut = () => {
    // 1. Log out the user (clears session/token)
    logout();
    // 2. Show success notification
    toast({
      title: "Signed Out",
      description:
        "You have been securely logged out and redirected to the login page.",
      variant: "success",
    });
    // 3. FIX: Navigate to the /auth route
    navigate("/auth");
  };

  const handleSubmitAttendance = () => {
    console.log("Submitting Attendance:", localAttendance);
    // Loop through localAttendance and call the actual markAttendance function/API
    Object.entries(localAttendance).forEach(([id, status]) => {
      markAttendance(parseInt(id), status);
    });
    alert("Attendance Submitted! Check console for details.");
    // Optionally clear localAttendance state here
    // setLocalAttendance({});
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4">
      {/* Header */}
      <div className="bg-gradient-primary rounded-xl p-6 text-primary-foreground flex justify-between items-start">
        <div className="flex-grow">
          <h1 className="text-2xl font-bold mb-2">Coach Dashboard</h1>
          <p className="text-primary-foreground/80">
            Welcome back,{" "}
            <span className="font-semibold">{user?.name || "Coach"}</span>
          </p>
        </div>

        {/* User details displayed on the right side */}
        <div className="ml-8 text-right self-center">
          <div className="mt-2 text-sm text-primary-foreground/70 space-y-1">
            <p>Email: {user?.email || "—"}</p>
            <p>Role: {user?.role || "—"}</p>
            <p>Coach ID: {user?.id || "—"}</p>
          </div>
        </div>

        {/* Sign Out Button */}
        <Button
          variant="secondary"
          className="ml-8 bg-primary-foreground/10 hover:bg-primary-foreground/20 text-primary-foreground"
          onClick={handleSignOut}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <div>
                <p className="text-2xl font-bold">
                  {isLoadingPlayers ? "..." : assignedPlayers.length}
                </p>
                <p className="text-xs text-muted-foreground">
                  Assigned Players
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-primary" />
              <div>
                <p className="text-2xl font-bold">{todaysSchedule.length}</p>
                <p className="text-xs text-muted-foreground">
                  Today's Sessions
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-success" />
              <div>
                <p className="text-2xl font-bold">
                  {
                    todaysSchedule.filter((s) => s.status === "Completed")
                      .length
                  }
                </p>
                <p className="text-xs text-muted-foreground">Completed Today</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              <div>
                <p className="text-2xl font-bold">{averageAttendance}%</p>
                <p className="text-xs text-muted-foreground">Avg Attendance</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="players" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="players">Assigned Players</TabsTrigger>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
        </TabsList>

        <TabsContent value="players" className="space-y-4">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Assigned Players
              </CardTitle>
              <CardDescription>
                Manage your assigned players and track their progress
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingPlayers ? (
                <div className="p-4 text-center text-muted-foreground">
                  Loading players...
                </div>
              ) : assignedPlayers.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">
                  No players assigned to this coach ID ({user.id}) or failed to
                  fetch.
                </div>
              ) : (
                <div className="space-y-3">
                  {assignedPlayers.map((player) => (
                    <div
                      key={player.id}
                      className="flex items-center justify-between p-4 bg-muted rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold">
                          {player.name ? player.name.charAt(0) : "?"}
                        </div>
                        <div>
                          <p className="font-medium">
                            {player.name || "Unnamed Player"}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Age {player.age ?? "—"} • {player.position ?? "—"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="text-sm font-medium">
                            {typeof player.attendance === "number"
                              ? `${player.attendance}%`
                              : player.attendance
                              ? `${player.attendance}%`
                              : "—"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Attendance
                          </p>
                        </div>
                        <Badge
                          variant={
                            player.status === "Active" ? "default" : "secondary"
                          }
                        >
                          {player.status || "Unknown"}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schedule" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Today's Schedule
                </CardTitle>
                <CardDescription>
                  Your training sessions for today
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {todaysSchedule.map((session, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-muted rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{session.time}</p>
                        <p className="text-sm text-muted-foreground">
                          {session.group} • {session.location}
                        </p>
                      </div>
                      <Badge
                        variant={
                          session.status === "Completed"
                            ? "default"
                            : "secondary"
                        }
                      >
                        {session.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5" />
                  Weekly Schedule
                </CardTitle>
                <CardDescription>Your weekly training schedule</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {weeklySchedule.map((day, index) => (
                    <div key={index} className="border-l-2 border-primary pl-3">
                      <p className="font-medium">{day.day}</p>
                      <div className="text-sm text-muted-foreground">
                        {day.sessions.map((session, sessionIndex) => (
                          <p key={sessionIndex}>{session}</p>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="attendance" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-6">
            {/* --- Mark Attendance Card --- */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserCheck className="h-5 w-5" />
                  Mark Attendance
                </CardTitle>
                <CardDescription>
                  Select players present/absent for today's session
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {assignedPlayers.slice(0, 4).map((player) => {
                    const currentStatus =
                      localAttendance[player.id] || "present"; // Default to present
                    return (
                      <div
                        key={player.id}
                        className="flex items-center justify-between p-3 bg-muted rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          {/* Avatar */}
                          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-bold">
                            {player.name ? player.name.charAt(0) : "?"}
                          </div>
                          {/* Player Name */}
                          <span className="font-medium">
                            {player.name || "Unnamed"}
                          </span>
                        </div>

                        {/* Radio Button Group for Attendance */}
                        <RadioGroup
                          defaultValue={currentStatus}
                          onValueChange={(status) =>
                            handleAttendanceChange(player.id, status)
                          }
                          className="flex space-x-4"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem
                              value="present"
                              id={`p-${player.id}`}
                              className="text-success border-success"
                            />
                            <Label
                              htmlFor={`p-${player.id}`}
                              className="text-success font-medium"
                            >
                              Present
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem
                              value="absent"
                              id={`a-${player.id}`}
                              className="text-destructive border-destructive"
                            />
                            <Label
                              htmlFor={`a-${player.id}`}
                              className="text-destructive font-medium"
                            >
                              Absent
                            </Label>
                          </div>
                        </RadioGroup>
                        {/* End Radio Button Group */}
                      </div>
                    );
                  })}
                </div>
                <Button
                  className="w-full mt-4"
                  onClick={handleSubmitAttendance}
                >
                  Submit Attendance
                </Button>
              </CardContent>
            </Card>
            {/* --- End Mark Attendance Card --- */}

            {/* --- Calendar Card --- */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Calendar</CardTitle>
                <CardDescription>
                  Select date to view/mark attendance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className="rounded-md border"
                />
              </CardContent>
            </Card>
            {/* --- End Calendar Card --- */}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CoachDashboard;
