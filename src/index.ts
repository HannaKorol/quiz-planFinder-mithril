import m from "mithril";

m.render(document.body, m("h1", "Hello from Mithril + ESBuild!"))

//Компоненты:
//     App: основной контейнер
//     Questionnaire: логика опроса
//     Result: вывод подходящего тарифа

//Step(1): Questions and choices
type Choice = string;

interface Question {
    question: string;
    choices: Choice[];
}

const questions: Question [] = [
    {
        question: "Do you want to use this mailbox for business or for yourself?",
        choices: ["Business", "Personal"],
    },
    {
        question: "Do you need extra email addresses in your mailbox?",
        choices: ["Yes", "No"],
    },
    {
        question: "How many extra email addresses do you need?",
        choices: ["15", "30"],
    },
    {
        question: "Do you need custom domains? If yes, how many?",
        choices: ["3", "10", "unlimited"],
    },
    {
        question: "Do you need one calendar or more?",
        choices: ["One", "More"],
    },
    {
        question: "How much storage space do you need to save your emails?",
        choices: ["1 GB", "20 GB", "50 GB", "500 GB", "1000 GB"],
    }
];

interface QuestionnaireState {
    currentIndex: number;
    answers: Choice [];
    plan: string;

    evaluatePlan(answers: Choice[]): string;
}

const Questionnaire: m.Component<{}, QuestionnaireState> = {
    oninit(vnode) {
        vnode.state.currentIndex = 0;
        vnode.state.answers = [];
        vnode.state.plan = "";

        vnode.state.evaluatePlan = (answers: Choice[]): string => {
            if (
                answers.includes("Personal") &&
                answers.includes("Yes") &&
                answers.includes("15") &&
                answers.includes("3") &&
                answers.includes("More") &&
                answers.includes("20 GB")
            ) {
                return "Revolutionary";
            } else if (
                answers.includes("Personal") &&
                answers.includes("Yes") &&
                answers.includes("30") &&
                answers.includes("10") &&
                answers.includes("More") &&
                answers.includes("500 GB")
            ) {
                return "Legend";
            } else if (
                answers.includes("Business") &&
                answers.includes("Yes") &&
                answers.includes("15") &&
                answers.includes("3") &&
                answers.includes("More") &&
                answers.includes("50 GB")
            ) {
                return "Essential";
            } else if (
                answers.includes("Business") &&
                answers.includes("Yes") &&
                answers.includes("30") &&
                answers.includes("10") &&
                answers.includes("More") &&
                answers.includes("500 GB")
            ) {
                return "Advanced";
            } else if (
                answers.includes("Business") &&
                answers.includes("Yes") &&
                answers.includes("30") &&
                answers.includes("unlimited") &&
                answers.includes("More") &&
                answers.includes("1000 GB")
            ) {
                return "Unlimited";
            } else {
                return "Basic";
            }
        };
    },
    view(vnode) {
        const state = vnode.state;

        if (state.currentIndex >= questions.length) {
            state.plan = state.evaluatePlan(state.answers);
            return m("div", {style: "max-width: 1170px; padding: 10px; margin: 0 auto; border:1px solid black; border-radius: 1em; text-align: center; "},[
                m("h2", "Recommended plan is:"),
                m("p", state.plan),
                m("button", {
                    onclick: () => {
                        state.currentIndex = 0;
                        state.answers = [];
                    }
                }, "Try again"),
            ]);
        }

        const current = questions[state.currentIndex];
        return m("div",{style: "max-width: 1170px; padding: 10px; margin: 0 auto; border:1px solid black; border-radius: 1em; text-align: center; "}, [
            m("h2", current.question),
            ...current.choices.map(choice =>
                m("button", {
                    style: "margin: 5px;",
                    onclick: () => {
                        state.answers.push(choice);
                        state.currentIndex++;
                    }
                }, choice)
            )
        ]);
    }
};

interface AppState {
    started: boolean;
}

const App: m.Component<{}, AppState> = {
    oninit(vnode) {
        vnode.state.started = false;
    },

    view(vnode) {
        return m("div", {style: "padding: 20px; font-family: sans-serif;"}, [
            vnode.state.started
                ? m(Questionnaire)
                : m("div", {style: "max-width: 1170px; padding: 10px; margin: 0 auto; border:1px solid black; border-radius: 1em; text-align: center; "}, [
                    m("h2", "Not sure which plan is right for you?"),
                    m("p", "Take the test to find out which plan you need."),
                    m("button", {
                        style: "display: block; margin: 0 auto;",
                        onclick: () => {
                            vnode.state.started = true;
                            m.redraw();
                        }
                    }, "Start test")
                ])
        ]);
    }
};

m.mount(document.body, App);


/*
const App = {
    step: 0,
    view: function () {
        return App.step == 0 && m("div", {class: "container"}, [
            m("div", {class: "container"}, [
                m("h2", "Not sure which plan is right for you?"),
                m("h1", "Take the test to find out which plan you need."),
                m("button", {
                    id: "test-start-button", onclick: () => {
                        App.step = 1;
                        m.redraw();
                    },
                }, "Start Test")
            ]),
            App.step == 1 && m("div", {class: "container"}, [
                m("p", "Do you want to use this mailbox  for business or for yourself?"),
                m("button", {
                    class: "test-continues", onclick: () => App.step = 2.1
                }, "Next Question")
            ]),
            App.step == 2.1 && m("div", {class: "container"}, [
                m("p", "Do you want to use your mail account for business or for yourself?"),
                m("button", {
                    class: "test-continues", onclick: () => App.step = 2
                }, "Next Question")
            ]),
        ])
    }
}
*/

