import { AdCanvas } from "@elitosear/marketing/features/ads/image/ad-canvas";
import { defineImageAd } from "@elitosear/marketing/features/ads/image/image-ad-definition";
import "../../../styles.css";
import { copySchema, type Copy } from "./design/copy-schema.ts";

function Design(props: { copy: Copy }) {
  return (
    <AdCanvas className="flex flex-col justify-end gap-8 bg-white p-20">
      <h1 className="text-[120px] leading-none font-bold">
        {props.copy.headline}
      </h1>
      <p className="text-[44px] leading-snug">{props.copy.body}</p>
      <p className="text-[44px] font-bold">{props.copy.call_to_action}</p>
    </AdCanvas>
  );
}

export default defineImageAd({ copySchema, Design });
