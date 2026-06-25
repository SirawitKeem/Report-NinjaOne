import { fetchFromNinja } from './ninjaClient';

export async function getAlertsData() {
  try {
 
    const rawAlerts = await fetchFromNinja("/api/v2/alerts");


    const transformedAlerts = rawAlerts.map((alert) => {
      return {
        "ALERT UID": alert.uid,
        "DEVICE ID": alert.deviceId,
      };
    });

    return transformedAlerts;
  } catch (error) {
    console.error("Alerts Fetch Error:", error);
    throw error;
  }
}