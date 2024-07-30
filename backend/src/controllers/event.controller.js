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
import Event from "../models/event.model.js"


export const createEvent = asyncHandler( async(req, res) => {
    // event data by client
    // userId by user
    // create new event by these data
    // 

    const {name, date, location} = req.body

    if([name, date, location].some(field => (field?.toString()).trim() === "")){
        throw new ApiError(400, "Data not received")
    }
    
    const userId = req.userId
    if(!userId){
        throw new ApiError(400, "UserId not received")
    }

    let newEvent
    try {
        newEvent = await new Event.create({
            name, date, location, 
            createdBy : userId
        })
    } catch (error) {
        throw new ApiError(500, error || "unable to createing Event")
    }


})
