// components/address/AddressInputField.jsx
import { Input } from "../ui/input"
import { AddressAutocompleteDropdown } from "./AddressAutocompleteDropdown"

/**
 * Cím input mező autocomplete funkcióval
 * Wrapper aInput komponens és a dropdown lista körül
 */
export const AddressInputField = ({
    value,
    onChange,
    onBlur,
    onFocus,
    disabled,
    isOpen,
    isLoading,
    suggestions,
    onSelect,
    placeholder = "Adj meg egy címet…"
}) => {
    return (
        <div className="w-full relative group">
            <Input
                type="text"
                name="address"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                disabled={disabled}
                onBlur={onBlur}
                onFocus={onFocus}
                className="w-full"
            />

            <AddressAutocompleteDropdown
                isOpen={isOpen}
                isLoading={isLoading}
                suggestions={suggestions}
                inputValue={value}
                onSelect={onSelect}
            />
        </div>
    )
}