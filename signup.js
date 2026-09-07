// =========================================
// CAMPUS SAATHI - SIGNUP
// =========================================

const SUPABASE_URL = "https://sjnejzsvmedbjqpmoyhw.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_ANNCaMJFW9vxfFzpEzClxA_QUk-Q-8h";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);


document.addEventListener("DOMContentLoaded", () => {

    const signupForm =
        document.getElementById("signupForm");

    const signupMessage =
        document.getElementById("signupMessage");


    if (!signupForm) return;


    signupForm.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();


            const name =
                document.getElementById("name")
                    .value
                    .trim();


            const email =
                document.getElementById("email")
                    .value
                    .trim();


            const password =
                document.getElementById("password")
                    .value;


            const confirmPassword =
                document.getElementById(
                    "confirmPassword"
                ).value;


            /* =========================
               PASSWORD CHECK
            ========================== */

            if (password !== confirmPassword) {

                signupMessage.textContent =
                    "Passwords do not match.";

                signupMessage.style.color =
                    "#dc2626";

                return;

            }


            signupMessage.textContent =
                "Creating your account...";

            signupMessage.style.color =
                "#6c63ff";


            try {

                /* =========================
                   CREATE SUPABASE ACCOUNT
                ========================== */

                const { data, error } =
                    await supabaseClient.auth.signUp({

                        email: email,

                        password: password,

                        options: {

                            data: {
                                full_name: name
                            }

                        }

                    });


                if (error) {

                    throw error;

                }


                /* =========================
                   GET NEW USER
                ========================== */

                const user =
                    data.user;


                /* =========================
                   SAVE USER INFORMATION
                ========================== */

                // Save user's name
                localStorage.setItem(
                    "userName",
                    name
                );


                // Save UNIQUE Supabase User ID
                // Har user ki ID different hoti hai
                if (user?.id) {

                    localStorage.setItem(
                        "userId",
                        user.id
                    );

                }


                // Save user's email
                if (user?.email) {

                    localStorage.setItem(
                        "userEmail",
                        user.email
                    );

                }


                /* =========================
                   SUCCESS MESSAGE
                ========================== */

                signupMessage.textContent =
                    "Account created successfully!";

                signupMessage.style.color =
                    "#16a34a";


                signupForm.reset();


                /* =========================
                   EMAIL CONFIRMATION
                ========================== */

                if (
                    data.user &&
                    !data.session
                ) {

                    signupMessage.textContent =
                        "Account created! Please check your email to confirm your account.";

                } else {

                    /* =========================
                       OPEN DASHBOARD
                    ========================== */

                    setTimeout(() => {

                        window.location.href =
                            "dashboard.html";

                    }, 1200);

                }

            } catch (error) {

                console.error(error);


                signupMessage.textContent =
                    error.message ||
                    "Something went wrong.";

                signupMessage.style.color =
                    "#dc2626";

            }

        }
    );

});
