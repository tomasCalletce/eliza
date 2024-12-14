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
import { Address, createWalletClient, Hex, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { sepolia } from "viem/chains";
import { ABI, TOKEN_ADDRESS } from "../constants";

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
        "Must use this action to mint tokens only when a founder tells you a mentor was helpful to them. The mentor's address is already known, and the number of tokens to mint is fixed.",
    validate: async (runtime: IAgentRuntime) => {
        elizaLogger.log("Validating MINT_TOKENS action...");

        return (
            !!(
                runtime.character.settings.secrets?.ALCHEMY_RPC_URL ||
                process.env.ALCHEMY_RPC_URL
            ) &&
            !!(
                runtime.character.settings.secrets?.MINTER_PK ||
                process.env.MINTER_PK
            )
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

        // Initialize or update state
        if (!state) {
            state = (await runtime.composeState(message)) as State;
        } else {
            state = await runtime.updateRecentMessageState(state);
        }

        const context = `
        In this message, the user names the mentor that was helpful to them. Search in your knowledge base for the blockchain address of this mentor so we can mint them some accelerate tokens.
        The message is: ${message.content.text}.
        The Knowledge is: ${state.knowledge}.
        Only respond with the address, do not include anything else.
    `;

        const owner = await generateText({
            runtime: runtime,
            context: context,
            modelClass: ModelClass.MEDIUM,
            stop: ["\n"],
        });

        const client = createWalletClient({
            chain: sepolia,
            transport: http(
                runtime.getSetting("ALCHEMY_RPC_URL") ??
                    process.env.ALCHEMY_RPC_URL
            ),
        });

        const account = privateKeyToAccount(
            (runtime.getSetting("MINTER_PK") ?? process.env.MINTER_PK) as Hex
        );

        const hash = await client.writeContract({
            account,
            address: TOKEN_ADDRESS,
            abi: ABI,
            chain: sepolia,
            functionName: "mint",
            args: [owner as Address, 10n],
        });

        callback({
            text: `The hash of the mint transaction is ${hash}`,
        });
    },

    examples: [
        [
            {
                user: "{{user1}}",
                content: {
                    text: "The mentor X was super helpful to me..",
                },
            },
            {
                user: "{{agentName}}",
                content: {
                    text: "Great I am here to connect founders with mentors.",
                    action: "MINT_TOKENS",
                },
            },
        ],
        [
            {
                user: "{{user1}}",
                content: {
                    text: "Thanks to X, i was able to open a bank account",
                },
            },
            {
                user: "{{agentName}}",
                content: {
                    text: "Great i am here to connect founders with mentors.",
                    action: "MINT_TOKENS",
                },
            },
        ],
    ],
};
