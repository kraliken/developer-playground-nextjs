'use server'

import { PlacesClient } from '@googlemaps/places';
import { v2 as mapsRouting } from '@googlemaps/routing';
import { connectToDatabase } from '../db/mongoose';
import Address from '../models/address';
import { revalidatePath } from 'next/cache';
import { getNextWorkdayAt8AM } from '../helpers';
import Distance from '../models/distance';

const placesClient = new PlacesClient({
    apiKey: process.env.GOOGLE_MAPS_API_KEY,
});

const routingClient = new mapsRouting.RoutesClient();


export async function callAutocompletePlaces({ query, sessionToken }) {

    const [response] = await placesClient.autocompletePlaces({
        input: query,
        sessionToken: sessionToken,
        languageCode: 'hu',
        regionCode: 'HU',
        includedRegionCodes: ['HU']
    });

    const suggestions = response.suggestions ?? [];

    const data = suggestions
        .map((s) => s.placePrediction ?? s.queryPrediction)
        .filter(Boolean)
        .map((p) => ({
            id: p.placeId ?? p.place,
            mainText: p.structuredFormat?.mainText?.text ?? p.text?.text ?? '',
            secondaryText: p.structuredFormat?.secondaryText?.text ?? '',
            raw: p,
        }));

    return data;
}

export async function getPlaceDetails({ placeId, sessionToken }) {

    // A mezők (fields) megadása KÖTELEZŐ a Place Details API-ban, 
    // ha spórolni akarsz a sávszélességgel.
    const fields = [
        'formattedAddress',
        'location',
        // 'displayName',
        'id'
    ];

    const fieldMask = fields.join(','); // "formattedAddress,location,displayName,id"

    try {
        const [response] = await placesClient.getPlace({
            name: `places/${placeId}`, // A Place Details (New) API formátuma
            sessionToken: sessionToken, // 👈 Session lezárása ugyanazzal a tokennel
            languageCode: 'hu',
            // fieldMask: fields,
        }, {
            otherArgs: {
                headers: {
                    'X-Goog-FieldMask': fieldMask,
                },
            },
        });

        console.log("Place Details válasz:", response);

        return response;
    } catch (error) {
        console.error("Hiba a Place Details lekérése során:", error);
        return null;
    }
}

export async function saveAddressAction(prevState, formData) {
    const address = formData.get('address');
    const placeId = formData.get('placeId');
    const mainText = formData.get('mainText');
    const secondaryText = formData.get('secondaryText');
    const latitude = formData.get('latitude');
    const longitude = formData.get('longitude');
    const addressType = formData.get('addressType') || 'home';

    // Validáció
    if (!address || address.trim().length === 0) {
        return {
            success: false,
            message: 'A cím megadása kötelező',
            data: null
        };
    }

    if (!placeId) {
        return {
            success: false,
            message: 'Kérlek válassz egy címet a javaslatokból',
            data: null
        };
    }

    try {
        // MongoDB kapcsolat
        await connectToDatabase();

        const existingAddress = await Address.findOne({
            placeId,
            isActive: true
        });

        if (existingAddress) {
            return {
                success: false,
                message: 'Ez a cím már el van mentve az adatbázisban',
                data: {
                    id: existingAddress._id.toString(),
                    address: existingAddress.address,
                    placeId: existingAddress.placeId
                }
            };
        }

        // Létrehozzuk a cím objektumot
        const addressData = {
            address: address.trim(),
            placeId,
            mainText: mainText || null,
            secondaryText: secondaryText || null,
            addressType,
            // userId: session?.user?.id, // Ha van auth system
        };

        // Ha van koordináta, hozzáadjuk
        if (latitude && longitude) {
            addressData.location = {
                type: 'Point',
                coordinates: [parseFloat(longitude), parseFloat(latitude)]
            };
        }

        // Mentés MongoDB-be
        const newAddress = await Address.create(addressData);

        // console.log('✅ Cím sikeresen mentve:', newAddress._id);

        // Cache újravalidálás (ha listázol címeket máshol)
        revalidatePath('/dashboard/google-search');

        return {
            success: true,
            message: 'Cím sikeresen mentve!',
            data: {
                id: newAddress._id.toString(),
                address: newAddress.address,
                placeId: newAddress.placeId
            }
        };


    } catch (error) {
        console.error('❌ Hiba a cím mentése során:', error);

        // Mongoose validációs hiba kezelése
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message);
            return {
                success: false,
                message: messages.join(', '),
                data: null
            };
        }

        // Duplicate key error (ha unique index van)
        if (error.code === 11000) {
            return {
                success: false,
                message: 'Ez a cím már létezik az adatbázisban',
                data: null
            };
        }

        return {
            success: false,
            message: 'Hiba történt a mentés során. Kérlek próbáld újra.',
            data: null
        };
    }
}

// ===== CÍMEK LEKÉRÉSE (Opcionális - listázáshoz) =====
export async function getAddresses({ limit = 10, skip = 0, userId = null } = {}) {
    try {
        await connectToDatabase();

        const query = { isActive: true };
        if (userId) {
            query.userId = userId;
        }

        const addresses = await Address
            .find(query)
            .sort({ createdAt: -1 })
            .limit(limit)
            .skip(skip)
            .lean();

        // Serialize-áljuk az összes MongoDB ObjectId-t és Date-et
        const serializedAddresses = addresses.map(addr => ({
            _id: addr._id.toString(),
            address: addr.address,
            placeId: addr.placeId,
            mainText: addr.mainText || null,
            secondaryText: addr.secondaryText || null,
            addressType: addr.addressType,
            isActive: addr.isActive,
            location: addr.location ? {
                type: addr.location.type,
                coordinates: addr.location.coordinates
            } : null,
            distance: addr.distance ? {
                oneWayKm: addr.distance.oneWayKm ?? null,
                roundTripKm: addr.distance.roundTripKm ?? null,
                calculatedAt: addr.distance.calculatedAt ? addr.distance.calculatedAt.toISOString() : null,
                routingPreference: addr.distance.routingPreference || 'TRAFFIC_UNAWARE'
            } : null,
            userId: addr.userId ? addr.userId.toString() : null,
            createdAt: addr.createdAt ? addr.createdAt.toISOString() : null,
            updatedAt: addr.updatedAt ? addr.updatedAt.toISOString() : null
        }));

        return {
            success: true,
            data: serializedAddresses
        };
    } catch (error) {
        console.error('❌ Hiba a címek lekérése során:', error);
        return {
            success: false,
            data: [],
            message: 'Nem sikerült betölteni a címeket'
        };
    }
}

// ===== CÍM TÖRLÉSE =====
export async function deleteAddress(addressId) {
    try {
        await connectToDatabase();

        // Ellenőrizzük, hogy létezik-e a cím
        const address = await Address.findById(addressId);

        if (!address) {
            return {
                success: false,
                message: 'A cím nem található'
            };
        }

        // 1. Töröljük az összes távolságot, ahol ez a cím szerepel (fromAddress vagy toAddress)
        const deletedDistances = await Distance.deleteMany({
            $or: [
                { fromAddressId: addressId },
                { toAddressId: addressId }
            ]
        });

        // 2. Töröljük magát a címet
        await Address.findByIdAndDelete(addressId);

        revalidatePath('/dashboard/google-search');

        return {
            success: true,
            message: `Cím és ${deletedDistances.deletedCount} kapcsolódó távolság törölve`
        };

    } catch (error) {
        console.error('❌ Hiba a cím törlése során:', error);
        return {
            success: false,
            message: 'Nem sikerült törölni a címet'
        };
    }
}

// ===== CÍM FRISSÍTÉSE =====
export async function updateAddress(addressId, updates) {
    try {
        await connectToDatabase();

        const allowedUpdates = ['addressType', 'mainText', 'secondaryText'];
        const filteredUpdates = Object.keys(updates)
            .filter(key => allowedUpdates.includes(key))
            .reduce((obj, key) => {
                obj[key] = updates[key];
                return obj;
            }, {});

        const updatedAddress = await Address.findByIdAndUpdate(
            addressId,
            filteredUpdates,
            { new: true, runValidators: true }
        );

        if (!updatedAddress) {
            return {
                success: false,
                message: 'A cím nem található'
            };
        }

        revalidatePath('/dashboard/google-search');

        return {
            success: true,
            message: 'Cím sikeresen frissítve',
            data: {
                id: updatedAddress._id.toString(),
                ...updatedAddress.toObject()
            }
        };
    } catch (error) {
        console.error('❌ Hiba a cím frissítése során:', error);
        return {
            success: false,
            message: 'Nem sikerült frissíteni a címet'
        };
    }
}

export async function calculateDistances() {
    const url = 'https://routes.googleapis.com/directions/v2:computeRoutes';

    const requestBody = {
        origin: {
            placeId: "ChIJP1_7qRXbQUcR3c5Yi6rtogI"
        },
        destination: {
            placeId: "ChIJR92Acq0-akcRy9ADMIyy2dU"
        },
        travelMode: "DRIVE",
        routingPreference: "TRAFFIC_UNAWARE"
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Goog-Api-Key': process.env.GOOGLE_MAPS_API_KEY,
                'X-Goog-FieldMask': 'routes.distanceMeters,routes.duration'
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(`API Error: ${JSON.stringify(error)}`);
        }

        const data = await response.json();

        const oneWayKm = data.routes?.[0]?.distanceMeters
            ? (data.routes[0].distanceMeters / 1000).toFixed(2)
            : null;

        const roundTripKm = oneWayKm ? (oneWayKm * 2).toFixed(2) : null;

        console.log(`Egy irányú távolság: ${oneWayKm} km`);
        console.log(`Oda-vissza: ${roundTripKm} km/nap`);

        return {
            success: true,
            message: "Sikeres távolság lekérdezés!",
            oneWayKm: parseFloat(oneWayKm),
            roundTripKm: parseFloat(roundTripKm),
            rawData: data
        };

    } catch (error) {
        console.error('Route calculation error:', error);
        return {
            success: false,
            message: error instanceof Error ? error.message : "Ismeretlen hiba"
        };
    }
}

export async function calculateAndSaveDistance(employeeAddressId) {
    try {
        await connectToDatabase();

        // Lekérjük a dolgozó címét
        const employeeAddress = await Address.findById(employeeAddressId);

        if (!employeeAddress) {
            return {
                success: false,
                message: 'Dolgozó címe nem található'
            };
        }

        // Lekérjük a székhely címét
        const headquartersAddress = await Address.findOne({
            addressType: 'headquarters',
            isActive: true
        });

        if (!headquartersAddress) {
            return {
                success: false,
                message: 'Székhely cím nincs megadva az adatbázisban'
            };
        }

        // Google Routes API hívás
        const url = 'https://routes.googleapis.com/directions/v2:computeRoutes';

        const requestBody = {
            origin: {
                placeId: employeeAddress.placeId
            },
            destination: {
                placeId: headquartersAddress.placeId
            },
            travelMode: "DRIVE",
            routingPreference: "TRAFFIC_UNAWARE"
        };

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Goog-Api-Key': process.env.GOOGLE_MAPS_API_KEY,
                'X-Goog-FieldMask': 'routes.distanceMeters,routes.duration'
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(`API Error: ${JSON.stringify(error)}`);
        }

        const data = await response.json();

        const oneWayKm = data.routes?.[0]?.distanceMeters
            ? parseFloat((data.routes[0].distanceMeters / 1000).toFixed(2))
            : null;

        const roundTripKm = oneWayKm ? parseFloat((oneWayKm * 2).toFixed(2)) : null;

        if (!oneWayKm) {
            return {
                success: false,
                message: 'Nem sikerült kiszámolni a távolságot'
            };
        }

        // Upsert: frissít ha létezik, létrehoz ha nem
        const distance = await Distance.findOneAndUpdate(
            {
                fromAddressId: employeeAddressId,
                toAddressId: headquartersAddress._id,
            },
            {
                oneWayKm,
                roundTripKm,
                calculatedAt: new Date(),
                routingPreference: 'TRAFFIC_UNAWARE',
                rawApiData: data,
                isActive: true,
                note: 'Automatikus számítás'
            },
            {
                upsert: true,
                new: true,
                runValidators: true
            }
        );

        // Address model frissítése is
        await Address.findByIdAndUpdate(
            employeeAddressId,
            {
                $set: {
                    'distance.oneWayKm': oneWayKm,
                    'distance.roundTripKm': roundTripKm,
                    'distance.calculatedAt': new Date(),
                    'distance.routingPreference': 'TRAFFIC_UNAWARE'
                }
            },
            { new: true }
        );

        // Cache frissítés
        revalidatePath('/dashboard/google-calculate');

        return {
            success: true,
            message: `Távolság: ${roundTripKm} km (oda-vissza)`,
            data: {
                oneWayKm,
                roundTripKm,
                distanceId: distance._id.toString()
            }
        };


    } catch (error) {
        console.error('Distance calculation error:', error);
        return {
            success: false,
            message: error instanceof Error ? error.message : "Ismeretlen hiba történt"
        };
    }
}

