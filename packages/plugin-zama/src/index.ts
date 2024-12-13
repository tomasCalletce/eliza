import { Plugin } from "@ai16z/eliza";
import { mintAction } from "./actions/mint.ts";
import { timeProvider } from "./providers/time.ts";

export * as actions from "./actions";
export * as evaluators from "./evaluators";
export * as providers from "./providers";

export const zamaPlugin: Plugin = {
    name: "zama",
    description:
        "Zama plugin for encrypted AI using FHE (Fully Homomorphic Encryption) solutions for blockchain and AI",
    actions: [mintAction],
    providers: [timeProvider],
};
