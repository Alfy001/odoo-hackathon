import express from "express";
import {
  getBanner,
  getTopRegions,
  searchPlaces,
  getPlaceDetails,
  getNearbyPlaces,
  getUserTrips,
  getTripDetails,
  createTrip,
  updateTrip,
  deleteTrip,
  addStop,
  updateStop,
  deleteStop,
  addActivity,
  updateActivity,
  deleteActivity,
  getTripBudget,
  updateTripBudget,
  shareTrip,
  getSharedTrip,
  addCity,
  deleteCityIfUnused,
} from "../controllers/tripcontroller.js";

const router = express.Router();

// ========== Landing Page Data ==========

// Get banner/promotional content
router.get("/banner", getBanner);

// Get top regional selections (featured destinations)
router.get("/regions/top", getTopRegions);

// ========== Search Places (Google Places API) ==========

// Search places with filters
// Query params: ?query=Paris&type=tourist_attraction&groupBy=category&sortBy=rating&filter=continent
router.get("/places/search", searchPlaces);

// Get place details by Google Place ID
router.get("/places/details/:placeId", getPlaceDetails);

// Get nearby places
// Query params: ?lat=48.8566&lng=2.3522&radius=5000&type=restaurant
router.get("/places/nearby", getNearbyPlaces);

// ========== User Trips (Previous Trips) ==========

// Get all trips for a user (Previous Trips section)
// Query params: ?sortBy=date&limit=3&filter=completed
router.get("/user/:userId", getUserTrips);

// Get single trip details
router.get("/:tripId", getTripDetails);

// Create new trip ("+ Plan a trip" button)
router.post("/", createTrip);

// Update trip
router.put("/:tripId", updateTrip);

// Delete trip
router.delete("/:tripId", deleteTrip);

// ========== Trip Stops ==========

// Add stop to trip
router.post("/:tripId/stops", addStop);

// Update stop
router.put("/:tripId/stops/:stopId", updateStop);

// Delete stop
router.delete("/:tripId/stops/:stopId", deleteStop);

// ========== Trip Activities ==========

// Add activity to stop
router.post("/:tripId/stops/:stopId/activities", addActivity);

// Update activity
router.put("/:tripId/stops/:stopId/activities/:activityId", updateActivity);

// Delete activity
router.delete("/:tripId/stops/:stopId/activities/:activityId", deleteActivity);

// ========== Trip Budget ==========

// Get trip budget breakdown
router.get("/:tripId/budget", getTripBudget);

// Update trip budget
router.put("/:tripId/budget", updateTripBudget);

// ========== Trip Sharing ==========

// Share trip
router.post("/:tripId/share", shareTrip);

// Get public trip by share URL
router.get("/shared/:shareId", getSharedTrip);

router.post("/city-add", addCity);

router.delete("/city/:cityId", deleteCityIfUnused);

export default router;

