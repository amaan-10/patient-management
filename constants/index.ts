export const GenderOptions = ["male", "female", "other"];

export const PatientFormDefaultValues = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  birthDate: new Date(Date.now()),
  gender: "male" as Gender,
  address: "",
  occupation: "",
  emergencyContactName: "",
  emergencyContactNumber: "",
  primaryPhysician: "",
  insuranceProvider: "",
  insurancePolicyNumber: "",
  allergies: "",
  currentMedication: "",
  familyMedicalHistory: "",
  pastMedicalHistory: "",
  identificationType: "Birth Certificate",
  identificationNumber: "",
  identificationDocument: [],
  treatmentConsent: false,
  disclosureConsent: false,
  privacyConsent: false,
};

export const IdentificationTypes = [
  "ABHA Card",
  "Medical Insurance Card/Policy",
  "Aadhaar Card",
  "PAN Card",
  "Passport",
  "Driver's License",
  "Birth Certificate",
  "Student ID Card",
  "Voter ID Card",
  "Green Card",
  "Service Identity Card",
];

export const Doctors = [
  {
    image: "/assets/images/dr-kabir.png",
    name: "Kabir Mehta",
  },
  {
    image: "/assets/images/dr-neelam.png",
    name: "Neelam Kler",
  },
  {
    image: "/assets/images/dr-shetty.png",
    name: "Devi Prasad Shetty",
  },
  {
    image: "/assets/images/dr-raghav.png",
    name: "Raghav Sinha",
  },
  // {
  //   image: "/assets/images/dr-shweta.png",
  //   name: "Shweta Gopale",
  // },
  {
    image: "/assets/images/dr-naresh.png",
    name: "Naresh Trehan",
  },
  // {
  //   image: "/assets/images/dr-arsheen.png",
  //   name: "Arsheen Shaikh",
  // },
  {
    image: "/assets/images/dr-roy.png",
    name: "Neel Roy",
  },
  {
    image: "/assets/images/dr-sudha.png",
    name: "Sudha Murthy",
  },
  {
    image: "/assets/images/dr-sharma.png",
    name: "Hardik Sharma",
  },
];

export const StatusIcon = {
  scheduled: "/assets/icons/check.svg",
  pending: "/assets/icons/pending.svg",
  cancelled: "/assets/icons/cancelled.svg",
};