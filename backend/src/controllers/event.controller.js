/**
 * create event
 * view all event
 * update event
 * delete event
 * weather info
 */

import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/apiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import Event from "../models/event.model.js";

// Function to create a new event
export const createEvent = asyncHandler(async (req, res) => {
  // Extract event data from request body
  const { name, date, location } = req.body;

  // Check if any required field is missing or empty
  if ([name, date, location].some((field) => field?.toString().trim() === "")) {
    throw new ApiError(400, "Data not received");
  }

  // Get userId from request
  const userId = req.userId;
  if (!userId) {
    throw new ApiError(400, "UserId not received");
  }

  let newEvent;
  try {
    // Create a new event with the provided data
    newEvent = await Event.create({
      name,
      date,
      location,
      createdBy: userId,
    });
  } catch (error) {
    // Handle any errors during event creation
    throw new ApiError(500, error.message || "Unable to create Event");
  }

  // Check if event creation was successful
  if (!newEvent) {
    throw new ApiError(500, "Event creation failed");
  }

  // Return the created event in the response
  return res
    .status(201)
    .json(new ApiResponse(201, newEvent, "Event created successfully"));
});

// Function to get all events
export const getAllEvents = asyncHandler(async (req, res) => {
  // Get userId from request
  const userId = req.userId;
  if (!userId) {
    throw new ApiError(400, "UserId not received");
  }

  let allEvents;
  try {
    // Retrieve all events from the database
    allEvents = await Event.find();
  } catch (error) {
    // Handle any errors during event retrieval
    throw new ApiError(500, error.message || "Unable to find Events");
  }

  // Check if any events were found
  if (!allEvents) {
    throw new ApiError(500, "No events found");
  }

  // Return all retrieved events in the response
  return res
    .status(200)
    .json(new ApiResponse(200, allEvents, "All events retrieved successfully"));
});

// Function to update an existing event
export const updateEvent = asyncHandler(async (req, res) => {
  // Extract new data for the event from request body
  const newData = req.body;
  if (!newData) {
    throw new ApiError(400, "Data not received");
  }

  // Get userId from request
  const userId = req.userId;
  if (!userId) {
    throw new ApiError(400, "UserId not received");
  }

  // Get eventId from request parameters
  const eventId = req.params._id;
  if (!eventId) {
    throw new ApiError(400, "Event ID not received");
  }

  let retrievedEvent;
  try {
    // Retrieve the event to be updated from the database
    retrievedEvent = await Event.findById(eventId);
  } catch (error) {
    // Handle any errors during event retrieval
    throw new ApiError(500, error.message || "Unable to find event");
  }

  // Check if the event was found
  if (!retrievedEvent) {
    throw new ApiError(500, "Event not found");
  }

  // Check if the user is allowed to update the event
  if (retrievedEvent.createdBy != userId) {
    throw new ApiError(500, "User not allowed to update this event");
  }

  let updatedEvent;
  try {
    // Update the event with the new data
    updatedEvent = await Event.findByIdAndUpdate(
      eventId,
      { $set: newData },
      { new: true }
    );
  } catch (error) {
    // Handle any errors during event update
    throw new ApiError(500, error.message || "Unable to update event");
  }

  // Check if the event update was successful
  if (!updatedEvent) {
    throw new ApiError(500, "Event update failed");
  }

  // Return the updated event in the response
  return res
    .status(200)
    .json(new ApiResponse(200, updatedEvent, "Event updated successfully"));
});

export const deleteEvent = asyncHandler(async (req, res) => {
  const eventId = req.params?._id;
  if (!eventId) {
    throw new ApiError(400, "EventId not received");
  }

  const userId = req.userId;
  if (!userId) {
    throw new ApiError(400, "userId not received");
  }

  let retrievedEvent;
  try {
    // Retrieve the event to be updated from the database
    retrievedEvent = await Event.findById(eventId);
  } catch (error) {
    // Handle any errors during event retrieval
    throw new ApiError(500, error.message || "Unable to find event");
  }

  // Check if the event was found
  if (!retrievedEvent) {
    throw new ApiError(500, "Event not found");
  }

  // Check if the user is allowed to update the event
  if (retrievedEvent.createdBy != userId) {
    throw new ApiError(500, "User not allowed to update this event");
  }

  try {
    await Event.findByIdAndUpdate(eventId);
  } catch (error) {
    throw new ApiError(500, error.message || "Unable to delete Event");
  }

  return res.status(200).json(200, {}, "Event Deleted successfully");
});

export const fetchWeatherInfo = asyncHandler(async (req, res) => {
  // for fetch wetherInfo I use open wether map

  const eventId = req.params?._id;
  if (!eventId) {
    throw new ApiError(400, "EventId not received");
  }

  const userId = req.userId;
  if (!userId) {
    throw new ApiError(400, "userId not received");
  }

  let retrievedEvent;
  try {
    // Retrieve the event to be updated from the database
    retrievedEvent = await Event.findById(eventId);
  } catch (error) {
    // Handle any errors during event retrieval
    throw new ApiError(500, error.message || "Unable to find event");
  }

  // Check if the event was found
  if (!retrievedEvent) {
    throw new ApiError(500, "Event not found");
  }

  const location = retrievedEvent.location
  const fetchWeatherInfo = "wether information here"

  return res
  .status(200)
  .json(
    new ApiResponse(200, fetchWeatherInfo, "Event whether info get successfully")
  )
});
