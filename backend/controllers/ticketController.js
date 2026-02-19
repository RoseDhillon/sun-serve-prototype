const ServiceTicket = require("../models/ServiceTicket")

// @desc    Create new service ticket
// @route   POST /api/tickets
// @access  Private
exports.createTicket = async (req, res, next) => {
  try {
    // Add creator from authenticated user
    req.body.createdBy = req.user.id

    const ticket = await ServiceTicket.create(req.body)

    res.status(201).json({
      success: true,
      message: "Service ticket created successfully",
      data: ticket,
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Get all service tickets
// @route   GET /api/tickets
// @access  Private
exports.getTickets = async (req, res, next) => {
  try {
    let query

    // If user is customer, only show their tickets
    if (req.user.role === "customer") {
      query = ServiceTicket.find({ createdBy: req.user.id })
    }
    // If user is technician, show assigned tickets
    else if (req.user.role === "technician") {
      query = ServiceTicket.find({ assignedTo: req.user.id })
    }
    // Admin and Manager see all
    else {
      query = ServiceTicket.find()
    }

    const tickets = await query
      .populate("createdBy", "name email")
      .populate("assignedTo", "name email")
      .populate("relatedInstallation", "address")
      .populate("relatedMaintenance", "description")
      .sort("-createdAt")

    res.status(200).json({
      success: true,
      count: tickets.length,
      data: tickets,
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Get single service ticket
// @route   GET /api/tickets/:id
// @access  Private
exports.getTicket = async (req, res, next) => {
  try {
    const ticket = await ServiceTicket.findById(req.params.id)
      .populate("createdBy", "name email phone")
      .populate("assignedTo", "name email phone")
      .populate("relatedInstallation")
      .populate("relatedMaintenance")

    if (!ticket) {
      return res.status(404).json({
        success: false,
        error: "Service ticket not found",
      })
    }

    res.status(200).json({
      success: true,
      data: ticket,
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Update service ticket
// @route   PUT /api/tickets/:id
// @access  Private
exports.updateTicket = async (req, res, next) => {
  try {
    let ticket = await ServiceTicket.findById(req.params.id)

    if (!ticket) {
      return res.status(404).json({
        success: false,
        error: "Service ticket not found",
      })
    }

    // If ticket is being closed, set closedAt
    if (req.body.status === "closed" && ticket.status !== "closed") {
      req.body.closedAt = Date.now()
    }

    ticket = await ServiceTicket.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })

    res.status(200).json({
      success: true,
      message: "Service ticket updated successfully",
      data: ticket,
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Delete service ticket
// @route   DELETE /api/tickets/:id
// @access  Private (Admin only)
exports.deleteTicket = async (req, res, next) => {
  try {
    const ticket = await ServiceTicket.findById(req.params.id)

    if (!ticket) {
      return res.status(404).json({
        success: false,
        error: "Service ticket not found",
      })
    }

    await ticket.deleteOne()

    res.status(200).json({
      success: true,
      message: "Service ticket deleted successfully",
      data: {},
    })
  } catch (error) {
    next(error)
  }
}
