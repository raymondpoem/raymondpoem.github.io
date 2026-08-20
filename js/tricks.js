const TRICKS_FILE = "./data/tricks.json";


/*
 * Load trick database
 */

export async function loadTrickDatabase() {

    const response =
        await fetch(TRICKS_FILE);


    if (!response.ok) {
        throw new Error(
            `Could not load tricks.json: ${response.status}`
        );
    }


    const data =
        await response.json();


    if (
        !data ||
        !Array.isArray(data.tricks)
    ) {
        throw new Error(
            "Invalid tricks.json format."
        );
    }


    return data.tricks;
}


/*
 * Render trick list
 */

export function renderTrickList(
    tricks,
    save,
    getTrickProgress
) {

    const list =
        document.querySelector(
            "#trick-list"
        );


    const search =
        document.querySelector(
            "#trick-search"
        );


    const searchText =
        search
            ? search.value.trim().toLowerCase()
            : "";


    list.innerHTML = "";


    const filtered =
        tricks.filter(trick => {

            if (!searchText) {
                return true;
            }


            return (
                trick.name
                    .toLowerCase()
                    .includes(searchText) ||

                trick.description
                    ?.toLowerCase()
                    .includes(searchText) ||

                trick.grips
                    ?.some(
                        grip =>
                            grip
                                .toLowerCase()
                                .includes(searchText)
                    )
            );
        });


    if (filtered.length === 0) {

        const empty =
            document.createElement(
                "p"
            );

        empty.textContent =
            "No tricks found.";

        list.appendChild(
            empty
        );

        return;
    }


    filtered.forEach(
        trick => {

            const progress =
                getTrickProgress(
                    save,
                    trick.id
                );


            const item =
                document.createElement(
                    "details"
                );

            item.className =
                "trick-item";


            item.dataset.trickId =
                trick.id;


            /*
             * Summary
             */

            const summary =
                document.createElement(
                    "summary"
                );


            const checkbox =
                document.createElement(
                    "input"
                );


            checkbox.type =
                "checkbox";


            checkbox.className =
                "trick-checkbox";


            checkbox.dataset.trickId =
                trick.id;


            checkbox.checked =
                progress.landed >= progress.goal;


            /*
             * Prevent clicking the checkbox
             * from opening/closing the dropdown.
             */

            checkbox.addEventListener(
                "click",
                event => {
                    event.stopPropagation();
                }
            );


            summary.appendChild(
                checkbox
            );


            const name =
                document.createElement(
                    "span"
                );

            name.className =
                "trick-name";

            name.textContent =
                trick.name;


            summary.appendChild(
                name
            );


            /*
             * Grip
             */

            if (
                trick.grips &&
                trick.grips.length
            ) {

                const grip =
                    document.createElement(
                        "span"
                    );

                grip.className =
                    "trick-grip";

                grip.textContent =
                    trick.grips
                        .map(formatGrip)
                        .join(", ");


                summary.appendChild(
                    grip
                );
            }


            /*
             * Progress summary
             */

            const summaryProgress =
                document.createElement(
                    "span"
                );

            summaryProgress.className =
                "trick-summary-progress";


            summaryProgress.textContent =
                `${progress.landed} / ${progress.goal}`;


            summary.appendChild(
                summaryProgress
            );


            item.appendChild(
                summary
            );


            /*
             * Trick content
             */

            const content =
                document.createElement(
                    "div"
                );

            content.className =
                "trick-content";


            /*
             * Description
             */

            if (trick.description) {

                const description =
                    document.createElement(
                        "p"
                    );

                description.className =
                    "trick-description";

                description.textContent =
                    trick.description;


                content.appendChild(
                    description
                );
            }


            /*
             * Goal
             */

            content.appendChild(
                createNumberField(
                    "Goal",
                    "trick-goal",
                    progress.goal,
                    1
                )
            );


            /*
             * Landed
             */

            content.appendChild(
                createNumberField(
                    "Landed",
                    "trick-landed",
                    progress.landed,
                    0
                )
            );


            /*
             * Attempts
             */

            content.appendChild(
                createNumberField(
                    "Attempts",
                    "trick-attempts",
                    progress.attempts,
                    0
                )
            );


            /*
             * Consistency
             */

            const consistency =
                calculateConsistency(
                    progress
                );


            const consistencyElement =
                document.createElement(
                    "p"
                );

            consistencyElement.className =
                "trick-consistency";


            consistencyElement.textContent =
                `Consistency: ${formatPercent(consistency)}`;


            content.appendChild(
                consistencyElement
            );


            /*
             * Test button
             */

            const testButton =
                document.createElement(
                    "button"
                );

            testButton.type =
                "button";

            testButton.className =
                "test-trick";

            testButton.dataset.trickId =
                trick.id;

            testButton.textContent =
                "Test";


            content.appendChild(
                testButton
            );


            /*
             * Demonstration
             */

            if (trick.demonstration) {

                const demonstration =
                    document.createElement(
                        "a"
                    );

                demonstration.href =
                    trick.demonstration;

                demonstration.target =
                    "_blank";

                demonstration.rel =
                    "noopener noreferrer";

                demonstration.className =
                    "trick-demo";

                demonstration.textContent =
                    "Demonstration";


                content.appendChild(
                    demonstration
                );
            }


            item.appendChild(
                content
            );


            list.appendChild(
                item
            );
        }
    );
}


/*
 * Number input
 */

function createNumberField(
    label,
    className,
    value,
    minimum
) {

    const wrapper =
        document.createElement(
            "label"
        );

    wrapper.className =
        "trick-field";


    const text =
        document.createElement(
            "span"
        );

    text.textContent =
        label;


    const input =
        document.createElement(
            "input"
        );

    input.type =
        "number";

    input.className =
        className;

    input.min =
        minimum;

    input.step =
        "1";

    input.value =
        value;


    wrapper.appendChild(
        text
    );

    wrapper.appendChild(
        input
    );


    return wrapper;
}


/*
 * Calculate overall consistency
 */

function calculateConsistency(
    progress
) {

    if (
        !progress.attempts ||
        progress.attempts <= 0
    ) {
        return 0;
    }


    return (
        progress.landed /
        progress.attempts
    ) * 100;
}


/*
 * Format percentage
 */

function formatPercent(
    value
) {

    return `${value.toFixed(2)}%`;
}


/*
 * Format grip names
 *
 * "ken-grip" -> "Ken Grip"
 */

function formatGrip(
    grip
) {

    return grip
        .replace(/[-_]/g, " ")
        .replace(
            /\b\w/g,
            char => char.toUpperCase()
        );
}
