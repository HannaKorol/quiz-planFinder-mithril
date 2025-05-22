import m from "mithril";
// Вопросы
const questions = [
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
const Questionnaire = {
    oninit(vnode) {
        const state = vnode.state;
        state.currentIndex = 0;
        state.answers = [];
        state.plan = "";
        state.evaluatePlan = (answers) => {
            if (answers.includes("Personal") &&
                answers.includes("Yes") &&
                answers.includes("15") &&
                answers.includes("3") &&
                answers.includes("More") &&
                answers.includes("20 GB")) {
                return "Revolutionary";
            }
            else if (answers.includes("Personal") &&
                answers.includes("Yes") &&
                answers.includes("30") &&
                answers.includes("10") &&
                answers.includes("More") &&
                answers.includes("500 GB")) {
                return "Legend";
            }
            else if (answers.includes("Business") &&
                answers.includes("Yes") &&
                answers.includes("15") &&
                answers.includes("3") &&
                answers.includes("More") &&
                answers.includes("50 GB")) {
                return "Essential";
            }
            else if (answers.includes("Business") &&
                answers.includes("Yes") &&
                answers.includes("30") &&
                answers.includes("10") &&
                answers.includes("More") &&
                answers.includes("500 GB")) {
                return "Advanced";
            }
            else if (answers.includes("Business") &&
                answers.includes("Yes") &&
                answers.includes("30") &&
                answers.includes("unlimited") &&
                answers.includes("More") &&
                answers.includes("1000 GB")) {
                return "Unlimited";
            }
            else {
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
                    /*border: "1px solid black",
                    borderRadius: "1em",*/
                    textAlign: "center",
                    fontFamily: "sans-serif"
                }
            }, [
                m("h2", {
                    style: "max-width: 800px; padding: 10px; margin: 0 auto; text-align: center;"
                }, "Recommended plan is:"),
                m("p", {
                    style: "max-width: 800px; padding: 10px; margin: 0 auto; text-align: center;"
                }, state.plan),
                m("button", { style: {
                        width: "300px",
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
                /*  padding: "20px",*/
                margin: "0 auto",
                /*border: "1px solid",
                borderRadius: "1em",*/
                fontFamily: "sans-serif"
            }
        }, [
            m("h2", { style: { padding: ".5rem 2.5rem 1.5rem", margin: 0, fontSize: "18px" } }, current.question), m("ul", {
                style: {
                    listStyle: "none",
                    position: "relative",
                    /* marginBottom: "20px",*/
                    /* borderTop: "1px solid #eee",
                     transition: "background-color 0.2s"*/
                }
            }, [
                ...current.choices.map(choice => {
                    const inputId = `choice-${state.currentIndex}-${choice}`;
                    const liState = { hover: false };
                    return m("li", {
                        onmouseover: () => {
                            liState.hover = true;
                            m.redraw();
                        },
                        onmouseout: () => {
                            liState.hover = false;
                        },
                        style: {
                            listStyle: "none",
                            position: "relative",
                            /* marginBottom: "20px",*/
                            borderTop: "1px solid #eee",
                            backgroundColor: liState.hover ? "red" : "transparent",
                            transition: "background-color 0.2s"
                        }
                    }, m("label", {
                        for: inputId,
                        style: {
                            /*display: "flex",
                            alignItems: "center",*/
                            cursor: "pointer",
                            /*paddingLeft: "35px",*/
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
                        m("span", choice)]));
                })
            ])
        ]);
    },
};
//  Старт или продолжение
const App = {
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
        return m("div", { style: "position: relative; max-width: 800px; margin: 40px auto 0 auto; background: #fff; border-radius: 3px;" }, [
            vnode.state.started
                ? m(Questionnaire)
                : m("div", {
                    style: "max-width: 800px; padding: 10px; margin: 0 auto; text-align: center;"
                }, [
                    m("h2", "Not sure which plan is right for you?"),
                    m("p", "Take the test to find out which plan you need."),
                    m("button", {
                        style: {
                            width: "300px",
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
                    }, "Start test")
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
