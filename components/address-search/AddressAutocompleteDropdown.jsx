import { Command, CommandGroup, CommandItem, CommandList } from "../ui/command"

/**
 * Autocomplete dropdown komponens
 * Megjeleníti a keresési javaslatokat egy lenyíló listában
 */
export const AddressAutocompleteDropdown = ({
    isOpen,
    isLoading,
    suggestions,
    inputValue,
    onSelect
}) => {
    if (!isOpen) return null

    return (
        <div className="absolute top-full mt-1 w-full border rounded-md shadow-md bg-popover z-50 overflow-hidden">
            <Command>
                <CommandList>
                    <CommandGroup heading="Találatok">
                        {isLoading ? (
                            <CommandItem
                                disabled
                                className="cursor-default text-center justify-center text-muted-foreground"
                            >
                                Keresés...
                            </CommandItem>
                        ) : suggestions.length > 0 ? (
                            suggestions.map((place) => (
                                <CommandItem
                                    key={place.id}
                                    onSelect={() => onSelect(place)}
                                    className="cursor-pointer"
                                >
                                    <div className="flex flex-col">
                                        <span className="font-medium">{place.mainText}</span>
                                        <span className="text-xs text-muted-foreground">
                                            {place.secondaryText}
                                        </span>
                                    </div>
                                </CommandItem>
                            ))
                        ) : inputValue.length > 2 && (
                            <CommandItem
                                disabled
                                className="cursor-default text-center justify-center text-muted-foreground"
                            >
                                Nincs találat
                            </CommandItem>
                        )}
                    </CommandGroup>
                </CommandList>
            </Command>
        </div>
    )
}
