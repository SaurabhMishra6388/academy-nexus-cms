// Venues.jsx (React Component)

"use client";
import React, { useState, useEffect } from "react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  Users,
  UserPlus,
  MapPin,
  Clock,
  UserCheck,
  UserX,
} from "lucide-react";
// Ensure all API functions are imported
import { GetagssignDetails , GetCoachDetailslist,AssignCoachupdated, addVenueData, fetchVenuesdetails } from "../../../api"; 


export default function StaffDashboard() {
  const { toast } = useToast();
  // State initialization for venues, players, and coaches is an empty array to prevent map errors
  const [venues, setVenues] = useState([]);
  const [showVenueForm, setShowVenueForm] = useState(false);
  const [venueForm, setVenueForm] = useState({
    name: "",
    centerHead: "",
    address: "",
    // Ensures timeSlots is an array from the start
    timeSlots: [{ startTime: "", endTime: "", days: [] }], 
  });

  const [players, setPlayers] = useState([]);
  const [coaches, setCoaches] = useState([]); 

  // Player ID and Coach ID are stored as Numbers
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [selectedCoach, setSelectedCoach] = useState(null);

  // Load venues from localStorage (This is likely legacy but kept for stability)
  useEffect(() => {
    try {
      const savedVenues = localStorage.getItem("venues");
      if (savedVenues) {
        // Only initialize from local storage if API fails, otherwise, API data is preferred
        // setVenues(JSON.parse(savedVenues));
      }
    } catch (e) {
      console.error("LocalStorage error", e);
    }
  }, []);

  // API DATA FETCHING
  useEffect(() => {
    const fetchData = async () => {
      try {
        const playersData = await GetagssignDetails(); 
        const coachData = await GetCoachDetailslist();

        // Use optional chaining with a fallback array [] for safety
        setPlayers(playersData?.players || []);

        // Enhanced coach data handling
        let fetchedCoaches = [];
        if (coachData) {
            // Priority 1: Check for a 'coaches' array property
            fetchedCoaches = coachData.coaches;

            // Priority 2: If 'coaches' property is undefined, assume the whole response is the array
            if (!fetchedCoaches && Array.isArray(coachData)) {
                fetchedCoaches = coachData;
            }
        }
        
        setCoaches(fetchedCoaches || []); 

      } catch (error) {
        console.error("Failed to load players/coaches data:", error);
        toast({
            title: "Data Load Error",
            description: "Failed to load player or coach data from API.",
            variant: "destructive",
        });
      }
    };
    fetchData();

    async function loadVenues() {
        try {
            const fetchedVenues = await fetchVenuesdetails(); 
            setVenues(fetchedVenues);
        } catch (e) {
            console.error("Failed to fetch venues from API", e);
            toast({
                title: "Venue Load Error",
                description: "Failed to load venue data from API. Check server console.",
                variant: "destructive",
            });
        }
    }
    loadVenues();   
    
  }, []);


  const weekDays = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  const handleAddTimeSlot = () => {
    setVenueForm({
      ...venueForm,
      timeSlots: [
        ...venueForm.timeSlots,
        { startTime: "", endTime: "", days: [] },
      ],
    });
  };

  const handleRemoveTimeSlot = (i) => {
    setVenueForm({
      ...venueForm,
      timeSlots: venueForm.timeSlots.filter((_, x) => x !== i),
    });
  };

  const handleTimeSlotChange = (i, field, value) => {
    const updated = [...venueForm.timeSlots];
    updated[i][field] = value;
    setVenueForm({ ...venueForm, timeSlots: updated });
  };

  const handleDayToggle = (i, day) => {
    const updated = [...venueForm.timeSlots];
    // Safe access to updated[i].days
    const currentDays = updated[i].days || []; 
    const exists = currentDays.includes(day);
    updated[i].days = exists
      ? currentDays.filter((d) => d !== day)
      : [...currentDays, day];
    setVenueForm({ ...venueForm, timeSlots: updated });
  };

  const handleSubmitVenue = async (e) => {
    e.preventDefault();
    if (!venueForm.name || !venueForm.centerHead || !venueForm.address || venueForm.timeSlots.length === 0) {         
        toast({
            title: "Validation Error",
            description: "Please fill in all required fields.",
            variant: "destructive",
        });
        return;
    }
    try {
      const apiResponse = await addVenueData(venueForm);
      const newVenue = {
        id: apiResponse.venue_id.toString(),
        name: venueForm.name,
        centerHead: venueForm.centerHead,
        address: venueForm.address,
        timeSlots: venueForm.timeSlots.map(slot => ({
            ...slot,
        })),
      };
      setVenues(prevVenues => [...prevVenues, newVenue]);      
      toast({
        title: "Success",
        description: "Venue added successfully.",
      });
      setVenueForm({
        name: "",
        centerHead: "",
        address: "",
        timeSlots: [{ startTime: "", endTime: "", days: [], active: true }],
      });
      setShowVenueForm(false);
      
    } catch (error) {
      console.error("Venue submission failed:", error);
      toast({
        title: "Submission Failed",
        description: error.message || "Could not add venue due to a server error.",
        variant: "destructive",
      });
    }
  };

 const handleDeleteVenue = async (id) => {
        try {
            // 1. Call the API to delete the venue on the server
            // The logic in api.js handles the DELETE request and transaction
            await deleteVenue(id); 

            // 2. If the API call succeeds, update the local state
            const updated = venues.filter((v) => v.id !== id);
            setVenues(updated);
            
            // 3. Show success notification
            toast({ 
                title: "Deleted", 
                description: `Venue ID ${id} successfully removed.`, 
                status: 'success' 
            });

        } catch (error) {
            // 4. Handle API failure
            console.error("Deletion failed:", error);
            toast({ 
                title: "Error", 
                description: error.message || "Failed to remove venue.", 
                status: 'error' 
            });
        }
    };

  const unassignedPlayers = players.filter(p => !p.coachId);
  const assignedPlayers = players.filter(p => p.coachId);

  // Uses coach_id for lookup and returns coach_name
  const getCoachName = (coachId) => {
    if (coachId === null || coachId === undefined) return "N/A";
    
    const coach = coaches.find(c => c.coach_id === coachId);
    return coach ? coach.coach_name : "N/A"; 
  }


  const handleAssign = async () => {
    if (selectedPlayer !== null && selectedCoach !== null) {
      
      const player = players.find(p => p.id === selectedPlayer);
      const coach = coaches.find(c => c.coach_id === selectedCoach); 

      if (!player || !coach || !player.player_id || !player.id) {
          toast({
              title: "Error",
              description: "Player or Coach data inconsistency found.",
              variant: "destructive",
          });
          return;
      }

      try {
        await AssignCoachupdated(
            coach.coach_name, 
            selectedCoach, 
            player.player_id, 
            player.id
        );

        // Update the local state (simulating a successful API assignment)
        setPlayers(prevPlayers => prevPlayers.map(p => 
          p.id === selectedPlayer ? { 
            ...p, 
            coachId: selectedCoach, 
            coach_name: coach.coach_name 
          } : p
        ));
        
        toast({
          title: "Player Assigned Successfully",
          description: `${player.name} has been assigned to coach ${coach.coach_name}.`,
        });

      } catch (error) {
          console.error("Assignment API failed:", error);
          toast({
              title: "Assignment Failed",
              description: error.message || "Could not assign coach due to a server error.",
              variant: "destructive",
          });
      }

      setSelectedPlayer(null);
      setSelectedCoach(null);
    }
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="bg-primary text-primary-foreground p-6 rounded-xl">
        <h1 className="text-2xl font-bold">Staff Administration</h1>
        <p className="opacity-80">Complete academy management and oversight</p>
      </div>

      <Tabs defaultValue="Assigned" className="space-y-4">
        <TabsList className="grid grid-cols-2 w-full md:w-fit">
          <TabsTrigger value="Assigned">Assign Players</TabsTrigger>
          <TabsTrigger value="venues">Venue Management</TabsTrigger>
        </TabsList>

        {/* Assigned Players Tab */}
        <TabsContent value="Assigned" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Assign Coach to Player</CardTitle>
              <CardDescription>Select a player and a coach to make an assignment.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                {/* Select Player */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Select Player
                  </label>
                  <Select
                    value={selectedPlayer?.toString() || ""}
                    onValueChange={(value) => setSelectedPlayer(Number(value))} 
                  >
                    <SelectTrigger className="border-border">
                      <SelectValue placeholder="Choose a player" />
                    </SelectTrigger>
                    <SelectContent>
                      {/* Players are listed here from the `players` state */}
                      {unassignedPlayers.map((player) => (
                        <SelectItem
                          key={player.id}
                          value={player.id.toString()}
                        >
                          {player.name} - ID: {player.id} (Unassigned)
                        </SelectItem>
                      ))}
                      {assignedPlayers.map((player) => (
                        <SelectItem
                          key={player.id}
                          value={player.id.toString()}
                        >
                          {player.name} - {getCoachName(player.coachId)} (Re-assign)
                        </SelectItem>
                      ))}
                      {/* Only show 'no-players' if the players array is empty */}
                      {players.length === 0 && (
                        <SelectItem value="no-players" disabled>No players found (Load data)</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                {/* Select Coach */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Select Coach
                  </label>
                  <Select
                    value={selectedCoach?.toString() || ""}
                    onValueChange={(value) => setSelectedCoach(Number(value))}
                  >
                    <SelectTrigger className="border-border">
                      <SelectValue placeholder="Choose a coach" />
                    </SelectTrigger>
                    <SelectContent>
                      {/* Coaches are listed here, using coach_id for value and coach_name for display */}
                      {coaches.map((coach) => (
                        <SelectItem key={coach.coach_id} value={coach.coach_id.toString()}>
                          {coach.coach_name} - {coach.category || "N/A"}
                        </SelectItem>
                      ))}
                       {/* Only show 'no-coaches' if the coaches array is empty */}
                       {coaches.length === 0 && (
                        <SelectItem value="no-coaches" disabled>No coaches found (Load data)</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button
                onClick={handleAssign}
                disabled={selectedPlayer === null || selectedCoach === null || players.length === 0 || coaches.length === 0} 
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                <UserPlus className="mr-2 h-4 w-4" />
                Assign Player
              </Button>
              
              {/* Display Unassigned/Assigned Count */}
              <div className="flex justify-between text-sm pt-4 border-t">
                <p>Unassigned Players: <span className="font-bold text-red-500">{unassignedPlayers.length}</span></p>
                <p>Assigned Players: <span className="font-bold text-green-600">{assignedPlayers.length}</span></p>
                <p>Total Players: <span className="font-bold">{players.length}</span></p>
              </div>
            </CardContent>
          </Card>

          {/* --- Player List Section --- */}
          <Card>
            <CardHeader>
                <CardTitle>All Player Details</CardTitle>
                <CardDescription>A complete list of all players and their current coach assignments.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-3 max-h-[400px] overflow-y-auto">
                    {players.length === 0 ? (
                        <div className="text-center p-6 opacity-70 border rounded">
                            <Users className="mx-auto mb-2 h-6 w-6" />
                            No player data loaded. Please check API connection.
                        </div>
                    ) : (
                        players.map((player) => {
                            const isAssigned = player.coachId !== null && player.coachId !== undefined;
                            const coachName = getCoachName(player.coachId); 
                            
                            return (
                                <div 
                                    key={player.id} 
                                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                                >
                                    <div className="flex items-center space-x-3">
                                        <div className={`p-2 rounded-full ${isAssigned ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                            {isAssigned ? <UserCheck className="h-5 w-5" /> : <UserX className="h-5 w-5" />}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-base">{player.name}</p>
                                            <p className="text-sm opacity-70">
                                                Player ID: {player.player_id || "N/A"} | Category: {player.category || "N/A"}
                                            </p> 
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        {isAssigned ? (
                                            <>
                                                <Badge className="bg-green-500 hover:bg-green-500/90">Assigned</Badge>
                                                <p className="text-sm font-medium mt-1">Coach: {coachName}</p>
                                            </>
                                        ) : (
                                            <>
                                                <Badge variant="destructive">Unassigned</Badge>
                                                <p className="text-sm opacity-50 mt-1">Ready for assignment</p>
                                            </>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </CardContent>
          </Card>
          {/* --- End Player List Section --- */}

        </TabsContent>

        {/* Venues Tab (Venue Management) */}
        <TabsContent value="venues">
      <Card>
        <CardHeader className="flex flex-row justify-between items-center">
          <div>
            <CardTitle>Venue Management</CardTitle>
            <CardDescription>Manage academy centers and their time slots.</CardDescription>
          </div>
          <Button onClick={() => setShowVenueForm(!showVenueForm)}>
            <MapPin className="mr-2" />
            {showVenueForm ? "Cancel" : "Add Venue"}
          </Button>
        </CardHeader>

        <CardContent>
          {/* VENUE ADD FORM */}
          {showVenueForm && (
            <form
              onSubmit={handleSubmitVenue}
              className="space-y-4 p-4 border rounded mb-6"
            >
              {/* Center Name, Center Head, Address inputs... */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Center Name *</Label>
                  <Input
                    value={venueForm.name}
                    onChange={(e) =>
                      setVenueForm({ ...venueForm, name: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <Label>Center Head *</Label>
                  <Input
                    value={venueForm.centerHead}
                    onChange={(e) =>
                      setVenueForm({
                        ...venueForm,
                        centerHead: e.target.value,
                      })
                    }
                    required
                  />
                </div>
              </div>

              <div>
                <Label>Address *</Label>
                <Textarea
                  value={venueForm.address}
                  onChange={(e) =>
                    setVenueForm({ ...venueForm, address: e.target.value })
                  }
                  required
                />
              </div>
              
              {/* TIME SLOTS MAPPING */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <Label>Time Slots</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddTimeSlot}
                  >
                    <Clock className="mr-2" />
                    Add
                  </Button>
                </div>

                {venueForm.timeSlots.map((slot, i) => (
                  <div key={i} className="p-4 border rounded space-y-3">
                    <div className="flex justify-between items-center">
                      <h4>Time Slot {i + 1}</h4>
                      {venueForm.timeSlots.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveTimeSlot(i)}
                        >
                          Remove
                        </Button>
                      )}
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label>Start</Label>
                        <Input
                          type="time"
                          value={slot.startTime}
                          onChange={(e) =>
                            handleTimeSlotChange(
                              i,
                              "startTime",
                              e.target.value
                            )
                          }
                        />
                      </div>
                      <div>
                        <Label>End</Label>
                        <Input
                          type="time"
                          value={slot.endTime}
                          onChange={(e) =>
                            handleTimeSlotChange(
                              i,
                              "endTime",
                              e.target.value
                            )
                          }
                        />
                      </div>
                    </div>

                    <div>
                      <Label>Days</Label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                        {weekDays.map((day) => {
                          const id = `slot-${i}-${day}`;
                          const isDaySelected = slot.days && slot.days.includes(day);
                          return (
                            <div
                              key={day}
                              className="flex gap-2 items-center"
                            >
                              <Checkbox
                                id={id}
                                checked={isDaySelected}
                                onCheckedChange={() =>
                                  handleDayToggle(i, day)
                                }
                              />
                              <Label htmlFor={id} className="text-xs">
                                {day.slice(0, 3)}
                              </Label>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Submit/Cancel Buttons */}
              <div className="flex gap-3">
                <Button type="submit">Save Venue</Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowVenueForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          )}

          {/* VENUE LIST DISPLAY */}
          <div className="space-y-3 mt-6">
            {venues.length === 0 && (
              <div className="text-center p-6 opacity-70 border rounded">
                <MapPin className="mx-auto mb-2 h-6 w-6" />
                No venues added yet.
              </div>
            )}

            {venues.map((v) => (
              <Card key={v.id} className="shadow-sm">
                <CardHeader className="flex flex-row justify-between items-start space-y-0">
                  <div>
                    <CardTitle>{v.name}</CardTitle>
                    <CardDescription>
                      Center Head: {v.centerHead}
                    </CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    onClick={() => handleDeleteVenue(v.id)}
                  >
                    Delete
                  </Button>
                </CardHeader>
                <CardContent>
                  <p className="text-sm opacity-70 mb-2">Address:</p>
                  <p className="text-sm mb-4">{v.address}</p>

                  <p className="text-sm font-medium mb-2">Time Slots:</p>
                  {v.timeSlots?.map((s, i) => (
                    <div key={i} className="p-3 border rounded mb-2 bg-secondary/20">
                      <div className="flex items-center gap-2 mb-1">
                        <Clock className="text-primary h-4 w-4" />
                        <span className="font-medium">
                          {s.startTime || "N/A"} - {s.endTime || "N/A"}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {s.days?.map((d) => (
                          <span key={d} className="text-xs border p-1 rounded bg-gray-100">{d}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </TabsContent>
      </Tabs>
    </div>
  );
}