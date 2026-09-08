# CampusFlow Firestore Database Schema

## Database Collections

```
users
events
eventRegistrations
attendance
certificates
notifications
clubs
departments
```

---

# 1. users

Document ID

```
uid
```

Example

```json
{
  "uid": "firebaseUID",

  "name": "Amrutha",

  "email": "23B01A0501@svecw.edu.in",

  "registerNo": "23B01A0501",

  "department": "CSE",

  "year": "2",

  "role": "student",

  "status": "active",

  "photoURL": "",

  "phone": "",

  "createdAt": Timestamp,

  "updatedAt": Timestamp
}
```

Roles

```
student
faculty
club
admin
```

---

# 2. events

Document ID

```
Auto Generated
```

Example

```json
{
  "title": "AI Workshop",

  "description": "Hands-on AI Workshop",

  "clubId": "gdg",

  "clubName": "GDG",

  "category": "Workshop",

  "venue": "Seminar Hall",

  "eventDate": Timestamp,

  "registrationDeadline": Timestamp,

  "capacity": 120,

  "registeredCount": 50,

  "posterURL": "",

  "certificateEnabled": true,

  "attendanceRequired": true,

  "status": "approved",

  "createdBy": "clubUID",

  "createdAt": Timestamp
}
```

Status

```
pending
approved
rejected
completed
cancelled
```

---

# 3. eventRegistrations

Document ID

```
Auto Generated
```

```json
{
  "studentId": "uid",

  "eventId": "eventId",

  "registeredAt": Timestamp,

  "attendance": false,

  "certificateIssued": false,

  "status": "registered"
}
```

Status

```
registered
cancelled
completed
```

---

# 4. attendance

Document ID

```
Auto Generated
```

```json
{
  "eventId": "eventId",

  "studentId": "uid",

  "markedBy": "facultyUID",

  "markedAt": Timestamp,

  "status": "present"
}
```

Status

```
present
absent
late
```

---

# 5. certificates

Document ID

```
Auto Generated
```

```json
{
  "studentId": "uid",

  "eventId": "eventId",

  "certificateURL": "",

  "issuedDate": Timestamp,

  "issuedBy": "clubUID"
}
```

---

# 6. notifications

Document ID

```
Auto Generated
```

```json
{
  "studentId": "uid",

  "title": "Certificate Generated",

  "message": "Your certificate is ready.",

  "type": "certificate",

  "isRead": false,

  "createdAt": Timestamp
}
```

Types

```
registration
attendance
certificate
event
system
```

---

# 7. clubs

Document ID

```
clubId
```

```json
{
  "clubName": "Google Developer Group",

  "clubCode": "GDG",

  "facultyCoordinator": "facultyUID",

  "email": "gdg@svecw.edu.in",

  "status": "active",

  "createdAt": Timestamp
}
```

---

# 8. departments

Document ID

```
departmentCode
```

```json
{
  "departmentName": "Computer Science",

  "departmentCode": "CSE"
}
```

---

# Firebase Storage

```
profilePhotos/

eventPosters/

certificates/

clubLogos/
```

---

# Firebase Authentication

Student

```
Register Number + @svecw.edu.in
```

Faculty

```
Faculty Email
```

Club

```
Official Club Email
```

Admin

```
Administrator Email
```

---

# Security Rules (Concept)

Student

- Read own profile
- Update own profile
- Register for events
- View certificates
- View notifications

Faculty

- Mark attendance
- View assigned events

Club

- Create events
- Generate certificates
- Manage registrations

Admin

- Full access

---

# Firestore Indexes

events

```
status ASC
eventDate ASC
```

eventRegistrations

```
studentId ASC
eventId ASC
```

notifications

```
studentId ASC
createdAt DESC
```

attendance

```
eventId ASC
studentId ASC
```

---

# Future Collections

```
feedback

announcements

eventImages

auditLogs

reports

settings
```
