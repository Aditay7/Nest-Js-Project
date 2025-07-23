# API Documentation

## User APIs

### Register User

- **POST** `/user/register`
- **Request Body:**

```
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "gender": "male",
  "dob": "1990-01-01",
  "phone": "1234567890",
  "address": "123 Main St"
}
```

- **Response:**

```
{
  "message": "User registered successfully",
  "user": {
    "userId": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "gender": "male",
    "dob": "1990-01-01",
    "phone": "1234567890",
    "address": "123 Main St",
    "role": "user",
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

---

## Auth APIs

### Login

- **POST** `/auth/login`
- **Request Body:**

```
{
  "email": "john@example.com",
  "password": "password123"
}
```

- **Response:**

```
{
  "message": "User login successful",
  "access_token": "<JWT_TOKEN>",
  "user": {
    "userId": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user"
  }
}
```

---

## Patient APIs

### Register Patient

- **POST** `/patient/register` (Requires JWT Auth)
- **Request Body:**

```
{
  "medical_history": "Diabetes, Hypertension",
  "blood_type": "O+",
  "height": "170cm",
  "weight": "70kg",
  "allergies": "Penicillin",
  "notes": "Requires wheelchair access",
  "current_medications": "Metformin, Lisinopril"
}
```

- **Response:**

```
{
  "message": "Patient details saved successfully",
  "patient": {
    "userId": 1,
    "medical_history": "Diabetes, Hypertension",
    "blood_type": "O+",
    "height": "170cm",
    "weight": "70kg",
    "allergies": "Penicillin",
    "notes": "Requires wheelchair access",
    "current_medications": "Metformin, Lisinopril",
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

---

## Doctor APIs

### Register Doctor Details

- **POST** `/doctor/register` (Requires JWT Auth)
- **Request Body:**

```
  {
    "qualifications": "MBBS, MD",
    "specialization": "Cardiology",
    "years_of_experience": "10",
    "bio": "Experienced cardiologist."
  }
```

- **Response:**

```
{
  "message": "Doctor registered successfully",
  "doctor": {
    "userId": 2,
    "qualifications": "MBBS, MD",
    "specialization": "Cardiology",
    "years_of_experience": "10",
    "bio": "Experienced cardiologist.",
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```
