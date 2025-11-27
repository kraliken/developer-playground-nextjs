import mongoose from 'mongoose';

const DistanceSchema = new mongoose.Schema(
    {
        // Honnan (általában dolgozó lakhelye)
        fromAddressId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Address',
            required: [true, 'Kiindulási cím kötelező']
        },

        // Hová (munkahely: székhely vagy telephely)
        toAddressId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Address',
            required: [true, 'Célcím kötelező']
        },

        // Távolság adatok
        oneWayKm: {
            type: Number,
            required: [true, 'Egy irányú távolság kötelező'],
            min: [0, 'A távolság nem lehet negatív']
        },

        roundTripKm: {
            type: Number,
            required: [true, 'Oda-vissza távolság kötelező'],
            min: [0, 'A távolság nem lehet negatív']
        },

        // Számítás részletei
        calculatedAt: {
            type: Date,
            default: Date.now,
            required: true
        },

        routingPreference: {
            type: String,
            enum: ['TRAFFIC_AWARE', 'TRAFFIC_AWARE_OPTIMAL', 'TRAFFIC_UNAWARE'],
            default: 'TRAFFIC_UNAWARE'
        },

        // Opcionális: nyers API válasz tárolása (debug célra)
        rawApiData: {
            type: mongoose.Schema.Types.Mixed,
        },

        // Aktív/inaktív státusz (ha változik a cím, régi távolság inaktív lesz)
        isActive: {
            type: Boolean,
            default: true
        },

        // Megjegyzés (pl. "Új telephely", "Címváltozás után")
        note: {
            type: String,
            trim: true
        }
    },
    {
        timestamps: true, // createdAt, updatedAt
    }
);

// Modell export
const Distance = mongoose.models.Distance || mongoose.model('Distance', DistanceSchema);

export default Distance;