'use server'

import { PlacesClient } from '@googlemaps/places';
import { connectToDatabase } from '../db/mongoose';
import Address from '../models/address';
import { revalidatePath } from 'next/cache';

const placesClient = new PlacesClient({
    apiKey: process.env.GOOGLE_MAPS_API_KEY,
});

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

        return {
            success: true,
            data: addresses.map(addr => ({
                ...addr,
                _id: addr._id.toString()
            }))
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

        const result = await Address.findByIdAndDelete(addressId);

        if (!result) {
            return {
                success: false,
                message: 'A cím nem található'
            };
        }

        revalidatePath('/dashboard/google-search');

        return {
            success: true,
            message: 'Cím sikeresen törölve'
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