import AddressTable from '@/components/address-table/AddressTable';
import { columns } from '@/components/address-table/column';
import SearchAddressForm from '@/components/form/SearchAddressForm'
import { getAddresses } from '@/lib/actions/google'


const GoogleSearchPage = async () => {

    const { data } = await getAddresses()

    return (
        <div className="flex flex-col min-h-[calc(100vh-68px)] gap-4">
            <SearchAddressForm />
            <AddressTable addresses={data} columns={columns} />
        </div>
    )
}

export default GoogleSearchPage