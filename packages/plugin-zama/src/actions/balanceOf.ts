import {
    Action,
    elizaLogger,
    HandlerCallback,
    IAgentRuntime,
    Memory,
    State,
} from "@ai16z/eliza";
import { createPublicClient, http } from "viem";
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
    validate: async (runtime: IAgentRuntime) => {
        elizaLogger.log("Validating BALANCE_OF action...");

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
            text: "Checking token balance...",
        });

        const chainClient = createPublicClient({
            batch: {
                multicall: true,
            },
            chain: sepolia,
            transport: http(
                runtime.getSetting("ALCHEMY_RPC_URL") ??
                    process.env.ALCHEMY_RPC_URL
            ),
        });

        const data = await chainClient.readContract({
            address: TOKEN_ADDRESS,
            abi: ABI,
            functionName: "balanceOf",
            args: ["0x43FCE65E31720C686Abb0B62d89b4547AAb2304a"],
        });

        callback({
            text: `Your current token balance is ${data.toString()} tokens`,
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
