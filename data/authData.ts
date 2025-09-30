import type { User } from "@/types/auth"

export const mockUsers: User[] = [
  {
    id: "1",
    email: "owner@propertyease.com",
    firstName: "John",
    lastName: "Manager",
    phone: "+63 912 345 6789",
    role: "owner",
    isVerified: true,
    companyName: "PropertyEase Management",
    businessLicense: "BL-2024-001",
    createdAt: "2024-01-15",
    lastLogin: "2024-12-20",
  },
  {
    id: "2",
    email: "tenant@propertyease.com",
    firstName: "Maria",
    lastName: "Santos",
    phone: "+63 912 345 6790",
    role: "tenant",
    isVerified: true,
    emergencyContact: {
      name: "Pedro Santos",
      phone: "+63 912 345 6791",
      relationship: "Father",
    },
    createdAt: "2024-02-10",
    lastLogin: "2024-12-19",
  },
]
