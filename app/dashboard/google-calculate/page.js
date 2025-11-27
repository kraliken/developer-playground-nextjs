import AddressTable from "@/components/address-table/AddressTable";
import { columnsDistance } from "@/components/address-table/column";
import { Card, CardContent } from "@/components/ui/card";
import { getAddresses } from "@/lib/actions/google";

const GoogleCalculatePage = async () => {

    const { data } = await getAddresses()
    const employeeHomeAddresses = data.filter(
        (address) => address.addressType === "home"
    );
    const companyHeadquartersAddress = data.find(
        (address) => address.addressType === "headquarters"
    ) ?? null;

    return (
        <div className="flex flex-col min-h-[calc(100vh-68px)] gap-4">
            <Card>
                <CardContent>
                    <div className="flex items-center gap-4">
                        <h4 className="scroll-m-20 text-lg font-semibold tracking-tight">
                            Székhely:
                        </h4>
                        <p className="text-muted-foreground text-md">
                            {companyHeadquartersAddress?.address || "N/A"}
                        </p>

                    </div>
                </CardContent>
            </Card>

            <AddressTable addresses={employeeHomeAddresses} columns={columnsDistance} />

        </div>
    )
}

export default GoogleCalculatePage