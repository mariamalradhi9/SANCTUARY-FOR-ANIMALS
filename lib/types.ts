// Shared domain types, ported 1:1 from the fields used across the original
// vanilla-JS prototype (js/pets-data.js, js/admin-animals.js, js/assessment-form.js,
// js/admin-common.js, js/shop.js, js/adopt.js, js/login.js).

export type Species = "dog" | "cat" | "rabbit";
export type Size = "small" | "medium" | "large";
export type Gender = "male" | "female";
export type YesNo = "Yes" | "No";

export interface Adopter {
  name: string;
  mobile: string;
  email: string;
  address: string;
  paidOrFree: "" | "Paid" | "Free";
  amountPaid: number | null;
}

export interface Animal {
  id: string;
  name: string;
  species: Species;
  emoji: string;
  img: string;
  breed: string;
  dob: string;
  size: Size;
  gender: Gender;
  tag: string;
  available: boolean;
  hidden?: boolean;
  desc: string;

  // Onboarding / intake fields (26-field requirement set)
  onboardingDate?: string;
  govtSupport?: YesNo;
  govtSupportValue?: number | null;
  aggressionLevel?: "" | "Low" | "Medium" | "High" | "Severe";
  aggressionDetails?: string;
  behaviorDetails?: string;
  medicalStatus?: "Healthy" | "Under Treatment" | "Chronic Condition" | "Critical";
  vaccinationStatus?: "Up to Date" | "Due" | "Not Vaccinated";
  nutritionStatus?: "Good" | "Needs Improvement" | "Poor";
  nextVetCheckDue?: string;
  chipped?: YesNo;
  kennelNumber?: string;
  kennelInCharge?: string;
  trained?: YesNo;
  trainerName?: string;
  trainingHours?: number | null;
  trainingLevel?: "Basic" | "Intermediate" | "Advanced";
  readyForAdoption?: YesNo;
  adoptionDate?: string;
  adoptionType?: "" | "Local" | "Abroad";
  destinationCountry?: string;
  adopter?: Adopter;
  remarks?: string;
}

export interface HistoryEntry {
  status: string;
  date: string;
}

export interface Application {
  id: string;
  petId: string;
  petName: string;
  applicant: string;
  email: string;
  phone: string;
  gender: string;
  maritalStatus: string;
  housingType: string;
  address: string;
  ownedBefore: string;
  householdSize: number;
  otherPets: string;
  whyAdopt: string;
  date: string;
  status: string;
  history: HistoryEntry[];
  photo?: string;
  pickupDate?: string;
  pickupTime?: string;
}

export type Activity = "walk" | "play" | "groom";

export interface Booking {
  id: string;
  name: string;
  phone: string;
  petId: string;
  petName: string;
  activity: Activity;
  date: string;
  slot: string;
  duration: string;
  status: string;
  history: HistoryEntry[];
  arrivalTime?: string;
}

export interface ProfileScores {
  humanSociability?: string;
  arousalThreshold?: string;
  recoveryLatency?: string;
  environmentalConfidence?: string;
  frustrationTolerance?: string;
  tactileSensitivity?: string;
}

export interface Assessment {
  petId: string;
  dogName: string;
  evalDate: string;
  breedMix: string;
  weightCondition: string;
  estAge: string;
  specialist: string;
  location: string;
  sex: "" | "M" | "F";
  altered: "" | "Y" | "N";
  vaccinated: "" | "Y" | "N";
  goodWithKids: "" | "Y" | "N";
  profileScores: ProfileScores;
  preyDrive: string;
  foodDrive: string;
  socialDrive: string;
  socialOrientation: string;
  posturing: string[];
  spaceClaiming: string[];
  socialYield: "" | "Yes" | "No";
  redFlags: string[];
  incidentHistory: string;
  disposition: string;
  orangeSubtype: string[];
  signSpecialist: string;
  signature: string;
  signDate: string;
  savedAt: string;
}

export interface CartItem {
  id: string;
  name: string;
  price: number;
  qty: number;
}

export type FulfillmentMethod = "delivery" | "pickup";

export type OrderStatus = "Processing" | "Shipped" | "Out for Delivery" | "Delivered" | "Ready for Pickup" | "Picked Up";

export interface Order {
  id: string;
  items: CartItem[];
  total: number;
  name: string;
  phone: string;
  address?: string;
  date: string;
  fulfillment: FulfillmentMethod;
  pickupWindowStart?: string;
  pickupWindowEnd?: string;
  status: OrderStatus;
  history: HistoryEntry[];
}

export type Role = "admin" | "user";

export interface Session {
  email: string;
  role: Role;
  name: string;
}

export interface AuditLogEntry {
  action: string;
  summary: string;
  at: string;
}
