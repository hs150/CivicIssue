import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";

export const demo = {
  users: [],
  issues: [],
  comments: [],
  history: []
};

export function seedDemoData() {
  if (demo.users.length) return;

  const password = bcrypt.hashSync("Demo@123", 10);

  demo.users = [
    { _id: "demo-citizen", name: "Demo Citizen", email: "citizen@civicconnect.demo", password, role: "citizen" },
    { _id: "demo-officer", name: "Demo Officer", email: "officer@civicconnect.demo", password, role: "officer" },
    { _id: "demo-admin", name: "Demo Admin", email: "admin@civicconnect.demo", password, role: "admin" }
  ];

  demo.issues = [
    {
      _id: randomUUID(),
      issueCode: "CC-1001",
      title: "Large pothole near MG Road",
      description: "A deep pothole is affecting two-wheelers and slowing traffic.",
      category: "road",
      department: "Public Works",
      imageUrl: "",
      location: { latitude: 28.6139, longitude: 77.2090, address: "MG Road" },
      reportedBy: "demo-citizen",
      assignedTo: "demo-officer",
      status: "IN_PROGRESS",
      priority: "HIGH",
      priorityScore: 50,
      upvotes: 18,
      upvotedBy: [],
      resolutionNote: "",
      resolvedAt: null,
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      _id: randomUUID(),
      issueCode: "CC-1002",
      title: "Garbage overflow at Main Market",
      description: "Waste bins have been overflowing since yesterday.",
      category: "garbage",
      department: "Sanitation",
      imageUrl: "",
      location: { latitude: 28.6200, longitude: 77.2150, address: "Main Market" },
      reportedBy: "demo-citizen",
      assignedTo: null,
      status: "NEW",
      priority: "MEDIUM",
      priorityScore: 35,
      upvotes: 7,
      upvotedBy: [],
      resolutionNote: "",
      resolvedAt: null,
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      _id: randomUUID(),
      issueCode: "CC-1003",
      title: "Broken streetlight near Park Street",
      description: "The streetlight has not been working for several nights.",
      category: "streetlight",
      department: "Electricity",
      imageUrl: "",
      location: { latitude: 28.6260, longitude: 77.2180, address: "Park Street" },
      reportedBy: "demo-citizen",
      assignedTo: "demo-officer",
      status: "RESOLVED",
      priority: "MEDIUM",
      priorityScore: 28,
      upvotes: 4,
      upvotedBy: [],
      resolutionNote: "Streetlight repaired and tested.",
      resolvedAt: new Date(Date.now() - 3600000).toISOString(),
      createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  demo.history = demo.issues.flatMap(issue => [
    { _id: randomUUID(), issueId: issue._id, status: "NEW", changedBy: "demo-citizen", remarks: "Issue reported", createdAt: issue.createdAt },
    ...(issue.status !== "NEW" ? [{ _id: randomUUID(), issueId: issue._id, status: issue.status === "RESOLVED" ? "IN_PROGRESS" : issue.status, changedBy: "demo-officer", remarks: "Officer started work", createdAt: new Date().toISOString() }] : []),
    ...(issue.status === "RESOLVED" ? [{ _id: randomUUID(), issueId: issue._id, status: "RESOLVED", changedBy: "demo-officer", remarks: issue.resolutionNote, createdAt: issue.resolvedAt }] : [])
  ]);
}

export function getDemoUser(id) {
  return demo.users.find(user => user._id === id);
}

export function publicUser(user) {
  if (!user) return null;
  return { _id: user._id, name: user.name, email: user.email, role: user.role };
}
