import {
    Action,
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
    similes: ["CHECK_BALANCE", "GET_BALANCE"],
    description: "Must use this action to see the balances of the mentors.",
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
        state: State,
        options?: {
            [key: string]: unknown;
        },
        callback?: HandlerCallback
    ) => {
        callback({
            text: "Checking token balance...",
        });

        // Initialize or update state
        if (!state) {
            state = (await runtime.composeState(message)) as State;
        } else {
            state = await runtime.updateRecentMessageState(state);
        }

        const chainClient = createPublicClient({
            chain: sepolia,
            transport: http(
                runtime.getSetting("ALCHEMY_RPC_URL") ??
                    process.env.ALCHEMY_RPC_URL
            ),
        });
        const context = `
            In your knowledge base, you have a list of mentors, their attributes, and most importantly, their blockchain addresses. Search for the address of the mentor named in the message.
            The Message is: ${state.message}.
            The Knowledge is: ${state.knowledge}.
            Only respond with the address, do not include anything else.
        `;

        const owner = await generateText({
            runtime: runtime,
            context: context,
            modelClass: ModelClass.MEDIUM,
            stop: ["\n"],
        });

        const data = await chainClient.readContract({
            address: TOKEN_ADDRESS,
            abi: ABI,
            functionName: "exposedBalance",
            args: [owner as Address],
        });

        callback({
            text: `His address is ${owner} and the exposed balance is ${data.toString()} tokens`,
        });
    },
    examples: [
        [
            {
                user: "{{user1}}",
                content: {
                    text: "What is the balance of mentor Emma Wilson's",
                },
            },
            {
                user: "{{agentName}}",
                content: {
                    text: "Let me check",
                    action: "BALANCE_OF",
                },
            },
        ],
    ],
};
