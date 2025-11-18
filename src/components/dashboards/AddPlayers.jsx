import { useState, useEffect } from "react";
// 1. Import useNavigate for redirection
import { useNavigate } from "react-router-dom"; 
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Loader2,
  Save,
  UserPlus,
  XCircle,
  LogOut,
  Users,
  AlertCircle,
  DollarSign,
  TrendingUp,
} from "lucide-react";

import { toast } from "sonner"; 
// Assuming you have an API to fetch player details and a new one for coaches
// NOTE: Ensure your API file defines GetCoachDetailslist and AddNewPlayerDetails
import { AddNewPlayerDetails, GetCoachDetailslist } from "../../../api"; 

// --- START: Mock Data & Initial State ---

const initialFormData = {
  // Personal Details
  name: "", father_name: "", mother_name: "", gender: "", date_of_birth: "", age: "",
  blood_group: "", phone_no: "", email_id: "", address: "",
  // Guardian Details
  emergency_contact_number: "", guardian_contact_number: "", guardian_email_id: "",
  // Academy Details
  center_name: "", coach_name: "", category: "", 
  // Status and Medical
  active: false, status: "Pending", medical_condition: "",
  // File Upload Paths (these hold File objects)
  aadhar_upload_path: null, birth_certificate_path: null, profile_photo_path: null,
};

const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const CATEGORIES = ["Football", "Cricket", "Swimming", "Athletics", "Basketball", "Tennis", "Others"];

// --- END: Mock Data & Initial State ---

const AddPlayerForm = () => {
  const [formData, setFormData] = useState(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // NEW STATE: To store the list of coaches fetched from the backend
  // We will store the full coach object for now, or just the names (as before)
  const [coaches, setCoaches] = useState([]);
  const [isLoadingCoaches, setIsLoadingCoaches] = useState(false);
  
  // 2. Initialize useNavigate hook
  const navigate = useNavigate();

  // EFFECT: Fetch coach list on component mount
  useEffect(() => {
    const loadCoaches = async () => {
      setIsLoadingCoaches(true);
      try {
        // coachList will be: [{ coach_id: 1, coach_name: "John Doe" }, ...]
        const coachList = await GetCoachDetailslist(); 
        
        // FIX: Map using 'coach_name' which matches the SQL column name
        const coachNames = coachList.map(coach => coach.coach_name);
        
        // Set the state to the array of coach names
        setCoaches(coachNames);
        
      } catch (error) {
        console.error("Failed to fetch coach list:", error);
        toast.error("Could not load coach list. Check server status.", { 
            duration: 5000, 
        });
      } finally {
        setIsLoadingCoaches(false);
      }
    };

    loadCoaches();
  }, []); 


  const handleSignOut = () => {
    console.log("User signed out!");
    // You would typically call navigate('/login') or similar here
  };

  const handleChange = (e) => {
    const { id, value, type, checked, files } = e.target;

    // Logic to enforce 10-digit numbers and prevent non-numeric input
    if (
      id === "phone_no" ||
      id === "emergency_contact_number" ||
      id === "guardian_contact_number"
    ) {
      const numericValue = value.replace(/\D/g, "").slice(0, 10); 
      setFormData((prev) => ({ ...prev, [id]: numericValue }));
      return;
    }

    if (type === "checkbox") {
      setFormData((prev) => ({ ...prev, [id]: checked }));
    } else if (type === "file") {
      setFormData((prev) => ({ ...prev, [id]: files[0] || null }));
    } else {
      setFormData((prev) => ({ ...prev, [id]: value }));
    }
  };

  const handleSelectChange = (id, value) => {
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Frontend validation for required 10-digit numbers
    if (formData.phone_no.length !== 10 || formData.emergency_contact_number.length !== 10) {
        toast.error("Phone Number and Emergency Contact No. must be exactly 10 digits.", { 
            duration: 5000, 
            style: { backgroundColor: '#FFEBEE', color: '#B71C1C', borderColor: '#F44336' } 
        });
        setIsSubmitting(false);
        return;
    }

    // 1. Create FormData object
    const formDataToSend = new FormData();
    
    // Iterate through all keys and append them
    Object.keys(formData).forEach(key => {
        const value = formData[key];
        
        if (value instanceof File) {
             formDataToSend.append(key, value, value.name); // Include file name
        } 
        else if (value !== null && value !== undefined) {
             // Convert boolean state ('active') to string for the backend
             formDataToSend.append(key, String(value));
        }
    });
    
    // --- API Call Integration ---
    try {
         const response = await AddNewPlayerDetails(formDataToSend); 
        
        toast.success(
            `Player added successfully! ${response.message || ''}`, 
            { 
                duration: 5000,
                style: { backgroundColor: '#E8F5E9', color: '#1B5E20', borderColor: '#4CAF50' }
            }
        );
        
        setFormData(initialFormData); 
        
        // 3. Navigation after successful submission
        setTimeout(() => {
             navigate('/staff'); // Navigate to the /staff route
        }, 100); // Small delay to allow the toast to show briefly
        

    } catch (error) {
        console.error("Submission failed", error);
        
        const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message || "Failed to add player. Check console for details.";
        toast.error(
            errorMessage, 
            { 
                duration: 10000,
                style: { backgroundColor: '#FFEBEE', color: '#B71C1C', borderColor: '#F44336' }
            }
        );
    } finally {
        setIsSubmitting(false);
    }
  };


  const handleCancel = () => {
    setFormData(initialFormData);
  };

  const renderInputField = (id, label, type = "text", placeholder = "", maxLength = null) => (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type={type}
        placeholder={placeholder}
        value={formData[id] || ""}
        onChange={handleChange}
        maxLength={maxLength}
      />
    </div>
  );

  const renderFileInput = (id, label) => (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type="file"
        onChange={handleChange}
        className="block w-full text-sm text-gray-500
                   file:mr-4 file:py-2 file:px-4
                   file:rounded-md file:border-0
                   file:text-sm file:font-semibold
                   file:bg-primary file:text-primary-foreground
                   hover:file:bg-primary/90"
      />
      {/* Check if formData[id] exists and is a File object before accessing .name */}
      {formData[id] && formData[id] instanceof File && (
        <p className="text-xs text-muted-foreground mt-1 text-center">
          File ready: {formData[id].name}
        </p>
      )}
    </div>
  );
  
  // FIX APPLIED HERE: Filtering out empty strings and null/undefined values
  const renderCoachSelect = () => (
    <div className="space-y-2">
        <Label htmlFor="coach_name">Coach Name</Label>
        <Select
            id="coach_name"
            value={formData.coach_name}
            onValueChange={(v) => handleSelectChange("coach_name", v)}
            disabled={isLoadingCoaches} // Disable while loading
        >
            <SelectTrigger>
                <SelectValue placeholder={isLoadingCoaches ? "Loading Coaches..." : "Select Coach"} />
            </SelectTrigger>
            <SelectContent>
                {/* Ensure the list is not empty and filter out invalid values */}
                {coaches.length > 0 ? (
                    coaches
                        .filter(Boolean) 
                        .map((coachName) => (
                        // coachName is now a valid string (e.g., "John Doe")
                        <SelectItem key={coachName} value={coachName}>
                            {coachName}
                        </SelectItem>
                    ))
                ) : (
                    <SelectItem value="no_coaches" disabled>
                        {isLoadingCoaches ? "Loading..." : "No Coaches Found"}
                    </SelectItem>
                )}
            </SelectContent>
        </Select>
    </div>
  );


  return (
    <div className="space-y-8 max-w-8xl mx-auto ">
      <div
        className="bg-gradient-primary rounded-xl p-6 text-primary-foreground flex justify-between items-start"
        style={{ backgroundColor: "#2E7D32" }}
      >
        <div className="space-y-1">
          <h1 className="text-2xl font-bold mb-2">Add Administration</h1>
          <p className="text-primary-foreground/80">
            Complete academy management and oversight
          </p>
        </div>
        <Button
          variant="secondary"
          className="bg-primary-foreground/10 hover:bg-primary-foreground/20 text-primary-foreground"
          onClick={handleSignOut}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </Button>
      </div>

      {/* 2. Stats Cards (omitted for brevity) */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {/* ... Stat Cards Code ... */}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* === Personal Details === */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {renderInputField("name", "Full Name *", "text", "E.g., Michael Jordan")}
            {renderInputField("date_of_birth", "Date of Birth *", "date")}
            {renderInputField("age", "Age", "number", "e.g., 10")}

            {renderInputField("phone_no", "Phone Number *", "tel", "10-digit mobile number", 10)}
            
            {renderInputField("email_id", "Email ID", "email", "E.g., player@example.com")}

            <div className="space-y-2">
              <Label htmlFor="gender">Gender *</Label>
              <Select
                id="gender"
                value={formData.gender}
                onValueChange={(v) => handleSelectChange("gender", v)}
              >
                <SelectTrigger><SelectValue placeholder="Select Gender" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem><SelectItem value="Female">Female</SelectItem><SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="blood_group">Blood Group *</Label>
              <Select
                id="blood_group"
                value={formData.blood_group}
                onValueChange={(v) => handleSelectChange("blood_group", v)}
              >
                <SelectTrigger><SelectValue placeholder="Select Blood Group" /></SelectTrigger>
                <SelectContent>
                  {bloodGroups.map((group) => (<SelectItem key={group} value={group}>{group}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>

            <div className="md:col-span-3 space-y-2">
              <Label htmlFor="address">Address *</Label>
              <Textarea
                id="address"
                placeholder="Player's full address"
                value={formData.address}
                onChange={handleChange}
              />
            </div>
          </CardContent>
        </Card>

        {/* === Family and Emergency === */}
        <Card className="shadow-lg">
          <CardHeader><CardTitle>Guardian & Emergency Contact</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {renderInputField("father_name", "Father's Name", "text", "E.g., John Smith")}
            {renderInputField("mother_name", "Mother's Name", "text", "E.g., Jane Smith")}

            <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4">
              {renderInputField("emergency_contact_number", "Emergency Contact No. *", "tel", "10-digit emergency number", 10)}
              {renderInputField("guardian_contact_number", "Guardian Contact No.", "tel", "Optional 10-digit number", 10)}
              
              {renderInputField("guardian_email_id", "Guardian Email ID", "email", "E.g., guardian@email.com")}
            </div>
          </CardContent>
        </Card>

        {/* === Academy and Medical === */}
        <Card className="shadow-lg">
          <CardHeader><CardTitle>Academy Details & Medical</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {renderInputField("center_name", "Center Name *", "text", "e.g., North Campus")}
            
            {/* RENDER COACH SELECT */}
            {renderCoachSelect()}
            
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select
                id="category"
                value={formData.category}
                onValueChange={(v) => handleSelectChange("category", v)}
              >
                <SelectTrigger><SelectValue placeholder="Select Category" /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (<SelectItem key={cat} value={cat}>{cat}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Player Status *</Label>
              <Select
                id="status"
                value={formData.status}
                onValueChange={(v) => handleSelectChange("status", v)}
              >
                <SelectTrigger><SelectValue placeholder="Select Status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pending">Pending</SelectItem><SelectItem value="Active">Active</SelectItem><SelectItem value="Inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2 pt-6">
              <Checkbox id="active" checked={formData.active} onCheckedChange={(checked) => handleSelectChange("active", checked)} />
              <Label htmlFor="active" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Set as Active Player</Label>
            </div>

            <div className="md:col-span-3 space-y-2">
              <Label htmlFor="medical_condition">Medical Condition/Notes</Label>
              <Textarea
                id="medical_condition"
                placeholder="Any allergies, chronic conditions, or special notes..."
                value={formData.medical_condition}
                onChange={handleChange}
              />
            </div>
          </CardContent>
        </Card>

        {/* === Document Uploads === */}
        <div className="p-6">
          <Card className="shadow-lg">
            <CardHeader><CardTitle>Document Uploads</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {renderFileInput("profile_photo_path", "Player Profile Photo")}
              {renderFileInput("aadhar_upload_path", "Aadhar Card Upload")}
              {renderFileInput("birth_certificate_path", "Birth Certificate Upload")}
            </CardContent>
          </Card>
        </div>

        {/* === Actions === */}
        <div className="flex justify-end space-x-4 pt-4">
          <Button type="button" variant="outline" onClick={handleCancel} disabled={isSubmitting}><XCircle className="h-4 w-4 mr-2" />Cancel & Clear</Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (<Loader2 className="h-4 w-4 mr-2 animate-spin" />) : (<Save className="h-4 w-4 mr-2" />)}
            {isSubmitting ? "Saving Player..." : "Save Player"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AddPlayerForm;