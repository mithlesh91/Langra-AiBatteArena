import { StateSchema, MessagesValue, StateGraph, START, END } from "@langchain/langgraph";

type judgment = {
    winner: "solution1" | "solution2",
    solution_1: number,
    solution_2: number,
}

type judgmentState = {
    messages: typeof MessagesValue,
    solution_1: string,
    solution_2: string,
    judgment: judgment

}

const state = {
    messages: MessagesValue,
    solution_1: "", solution_2: "",
    judgment: {
        winner: "solution1",
        solution_1: 0,
        solution_2: 0,
    }
}