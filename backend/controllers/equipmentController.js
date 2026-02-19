const Equipment = require("../models/Equipment")

// @desc    Create new equipment
// @route   POST /api/equipment
// @access  Private (Admin/Manager)
exports.createEquipment = async (req, res, next) => {
  try {
    const equipment = await Equipment.create(req.body)

    res.status(201).json({
      success: true,
      message: "Equipment added successfully",
      data: equipment,
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Get all equipment
// @route   GET /api/equipment
// @access  Private
exports.getEquipment = async (req, res, next) => {
  try {
    const { category, isActive } = req.query

    let query = {}

    if (category) {
      query.category = category
    }

    if (isActive !== undefined) {
      query.isActive = isActive === "true"
    }

    const equipment = await Equipment.find(query).sort("name")

    res.status(200).json({
      success: true,
      count: equipment.length,
      data: equipment,
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Get single equipment item
// @route   GET /api/equipment/:id
// @access  Private
exports.getEquipmentItem = async (req, res, next) => {
  try {
    const equipment = await Equipment.findById(req.params.id)

    if (!equipment) {
      return res.status(404).json({
        success: false,
        error: "Equipment not found",
      })
    }

    res.status(200).json({
      success: true,
      data: equipment,
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Update equipment
// @route   PUT /api/equipment/:id
// @access  Private (Admin/Manager)
exports.updateEquipment = async (req, res, next) => {
  try {
    let equipment = await Equipment.findById(req.params.id)

    if (!equipment) {
      return res.status(404).json({
        success: false,
        error: "Equipment not found",
      })
    }

    // If restocking, update lastRestocked date
    if (req.body.quantity && req.body.quantity > equipment.quantity) {
      req.body.lastRestocked = Date.now()
    }

    equipment = await Equipment.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })

    res.status(200).json({
      success: true,
      message: "Equipment updated successfully",
      data: equipment,
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Delete equipment
// @route   DELETE /api/equipment/:id
// @access  Private (Admin only)
exports.deleteEquipment = async (req, res, next) => {
  try {
    const equipment = await Equipment.findById(req.params.id)

    if (!equipment) {
      return res.status(404).json({
        success: false,
        error: "Equipment not found",
      })
    }

    await equipment.deleteOne()

    res.status(200).json({
      success: true,
      message: "Equipment deleted successfully",
      data: {},
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Get low stock equipment
// @route   GET /api/equipment/lowstock
// @access  Private (Admin/Manager)
exports.getLowStockEquipment = async (req, res, next) => {
  try {
    const equipment = await Equipment.find({
      $expr: { $lte: ["$quantity", "$minimumStock"] },
      isActive: true,
    })

    res.status(200).json({
      success: true,
      count: equipment.length,
      data: equipment,
    })
  } catch (error) {
    next(error)
  }
}
