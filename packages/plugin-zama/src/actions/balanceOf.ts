import {
    Action,
    Content,
    elizaLogger,
    generateText,
    HandlerCallback,
    IAgentRuntime,
    Memory,
    ModelClass,
    State,
} from "@ai16z/eliza";
import { Address, createPublicClient, http } from "viem";
import { sepolia } from "viem/chains";
import { ABI, TOKEN_ADDRESS } from "../constants";

export const balanceOfAction: Action = {
    name: "BALANCE_OF",
    similes: [
        "CHECK_BALANCE",
        "GET_BALANCE",
        "VIEW_BALANCE",
        "CHECK_TOKENS",
        "GET_TOKEN_BALANCE",
        "VIEW_TOKEN_BALANCE",
        "SHOW_BALANCE",
    ],
    description:
        "Checks the balance of tokens on the blockchain using FHE (Fully Homomorphic Encryption)",
    validate: async (runtime: IAgentRuntime, message: Memory) => {
        elizaLogger.log("Validating BALANCE_OF action...");

        const text = (message.content as Content).text;
        const addressRegex = /0x[a-fA-F0-9]{40}/g;
        const hasAddress = addressRegex.test(text);

        const hasRpcUrl = !!(
            runtime.character.settings.secrets?.ALCHEMY_RPC_URL ||
            process.env.ALCHEMY_RPC_URL
        );

        return hasAddress && hasRpcUrl;
    },
    handler: async (
        runtime: IAgentRuntime,
        message: Memory,
        state: State,
        options?: {
            [key: string]: unknown;
        },
        callback?: HandlerCallback
    ) => {
        callback({
            text: "Checking token balance...",
        });

        const chainClient = createPublicClient({
            chain: sepolia,
            transport: http(
                runtime.getSetting("ALCHEMY_RPC_URL") ??
                    process.env.ALCHEMY_RPC_URL
            ),
        });

        const context = `
            Extract from the message the blockchain address.
            The message is ${message.content.text}.
            Only respond with the address, do not include anything else.
        `;

        const addresses = await generateText({
            runtime: runtime,
            context,
            modelClass: ModelClass.SMALL,
            stop: ["\n"],
        });

        const data = await chainClient.readContract({
            address: TOKEN_ADDRESS,
            abi: ABI,
            functionName: "balanceOf",
            args: [addresses as Address],
        });

        callback({
            text: `Your current token balance is ${data.toString()} tokens for address ${addresses}`,
        });
    },
    examples: [
        [
            {
                user: "{{user1}}",
                content: {
                    text: "Check the balance of {{address}} on Sepolia network",
                },
            },
            {
                user: "{{agentName}}",
                content: {
                    text: "I will check the token balance for that address",
                    action: "BALANCE_OF",
                },
            },
        ],
    ],
};
