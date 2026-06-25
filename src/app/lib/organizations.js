import { fetchFromNinja } from './ninjaClient';


export async function getOrganizationsData() {
  try {
    const rawOrganizations = await fetchFromNinja("/api/v2/organizations");

    const transformedOrganizations = rawOrganizations.map((org) => {
      return {
        "ORGANIZATION NAME": org.name,
        "ORGANIZATION ID": org.id,
      };
    });

    return transformedOrganizations;

  } catch (error) {
    console.error("NinjaRMM Organizations API Error:", error);
    throw error;
  }
}