// =========================================
// CAMPUS SAATHI - WELLBEING
// =========================================

document.addEventListener("DOMContentLoaded", () => {

    /* =========================
       CURRENT USER
    ========================== */

    const userId = localStorage.getItem("userId");

    // Har logged-in user ka apna separate data
    const wellbeingStorageKey = userId
        ? `wellbeing_${userId}`
        : "wellbeing_guest";


    let wellbeingData =
        JSON.parse(
            localStorage.getItem(wellbeingStorageKey)
        ) || {
            silentMode: false,
            mood: null
        };


    const saveWellbeingData = () => {

        localStorage.setItem(
            wellbeingStorageKey,
            JSON.stringify(wellbeingData)
        );

    };


    /* =========================
       SILENT STUDY MODE
    ========================== */

    const silentToggle =
        document.getElementById("silentToggle");

    const silentStatus =
        document.getElementById("silentStatus");


    let silentMode =
        wellbeingData.silentMode;


    // Saved Silent Mode restore karo
    if (silentMode) {

        document.body.classList.add("silent-active");

        silentStatus.classList.add("on");

        silentStatus.innerHTML =
            "<span></span> Silent mode is on";

        silentToggle.textContent =
            "Turn off Silent Mode";

    } else {

        silentStatus.innerHTML =
            "<span></span> Mode is off";

        silentToggle.textContent =
            "Turn on Silent Mode";

    }


    silentToggle.addEventListener("click", () => {

        silentMode = !silentMode;

        // Current user ka Silent Mode save karo
        wellbeingData.silentMode = silentMode;

        saveWellbeingData();


        if (silentMode) {

            document.body.classList.add("silent-active");

            silentStatus.classList.add("on");

            silentStatus.innerHTML =
                "<span></span> Silent mode is on";

            silentToggle.textContent =
                "Turn off Silent Mode";

        } else {

            document.body.classList.remove("silent-active");

            silentStatus.classList.remove("on");

            silentStatus.innerHTML =
                "<span></span> Mode is off";

            silentToggle.textContent =
                "Turn on Silent Mode";

        }

    });


    /* =========================
       BREATHING RESET
    ========================== */

    const resetBtn =
        document.getElementById("resetBtn");

    const breathingCircle =
        document.getElementById("breathingCircle");

    const breathingText =
        document.getElementById("breathingText");


    let breathingRunning = false;


    resetBtn.addEventListener("click", () => {

        if (breathingRunning) {
            return;
        }


        breathingRunning = true;

        let seconds = 60;


        resetBtn.textContent =
            "Reset in progress...";


        const cycle = () => {

            if (seconds <= 0) {

                breathingText.textContent =
                    "Done";

                breathingCircle.classList.remove(
                    "breathe-in",
                    "breathe-out"
                );

                resetBtn.textContent =
                    "Start 60-second reset";

                breathingRunning = false;

                return;

            }


            const phase =
                seconds % 8;


            if (phase >= 4) {

                breathingText.textContent =
                    "Breathe in";

                breathingCircle.classList.add(
                    "breathe-in"
                );

                breathingCircle.classList.remove(
                    "breathe-out"
                );

            } else {

                breathingText.textContent =
                    "Breathe out";

                breathingCircle.classList.add(
                    "breathe-out"
                );

                breathingCircle.classList.remove(
                    "breathe-in"
                );

            }


            seconds--;

            setTimeout(cycle, 1000);

        };


        cycle();

    });


    /* =========================
       MOOD CHECK-IN
    ========================== */

    const moodOptions =
        document.querySelectorAll(".mood-option");

    const checkinResult =
        document.getElementById("checkinResult");


    /* =========================
       DIFFERENT MESSAGE
       FOR EACH MOOD
    ========================== */

    const moodMessages = {

        Great:
            "That's wonderful! 🌟 Keep that positive energy going today.",

        Good:
            "That's nice to hear! 😊 Keep going and take care of yourself.",

        Okay:
            "It's okay to have an ordinary day. 🌱 Take things one step at a time.",

        Low:
            "It's okay to feel low. 💙 Be gentle with yourself and take a little break.",

        Stressed:
            "Take a deep breath. 🫶 You don't have to solve everything at once."

    };


    /* =========================
       RESTORE SAVED MOOD
    ========================== */

    if (wellbeingData.mood) {

        moodOptions.forEach(option => {

            if (
                option.dataset.mood ===
                wellbeingData.mood
            ) {

                option.classList.add("selected");

            }

        });


        checkinResult.textContent =
            moodMessages[wellbeingData.mood] ||
            "Thank you for checking in. Be kind to yourself today.";

    }


    /* =========================
       MOOD SELECTION
    ========================== */

    moodOptions.forEach(option => {

        option.addEventListener("click", () => {

            // Pehle sab moods unselect
            moodOptions.forEach(item => {

                item.classList.remove("selected");

            });


            // Selected mood highlight
            option.classList.add("selected");


            const mood =
                option.dataset.mood;


            // Current user's mood save karo
            wellbeingData.mood = mood;

            saveWellbeingData();


            // Mood ke according different message
            checkinResult.textContent =
                moodMessages[mood] ||
                "Thank you for checking in. Be kind to yourself today.";

        });

    });


    /* =========================
       SUPPORT MODAL
    ========================== */

    const supportBtn =
        document.getElementById("supportBtn");

    const supportModal =
        document.getElementById("supportModal");

    const closeSupport =
        document.getElementById("closeSupport");

    const supportForm =
        document.getElementById("supportForm");


    supportBtn.addEventListener("click", () => {

        supportModal.classList.add("show");

    });


    closeSupport.addEventListener("click", () => {

        supportModal.classList.remove("show");

    });


    supportModal.addEventListener("click", event => {

        if (event.target === supportModal) {

            supportModal.classList.remove("show");

        }

    });


    supportForm.addEventListener("submit", event => {

        event.preventDefault();


        alert(
            "Your message has been shared anonymously in this V1 prototype."
        );


        supportForm.reset();

        supportModal.classList.remove("show");

    });

});
