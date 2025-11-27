import mongoose from 'mongoose';

const AddressSchema = new mongoose.Schema(
    {
        address: {
            type: String,
            required: [true, 'A cím megadása kötelező'],
            trim: true,
        },
        placeId: {
            type: String,
            required: [true, 'A Place ID kötelező'],
            trim: true,
            unique: true
        },
        location: {
            type: {
                type: String,
                enum: ['Point'],
                default: 'Point'
            },
            coordinates: {
                type: [Number], // [longitude, latitude]
                index: '2dsphere' // Geospatial index a közelség alapú kereséshez
            }
        },
        // Opcionális mezők további adatokhoz
        mainText: {
            type: String,
            trim: true,
        },
        secondaryText: {
            type: String,
            trim: true,
        },
        // Kinek tartozik ez a cím (ha van user management)
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            // required: true, // Akkor uncomment, ha van user system
        },
        // Cím típusa (otthon, munka, egyéb)
        // Cím típusa - BŐVÍTVE telephelyekkel
        addressType: {
            type: String,
            enum: ['home', 'headquarters', 'branch'], // headquarters = székhely, branch = telephely
            default: 'home'
        },
        // Aktív/inaktív státusz
        isActive: {
            type: Boolean,
            default: true
        },
        distance: {
            type: {
                oneWayKm: {
                    type: Number,
                    min: 0,
                    default: null
                },
                roundTripKm: {
                    type: Number,
                    min: 0,
                    default: null
                },
                calculatedAt: {
                    type: Date,
                    default: null
                },
                routingPreference: {
                    type: String,
                    enum: ['TRAFFIC_AWARE', 'TRAFFIC_AWARE_OPTIMAL', 'TRAFFIC_UNAWARE'],
                    default: 'TRAFFIC_UNAWARE'
                }
            },
            default: () => ({}) // Alapértelmezett üres objektum
        }
    },
    {
        timestamps: true, // createdAt, updatedAt automatikusan
    }
);

// // Indexek a gyorsabb kereséshez
// AddressSchema.index({ placeId: 1 });
// AddressSchema.index({ userId: 1, isActive: 1 });
// AddressSchema.index({ createdAt: -1 });

// // Virtual field a teljes cím formázásához
// AddressSchema.virtual('fullAddress').get(function () {
//     return this.mainText && this.secondaryText
//         ? `${this.mainText}, ${this.secondaryText}`
//         : this.address;
// });

// // Biztosítjuk, hogy a virtuals is kikerülnek JSON-ba
// AddressSchema.set('toJSON', { virtuals: true });
// AddressSchema.set('toObject', { virtuals: true });

// Modell export - fontos a "models" check Next.js-ben a hot reload miatt
const Address = mongoose.models.Address || mongoose.model('Address', AddressSchema);

export default Address;