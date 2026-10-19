/**
 * What does not change with the language for each founder: the initials drawn
 * when there is no portrait, the portrait and the profile link. A missing
 * field shows nothing. Portraits live in public/media/team/ as
 * `<photo>-1x|2x.avif|webp`, 4:5 (480 × 600 and 960 × 1200).
 */
export type MemberId = "ceo" | "cto" | "cmo";

export type MemberMedia = {
  initials: string;
  /** File stem of the portrait in public/media/team/. */
  photo?: string;
  linkedin?: string;
};

export const memberOrder: readonly MemberId[] = ["ceo", "cto", "cmo"];

// Portraits and profiles sent by David on 2026-10-19. His own portrait was mirrored
// (left to right) at his request when the files were made.
export const teamMedia: Record<MemberId, MemberMedia> = {
  ceo: {
    initials: "JN",
    photo: "juan-miguel-navarro-ruiz",
    linkedin: "https://www.linkedin.com/in/juanminavarro/",
  },
  cto: {
    initials: "DP",
    photo: "david-palazon-palau",
    linkedin: "https://www.linkedin.com/in/david-palazon-palau/",
  },
  cmo: {
    initials: "JA",
    photo: "jorge-arcas-verdejo",
    linkedin: "https://www.linkedin.com/in/jorge-arcas-verdejo-18ba29255/",
  },
};
