import Booking from "../models/Booking.js"
import Car from "../models/Car.js";


// Function to Check Availability of Car for a given Date
const checkAvailability = async (car, pickupDate, returnDate)=>{
    const bookings = await Booking.find({
        car,
        status: { $ne: "cancelled" },
        pickupDate: {$lte: returnDate},
        returnDate: {$gte: pickupDate},
    })
    return bookings.length === 0;
}

// API to Check Availability of Cars for the given Date and location
export const checkAvailabilityOfCar = async (req, res)=>{
    try {
        const {location, pickupDate, returnDate} = req.body

        if(!location || !pickupDate || !returnDate){
            return res.json({success: false, message: "Location, pickup date and return date are required"})
        }

        const picked = new Date(pickupDate);
        const returned = new Date(returnDate);

        if(isNaN(picked) || isNaN(returned) || returned < picked){
            return res.json({success: false, message: "Invalid date range"})
        }

        // fetch all available cars for the given location
        const cars = await Car.find({location, isAvaliable: true})

        // check car availability for the given date range using promise
        const availableCarsPromises = cars.map(async (car)=>{
           const isAvailable = await checkAvailability(car._id, pickupDate, returnDate)
           return {...car._doc, isAvailable: isAvailable}
        })

        let availableCars = await Promise.all(availableCarsPromises);
        availableCars = availableCars.filter(car => car.isAvailable === true)

        res.json({success: true, availableCars})

    } catch (error) {
        console.log(error.message);
        res.json({success: false, message: error.message})
    }
}

// API to Create Booking
export const createBooking = async (req, res)=>{
    try {
        const {_id} = req.user;
        const {car, pickupDate, returnDate} = req.body;

        if(!car || !pickupDate || !returnDate){
            return res.json({success: false, message: "Car, pickup date and return date are required"})
        }

        const picked = new Date(pickupDate);
        const returned = new Date(returnDate);

        if(isNaN(picked) || isNaN(returned)){
            return res.json({success: false, message: "Invalid dates"})
        }

        if(returned < picked){
            return res.json({success: false, message: "Return date must be on or after pickup date"})
        }

        const carData = await Car.findById(car)
        if(!carData || !carData.owner || !carData.isAvaliable){
            return res.json({success: false, message: "Car is not available"})
        }

        const isAvailable = await checkAvailability(car, pickupDate, returnDate)
        if(!isAvailable){
            return res.json({success: false, message: "Car is not available"})
        }

        // Inclusive day count so same-day bookings charge at least 1 day
        const noOfDays = Math.max(1, Math.ceil((returned - picked) / (1000 * 60 * 60 * 24)) || 1)
        const price = carData.pricePerDay * noOfDays;

        await Booking.create({car, owner: carData.owner, user: _id, pickupDate, returnDate, price})

        res.json({success: true, message: "Booking Created"})

    } catch (error) {
        console.log(error.message);
        res.json({success: false, message: error.message})
    }
}

// API to List User Bookings 
export const getUserBookings = async (req, res)=>{
    try {
        const {_id} = req.user;
        const bookings = await Booking.find({ user: _id }).populate("car").sort({createdAt: -1})
        res.json({success: true, bookings})

    } catch (error) {
        console.log(error.message);
        res.json({success: false, message: error.message})
    }
}

// API to get Owner Bookings

export const getOwnerBookings = async (req, res)=>{
    try {
        if(req.user.role !== 'owner'){
            return res.json({ success: false, message: "Unauthorized" })
        }
        const bookings = await Booking.find({owner: req.user._id})
            .populate('car')
            .populate({ path: 'user', select: '-password' })
            .sort({createdAt: -1 })
        res.json({success: true, bookings})
    } catch (error) {
        console.log(error.message);
        res.json({success: false, message: error.message})
    }
}

// API to change booking status
export const changeBookingStatus = async (req, res)=>{
    try {
        const {_id} = req.user;
        const {bookingId, status} = req.body
        const allowedStatuses = ['pending', 'confirmed', 'cancelled']

        if(!allowedStatuses.includes(status)){
            return res.json({ success: false, message: "Invalid status"})
        }

        const booking = await Booking.findById(bookingId)
        if(!booking){
            return res.json({ success: false, message: "Booking not found"})
        }

        if(booking.owner.toString() !== _id.toString()){
            return res.json({ success: false, message: "Unauthorized"})
        }

        booking.status = status;
        await booking.save();

        res.json({ success: true, message: "Status Updated"})
    } catch (error) {
        console.log(error.message);
        res.json({success: false, message: error.message})
    }
}
