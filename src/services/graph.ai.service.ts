import { StateSchema, MessagesValue, ReducedValue, StateGraph, START, END } from "@langchain/langgraph";
import { type GraphNode } from "@langchain/langgraph";
import { HumanMessage } from "@langchain/core/messages";
import { Mistral_model, Coheremodel, Google_gemini } from "./model.service.js"
import { z } from "zod";
import { createAgent, providerStrategy } from "langchain";

const State = new StateSchema({
    messages: MessagesValue,

    solution_1: new ReducedValue(z.string().default(""), {
        reducer: (current, next) => next
    }),

    solution_2: new ReducedValue(z.string().default(""), {
        reducer: (current, next) => next
    }),

    judgement: new ReducedValue(
        z.object({
            solution_1_score: z.number().min(0).max(10),
            solution_2_score: z.number().min(0).max(10)
        }).default({
            solution_1_score: 0,
            solution_2_score: 0
        }),
        {
            reducer: (current, next) => next
        }
    )
});


const solutioNode: GraphNode<typeof State> = async (state) => {
    const question = state.messages[0].text;

    const [solution_Mistral, solution_Cohere] = await Promise.all([
        Mistral_model.invoke(question),
        Coheremodel.invoke(question)
    ]);

    console.log("MISTRAL RESPONSE:", solution_Mistral);
    console.log("COHERE RESPONSE:", solution_Cohere);

    return {
        solution_1: solution_Mistral,
        solution_2: solution_Cohere.text
    };
};

const judgemmentnode: GraphNode<typeof State> = async (state) => {

    const { solution_1, solution_2 } = state;

    const judge = createAgent({
        model: Google_gemini,
        tools: [],
        responseFormat: providerStrategy(
            z.object({
                solution_1_score: z.number().min(0).max(10),
                solution_2_score: z.number().min(0).max(10)
            })
        )
    });

    const judgeResponse = await judge.invoke({
        messages: [
            new HumanMessage(
                `You are a judge. Compare two solutions and give a score from 0 to 10 for each solution.First solution:${solution_1}Second solution:${solution_2}`
            )
        ]
    });

    console.log("Gemini response:", judgeResponse);

    const result = judgeResponse.structuredResponse;

    console.log("Structured result:", result);

    return {
        judgement: result
    };
};

const graph = new StateGraph(State)
    .addNode("solution", solutioNode)
    .addNode("judges", judgemmentnode)
    .addEdge(START, "solution")
    .addEdge("solution", "judges")
    .addEdge("judges", END)
    .compile()

export default async function rungraph(usermessage: string) {
    const result = await graph.invoke({
        messages: [
            new HumanMessage(usermessage)
        ]
    })


    console.log(result)

    return result.messages
}