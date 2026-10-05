import { StateSchema, MessagesValue, ReducedValue, StateGraph, START, END } from "@langchain/langgraph";
import { type GraphNode } from "@langchain/langgraph";
import { HumanMessage } from "@langchain/core/messages";
import { Mistral_model, Coheremodel } from "./model.service.js"
import { z } from "zod";

const State = new StateSchema({
    messages: MessagesValue,

    solution_1: new ReducedValue(z.string().default(""), {
        reducer: (current, next) => {
            return next
        }
    }),
    solution_2: new ReducedValue(z.string().default(""), {
        reducer: (current, next) => {
            return next
        }
    }),
    judgement: new ReducedValue(z.string().default({
        "solution_1_score": 0,
        "solution_2_score": 0,
    }), {
        reducer: (current, next) => {
            return next
        }

    }),



})

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

const graph = new StateGraph(State)
    .addNode("solution", solutioNode)
    .addEdge(START, "solution")
    .addEdge("solution", END)
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