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
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";

import {
  Command,
  CommandList,
  CommandInput,
  CommandGroup,
  CommandItem,
  CommandEmpty,
} from "@/components/ui/command";

import { Users, UserPlus, MapPin, Clock, UserCheck, UserX, X } from "lucide-react"; 
// Ensure all API functions are imported
import {
  GetagssignDetails,
  GetCoachDetailslist,
  AssignCoachupdated,
  addVenueData, 
  fetchVenuesdetails,
  // Assuming deleteVenue is available from this import
   deleteVenue 
} from "../../../api";


// --- State Definitions for Operating Hours ---
const weekDays = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const initialTimeSlot = { startTime: "", endTime: "" };

// Initialize operatingHours as an array with an entry for each day.
const initialOperatingHours = weekDays.map(day => ({
  day: day,
  // Initial status set to 'Enter Hours' 
  status: 'Enter Hours', 
  slots: [], // Each day starts with an empty array of time slots
}));

const initialVenueForm = {
  name: "",
  centerHead: "",
  address: "",
  googleMapsUrl: "", // <--- Consistent state property name
  operatingHours: initialOperatingHours,
};
// --- END State Definitions ---


export default function StaffDashboard() {
  const { toast } = useToast();
  // State initialization for venues, players, and coaches is an empty array to prevent map errors
  const [venues, setVenues] = useState([]);
  const [showVenueForm, setShowVenueForm] = useState(false);
  
  // Initial state now uses the consistent structure with all 7 days initialized.
  const [venueForm, setVenueForm] = useState(initialVenueForm);

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
          fetchedCoaches = coachData.coaches;
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
        const normalizedVenues = fetchedVenues.map(v => ({
            ...v,           
            operatingHours: v.timeSlots || v.operatingHours || [],
        }));
        setVenues(normalizedVenues);
      } catch (e) {
        console.error("Failed to fetch venues from API", e);
        toast({
          title: "Venue Load Error",
          description:
            "Failed to load venue data from API. Check server console.",
          variant: "destructive",
        });
      }
    }
    loadVenues();
  }, []);


  // --- Helper functions for the image-based structure (Day -> Multiple Slots) ---

  const handleDayStatusChange = (dayIndex, status) => {
    setVenueForm(prev => {
      const newOperatingHours = [...prev.operatingHours];
      newOperatingHours[dayIndex].status = status;
      
      // If status changes to Closed or back to Enter Hours, clear all slots
      if (status === 'Closed' || status === 'Enter Hours') {
          newOperatingHours[dayIndex].slots = [];
      } 
      // If setting to Open Day and no slots exist, add one default slot
      else if (status === 'Open Day' && newOperatingHours[dayIndex].slots.length === 0) {
          newOperatingHours[dayIndex].slots.push({ ...initialTimeSlot });
      }
      return { ...prev, operatingHours: newOperatingHours };
    });
  }

  // Ensures only one new slot is added per click
  const handleAddTimeSlot = (dayIndex) => {
    setVenueForm(prev => {
      const newOperatingHours = [...prev.operatingHours];
      // Ensure the day is marked as open if a slot is added
      newOperatingHours[dayIndex].status = 'Open Day';
      newOperatingHours[dayIndex].slots.push({ ...initialTimeSlot });
      return { ...prev, operatingHours: newOperatingHours };
    });
  };

  const handleRemoveTimeSlot = (dayIndex, slotIndex) => {
    setVenueForm(prev => {
      const newOperatingHours = [...prev.operatingHours];
      // Filter out the slot at the specified index
      newOperatingHours[dayIndex].slots = newOperatingHours[dayIndex].slots.filter((_, i) => i !== slotIndex);

      // If the last slot is removed, change status back to 'Enter Hours'
      if (newOperatingHours[dayIndex].slots.length === 0) {
          newOperatingHours[dayIndex].status = 'Enter Hours';
      }
      
      return { ...prev, operatingHours: newOperatingHours };
    });
  };

  const handleTimeSlotChange = (dayIndex, slotIndex, field, value) => {
    setVenueForm(prev => {
      const newOperatingHours = [...prev.operatingHours];
      // Check if slot exists before attempting to update
      if (newOperatingHours[dayIndex].slots[slotIndex]) {
          // This uses the native time input, correctly allowing minutes.
          newOperatingHours[dayIndex].slots[slotIndex][field] = value;
      }
      return { ...prev, operatingHours: newOperatingHours };
    });
  };
  // --- END Helper functions ---


  const handleSubmitVenue = async (e) => {
    e.preventDefault();
    
    // Flatten and validate slots for submission
    let hasValidSlots = false;
    let isValid = true;
    const submissionSlots = [];

    venueForm.operatingHours.forEach(dayEntry => {
        dayEntry.slots.forEach(slot => {
            // Only submit slots for days explicitly set to 'Open Day'
            if (dayEntry.status === 'Open Day' && (slot.startTime && slot.endTime)) {
                hasValidSlots = true;
                // Add day to the submission object for the API
                submissionSlots.push({ 
                    day: dayEntry.day, // <--- Day is correctly included for submission
                    startTime: slot.startTime, 
                    endTime: slot.endTime 
                });
            } else if (dayEntry.status === 'Open Day' && (slot.startTime || slot.endTime)) {
                // If one is present and the other is missing for an open day, it's invalid
                isValid = false;
            }
            // Closed days (status === 'Closed' or 'Enter Hours') automatically contribute no slots and are valid.
        });
    });


    if (
      !venueForm.name ||
      !venueForm.centerHead ||
      !venueForm.address ||
      !venueForm.googleMapsUrl // Added for required validation

    ) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields (Name, Head, Address, Google Maps URL).",
        variant: "destructive",
      });
      return;
    }
    
    // The server endpoint requires timeSlots to not be empty for a valid request
    // For this app, let's enforce that a venue must have at least one valid slot to be added.
    if (!hasValidSlots && submissionSlots.length === 0) {
      toast({
          title: "Validation Error",
          description: "Please enter at least one valid operating hour for a day.",
          variant: "destructive",
      });
      return;
    }


    if (venueForm.operatingHours.some(day => day.status === 'Open Day' && day.slots.length === 0)) {
        toast({
            title: "Validation Error",
            description: "An 'Open Day' must have at least one time slot.",
            variant: "destructive",
        });
        return;
    }

    if (!isValid) {
        toast({
            title: "Validation Error",
            description: "All operating hour ranges must have both a start time and an end time.",
            variant: "destructive",
        });
        return;
    }

    try {
      const dataToSubmit = {
          name: venueForm.name,
          centerHead: venueForm.centerHead,
          address: venueForm.address,
          // FIX: Use 'googleUrl' for the API payload as the backend expects
          googleUrl: venueForm.googleMapsUrl, 
          // Removed unnecessary 'day' field from the submission payload
          // Sending the flattened array of valid slots
          timeSlots: submissionSlots,
      };
      
      const apiResponse = await addVenueData(dataToSubmit);
      
      // Update local state with the newly created venue
      const newVenue = {
        id: apiResponse.venue_id?.toString() || Date.now().toString(),
        name: venueForm.name,
        centerHead: venueForm.centerHead,
        address: venueForm.address,
        // FIX: Store the googleMapsUrl for display
        googleMapsUrl: venueForm.googleMapsUrl, 
        // The display logic in the Venue List expects the flattened array
        operatingHours: submissionSlots, 
      };

      setVenues((prevVenues) => [...prevVenues, newVenue]);
      toast({
        title: "Success",
        description: "Venue added successfully.",
      });
      
      // Reset form
      setVenueForm(initialVenueForm);
      setShowVenueForm(false);
    } catch (error) {
      console.error("Venue submission failed:", error);
      toast({
        title: "Submission Failed",
        description:
          error.message || "Could not add venue due to a server error.",
        variant: "destructive",
      });
    }
  };

  // NOTE: Keep this commented out or ensure deleteVenue is imported correctly
 const handleDeleteVenue = async (id) => {
  try {
    const result = await deleteVenue(id);

    // Update local state only if delete succeeded
    const updated = venues.filter((v) => v.id !== id);
    setVenues(updated);

    toast({
      title: "Deleted",
      description: result.message || `Venue ID ${id} successfully removed.`,
      variant: "success",
    });
  } catch (error) {
    console.error("Deletion failed:", error);
    toast({
      title: "Error",
      description: error.message || "Failed to remove venue.",
      variant: "destructive",
    });
  }
};


  const unassignedPlayers = players.filter((p) => !p.coachId);
  const assignedPlayers = players.filter((p) => p.coachId);

  // Uses coach_id for lookup and returns coach_name
  const getCoachName = (coachId) => {
    if (coachId === null || coachId === undefined) return "N/A";

    const coach = coaches.find((c) => c.coach_id === coachId);
    return coach ? coach.coach_name : "N/A";
  };

  const handleAssign = async () => {
    // ... (Assignment logic is unchanged)
    if (selectedPlayer !== null && selectedCoach !== null) {
      const player = players.find((p) => p.id === selectedPlayer);
      const coach = coaches.find((c) => c.coach_id === selectedCoach);

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
        setPlayers((prevPlayers) =>
          prevPlayers.map((p) =>
            p.id === selectedPlayer
              ? {
                  ...p,
                  coachId: selectedCoach,
                  coach_name: coach.coach_name,
                }
              : p
          )
        );

        toast({
          title: "Player Assigned Successfully",
          description: `${player.name} has been assigned to coach ${coach.coach_name}.`,
        });
      } catch (error) {
        console.error("Assignment API failed:", error);
        toast({
          title: "Assignment Failed",
          description:
            error.message || "Could not assign coach due to a server error.",
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

        {/* Assigned Players Tab (omitted for brevity) */}
        <TabsContent value="Assigned" className="space-y-6">
            <Card>
            <CardHeader>
              <CardTitle>Assign Coach to Player</CardTitle>
              <CardDescription>
                Select a player and a coach to make an assignment.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                {/* Select Coach */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-foreground">
                    Select Coach
                  </Label>
                  <Select
                    value={selectedCoach?.toString() || ""}
                    onValueChange={(value) => setSelectedCoach(Number(value))}
                  >
                    <SelectTrigger className="border-border">
                      <SelectValue placeholder="Choose a coach" />
                    </SelectTrigger>
                    <SelectContent>
                      {coaches.map((coach) => (
                        <SelectItem
                          key={coach.coach_id}
                          value={coach.coach_id.toString()}
                        >
                          {coach.coach_name} - {coach.category || "N/A"}
                        </SelectItem>
                      ))}

                      {coaches.length === 0 && (
                        <SelectItem value="no-coaches" disabled>
                          No coaches found (Load data)
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-foreground">
                    Select Player
                  </Label>

                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-between border-border"
                      >
                        {selectedPlayer
                          ? players.find((p) => p.id === selectedPlayer)?.name
                          : "Choose a player"}
                      </Button>
                    </PopoverTrigger>

                    <PopoverContent className="w-[780px] p-0">
                      <Command>
                        <CommandInput placeholder="Search players..." />
                        <CommandList>
                          <CommandEmpty>No players found.</CommandEmpty>

                          <CommandGroup heading="Unassigned Players">
                            {unassignedPlayers.map((player) => (
                              <CommandItem
                                key={player.id}
                                onSelect={() => setSelectedPlayer(player.id)}
                              >
                                <div className="flex items-center gap-2">
                                  <input
                                    type="checkbox"
                                    checked={selectedPlayer === player.id}
                                    readOnly
                                  />
                                  {player.name} - ID: {player.id} (Unassigned)
                                </div>
                              </CommandItem>
                            ))}
                          </CommandGroup>

                          <CommandGroup heading="Re-assign Players">
                            {assignedPlayers.map((player) => (
                              <CommandItem
                                key={player.id}
                                onSelect={() => setSelectedPlayer(player.id)}
                              >
                                <div className="flex items-center gap-2">
                                  <input
                                    type="checkbox"
                                    checked={selectedPlayer === player.id}
                                    readOnly
                                  />
                                  {player.name} - {getCoachName(player.coachId)}
                                </div>
                              </CommandItem>
                            ))}
                          </CommandGroup>

                          {players.length === 0 && (
                            <CommandItem disabled>
                              No players found (Load data)
                            </CommandItem>
                          )}
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <Button
                onClick={handleAssign}
                disabled={
                  selectedPlayer === null ||
                  selectedCoach === null ||
                  players.length === 0 ||
                  coaches.length === 0
                }
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                <UserPlus className="mr-2 h-4 w-4" />
                Assign Player
              </Button>

              {/* Display Unassigned/Assigned Count */}
              <div className="flex justify-between text-sm pt-4 border-t">
                <p>
                  Unassigned Players:{" "}
                  <span className="font-bold text-red-500">
                    {unassignedPlayers.length}
                  </span>
                </p>
                <p>
                  Assigned Players:{" "}
                  <span className="font-bold text-green-600">
                    {assignedPlayers.length}
                  </span>
                </p>
                <p>
                  Total Players:{" "}
                  <span className="font-bold">{players.length}</span>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* --- Player List Section --- */}
          <Card>
            <CardHeader>
              <CardTitle>All Player Details</CardTitle>
              <CardDescription>
                A complete list of all players and their current coach
                assignments.
              </CardDescription>
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
                    const isAssigned =
                      player.coachId !== null && player.coachId !== undefined;
                    const coachName = getCoachName(player.coachId);

                    return (
                      <div
                        key={player.id}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          <div
                            className={`p-2 rounded-full ${
                              isAssigned
                                ? "bg-green-100 text-green-600"
                                : "bg-red-100 text-red-600"
                            }`}
                          >
                            {isAssigned ? (
                              <UserCheck className="h-5 w-5" />
                            ) : (
                              <UserX className="h-5 w-5" />
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-base">
                              {player.name}
                            </p>
                            <p className="text-sm opacity-70">
                              Player ID: {player.player_id || "N/A"} | Category:{" "}
                              {player.category || "N/A"}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          {isAssigned ? (
                            <>
                              <Badge className="bg-green-500 hover:bg-green-500/90">
                                Assigned
                              </Badge>
                              <p className="text-sm font-medium mt-1">
                                Coach: {coachName}
                              </p>
                            </>
                          ) : (
                            <>
                              <Badge variant="destructive">Unassigned</Badge>
                              <p className="text-sm opacity-50 mt-1">
                                Ready for assignment
                              </p>
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
                <CardDescription>
                  Manage academy centers and their time slots.
                </CardDescription>
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
                  {/* Center Name, Center Head inputs */}
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

                  {/* Address input */}
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

                  {/* Google Maps URL Input */}
                  <div>
                    <Label>Google Maps URL *</Label>
                    <Input
                      type="url"
                      placeholder="https://maps.app.goo.gl/..."
                      value={venueForm.googleMapsUrl}
                      onChange={(e) =>
                        setVenueForm({
                          ...venueForm,
                          googleMapsUrl: e.target.value,
                        })
                      }
                      required
                    />
                  </div>

                  {/* OPERATING HOURS MAPPING */}
                  <div className="space-y-6 pt-4 border-t">
                    <Label className="block text-lg font-semibold">
                      Operating Hours
                    </Label>

                    {/* Map over the 7 fixed days */}
                    {venueForm.operatingHours.map((dayEntry, dayIndex) => {
                      const firstSlot = dayEntry.slots[0];
                      // Only show time inputs if the status is explicitly 'Open Day'
                      const isDayOpen = dayEntry.status === 'Open Day'; 

                      return (
                        <div key={dayEntry.day} className="border-b pb-4 last:border-b-0">
                          
                          {/* 1. HEADER ROW: Day Name, Status, and the FIRST Time Slot */}
                          {/* Grid layout for horizontal alignment: Day | Status | Time 1 | Time 2 | Delete */}
                          <div className="grid grid-cols-[100px_120px_120px_120px_40px_1fr] items-center gap-2 md:gap-4 mb-1 mt-2">
                              {/* Day Name (Col 1) - Shows the Week Day */}
                              <h4 className="font-bold text-base">
                                  {dayEntry.day}
                              </h4>
                              
                              {/* Day Status Dropdown (Col 2) */}
                              <Select
                                  value={dayEntry.status}
                                  onValueChange={(value) => handleDayStatusChange(dayIndex, value)}
                              >
                                  <SelectTrigger className="h-10">
                                      <SelectValue placeholder="Status" />
                                  </SelectTrigger>
                                  <SelectContent>
                                      {/* FIXED: 'Enter Hours' as a status option to match the requirement */}
                                      <SelectItem value="Enter Hours">Enter Hours</SelectItem>
                                      <SelectItem value="Open Day">Open Day</SelectItem>
                                      <SelectItem value="Closed">Closed</SelectItem>
                                  </SelectContent>
                              </Select>

                              {/* Conditional rendering for the FIRST time slot (index 0) - Cols 3, 4, 5 */}
                              {/* Using <Input type="time"> for minute support */}
                              {isDayOpen && firstSlot ? (
                                  <>
                                      {/* From Input (First slot) - Col 3 */}
                                      <Input 
                                          type="time" 
                                          placeholder="From"
                                          className="h-10" 
                                          value={firstSlot.startTime}
                                          onChange={(e) =>
                                              handleTimeSlotChange(dayIndex, 0, "startTime", e.target.value)
                                          }
                                          required
                                      />

                                      {/* To Input (First slot) - Col 4 */}
                                      <Input
                                          type="time" 
                                          placeholder="To"
                                          className="h-10" 
                                          value={firstSlot.endTime}
                                          onChange={(e) =>
                                              handleTimeSlotChange(dayIndex, 0, "endTime", e.target.value)
                                          }
                                          required
                                      />
                                      
                                      {/* Remove Slot Button for the FIRST slot (Col 5) */}
                                      <Button
                                          type="button"
                                          variant="destructive"
                                          size="icon"
                                          className="h-10 w-10 flex-shrink-0"
                                          onClick={() =>
                                              handleRemoveTimeSlot(dayIndex, 0)
                                          }
                                          title="Remove Hour"
                                      >
                                          <X className="h-4 w-4" />
                                      </Button>
                                  </>
                              ) : (
                                  // Filler Divs for alignment if the day is closed or has no slots
                                  <>
                                      {/* Empty divs matching the size of time inputs and delete button */}
                                      <div className="h-10"></div>
                                      <div className="h-10"></div>
                                      <div className="h-10 w-10"></div>
                                  </>
                              )}
                              <div className="col-span-1"></div> {/* Empty space for last grid column */}
                          </div>
                          
                          {/* 2. ADDITIONAL SLOTS AND ADD BUTTON (Rendered below the header) */}
                          <div className="space-y-3 pl-[220px]">
                              
                              {/* Map over time slots starting from the SECOND slot (index 1) */}
                              {dayEntry.slots.slice(1).map((slot, slotIndex) => {
                                  // Actual index in the original array is slotIndex + 1
                                  const actualIndex = slotIndex + 1;
                                  return (
                                      <div
                                          key={actualIndex}
                                          // Sub-row grid starts under the Status Dropdown and Day Name
                                          className="grid grid-cols-[120px_120px_40px] items-center gap-2 md:gap-4"
                                      >
                                          {/* From Input (Subsequent slots) - Col 1 */}
                                          <Input 
                                              type="time" 
                                              placeholder="From"
                                              className="h-10"
                                              value={slot.startTime}
                                              onChange={(e) =>
                                                  handleTimeSlotChange(dayIndex, actualIndex, "startTime", e.target.value)
                                              }
                                              required
                                          />

                                          {/* To Input (Subsequent slots) - Col 2 */}
                                          <Input
                                              type="time" 
                                              placeholder="To"
                                              className="h-10"
                                              value={slot.endTime}
                                              onChange={(e) =>
                                                  handleTimeSlotChange(dayIndex, actualIndex, "endTime", e.target.value)
                                              }
                                              required
                                          />
                                          
                                          {/* Remove Slot Button for subsequent slots (Col 3) */}
                                          <Button
                                              type="button"
                                              variant="destructive"
                                              size="icon"
                                              className="h-10 w-10 flex-shrink-0"
                                              onClick={() =>
                                                  handleRemoveTimeSlot(dayIndex, actualIndex)
                                              }
                                              title="Remove Hour"
                                          >
                                              <X className="h-4 w-4" />
                                          </Button>
                                      </div>
                                  );
                              })}

                              {/* Add Hour Button (One 'Add Enter Hour' per day, only if open) */}
                              {isDayOpen && (
                                  <div className="text-left pt-2">
                                      <Button
                                          type="button"
                                          variant="link"
                                          size="sm"
                                          onClick={() => handleAddTimeSlot(dayIndex)}
                                          className="p-0 h-auto"
                                      >
                                          Add Enter Hour
                                      </Button>
                                  </div>
                              )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {/* END OPERATING HOURS MAPPING */}

                  {/* Submit/Cancel Buttons */}
                  <div className="flex gap-3 mt-6">
                    <Button type="submit">Save Venue</Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                          setVenueForm(initialVenueForm);
                          setShowVenueForm(false);
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              )}

              {/* VENUE LIST DISPLAY - FIXED TO GROUP SLOTS BY DAY */}
              <div className="space-y-3 mt-6">
                {venues.length === 0 && (
                  <div className="text-center p-6 opacity-70 border rounded">
                    <MapPin className="mx-auto mb-2 h-6 w-6" />
                    No venues added yet.
                  </div>
                )}

                {venues.map((v) => {
                    // Group the flattened operatingHours array by day
                    const groupedHours = v.operatingHours.reduce((acc, slot) => {
                        const day = slot.day || 'Unknown Day';
                        if (!acc[day]) {
                            acc[day] = [];
                        }
                        acc[day].push(slot);
                        return acc;
                    }, {});

                    // Get a sorted list of days for consistent display order
                    const sortedDays = weekDays.filter(day => groupedHours[day]);
                    const unknownDays = Object.keys(groupedHours).filter(day => !weekDays.includes(day));

                    return (
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
                                {/* Address */}
                                <p className="text-sm opacity-70 mb-2">Address:</p>
                                <p className="text-sm mb-4">{v.address}</p>

                               {/* Google Maps Link - FIX: Use v.googleMapsUrl */}
                                {v.googleMapsUrl && (
                                    <div className="mb-4">
                                        <p className="text-sm opacity-70 mb-1">
                                            Google Maps Link:
                                        </p>
                                        <a
                                            href={v.googleMapsUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-xs text-blue-600 hover:underline truncate block"
                                        >
                                            {v.googleMapsUrl}
                                        </a>
                                    </div>
                                )}
                               

                                {/* Operating Hours Display - Grouped by Day */}
                                <p className="text-sm font-medium mb-2">
                                    Operating Hours:
                                </p>
                                <div className="space-y-2">
                                    {[...sortedDays, ...unknownDays].map((day) => {
                                        const slots = groupedHours[day];
                                        return (
                                            <div
                                                key={day}
                                                className="p-3 border rounded bg-secondary/20"
                                            >
                                                <div className="flex items-center gap-2 font-bold mb-1">
                                                    <Clock className="text-primary h-4 w-4" />
                                                    <span>{day}</span>
                                                </div>
                                                <div className="pl-6 space-y-1 text-sm">
                                                    {slots.map((slot, i) => (
                                                        <p key={i}>
                                                            {slot.startTime || "N/A"} - {slot.endTime || "N/A"}
                                                        </p>
                                                    ))}
                                                </div>
                                            </div>
                                        );
                                    })}
                                    {v.operatingHours?.length === 0 && (
                                        <p className="text-sm opacity-70">No operating hours defined.</p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

