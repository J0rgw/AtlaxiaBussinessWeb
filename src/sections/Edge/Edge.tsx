import { EdgeShowcase } from "@/components/storytelling/EdgeShowcase";
import type { Dictionary } from "@/content";
import { withBasePath } from "@/lib/paths";

const asset = (name: string) => withBasePath(`/media/edge/${name}`);

/** The owner's photo of the unit, cut out; its alpha also masks the headline. */
export const edgeDevice = {
  src: asset("minipc-1x.webp"),
  srcSet: `${asset("minipc-1x.webp")} 1x, ${asset("minipc-2x.webp")} 2x`,
  avifSrcSet: `${asset("minipc-1x.avif")} 1x, ${asset("minipc-2x.avif")} 2x`,
  width: 560,
  height: 500,
};

type EdgeProps = {
  content: Dictionary["edge"];
};

/**
 * Right after the hero: where the software runs. Continues the hero's sheet,
 * not a section of the index, so it stays out of the navigation.
 */
export function Edge({ content }: EdgeProps) {
  return (
    <EdgeShowcase
      id="edge"
      titleId="edge-title"
      lines={content.lines}
      split={content.split}
      lede={content.lede}
      image={{ ...edgeDevice, alt: content.alt }}
    />
  );
}
