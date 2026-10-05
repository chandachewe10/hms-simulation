import type { SimulatedDevice } from "../types";
import type { SeededRng } from "../rng";
import type { SimulatedUser } from "../types";

const DEVICE_NAMES = [
  "Clinic Laptop",
  "Ward Tablet",
  "Lab Workstation",
  "Pharmacy PC",
  "Admin Desktop",
  "Field Tablet",
  "BYOD Phone",
];

const LOCATIONS = [
  "Lusaka Urban Clinic",
  "Ndola District Hospital",
  "Rural Outreach Post",
  "Unknown GeoIP",
  "Public Wi-Fi Lusaka",
];

export function generateDevices(
  count: number,
  users: SimulatedUser[],
  rng: SeededRng,
  deviceTrustBaseline: number
): SimulatedDevice[] {
  const devices: SimulatedDevice[] = [];
  for (let i = 0; i < count; i++) {
    const user = users[i % users.length];
    const managed = rng.bool(deviceTrustBaseline);
    devices.push({
      id: `device-${i}`,
      userId: user.id,
      name: `${rng.pick(DEVICE_NAMES)} #${i}`,
      managed,
      postureScore: managed
        ? rng.normal(85, 8)
        : rng.normal(45, 15),
      trustScore: managed
        ? rng.normal(deviceTrustBaseline * 90 + 5, 10)
        : rng.normal(35, 20),
      lastSeenLocation: rng.pick(LOCATIONS.slice(0, 3)),
    });
  }
  return devices;
}

export function deviceForUser(
  devices: SimulatedDevice[],
  userId: string,
  preferManaged: boolean
): SimulatedDevice {
  const owned = devices.filter((d) => d.userId === userId);
  if (owned.length === 0) return devices[0];
  if (preferManaged) {
    const managed = owned.find((d) => d.managed);
    if (managed) return managed;
  }
  const unmanaged = owned.find((d) => !d.managed);
  return unmanaged ?? owned[0];
}
