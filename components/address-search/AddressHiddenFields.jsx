/**
 * Hidden input mezők a cím adataihoz
 * Ezek kerülnek elküldésre a form submit-kor
 */
export const AddressHiddenFields = ({ selectedPlace }) => {
    return (
        <>
            <input
                type="hidden"
                name="placeId"
                value={selectedPlace.placeId}
            />
            <input
                type="hidden"
                name="mainText"
                value={selectedPlace.mainText}
            />
            <input
                type="hidden"
                name="secondaryText"
                value={selectedPlace.secondaryText}
            />
            <input
                type="hidden"
                name="latitude"
                value={selectedPlace.latitude}
            />
            <input
                type="hidden"
                name="longitude"
                value={selectedPlace.longitude}
            />
        </>
    )
}