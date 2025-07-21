# Schedula Backend API Documentation

---

## User

### POST /user/register

- **Description:** Register a new user (base account, no role assigned yet).
- **Auth:** No
- **Request Body:**
  ```json
  {
    "email": "user@example.com",
    "password": "yourpassword",
    "name": "User Name",
    "gender": "male",
    "dob": "1990-01-01",
    "phone": "1234567890",
    "address": "123 Main St"
  }
  ```
- **Response:**
  ```json
  {
    "message": "User registered successfully",
    "user": { ... }
  }
  ```

---

## Authentication

### POST /auth/login

- **Description:** Login with email and password (user).
- **Auth:** No
- **Request Body:**
  ```json
  {
    "email": "user@example.com",
    "password": "yourpassword"
  }
  ```
- **Response:**
  ```json
  {
    "access_token": "JWT_TOKEN",
    "user": { ... }
  }
  ```

---

### GET /auth/google

- **Description:** Start Google OAuth login. Redirects the user to Google’s login/consent screen.
- **Auth:** No
- **How to use:**
  - Frontend or browser navigates to this endpoint to start Google login.
- **Response:**
  - Redirects to Google login page.

---

### GET /auth/google/redirect

- **Description:** Google redirects back to this endpoint after login. Backend processes the user info and issues a JWT.
- **Auth:** No
- **Response:**
  ```json
  {
    "access_token": "JWT_TOKEN",
    "user": { ... }
  }
  ```

---

### GET /auth/profile

- **Description:** Get the current authenticated user's profile and roles.
- **Auth:** Yes (JWT)
- **Headers:**  
  `Authorization: Bearer <JWT_TOKEN>`
- **Response:**
  ```json
  {
    "userId": 1,
    "email": "user@example.com",
    "roles": ["user", "doctor"]
  }
  ```

---

## Doctor

### POST /doctor/register

- **Description:** Register as a doctor (must already have a user account).
- **Auth:** Yes (JWT, user)
- **Request Body:**
  ```json
  {
    "specialization": "Cardiology",
    "years_of_experience": "10",
    "profile_pic": "url",
    "bio": "Doctor bio"
  }
  ```
- **Response:**
  ```json
  {
    "message": "Doctor registered successfully",
    "doctor": { ... }
  }
  ```

---

### GET /doctor

- **Description:** List all doctors, optionally filter by specialization. Returns user and doctor details for each doctor.
- **Auth:** Yes (JWT)
- **Query Params:**  
  `specialization` (optional)
- **Response:**
  ```json
  [
    {
      "userId": 1,
      "user": { ... },
      "doctor": { ... }
    }
  ]
  ```

---

### GET /doctor/:userId

- **Description:** Get doctor profile and availability by userId. Returns user and doctor details.
- **Auth:** Yes (JWT)
- **Response:**
  ```json
  {
    "userId": 1,
    "user": { ... },
    "doctor": { ... }
  }
  ```

---

### POST /doctor/availability

- **Description:** Doctor sets a new available slot.
- **Auth:** Yes (JWT, doctor)
- **Request Body:**
  ```json
  {
    "dayOfWeek": "Monday",
    "startTime": "09:00",
    "endTime": "12:00"
  }
  ```
- **Response:**
  ```json
  {
    "message": "Availability slot created successfully",
    "availability": { ... }
  }
  ```

---

### PATCH /doctor/availability/:id

- **Description:** Doctor updates an available slot.
- **Auth:** Yes (JWT, doctor)
- **Request Body:** (any subset of fields)
  ```json
  {
    "dayOfWeek": "Tuesday",
    "startTime": "10:00",
    "endTime": "13:00"
  }
  ```
- **Response:**
  ```json
  {
    "message": "Availability slot updated successfully",
    "availability": { ... }
  }
  ```

---

### DELETE /doctor/availability/:id

- **Description:** Doctor deletes an available slot.
- **Auth:** Yes (JWT, doctor)
- **Response:**
  ```json
  {
    "message": "Availability slot deleted successfully"
  }
  ```

---

### GET /doctor/:userId/availability

- **Description:** Get all available slots for a doctor by userId.
- **Auth:** No
- **Response:**
  ```json
  [
    {
      "availabilityId": 1,
      "dayOfWeek": "Monday",
      "startTime": "09:00",
      "endTime": "12:00",
      "isAvailable": true
    }
  ]
  ```

---

### POST /doctor/slot

- **Description:** Doctor creates a new slot (date, start time, end time, patients per slot).
- **Auth:** Yes (JWT, doctor)
- **Request Body:**
  ```json
  {
    "date": "2024-07-10",
    "startTime": "10:00",
    "endTime": "10:30",
    "patientsPerSlot": 3
  }
  ```
- **Response:**
  ```json
  {
    "message": "Slot created successfully",
    "slot": { ... }
  }
  ```

---

### PATCH /doctor/slot/:id

- **Description:** Doctor updates a slot.
- **Auth:** Yes (JWT, doctor)
- **Request Body:** (any subset of fields)
  ```json
  {
    "startTime": "11:00",
    "endTime": "11:30"
  }
  ```
- **Response:**
  ```json
  {
    "message": "Slot updated successfully",
    "slot": { ... }
  }
  ```

---

### DELETE /doctor/slot/:id

- **Description:** Doctor deletes a slot.
- **Auth:** Yes (JWT, doctor)
- **Response:**
  ```json
  {
    "message": "Slot deleted successfully"
  }
  ```

---

### GET /doctor/:userId/slots

- **Description:** Get all available slots for a doctor (only slots that are not fully booked).
- **Auth:** No
- **Response:**
  ```json
  {
    "message": "Available slots fetched successfully",
    "slots": [ { ...slot meta... } ]
  }
  ```

---

## Patient

### POST /patient/details

- **Description:** Add or update patient details (for the current user).
- **Auth:** Yes (JWT, user)
- **Request Body:**
  ```json
  {
    "medical_history": "Diabetes",
    "allergies": "Penicillin",
    "notes": "Some notes"
  }
  ```
- **Response:**
  ```json
  {
    "message": "Patient details saved successfully",
    "patient": { ... }
  }
  ```

---

### PATCH /patient/details

- **Description:** Update patient details (for the current user).
- **Auth:** Yes (JWT, user)
- **Request Body:** (any subset of fields)
  ```json
  {
    "medical_history": "Updated history"
  }
  ```
- **Response:**
  ```json
  {
    "message": "Patient details updated successfully",
    "patient": { ... }
  }
  ```

---

### GET /patient/details

- **Description:** Get patient details for the current user. Returns user and patient details.
- **Auth:** Yes (JWT, user)
- **Response:**
  ```json
  {
    "userId": 1,
    "user": { ... },
    "patient": { ... }
  }
  ```

---

### GET /patient

- **Description:** Get all patients. Returns user and patient details for each patient.
- **Auth:** Yes (JWT)
- **Response:**
  ```json
  [
    {
      "userId": 2,
      "user": { ... },
      "patient": { ... }
    }
  ]
  ```

---

## Appointment

### POST /appointment

- **Description:** Book an appointment for a specific slot.
- **Auth:** Yes (JWT, user)
- **Request Body:**
  ```json
  {
    "slotId": 1
  }
  ```
- **Response:**
  ```json
  {
    "message": "Appointment booked successfully",
    "appointment": { ... }
  }
  ```

---

### PATCH /appointment/:id/reschedule

- **Description:** Reschedule an appointment to a new slot.
- **Auth:** Yes (JWT, user)
- **Request Body:**
  ```json
  {
    "newSlotId": 2
  }
  ```
- **Response:**
  ```json
  {
    "message": "Appointment rescheduled successfully",
    "appointment": { ... }
  }
  ```

---

### PATCH /appointment/reschedule-all

- **Description:** Doctor shifts all future appointments by a given number of minutes (prepone/postpone).
- **Auth:** Yes (JWT, doctor)
- **Request Body:**
  ```json
  {
    "shift_minutes": 30
  }
  ```
- **Response:**
  ```json
  {
    "message": "All future appointments rescheduled",
    "result": { "count": 5 }
  }
  ```

---

### PATCH /appointment/reschedule-selected

- **Description:** Doctor shifts selected appointments by a given number of minutes (prepone/postpone).
- **Auth:** Yes (JWT, doctor)
- **Request Body:**
  ```json
  {
    "appointment_ids": [1, 2, 3],
    "shift_minutes": -15
  }
  ```
- **Response:**
  ```json
  {
    "message": "Selected appointments rescheduled",
    "result": { "count": 3 }
  }
  ```

---

### GET /appointment

- **Description:** Get all appointments for the current user.
- **Auth:** Yes (JWT, user)
- **Response:**
  ```json
  [ { ...appointment... } ]
  ```

---

### DELETE /appointment/:id

- **Description:** Cancel an appointment.
- **Auth:** Yes (JWT, user)
- **Response:**
  ```json
  {
    "message": "Appointment cancelled successfully"
  }
  ```

---

## General Notes

- All endpoints that require authentication expect a JWT token in the `Authorization` header.
- All time fields are in 24-hour format (`HH:mm`).
- All date fields are in `YYYY-MM-DD` format.
- Error responses follow standard NestJS error format.
