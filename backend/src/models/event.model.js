import { model, Schema } from "mongoose";

// Define the schema for an event
const eventSchema = new Schema({
    name: {
        type: String,
        required: true // Event name is required
    },
    date: {
        type: Date,
        required: true // Event date is required
    },
    location: {
        type: String,
        required: true // Event location is required
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true // Reference to the user who created the event
    }
}, { timestamps: true }); // Automatically adds createdAt and updatedAt fields

// Create the Event model from the schema
const Event = model("Event", eventSchema);

export default Event;
