let tricks = [];
let save = null;
let saveProgress = null;

let combo = null;
let currentStep = 0;
let testActive = false;


export function initComboTest(
    trickDatabase,
    currentSave,
    saveFunction
) {
    tricks = trickDatabase;
    save = currentSave;
    saveProgress = saveFunction;
}


export function startComboTest(comboId) {

    if (!save.combos) {
        save.combos = {};
    }

    const selected =
        save.combos[comboId];

    if (!selected) {
        console.error(
            "Combo not found:",
            comboId
        );

        return;
    }

    combo =
        structuredClone(selected);

    currentStep = 0;
    testActive = true;

    showTestingPage();
    renderTest();
}


function showTestingPage() {

    document
        .querySelectorAll("[data-page]")
        .forEach(section => {

            section.hidden =
                section.dataset.page !==
                "testing";

        });
}


function renderTest() {

    const area =
        document.querySelector(
            "#test-area"
        );

    if (!area) {

        console.error(
            "Could not find #test-area"
        );

        return;
    }

    area.innerHTML = "";


    /*
     * Title
     */

    const title =
        document.createElement("h2");

    title.textContent =
        `Practice: ${combo.name}`;

    area.appendChild(title);


    /*
     * Calculate total steps
     */

    const totalSteps =
        combo.steps.reduce(
            (total, step) =>
                total + step.repetitions,
            0
        );


    /*
     * Finished
     */

    if (
        currentStep >= totalSteps
    ) {

        finishSuccess();

        return;
    }


    /*
     * Find actual trick at this step
     */

    const step =
        getExpandedStep(
            currentStep
        );


    if (!step) {

        console.error(
            "Could not find combo step"
        );

        return;
    }


    const trick =
        tricks.find(
            item =>
                item.id ===
                step.trickId
        );


    if (!trick) {

        area.textContent =
            `Trick "${step.trickId}" was not found.`;

        console.error(
            "Missing trick:",
            step.trickId
        );

        return;
    }


    /*
     * Step counter
     */

    const progress =
        document.createElement("p");

    progress.textContent =
        `Step ${currentStep + 1} / ${totalSteps}`;

    area.appendChild(progress);


    /*
     * Trick name
     */

    const name =
        document.createElement("h3");

    name.textContent =
        trick.name;

    area.appendChild(name);


    /*
     * Grip
     */

    if (
        trick.grips &&
        trick.grips.length
    ) {

        const grip =
            document.createElement("p");

        grip.textContent =
            trick.grips
                .map(formatGrip)
                .join(", ");

        area.appendChild(grip);
    }


    /*
     * Description
     */

    if (trick.description) {

        const description =
            document.createElement("p");

        description.textContent =
            trick.description;

        area.appendChild(
            description
        );
    }


    /*
     * Buttons
     */

    const buttons =
        document.createElement("div");


    const landed =
        document.createElement("button");

    landed.type =
        "button";

    landed.textContent =
        "Landed";


    landed.addEventListener(
        "click",
        handleLanded
    );


    const missed =
        document.createElement("button");

    missed.type =
        "button";

    missed.textContent =
        "Missed";


    missed.addEventListener(
        "click",
        handleMissed
    );


    buttons.appendChild(
        landed
    );

    buttons.appendChild(
        missed
    );

    area.appendChild(
        buttons
    );


    /*
     * Combo overview
     */

    renderOverview(
        area
    );
}


function getExpandedStep(
    targetIndex
) {

    let index = 0;


    for (
        const step of combo.steps
    ) {

        for (
            let i = 0;
            i < step.repetitions;
            i++
        ) {

            if (
                index ===
                targetIndex
            ) {
                return step;
            }

            index++;
        }
    }


    return null;
}


function renderOverview(
    area
) {

    const heading =
        document.createElement("h3");

    heading.textContent =
        "Combo";

    area.appendChild(
        heading
    );


    const list =
        document.createElement("ol");


    let index = 0;


    for (
        const step of combo.steps
    ) {

        const trick =
            tricks.find(
                item =>
                    item.id ===
                    step.trickId
            );


        if (!trick) {
            continue;
        }


        for (
            let i = 0;
            i < step.repetitions;
            i++
        ) {

            const item =
                document.createElement("li");


            if (
                index < currentStep
            ) {

                item.textContent =
                    `✓ ${trick.name}`;

            } else if (
                index === currentStep
            ) {

                item.textContent =
                    `→ ${trick.name}`;

            } else {

                item.textContent =
                    trick.name;
            }


            list.appendChild(
                item
            );

            index++;
        }
    }


    area.appendChild(
        list
    );
}


function handleLanded() {

    if (!testActive) {
        return;
    }


    currentStep++;

    renderTest();
}


function handleMissed() {

    if (!testActive) {
        return;
    }


    finishFailure();
}


function finishSuccess() {

    testActive = false;

    combo.attempts =
        Number(combo.attempts || 0) + 1;

    combo.landed =
        Number(combo.landed || 0) + 1;

    combo.lastAttempt =
        new Date().toISOString();


    save.combos[
        combo.id
    ] = combo;


    saveProgress(save);

    renderResult(true);
}


function finishFailure() {

    testActive = false;

    combo.attempts =
        Number(combo.attempts || 0) + 1;

    combo.lastAttempt =
        new Date().toISOString();


    save.combos[
        combo.id
    ] = combo;


    saveProgress(save);

    renderResult(false);
}


function renderResult(success) {

    const area =
        document.querySelector(
            "#test-area"
        );


    area.innerHTML = "";


    const title =
        document.createElement("h2");

    title.textContent =
        success
            ? "Combo Complete"
            : "Combo Failed";


    area.appendChild(title);


    const result =
        document.createElement("p");

    result.textContent =
        success
            ? `${combo.name} landed.`
            : `${combo.name} was missed.`;


    area.appendChild(result);


    const consistency =
        combo.attempts > 0
            ? (
                combo.landed /
                combo.attempts
            ) * 100
            : 0;


    const stats =
        document.createElement("p");

    stats.textContent =
        `Consistency: ${consistency.toFixed(2)}%`;


    area.appendChild(stats);


    const retry =
        document.createElement("button");

    retry.type =
        "button";

    retry.textContent =
        "Practice Again";


    retry.addEventListener(
        "click",
        () => {

            startComboTest(
                combo.id
            );

        }
    );


    area.appendChild(retry);


    const back =
        document.createElement("button");

    back.type =
        "button";

    back.textContent =
        "Back to Combos";


    back.addEventListener(
        "click",
        stopTest
    );


    area.appendChild(back);
}


function stopTest() {

    testActive = false;
    combo = null;


    document
        .querySelectorAll("[data-page]")
        .forEach(section => {

            section.hidden =
                section.dataset.page !==
                "combos";

        });
}


function formatGrip(
    grip
) {

    return grip
        .replace(
            /[-_]/g,
            " "
        )
        .replace(
            /\b\w/g,
            char =>
                char.toUpperCase()
        );
}
