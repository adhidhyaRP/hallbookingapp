import express from "express"
const app = express();
const port = 3000;

app.use(express.json());

let rooms = [];
let bookings = [];
let customers = [];


app.post('/rooms', (req, res) => {
  const { name, seats, amenities, pricePerHour } = req.body;
  const roomId = rooms.length + 1;
  const newRoom = { roomId, name, seats, amenities, pricePerHour, bookings: [] };
  rooms.push(newRoom);
  res.status(201).json(newRoom);
});


app.post('/bookings', (req, res) => {
  const { customerName, date, startTime, endTime, roomId } = req.body;

 
  const room = rooms.find(room => room.roomId === roomId);
  if (!room) {
    return res.status(404).json({ error: 'Room not found' });
  }

  const isBooked = room.bookings.some(
    booking => booking.date === date &&
               ((startTime >= booking.startTime && startTime < booking.endTime) ||
                (endTime > booking.startTime && endTime <= booking.endTime))
  );

  if (isBooked) {
    return res.status(400).json({ error: 'Room is already booked for the specified time' });
  }

  const bookingId = bookings.length + 1;
  const newBooking = { bookingId, customerName, date, startTime, endTime, roomId, bookingDate: new Date(), status: 'Booked' };
  bookings.push(newBooking);
  room.bookings.push(newBooking);

 
  if (!customers.some(customer => customer.name === customerName)) {
    customers.push({ name: customerName, bookings: [newBooking] });
  } else {
    const customer = customers.find(customer => customer.name === customerName);
    customer.bookings.push(newBooking);
  }

  res.status(201).json(newBooking);
});


app.get('/rooms', (req, res) => {
  const roomsWithBookings = rooms.map(room => ({
    name: room.name,
    bookings: room.bookings.map(booking => ({
      customerName: booking.customerName,
      date: booking.date,
      startTime: booking.startTime,
      endTime: booking.endTime
    }))
  }));
  res.json(roomsWithBookings);
});


app.get('/customers', (req, res) => {
  const customersWithBookings = customers.map(customer => ({
    name: customer.name,
    bookings: customer.bookings.map(booking => ({
      roomName: rooms.find(room => room.roomId === booking.roomId).name,
      date: booking.date,
      startTime: booking.startTime,
      endTime: booking.endTime
    }))
  }));
  res.json(customersWithBookings);
});


app.get('/customer-bookings/:customerName', (req, res) => {
  const { customerName } = req.params;
  const customer = customers.find(customer => customer.name === customerName);

  if (!customer) {
    return res.status(404).json({ error: 'Customer not found' });
  }

  const customerBookings = customer.bookings.map(booking => ({
    roomName: rooms.find(room => room.roomId === booking.roomId).name,
    date: booking.date,
    startTime: booking.startTime,
    endTime: booking.endTime,
    bookingId: booking.bookingId,
    bookingDate: booking.bookingDate,
    status: booking.status
  }));

  res.json(customerBookings);
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
