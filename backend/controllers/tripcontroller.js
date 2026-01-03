import prisma from "../config/db.js";
import * as placesService from "../services/placesService.js";


// ========== Landing Page ==========

// Get banner content
const getBanner = async (req, res) => {
    try {
        // Return static banner data or fetch from DB
        const banner = {
            title: "Explore the World",
            subtitle: "Plan your next adventure with GlobeTrotter",
            imageUrl: "/images/banner.jpg"
        };
        res.json(banner);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get top regional selections
const getTopRegions = async (req, res) => {
    try {
        const { limit = 5, filter } = req.query;

        const cities = await prisma.city.findMany({
            take: parseInt(limit),
            orderBy: { popularityScore: 'desc' },
            where: filter ? { country: { contains: filter } } : undefined
        });

        res.json(cities);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ========== Google Places API ==========

// Search places
const searchPlaces = async (req, res) => {
    try {
        const { query, type, groupBy, sortBy, filter } = req.query;

        if (!query) {
            return res.status(400).json({ error: 'Query parameter is required' });
        }

        const results = await placesService.searchPlaces(query, type);

        // Apply groupBy if specified
        let processedResults = results;
        if (groupBy === 'category' || groupBy === 'type') {
            processedResults = groupByType(results);
        }

        // Apply sortBy if specified
        if (sortBy === 'rating') {
            processedResults = Array.isArray(processedResults)
                ? processedResults.sort((a, b) => (b.rating || 0) - (a.rating || 0))
                : processedResults;
        }

        res.json(processedResults);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get place details
const getPlaceDetails = async (req, res) => {
    try {
        const { placeId } = req.params;
        const details = await placesService.getPlaceDetails(placeId);
        res.json(details);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get nearby places
const getNearbyPlaces = async (req, res) => {
    try {
        const { lat, lng, radius = 5000, type } = req.query;

        if (!lat || !lng) {
            return res.status(400).json({ error: 'Latitude and longitude are required' });
        }

        const results = await placesService.getNearbyPlaces(lat, lng, radius, type);
        res.json(results);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Helper function to group by type
const groupByType = (places) => {
    return places.reduce((acc, place) => {
        const type = place.types?.[0] || 'other';
        if (!acc[type]) acc[type] = [];
        acc[type].push(place);
        return acc;
    }, {});
};

// ========== User Trips ==========

// Get user's trips (Previous Trips)
const getUserTrips = async (req, res) => {
    try {
        const { userId } = req.params;
        const { sortBy = 'createdAt', limit, filter } = req.query;

        const trips = await prisma.trip.findMany({
            where: { userId },
            include: {
                stops: {
                    include: { city: true }
                },
                budget: true
            },
            orderBy: { [sortBy]: 'desc' },
            take: limit ? parseInt(limit) : undefined
        });

        res.json(trips);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get single trip details
const getTripDetails = async (req, res) => {
    try {
        const { tripId } = req.params;

        const trip = await prisma.trip.findUnique({
            where: { id: tripId },
            include: {
                stops: {
                    include: {
                        city: true,
                        activities: {
                            include: { activity: true }
                        }
                    },
                    orderBy: { order: 'asc' }
                },
                budget: true,
                shares: true
            }
        });

        if (!trip) {
            return res.status(404).json({ error: 'Trip not found' });
        }

        res.json(trip);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Create new trip
const createTrip = async (req, res) => {
    try {
        const { userId, title, description, startDate, endDate, isPublic } = req.body;

        const trip = await prisma.trip.create({
            data: {
                userId,
                title,
                description,
                startDate: startDate ? new Date(startDate) : null,
                endDate: endDate ? new Date(endDate) : null,
                isPublic: isPublic || false
            }
        });

        res.status(201).json(trip);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update trip
const updateTrip = async (req, res) => {
    try {
        const { tripId } = req.params;
        const { title, description, startDate, endDate, isPublic } = req.body;

        const trip = await prisma.trip.update({
            where: { id: tripId },
            data: {
                title,
                description,
                startDate: startDate ? new Date(startDate) : undefined,
                endDate: endDate ? new Date(endDate) : undefined,
                isPublic
            }
        });

        res.json(trip);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Delete trip
const deleteTrip = async (req, res) => {
    try {
        const { tripId } = req.params;

        await prisma.trip.delete({
            where: { id: tripId }
        });

        res.json({ message: 'Trip deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ========== Trip Stops ==========

// Add stop to trip
const addStop = async (req, res) => {
  try {
    const { tripId } = req.params;
    const { stops } = req.body;

    if (!Array.isArray(stops) || stops.length === 0) {
      return res.status(400).json({
        message: "stops must be a non-empty array",
      });
    }

    const data = stops.map((stop) => ({
      tripId,
      cityId: stop.cityId,
      startDate: stop.startDate ? new Date(stop.startDate) : null,
      endDate: stop.endDate ? new Date(stop.endDate) : null,
      order: stop.order,
    }));

    await prisma.tripStop.createMany({
      data,
    });

    // Fetch with relations (createMany doesn't return relations)
    const createdStops = await prisma.tripStop.findMany({
      where: { tripId },
      include: { city: true },
      orderBy: { order: "asc" },
    });

    res.status(201).json(createdStops);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};


// Update stop
const updateStop = async (req, res) => {
    try {
        const { stopId } = req.params;
        const { startDate, endDate, order } = req.body;

        const stop = await prisma.tripStop.update({
            where: { id: stopId },
            data: {
                startDate: startDate ? new Date(startDate) : undefined,
                endDate: endDate ? new Date(endDate) : undefined,
                order
            },
            include: { city: true }
        });

        res.json(stop);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Delete stop
const deleteStop = async (req, res) => {
    try {
        const { stopId } = req.params;

        await prisma.tripStop.delete({
            where: { id: stopId }
        });

        res.json({ message: 'Stop deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ========== Trip Activities ==========

// Add activity to stop
const addActivity = async (req, res) => {
    try {
        const { stopId } = req.params;
        const { activityId, scheduledDate, customCost } = req.body;

        const tripActivity = await prisma.tripActivity.create({
            data: {
                tripStopId: stopId,
                activityId,
                scheduledDate: scheduledDate ? new Date(scheduledDate) : null,
                customCost
            },
            include: { activity: true }
        });

        res.status(201).json(tripActivity);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update activity
const updateActivity = async (req, res) => {
    try {
        const { activityId } = req.params;
        const { scheduledDate, customCost } = req.body;

        const tripActivity = await prisma.tripActivity.update({
            where: { id: activityId },
            data: {
                scheduledDate: scheduledDate ? new Date(scheduledDate) : undefined,
                customCost
            },
            include: { activity: true }
        });

        res.json(tripActivity);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Delete activity
const deleteActivity = async (req, res) => {
    try {
        const { activityId } = req.params;

        await prisma.tripActivity.delete({
            where: { id: activityId }
        });

        res.json({ message: 'Activity deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ========== Trip Budget ==========

// Get trip budget
const getTripBudget = async (req, res) => {
    try {
        const { tripId } = req.params;

        const budget = await prisma.tripBudget.findUnique({
            where: { tripId }
        });

        if (!budget) {
            return res.status(404).json({ error: 'Budget not found' });
        }

        res.json(budget);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update trip budget
const updateTripBudget = async (req, res) => {
    try {
        const { tripId } = req.params;
        const { transportCost, stayCost, foodCost, activityCost } = req.body;

        const budget = await prisma.tripBudget.upsert({
            where: { tripId },
            update: { transportCost, stayCost, foodCost, activityCost },
            create: { tripId, transportCost, stayCost, foodCost, activityCost }
        });

        res.json(budget);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ========== Trip Sharing ==========

// Share trip
const shareTrip = async (req, res) => {
    try {
        const { tripId } = req.params;
        const { email, permission } = req.body;

        const share = await prisma.tripShare.create({
            data: {
                tripId,
                email,
                permission
            }
        });

        res.status(201).json(share);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get shared trip
const getSharedTrip = async (req, res) => {
    try {
        const { shareId } = req.params;

        const share = await prisma.tripShare.findUnique({
            where: { id: shareId },
            include: {
                trip: {
                    include: {
                        stops: {
                            include: {
                                city: true,
                                activities: { include: { activity: true } }
                            }
                        },
                        budget: true
                    }
                }
            }
        });

        if (!share) {
            return res.status(404).json({ error: 'Shared trip not found' });
        }

        res.json(share.trip);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const addCity = async (req, res) => {
  try {
    const {
      name,
      country,
      costIndex,
      popularityScore, // rating like 4.7
    } = req.body;

    // Basic validation
    if (!name || !country) {
      return res.status(400).json({
        message: "City name and country are required",
      });
    }

    // Rating validation (optional but recommended)
    if (
      popularityScore !== undefined &&
      (popularityScore < 0 || popularityScore > 5)
    ) {
      return res.status(400).json({
        message: "Popularity score must be between 0 and 5",
      });
    }

    const city = await prisma.city.create({
      data: {
        name,
        country,
        costIndex: costIndex ? Number(costIndex) : null,
        popularityScore:
          popularityScore !== undefined
            ? Number(popularityScore)
            : null,
      },
    });

    res.status(201).json({
      message: "City added successfully",
      cityId: city.id,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

export {
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
    getSharedTrip
};

