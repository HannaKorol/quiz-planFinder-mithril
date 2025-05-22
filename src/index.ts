import m from "mithril";

/*m.render(document.body, m("h1", "Hello from Mithril + ESBuild!"))*/

//Компоненты:
//     App: основной контейнер
//     Questionnaire: логика опроса
//     Result: вывод подходящего тарифа

//Step(1): Questions and choices
// Типы
type Choice = string;

interface Question {
    question: string;
    choices: Choice[];
}

interface QuestionnaireState {
    currentIndex: number;
    answers: Choice[];
    plan: string;
    hoverStates: Record<string, boolean>;

    evaluatePlan(answers: Choice[]): string;
}

interface AppState {
    started: boolean;
}

// Вопросы
const questions: Question[] = [
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

// Компонент Questionnaire
const Questionnaire: m.Component<{}, QuestionnaireState> = {
    oninit(vnode) {
        const state = vnode.state;
        state.currentIndex = 0;
        state.answers = [];
        state.plan = "";
        state.hoverStates = {};

        state.evaluatePlan = (answers: Choice[]): string => {
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
//result to show
        if (state.currentIndex >= questions.length) {
            state.plan = state.evaluatePlan(state.answers);
            return m("div", {
                style: {
                    maxWidth: "800px",
                   padding: "10px",
                    margin: "0 auto",
                    textAlign: "center",
                    fontFamily: "sans-serif"
                }
            }, [
                m("h2", {
                    style: "max-width: 800px; padding: 10px; margin: 0 auto; text-align: center;"
                }, "Recommended plan is:"),
                m("p", {
                    style: "max-width: 800px; padding: 10px; margin: 0 auto; text-align: center; font-size: 25px;"
                }, state.plan),
                m("button", {style: {
                width: "200px",
                    fontWeight: "700",
                    color: "#fff",
                    padding: "10px 0",
                    background: "linear-gradient(45deg, #ff1f4f, #d2002d 100%",
                    borderRadius: "5px",
                    margin: "0 auto",
                    cursor: "pointer",
                    fontSize: "17px",
                    textAlign: "center"
            },
                    onclick: () => {
                        state.currentIndex = 0;
                        state.answers = [];
                    }
                }, "Try again"),
            ]);
        }


// Current questions with options
        const current = questions[state.currentIndex];


        return m("div", {
            style: {
                maxWidth: "800px",
                margin: "0 auto",
                fontFamily: "sans-serif"
            }
        }, [
            m("h2", {style: {padding: ".5rem 2.5rem 1.5rem", margin: 0, fontSize: "18px"}}, current.question), m("ul", {
                style: {
                    listStyle: "none",
                    position: "relative",
                    padding:"0"
                }
            }, [
                ...current.choices.map((choice, index) => {
                    const inputId = `choice-${state.currentIndex}-${choice}`;
                    const hoverKey = `${state.currentIndex}-${index}`;
                    const isHovered = state.hoverStates[hoverKey];

                    return m("li", {
                            onmouseover: () => {
                                state.hoverStates[hoverKey] = true;
                                m.redraw();
                            },
                            onmouseout: () => {
                                state.hoverStates[hoverKey] = false;
                                m.redraw();
                            },
                            style: {
                                listStyle: "none",
                                position: "relative",
                                borderTop: "1px solid #eee",
                                backgroundColor: isHovered ? "#ffedea" : "transparent",
                                transition: "background-color 0.2s"
                            }
                        }, m("label", {
                            for: inputId,
                            style: {
                                cursor: "pointer",
                                padding: "1.5rem 2.5rem 1.5rem 5rem",
                                position: "relative",
                                width: "100%",
                                margin: "0",
                                fontSize: "16px",
                                display: "inline-block",
                                verticalAlign: "middle",
                                lineHeight: "1.5"
                            }
                        }, [m("input[type=radio]", {
                            id: inputId,
                            name: `choice-${state.currentIndex}`,
                            value: choice,
                            style: {
                                position: "absolute",
                                opacity: 0,
                                cursor: "pointer"
                            },
                            onclick: () => {
                                state.answers.push(choice);
                                state.currentIndex++;
                            }
                        }),
                            m("span",
                                choice)])
                    )
                })])]);
    },
};

//  Старт или продолжение
const App: m.Component<{}, AppState> = {
    oninit(vnode) {
        vnode.state.started = false;

        //styles to body
        Object.assign(document.body.style, {
            margin: "0",
            padding: "0",
            background: "#eee",
            fontFamily: "sans-serif"
        });
    },


    view(vnode) {
        return m("div", {style: "position: relative; max-width: 800px; margin: 40px auto 0 auto; background: #fff; border-radius: 3px;"}, [
            vnode.state.started
                ? m(Questionnaire)
                : m("div", {
                    style: "max-width: 800px; padding: 10px; margin: 0 auto; text-align: center;"
                }, [
                    m("p", "Having trouble choosing the right plan?"),
                    m("h2", "Take our 1-minute quiz to find your plan."),
                    m("button", {
                        style: {
                            width: "200px",
                            fontWeight: "700",
                            color: "#fff",
                            padding: "10px 0",
                            background: "linear-gradient(45deg, #ff1f4f, #d2002d 100%",
                            borderRadius: "5px",
                            margin: "0 auto",
                            cursor: "pointer",
                            fontSize: "17px",
                            textAlign: "center"
                        },
                        onclick: () => {
                            vnode.state.started = true;
                            m.redraw();
                        }
                    }, "Start Now")
                ])
        ]);
    }
};

// Точка входа
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

