import m from "mithril";

//Компоненты:
//     App: основной контейнер для: или вопросы если кнопка "Start" нажата, или начать тест
//     Questionnaire: логика опроса и вывод подходящего тарифа

//Step(1): Questions and choices
// Типы

type PlanName = string;
type PlanScore = number;

interface Question {
    question: string;
    choices: Choice[];
}

type Choice = {
    option: string;
    //// Define a type for a choice of
// plans, where the keys (PlanName) are strings
// and the values (PlanScore) are Student objects
    plans: Record<PlanName, PlanScore>;
}

interface QuestionnaireState {
    currentIndex: number;
    answers: Choice[];
    plan: string;
    hoverStates: Record<string, boolean>;
    selectedId?: string | null;
    animation: boolean;

    evaluatePlan(answers: Choice[]): string;

}

interface AppState {
    started: boolean;
}

// Вопросы
const questions: Question[] = [
    {
        question: "How do you intend to use this mailbox — for business or personal purposes?",
        choices: [
            {option: "For business purposes", plans: {Essential: 1, Advanced: 1, Unlimited: 1}},
            {option: "For personal use", plans: {Free: 1, Revolutionary: 1, Legend: 1}},
            {option: "I’m not sure yet", plans: {Free: 1}}
        ],
    },
    {
        question: "Would you like to add additional email addresses to this mailbox?",
        choices: [
            {option: "Yes", plans: {Revolutionary: 1, Legend: 1, Essential: 1, Advanced: 1, Unlimited: 1}},
            {option: "No", plans: {Free: 1}}
        ],
    },
    {
        question: "If applicable, how many additional email addresses do you require?",
        choices: [
            {option: "15", plans: {Essential: 1, Revolutionary: 1}},
            {option: "30", plans: {Legend: 1, Unlimited: 1}}
        ],
    },
    {
        question: "Would you like to use your own domain (e.g., yourcompany.com) with this mailbox?",
        choices: [
            {option: "Yes",
            plans: {Revolutionary: 1, Legend: 1, Essential: 1, Advanced: 1, Unlimited: 1}},
            {option: "No", plans: {Free: 1}}
        ],
    },
    {
        question: "If applicable, how many custom domains would you like to configure?",
        choices: [
            {option: "3", plans: {Essential: 1, Revolutionary: 1}},
            {option: "10", plans: {Legend: 1, Advanced: 1}},
            {option: "unlimited", plans: {Unlimited: 1}}
        ],
    },
    {
        question: "How many calendars do you plan to use?",
        choices: [
            {option: "One", plans: {Free: 1}},
            {option: "Unlimited calendars", plans: {Revolutionary: 1, Legend: 1, Essential: 1, Advanced: 1, Unlimited: 1}}
        ],
    },
    {
        question: "What is your estimated email storage requirement?",
        choices: [
            {option: "1 GB", plans: {Free: 1}},
            {option: "20 GB", plans: {Revolutionary: 1}},
            {option: "50 GB", plans: {Essential: 1}},
            {option: "500 GB", plans: {Legend: 1, Advanced: 1}},
            {option: "1000 GB", plans: {Unlimited: 1}}
        ],
    }
];


/*let score = {
    Free: 0,
    Revolutionary: 0,
    Legend: 0,
    Essential: 0,
    Advanced: 0,
    Unlimited: 0
}*/


// Компонент Questionnaire
const Questionnaire: m.Component<{}, QuestionnaireState> = {
    //Зачем нужен oninit: 1. Инициализация состояния компонента, 2. Подготовка переменных, флагов, логики до того, как компонент появится на экране. 3. Сброс или очистка данных при повторной инициализации (например, при переходах)
    oninit(vnode) {
        vnode.state.currentIndex = 0;
        vnode.state.answers = [];
        vnode.state.plan = "";
        vnode.state.hoverStates = {};
        vnode.state.animation = false;

        vnode.state.evaluatePlan = (answers: Choice[]): string => {
            const selectedOptions = answers.map(a => a.option);
            if (
                selectedOptions.includes("For personal use") &&
                selectedOptions.includes("Yes") &&
                selectedOptions.includes("15") &&
                selectedOptions.includes("3") &&
                selectedOptions.includes("Unlimited calendars") &&
                selectedOptions.includes("20 GB")
            ) {
                return "Revolutionary";
            } else if (
                selectedOptions.includes("For personal use") &&
                selectedOptions.includes("Yes") &&
                selectedOptions.includes("30") &&
                selectedOptions.includes("10") &&
                selectedOptions.includes("Unlimited calendars") &&
                selectedOptions.includes("500 GB")
            ) {
                return "Legend";
            } else if (
                selectedOptions.includes("For business purposes") &&
                selectedOptions.includes("Yes") &&
                selectedOptions.includes("15") &&
                selectedOptions.includes("3") &&
                selectedOptions.includes("Unlimited calendars") &&
                selectedOptions.includes("50 GB")
            ) {
                return "Essential";
            } else if (
                selectedOptions.includes("For business purposes") &&
                selectedOptions.includes("Yes") &&
                selectedOptions.includes("30") &&
                selectedOptions.includes("10") &&
                selectedOptions.includes("Unlimited calendars") &&
                selectedOptions.includes("500 GB")
            ) {
                return "Advanced";
            } else if (
                selectedOptions.includes("For business purposes") &&
                selectedOptions.includes("Yes") &&
                selectedOptions.includes("30") &&
                selectedOptions.includes("unlimited") &&
                selectedOptions.includes("Unlimited calendars") &&
                selectedOptions.includes("1000 GB")
            ) {
                return "Unlimited";
            /*} else if (
                selectedOptions.includes("For business purposes") &&
                selectedOptions.includes("Yes") &&
                selectedOptions.includes("30") &&
                selectedOptions.includes("unlimited") &&
                selectedOptions.includes("Unlimited calendars") &&
                selectedOptions.includes("1000 GB")
            ) {
                return "Unlimited";*/
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
                    fontFamily: "sans-serif",
                    boxSizing: "border-box"
                }
            }, [
                m("h2", {
                    style: "max-width: 800px; padding: 10px; margin: 0 auto; text-align: center;"
                }, "Recommended plan is:"),
                m("p", {
                    style: "max-width: 800px; padding: 10px; margin: 0 auto; text-align: center; font-size: 25px;"
                }, state.plan),
                m("button", {
                    style: {
                        width: "200px",
                        fontWeight: "700",
                        color: "#fff",
                        padding: "10px 0",
                        background: "linear-gradient(45deg, #ff1f4f, #d2002d 100%",
                        borderRadius: "100px",
                        margin: "0 auto",
                        cursor: "pointer",
                        fontSize: "17px",
                        textAlign: "center",
                        minWidth: "60px",
                        height: "50px",
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
                fontFamily: "sans-serif",
                opacity: state.animation? "0" : "1",
                transition: "opacity 0.7s ease-in-out"
            }
        }, [
            m("h2", {style: {padding: ".5rem 2.5rem 1.5rem", margin: 0, fontSize: "18px"}}, current.question), m("ul", {
                style: {
                    listStyle: "none",
                    position: "relative",
                    padding: "0"
                }
            }, [
                ...current.choices.map((choice, index) => {
                    const inputId = `choice-${state.currentIndex}-${index}`;
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
                                lineHeight: "1.5",
                                boxSizing: "border-box"
                            }
                        }, [m("input[type=radio]", {
                            id: inputId,
                            name: `choice-${state.currentIndex}`,
                            value: choice,
                            style: {
                                cursor: "pointer",
                                display: "none"
                            },
                            onclick: () => {
                                state.selectedId = inputId;
                                state.animation = true; // старт исчезновения
                                m.redraw();

                                setTimeout(() => {
                                    state.answers.push(choice);
                                    state.currentIndex++;
                                   state.selectedId = null;
                                    state.animation = false; //появление нового вопроса
                                    m.redraw();
                                }, 700) // синхронизировано с transition: 0.5s
                            }
                        }),
                            m("", {
                                    style: {
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "16px"
                                    }
                                },
                                m("span", {
                                        style: {
                                            width: "20px",
                                            height: "20px",
                                            border: "1px solid #bbb",
                                            borderRadius: "50%",
                                            background: state.selectedId === inputId ? "#d93951" : "transparent"
                                        }
                                    },
                                    state.selectedId === inputId ? m("span", {
                                        style: {
                                            color: "white"
                                        }
                                    }, m.trust("<svg xmlns=\"http://www.w3.org/2000/svg\" class=\"ionicon\" viewBox=\"0 0 512 512\"><path fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"32\" d=\"M416 128L192 384l-96-96\"/></svg>")) : ""),
                                m("span",
                                    choice.option))
                        ])
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
            fontFamily: "sans-serif",
            boxSizing: "border-box"
        });
    },
    view(vnode) {
        return m("div", {style: "position: relative; max-width: 800px; margin: 40px auto 0 auto; background: #fff; border-radius: 20px; padding: 20px;"}, [
            vnode.state.started
                ? m(Questionnaire)
                : m("div", {
                    style: "max-width: 800px; padding: 10px; margin: 0 auto; /*text-align: center;*/; display: flex; flex-direction: row; justify-content: center; align-items: center; border-box: 20px;"
                }, [m("div", {
                    style: {
                        display: "flex",
                        justifyContent: "center",
                        flexDirection: "column",
                        maxWidth: "400px",
                    }
                }, [m("p", {style: {fontSize: "18px",}}, "Confused about which plan to choose?"),
                    m("h2", {
                        style: {
                            fontSize: "30px",
                            padding: "5px 0px",
                            margin: "auto",
                        }
                    }, "Take our 1-minute quiz to find your plan."), m("p", "We’ll show you the best match based on your needs and daily activities.")]),
                    m("button", {
                        style: {
                            width: "200px",
                            fontWeight: "700",
                            color: "#fff",
                            padding: "10px 0",
                            background: "linear-gradient(45deg, #ff1f4f, #d2002d 100%",
                            borderRadius: "100px",
                            margin: "0 auto",
                            cursor: "pointer",
                            fontSize: "17px",
                            textAlign: "center",
                            minWidth: "60px",
                            height: "50px"
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

