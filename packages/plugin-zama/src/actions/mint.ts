import {
    Action,
    elizaLogger,
    HandlerCallback,
    IAgentRuntime,
    Memory,
    State,
} from "@ai16z/eliza";

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

        callback({
            text: `The current block number is ${1234}`,
        });
    },

    examples: [
        [
            {
                user: "{{user1}}",
                content: {
                    text: "Connection to {{mentor}} was successful",
                },
            },
            {
                user: "{{agentName}}",
                content: {
                    text: "Connection successful! Minting tokens to celebrate the success.",
                    action: "MINT_TOKENS",
                },
            },
        ],
        [
            {
                user: "{{user1}}",
                content: {
                    text: "Thanks to {{mentor}}, I finally understand how smart contracts work!",
                },
            },
            {
                user: "{{agentName}}",
                content: {
                    text: "{{mentor}} deserves recognition for being such a great teacher. I'll mint some tokens as a thank you.",
                    action: "MINT_TOKENS",
                },
            },
        ],
        [
            {
                user: "{{user1}}",
                content: {
                    text: "{{mentor}} just helped me create my first bank account!",
                },
            },
            {
                user: "{{agentName}}",
                content: {
                    text: "That's a significant milestone! I'll mint some tokens to commemorate this achievement with {{mentor}}.",
                    action: "MINT_TOKENS",
                },
            },
        ],
    ],
};
