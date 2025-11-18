import React, { useState, useCallback, useEffect } from "react";
// Import useNavigate from react-router-dom for navigation
import { useNavigate } from "react-router-dom";
// New Import: Accesses the authentication context
import { useAuth } from '@/contexts/AuthContext';
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
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import { Textarea } from "@/components/ui/textarea";
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
  CreditCard,
  Calendar,
  TrendingUp,
  AlertCircle,
  DollarSign,
  FileText,
  Settings,
  Edit,
  Globe,
  Bell,
  LogOut,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Search,
} from "lucide-react";

// NOTE: AddNewPlayerDetails is no longer used here but kept imported for reference
// Assumed API functions
import {
  GetPlayerDetails,
  deletePlayer,
  AddCoachdata,
  GetCoachDetails,
  UpdateCoachdata,
  DeactivateCoachdata
} from "../../../api";

// --- Coach Management Modal Component (FIXED: Added attendance to number conversion) ---
const CoachFormDialog = ({ isOpen, onClose, coachToEdit, onSave }) => {
  const [formData, setFormData] = useState(
    coachToEdit || {
      coach_id: null,
      coach_name: "", // Renamed 'name' to 'coach_name' for form/API consistency
      phone_numbers: "",
      email: "",
      address: "",
      players: 0,
      salary: 0,
      week_salary: 0,
      category: "Football", // Default category
      status: "Active",
      active: true, // Internal state for Switch
    }
  );

  // State for showing loading within the modal
  const [isSaving, setIsSaving] = useState(false);

  const handleCategoryChange = (value) => {
    setFormData((prev) => ({
      ...prev,
      category: value,
    }));
  };

  const handleActiveChange = (checked) => {
    setFormData((prev) => ({
      ...prev,
      active: checked,
      status: checked ? "Active" : "Inactive", // Set status based on active state
    }));
  };

  React.useEffect(() => {
    setFormData(
      coachToEdit
        ? {
            ...coachToEdit,
            active: coachToEdit.status === "Active", // Set switch based on status
          }
        : {
            id: null,
            coach_name: "",
            phone_numbers: "",
            email: "",
            address: "",
            players: 0,
            salary: 0,
            week_salary: 0,
            category: "Football",
            status: "Active",
            active: true,
          }
    );
  }, [coachToEdit]);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]:
        // FIX: Added 'attendance' to the list of fields to be converted to a number
        id === "players" ||
        id === "salary" ||
        id === "week_salary" ||
        id === "attendance"
          ? Number(value)
          : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true); // Start saving
    await onSave(formData);
    setIsSaving(false); // Stop saving
    onClose();
  };

  const title = formData.id ? "Edit Coach" : "Add New Coach";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {/* Coach Name */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="coach_name" className="text-right">
                Name
              </Label>
              <Input
                id="coach_name"
                value={formData.coach_name}
                onChange={handleChange}
                className="col-span-3"
                required
              />
            </div>

            {/* Phone Numbers */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="phone_numbers" className="text-right">
                Phone
              </Label>
              <Input
                id="phone_numbers"
                value={formData.phone_numbers}
                onChange={handleChange}
                className="col-span-3"
              />
            </div>

            {/* Email */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className="col-span-3"
                required
              />
            </div>

            {/* Address (using Textarea) */}
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="address" className="text-right pt-2">
                Address
              </Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={handleChange}
                className="col-span-3"
              />
            </div>

            {/* Players (Not editable for new coach, but kept for edit) */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="players" className="text-right">
                Players
              </Label>
              <Input
                id="players"
                type="number"
                value={formData.players}
                onChange={handleChange}
                className="col-span-3"
                disabled={!formData.id} // Only editable if editing existing coach
              />
            </div>

            {/* Salary */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="salary" className="text-right">
                Monthly Salary
              </Label>
              <Input
                id="salary"
                type="number"
                value={formData.salary}
                onChange={handleChange}
                className="col-span-3"
              />
            </div>

            {/* Week Salary */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="week_salary" className="text-right">
                Session Salary
              </Label>
              <Input
                id="week_salary"
                type="number"
                value={formData.week_salary}
                onChange={handleChange}
                className="col-span-3"
              />
            </div>

            {/* Attendance Input */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="attendance" className="text-right">
                Attendance (%)
              </Label>
              <Input
                id="attendance"
                type="number"
                value={formData.attendance || 0}
                onChange={handleChange}
                className="col-span-3"
                min="0"
                max="100"
              />
            </div>

            {/* Category (Dropdown) */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="category" className="text-right">
                Category
              </Label>
              <Select
                onValueChange={handleCategoryChange}
                value={formData.category}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Football">Football</SelectItem>
                  <SelectItem value="Cricket">Cricket</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Active (Switch) and Status Display */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="active" className="text-right">
                Active
              </Label>
              <div className="col-span-3 flex items-center justify-between">
                <span>**Status:** {formData.status}</span>
                <Switch
                  id="active"
                  checked={formData.active}
                  onCheckedChange={handleActiveChange}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <>{formData.id ? "Save Changes" : "Add Coach"}</>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// --- Registration Review Dialog Component (Kept) ---
const RegistrationReviewDialog = ({ isOpen, onClose, registration }) => {
  const { toast } = useToast();

  if (!registration) return null;

  const handleApprove = () => {
    toast({
      title: "Registration Approved",
      description: `Player ${registration.name} has been approved and added to active roster.`,
      variant: "success",
    });
    onClose();
  };

  const handleReject = () => {
    toast({
      title: "Registration Rejected",
      description: `Player ${registration.name} was rejected. An email notification has been sent.`,
      variant: "destructive",
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Review Registration: {registration.name}</DialogTitle>
          <DialogDescription>
            Review the details before approving or rejecting the player's
            application.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-3 items-center gap-4">
            <Label className="text-right">Player Name</Label>
            <p className="col-span-2 font-medium">{registration.name}</p>
          </div>
          <div className="grid grid-cols-3 items-center gap-4">
            <Label className="text-right">Parent Name</Label>
            <p className="col-span-2">{registration.parent}</p>
          </div>
          <div className="grid grid-cols-3 items-center gap-4">
            <Label className="text-right">Application Date</Label>
            <p className="col-span-2">{registration.date}</p>
          </div>
          <div className="grid grid-cols-3 items-center gap-4">
            <Label className="text-right">Current Status</Label>
            <Badge
              className="col-span-2 w-fit"
              variant={
                registration.status === "Pending Payment"
                  ? "destructive"
                  : "secondary"
              }
            >
              {registration.status}
            </Badge>
          </div>
          <div className="grid grid-cols-3 items-center gap-4 pt-4 border-t">
            <Label htmlFor="review-notes" className="text-right">
              Staff Notes
            </Label>
            <Input
              id="review-notes"
              placeholder="Add approval/rejection notes..."
              className="col-span-2"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleReject}>
            Reject
          </Button>
          <Button onClick={handleApprove}>Approve Registration</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// --- Delete Confirmation Dialog Component (Kept) ---
const DeleteConfirmationDialog = ({ isOpen, onClose, onConfirm, name }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-red-600 flex items-center gap-2">
            <Trash2 className="h-5 w-5" /> Confirm Deletion
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to permanently delete **{name}**'s player
            record? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={onConfirm}>
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Record
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// --- Academy Settings Tab Component (Kept) ---
const AcademySettingsTab = () => {
  const { toast } = useToast();

  const [settings, setSettings] = useState({
    siteName: "Spartan Soccer Academy",
    notificationsEnabled: true,
    autoBackup: true,
    defaultCurrency: "USD",
  });

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setSettings((prev) => ({ ...prev, [id]: value }));
  };

  const handleSwitchChange = (id, checked) => {
    setSettings((prev) => ({ ...prev, [id]: checked }));
  };

  const handleSave = () => {
    console.log("Settings saved:", settings);
    toast({
      title: "Settings Saved",
      description: "General academy settings have been successfully updated.",
      variant: "success",
    });
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            General Academy Settings
          </CardTitle>
          <CardDescription>
            Manage core academy information and operational parameters.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Site Name Setting */}
            <div className="space-y-2">
              <Label htmlFor="siteName">Academy Name</Label>
              <Input
                id="siteName"
                value={settings.siteName}
                onChange={handleInputChange}
              />
            </div>

            {/* Currency Setting */}
            <div className="space-y-2">
              <Label htmlFor="defaultCurrency">Default Currency</Label>
              <Input
                id="defaultCurrency"
                value={settings.defaultCurrency}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <hr className="my-4" />

          {/* Notifications Setting */}
          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <div className="flex items-center gap-3">
              <Bell className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium">Enable Notifications</p>
                <p className="text-sm text-muted-foreground">
                  Receive alerts for new registrations and payments.
                </p>
              </div>
            </div>
            <Switch
              checked={settings.notificationsEnabled}
              onCheckedChange={(checked) =>
                handleSwitchChange("notificationsEnabled", checked)
              }
            />
          </div>

          {/* Backup Setting */}
          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <div className="flex items-center gap-3">
              <Globe className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium">Automatic Data Backup</p>
                <p className="text-sm text-muted-foreground">
                  Automatically back up data every 24 hours.
                </p>
              </div>
            </div>
            <Switch
              checked={settings.autoBackup}
              onCheckedChange={(checked) =>
                handleSwitchChange("autoBackup", checked)
              }
            />
          </div>

          <Button onClick={handleSave} className="w-full mt-6">
            Save Academy Settings
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

// --- Pagination Control Component (Kept) ---
const PaginationControls = ({ currentPage, totalPages, paginate }) => {
  if (totalPages <= 1) return null;

  // Simple rendering of all page numbers
  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  return (
    <div className="flex justify-between items-center pt-4 border-t mt-4">
      <Button
        variant="outline"
        size="sm"
        onClick={() => paginate(currentPage - 1)}
        disabled={currentPage === 1}
      >
        <ChevronLeft className="h-4 w-4 mr-1" /> Previous
      </Button>
      <div className="flex gap-1">
        {pageNumbers.map((number) => (
          <Button
            key={number}
            variant={number === currentPage ? "default" : "outline"}
            size="sm"
            onClick={() => paginate(number)}
          >
            {number}
          </Button>
        ))}
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={() => paginate(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        Next <ChevronRight className="h-4 w-4 ml-1" />
      </Button>
    </div>
  );
};

// --- Main Staff Dashboard Component ---
const StaffDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  // FIX: Destructure the logout function from the useAuth hook
  const { logout } = useAuth();

  // FIX: Declare the coaches state here to resolve "coaches is not defined" error
  const [coaches, setCoaches] = useState([
    {
      coach_id: null,
      coach_name: "",
      phone_numbers: "1",
      email: "",
      address: "",
      players: 0,
      salary: 0,
      week_salary: 0,
      category: "Football",
      status: "Active",
      active: true,
      attendance: 0,
    },
  ]);
  // END FIX

  // Mock initial data (unchanged)
  const staffData = {
    totalPlayers: 156,
    activeCoaches: 8,
    pendingRegistrations: 12,
    monthlyRevenue: 45600,
    completionRate: 94,
  };

  const pendingRegistrations = [
    {
      id: 1,
      name: "Oliver Smith",
      parent: "John Smith",
      date: "2024-02-20",
      status: "Pending Payment",
    },
    {
      id: 2,
      name: "Maya Patel",
      parent: "Ravi Patel",
      date: "2024-02-19",
      status: "Document Review",
    },
    {
      id: 3,
      name: "Ethan Brown",
      parent: "Lisa Brown",
      date: "2024-02-18",
      status: "Pending Payment",
    },
  ];

  const paymentOverview = [
    { month: "January", collected: 42000, pending: 3000, total: 45000 },
    { month: "February", collected: 38000, pending: 7600, total: 45600 },
  ];

  // State for data loading and errors
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const [players, setPlayers] = useState([]);

  // --- Search State (NEW) ---
  const [searchTerm, setSearchTerm] = useState("");

  // --- Pagination State (NEW) ---
  const [currentPage, setCurrentPage] = useState(1);
  const playersPerPage = 5; // Display 5 records per page, as requested

  const [isCoachModalOpen, setIsCoachModalOpen] = useState(false);
  const [editingCoach, setEditingCoach] = useState(null);

  const openAddCoachModal = () => {
    setEditingCoach(null);
    setIsCoachModalOpen(true);
  };
  const openEditCoachModal = (coach) => {
    // Map the coaches state data back to the format expected by the modal (using coach_name instead of name)
    setEditingCoach({
      ...coach,
      coach_name: coach.name, // Use the existing name property for the form's coach_name field
    });
    setIsCoachModalOpen(true);
  };
  const closeCoachModal = () => {
    setIsCoachModalOpen(false);
    setEditingCoach(null);
  };

  // --- UPDATED: handleSaveCoach to include API call ---
  const handleSaveCoach = useCallback(
    async (newCoachData) => {
      // 1. Prepare data for the API
      const apiData = {
        ...newCoachData,
        name: newCoachData.coach_name,
        coach_name: newCoachData.coach_name,
      };

      if (apiData.id) {
        // --- UPDATE EXISTING COACH ---
        try {
          // *** FIX APPLIED: Call API before updating local state ***
          await UpdateCoachdata(apiData);

          // Update local state only after a successful API call
          setCoaches((prevCoaches) => {
            const updatedCoach = prevCoaches.map((coach) =>
              coach.id === apiData.id ? { ...coach, ...apiData } : coach
            );
            return updatedCoach;
          });

          toast({
            title: "Coach Updated",
            description: `Coach ${apiData.name} details saved successfully.`,
            variant: "success",
          });
        } catch (error) {
          console.error("Error updating coach:", error);
          toast({
            title: "Coach Update Failed",
            description: `Failed to update coach. Error: ${
              error.message || "Unknown error."
            }`,
            variant: "destructive",
          });
        }
      } else {
        // --- ADD NEW COACH ---
        try {
          // Assuming AddCoachdata is defined and functional
          const response = await AddCoachdata(apiData);

          const newCoach = {
            ...apiData,
            id:
              response?.coach?.coach_id ||
              Math.max(...coaches.map((c) => c.id || 0), 0) + 1,
            name: apiData.name,
          };

          setCoaches((prevCoaches) => [...prevCoaches, newCoach]);

          toast({
            title: "Coach Added",
            description: `New coach, ${newCoach.name}, has been successfully added.`,
            variant: "success",
          });
        } catch (error) {
          console.error("Error adding coach:", error);
          toast({
            title: "Coach Add Failed",
            description: `Failed to add coach. Error: ${
              error.message ||
              "Unknown API error. Check AddCoachdata implementation."
            }`,
            variant: "destructive",
          });
        }
      }
    },
    [coaches, toast]
  );
  // -----------------------------------------------------------------------
const handleDeleteCoach = useCallback(
    async (coachId, coachName) => {
        // Renamed to handleDeactivateCoach for clarity, but using your name for now
        if (!window.confirm(`Are you sure you want to DEACTIVATE coach ${coachName}?`)) {
            return; // User cancelled the operation
        }

        try {
            // Call the API to deactivate the coach
            const response = await DeactivateCoachdata(coachId);
            
            // The API returns the updated coach object: response.coach
            const deactivatedCoach = response.coach;

            // FIX: Update local state by MAPPING (not filtering) to show the 'Inactive' status
            setCoaches((prevCoaches) =>
                prevCoaches.map((coach) => {
                    const currentId = coach.id || coach.coach_id;
                    if (currentId === coachId) {
                        // Apply the changes (active=FALSE, status=Inactive)
                        return {
                            ...coach,
                            active: deactivatedCoach.status !== 'Inactive', // Should be false
                            status: deactivatedCoach.status
                        };
                    }
                    return coach;
                })
            );

            toast({
                title: "Coach Deactivated", // Use Deactivated to match the operation
                description: `Coach ${coachName} has been successfully deactivated.`,
                variant: "success",
            });
        } catch (error) {
            console.error("Error deactivating coach:", error);
            toast({
                title: "Deactivation Failed",
                description: `Failed to deactivate coach. Error: ${error.message || "Unknown API error."}`,
                variant: "destructive",
            });
        }
    },
    [setCoaches, toast]
);

  // --- Player Modal/Navigation Handlers (Kept/Updated) ---
  const openAddPlayerModal = () => {
    // Navigate to the new /add-players page instead of opening a modal
    navigate("/add-players");
  };

  const openEditPlayerModal = (player) => {
    // FIX: Correctly format the URL path to include both IDs.
    // Assuming player.id is the Academy ID and player.player_id is the Player ID
    navigate(`/edit-player/${player.id}/${player.player_id}`);
  };

  // --- DELETE Player Logic (FIXED FOR TOAST AND ROBUST ERROR MESSAGE) ---
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [playerToDelete, setPlayerToDelete] = useState(null);

  const openDeletePlayerModal = (player) => {
    setPlayerToDelete(player);
    setIsDeleteModalOpen(true);
  };

  const closeDeletePlayerModal = () => {
    setIsDeleteModalOpen(false);
    setPlayerToDelete(null);
  };

  const handleDeletePlayer = async () => {
    if (!playerToDelete) return;

    try {
      // Assume deletePlayer accepts the player's primary ID (id or player_id)
      await deletePlayer(playerToDelete.id);

      setPlayers((prevPlayers) =>
        prevPlayers.filter((p) => p.id !== playerToDelete.id)
      );

      toast({
        title: "Player Deleted",
        description: `The record for ${playerToDelete.name} has been successfully removed.`,
        variant: "success", // FIXED: Changed to 'success'
      });
    } catch (error) {
      toast({
        title: "Delete Failed",
        // FIXED: Using a more generic message that includes error.message but is safer
        description: `Failed to delete player. Error: ${
          error.message ||
          "Unknown API error. Please check the API implementation."
        }`,
        variant: "destructive",
      });
    }

    closeDeletePlayerModal();
  };
  // --------------------------------------------------
  const fetchCoachData = async () => {
    // Renamed for clarity
    setIsLoading(true);
    try {
      // <-- FIX: Changed to call GetCoachDetails
      const data = await GetCoachDetails();

      const mappedData = data.map((coach) => ({
        coach_id: coach.coach_id,
        players: coach.players,
        coach_name: coach.coach_name,
        phone_numbers: coach.phone_numbers,
        salary: coach.salary,
        week_salary: coach.week_salary,
        category: coach.category,
        status: coach.status,
        attendance: Number(coach.attendance) || 0,
      }));

      // <-- FIX: Ensure this state setter matches your component definition
      setCoaches(mappedData);
    } catch (err) {
      // <-- FIX: Corrected error message
      console.error("Failed to fetch coach data:", err);
      setError("Failed to fetch coach data.");
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    fetchCoachData(); // <-- This (lowercase 'c') causes the error
  }, []);

  // --- PLAYER DATA FETCHING FUNCTION (Kept) ---
  const fetchPlayers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await GetPlayerDetails();

      // Map database keys (based on user's SQL query fields) to frontend keys
      const mappedData = data.map((player) => ({
        id: player.id || player.ID || Math.random(),
        player_id: player.Player_ID || player.player_id || "N/A",
        name: player.Name || player.name || "Unknown Player",
        age: player.Age || player.age || 0,
        address: player.Address || player.address || "",
        phone_no: player.Phone_no || player.phone_no || "",
        center_name: player.Center_Name || player.center_name || "",
        coach_name: player.Coach_Name || player.coach_name || "",
        category: player.Category || player.category || "General",
        status: player.Status || player.status || "Unknown",
      }));

      setPlayers(mappedData);

      // OPTIONAL: Reset to page 1 after fetching data to show the latest changes
      // setCurrentPage(1);
    } catch (err) {
      setError(
        "Failed to fetch player data. Check server status and API configuration."
      );
      console.error("Fetch Players Error:", err);
      toast({
        title: "Error",
        description:
          "Failed to load player data from the server. Ensure the API server is running.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // --- useEffect to Fetch Players on Component Mount (Kept) ---
  useEffect(() => {
    fetchPlayers();
  }, [fetchPlayers]);

  const [activeTab, setActiveTab] = useState("registrations");

  // --- Registration Review State and Handlers (Kept) ---
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewingRegistration, setReviewingRegistration] = useState(null);

  const openReviewModal = (registration) => {
    setReviewingRegistration(registration);
    setIsReviewModalOpen(true);
  };

  const closeReviewModal = () => {
    setIsReviewModalOpen(false);
    setReviewingRegistration(null);
  };
  // --------------------------------------------------

  // --- Payment Action Handlers (Kept) ---
  const handleSendReminders = () => {
    toast({
      title: "Reminders Sent",
      description:
        "Payment reminders sent to all players with pending balances.",
      variant: "success",
    });
  };

  const handleGenerateReport = () => {
    toast({
      title: "Report Generating",
      description:
        "Generating detailed monthly payment report. Check downloads shortly.",
      variant: "success",
    });
  };

  const handlePaymentSettings = () => {
    toast({
      title: "Feature Simulated",
      description:
        "Attempting to open payment gateway configuration settings...",
      variant: "secondary",
    });
  };

  const handlePaymentSchedule = () => {
    toast({
      title: "Schedule View",
      description: "Displaying recurring payment schedule overview.",
      variant: "secondary",
    });
  };
  
  // The mock logout function is now removed, and the real one is obtained from useAuth() above.

  // --- Sign Out Handler (Kept) ---
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


  // --- Filtering Logic (NEW) ---
  const filteredPlayers = React.useMemo(() => {
    if (!searchTerm) return players;

    const lowerCaseSearch = searchTerm.toLowerCase().trim();

    return players.filter((player) => {
      // Search by Name
      if (player.name && player.name.toLowerCase().includes(lowerCaseSearch)) {
        return true;
      }
      // Search by Player ID
      if (
        player.player_id &&
        player.player_id.toLowerCase().includes(lowerCaseSearch)
      ) {
        return true;
      }
      // Search by Phone Number (numbers)
      // Strip non-numeric characters for better matching against phone_no
      if (player.phone_no) {
        const cleanedPhone = player.phone_no.replace(/\D/g, "");
        if (cleanedPhone.includes(lowerCaseSearch.replace(/\D/g, ""))) {
          return true;
        }
      }
      return false;
    });
  }, [players, searchTerm]);

  // --- Pagination Logic (UPDATED) ---
  // Use filteredPlayers for pagination
  const playersToPaginate = filteredPlayers;
  const indexOfLastPlayer = currentPage * playersPerPage;
  const indexOfFirstPlayer = indexOfLastPlayer - playersPerPage;
  // Slice the players array to get only the records for the current page
  const currentPlayers = playersToPaginate.slice(
    indexOfFirstPlayer,
    indexOfLastPlayer
  );
  const totalPages = Math.ceil(playersToPaginate.length / playersPerPage);

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Reset pagination when search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const handleTabClick = (value) => {
    if (value === "venues") {
      // Redirect to the /venues route
      navigate("/venues");
    } else if (value === "players") {
      // Redirect to the /add-player route (assuming this is where the AddPlayerForm lives)
      navigate("/add-player");
    }
    // You can add more conditions here for other tabs
  };

  return (
    <div className="space-y-6">
      {/* Modals */}
      <CoachFormDialog
        isOpen={isCoachModalOpen}
        onClose={closeCoachModal}
        coachToEdit={editingCoach}
        onSave={handleSaveCoach}
      />

      {/* Registration Review Modal */}
      <RegistrationReviewDialog
        isOpen={isReviewModalOpen}
        onClose={closeReviewModal}
        registration={reviewingRegistration}
      />

      {/* Player Delete Confirmation Modal */}
      <DeleteConfirmationDialog
        isOpen={isDeleteModalOpen}
        onClose={closeDeletePlayerModal}
        onConfirm={handleDeletePlayer}
        name={playerToDelete?.name || "this player"}
      />



      {/* Header (with Sign Out Button) */}
      <div className="bg-gradient-primary rounded-xl p-6 text-primary-foreground flex justify-between items-start">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold mb-2">Staff Administration</h1>
          <p className="text-primary-foreground/80">
            Complete academy management and oversight
          </p>
        </div>

        {/* Sign Out Button */}
        <Button
          variant="secondary"
          className="bg-primary-foreground/10 hover:bg-primary-foreground/20 text-primary-foreground"
          onClick={handleSignOut}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </Button>
      </div>

      {/* --- Stats Overview --- */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {/* FIX: Use players.length for consistency with state, add loader */}
        <Card className="shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <div>
                <p className="text-2xl font-bold">
                  {isLoading ? (
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  ) : (
                    players.length
                  )}
                </p>
                <p className="text-xs text-muted-foreground">Total Players</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-primary" />
              <div>
                <p className="text-2xl font-bold">
                  {/* Now 'coaches' is defined and can be filtered */}
                  {coaches.filter((c) => c.status === "Active").length}
                </p>
                <p className="text-xs text-muted-foreground">Active Coaches</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-2xl font-bold">
                  {staffData.pendingRegistrations}
                </p>
                <p className="text-xs text-muted-foreground">
                  Pending Registrations
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-success" />
              <div>
                <p className="text-2xl font-bold">
                  ${staffData.monthlyRevenue.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">Monthly Revenue</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-success" />
              <div>
                <p className="text-2xl font-bold">
                  {staffData.completionRate}%
                </p>
                <p className="text-xs text-muted-foreground">Completion Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* --- Tabs Section --- */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="registrations">Registrations</TabsTrigger>
          <TabsTrigger value="players">Player Management</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="coaches">Coach Management</TabsTrigger>
          <TabsTrigger value="settings">Academy Settings</TabsTrigger>
          <TabsTrigger value="venues"  onClick={() => handleTabClick("venues")}> Venue Management</TabsTrigger>
        </TabsList>

        <TabsContent value="registrations" className="space-y-4">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="h-5 w-5" />
                Pending Registrations
              </CardTitle>
              <CardDescription>
                Review and approve new player registrations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {pendingRegistrations.map((registration) => (
                  <div
                    key={registration.id}
                    className="flex items-center justify-between p-4 bg-muted rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{registration.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Parent: {registration.parent} • Applied:{" "}
                        {registration.date}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge
                        variant={
                          registration.status === "Pending Payment"
                            ? "destructive"
                            : "secondary"
                        }
                      >
                        {registration.status}
                      </Badge>
                      <Button
                        size="sm"
                        onClick={() => openReviewModal(registration)}
                      >
                        Review
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="players" className="space-y-4">
          <Card className="shadow-card">
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
              {/* LEFT SIDE: Title and Description (grouped in a div) */}
              <div className="space-y-1">
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Player Management
                </CardTitle>
                <CardDescription>
                  Manage all registered players and their details
                </CardDescription>
              </div>

              {/* RIGHT SIDE: Search and Button (grouped in a flex container) */}
              <div className="flex flex-col sm:flex-row items-end gap-3 w-full max-w-sm ml-auto">
                {/* Search Input */}
                <div className="relative w-full">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Search by name, player ID, or phone number..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-full"
                  />
                </div>

                {/* Add New Player Button */}
                <Button
                  size="sm"
                  onClick={openAddPlayerModal}
                  className="w-full sm:w-auto flex-shrink-0"
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add New Player
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-3">
                {/* Display Loading, No Records, or Data */}
                {isLoading ? (
                  <div className="flex justify-center items-center p-8 text-muted-foreground">
                    <Loader2 className="h-6 w-6 animate-spin mr-2" />
                    Fetching player data...
                  </div>
                ) : playersToPaginate.length === 0 ? (
                  <div className="flex flex-col justify-center items-center p-8 text-muted-foreground">
                    <AlertCircle className="h-8 w-8 mb-2" />
                    <p className="font-medium">
                      {searchTerm
                        ? `No results found for "${searchTerm}"`
                        : "No Player Records Found"}
                    </p>
                    <p className="text-sm">
                      Click "Add New Player" or check your server connection.
                    </p>
                    {error && (
                      <p className="text-xs text-red-500 mt-2">
                        Error: {error}
                      </p>
                    )}
                  </div>
                ) : (
                  // Iterate over currentPlayers for pagination
                  currentPlayers.map((player) => (
                    <div
                      key={player.id}
                      className="flex items-start justify-between p-4 bg-muted rounded-lg"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold shrink-0 mt-1">
                          {/* Ensure player.name is not null/undefined */}
                          {(player.name || "").charAt(0).toUpperCase() || "-"}
                        </div>
                        <div className="space-y-1">
                          {/* FIX: Changed <p> to <div> to resolve DOM nesting warning (div inside p) */}
                          <div className="font-medium">
                            {player.name}{" "}
                            <Badge
                              variant="secondary"
                              className="ml-2 font-mono"
                            >
                              {player.player_id}
                            </Badge>
                          </div>

                          {/* Player Details Row 1 */}
                          <p className="text-sm text-muted-foreground">
                            Age {player.age} • Category: **{player.category}** •
                            Center: {player.center_name}
                          </p>

                          {/* Player Details Row 2 */}
                          <p className="text-xs text-muted-foreground max-w-md">
                            Address: {player.address} • Phone: {player.phone_no}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Coach: {player.coach_name}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <Badge
                          variant={
                            player.status === "Active" ? "default" : "secondary"
                          }
                        >
                          {player.status}
                        </Badge>
                        {/* Edit Button (kept) */}
                        <Button
                          size="sm"
                          variant="outline"
                          // BUTTON: Now navigates to /edit-player/:id
                          onClick={() => openEditPlayerModal(player)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        {/* Delete Button (kept) */}
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => openDeletePlayerModal(player)}
                          className="p-2 h-8 w-8"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
              {/* Pagination Controls */}
              <PaginationControls
                currentPage={currentPage}
                totalPages={totalPages}
                paginate={paginate}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Payment Overview
                </CardTitle>
                <CardDescription>
                  Monthly payment collection status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {paymentOverview.map((payment, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{payment.month}</span>
                        <span className="font-medium">
                          ${payment.total.toLocaleString()}
                        </span>
                      </div>
                      <Progress
                        value={(payment.collected / payment.total) * 100}
                        className="h-2"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>
                          Collected: ${payment.collected.toLocaleString()}
                        </span>
                        <span>
                          Pending: ${payment.pending.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Payment Actions
                </CardTitle>
                <CardDescription>
                  Manage payment reminders and reports
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button
                    className="w-full justify-start"
                    onClick={handleSendReminders}
                  >
                    <DollarSign className="h-4 w-4 mr-2" />
                    Send Payment Reminders
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={handleGenerateReport}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Generate Payment Report
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={handlePaymentSettings}
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Payment Settings
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={handlePaymentSchedule}
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    Payment Schedule
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="coaches" className="space-y-4">
          <Card className="shadow-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="space-y-1">
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Coach Management
                </CardTitle>
                <CardDescription>
                  Manage coaching staff and their assignments
                </CardDescription>
              </div>
              <Button size="sm" onClick={openAddCoachModal}>
                <UserPlus className="h-4 w-4 mr-2" />
                Add New Coach
              </Button>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-3">
                {coaches.map((coach) => (
                  <div
                    key={coach.coach_id}
                    className="flex items-center justify-between p-4 bg-muted rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold">
                        {/* Avatar shows the first initial */}
                        {coach.coach_name ? coach.coach_name.charAt(0) : "?"}
                      </div>
                      <div>
                        {/* Line 1: Coach Name and Phone Number */}
                        <p className="font-medium flex items-center gap-2">
                          {coach.coach_name}
                          <span className="text-sm font-normal text-gray-500">
                            ({coach.phone_numbers}) • ({coach.week_salary}/week)
                          </span>
                        </p>

                        {/* Line 2: Category, Players, and Attendance */}
                        <p className="text-sm text-muted-foreground">
                          <span className="font-semibold">
                            {coach.category}
                          </span>
                          <span className="mx-2">•</span>
                          {coach.players} players
                          <span className="mx-2">•</span>
                          {coach.attendance}% attendance
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right hidden sm:block">
                        <p className="text-sm font-medium">
                          ₹{coach.salary.toLocaleString()}
                        </p>
                        <p className="text-xs text-muted-foreground">Monthly</p>
                      </div>

                      {/* Status is correctly shown in the Badge */}
                      <Badge
                        variant={
                          coach.status === "Active" ? "default" : "secondary"
                        }
                      >
                        {coach.status}
                      </Badge>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openEditCoachModal(coach)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>

                      <Button
                        size="sm"
                        variant="destructive" // Use destructive variant for delete
                        onClick={() =>
                          handleDeleteCoach(
                            coach.id || coach.coach_id,
                            coach.coach_name
                          )
                        }
                      >
                        <Trash2 className="h-2 w-2" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <AcademySettingsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StaffDashboard;