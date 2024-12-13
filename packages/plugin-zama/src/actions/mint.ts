import {
    Action,
    elizaLogger,
    HandlerCallback,
    IAgentRuntime,
    Memory,
    State,
} from "@ai16z/eliza";
import { createPublicClient, http } from "viem";
import { polygon } from "viem/chains";

export const mintAction: Action = {
    name: "MINT_TOKENS",
    similes: [
        "CREATE_TOKENS",
        "GENERATE_TOKENS",
        "ISSUE_TOKENS",
        "MINT_ERC20",
        "CREATE_ERC20",
        "DEPLOY_ERC20",
        "ISSUE_ERC20",
    ],
    description:
        "Mints new tokens on the blockchain using FHE (Fully Homomorphic Encryption)",
    validate: async (runtime: IAgentRuntime) => {
        elizaLogger.log("Validating MINT_TOKENS action...");

        return !!(
            runtime.character.settings.secrets?.ALCHEMY_RPC_URL ||
            process.env.ALCHEMY_RPC_URL
        );
    },
    handler: async (
        runtime: IAgentRuntime,
        message: Memory,
        state?: State,
        options?: {
            [key: string]: unknown;
        },
        callback?: HandlerCallback
    ) => {
        callback({
            text: "Currently minting tokens...",
        });

        const chainClient = createPublicClient({
            chain: polygon,
            transport: http(
                runtime.getSetting("ALCHEMY_RPC_URL") ??
                    process.env.ALCHEMY_RPC_URL
            ),
        });

        const blockNumber = await chainClient.getBlockNumber();

        callback({
            text: `The current block number is ${blockNumber}`,
        });
    },

    examples: [
        [
            {
                user: "{{user1}}",
                content: {
                    text: "Mint {{x}} tokens on Sepolia network",
                },
            },
            {
                user: "{{agentName}}",
                content: {
                    text: "I will executing the mint",
                    action: "MINT_TOKENS",
                },
            },
        ],
    ],
};
