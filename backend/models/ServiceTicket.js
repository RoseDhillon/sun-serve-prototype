const mongoose = require("mongoose")
const { TICKET_STATUS, TICKET_PRIORITY } = require("../utils/constants")

const ServiceTicketSchema = new mongoose.Schema({
  ticketNumber: {
    type: String,
    unique: true,
  },
  title: {
    type: String,
    required: [true, "Please add a ticket title"],
    maxlength: [200, "Title cannot exceed 200 characters"],
  },
  description: {
    type: String,
    required: [true, "Please add a description"],
    maxlength: [2000, "Description cannot exceed 2000 characters"],
  },
  category: {
    type: String,
    required: [true, "Please specify a category"],
    enum: ["technical", "billing", "general", "emergency", "warranty"],
  },
  priority: {
    type: String,
    enum: Object.values(TICKET_PRIORITY),
    default: TICKET_PRIORITY.MEDIUM,
  },
  status: {
    type: String,
    enum: Object.values(TICKET_STATUS),
    default: TICKET_STATUS.OPEN,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "Please specify ticket creator"],
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  relatedInstallation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Installation",
  },
  relatedMaintenance: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "MaintenanceRequest",
  },
  resolution: {
    type: String,
    maxlength: [2000, "Resolution cannot exceed 2000 characters"],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  closedAt: {
    type: Date,
  },
})

// Auto-generate ticket number before saving
ServiceTicketSchema.pre("save", async function () {
  if (!this.ticketNumber) {
    const count = await mongoose.model("ServiceTicket").countDocuments()
    this.ticketNumber = `TICKET-${String(count + 1).padStart(6, "0")}`
  }
})

// Update the updatedAt timestamp on save
ServiceTicketSchema.pre("save", function () {
  this.updatedAt = Date.now()
})

// Create indexes
ServiceTicketSchema.index({ createdBy: 1, status: 1 })
ServiceTicketSchema.index({ assignedTo: 1, status: 1 })
ServiceTicketSchema.index({ ticketNumber: 1 })

module.exports = mongoose.model("ServiceTicket", ServiceTicketSchema)
