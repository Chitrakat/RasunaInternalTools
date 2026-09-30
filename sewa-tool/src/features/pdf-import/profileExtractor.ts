export type ProfileFields = {
  hca: string;
  participant: string;
  supervisor: string;
};

export type ProfileExtractionResult =
  | { success: true; fields: ProfileFields }
  | { success: false; errors: string[] };

const NAME_PATTERN = "[A-Z][A-Za-z'-]+(?:\\s[A-Z][A-Za-z'-]+)+";

const extractHcaName = (text: string): string | null => {
  const match = text.match(new RegExp(`(${NAME_PATTERN})\\s*\\(\\S+\\)\\s*DOH:`));
  return match ? match[1].trim() : null;
};

// Team Members entries look like "Binay Khadgi (3) SUPERVISOR UNASSIGNED" once page text is flattened.
const extractTeamMembers = (text: string): Array<{ name: string; roles: string }> => {
  const sectionStart = text.indexOf("Team Members");
  if (sectionStart === -1) return [];

  const sectionEnd = text.indexOf("Historian", sectionStart);
  const section = text.slice(sectionStart, sectionEnd === -1 ? undefined : sectionEnd);

  const memberPattern = new RegExp(`(${NAME_PATTERN})\\s*\\(\\S+\\)\\s*((?:[A-Z]{2,}\\s*)+)`, "g");
  const members: Array<{ name: string; roles: string }> = [];

  for (const match of section.matchAll(memberPattern)) {
    members.push({ name: match[1].trim(), roles: match[2].trim() });
  }

  return members;
};

export const extractProfileFields = (pageOneText: string): ProfileExtractionResult => {
  const errors: string[] = [];

  const hca = extractHcaName(pageOneText);
  if (!hca) errors.push("Could not find the caregiver (HCA) name near 'DOH:' on the profile page.");

  const members = extractTeamMembers(pageOneText);
  const supervisor = members.find((member) => member.roles.includes("SUPERVISOR"))?.name ?? null;
  const participant = members.find((member) => member.roles.includes("FHCA"))?.name ?? null;

  if (!supervisor) errors.push("Could not find a Team Member tagged SUPERVISOR on the profile page.");
  if (!participant) errors.push("Could not find a Team Member tagged FHCA (participant) on the profile page.");

  if (!hca || !supervisor || !participant) {
    return { success: false, errors };
  }

  return { success: true, fields: { hca, participant, supervisor } };
};
