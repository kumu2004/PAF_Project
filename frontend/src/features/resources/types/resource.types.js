/**
 * @typedef {Object} CampusResource
 * @property {string} id - Resource unique identifier
 * @property {string} name - e.g., "Lab Block A - Room 101"
 * @property {string} type - "LECTURE_HALL" | "LAB" | "MEETING_ROOM" | "EQUIPMENT"
 * @property {string} location - e.g., "Block A, Floor 2"
 * @property {number} capacity - Max occupancy
 * @property {string} description - Description of the resource
 * @property {string} status - "ACTIVE" | "OUT_OF_SERVICE"
 * @property {string} imageUrl - Photo of the room/equipment
 * @property {string} floorPlanUrl - Blueprint/layout image URL
 * @property {string[]} equipment - ["Projector", "Whiteboard", "Computers"]
 * @property {string[]} amenities - ["WiFi", "Air Conditioning", "Power Outlets"]
 * @property {Object[]} availabilityWindows - Operating hours
 * @property {string} availabilityWindows[].dayOfWeek - "MONDAY" | "TUESDAY" | etc.
 * @property {string} availabilityWindows[].startTime - "09:00"
 * @property {string} availabilityWindows[].endTime - "17:00"
 * @property {Object} links - HATEOAS links { self, bookings, availability }
 * @property {string} createdByUserId - Admin who created it
 * @property {string} createdAt - ISO timestamp
 * @property {string} updatedAt - ISO timestamp
 */

export const ResourceStatusEnum = Object.freeze({
  ACTIVE: "ACTIVE",
  UNDER_MAINTENANCE: "UNDER_MAINTENANCE",
  OUT_OF_SERVICE: "OUT_OF_SERVICE",
});

export const ResourceTypeEnum = Object.freeze({
  LECTURE_HALL: "LECTURE_HALL",
  LAB: "LAB",
  MEETING_ROOM: "MEETING_ROOM",
  EQUIPMENT: "EQUIPMENT",
  LIBRARY: "LIBRARY",
  STUDY_SPACE: "STUDY_SPACE",
});

export const ResourceTypeLabels = Object.freeze({
  LECTURE_HALL: "Lecture Hall",
  LAB: "Laboratory",
  MEETING_ROOM: "Meeting Room",
  EQUIPMENT: "Equipment",
  LIBRARY: "Library",
  STUDY_SPACE: "Study Space",
});

export const DaysOfWeek = Object.freeze({
  MONDAY: "MONDAY",
  TUESDAY: "TUESDAY",
  WEDNESDAY: "WEDNESDAY",
  THURSDAY: "THURSDAY",
  FRIDAY: "FRIDAY",
  SATURDAY: "SATURDAY",
  SUNDAY: "SUNDAY",
});

export const EquipmentOptions = [
  "Projector",
  "Whiteboard",
  "Smart TV",
  "Sound System",
  "Microphone",
  "Computers",
  "Webcam",
  "Printer",
  "Recording Equipment",
];

export const AmenityOptions = [
  "WiFi",
  "Air Conditioning",
  "Power Outlets",
  "Wheelchair Accessible",
  "Natural Lighting",
  "Parking Nearby",
  "Elevator Access",
  "Water Dispenser",
];
