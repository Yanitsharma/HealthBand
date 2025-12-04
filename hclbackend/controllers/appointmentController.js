import Doctor from "../models/Doctor.js";
import Appointment from "../models/Appointment.js";
import TimeSlot from "../models/TimeSlot.js";

// @desc    Get list of doctors
// @route   GET /api/appointments/doctors
// @access  Private
export const getDoctors = async (req, res) => {
  try {
    const { specialty, search, available } = req.query;

    // Build query
    let query = {};

    if (specialty) {
      query.specialty = { $regex: specialty, $options: "i" };
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { specialty: { $regex: search, $options: "i" } },
      ];
    }

    if (available === "true") {
      query.isAvailable = true;
    }

    const doctors = await Doctor.find(query).sort({ rating: -1 });

    // Format response
    const formattedDoctors = doctors.map((doc) => ({
      id: doc._id,
      name: doc.name,
      specialty: doc.specialty,
      experience: doc.experience,
      rating: doc.rating,
      totalReviews: doc.totalReviews,
      image: doc.image,
      fees: doc.fees,
      currency: doc.currency,
      qualifications: doc.qualifications,
      languages: doc.languages,
      about: doc.about,
    }));

    res.status(200).json({
      success: true,
      count: formattedDoctors.length,
      data: formattedDoctors,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get doctor availability
// @route   GET /api/appointments/doctors/:doctorId/availability
// @access  Private
export const getDoctorAvailability = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({
        success: false,
        message: "Date parameter is required",
      });
    }

    // Validate date is not in the past
    const selectedDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      return res.status(400).json({
        success: false,
        message: "Cannot book appointments in the past",
        error: {
          code: "INVALID_DATE",
          details: "Selected date is in the past",
        },
      });
    }

    // Check if doctor exists
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    if (!doctor.isAvailable) {
      return res.status(400).json({
        success: false,
        message: "Doctor is not available for appointments",
        error: {
          code: "DOCTOR_NOT_AVAILABLE",
          details: "This doctor is currently not accepting appointments",
        },
      });
    }

    // Get or create time slots for this date
    let timeSlots = await TimeSlot.find({
      doctorId,
      date: {
        $gte: new Date(date),
        $lt: new Date(new Date(date).setDate(new Date(date).getDate() + 1)),
      },
    });

    // If no slots exist, create default slots
    if (timeSlots.length === 0) {
      const defaultTimes = [
        "09:00 AM",
        "09:30 AM",
        "10:00 AM",
        "10:30 AM",
        "11:00 AM",
        "11:30 AM",
        "02:00 PM",
        "02:30 PM",
        "03:00 PM",
        "03:30 PM",
        "04:00 PM",
        "04:30 PM",
        "05:00 PM",
      ];

      const slotsToCreate = defaultTimes.map((time, index) => ({
        doctorId,
        date: new Date(date),
        time,
        slotId: `${doctorId}_${date}_${index}`,
        isBooked: false,
      }));

      timeSlots = await TimeSlot.insertMany(slotsToCreate);
    }

    // Format available slots
    const availableSlots = timeSlots.map((slot) => ({
      time: slot.time,
      slotId: slot.slotId,
      available: !slot.isBooked,
    }));

    res.status(200).json({
      success: true,
      data: {
        doctorId: doctor._id,
        doctorName: doctor.name,
        date,
        availableSlots,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Book an appointment
// @route   POST /api/appointments/book
// @access  Private
export const bookAppointment = async (req, res) => {
  try {
    const userId = req.user.id;
    const { doctorId, date, time, slotId, reason, patientNotes } = req.body;

    // Validation
    if (!doctorId || !date || !time || !slotId || !reason) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields",
      });
    }

    // Check if doctor exists
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    // Check if time slot is available
    const timeSlot = await TimeSlot.findOne({ slotId });
    if (!timeSlot) {
      return res.status(404).json({
        success: false,
        message: "Time slot not found",
      });
    }

    if (timeSlot.isBooked) {
      return res.status(400).json({
        success: false,
        message: "This time slot has been booked by another patient",
        error: {
          code: "SLOT_NOT_AVAILABLE",
          details: "Please select another time slot",
        },
      });
    }

    // Check if patient already has appointment with this doctor on same date
    const existingAppointment = await Appointment.findOne({
      patientId: userId,
      doctorId,
      date: {
        $gte: new Date(date),
        $lt: new Date(new Date(date).setDate(new Date(date).getDate() + 1)),
      },
      status: { $in: ["confirmed", "rescheduled"] },
    });

    if (existingAppointment) {
      return res.status(400).json({
        success: false,
        message: "You already have an appointment with this doctor on this date",
        error: {
          code: "ALREADY_BOOKED",
          details: "Please choose a different date or cancel existing appointment",
        },
      });
    }

    // Create appointment
    const appointment = await Appointment.create({
      patientId: userId,
      doctorId,
      date: new Date(date),
      time,
      slotId,
      reason,
      patientNotes,
      fees: doctor.fees,
      currency: doctor.currency,
      location: `Clinic Room ${Math.floor(Math.random() * 10) + 1}, 2nd Floor`,
    });

    // Mark time slot as booked
    timeSlot.isBooked = true;
    timeSlot.bookedBy = userId;
    timeSlot.appointmentId = appointment._id;
    await timeSlot.save();

    // Populate data for response
    await appointment.populate("patientId", "name username email");

    res.status(201).json({
      success: true,
      message: "Appointment booked successfully",
      data: {
        appointmentId: appointment._id,
        patientId: appointment.patientId._id,
        patientName: appointment.patientId.name,
        doctorId: doctor._id,
        doctorName: doctor.name,
        specialty: doctor.specialty,
        date: appointment.date,
        time: appointment.time,
        reason: appointment.reason,
        status: appointment.status,
        fees: appointment.fees,
        currency: appointment.currency,
        bookingDate: appointment.bookingDate,
        appointmentLocation: appointment.location,
        instructions: appointment.instructions,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get patient appointments
// @route   GET /api/appointments/my-appointments
// @access  Private
export const getMyAppointments = async (req, res) => {
  try {
    const userId = req.user.id;
    const { status, fromDate, toDate } = req.query;

    // Build query
    let query = { patientId: userId };

    if (status) {
      if (status === "upcoming") {
        query.status = { $in: ["confirmed", "rescheduled"] };
        query.date = { $gte: new Date() };
      } else if (status === "completed") {
        query.status = "completed";
      } else if (status === "cancelled") {
        query.status = "cancelled";
      }
    }

    if (fromDate && toDate) {
      query.date = {
        $gte: new Date(fromDate),
        $lte: new Date(toDate),
      };
    }

    const appointments = await Appointment.find(query)
      .populate("doctorId")
      .sort({ date: 1, time: 1 });

    // Separate upcoming and past appointments
    const now = new Date();
    const upcoming = [];
    const past = [];

    appointments.forEach((appt) => {
      const apptDate = new Date(appt.date);
      const formattedAppt = {
        appointmentId: appt._id,
        doctorName: appt.doctorId.name,
        doctorImage: appt.doctorId.image,
        specialty: appt.doctorId.specialty,
        date: appt.date,
        time: appt.time,
        reason: appt.reason,
        status: appt.status,
        fees: appt.fees,
        currency: appt.currency,
        location: appt.location,
      };

      if (apptDate >= now && appt.status !== "completed") {
        formattedAppt.canCancel = true;
        formattedAppt.canReschedule = true;
        upcoming.push(formattedAppt);
      } else {
        if (appt.status === "completed") {
          formattedAppt.canReview = true;
        }
        past.push(formattedAppt);
      }
    });

    res.status(200).json({
      success: true,
      data: {
        upcoming,
        past,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get appointment details
// @route   GET /api/appointments/:appointmentId
// @access  Private
export const getAppointmentDetails = async (req, res) => {
  try {
    const userId = req.user.id;
    const { appointmentId } = req.params;

    const appointment = await Appointment.findOne({
      _id: appointmentId,
      patientId: userId,
    })
      .populate("patientId", "name username email")
      .populate("doctorId");

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
        error: {
          code: "APPOINTMENT_NOT_FOUND",
          details: "The appointment does not exist or you don't have access to it",
        },
      });
    }

    const doctor = appointment.doctorId;
    const patient = appointment.patientId;

    res.status(200).json({
      success: true,
      data: {
        appointmentId: appointment._id,
        patient: {
          id: patient._id,
          name: patient.name,
          username: patient.username,
          email: patient.email,
        },
        doctor: {
          id: doctor._id,
          name: doctor.name,
          specialty: doctor.specialty,
          image: doctor.image,
          phone: doctor.phone,
          email: doctor.email,
        },
        date: appointment.date,
        time: appointment.time,
        duration: appointment.duration,
        reason: appointment.reason,
        patientNotes: appointment.patientNotes,
        status: appointment.status,
        fees: appointment.fees,
        currency: appointment.currency,
        paymentStatus: appointment.paymentStatus,
        location: appointment.location,
        address: doctor.address,
        instructions: appointment.instructions,
        bookingDate: appointment.bookingDate,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Cancel appointment
// @route   PUT /api/appointments/:appointmentId/cancel
// @access  Private
export const cancelAppointment = async (req, res) => {
  try {
    const userId = req.user.id;
    const { appointmentId } = req.params;
    const { cancellationReason } = req.body;

    const appointment = await Appointment.findOne({
      _id: appointmentId,
      patientId: userId,
    });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
        error: {
          code: "APPOINTMENT_NOT_FOUND",
        },
      });
    }

    if (appointment.status === "cancelled") {
      return res.status(400).json({
        success: false,
        message: "Appointment is already cancelled",
      });
    }

    if (appointment.status === "completed") {
      return res.status(400).json({
        success: false,
        message: "Cannot cancel completed appointment",
        error: {
          code: "CANNOT_CANCEL",
          details: "This appointment has already been completed",
        },
      });
    }

    // Check if appointment is too close (less than 1 hour)
    const appointmentDateTime = new Date(appointment.date);
    const now = new Date();
    const hoursDiff = (appointmentDateTime - now) / (1000 * 60 * 60);

    if (hoursDiff < 1 && hoursDiff > 0) {
      return res.status(400).json({
        success: false,
        message: "Cannot cancel appointment less than 1 hour before scheduled time",
        error: {
          code: "CANNOT_CANCEL",
          details: "Please contact clinic directly for last-minute cancellations",
        },
      });
    }

    // Update appointment
    appointment.status = "cancelled";
    appointment.cancellationReason = cancellationReason;
    appointment.refundAmount = appointment.fees;
    appointment.refundStatus = "processing";
    appointment.paymentStatus = "refunded";
    await appointment.save();

    // Free up the time slot
    await TimeSlot.updateOne(
      { slotId: appointment.slotId },
      {
        isBooked: false,
        $unset: { bookedBy: "", appointmentId: "" },
      }
    );

    res.status(200).json({
      success: true,
      message: "Appointment cancelled successfully",
      data: {
        appointmentId: appointment._id,
        status: appointment.status,
        refundAmount: appointment.refundAmount,
        refundStatus: appointment.refundStatus,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Reschedule appointment
// @route   PUT /api/appointments/:appointmentId/reschedule
// @access  Private
export const rescheduleAppointment = async (req, res) => {
  try {
    const userId = req.user.id;
    const { appointmentId } = req.params;
    const { newDate, newTime, newSlotId } = req.body;

    if (!newDate || !newTime || !newSlotId) {
      return res.status(400).json({
        success: false,
        message: "Please provide new date, time, and slot ID",
      });
    }

    const appointment = await Appointment.findOne({
      _id: appointmentId,
      patientId: userId,
    });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
        error: {
          code: "APPOINTMENT_NOT_FOUND",
        },
      });
    }

    if (appointment.status === "cancelled") {
      return res.status(400).json({
        success: false,
        message: "Cannot reschedule cancelled appointment",
      });
    }

    if (appointment.status === "completed") {
      return res.status(400).json({
        success: false,
        message: "Cannot reschedule completed appointment",
      });
    }

    // Check if new time slot is available
    const newTimeSlot = await TimeSlot.findOne({ slotId: newSlotId });
    if (!newTimeSlot) {
      return res.status(404).json({
        success: false,
        message: "New time slot not found",
      });
    }

    if (newTimeSlot.isBooked) {
      return res.status(400).json({
        success: false,
        message: "Selected time slot is not available",
        error: {
          code: "SLOT_NOT_AVAILABLE",
          details: "Please select another time slot",
        },
      });
    }

    // Store old appointment details
    const oldDate = appointment.date;
    const oldTime = appointment.time;
    const oldSlotId = appointment.slotId;

    // Update appointment
    appointment.previousAppointments.push({
      date: oldDate,
      time: oldTime,
      modifiedAt: new Date(),
    });
    appointment.date = new Date(newDate);
    appointment.time = newTime;
    appointment.slotId = newSlotId;
    appointment.status = "rescheduled";
    await appointment.save();

    // Free up old time slot
    await TimeSlot.updateOne(
      { slotId: oldSlotId },
      {
        isBooked: false,
        $unset: { bookedBy: "", appointmentId: "" },
      }
    );

    // Book new time slot
    newTimeSlot.isBooked = true;
    newTimeSlot.bookedBy = userId;
    newTimeSlot.appointmentId = appointment._id;
    await newTimeSlot.save();

    res.status(200).json({
      success: true,
      message: "Appointment rescheduled successfully",
      data: {
        appointmentId: appointment._id,
        oldDate,
        oldTime,
        newDate: appointment.date,
        newTime: appointment.time,
        status: appointment.status,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

