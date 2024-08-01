import { Router } from "express";
import { CheckUserLogin } from "../middlewares/auth.middlewares.js";
import {
  createEvent,
  deleteEvent,
  fetchWeatherInfo,
  getAllEvents,
  updateEvent,
} from "../controllers/event.controller.js";

const eventRouter = Router();

// Route to create a new event, requires user to be logged in
eventRouter.route("/createEvent").post(CheckUserLogin, createEvent);

// Route to get all events, requires user to be logged in
eventRouter.route("/getAllEvents").get(CheckUserLogin, getAllEvents);

// Route to update an event by its ID, requires user to be logged in
eventRouter.route("/updateEventInfo/:_id").patch(CheckUserLogin, updateEvent);

// Route to delete an event by its ID, requires user to be logged in
eventRouter.route("/deleteEvent/:_id").delete(CheckUserLogin, deleteEvent);

// Route to fetch weather information for an event by its ID, requires user to be logged in
eventRouter.route("/fetchWeatherInfo/:id").get(CheckUserLogin, fetchWeatherInfo);

export default eventRouter;
