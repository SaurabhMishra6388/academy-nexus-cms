import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  User, 
  Calendar, 
  TrendingUp, 
  CreditCard, 
  MapPin, 
  Clock,
  Trophy,
  Activity
} from 'lucide-react';

const ParentDashboard = () => {
  // Mock child data
  const childData = {
    name: "Alex Johnson",
    playerId: "FA2024001",
    age: 12,
    position: "Midfielder",
    center: "North Campus",
    batch: "Evening (5:00 PM - 6:30 PM)",
    coach: "Coach Martinez",
    attendance: 85,
    nextPayment: "March 15, 2024",
    paymentAmount: "$150"
  };

  const recentActivities = [
    { date: "2024-02-20", activity: "Training Session", status: "Present" },
    { date: "2024-02-18", activity: "Match vs Eagles", status: "Played" },
    { date: "2024-02-15", activity: "Training Session", status: "Present" },
    { date: "2024-02-13", activity: "Skills Assessment", status: "Completed" },
  ];

  const progressData = [
    { skill: "Ball Control", progress: 78 },
    { skill: "Passing", progress: 85 },
    { skill: "Shooting", progress: 72 },
    { skill: "Defense", progress: 68 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-primary rounded-xl p-6 text-primary-foreground">
        <h1 className="text-2xl font-bold mb-2">Welcome back, Parent!</h1>
        <p className="text-primary-foreground/80">Track {childData.name}'s football journey</p>
      </div>

      {/* Child Profile Card */}
      <Card className="shadow-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                {childData.name}
              </CardTitle>
              <CardDescription>Player ID: {childData.playerId}</CardDescription>
            </div>
            <Badge variant="secondary" className="bg-success text-success-foreground">
              Active Player
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Age</p>
                <p className="font-medium">{childData.age} years</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Trophy className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Position</p>
                <p className="font-medium">{childData.position}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Center</p>
                <p className="font-medium">{childData.center}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Batch</p>
                <p className="font-medium text-xs">{childData.batch}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Attendance Card */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Attendance
            </CardTitle>
            <CardDescription>This month's attendance rate</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">{childData.attendance}%</span>
                <Badge variant={childData.attendance >= 80 ? "default" : "destructive"}>
                  {childData.attendance >= 80 ? "Good" : "Needs Improvement"}
                </Badge>
              </div>
              <Progress value={childData.attendance} className="h-2" />
              <p className="text-sm text-muted-foreground">
                Coach: {childData.coach}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Payment Card */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Payment Status
            </CardTitle>
            <CardDescription>Next payment due</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Next Payment</p>
                <p className="text-lg font-semibold">{childData.nextPayment}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Amount</p>
                <p className="text-2xl font-bold text-primary">{childData.paymentAmount}</p>
              </div>
              <Button className="w-full" variant="outline">
                View Payment History
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Chart */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Skill Progress
          </CardTitle>
          <CardDescription>Development across key football skills</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {progressData.map((skill) => (
              <div key={skill.skill} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{skill.skill}</span>
                  <span className="font-medium">{skill.progress}%</span>
                </div>
                <Progress value={skill.progress} className="h-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activities */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Recent Activities</CardTitle>
          <CardDescription>Latest training sessions and events</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentActivities.map((activity, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div>
                  <p className="font-medium">{activity.activity}</p>
                  <p className="text-sm text-muted-foreground">{activity.date}</p>
                </div>
                <Badge variant={activity.status === "Present" || activity.status === "Played" || activity.status === "Completed" ? "default" : "destructive"}>
                  {activity.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-3 gap-4">
        <Button className="h-auto p-4 flex-col gap-2 bg-gradient-primary hover:bg-primary-dark">
          <User className="h-6 w-6" />
          <span>Update Profile</span>
        </Button>
        <Button variant="outline" className="h-auto p-4 flex-col gap-2">
          <Calendar className="h-6 w-6" />
          <span>View Schedule</span>
        </Button>
        <Button variant="outline" className="h-auto p-4 flex-col gap-2">
          <CreditCard className="h-6 w-6" />
          <span>Make Payment</span>
        </Button>
      </div>
    </div>
  );
};

export default ParentDashboard;