// =========================================
// CAMPUS SAATHI - SIGNUP
// =========================================

const SUPABASE_URL = "YOUR_SUPABASE_URL";
const SUPABASE_ANON_KEY = "YOUR_SUPABASE_ANON_KEY";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);


document.addEventListener("DOMContentLoaded", () => {

    const signupForm = document.getElementById("signupForm");
    const signupMessage = document.getElementById("signupMessage");

    signupForm.addEventListener("submit", async (event) => {

        event.preventDefault();

        const name =
            document.getElementById("name").value.trim();

        const email =
            document.getElementById("email").value.trim();

        const password =
            document.getElementById("password").value;

        const confirmPassword =
            document.getElementById("confirmPassword").value;


        // Password check
        if (password !== confirmPassword) {

            signupMessage.textContent =
                "Passwords do not match.";

            signupMessage.style.color = "#dc2626";

            return;
        }


        signupMessage.textContent =
            "Creating your account...";

        signupMessage.style.color = "#6c63ff";


        try {

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


            signupMessage.textContent =
                "Account created successfully!";

            signupMessage.style.color = "#16a34a";


            signupForm.reset();


            // If email confirmation is enabled
            if (data.user && !data.session) {

                signupMessage.textContent =
                    "Account created! Please check your email to confirm your account.";

            } else {

                setTimeout(() => {

                    window.location.href =
                        "dashboard.html";

                }, 1200);

            }


        } catch (error) {

            console.error(error);

            signupMessage.textContent =
                error.message || "Something went wrong.";

            signupMessage.style.color = "#dc2626";

        }

    });

});