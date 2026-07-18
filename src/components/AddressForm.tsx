import { XIcon } from "lucide-react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect } from "react";

// Fix for default marker icons in React Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

function MapEvents({ setForm }: { setForm: any }) {
    useMapEvents({
        click(e) {
            setForm((prev: any) => ({ ...prev, lat: e.latlng.lat, lng: e.latlng.lng }));
        },
    });
    return null;
}

function MapUpdater({ center }: { center: [number, number] }) {
    const map = useMap();
    useEffect(() => {
        map.setView(center, map.getZoom());
    }, [center, map]);
    return null;
}

const AddressForm = ({ resetForm, handleSubmit, form, setForm, editingId }: any) => {
    return (
        <>
            {/* overlay  */}
            <div className="fixed inset-0 bg-black/40 z-50" />

            {/* form container  */}
            <div onClick={resetForm} className="fixed inset-0 z-50 overflow-y-auto flex justify-center items-start pt-10 pb-10 px-4 sm:items-center sm:pt-4 sm:pb-4">
                <form onClick={(e) => e.stopPropagation()} onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 w-full max-w-lg animate-fade-in my-auto shadow-2xl">
                    {/* form header  */}
                    <div className="flex items-center justify-between mb-5">
                        <h2 className="text-lg font-semibold text-app-green">{editingId ? "Edit Address" : "Add New Address"}</h2>
                        <button type="button" onClick={resetForm} className="p-2 hover:bg-app-cream rounded-lg">
                            <XIcon className="size-5" />
                        </button>
                    </div>

                    {/* form input fields  */}
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-app-green mb-1.5">Label</label>
                            <input type="text" placeholder="Home, Work, etc." required className="w-full px-4 py-2.5 text-sm rounded-xl border border-app-border focus:border-app-green outline-none" value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-app-green mb-1.5">Street Address</label>
                            <input type="text" required className="w-full px-4 py-2.5 text-sm rounded-xl border border-app-border focus:border-app-green outline-none" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-sm font-medium text-app-green mb-1.5">City</label>
                                <input type="text" required className="w-full px-4 py-2.5 text-sm rounded-xl border border-app-border focus:border-app-green outline-none" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-app-green mb-1.5">State</label>
                                <input type="text" required className="w-full px-4 py-2.5 text-sm rounded-xl border border-app-border focus:border-app-green outline-none" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-sm font-medium text-app-green mb-1.5">ZIP Code</label>
                                <input type="text" required className="w-full px-4 py-2.5 text-sm rounded-xl border border-app-border focus:border-app-green outline-none" value={form.zip} onChange={(e) => setForm({ ...form, zip: e.target.value })} />
                            </div>
                            <div className="flex items-end pb-1">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" checked={form.isDefault} onChange={(e) => setForm({ ...form, isDefault: e.target.checked })} />
                                    <span className="text-sm text-app-text">Set as default</span>
                                </label>
                            </div>
                        </div>

                        {/* Map  */}
                        <div className="mt-4">
                            <label className="block text-sm font-medium text-app-green mb-1.5">Pin Location on Map</label>
                            <div className="h-[200px] rounded-xl overflow-hidden border border-app-border">
                                <MapContainer center={[form.lat || 51.505, form.lng || -0.09]} zoom={13} style={{ height: "100%", width: "100%", zIndex: 0 }}>
                                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' />
                                    <Marker position={[form.lat || 51.505, form.lng || -0.09]} />
                                    <MapEvents setForm={setForm} />
                                    <MapUpdater center={[form.lat || 51.505, form.lng || -0.09]} />
                                </MapContainer>
                            </div>
                            <p className="text-xs text-zinc-500 mt-1">Click on the map to place your delivery pin accurately.</p>
                        </div>
                    </div>

                    {/* submit button  */}
                    <button type="submit" className="mt-6 w-full py-3 bg-app-green text-white font-semibold rounded-xl hover:bg-app-green-light transition-colors">
                        {editingId ? "Update Address" : "Save Address"}
                    </button>
                </form>
            </div>
        </>
    );
};

export default AddressForm;
